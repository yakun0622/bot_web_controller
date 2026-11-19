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

/** Build distinct simulated maps so switching maps genuinely changes the floorplan */
function createPresetMockMap(presetName = 'test_room') {
  const resolution = 0.05;

  if (presetName === 'factory_floor_1') {
    const width = 160;
    const height = 120;
    const data = new Array(width * height).fill(0);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (x < 4 || x > width - 5 || y < 4 || y > height - 5) {
          data[idx] = 100;
        } else if (
          // Parallel assembly racks
          (x >= 28 && x <= 62 && ((y >= 24 && y <= 30) || (y >= 56 && y <= 62) || (y >= 86 && y <= 92))) ||
          (x >= 94 && x <= 132 && ((y >= 24 && y <= 30) || (y >= 56 && y <= 62) || (y >= 86 && y <= 92))) ||
          // Pillar columns
          (Math.abs(x - 78) <= 2 && (Math.abs(y - 38) <= 2 || Math.abs(y - 78) <= 2))
        ) {
          data[idx] = 100;
        }
      }
    }
    return {
      info: {
        width,
        height,
        resolution,
        origin: {
          position: { x: (-width * resolution) / 2, y: (-height * resolution) / 2, z: 0 },
          orientation: { x: 0, y: 0, z: 0, w: 1 }
        }
      },
      data
    };
  }

  if (presetName === 'office_space_3') {
    const width = 140;
    const height = 140;
    const data = new Array(width * height).fill(0);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (x < 4 || x > width - 5 || y < 4 || y > height - 5) {
          data[idx] = 100;
        } else if (
          // Meeting rooms with doorway gaps
          (y === 48 && x >= 4 && x <= 90 && !(x >= 40 && x <= 52)) ||
          (x === 56 && y >= 4 && y <= 48 && !(y >= 20 && y <= 30)) ||
          (y === 96 && x >= 45 && x <= 135 && !(x >= 76 && x <= 88)) ||
          // Desk islands
          (x >= 22 && x <= 38 && y >= 72 && y <= 84) ||
          (x >= 88 && x <= 112 && y >= 62 && y <= 74)
        ) {
          data[idx] = 100;
        }
      }
    }
    return {
      info: {
        width,
        height,
        resolution,
        origin: {
          position: { x: (-width * resolution) / 2, y: (-height * resolution) / 2, z: 0 },
          orientation: { x: 0, y: 0, z: 0, w: 1 }
        }
      },
      data
    };
  }

  // Default: test_room
  const width = 120;
  const height = 120;
  const data = new Array(width * height).fill(0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (x < 5 || x > width - 6 || y < 5 || y > height - 6) {
        data[idx] = 100;
      } else if (
        (x >= 25 && x <= 28 && y >= 20 && y <= 80) ||
        (x >= 65 && x <= 95 && y >= 35 && y <= 38) ||
        (x >= 50 && x <= 53 && y >= 60 && y <= 105) ||
        (x >= 75 && x <= 78 && y >= 15 && y <= 55)
      ) {
        data[idx] = 100;
      }
    }
  }

  return {
    info: {
      width,
      height,
      resolution,
      origin: {
        position: { x: (-width * resolution) / 2, y: (-height * resolution) / 2, z: 0 },
        orientation: { x: 0, y: 0, z: 0, w: 1 }
      }
    },
    data
  };
}

