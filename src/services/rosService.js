import ROSLIB from 'roslib';

const PROTOCOL_PROFILES = {
  ros2: {
    label: 'ROS 2 (Nav2)',
    cmdVelType: 'geometry_msgs/msg/Twist',
    goalTopic: '/goal_pose',
    goalType: 'geometry_msgs/msg/PoseStamped',
    cancelGoalTopic: '/navigate_to_pose/_action/cancel_goal',
    initialPoseTopic: '/initialpose',
    initialPoseType: 'geometry_msgs/msg/PoseWithCovarianceStamped',
    mapTopic: '/map',
    mapType: 'nav_msgs/msg/OccupancyGrid',
    costmapTopic: '/global_costmap/costmap',
    scanTopic: '/scan',
    scanType: 'sensor_msgs/msg/LaserScan',
    poseTopic: '/amcl_pose',
    poseType: 'geometry_msgs/msg/PoseWithCovarianceStamped',
    odomTopic: '/odom',
    odomType: 'nav_msgs/msg/Odometry',
    pathTopic: '/plan',
    pathType: 'nav_msgs/msg/Path',
    batteryTopic: '/battery_state',
    batteryType: 'sensor_msgs/msg/BatteryState'
  },
  ros1: {
    label: 'ROS 1 (move_base)',
    cmdVelType: 'geometry_msgs/Twist',
    goalTopic: '/move_base_simple/goal',
    goalType: 'geometry_msgs/PoseStamped',
    cancelGoalTopic: '/move_base/cancel',
    initialPoseTopic: '/initialpose',
    initialPoseType: 'geometry_msgs/PoseWithCovarianceStamped',
    mapTopic: '/map',
    mapType: 'nav_msgs/OccupancyGrid',
    costmapTopic: '/move_base/global_costmap/costmap',
    scanTopic: '/scan',
    scanType: 'sensor_msgs/LaserScan',
    poseTopic: '/amcl_pose',
    poseType: 'geometry_msgs/PoseWithCovarianceStamped',
    odomTopic: '/odom',
    odomType: 'nav_msgs/Odometry',
    pathTopic: '/move_base/NavfnROS/plan',
    pathType: 'nav_msgs/Path',
    batteryTopic: '/battery_state',
    batteryType: 'sensor_msgs/BatteryState'
  }
};

const SAVED_MAPS_STORAGE_KEY = 'bot-saved-maps';
const RECONNECT_DELAYS_MS = [2500, 4500, 8000, 12000];

function loadPersistedMaps() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_MAPS_STORAGE_KEY));
    return Array.isArray(parsed) ? parsed.filter((m) => typeof m === 'string' && m.trim()) : [];
  } catch {
    return [];
  }
}

function persistMaps(maps) {
  try {
    localStorage.setItem(SAVED_MAPS_STORAGE_KEY, JSON.stringify(maps));
  } catch {}
}

function quaternionToYaw(q = { x: 0, y: 0, z: 0, w: 1 }) {
  const sinyCosp = 2 * (q.w * q.z + q.x * q.y);
  const cosyCosp = 1 - 2 * (q.y * q.y + q.z * q.z);
  return Math.atan2(sinyCosp, cosyCosp);
}

function yawToQuaternion(theta = 0) {
  return {
    x: 0,
    y: 0,
    z: Math.sin(theta / 2),
    w: Math.cos(theta / 2)
  };
}

function computePathLength(points = [], robotPose = null) {
  if (!points || points.length === 0) return 0;
  let total = 0;
  if (robotPose) {
    total += Math.hypot(points[0].x - robotPose.x, points[0].y - robotPose.y);
  }
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return total;
}

async function probeGatewayBase(preferredBase = '') {
  const clean = (preferredBase || '').trim().replace(/\/$/, '');
  const candidates = [];
  if (clean) {
    candidates.push(clean);
  } else {
    candidates.push('');
    if (typeof window !== 'undefined' && window.location?.hostname) {
      candidates.push(`${window.location.protocol}//${window.location.hostname}:8081`);
    }
  }

  for (const base of [...new Set(candidates)]) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2200);
    try {
      const res = await fetch(`${base}/api/bot/health`, {
        cache: 'no-store',
        signal: controller.signal
      });
      const json = await res.json().catch(() => null);
      if (json?.ok && json?.gateway === 'w152d-direct') {
        return { ok: true, base, health: json };
      }
    } catch {
      // try next candidate
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, base: clean, health: null };
}

