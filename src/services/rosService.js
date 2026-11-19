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
const RECONNECT_DELAYS_MS = [3000, 5000, 8000, 12000];

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
  } catch {
    // ignore storage errors
  }
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

class ROSService {
  constructor() {
    this.ros = null;
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

    this.currentUrl = 'ws://192.168.2.88:9090';
    this.shouldReconnect = false;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.connectionTimer = null;

    const savedMaps = loadPersistedMaps();

    this.telemetry = {
      rosProtocol: 'auto', // 'auto' | 'ros2' | 'ros1'
      detectedProtocol: 'ros2', // 'ros2' | 'ros1'
      activeTopicSummary: PROTOCOL_PROFILES.ros2,
      reconnectAttempts: 0,
      linearVel: { x: 0, y: 0, z: 0 },
      angularVel: { x: 0, y: 0, z: 0 },
      robotPose: { x: 0, y: 0, theta: 0 },
      poseSource: 'none', // 'amcl' | 'odom' | 'none'
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

    this.addLog('info', '机器人中控服务已初始化 (纯真机通信模式，支持断线自动重连)');
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

  cleanupRosTopics() {
    this.activeTopics.forEach((t) => {
      try {
        t.unsubscribe();
      } catch {
        // ignore unsubscribe errors on closed sockets
      }
    });
    this.activeTopics = [];
    this.cmdVelTopic = null;
    this.goalTopic = null;
    this.cancelGoalTopic = null;
    this.initialPoseTopic = null;
    this.mappingCmdTopic = null;
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
    this.cleanupRosTopics();
    this.telemetry.detectedProtocol = protocol;
    this.telemetry.activeTopicSummary = profile;

    this.cmdVelTopic = new ROSLIB.Topic({
      ros,
      name: '/cmd_vel',
      messageType: profile.cmdVelType
    });

    this.goalTopic = new ROSLIB.Topic({
      ros,
      name: profile.goalTopic,
      messageType: profile.goalType
    });

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

    if (protocol === 'ros1') {
      this.cancelGoalTopic = new ROSLIB.Topic({
        ros,
        name: profile.cancelGoalTopic,
        messageType: 'actionlib_msgs/GoalID'
      });
    }

    const trackSub = (name, messageType, handler) => {
      const topic = new ROSLIB.Topic({ ros, name, messageType });
      topic.subscribe(handler);
      this.activeTopics.push(topic);
      return topic;
    };

    // 1. OccupancyGrid Map
    trackSub(profile.mapTopic, profile.mapType, (message) => {
      this.telemetry.mapData = message;
      this.notify();
    });

    // 2. Global Costmap
    trackSub(profile.costmapTopic, profile.mapType, (message) => {
      this.telemetry.costmapData = message;
      this.notify();
    });

    // 3. LaserScan
    trackSub(profile.scanTopic, profile.scanType, (scan) => {
      const scanPoints = [];
      let angle = scan.angle_min;
      const { x: rx, y: ry, theta: rTheta } = this.telemetry.robotPose;
      for (let i = 0; i < scan.ranges.length; i++) {
        const r = scan.ranges[i];
        if (Number.isFinite(r) && r >= scan.range_min && r <= scan.range_max) {
          scanPoints.push({
            x: rx + r * Math.cos(rTheta + angle),
            y: ry + r * Math.sin(rTheta + angle),
            dist: r
          });
        }
        angle += scan.angle_increment;
      }
      this.telemetry.scanData = scanPoints;
      this.notify();
    });

    // 4. AMCL Pose
    trackSub(profile.poseTopic, profile.poseType, (msg) => {
      const p = msg.pose.pose.position;
      const yaw = quaternionToYaw(msg.pose.pose.orientation);
      this.lastAmclStampMs = Date.now();
      this.telemetry.poseSource = 'amcl';
      this.telemetry.navigationRunning = true;
      this.telemetry.robotPose = { x: p.x, y: p.y, theta: yaw };
      this.updateNavigationProgress();
      this.notify();
    });

    // 5. Odometry Pose fallback (used during SLAM mapping when AMCL is inactive)
    trackSub(profile.odomTopic, profile.odomType, (msg) => {
      if (Date.now() - this.lastAmclStampMs < 3000) return;
      const p = msg.pose.pose.position;
      const yaw = quaternionToYaw(msg.pose.pose.orientation);
      this.telemetry.poseSource = 'odom';
      this.telemetry.robotPose = { x: p.x, y: p.y, theta: yaw };
      this.updateNavigationProgress();
      this.notify();
    });

    // 6. Global Planned Path
    trackSub(profile.pathTopic, profile.pathType, (msg) => {
      const pts = (msg.poses || []).map((p) => ({
        x: p.pose.position.x,
        y: p.pose.position.y
      }));
      this.telemetry.pathData = pts;
      const arcDist = computePathLength(pts, this.telemetry.robotPose);
      if (arcDist > 0) {
        this.telemetry.remainingDistance = arcDist;
        this.telemetry.estimatedTime = arcDist / 0.3;
      }
      this.notify();
    });

    // 7. Battery State
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

  scheduleAutoReconnect() {
    if (!this.shouldReconnect || this.reconnectTimer) return;
    const delayMs =
      RECONNECT_DELAYS_MS[Math.min(this.reconnectAttempts, RECONNECT_DELAYS_MS.length - 1)];
    this.reconnectAttempts += 1;
    this.telemetry.reconnectAttempts = this.reconnectAttempts;

    if (this.reconnectAttempts <= 3) {
      this.addLog('warn', `ROS Bridge 未连接，将在 ${delayMs / 1000}s 后自动重试 (第 ${this.reconnectAttempts} 次)`);
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.shouldReconnect && this.status === 'disconnected') {
        this.connect(this.currentUrl, {
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
      rosProtocol: this.telemetry.rosProtocol,
      autoReconnect: true
    });
  }

  connect(
    url = 'ws://192.168.2.88:9090',
    { timeoutMs = 5000, rosProtocol, autoReconnect = true, silentAttempt = false } = {}
  ) {
    this.currentUrl = url;
    this.shouldReconnect = autoReconnect;
    if (rosProtocol) {
      this.telemetry.rosProtocol = rosProtocol;
    }

    this.clearTimers();
    this.cleanupRosTopics();
    this.lastAmclStampMs = 0;

    if (this.ros) {
      const previousRos = this.ros;
      this.ros = null;
      previousRos.close();
    }

    this.status = 'connecting';
    if (!silentAttempt) {
      this.addLog('info', `正在连接 ROS Bridge: ${url}`, {
        protocol: this.telemetry.rosProtocol
      });
    }
    this.notify();

    try {
      const ros = new ROSLIB.Ros({ url });
      this.ros = ros;

      const handleConnectionFailure = () => {
        if (this.ros !== ros) return;

        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer);
          this.connectionTimer = null;
        }
        this.cleanupRosTopics();
        this.ros = null;
        try {
          ros.close();
        } catch {
          // ignore close errors
        }

        const wasConnected = this.status === 'connected';
        this.status = 'disconnected';
        this.telemetry.linearVel = { x: 0, y: 0, z: 0 };
        this.telemetry.angularVel = { x: 0, y: 0, z: 0 };
        this.telemetry.poseSource = 'none';

        if (wasConnected) {
          this.reconnectAttempts = 0;
          this.addLog('error', `与 ROS Bridge 的连接已断开 (${url})`);
        }

        this.scheduleAutoReconnect();
        this.notify();
      };

      this.connectionTimer = setTimeout(() => {
        handleConnectionFailure();
      }, timeoutMs);

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
          this.addLog('info', `已连接 ROS Bridge，协议栈锁定为 ${profile.label}`);
          this.refreshAvailableMaps();
          this.notify();
          return;
        }

        let graphResolved = false;
        const fallbackTimer = setTimeout(() => {
          if (graphResolved || this.ros !== ros) return;
          graphResolved = true;
          const { protocol, profile } = this.resolveProfileFromGraph('ros2');
          this.bindRosTopics(ros, protocol, profile);
          this.addLog('info', `已连接 ROS Bridge，默认启用 ${profile.label} 话题契约`);
          this.refreshAvailableMaps();
          this.notify();
        }, 1200);

        ros.getTopics(
          (result) => {
            if (graphResolved || this.ros !== ros) return;
            graphResolved = true;
            clearTimeout(fallbackTimer);
            const topics = result?.topics || [];
            const types = result?.types || [];
            const { protocol, profile } = this.resolveProfileFromGraph('auto', topics, types);
            this.bindRosTopics(ros, protocol, profile);
            this.addLog('info', `已连接 ROS Bridge，自动识别协议栈为 ${profile.label}`, {
              goalTopic: profile.goalTopic,
              pathTopic: profile.pathTopic,
              discoveredTopics: topics.length
            });
            this.refreshAvailableMaps();
            this.notify();
          },
          () => {
            if (graphResolved || this.ros !== ros) return;
            graphResolved = true;
            clearTimeout(fallbackTimer);
            const { protocol, profile } = this.resolveProfileFromGraph('ros2');
            this.bindRosTopics(ros, protocol, profile);
            this.addLog('info', `已连接 ROS Bridge (${profile.label})`);
            this.refreshAvailableMaps();
            this.notify();
          }
        );
      });

      ros.on('error', handleConnectionFailure);
      ros.on('close', handleConnectionFailure);
    } catch (e) {
      this.status = 'disconnected';
      this.addLog('error', `ROS WebSocket 地址或连接异常: ${e?.message || '未知错误'}`);
      this.scheduleAutoReconnect();
      this.notify();
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    this.clearTimers();
    this.cleanupRosTopics();
    if (this.ros) {
      const ros = this.ros;
      this.ros = null;
      ros.close();
    }
    this.status = 'disconnected';
    this.notify();
  }

