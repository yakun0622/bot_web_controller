import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { spawn, execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { MavlinkSerialDriver } from './mavlink-serial.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKER_SCRIPT = path.join(__dirname, 'ros2-bridge-worker.py');

export const BOT_GATEWAY_PATH = '/api/bot';

function detectRosSetupScript() {
  const distros = ['humble', 'jazzy', 'iron', 'foxy'];
  for (const d of distros) {
    const p = `/opt/ros/${d}/setup.bash`;
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function detectRosWorkspaceSetup() {
  const candidates = [
    process.env.BOT_ROS_WS && `${process.env.BOT_ROS_WS}/install/setup.bash`,
    '/root/ros2_ws/install/setup.bash',
    '/root/xuegeros_ws/install/setup.bash',
    '/home/xuegeros/xuegeros_ws/install/setup.bash',
    '/home/ubuntu/ros2_ws/install/setup.bash'
  ].filter(Boolean);
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function buildRosShellPrefix() {
  const parts = [];
  const rosSetup = detectRosSetupScript();
  const wsSetup = detectRosWorkspaceSetup();
  if (rosSetup) parts.push(`source '${rosSetup}'`);
  if (wsSetup) parts.push(`source '${wsSetup}'`);
  return parts.length > 0 ? `${parts.join(' && ')} && ` : '';
}

const MANAGED_NODE_DEFS = {
  driver: {
    id: 'driver',
    label: '串口底盘与TF驱动',
    desc: 'mavlink_bridge (/dev/ttyUSB0) + xuegecar_bringup',
    command:
      'ros2 launch xuegecar_mavlink_bridge mavlink_bridge.launch.py & PID1=$!; ros2 launch xuegecar_bringup xuegecar_bringup.launch.py & PID2=$!; trap "kill -TERM $PID1 $PID2 2>/dev/null || true" INT TERM; wait'
  },
  slam: {
    id: 'slam',
    label: 'SLAM 激光建图',
    desc: 'slam_gmapping 实时栅格建图',
    command: 'ros2 launch slam_gmapping slam_gmapping.launch.py'
  },
  nav2: {
    id: 'nav2',
    label: 'Nav2 自主导航',
    desc: 'xuegecar_navigation2 路径规划与避障',
    command: 'ros2 launch xuegecar_navigation2 navigation2.launch.py'
  },
  camera: {
    id: 'camera',
    label: 'ROS 相机采集',
    desc: 'xuegecar_camera (/camera/image_raw/compressed)',
    command: 'ros2 launch xuegecar_camera http_video_publisher.launch.py'
  }
};

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, *');
}

function writeJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk.toString();
      if (raw.length > 1024 * 256) {
        reject(new Error('payload too large'));
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

/**
 * Singleton W152D Hardware & ROS 2 Coordinator
 */
class W152DBotHub {
  constructor() {
    this.driverMode = process.env.BOT_DRIVER_MODE || 'mavlink_serial'; // 'mavlink_serial' | 'local_ros2'
    this.serialPort = process.env.BOT_SERIAL_PORT || '/dev/ttyUSB0';
    this.serialBaud = Number(process.env.BOT_SERIAL_BAUD || 921600);

    this.sseClients = new Set();
    this.mjpegClients = new Set();
    this.latestJpegBuffer = null;

    // Cached snapshot for newly connected SSE browser tabs
    this.snapshot = {
      driverMode: this.driverMode,
      serialConnected: false,
      ros2Connected: false,
      serialPort: this.serialPort,
      serialBaud: this.serialBaud,
      rosAvailable: Boolean(detectRosSetupScript()),
      serialDeviceExists: fs.existsSync(this.serialPort),
      robotPose: { x: 0, y: 0, theta: 0 },
      poseSource: 'none',
      scanData: [],
      pathData: [],
      mapData: null,
      costmapData: null,
      battery: null,
      managedNodes: this.getManagedNodesStatus()
    };

    // 1. Direct USB Serial MAVLink driver
    this.serialDriver = new MavlinkSerialDriver({
      port: this.serialPort,
      baudrate: this.serialBaud
    });
    this.bindSerialEvents();

    // 2. Local ROS 2 rclpy worker & Launch Process Manager
    this.rosWorker = null;
    this.rosWorkerTimer = null;
    this.managedProcs = new Map();

    // Start initial driver mode
    if (this.driverMode === 'local_ros2' && detectRosSetupScript()) {
      this.startRosWorker();
    } else {
      this.driverMode = 'mavlink_serial';
      this.snapshot.driverMode = 'mavlink_serial';
      this.serialDriver.start();
    }
  }

  getManagedNodesStatus() {
    const out = {};
    for (const [key, def] of Object.entries(MANAGED_NODE_DEFS)) {
      const proc = this.managedProcs?.get(key);
      out[key] = {
        id: key,
        label: def.label,
        desc: def.desc,
        running: Boolean(proc && proc.exitCode === null && !proc.killed)
      };
    }
    return out;
  }

  broadcast(event, data) {
    if (this.sseClients.size === 0) return;
    const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of this.sseClients) {
      if (!res.writableEnded) {
        res.write(msg);
      }
    }
  }

  broadcastStatus() {
    this.snapshot.serialDeviceExists = fs.existsSync(this.serialPort);
    this.snapshot.rosAvailable = Boolean(detectRosSetupScript());
    this.snapshot.managedNodes = this.getManagedNodesStatus();
    this.broadcast('status', {
      driverMode: this.driverMode,
      serialConnected: this.snapshot.serialConnected,
      ros2Connected: this.snapshot.ros2Connected,
      serialPort: this.serialPort,
      serialBaud: this.serialBaud,
      serialDeviceExists: this.snapshot.serialDeviceExists,
      rosAvailable: this.snapshot.rosAvailable,
      managedNodes: this.snapshot.managedNodes
    });
  }

  bindSerialEvents() {
    let lastOdomBroadcast = 0;
    this.serialDriver.on('status', ({ connected }) => {
      this.snapshot.serialConnected = connected;
      this.snapshot.poseSource = connected ? 'mavlink_odom' : 'none';
      this.broadcastStatus();
    });

    this.serialDriver.on('odom', ({ pose, twist, trail }) => {
      this.snapshot.robotPose = pose;
      this.snapshot.poseSource = 'mavlink_odom';
      this.snapshot.pathData = trail;
      const now = Date.now();
      if (now - lastOdomBroadcast >= 80) {
        lastOdomBroadcast = now;
        this.broadcast('pose', { pose, twist, source: 'mavlink_odom', trail });
      }
    });

    this.serialDriver.on('scan', (points) => {
      this.snapshot.scanData = points;
      this.broadcast('scan', points);
    });

    this.serialDriver.on('battery', (battery) => {
      this.snapshot.battery = battery;
      this.broadcast('battery', battery);
    });
  }

  switchDriverMode(nextMode) {
    const target = nextMode === 'local_ros2' ? 'local_ros2' : 'mavlink_serial';
    if (target === this.driverMode) return { ok: true, driverMode: this.driverMode };

    if (target === 'local_ros2') {
      // Release /dev/ttyUSB0 first so xuegecar_mavlink_bridge can open it without EBUSY!
      this.serialDriver.stop();
      this.snapshot.serialConnected = false;
      this.driverMode = 'local_ros2';
      this.snapshot.driverMode = 'local_ros2';
      this.startRosWorker();
    } else {
      // Stop ROS 2 serial driver if running so Node can open /dev/ttyUSB0 cleanly
      this.stopManagedNode('driver');
      this.stopRosWorker();
      this.snapshot.ros2Connected = false;
      this.snapshot.mapData = null;
      this.snapshot.costmapData = null;
      this.driverMode = 'mavlink_serial';
      this.snapshot.driverMode = 'mavlink_serial';
      this.serialDriver.start();
    }

    this.broadcastStatus();
    return { ok: true, driverMode: this.driverMode };
  }

  updateSerialConfig({ port, baudrate }) {
    if (port) {
      this.serialPort = port.startsWith('/') ? port : `/dev/${port}`;
      this.snapshot.serialPort = this.serialPort;
    }
    if (baudrate) {
      this.serialBaud = Number(baudrate) || 921600;
      this.snapshot.serialBaud = this.serialBaud;
    }
    this.serialDriver.configure({ port: this.serialPort, baudrate: this.serialBaud });
    this.broadcastStatus();
    return { ok: true, serialPort: this.serialPort, serialBaud: this.serialBaud };
  }

  // ==================== Local ROS 2 rclpy Worker ====================
  startRosWorker() {
    if (this.rosWorker || this.driverMode !== 'local_ros2') return;
    if (!detectRosSetupScript()) {
      this.broadcast('log', {
        level: 'warn',
        message: '未检测到 /opt/ros/humble，无法启动本机 ROS 2 桥接进程'
      });
      return;
    }

    const prefix = buildRosShellPrefix();
    const proc = spawn('bash', ['-lc', `${prefix}exec python3 '${WORKER_SCRIPT}'`], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    this.rosWorker = proc;

    const rl = readline.createInterface({ input: proc.stdout });
    rl.on('line', (line) => {
      try {
        const msg = JSON.parse(line);
        this.handleRosWorkerEvent(msg.type, msg.data);
      } catch {
        // ignore non-JSON stdout banners
      }
    });

    proc.stderr.on('data', (chunk) => {
      const text = chunk.toString().trim();
      if (text) {
        this.broadcast('log', { level: 'warn', message: `[rclpy] ${text.slice(0, 220)}` });
      }
    });

    proc.on('exit', () => {
      if (this.rosWorker === proc) {
        this.rosWorker = null;
        this.snapshot.ros2Connected = false;
        this.broadcastStatus();
        if (this.driverMode === 'local_ros2') {
          this.rosWorkerTimer = setTimeout(() => {
            this.rosWorkerTimer = null;
            this.startRosWorker();
          }, 2500);
        }
      }
    });
  }

  stopRosWorker() {
    if (this.rosWorkerTimer) {
      clearTimeout(this.rosWorkerTimer);
      this.rosWorkerTimer = null;
    }
    if (this.rosWorker) {
      const proc = this.rosWorker;
      this.rosWorker = null;
      try {
        proc.kill('SIGTERM');
      } catch {}
    }
    this.snapshot.ros2Connected = false;
  }

  sendToRosWorker(payload) {
    if (!this.rosWorker || !this.rosWorker.stdin?.writable) return false;
    try {
      this.rosWorker.stdin.write(`${JSON.stringify(payload)}\n`);
      return true;
    } catch {
      return false;
    }
  }

  handleRosWorkerEvent(type, data) {
    switch (type) {
      case 'ready':
        this.snapshot.ros2Connected = true;
        this.broadcastStatus();
        break;
      case 'pose':
        this.snapshot.robotPose = data.pose;
        this.snapshot.poseSource = data.source || 'ros2';
        this.broadcast('pose', data);
        break;
      case 'scan':
        this.snapshot.scanData = data;
        this.broadcast('scan', data);
        break;
      case 'map':
        this.snapshot.mapData = data;
        this.broadcast('map', data);
        break;
      case 'costmap':
        this.snapshot.costmapData = data;
        this.broadcast('costmap', data);
        break;
      case 'path':
        this.snapshot.pathData = data;
        this.broadcast('path', data);
        break;
      case 'battery':
        this.snapshot.battery = data;
        this.broadcast('battery', data);
        break;
      case 'jpeg': {
        const jpegBuf = Buffer.from(data, 'base64');
        this.latestJpegBuffer = jpegBuf;
        for (const res of this.mjpegClients) {
          if (!res.writableEnded) {
            res.write(
              `--botcam\r\nContent-Type: image/jpeg\r\nContent-Length: ${jpegBuf.length}\r\n\r\n`
            );
            res.write(jpegBuf);
            res.write('\r\n');
          }
        }
        break;
      }
      case 'log':
        this.broadcast('log', data);
        break;
      default:
        break;
    }
  }

  // ==================== W152D Process Group Launcher ====================
  startManagedNode(nodeId) {
    const def = MANAGED_NODE_DEFS[nodeId];
    if (!def) return { ok: false, error: `未知节点: ${nodeId}` };
    if (!detectRosSetupScript()) {
      return { ok: false, error: '当前上位机未安装 /opt/ros/humble' };
    }

    // Starting ROS2 driver or SLAM/Nav2 automatically switches gateway to local_ros2
    if (this.driverMode !== 'local_ros2') {
      this.switchDriverMode('local_ros2');
    }

    const existing = this.managedProcs.get(nodeId);
    if (existing && existing.exitCode === null && !existing.killed) {
      return { ok: true, status: 'already_running' };
    }

    const prefix = buildRosShellPrefix();
    const child = spawn('bash', ['-lc', `${prefix}${def.command}`], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    this.managedProcs.set(nodeId, child);

    const logChunk = (buf) => {
      const line = buf.toString().trim().split('\n').pop();
      if (line) {
        this.broadcast('log', { level: 'info', message: `[${def.label}] ${line.slice(0, 200)}` });
      }
    };
    child.stdout.on('data', logChunk);
    child.stderr.on('data', logChunk);
    child.on('exit', (code) => {
      this.broadcast('log', {
        level: code === 0 || code === null ? 'info' : 'warn',
        message: `节点「${def.label}」已退出 (code=${code ?? 'signal'})`
      });
      this.broadcastStatus();
    });

    this.broadcastStatus();
    return { ok: true, status: 'started' };
  }

  stopManagedNode(nodeId) {
    const proc = this.managedProcs.get(nodeId);
    if (!proc) return { ok: true, status: 'not_running' };
    this.managedProcs.delete(nodeId);

    try {
      // Kill entire detached process group (-pid) cleanly just like xuegecar_qt_gui!
      if (proc.pid) {
        process.kill(-proc.pid, 'SIGTERM');
        setTimeout(() => {
          try {
            process.kill(-proc.pid, 'SIGKILL');
          } catch {}
        }, 1200);
      }
    } catch {
      try {
        proc.kill('SIGKILL');
      } catch {}
    }

    this.broadcastStatus();
    return { ok: true, status: 'stopped' };
  }

  // ==================== Unified Command Dispatcher ====================
  handleAction(body = {}) {
    const { action } = body;

    if (action === 'set_driver') {
      return this.switchDriverMode(body.driverMode);
    }

    if (action === 'serial_config') {
      return this.updateSerialConfig({ port: body.port, baudrate: body.baudrate });
    }

    if (action === 'node_action') {
      return body.op === 'stop'
        ? this.stopManagedNode(body.nodeId)
        : this.startManagedNode(body.nodeId);
    }

    if (action === 'cmd_vel') {
      const lx = Number(body.lx) || 0;
      const ly = Number(body.ly) || 0;
      const az = Number(body.az) || 0;
      if (this.driverMode === 'mavlink_serial') {
        return { ok: this.serialDriver.sendVelocity(lx, ly, az), via: 'mavlink_serial' };
      }
      return { ok: this.sendToRosWorker({ action: 'cmd_vel', lx, ly, az }), via: 'local_ros2' };
    }

    if (action === 'estop') {
      if (this.driverMode === 'mavlink_serial') {
        this.serialDriver.sendVelocity(0, 0, 0);
        return { ok: true };
      }
      this.sendToRosWorker({ action: 'cmd_vel', lx: 0, ly: 0, az: 0 });
      return { ok: true };
    }

    if (action === 'goal_pose' || action === 'initial_pose' || action === 'save_map' || action === 'load_map') {
      if (this.driverMode !== 'local_ros2') {
        return { ok: false, error: '当前为纯串口直连模式，请先切换至「ROS 2 导航直通」并启动 SLAM / Nav2' };
      }
      return { ok: this.sendToRosWorker(body) };
    }

    if (action === 'clear_trail') {
      this.serialDriver.trail = [];
      this.snapshot.pathData = [];
      this.broadcast('path', []);
      return { ok: true };
    }

    return { ok: false, error: `unknown action: ${action}` };
  }

  shutdown() {
    this.serialDriver.stop();
    this.stopRosWorker();
    for (const key of this.managedProcs.keys()) {
      this.stopManagedNode(key);
    }
  }
}

let sharedHub = null;
export function shutdownBotGateway() {
  if (sharedHub) {
    sharedHub.shutdown();
    sharedHub = null;
  }
}

function getHub() {
  if (!sharedHub) {
    sharedHub = new W152DBotHub();
    process.once('exit', () => sharedHub?.shutdown());
  }
  return sharedHub;
}

export function createBotGatewayMiddleware({ pathPrefix = BOT_GATEWAY_PATH } = {}) {
  return async (req, res, next) => {
    let url;
    try {
      url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    } catch {
      return next?.();
    }

    if (!url.pathname.startsWith(pathPrefix)) {
      return next?.();
    }

    setCors(res);
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const hub = getHub();
    const subpath = url.pathname.slice(pathPrefix.length) || '/';

    if (req.method === 'GET' && (subpath === '/' || subpath === '/health')) {
      hub.snapshot.serialDeviceExists = fs.existsSync(hub.serialPort);
      hub.snapshot.rosAvailable = Boolean(detectRosSetupScript());
      hub.snapshot.managedNodes = hub.getManagedNodesStatus();
      writeJson(res, 200, {
        ok: true,
        gateway: 'w152d-direct',
        driverMode: hub.driverMode,
        serialConnected: hub.snapshot.serialConnected,
        ros2Connected: hub.snapshot.ros2Connected,
        serialPort: hub.serialPort,
        serialBaud: hub.serialBaud,
        serialDeviceExists: hub.snapshot.serialDeviceExists,
        rosAvailable: hub.snapshot.rosAvailable,
        managedNodes: hub.snapshot.managedNodes
      });
      return;
    }

    if (req.method === 'GET' && subpath === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': '*'
      });

      // Immediately push initial snapshot so new client syncs in <10ms
      hub.snapshot.serialDeviceExists = fs.existsSync(hub.serialPort);
      hub.snapshot.rosAvailable = Boolean(detectRosSetupScript());
      hub.snapshot.managedNodes = hub.getManagedNodesStatus();
      res.write(`event: snapshot\ndata: ${JSON.stringify(hub.snapshot)}\n\n`);

      hub.sseClients.add(res);
      const keepAlive = setInterval(() => {
        if (!res.writableEnded) res.write(': ping\n\n');
      }, 15000);

      req.on('close', () => {
        clearInterval(keepAlive);
        hub.sseClients.delete(res);
      });
      return;
    }

    if (req.method === 'GET' && subpath === '/camera.mjpeg') {
      res.writeHead(200, {
        'Content-Type': 'multipart/x-mixed-replace; boundary=botcam',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      if (hub.latestJpegBuffer) {
        res.write(
          `--botcam\r\nContent-Type: image/jpeg\r\nContent-Length: ${hub.latestJpegBuffer.length}\r\n\r\n`
        );
        res.write(hub.latestJpegBuffer);
        res.write('\r\n');
      }
      hub.mjpegClients.add(res);
      req.on('close', () => hub.mjpegClients.delete(res));
      return;
    }

    if (req.method === 'POST' && subpath === '/cmd') {
      try {
        const body = await readJsonBody(req);
        const result = hub.handleAction(body);
        writeJson(res, result.ok === false ? 400 : 200, result);
      } catch (err) {
        writeJson(res, 400, { ok: false, error: err?.message || 'bad request' });
      }
      return;
    }

    writeJson(res, 404, { error: 'not found' });
  };
}