class ROSService {
  constructor() {
    this.ros = null;
    this.eventSource = null;
    this.gatewayBase = '';
    this.activeTopics = [];
    this.cmdVelTopic = null;
    this.goalTopic = null;
    this.cancelGoalTopic = null;
    this.initialPoseTopic = null;
    this.mappingCmdTopic = null;

    this.status = 'disconnected'; // 'connected' | 'connecting' | 'disconnected'
    this.listeners = new Set();
    this.logSeq = 0;
    this.lastAmclStampMs = 0;

    this.connectionMode = 'w152d'; // 'w152d' | 'rosbridge'
    this.currentUrl = '';
    this.shouldReconnect = false;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.connectionTimer = null;

    const savedMaps = loadPersistedMaps();

    this.telemetry = {
      connectionMode: 'w152d', // 'w152d' | 'rosbridge'
      gatewayOnline: false,
      gatewayBase: '',
      driverMode: 'mavlink_serial', // 'mavlink_serial' | 'local_ros2'
      serialConnected: false,
      ros2Connected: false,
      serialPort: '/dev/ttyUSB0',
      serialBaud: 921600,
      serialDeviceExists: false,
      rosAvailable: false,
      managedNodes: {},

      rosProtocol: 'auto',
      detectedProtocol: 'ros2',
      activeTopicSummary: PROTOCOL_PROFILES.ros2,
      reconnectAttempts: 0,
      linearVel: { x: 0, y: 0, z: 0 },
      angularVel: { x: 0, y: 0, z: 0 },
      robotPose: { x: 0, y: 0, theta: 0 },
      poseSource: 'none',
      mapData: null,
      costmapData: null,
      scanData: [],
      pathData: [],
      targetPose: null,
      multiPointNav: false,
      loopWaypoints: false,
      waypoints: [],
      activeWaypointIndex: -1,
      remainingDistance: 0,
      estimatedTime: 0,
      mappingRunning: false,
      navigationRunning: false,
      selectedMap: savedMaps[0] || '',
      availableMaps: savedMaps,
      battery: null,
      logs: []
    };

    this.addLog('info', '中控服务已就绪 (默认启用 W152D 上位机直连模式，免 agent / 免 9090 端口)');
  }