  callRosService(name, serviceType, requestPayload = {}) {
    return new Promise((resolve, reject) => {
      if (!this.ros || this.status !== 'connected') {
        reject(new Error('ROS not connected'));
        return;
      }
      const client = new ROSLIB.Service({
        ros: this.ros,
        name,
        serviceType
      });
      const req = new ROSLIB.ServiceRequest(requestPayload);
      const timer = setTimeout(() => reject(new Error(`Service ${name} timeout`)), 3500);
      client.callService(
        req,
        (res) => {
          clearTimeout(timer);
          resolve(res);
        },
        (err) => {
          clearTimeout(timer);
          reject(new Error(typeof err === 'string' ? err : err?.message || `Service ${name} error`));
        }
      );
    });
  }

  publishTwist(linear = { x: 0, y: 0, z: 0 }, angular = { x: 0, y: 0, z: 0 }) {
    if (this.status !== 'connected' || !this.cmdVelTopic) return false;
    this.telemetry.linearVel = linear;
    this.telemetry.angularVel = angular;
    this.cmdVelTopic.publish(new ROSLIB.Message({ linear, angular }));
    this.notify();
    return true;
  }

  cancelActiveRosGoal() {
    if (this.status !== 'connected') return;
    if (this.cancelGoalTopic) {
      this.cancelGoalTopic.publish(new ROSLIB.Message({}));
    } else if (this.telemetry.detectedProtocol === 'ros2') {
      this.callRosService(
        '/navigate_to_pose/_action/cancel_goal',
        'action_msgs/srv/CancelGoal',
        {}
      ).catch(() => {});
    }
  }