/** Inflate obstacles slightly to generate a realistic local/global costmap for simulation */
function buildInflatedCostmap(mapData) {
  if (!mapData?.info || !mapData?.data) return null;
  const { width, height } = mapData.info;
  const src = mapData.data;
  const out = new Array(width * height).fill(0);
  const radiusCells = 3;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (src[y * width + x] === 100) {
        out[y * width + x] = 100;
        for (let dy = -radiusCells; dy <= radiusCells; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;
          for (let dx = -radiusCells; dx <= radiusCells; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= width) continue;
            const d = Math.hypot(dx, dy);
            if (d <= radiusCells && src[ny * width + nx] === 0) {
              const cost = Math.round(((radiusCells + 1 - d) / (radiusCells + 1)) * 75);
              if (cost > out[ny * width + nx]) out[ny * width + nx] = cost;
            }
          }
        }
      }
    }
  }

  return { info: mapData.info, data: out };
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
    this.isSimulated = false;
    this.listeners = new Set();
    this.logSeq = 0;
    this.lastAmclStampMs = 0;

    // Saved mock/custom maps in memory
    this.mockMapStore = new Map([
      ['test_room', createPresetMockMap('test_room')],
      ['factory_floor_1', createPresetMockMap('factory_floor_1')],
      ['office_space_3', createPresetMockMap('office_space_3')]
    ]);
    this.simGroundTruthMap = this.mockMapStore.get('test_room');

    this.telemetry = {
      rosProtocol: 'auto', // User preference: 'auto' | 'ros2' | 'ros1'
      detectedProtocol: 'ros2', // Resolved active protocol: 'ros2' | 'ros1'
      activeTopicSummary: PROTOCOL_PROFILES.ros2,
      linearVel: { x: 0, y: 0, z: 0 },
      angularVel: { x: 0, y: 0, z: 0 },
      robotPose: { x: 0, y: -0.5, theta: Math.PI / 4 },
      poseSource: 'simulation', // 'amcl' | 'odom' | 'simulation'
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
      navigationRunning: true,
      selectedMap: 'test_room',
      availableMaps: ['test_room', 'factory_floor_1', 'office_space_3'],
      battery: {
        percentage: 86,
        voltage: 12.4,
        current: -1.2,
        isCharging: false,
        powerSupplyStatus: 2
      },
      logs: []
    };

    this.initMockMap('test_room');
    this.addLog('info', '机器人中控服务已初始化 (支持 ROS 1 / ROS 2 Nav2 双协议自适应)');
    this.simInterval = null;
    this.connectionTimer = null;
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

  cloneMap(mapObj) {
    return {
      info: {
        ...mapObj.info,
        origin: {
          position: { ...mapObj.info.origin.position },
          orientation: { ...(mapObj.info.origin.orientation || { x: 0, y: 0, z: 0, w: 1 }) }
        }
      },
      data: [...mapObj.data]
    };
  }

  initMockMap(mapName = this.telemetry.selectedMap) {
    const stored = this.mockMapStore.get(mapName) || createPresetMockMap(mapName);
    if (!this.mockMapStore.has(mapName)) {
      this.mockMapStore.set(mapName, stored);
    }
    this.simGroundTruthMap = stored;
    this.telemetry.mapData = this.cloneMap(stored);
    this.telemetry.costmapData = buildInflatedCostmap(this.telemetry.mapData);
    this.telemetry.poseSource = 'simulation';
    this.generateMockScan();
  }

  /** Raycast simulated LiDAR against ground-truth occupancy grid (realistic wall hits + SLAM exploration!) */
  generateMockScan() {
    const gt = this.simGroundTruthMap;
    if (!gt?.info || !gt?.data) return;

    const { width, height, resolution, origin } = gt.info;
    const ox = origin.position.x;
    const oy = origin.position.y;
    const { x: rx, y: ry, theta: rTheta } = this.telemetry.robotPose;

    const rays = 180;
    const maxRange = 4.5;
    const step = resolution * 0.65;
    const scan = [];

    const activeMap = this.telemetry.mapData;
    const isMapping = this.isSimulated && this.telemetry.mappingRunning && activeMap?.data;
    let mapMutated = false;

    for (let i = 0; i < rays; i++) {
      const angle = rTheta - Math.PI * 0.75 + (i * Math.PI * 1.5) / (rays - 1);
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      let hitDist = maxRange;
      let hitObstacle = false;

      for (let d = 0.08; d <= maxRange; d += step) {
        const wx = rx + cosA * d;
        const wy = ry + sinA * d;
        const gx = Math.floor((wx - ox) / resolution);
        const gy = Math.floor((wy - oy) / resolution);

        if (gx < 0 || gx >= width || gy < 0 || gy >= height) {
          hitDist = d;
          break;
        }

        const idx = gy * width + gx;
        if (gt.data[idx] === 100) {
          hitDist = d + (Math.random() - 0.5) * 0.02;
          hitObstacle = true;
          if (isMapping && activeMap.info.width === width && activeMap.data[idx] !== 100) {
            activeMap.data[idx] = 100;
            mapMutated = true;
          }
          break;
        } else if (isMapping && activeMap.info.width === width && activeMap.data[idx] === -1) {
          activeMap.data[idx] = 0;
          mapMutated = true;
        }
      }

      if (hitObstacle && hitDist >= 0.12) {
        scan.push({
          x: rx + cosA * hitDist,
          y: ry + sinA * hitDist,
          dist: hitDist
        });
      }
    }

    if (mapMutated) {
      this.telemetry.mapData = { ...activeMap };
    }
    this.telemetry.scanData = scan;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((fn) =>
      fn({ ...this.telemetry, status: this.status, isSimulated: this.isSimulated })
    );
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

  /** Resolve topic names and message types by inspecting live rosbridge topic graph when rosProtocol === 'auto' */
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

    // Smart topic name matching against live graph
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

    // 2. Global Costmap (Nav2 / move_base)
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

    // 4. AMCL Pose (primary localization pose)
    trackSub(profile.poseTopic, profile.poseType, (msg) => {
      const p = msg.pose.pose.position;
      const yaw = quaternionToYaw(msg.pose.pose.orientation);
      this.lastAmclStampMs = Date.now();
      this.telemetry.poseSource = 'amcl';
      this.telemetry.robotPose = { x: p.x, y: p.y, theta: yaw };
      this.updateRealNavigationProgress();
      this.notify();
    });

    // 5. Odometry Pose fallback (vital during SLAM mapping when AMCL is not running!)
    trackSub(profile.odomTopic, profile.odomType, (msg) => {
      // Only use /odom pose if /amcl_pose hasn't published in the last 3 seconds
      if (Date.now() - this.lastAmclStampMs < 3000) return;
      const p = msg.pose.pose.position;
      const yaw = quaternionToYaw(msg.pose.pose.orientation);
      this.telemetry.poseSource = 'odom';
      this.telemetry.robotPose = { x: p.x, y: p.y, theta: yaw };
      this.updateRealNavigationProgress();
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
        voltage: Number((msg.voltage || 12.0).toFixed(1)),
        current: Number((msg.current || 0.0).toFixed(1)),
        isCharging: msg.power_supply_status === 1,
        powerSupplyStatus: msg.power_supply_status || 2
      };
      this.notify();
    });
  }

  /** Advance multi-point waypoint queue on real robot arrival */
  updateRealNavigationProgress() {
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

  connect(
    url = 'ws://192.168.2.88:9090',
    { fallbackToSimulation = false, timeoutMs = 5000, rosProtocol } = {}
  ) {
    if (rosProtocol) {
      this.telemetry.rosProtocol = rosProtocol;
    }

    this.stopSimLoop();
    this.cleanupRosTopics();
    this.isSimulated = false;
    this.lastAmclStampMs = 0;
    this.telemetry.mapData = null;
    this.telemetry.costmapData = null;
    this.telemetry.scanData = [];
    this.telemetry.pathData = [];
    this.telemetry.targetPose = null;
    clearTimeout(this.connectionTimer);
    this.connectionTimer = null;

    if (this.ros) {
      const previousRos = this.ros;
      this.ros = null;
      previousRos.close();
    }

    this.status = 'connecting';
    this.addLog('info', `正在连接 ROS Bridge: ${url}`, {
      protocol: this.telemetry.rosProtocol,
      timeoutMs
    });
    this.notify();

    try {
      const ros = new ROSLIB.Ros({ url });
      this.ros = ros;

      const handleConnectionFailure = (error) => {
        if (this.ros !== ros) return;
        if (error) console.error('Error connecting to ROS:', error);

        clearTimeout(this.connectionTimer);
        this.connectionTimer = null;
        this.cleanupRosTopics();
        this.ros = null;
        ros.close();

        if (fallbackToSimulation) {
          this.addLog('warn', `ROS 连接未就绪，已自动切换至内置仿真模式 (${url})`);
          this.setSimulationMode(true);
        } else {
          this.status = 'disconnected';
          this.addLog('error', `ROS 连接断开: ${url}`);
          this.notify();
        }
      };

      this.connectionTimer = setTimeout(() => {
        handleConnectionFailure(new Error(`ROS connection timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      ros.on('connection', () => {
        if (this.ros !== ros) return;
        clearTimeout(this.connectionTimer);
        this.connectionTimer = null;
        this.status = 'connected';

        const pref = this.telemetry.rosProtocol || 'auto';
        if (pref !== 'auto') {
          const { protocol, profile } = this.resolveProfileFromGraph(pref);
          this.bindRosTopics(ros, protocol, profile);
          this.addLog('info', `已连接 ROS Bridge，协议栈锁定为 ${profile.label}`);
          this.notify();
          return;
        }

        // Auto-probe ROS 1 vs ROS 2 topic graph
        let graphResolved = false;
        const fallbackTimer = setTimeout(() => {
          if (graphResolved || this.ros !== ros) return;
          graphResolved = true;
          const { protocol, profile } = this.resolveProfileFromGraph('ros2');
          this.bindRosTopics(ros, protocol, profile);
          this.addLog('info', `已连接 ROS Bridge，默认启用 ${profile.label} 话题契约`);
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
            this.notify();
          },
          () => {
            if (graphResolved || this.ros !== ros) return;
            graphResolved = true;
            clearTimeout(fallbackTimer);
            const { protocol, profile } = this.resolveProfileFromGraph('ros2');
            this.bindRosTopics(ros, protocol, profile);
            this.addLog('info', `已连接 ROS Bridge (${profile.label})`);
            this.notify();
          }
        );
      });

      ros.on('error', handleConnectionFailure);

      ros.on('close', () => {
        if (this.ros !== ros) return;
        handleConnectionFailure();
      });
    } catch (e) {
      console.error('ROS connection error:', e);
      if (fallbackToSimulation) {
        this.addLog('warn', 'ROS WebSocket 初始化异常，已回退至仿真模式');
        this.setSimulationMode(true);
      } else {
        this.status = 'disconnected';
        this.addLog('error', `ROS 连接异常: ${e?.message || '未知错误'}`);
        this.notify();
      }
    }
  }

  disconnect() {
    clearTimeout(this.connectionTimer);
    this.connectionTimer = null;
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
      if (!this.ros || this.status !== 'connected' || this.isSimulated) {
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

  setSimulationMode(enable) {
    clearTimeout(this.connectionTimer);
    this.connectionTimer = null;

    if (enable && this.ros) {
      this.cleanupRosTopics();
      const ros = this.ros;
      this.ros = null;
      ros.close();
    }

    this.isSimulated = enable;
    if (enable) {
      this.initMockMap(this.telemetry.selectedMap);
      this.status = 'connected';
      this.addLog('info', '仿真引擎已启动 (10Hz 激光投射建图与多地图导航模拟)');
      this.startSimLoop();
    } else {
      this.stopSimLoop();
      this.status = 'disconnected';
      this.addLog('info', '已退出仿真模式');
    }
    this.notify();
  }

  startSimLoop() {
    this.stopSimLoop();
    let simTicks = 0;

    this.simInterval = setInterval(() => {
      if (!this.isSimulated) return;

      simTicks++;
      const dt = 0.1;
      const { linearVel, angularVel, robotPose, targetPose, battery } = this.telemetry;

      let newTheta = robotPose.theta + angularVel.z * dt;
      let newX = robotPose.x + linearVel.x * Math.cos(newTheta) * dt;
      let newY = robotPose.y + linearVel.x * Math.sin(newTheta) * dt;

      // Simulated autonomous navigation (with orientation alignment at destination!)
      if (
        this.telemetry.navigationRunning &&
        targetPose &&
        linearVel.x === 0 &&
        angularVel.z === 0
      ) {
        const dx = targetPose.x - newX;
        const dy = targetPose.y - newY;
        const dist = Math.hypot(dx, dy);

        this.telemetry.remainingDistance = dist;
        this.telemetry.estimatedTime = dist / 0.3;

        if (dist > 0.1) {
          const targetAngle = Math.atan2(dy, dx);
          const angleDiff = Math.atan2(Math.sin(targetAngle - newTheta), Math.cos(targetAngle - newTheta));
          newTheta += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), 1.2 * dt);
          newX += Math.cos(newTheta) * 0.22 * dt;
          newY += Math.sin(newTheta) * 0.22 * dt;
        } else {
          // Align final target orientation theta smoothly
          const goalTheta = targetPose.theta ?? newTheta;
          const yawErr = Math.atan2(Math.sin(goalTheta - newTheta), Math.cos(goalTheta - newTheta));
          if (Math.abs(yawErr) > 0.06) {
            newTheta += Math.sign(yawErr) * Math.min(Math.abs(yawErr), 1.5 * dt);
          } else {
            this.telemetry.remainingDistance = 0;
            this.telemetry.estimatedTime = 0;
            if (
              this.telemetry.multiPointNav &&
              this.telemetry.waypoints.length > 0 &&
              this.telemetry.activeWaypointIndex >= 0
            ) {
              this.telemetry.robotPose = { x: newX, y: newY, theta: newTheta };
              this.advanceWaypointQueue();
              return;
            }
          }
        }
      }

      // Refresh costmap periodically during active SLAM mapping
      if (this.telemetry.mappingRunning && simTicks % 15 === 0) {
        this.telemetry.costmapData = buildInflatedCostmap(this.telemetry.mapData);
      }

      if (simTicks % 50 === 0) {
        let newPct = battery.percentage;
        if (battery.isCharging) {
          newPct = Math.min(100, newPct + 1);
        } else {
          newPct = Math.max(5, newPct - 1);
        }
        const volt = (11.0 + (newPct / 100) * 1.6).toFixed(1);
        this.telemetry.battery = {
          ...battery,
          percentage: newPct,
          voltage: parseFloat(volt)
        };
      }

      this.telemetry.robotPose = { x: newX, y: newY, theta: newTheta };
      this.generateMockScan();
      this.notify();
    }, 100);
  }

  stopSimLoop() {
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
  }

  toggleSimCharging() {
    if (this.isSimulated) {
      this.telemetry.battery.isCharging = !this.telemetry.battery.isCharging;
      this.addLog(
        'info',
        this.telemetry.battery.isCharging ? '模拟电源：已接入充电桩' : '模拟电源：已断开充电器'
      );
      this.notify();
    }
  }

  publishTwist(linear = { x: 0, y: 0, z: 0 }, angular = { x: 0, y: 0, z: 0 }) {
    this.telemetry.linearVel = linear;
    this.telemetry.angularVel = angular;

    if (this.status === 'connected' && this.cmdVelTopic && !this.isSimulated) {
      const twist = new ROSLIB.Message({ linear, angular });
      this.cmdVelTopic.publish(twist);
    }
    this.notify();
  }

  cancelActiveRosGoal() {
    if (this.status === 'connected' && !this.isSimulated) {
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
  }

  emergencyStop() {
    this.cancelActiveRosGoal();
    this.telemetry.targetPose = null;
    this.telemetry.pathData = [];
    this.telemetry.activeWaypointIndex = -1;
    this.telemetry.remainingDistance = 0;
    this.telemetry.estimatedTime = 0;
    this.addLog('warn', '触发紧急制动 (/cmd_vel 归零，取消活动导航目标)');
    this.publishTwist({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
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
    this.telemetry.targetPose = { x, y, theta };

    const rx = this.telemetry.robotPose.x;
    const ry = this.telemetry.robotPose.y;

    if (this.isSimulated) {
      const points = [];
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const cx = (rx + x) / 2 + Math.sin(t * Math.PI) * 0.25;
        const cy = (ry + y) / 2 - Math.cos(t * Math.PI) * 0.25;
        const px = (1 - t) * (1 - t) * rx + 2 * (1 - t) * t * cx + t * t * x;
        const py = (1 - t) * (1 - t) * ry + 2 * (1 - t) * t * cy + t * t * y;
        points.push({ x: px, y: py });
      }
      this.telemetry.pathData = points;
      const arcDist = computePathLength(points, this.telemetry.robotPose);
      this.telemetry.remainingDistance = arcDist;
      this.telemetry.estimatedTime = arcDist / 0.22;
    } else {
      // Clear stale path until real Nav2 / move_base publishes the new plan
      this.telemetry.pathData = [];
      const dist = Math.hypot(x - rx, y - ry);
      this.telemetry.remainingDistance = dist;
      this.telemetry.estimatedTime = dist / 0.3;
    }

    if (this.status === 'connected' && this.goalTopic && !this.isSimulated) {
      const poseMsg = new ROSLIB.Message({
        header: this.buildROSHeader('map'),
        pose: {
          position: { x, y, z: 0 },
          orientation: yawToQuaternion(theta)
        }
      });
      this.goalTopic.publish(poseMsg);
    }
  }

  setGoalPose(x, y, theta = 0) {
    if (this.telemetry.multiPointNav) {
      this.addWaypoint(x, y, theta);
      return;
    }

    const deg = ((theta * 180) / Math.PI).toFixed(0);
    this.addLog('info', `下发单点导航目标 (${x.toFixed(2)}, ${y.toFixed(2)}, ${deg}°)`);
    this.dispatchSingleGoal(x, y, theta);
    this.notify();
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

    // Auto-start first waypoint if navigation is running and idle
    if (this.telemetry.navigationRunning && this.telemetry.activeWaypointIndex === -1) {
      this.telemetry.activeWaypointIndex = this.telemetry.waypoints.length - 1;
      this.dispatchSingleGoal(wp.x, wp.y, wp.theta);
    }
    this.notify();
  }

  startWaypointPatrol() {
    if (this.telemetry.waypoints.length === 0) return false;
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
    this.telemetry.robotPose = { x, y, theta };
    const deg = ((theta * 180) / Math.PI).toFixed(0);
    this.addLog('info', `标定机器人初始位姿 (${x.toFixed(2)}, ${y.toFixed(2)}, ${deg}°)`);

    if (this.status === 'connected' && this.initialPoseTopic && !this.isSimulated) {
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
    } else if (this.isSimulated) {
      this.generateMockScan();
    }
    this.notify();
  }

  async toggleMappingMode() {
    const nextRunning = !this.telemetry.mappingRunning;
    this.telemetry.mappingRunning = nextRunning;

    if (this.isSimulated) {
      if (nextRunning) {
        // Reset active map to unexplored (-1) so simulated LiDAR raycasting builds the map live!
        const gt = this.simGroundTruthMap;
        this.telemetry.mapData = {
          info: { ...gt.info },
          data: new Array(gt.info.width * gt.info.height).fill(-1)
        };
        this.generateMockScan();
        this.telemetry.costmapData = buildInflatedCostmap(this.telemetry.mapData);
        this.addLog('info', 'SLAM 实时仿真建图已开启：请遥控移动机器人探索未知栅格');
      } else {
        this.telemetry.costmapData = buildInflatedCostmap(this.telemetry.mapData);
        this.addLog('info', 'SLAM 仿真建图已停止，可输入名称持久化保存当前地图');
      }
      this.notify();
      return;
    }

    // Real ROS mode: notify bringup topic + attempt slam_toolbox pause/resume service
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
          ? '已发布开始建图控制信号 (/bot_controller/mapping_cmd)'
          : '已发布停止建图控制信号 (/bot_controller/mapping_cmd)'
      );
    }
    this.notify();
  }

  async saveMap(mapName) {
    const cleanName = (mapName || '').trim();
    if (!cleanName) return { ok: false, mode: 'invalid' };

    if (!this.telemetry.availableMaps.includes(cleanName)) {
      this.telemetry.availableMaps = [cleanName, ...this.telemetry.availableMaps];
    }
    this.telemetry.selectedMap = cleanName;

    // Persist current map snapshot locally for instant switching
    if (this.telemetry.mapData) {
      this.mockMapStore.set(cleanName, this.cloneMap(this.telemetry.mapData));
    }

    if (this.status === 'connected' && !this.isSimulated) {
      try {
        await this.callRosService('/map_saver/save_map', 'nav2_msgs/srv/SaveMap', {
          map_topic: '/map',
          map_url: cleanName,
          image_format: 'pgm',
          map_mode: 'trinary',
          free_thresh: 0.25,
          occupied_thresh: 0.65
        });
        this.addLog('info', `已通过 Nav2 map_saver 保存地图: ${cleanName}`);
        this.notify();
        return { ok: true, mode: 'nav2' };
      } catch {
        try {
          await this.callRosService('/slam_toolbox/save_map', 'slam_toolbox/srv/SaveMap', {
            name: { data: cleanName }
          });
          this.addLog('info', `已通过 slam_toolbox 保存地图: ${cleanName}`);
          this.notify();
          return { ok: true, mode: 'slam_toolbox' };
        } catch {
          this.addLog('warn', `远端未开启存图服务，已将「${cleanName}」缓存至前端地图库（支持直接导出 YAML/PGM）`);
          this.notify();
          return { ok: true, mode: 'local' };
        }
      }
    }

    this.addLog('info', `仿真栅格地图已保存至地图库: ${cleanName}`);
    this.notify();
    return { ok: true, mode: 'sim' };
  }

  /** Export current OccupancyGrid as standard ROS .pgm + .yaml files directly from browser */
  exportCurrentMapFiles(baseName = 'map') {
    const mapData = this.telemetry.mapData;
    if (!mapData?.info || !mapData?.data) return false;

    const clean = (baseName || this.telemetry.selectedMap || 'bot_map').trim();
    const { width, height, resolution, origin } = mapData.info;
    const ox = origin?.position?.x ?? 0;
    const oy = origin?.position?.y ?? 0;
    const yaw = quaternionToYaw(origin?.orientation);

    // Build standard binary P5 PGM (top-to-bottom row order per ROS map_saver convention)
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
    if (this.status === 'connected' && !this.isSimulated) {
      try {
        const res = await this.callRosService('/bot_controller/list_maps', 'std_srvs/srv/Trigger', {});
        if (res?.message) {
          const parsed = res.message
            .split(/[,;\s]+/)
            .map((s) => s.trim())
            .filter(Boolean);
          if (parsed.length > 0) {
            this.telemetry.availableMaps = [...new Set([...parsed, ...this.telemetry.availableMaps])];
          }
        }
      } catch {
        // Keep current map list when custom list service is absent
      }
    }
    this.addLog('info', `已同步可用地图列表（共 ${this.telemetry.availableMaps.length} 张）`);
    this.notify();
    return this.telemetry.availableMaps;
  }

  toggleNavigationMode() {
    const nextRunning = !this.telemetry.navigationRunning;
    this.telemetry.navigationRunning = nextRunning;

    if (!nextRunning) {
      this.cancelActiveRosGoal();
      this.publishTwist({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
      this.addLog('info', '自主导航已停止，已取消活动导航目标并刹停底盘');
    } else {
      this.addLog('info', '自主导航已就绪');
      if (this.telemetry.multiPointNav && this.telemetry.waypoints.length > 0 && !this.telemetry.targetPose) {
        this.startWaypointPatrol();
        return;
      }
    }
    this.notify();
  }

  async setSelectedMap(mapName) {
    this.telemetry.selectedMap = mapName;
    this.telemetry.targetPose = null;
    this.telemetry.pathData = [];
    this.telemetry.remainingDistance = 0;
    this.telemetry.estimatedTime = 0;

    if (this.isSimulated) {
      this.telemetry.mappingRunning = false;
      this.initMockMap(mapName);
      this.addLog('info', `已切换仿真栅格地图为: ${mapName}`);
      this.notify();
      return;
    }

    if (this.status === 'connected') {
      try {
        await this.callRosService('/map_server/load_map', 'nav2_msgs/srv/LoadMap', {
          map_url: `${mapName}.yaml`
        });
        this.addLog('info', `已请求 Nav2 map_server 加载地图: ${mapName}.yaml`);
      } catch {
        if (this.mockMapStore.has(mapName)) {
          this.telemetry.mapData = this.cloneMap(this.mockMapStore.get(mapName));
        }
        this.addLog('info', `已切换活动地图标识为: ${mapName}`);
      }
    }
    this.notify();
  }
}

export const rosService = new ROSService();
