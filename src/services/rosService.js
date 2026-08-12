import ROSLIB from 'roslib';

class ROSService {
  constructor() {
    this.ros = null;
    this.cmdVelTopic = null;
    this.goalTopic = null;
    this.initialPoseTopic = null;
    this.mapTopic = null;
    this.scanTopic = null;
    this.poseTopic = null;
    this.pathTopic = null;
    this.batteryTopic = null;

    this.status = 'disconnected'; // 'connected' | 'connecting' | 'disconnected'
    this.isSimulated = false; // Demo / Simulation mode
    this.listeners = new Set();

    // Telemetry state
    this.telemetry = {
      linearVel: { x: 0, y: 0, z: 0 },
      angularVel: { x: 0, y: 0, z: 0 },
      robotPose: { x: 0, y: 0, theta: 0 },
      mapData: null,
      scanData: [],
      pathData: [],
      targetPose: null,
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
        powerSupplyStatus: 2 // 1: CHARGING, 2: DISCHARGING, 3: NOT_CHARGING, 4: FULL
      }
    };

    // Initialize mock map for simulation mode
    this.initMockMap();
    this.simInterval = null;
    this.connectionTimer = null;
  }

  initMockMap() {
    const width = 120;
    const height = 120;
    const resolution = 0.05;
    const data = new Array(width * height).fill(-1); // -1 = unknown, 0 = free, 100 = obstacle

    // Generate room boundaries and inner walls/obstacles
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        // Outer walls
        if (x < 5 || x > width - 6 || y < 5 || y > height - 6) {
          data[idx] = 100;
        } else if ((x >= 25 && x <= 28 && y >= 20 && y <= 80) ||
                   (x >= 65 && x <= 95 && y >= 35 && y <= 38) ||
                   (x >= 50 && x <= 53 && y >= 60 && y <= 105) ||
                   (x >= 75 && x <= 78 && y >= 15 && y <= 55)) {
          data[idx] = 100; // Inner obstacles/walls
        } else {
          // Free space with subtle gradient/inflation
          data[idx] = 0;
        }
      }
    }

    this.telemetry.mapData = {
      info: {
        width,
        height,
        resolution,
        origin: { position: { x: -width * resolution / 2, y: -height * resolution / 2 } }
      },
      data
    };

    // Default simulation robot pose
    this.telemetry.robotPose = { x: 0, y: -0.5, theta: Math.PI / 4 };
    this.generateMockScan();
  }

  generateMockScan() {
    const rays = 180;
    const scan = [];
    const { x: rx, y: ry, theta: rTheta } = this.telemetry.robotPose;

    for (let i = 0; i < rays; i++) {
      const angle = rTheta - Math.PI / 2 + (i * Math.PI) / rays;
      let dist = 2.5 + Math.sin(angle * 3) * 0.4 + (Math.random() - 0.5) * 0.05;
      if (dist < 0.2) dist = 0.2;
      scan.push({
        x: rx + Math.cos(angle) * dist,
        y: ry + Math.sin(angle) * dist,
        dist
      });
    }
    this.telemetry.scanData = scan;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((fn) => fn({ ...this.telemetry, status: this.status, isSimulated: this.isSimulated }));
  }

  connect(url = 'ws://192.168.2.88:9090', { fallbackToSimulation = false, timeoutMs = 5000 } = {}) {
    this.stopSimLoop();
    this.isSimulated = false;
    this.telemetry.mapData = null;
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
    this.notify();

    try {
      const ros = new ROSLIB.Ros({ url });
      this.ros = ros;

      const handleConnectionFailure = (error) => {
        if (this.ros !== ros) return;
        if (error) console.error('Error connecting to ROS:', error);

        clearTimeout(this.connectionTimer);
        this.connectionTimer = null;
        this.ros = null;
        ros.close();

        if (fallbackToSimulation) {
          this.setSimulationMode(true);
        } else {
          this.status = 'disconnected';
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
        console.log('Connected to ROS Bridge');
        this.status = 'connected';

        // Set up publishers
        this.cmdVelTopic = new ROSLIB.Topic({
          ros,
          name: '/cmd_vel',
          messageType: 'geometry_msgs/Twist'
        });

        this.goalTopic = new ROSLIB.Topic({
          ros,
          name: '/move_base_simple/goal',
          messageType: 'geometry_msgs/PoseStamped'
        });

        this.initialPoseTopic = new ROSLIB.Topic({
          ros,
          name: '/initialpose',
          messageType: 'geometry_msgs/PoseWithCovarianceStamped'
        });

        // Subscribe to map
        this.mapTopic = new ROSLIB.Topic({
          ros,
          name: '/map',
          messageType: 'nav_msgs/OccupancyGrid'
        });

        this.mapTopic.subscribe((message) => {
          this.telemetry.mapData = message;
          this.notify();
        });

        // Subscribe to scan
        this.scanTopic = new ROSLIB.Topic({
          ros,
          name: '/scan',
          messageType: 'sensor_msgs/LaserScan'
        });

        this.scanTopic.subscribe((scan) => {
          const scanPoints = [];
          let angle = scan.angle_min;
          for (let i = 0; i < scan.ranges.length; i++) {
            const r = scan.ranges[i];
            if (r >= scan.range_min && r <= scan.range_max) {
              const px = this.telemetry.robotPose.x + r * Math.cos(this.telemetry.robotPose.theta + angle);
              const py = this.telemetry.robotPose.y + r * Math.sin(this.telemetry.robotPose.theta + angle);
              scanPoints.push({ x: px, y: py, dist: r });
            }
            angle += scan.angle_increment;
          }
          this.telemetry.scanData = scanPoints;
          this.notify();
        });

        // Subscribe to pose
        this.poseTopic = new ROSLIB.Topic({
          ros,
          name: '/amcl_pose',
          messageType: 'geometry_msgs/PoseWithCovarianceStamped'
        });

        this.poseTopic.subscribe((msg) => {
          const p = msg.pose.pose.position;
          const q = msg.pose.pose.orientation;
          const siny_cosp = 2 * (q.w * q.z + q.x * q.y);
          const cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
          const yaw = Math.atan2(siny_cosp, cosy_cosp);
          this.telemetry.robotPose = { x: p.x, y: p.y, theta: yaw };
          this.notify();
        });

        // Subscribe to path
        this.pathTopic = new ROSLIB.Topic({
          ros,
          name: '/move_base/NavfnROS/plan',
          messageType: 'nav_msgs/Path'
        });

        this.pathTopic.subscribe((msg) => {
          this.telemetry.pathData = msg.poses.map((p) => ({
            x: p.pose.position.x,
            y: p.pose.position.y
          }));
          this.notify();
        });

        // Subscribe to battery (/battery_state)
        this.batteryTopic = new ROSLIB.Topic({
          ros,
          name: '/battery_state',
          messageType: 'sensor_msgs/BatteryState'
        });

        this.batteryTopic.subscribe((msg) => {
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

        this.notify();
      });

      ros.on('error', handleConnectionFailure);

      ros.on('close', () => {
        if (this.ros !== ros) return;
        console.log('Disconnected from ROS');
        handleConnectionFailure();
      });
    } catch (e) {
      console.error('ROS connection error:', e);
      if (fallbackToSimulation) {
        this.setSimulationMode(true);
      } else {
        this.status = 'disconnected';
        this.notify();
      }
    }
  }

  disconnect() {
    clearTimeout(this.connectionTimer);
    this.connectionTimer = null;
    if (this.ros) {
      const ros = this.ros;
      this.ros = null;
      ros.close();
    }
    this.status = 'disconnected';
    this.notify();
  }

  setSimulationMode(enable) {
    clearTimeout(this.connectionTimer);
    this.connectionTimer = null;

    if (enable && this.ros) {
      const ros = this.ros;
      this.ros = null;
      ros.close();
    }

    this.isSimulated = enable;
    if (enable) {
      this.initMockMap();
      this.status = 'connected';
      this.startSimLoop();
    } else {
      this.stopSimLoop();
      this.status = 'disconnected';
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

      // Simulated navigation movement
      if (this.telemetry.navigationRunning && targetPose && linearVel.x === 0 && angularVel.z === 0) {
        const dx = targetPose.x - newX;
        const dy = targetPose.y - newY;
        const dist = Math.hypot(dx, dy);

        this.telemetry.remainingDistance = dist;
        this.telemetry.estimatedTime = dist / 0.3;

        if (dist > 0.1) {
          const targetAngle = Math.atan2(dy, dx);
          const angleDiff = targetAngle - newTheta;
          newTheta += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), 0.8 * dt);
          newX += Math.cos(newTheta) * 0.15 * dt;
          newY += Math.sin(newTheta) * 0.15 * dt;
        } else {
          this.telemetry.remainingDistance = 0;
          this.telemetry.estimatedTime = 0;
        }
      }

      // Simulate battery voltage and percentage slight fluctuations / drain
      if (simTicks % 50 === 0) { // every 5s
        let newPct = battery.percentage;
        if (battery.isCharging) {
          newPct = Math.min(100, newPct + 1);
        } else {
          // Slow drain
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
      this.notify();
    }
  }

  // Publish velocity command (/cmd_vel)
  publishTwist(linear = { x: 0, y: 0, z: 0 }, angular = { x: 0, y: 0, z: 0 }) {
    this.telemetry.linearVel = linear;
    this.telemetry.angularVel = angular;

    if (this.status === 'connected' && this.cmdVelTopic && !this.isSimulated) {
      const twist = new ROSLIB.Message({
        linear,
        angular
      });
      this.cmdVelTopic.publish(twist);
    }
    this.notify();
  }

  // Set Nav Goal (/move_base_simple/goal)
  setGoalPose(x, y, theta = 0) {
    this.telemetry.targetPose = { x, y, theta };

    const rx = this.telemetry.robotPose.x;
    const ry = this.telemetry.robotPose.y;

    const points = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = (rx + x) / 2 + Math.sin(t * Math.PI) * 0.3;
      const cy = (ry + y) / 2 - Math.cos(t * Math.PI) * 0.3;
      const px = (1 - t) * (1 - t) * rx + 2 * (1 - t) * t * cx + t * t * x;
      const py = (1 - t) * (1 - t) * ry + 2 * (1 - t) * t * cy + t * t * y;
      points.push({ x: px, y: py });
    }
    this.telemetry.pathData = points;

    const dist = Math.hypot(x - rx, y - ry);
    this.telemetry.remainingDistance = dist;
    this.telemetry.estimatedTime = dist / 0.3;

    if (this.status === 'connected' && this.goalTopic && !this.isSimulated) {
      const poseMsg = new ROSLIB.Message({
        header: {
          frame_id: 'map',
          stamp: { secs: Math.floor(Date.now() / 1000), nsecs: 0 }
        },
        pose: {
          position: { x, y, z: 0 },
          orientation: {
            x: 0,
            y: 0,
            z: Math.sin(theta / 2),
            w: Math.cos(theta / 2)
          }
        }
      });
      this.goalTopic.publish(poseMsg);
    }
    this.notify();
  }

  // Set Initial Pose (/initialpose)
  setInitialPose(x, y, theta = 0) {
    this.telemetry.robotPose = { x, y, theta };
    if (this.status === 'connected' && this.initialPoseTopic && !this.isSimulated) {
      const poseMsg = new ROSLIB.Message({
        header: {
          frame_id: 'map',
          stamp: { secs: Math.floor(Date.now() / 1000), nsecs: 0 }
        },
        pose: {
          pose: {
            position: { x, y, z: 0 },
            orientation: { x: 0, y: 0, z: Math.sin(theta / 2), w: Math.cos(theta / 2) }
          },
          covariance: new Array(36).fill(0)
        }
      });
      this.initialPoseTopic.publish(poseMsg);
    }
    this.notify();
  }

  toggleMappingMode() {
    this.telemetry.mappingRunning = !this.telemetry.mappingRunning;
    this.notify();
  }

  toggleNavigationMode() {
    this.telemetry.navigationRunning = !this.telemetry.navigationRunning;
    this.notify();
  }

  setSelectedMap(mapName) {
    this.telemetry.selectedMap = mapName;
    this.notify();
  }
}

export const rosService = new ROSService();