  emergencyStop() {
    this.cancelActiveRosGoal();
    this.telemetry.targetPose = null;
    this.telemetry.pathData = [];
    this.telemetry.activeWaypointIndex = -1;
    this.telemetry.remainingDistance = 0;
    this.telemetry.estimatedTime = 0;
    this.telemetry.linearVel = { x: 0, y: 0, z: 0 };
    this.telemetry.angularVel = { x: 0, y: 0, z: 0 };

    if (this.status === 'connected' && this.cmdVelTopic) {
      this.cmdVelTopic.publish(
        new ROSLIB.Message({
          linear: { x: 0, y: 0, z: 0 },
          angular: { x: 0, y: 0, z: 0 }
        })
      );
      this.addLog('warn', '已向机器人下发紧急制动指令 (/cmd_vel = 0，取消活动目标)');
    } else {
      this.addLog('warn', '当前未连接 ROS Bridge，已清空本地目标队列');
    }
    this.notify();
  }

  buildROSHeader(frameId = 'map') {
    const nowMs = Date.now();
    const sec = Math.floor(nowMs / 1000);
    const nanosec = (nowMs % 1000) * 1e6;
    if (this.telemetry.detectedProtocol === 'ros2') {
      return {
        frame_id: frameId,
        stamp: { sec, nanosec }
      };
    }
    return {
      frame_id: frameId,
      stamp: { secs: sec, nsecs: nanosec }
    };
  }