  addLog(level, message, detail) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const createdAt = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const entry = {
      seq: ++this.logSeq,
      level,
      message,
      detail,
      created_at: createdAt
    };
    const nextLogs = [...this.telemetry.logs, entry];
    this.telemetry.logs = nextLogs.length > 200 ? nextLogs.slice(-200) : nextLogs;
  }

  clearLogs() {
    this.telemetry.logs = [];
    this.addLog('info', '日志缓冲区已清空');
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((fn) => fn({ ...this.telemetry, status: this.status }));
  }

  clearTimers() {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  cleanupConnections() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.activeTopics.forEach((t) => {
      try {
        t.unsubscribe();
      } catch {}
    });
    this.activeTopics = [];
    this.cmdVelTopic = null;
    this.goalTopic = null;
    this.cancelGoalTopic = null;
    this.initialPoseTopic = null;
    this.mappingCmdTopic = null;
    if (this.ros) {
      const prev = this.ros;
      this.ros = null;
      try {
        prev.close();
      } catch {}
    }
  }

  // ==================== W152D Direct Gateway Mode (/api/bot) ====================
  syncW152DHardwareStatus(meta = {}) {
    if (meta.driverMode) this.telemetry.driverMode = meta.driverMode;
    if (typeof meta.serialConnected === 'boolean') {
      this.telemetry.serialConnected = meta.serialConnected;
    }
    if (typeof meta.ros2Connected === 'boolean') {
      this.telemetry.ros2Connected = meta.ros2Connected;
    }
    if (meta.serialPort) this.telemetry.serialPort = meta.serialPort;
    if (meta.serialBaud) this.telemetry.serialBaud = meta.serialBaud;
    if (typeof meta.serialDeviceExists === 'boolean') {
      this.telemetry.serialDeviceExists = meta.serialDeviceExists;
    }
    if (typeof meta.rosAvailable === 'boolean') {
      this.telemetry.rosAvailable = meta.rosAvailable;
    }
    if (meta.managedNodes) {
      this.telemetry.managedNodes = meta.managedNodes;
      this.telemetry.mappingRunning = Boolean(meta.managedNodes.slam?.running);
      if (meta.managedNodes.nav2?.running) {
        this.telemetry.navigationRunning = true;
      }
    }

    const hwReady =
      this.telemetry.driverMode === 'mavlink_serial'
        ? this.telemetry.serialConnected
        : this.telemetry.ros2Connected;

    this.status = hwReady ? 'connected' : 'connecting';
  }

  async connectW152DGateway(gatewayUrl = '', { silentAttempt = false } = {}) {
    if (typeof EventSource === 'undefined') {
      this.status = 'disconnected';
      this.telemetry.gatewayOnline = false;
      this.scheduleAutoReconnect();
      this.notify();
      return;
    }

    this.status = 'connecting';
    if (!silentAttempt) {
      this.addLog('info', `正在连接 W152D 上位机直连网关 (${gatewayUrl || '同源 /api/bot'})`);
    }
    this.notify();

    const probe = await probeGatewayBase(gatewayUrl);
    if (!this.shouldReconnect || this.connectionMode !== 'w152d') return;

    if (!probe.ok) {
      this.status = 'disconnected';
      this.telemetry.gatewayOnline = false;
      this.scheduleAutoReconnect();
      this.notify();
      return;
    }

    this.gatewayBase = probe.base;
    this.telemetry.gatewayBase = probe.base;
    this.telemetry.gatewayOnline = true;
    this.reconnectAttempts = 0;
    this.telemetry.reconnectAttempts = 0;
    this.syncW152DHardwareStatus(probe.health);

    const es = new EventSource(`${probe.base}/api/bot/events`);
    this.eventSource = es;

    es.addEventListener('snapshot', (ev) => {
      try {
        const snap = JSON.parse(ev.data);
        this.telemetry.gatewayOnline = true;
        this.syncW152DHardwareStatus(snap);
        if (snap.robotPose) this.telemetry.robotPose = snap.robotPose;
        if (snap.poseSource) this.telemetry.poseSource = snap.poseSource;
        if (snap.scanData) this.telemetry.scanData = snap.scanData;
        if (snap.pathData) this.telemetry.pathData = snap.pathData;
        if (snap.mapData) this.telemetry.mapData = snap.mapData;
        if (snap.costmapData) this.telemetry.costmapData = snap.costmapData;
        if (snap.battery) this.telemetry.battery = snap.battery;
        this.addLog(
          'info',
          `已接入 W152D 直连网关 (当前引擎: ${
            this.telemetry.driverMode === 'mavlink_serial'
              ? `USB 串口 ${this.telemetry.serialPort} @ ${this.telemetry.serialBaud}`
              : '本机 ROS 2 直通'
          })`
        );
        this.notify();
      } catch {}
    });

    es.addEventListener('status', (ev) => {
      try {
        const data = JSON.parse(ev.data);
        this.syncW152DHardwareStatus(data);
        this.notify();
      } catch {}
    });

    es.addEventListener('pose', (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.pose) this.telemetry.robotPose = data.pose;
        if (data.source) this.telemetry.poseSource = data.source;
        if (Array.isArray(data.trail) && this.telemetry.driverMode === 'mavlink_serial') {
          this.telemetry.pathData = data.trail;
        }
        this.updateNavigationProgress();
        this.notify();
      } catch {}
    });

    es.addEventListener('scan', (ev) => {
      try {
        this.telemetry.scanData = JSON.parse(ev.data);
        this.notify();
      } catch {}
    });

    es.addEventListener('map', (ev) => {
      try {
        this.telemetry.mapData = JSON.parse(ev.data);
        this.notify();
      } catch {}
    });

    es.addEventListener('costmap', (ev) => {
      try {
        this.telemetry.costmapData = JSON.parse(ev.data);
        this.notify();
      } catch {}
    });

    es.addEventListener('path', (ev) => {
      try {
        const pts = JSON.parse(ev.data);
        this.telemetry.pathData = pts;
        const arcDist = computePathLength(pts, this.telemetry.robotPose);
        if (arcDist > 0) {
          this.telemetry.remainingDistance = arcDist;
          this.telemetry.estimatedTime = arcDist / 0.3;
        }
        this.notify();
      } catch {}
    });

    es.addEventListener('battery', (ev) => {
      try {
        this.telemetry.battery = JSON.parse(ev.data);
        this.notify();
      } catch {}
    });

    es.addEventListener('log', (ev) => {
      try {
        const data = JSON.parse(ev.data);
        this.addLog(data.level || 'info', data.message || '');
        this.notify();
      } catch {}
    });

    es.onerror = () => {
      if (this.eventSource !== es) return;
      es.close();
      this.eventSource = null;
      this.telemetry.gatewayOnline = false;
      this.status = 'disconnected';
      this.addLog('warn', 'W152D 网关事件流连接中断，正在自动重连...');
      this.scheduleAutoReconnect();
      this.notify();
    };
  }

  async postGatewayCmd(payload) {
    if (this.connectionMode !== 'w152d' || !this.telemetry.gatewayOnline) {
      return { ok: false, error: 'gateway_offline' };
    }
    try {
      const res = await fetch(`${this.gatewayBase}/api/bot/cmd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      return { ok: false, error: err?.message || 'network_error' };
    }
  }

  async setW152DDriverMode(driverMode) {
    const res = await this.postGatewayCmd({ action: 'set_driver', driverMode });
    if (res?.ok) {
      this.addLog(
        'info',
        driverMode === 'mavlink_serial'
          ? `已切换至 W152D 原生 USB 串口直连模式 (${this.telemetry.serialPort})`
          : '已切换至 W152D 本机 ROS 2 直通模式 (已释放串口锁)'
      );
      this.notify();
    }
    return res;
  }

  async updateW152DSerialConfig(port, baudrate) {
    const res = await this.postGatewayCmd({ action: 'serial_config', port, baudrate });
    if (res?.ok) {
      this.addLog('info', `已更新 W152D 串口参数: ${res.serialPort} @ ${res.serialBaud}`);
      this.notify();
    }
    return res;
  }

  async controlW152DNode(nodeId, op = 'start') {
    const res = await this.postGatewayCmd({ action: 'node_action', nodeId, op });
    if (res?.ok) {
      this.addLog('info', `机载节点 [${nodeId}] 执行 ${op === 'stop' ? '停止' : '启动'} 成功`);
    } else if (res?.error) {
      this.addLog('error', `机载节点 [${nodeId}] 操作失败: ${res.error}`);
    }
    this.notify();
    return res;
  }

  async clearOdomTrail() {
    this.telemetry.pathData = [];
    if (this.connectionMode === 'w152d') {
      await this.postGatewayCmd({ action: 'clear_trail' });
    }
    this.notify();
  }

  getW152DCameraStreamUrl() {
    return `${this.gatewayBase}/api/bot/camera.mjpeg`;
  }

  // ==================== Connection Entry & Auto-Reconnect ====================
  connect(
    url = '',
    {
      connectionMode = 'w152d',
      timeoutMs = 5000,
      rosProtocol,
      autoReconnect = true,
      silentAttempt = false
    } = {}
  ) {
    this.connectionMode = connectionMode === 'rosbridge' ? 'rosbridge' : 'w152d';
    this.telemetry.connectionMode = this.connectionMode;
    this.currentUrl = url;
    this.shouldReconnect = autoReconnect;
    if (rosProtocol) {
      this.telemetry.rosProtocol = rosProtocol;
    }

    this.clearTimers();
    this.cleanupConnections();
    this.lastAmclStampMs = 0;

    if (this.connectionMode === 'w152d') {
      this.connectW152DGateway(url, { silentAttempt });
      return;
    }

    // Fallback Legacy Mode: External Rosbridge WebSocket (ws://...:9090)
    const wsUrl = url || 'ws://192.168.2.88:9090';
    this.status = 'connecting';
    this.telemetry.gatewayOnline = false;
    if (!silentAttempt) {
      this.addLog('info', `正在连接外部 Rosbridge: ${wsUrl}`, {
        protocol: this.telemetry.rosProtocol
      });
    }
    this.notify();

    try {
      const ros = new ROSLIB.Ros({ url: wsUrl });
      this.ros = ros;

      const handleFailure = () => {
        if (this.ros !== ros) return;
        this.clearTimers();
        this.cleanupConnections();
        this.status = 'disconnected';
        this.telemetry.poseSource = 'none';
        this.scheduleAutoReconnect();
        this.notify();
      };

      this.connectionTimer = setTimeout(handleFailure, timeoutMs);

      ros.on('connection', () => {
        if (this.ros !== ros) return;
        this.clearTimers();
        this.reconnectAttempts = 0;
        this.telemetry.reconnectAttempts = 0;
        this.status = 'connected';

        const pref = this.telemetry.rosProtocol || 'auto';
        if (pref !== 'auto') {
          const { protocol, profile } = this.resolveProfileFromGraph(pref);
          this.bindRosTopics(ros, protocol, profile);
          this.addLog('info', `已连接 Rosbridge (${profile.label})`);
          this.notify();
          return;
        }

        let resolved = false;
        const timer = setTimeout(() => {
          if (resolved || this.ros !== ros) return;
          resolved = true;
          const { protocol, profile } = this.resolveProfileFromGraph('ros2');
          this.bindRosTopics(ros, protocol, profile);
          this.notify();
        }, 1200);

        ros.getTopics(
          (result) => {
            if (resolved || this.ros !== ros) return;
            resolved = true;
            clearTimeout(timer);
            const { protocol, profile } = this.resolveProfileFromGraph(
              'auto',
              result?.topics || [],
              result?.types || []
            );
            this.bindRosTopics(ros, protocol, profile);
            this.addLog('info', `已连接 Rosbridge，自动匹配 ${profile.label}`);
            this.notify();
          },
          () => {
            if (resolved || this.ros !== ros) return;
            resolved = true;
            clearTimeout(timer);
            const { protocol, profile } = this.resolveProfileFromGraph('ros2');
            this.bindRosTopics(ros, protocol, profile);
            this.notify();
          }
        );
      });

      ros.on('error', handleFailure);
      ros.on('close', handleFailure);
    } catch (e) {
      this.status = 'disconnected';
      this.addLog('error', `Rosbridge 连接异常: ${e?.message || '未知错误'}`);
      this.scheduleAutoReconnect();
      this.notify();
    }
  }

  scheduleAutoReconnect() {
    if (!this.shouldReconnect || this.reconnectTimer) return;
    const delayMs =
      RECONNECT_DELAYS_MS[Math.min(this.reconnectAttempts, RECONNECT_DELAYS_MS.length - 1)];
    this.reconnectAttempts += 1;
    this.telemetry.reconnectAttempts = this.reconnectAttempts;

    if (this.reconnectAttempts <= 3) {
      this.addLog('warn', `通信未就绪，将在 ${delayMs / 1000}s 后自动重试 (第 ${this.reconnectAttempts} 次)`);
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.shouldReconnect && this.status === 'disconnected') {
        this.connect(this.currentUrl, {
          connectionMode: this.connectionMode,
          rosProtocol: this.telemetry.rosProtocol,
          autoReconnect: true,
          silentAttempt: this.reconnectAttempts > 2
        });
      }
    }, delayMs);
  }

  reconnect() {
    this.reconnectAttempts = 0;
    this.telemetry.reconnectAttempts = 0;
    this.connect(this.currentUrl, {
      connectionMode: this.connectionMode,
      rosProtocol: this.telemetry.rosProtocol,
      autoReconnect: true
    });
  }

  disconnect() {
    this.shouldReconnect = false;
    this.clearTimers();
    this.cleanupConnections();
    this.telemetry.gatewayOnline = false;
    this.status = 'disconnected';
    this.notify();
  }

  resolveProfileFromGraph(preference, topics = [], types = []) {
    if (preference === 'ros1') return { protocol: 'ros1', profile: { ...PROTOCOL_PROFILES.ros1 } };
    if (preference === 'ros2') return { protocol: 'ros2', profile: { ...PROTOCOL_PROFILES.ros2 } };

    const isRos2Graph =
      types.some((t) => typeof t === 'string' && t.includes('/msg/')) ||
      topics.includes('/goal_pose') ||
      topics.includes('/plan');
    const isRos1Graph =
      types.some((t) => typeof t === 'string' && t.includes('/') && !t.includes('/msg/')) ||
      topics.includes('/move_base_simple/goal');

    const protocol = isRos2Graph || !isRos1Graph ? 'ros2' : 'ros1';
    const base = { ...PROTOCOL_PROFILES[protocol] };

    if (topics.includes('/goal_pose')) base.goalTopic = '/goal_pose';
    else if (topics.includes('/move_base_simple/goal')) base.goalTopic = '/move_base_simple/goal';

    if (topics.includes('/plan')) base.pathTopic = '/plan';
    else if (topics.includes('/received_global_plan')) base.pathTopic = '/received_global_plan';
    else if (topics.includes('/move_base/NavfnROS/plan')) base.pathTopic = '/move_base/NavfnROS/plan';

    if (topics.includes('/global_costmap/costmap')) base.costmapTopic = '/global_costmap/costmap';
    else if (topics.includes('/move_base/global_costmap/costmap')) {
      base.costmapTopic = '/move_base/global_costmap/costmap';
    }

    return { protocol, profile: base };
  }

  bindRosTopics(ros, protocol, profile) {
    this.telemetry.detectedProtocol = protocol;
    this.telemetry.activeTopicSummary = profile;

    this.cmdVelTopic = new ROSLIB.Topic({ ros, name: '/cmd_vel', messageType: profile.cmdVelType });
    this.goalTopic = new ROSLIB.Topic({ ros, name: profile.goalTopic, messageType: profile.goalType });
    this.initialPoseTopic = new ROSLIB.Topic({
      ros,
      name: profile.initialPoseTopic,
      messageType: profile.initialPoseType
    });
    this.mappingCmdTopic = new ROSLIB.Topic({
      ros,
      name: '/bot_controller/mapping_cmd',
      messageType: protocol === 'ros2' ? 'std_msgs/msg/Bool' : 'std_msgs/Bool'
    });

    const trackSub = (name, messageType, handler) => {
      const topic = new ROSLIB.Topic({ ros, name, messageType });
      topic.subscribe(handler);
      this.activeTopics.push(topic);
    };

    trackSub(profile.mapTopic, profile.mapType, (m) => {
      this.telemetry.mapData = m;
      this.notify();
    });
    trackSub(profile.costmapTopic, profile.mapType, (m) => {
      this.telemetry.costmapData = m;
      this.notify();
    });
    trackSub(profile.scanTopic, profile.scanType, (scan) => {
      const pts = [];
      let angle = scan.angle_min;
      const { x: rx, y: ry, theta: rTheta } = this.telemetry.robotPose;
      for (let i = 0; i < scan.ranges.length; i++) {
        const r = scan.ranges[i];
        if (Number.isFinite(r) && r >= scan.range_min && r <= scan.range_max) {
          pts.push({ x: rx + r * Math.cos(rTheta + angle), y: ry + r * Math.sin(rTheta + angle), dist: r });
        }
        angle += scan.angle_increment;
      }
      this.telemetry.scanData = pts;
      this.notify();
    });
    trackSub(profile.poseTopic, profile.poseType, (msg) => {
      const p = msg.pose.pose.position;
      this.lastAmclStampMs = Date.now();
      this.telemetry.poseSource = 'amcl';
      this.telemetry.navigationRunning = true;
      this.telemetry.robotPose = { x: p.x, y: p.y, theta: quaternionToYaw(msg.pose.pose.orientation) };
      this.updateNavigationProgress();
      this.notify();
    });
    trackSub(profile.odomTopic, profile.odomType, (msg) => {
      if (Date.now() - this.lastAmclStampMs < 3000) return;
      const p = msg.pose.pose.position;
      this.telemetry.poseSource = 'odom';
      this.telemetry.robotPose = { x: p.x, y: p.y, theta: quaternionToYaw(msg.pose.pose.orientation) };
      this.updateNavigationProgress();
      this.notify();
    });
    trackSub(profile.pathTopic, profile.pathType, (msg) => {
      const pts = (msg.poses || []).map((p) => ({ x: p.pose.position.x, y: p.pose.position.y }));
      this.telemetry.pathData = pts;
      const arcDist = computePathLength(pts, this.telemetry.robotPose);
      if (arcDist > 0) {
        this.telemetry.remainingDistance = arcDist;
        this.telemetry.estimatedTime = arcDist / 0.3;
      }
      this.notify();
    });
    trackSub(profile.batteryTopic, profile.batteryType, (msg) => {
      let pct = msg.percentage;
      if (pct <= 1.0) pct = Math.round(pct * 100);
      this.telemetry.battery = {
        percentage: Math.min(Math.max(pct, 0), 100),
        voltage: Number((msg.voltage || 0).toFixed(1)),
        current: Number((msg.current || 0).toFixed(1)),
        isCharging: msg.power_supply_status === 1,
        powerSupplyStatus: msg.power_supply_status || 2
      };
      this.notify();
    });
  }

  updateNavigationProgress() {
    const { targetPose, robotPose, pathData, multiPointNav, waypoints, activeWaypointIndex } =
      this.telemetry;
    if (!targetPose) return;

    const directDist = Math.hypot(targetPose.x - robotPose.x, targetPose.y - robotPose.y);
    const arcDist = pathData?.length > 1 ? computePathLength(pathData, robotPose) : directDist;
    this.telemetry.remainingDistance = directDist < 0.18 ? 0 : arcDist;
    this.telemetry.estimatedTime = this.telemetry.remainingDistance / 0.3;

    if (directDist < 0.22 && multiPointNav && waypoints.length > 0 && activeWaypointIndex >= 0) {
      this.advanceWaypointQueue();
    }
  }

  // ==================== Unified Control Actions ====================
  publishTwist(linear = { x: 0, y: 0, z: 0 }, angular = { x: 0, y: 0, z: 0 }) {
    if (this.status !== 'connected') return false;
    this.telemetry.linearVel = linear;
    this.telemetry.angularVel = angular;

    if (this.connectionMode === 'w152d') {
      this.postGatewayCmd({
        action: 'cmd_vel',
        lx: linear.x || 0,
        ly: linear.y || 0,
        az: angular.z || 0
      });
      this.notify();
      return true;
    }

    if (!this.cmdVelTopic) return false;
    this.cmdVelTopic.publish(new ROSLIB.Message({ linear, angular }));
    this.notify();
    return true;
  }

  emergencyStop() {
    this.telemetry.targetPose = null;
    this.telemetry.activeWaypointIndex = -1;
    this.telemetry.remainingDistance = 0;
    this.telemetry.estimatedTime = 0;
    this.telemetry.linearVel = { x: 0, y: 0, z: 0 };
    this.telemetry.angularVel = { x: 0, y: 0, z: 0 };

    if (this.connectionMode === 'w152d' && this.telemetry.gatewayOnline) {
      this.postGatewayCmd({ action: 'estop' });
      this.addLog('warn', '已通过 W152D 直连链路下发紧急制动 (vx=0, wz=0)');
      this.notify();
      return;
    }

    if (this.status === 'connected' && this.cmdVelTopic) {
      this.cmdVelTopic.publish(
        new ROSLIB.Message({ linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } })
      );
      this.addLog('warn', '已下发紧急制动指令 (/cmd_vel = 0)');
    }
    this.notify();
  }

  dispatchSingleGoal(x, y, theta = 0) {
    if (this.status !== 'connected') return false;

    if (this.connectionMode === 'w152d') {
      if (this.telemetry.driverMode !== 'local_ros2') {
        this.addLog('warn', '当前处于纯串口直连模式，请先在右侧切换至「ROS 2 导航直通」并启动 Nav2');
        this.notify();
        return false;
      }
      this.telemetry.targetPose = { x, y, theta };
      this.telemetry.navigationRunning = true;
      this.telemetry.pathData = [];
      this.postGatewayCmd({ action: 'goal_pose', x, y, theta });
      return true;
    }

    if (!this.goalTopic) return false;
    this.telemetry.targetPose = { x, y, theta };
    this.telemetry.navigationRunning = true;
    this.telemetry.pathData = [];

    const nowMs = Date.now();
    const sec = Math.floor(nowMs / 1000);
    const nanosec = (nowMs % 1000) * 1e6;
    const header =
      this.telemetry.detectedProtocol === 'ros2'
        ? { frame_id: 'map', stamp: { sec, nanosec } }
        : { frame_id: 'map', stamp: { secs: sec, nsecs: nanosec } };

    this.goalTopic.publish(
      new ROSLIB.Message({
        header,
        pose: { position: { x, y, z: 0 }, orientation: yawToQuaternion(theta) }
      })
    );
    return true;
  }

  setGoalPose(x, y, theta = 0) {
    if (this.status !== 'connected') return false;
    if (this.connectionMode === 'w152d' && this.telemetry.driverMode !== 'local_ros2') {
      this.addLog('warn', '串口直连模式仅支持摇杆遥控与雷达观测，定点导航请切换至 ROS 2 模式');
      this.notify();
      return false;
    }

    if (this.telemetry.multiPointNav) {
      this.addWaypoint(x, y, theta);
      return true;
    }

    const deg = ((theta * 180) / Math.PI).toFixed(0);
    this.addLog('info', `下发导航目标 (${x.toFixed(2)}, ${y.toFixed(2)}, ${deg}°)`);
    const ok = this.dispatchSingleGoal(x, y, theta);
    this.notify();
    return ok;
  }

  setInitialPose(x, y, theta = 0) {
    if (this.status !== 'connected') return false;
    if (this.connectionMode === 'w152d') {
      if (this.telemetry.driverMode !== 'local_ros2') {
        this.addLog('warn', '请先切换至「ROS 2 导航直通」后再标定 AMCL 初始位姿');
        this.notify();
        return false;
      }
      this.telemetry.robotPose = { x, y, theta };
      this.postGatewayCmd({ action: 'initial_pose', x, y, theta });
      this.addLog('info', `已通过 W152D 本机发布 /initialpose (${x.toFixed(2)}, ${y.toFixed(2)})`);
      this.notify();
      return true;
    }

    if (!this.initialPoseTopic) return false;
    this.telemetry.robotPose = { x, y, theta };
    const cov = new Array(36).fill(0);
    cov[0] = 0.25;
    cov[7] = 0.25;
    cov[35] = 0.0685;
    const nowMs = Date.now();
    const sec = Math.floor(nowMs / 1000);
    const nanosec = (nowMs % 1000) * 1e6;
    const header =
      this.telemetry.detectedProtocol === 'ros2'
        ? { frame_id: 'map', stamp: { sec, nanosec } }
        : { frame_id: 'map', stamp: { secs: sec, nsecs: nanosec } };

    this.initialPoseTopic.publish(
      new ROSLIB.Message({
        header,
        pose: {
          pose: { position: { x, y, z: 0 }, orientation: yawToQuaternion(theta) },
          covariance: cov
        }
      })
    );
    this.notify();
    return true;
  }

  // ==================== Waypoint Patrol ====================
  setMultiPointNav(enabled) {
    this.telemetry.multiPointNav = Boolean(enabled);
    if (!enabled) this.telemetry.activeWaypointIndex = -1;
    this.notify();
  }

  setLoopWaypoints(loop) {
    this.telemetry.loopWaypoints = Boolean(loop);
    this.notify();
  }

  addWaypoint(x, y, theta = 0) {
    const idx = this.telemetry.waypoints.length + 1;
    const wp = { id: `wp_${Date.now()}_${idx}`, x, y, theta };
    this.telemetry.waypoints = [...this.telemetry.waypoints, wp];
    if (this.status === 'connected' && this.telemetry.navigationRunning && this.telemetry.activeWaypointIndex === -1) {
      this.telemetry.activeWaypointIndex = this.telemetry.waypoints.length - 1;
      this.dispatchSingleGoal(wp.x, wp.y, wp.theta);
    }
    this.notify();
  }

  startWaypointPatrol() {
    if (this.status !== 'connected' || this.telemetry.waypoints.length === 0) return false;
    this.telemetry.navigationRunning = true;
    this.telemetry.activeWaypointIndex = 0;
    const first = this.telemetry.waypoints[0];
    const ok = this.dispatchSingleGoal(first.x, first.y, first.theta);
    this.notify();
    return ok;
  }

  advanceWaypointQueue() {
    const { waypoints, activeWaypointIndex, loopWaypoints } = this.telemetry;
    if (waypoints.length === 0 || activeWaypointIndex < 0) return;

    const nextIdx = activeWaypointIndex + 1;
    if (nextIdx < waypoints.length) {
      this.telemetry.activeWaypointIndex = nextIdx;
      const wp = waypoints[nextIdx];
      this.dispatchSingleGoal(wp.x, wp.y, wp.theta);
      this.notify();
    } else if (loopWaypoints && waypoints.length > 1) {
      this.telemetry.activeWaypointIndex = 0;
      const wp = waypoints[0];
      this.dispatchSingleGoal(wp.x, wp.y, wp.theta);
      this.notify();
    } else {
      this.telemetry.activeWaypointIndex = -1;
      this.telemetry.targetPose = null;
      this.telemetry.remainingDistance = 0;
      this.telemetry.estimatedTime = 0;
      this.notify();
    }
  }

  clearWaypoints() {
    this.telemetry.waypoints = [];
    this.telemetry.activeWaypointIndex = -1;
    this.telemetry.targetPose = null;
    this.telemetry.remainingDistance = 0;
    this.telemetry.estimatedTime = 0;
    this.notify();
  }

  // ==================== SLAM & Map Operations ====================
  async toggleMappingMode() {
    if (this.connectionMode === 'w152d') {
      if (!this.telemetry.gatewayOnline) return false;
      const isRunning = Boolean(this.telemetry.managedNodes?.slam?.running || this.telemetry.mappingRunning);
      const res = await this.controlW152DNode('slam', isRunning ? 'stop' : 'start');
      if (res?.ok) {
        this.telemetry.mappingRunning = !isRunning;
        this.notify();
        return true;
      }
      return false;
    }

    if (this.status !== 'connected') return false;
    this.telemetry.mappingRunning = !this.telemetry.mappingRunning;
    if (this.mappingCmdTopic) {
      this.mappingCmdTopic.publish(new ROSLIB.Message({ data: this.telemetry.mappingRunning }));
    }
    this.notify();
    return true;
  }

  registerMapName(cleanName) {
    if (!cleanName) return;
    if (!this.telemetry.availableMaps.includes(cleanName)) {
      this.telemetry.availableMaps = [cleanName, ...this.telemetry.availableMaps];
      persistMaps(this.telemetry.availableMaps);
    }
    this.telemetry.selectedMap = cleanName;
  }

  async saveMap(mapName) {
    const cleanName = (mapName || '').trim().replace(/\.(yaml|pgm)$/i, '');
    if (!cleanName) return { ok: false, mode: 'invalid' };

    if (this.connectionMode === 'w152d' && this.telemetry.gatewayOnline) {
      const res = await this.postGatewayCmd({ action: 'save_map', name: cleanName });
      if (res?.ok) {
        this.registerMapName(cleanName);
        this.addLog('info', `已请求 W152D 本机保存栅格地图: ${cleanName}`);
        this.notify();
        return { ok: true, mode: 'nav2' };
      }
      return { ok: false, mode: 'service_unavailable' };
    }

    return { ok: false, mode: 'disconnected' };
  }

  exportCurrentMapFiles(baseName = 'map') {
    const mapData = this.telemetry.mapData;
    if (!mapData?.info || !mapData?.data) return false;

    const clean = (baseName || this.telemetry.selectedMap || 'bot_map')
      .trim()
      .replace(/\.(yaml|pgm)$/i, '');
    const { width, height, resolution, origin } = mapData.info;
    const ox = origin?.position?.x ?? 0;
    const oy = origin?.position?.y ?? 0;
    const yaw = quaternionToYaw(origin?.orientation);

    const header = `P5\n${width} ${height}\n255\n`;
    const headerBytes = new TextEncoder().encode(header);
    const pixels = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      const rosY = height - 1 - y;
      for (let x = 0; x < width; x++) {
        const v = mapData.data[rosY * width + x];
        pixels[y * width + x] = v === 100 ? 0 : v === 0 ? 254 : 205;
      }
    }

    const pgmBlob = new Blob([headerBytes, pixels], { type: 'image/x-portable-graymap' });
    const yamlText = [
      `image: ${clean}.pgm`,
      `mode: trinary`,
      `resolution: ${resolution}`,
      `origin: [${ox.toFixed(4)}, ${oy.toFixed(4)}, ${yaw.toFixed(4)}]`,
      `negate: 0`,
      `occupied_thresh: 0.65`,
      `free_thresh: 0.25`,
      ''
    ].join('\n');
    const yamlBlob = new Blob([yamlText], { type: 'text/yaml;charset=utf-8' });

    const triggerDownload = (blob, filename) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    triggerDownload(pgmBlob, `${clean}.pgm`);
    setTimeout(() => triggerDownload(yamlBlob, `${clean}.yaml`), 180);
    this.addLog('info', `已导出地图文件: ${clean}.pgm + ${clean}.yaml`);
    this.notify();
    return true;
  }

  async refreshAvailableMaps() {
    this.notify();
    return this.telemetry.availableMaps;
  }

  async toggleNavigationMode() {
    if (this.connectionMode === 'w152d' && this.telemetry.gatewayOnline) {
      const navNodeRunning = Boolean(this.telemetry.managedNodes?.nav2?.running);
      const res = await this.controlW152DNode('nav2', navNodeRunning ? 'stop' : 'start');
      if (res?.ok) {
        this.telemetry.navigationRunning = !navNodeRunning;
        this.notify();
        return true;
      }
      return false;
    }

    if (this.status !== 'connected') return false;
    this.telemetry.navigationRunning = !this.telemetry.navigationRunning;
    if (!this.telemetry.navigationRunning) {
      this.publishTwist({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
    }
    this.notify();
    return true;
  }

  async setSelectedMap(mapNameOrPath) {
    const raw = (mapNameOrPath || '').trim();
    if (!raw) return false;
    const cleanStem = raw.replace(/\.yaml$/i, '');
    const yamlUrl = raw.endsWith('.yaml') ? raw : `${raw}.yaml`;

    if (this.connectionMode === 'w152d' && this.telemetry.gatewayOnline) {
      const res = await this.postGatewayCmd({ action: 'load_map', map_url: yamlUrl });
      if (res?.ok) {
        this.registerMapName(cleanStem);
        this.addLog('info', `已通知 W152D map_server 加载地图: ${yamlUrl}`);
        this.notify();
        return true;
      }
    }
    return false;
  }
}

export const rosService = new ROSService();