  dispatchSingleGoal(x, y, theta = 0) {
    if (this.status !== 'connected' || !this.goalTopic) return false;

    this.telemetry.targetPose = { x, y, theta };
    this.telemetry.navigationRunning = true;
    this.telemetry.pathData = [];

    const rx = this.telemetry.robotPose.x;
    const ry = this.telemetry.robotPose.y;
    const dist = Math.hypot(x - rx, y - ry);
    this.telemetry.remainingDistance = dist;
    this.telemetry.estimatedTime = dist / 0.3;

    const poseMsg = new ROSLIB.Message({
      header: this.buildROSHeader('map'),
      pose: {
        position: { x, y, z: 0 },
        orientation: yawToQuaternion(theta)
      }
    });
    this.goalTopic.publish(poseMsg);
    return true;
  }

  setGoalPose(x, y, theta = 0) {
    if (this.status !== 'connected') {
      this.addLog('warn', '下发导航目标失败：尚未连接 ROS Bridge');
      this.notify();
      return false;
    }

    if (this.telemetry.multiPointNav) {
      this.addWaypoint(x, y, theta);
      return true;
    }

    const deg = ((theta * 180) / Math.PI).toFixed(0);
    this.addLog('info', `下发单点导航目标 (${x.toFixed(2)}, ${y.toFixed(2)}, ${deg}°)`);
    this.dispatchSingleGoal(x, y, theta);
    this.notify();
    return true;
  }

  // ==================== Multi-Point Waypoint Patrol ====================
  setMultiPointNav(enabled) {
    this.telemetry.multiPointNav = Boolean(enabled);
    if (!enabled) {
      this.telemetry.activeWaypointIndex = -1;
    }
    this.addLog('info', enabled ? '已开启多点巡航航点编排模式' : '已切回单点目标导航模式');
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
    this.addLog('info', `添加巡航航点 #${idx} (${x.toFixed(2)}, ${y.toFixed(2)})`);

    if (
      this.status === 'connected' &&
      this.telemetry.navigationRunning &&
      this.telemetry.activeWaypointIndex === -1
    ) {
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
    this.addLog('info', `启动多点巡航（共 ${this.telemetry.waypoints.length} 个航点）`);
    this.dispatchSingleGoal(first.x, first.y, first.theta);
    this.notify();
    return true;
  }

  advanceWaypointQueue() {
    const { waypoints, activeWaypointIndex, loopWaypoints } = this.telemetry;
    if (waypoints.length === 0 || activeWaypointIndex < 0) return;

    const nextIdx = activeWaypointIndex + 1;
    if (nextIdx < waypoints.length) {
      this.telemetry.activeWaypointIndex = nextIdx;
      const wp = waypoints[nextIdx];
      this.addLog('info', `已到达航点 #${activeWaypointIndex + 1}，前往下一航点 #${nextIdx + 1}`);
      this.dispatchSingleGoal(wp.x, wp.y, wp.theta);
      this.notify();
    } else if (loopWaypoints && waypoints.length > 1) {
      this.telemetry.activeWaypointIndex = 0;
      const wp = waypoints[0];
      this.addLog('info', '本轮巡航完成，循环返回航点 #1');
      this.dispatchSingleGoal(wp.x, wp.y, wp.theta);
      this.notify();
    } else {
      this.telemetry.activeWaypointIndex = -1;
      this.telemetry.targetPose = null;
      this.telemetry.pathData = [];
      this.telemetry.remainingDistance = 0;
      this.telemetry.estimatedTime = 0;
      this.addLog('info', `多点巡航任务全部完成（共完成 ${waypoints.length} 个航点）`);
      this.notify();
    }
  }

  clearWaypoints() {
    this.cancelActiveRosGoal();
    this.telemetry.waypoints = [];
    this.telemetry.activeWaypointIndex = -1;
    this.telemetry.targetPose = null;
    this.telemetry.pathData = [];
    this.telemetry.remainingDistance = 0;
    this.telemetry.estimatedTime = 0;
    this.addLog('info', '已清空全部巡航航点队列');
    this.notify();
  }

  // ==================== Pose, Mapping & Map Server Integration ====================
  setInitialPose(x, y, theta = 0) {
    if (this.status !== 'connected' || !this.initialPoseTopic) {
      this.addLog('warn', '标定初始位姿失败：尚未连接 ROS Bridge');
      this.notify();
      return false;
    }

    this.telemetry.robotPose = { x, y, theta };
    const deg = ((theta * 180) / Math.PI).toFixed(0);
    this.addLog('info', `发布机器人初始位姿 /initialpose (${x.toFixed(2)}, ${y.toFixed(2)}, ${deg}°)`);

    const covariance = new Array(36).fill(0);
    covariance[0] = 0.25;
    covariance[7] = 0.25;
    covariance[35] = 0.0685;

    const poseMsg = new ROSLIB.Message({
      header: this.buildROSHeader('map'),
      pose: {
        pose: {
          position: { x, y, z: 0 },
          orientation: yawToQuaternion(theta)
        },
        covariance
      }
    });
    this.initialPoseTopic.publish(poseMsg);
    this.notify();
    return true;
  }

  async toggleMappingMode() {
    if (this.status !== 'connected') return false;

    const nextRunning = !this.telemetry.mappingRunning;
    this.telemetry.mappingRunning = nextRunning;

    if (this.mappingCmdTopic) {
      this.mappingCmdTopic.publish(new ROSLIB.Message({ data: nextRunning }));
    }
    try {
      await this.callRosService('/slam_toolbox/pause_new_measurements', 'slam_toolbox/srv/Pause', {});
      this.addLog('info', nextRunning ? '已通过 slam_toolbox 恢复激光建图测量' : '已暂停 slam_toolbox 建图测量');
    } catch {
      this.addLog(
        'info',
        nextRunning
          ? '已发布开始建图指令 (/bot_controller/mapping_cmd = true)'
          : '已发布停止建图指令 (/bot_controller/mapping_cmd = false)'
      );
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
    if (this.status !== 'connected') return { ok: false, mode: 'disconnected' };

    try {
      await this.callRosService('/map_saver/save_map', 'nav2_msgs/srv/SaveMap', {
        map_topic: '/map',
        map_url: cleanName,
        image_format: 'pgm',
        map_mode: 'trinary',
        free_thresh: 0.25,
        occupied_thresh: 0.65
      });
      this.registerMapName(cleanName);
      this.addLog('info', `已通过 Nav2 map_saver 保存地图: ${cleanName}`);
      this.notify();
      return { ok: true, mode: 'nav2' };
    } catch {
      try {
        await this.callRosService('/slam_toolbox/save_map', 'slam_toolbox/srv/SaveMap', {
          name: { data: cleanName }
        });
        this.registerMapName(cleanName);
        this.addLog('info', `已通过 slam_toolbox 保存地图: ${cleanName}`);
        this.notify();
        return { ok: true, mode: 'slam_toolbox' };
      } catch (err) {
        this.addLog(
          'error',
          `远端存图服务调用失败 (${err?.message || '未检测到 /map_saver/save_map 或 /slam_toolbox/save_map'})，可使用右侧下载按钮直接导出本地 .pgm/.yaml`
        );
        this.notify();
        return { ok: false, mode: 'service_unavailable' };
      }
    }
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
    this.addLog('info', `已导出 ROS 标准地图文件: ${clean}.pgm + ${clean}.yaml`);
    this.notify();
    return true;
  }

  async refreshAvailableMaps() {
    if (this.status === 'connected') {
      try {
        const res = await this.callRosService(
          '/bot_controller/list_maps',
          this.telemetry.detectedProtocol === 'ros2' ? 'std_srvs/srv/Trigger' : 'std_srvs/Trigger',
          {}
        );
        if (res?.message) {
          const parsed = res.message
            .split(/[,;\s]+/)
            .map((s) => s.trim().replace(/\.yaml$/i, ''))
            .filter(Boolean);
          if (parsed.length > 0) {
            this.telemetry.availableMaps = [...new Set([...parsed, ...this.telemetry.availableMaps])];
            if (!this.telemetry.selectedMap) {
              this.telemetry.selectedMap = this.telemetry.availableMaps[0];
            }
            persistMaps(this.telemetry.availableMaps);
          }
        }
      } catch {
        // Optional helper service not present on robot; keep persisted map history
      }
    }
    this.notify();
    return this.telemetry.availableMaps;
  }

  toggleNavigationMode() {
    if (this.status !== 'connected') return false;

    const nextRunning = !this.telemetry.navigationRunning;
    this.telemetry.navigationRunning = nextRunning;

    if (!nextRunning) {
      this.cancelActiveRosGoal();
      this.publishTwist({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
      this.addLog('info', '自主导航已停止，已取消活动导航目标并下发零速度');
    } else {
      this.addLog('info', '自主导航控制已启用');
      if (this.telemetry.multiPointNav && this.telemetry.waypoints.length > 0 && !this.telemetry.targetPose) {
        this.startWaypointPatrol();
        return true;
      }
    }
    this.notify();
    return true;
  }

  async setSelectedMap(mapNameOrPath) {
    const raw = (mapNameOrPath || '').trim();
    if (!raw || this.status !== 'connected') return false;

    const cleanStem = raw.replace(/\.yaml$/i, '');
    const yamlUrl = raw.endsWith('.yaml') ? raw : `${raw}.yaml`;

    this.telemetry.targetPose = null;
    this.telemetry.pathData = [];
    this.telemetry.remainingDistance = 0;
    this.telemetry.estimatedTime = 0;

    try {
      await this.callRosService('/map_server/load_map', 'nav2_msgs/srv/LoadMap', {
        map_url: yamlUrl
      });
      this.registerMapName(cleanStem);
      this.addLog('info', `已通过 Nav2 map_server 加载地图: ${yamlUrl}`);
      this.notify();
      return true;
    } catch (err) {
      this.registerMapName(cleanStem);
      this.addLog(
        'warn',
        `请求 /map_server/load_map (${yamlUrl}) 未响应: ${err?.message || '请确认 map_server 已处于 active 状态'}`
      );
      this.notify();
      return false;
    }
  }
}

export const rosService = new ROSService();
