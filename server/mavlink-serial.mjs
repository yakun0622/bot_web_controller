import fs from 'node:fs';
import { execFile } from 'node:child_process';
import { EventEmitter } from 'node:events';

const MAVLINK_STX_V1 = 0xfe;
const MAVLINK_STX_V2 = 0xfd;

const MSG_ID_HEARTBEAT = 0;
const MSG_ID_SYS_STATUS = 1;
const MSG_ID_SCALED_IMU = 26;
const MSG_ID_ATTITUDE = 30;
const MSG_ID_ATTITUDE_QUATERNION = 31;
const MSG_ID_SET_POSITION_TARGET_LOCAL_NED = 84;
const MSG_ID_HIGHRES_IMU = 105;
const MSG_ID_BATTERY_STATUS = 147;
const MSG_ID_OBSTACLE_DISTANCE = 330;
const MSG_ID_ODOMETRY = 331;

// Exact CRC_EXTRA and canonical payload lengths from mavlink_lib/common headers
const MSG_META = {
  [MSG_ID_HEARTBEAT]: { crcExtra: 50, len: 9 },
  [MSG_ID_SYS_STATUS]: { crcExtra: 124, len: 43 },
  [MSG_ID_SCALED_IMU]: { crcExtra: 170, len: 24 },
  [MSG_ID_ATTITUDE]: { crcExtra: 39, len: 28 },
  [MSG_ID_ATTITUDE_QUATERNION]: { crcExtra: 246, len: 48 },
  [MSG_ID_SET_POSITION_TARGET_LOCAL_NED]: { crcExtra: 143, len: 53 },
  [MSG_ID_HIGHRES_IMU]: { crcExtra: 93, len: 63 },
  [MSG_ID_BATTERY_STATUS]: { crcExtra: 154, len: 54 },
  [MSG_ID_OBSTACLE_DISTANCE]: { crcExtra: 23, len: 167 },
  [MSG_ID_ODOMETRY]: { crcExtra: 91, len: 233 }
};

const LIDAR_PACKET_BINS = 72;
const LIDAR_PACKET_COUNT = 5;
const LIDAR_SCAN_BINS = LIDAR_PACKET_BINS * LIDAR_PACKET_COUNT; // 360
const DEG_TO_RAD = Math.PI / 180;

export function crcAccumulate(byte, crc) {
  let tmp = (byte ^ (crc & 0xff)) & 0xff;
  tmp = (tmp ^ ((tmp << 4) & 0xff)) & 0xff;
  return (((crc >> 8) & 0xff) ^ (tmp << 8) ^ (tmp << 3) ^ (tmp >> 4)) & 0xffff;
}

export function computeMavlinkCrc(headerAndPayload, crcExtra) {
  let crc = 0xffff;
  for (let i = 0; i < headerAndPayload.length; i++) {
    crc = crcAccumulate(headerAndPayload[i], crc);
  }
  if (typeof crcExtra === 'number') {
    crc = crcAccumulate(crcExtra & 0xff, crc);
  }
  return crc;
}

function normalizeDegrees180(deg) {
  let d = deg;
  while (d >= 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

function normalizeDegrees360(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function quaternionToYaw(w, x, y, z) {
  const norm = Math.hypot(w, x, y, z);
  const nw = norm > 1e-9 ? w / norm : 1;
  const nx = norm > 1e-9 ? x / norm : 0;
  const ny = norm > 1e-9 ? y / norm : 0;
  const nz = norm > 1e-9 ? z / norm : 0;
  return Math.atan2(2 * (nw * nz + nx * ny), 1 - 2 * (ny * ny + nz * nz));
}

function configureSerialPort(portPath, baudrate) {
  return new Promise((resolve) => {
    const isMac = process.platform === 'darwin';
    const flag = isMac ? '-f' : '-F';
    const args = [
      flag,
      portPath,
      String(baudrate),
      'raw',
      '-echo',
      '-echoe',
      '-echok',
      'cs8',
      '-parenb',
      '-cstopb',
      '-crtscts'
    ];
    execFile('stty', args, { timeout: 2500 }, (err) => {
      resolve(!err);
    });
  });
}

/**
 * Streaming MAVLink v1 / v2 parser
 */
export class MavlinkStreamParser {
  constructor() {
    this.buf = Buffer.alloc(0);
  }

  push(chunk) {
    if (!chunk || chunk.length === 0) return [];
    this.buf = this.buf.length === 0 ? chunk : Buffer.concat([this.buf, chunk]);
    const frames = [];

    while (this.buf.length > 0) {
      const stx = this.buf[0];
      if (stx !== MAVLINK_STX_V2 && stx !== MAVLINK_STX_V1) {
        const nextV2 = this.buf.indexOf(MAVLINK_STX_V2, 1);
        const nextV1 = this.buf.indexOf(MAVLINK_STX_V1, 1);
        let nextIdx = -1;
        if (nextV2 >= 0 && nextV1 >= 0) nextIdx = Math.min(nextV2, nextV1);
        else nextIdx = Math.max(nextV2, nextV1);

        if (nextIdx < 0) {
          this.buf = Buffer.alloc(0);
          break;
        }
        this.buf = this.buf.subarray(nextIdx);
        continue;
      }

      if (stx === MAVLINK_STX_V2) {
        if (this.buf.length < 12) break;
        const payloadLen = this.buf[1];
        const incompatFlags = this.buf[2];
        const hasSig = (incompatFlags & 0x01) !== 0;
        const totalLen = 10 + payloadLen + 2 + (hasSig ? 13 : 0);
        if (this.buf.length < totalLen) break;

        const msgId = this.buf[7] | (this.buf[8] << 8) | (this.buf[9] << 16);
        const meta = MSG_META[msgId];
        if (meta) {
          const crcSlice = this.buf.subarray(1, 10 + payloadLen);
          const expectedCrc = computeMavlinkCrc(crcSlice, meta.crcExtra);
          const actualCrc = this.buf.readUInt16LE(10 + payloadLen);
          if (expectedCrc === actualCrc) {
            // Restore MAVLink v2 zero-trimmed trailing bytes up to canonical struct length
            const padded = Buffer.alloc(Math.max(meta.len, payloadLen));
            this.buf.copy(padded, 0, 10, 10 + payloadLen);
            frames.push({
              version: 2,
              seq: this.buf[4],
              sysId: this.buf[5],
              compId: this.buf[6],
              msgId,
              payload: padded
            });
            this.buf = this.buf.subarray(totalLen);
            continue;
          }
          // CRC mismatch on false STX byte -> advance by 1
          this.buf = this.buf.subarray(1);
          continue;
        }
        // Unknown msgId: skip packet safely
        this.buf = this.buf.subarray(totalLen);
      } else {
        // MAVLink v1 (0xFE)
        if (this.buf.length < 8) break;
        const payloadLen = this.buf[1];
        const totalLen = 6 + payloadLen + 2;
        if (this.buf.length < totalLen) break;

        const msgId = this.buf[5];
        const meta = MSG_META[msgId];
        if (meta) {
          const crcSlice = this.buf.subarray(1, 6 + payloadLen);
          const expectedCrc = computeMavlinkCrc(crcSlice, meta.crcExtra);
          const actualCrc = this.buf.readUInt16LE(6 + payloadLen);
          if (expectedCrc === actualCrc) {
            const padded = Buffer.alloc(Math.max(meta.len, payloadLen));
            this.buf.copy(padded, 0, 6, 6 + payloadLen);
            frames.push({
              version: 1,
              seq: this.buf[2],
              sysId: this.buf[3],
              compId: this.buf[4],
              msgId,
              payload: padded
            });
            this.buf = this.buf.subarray(totalLen);
            continue;
          }
          this.buf = this.buf.subarray(1);
          continue;
        }
        this.buf = this.buf.subarray(totalLen);
      }
    }

    if (this.buf.length > 8192) {
      this.buf = this.buf.subarray(this.buf.length - 1024);
    }
    return frames;
  }
}

/**
 * Pack MAVLink v2 SET_POSITION_TARGET_LOCAL_NED (msgid 84) velocity command
 * Byte-for-byte compatible with xuegecar_mavlink_bridge::handle_cmd_vel
 */
export function packVelocityCommand({
  timeBootMs = 0,
  vx = 0,
  vy = 0,
  yawRate = 0,
  seq = 0,
  sourceSysId = 255,
  sourceCompId = 190,
  targetSysId = 1,
  targetCompId = 1,
  convertFluToFrd = true
}) {
  const payload = Buffer.alloc(53, 0);
  const mappedVy = convertFluToFrd ? -vy : vy;
  // POSITION_TARGET_TYPEMASK: ignore X(1)|Y(2)|Z(4)|VZ(32)|AX(64)|AY(128)|AZ(256)|YAW(1024) = 0x05E7 (1511)
  // Wait: let's match exact bitmask from mavlink_bridge.cpp:
  // X_IGNORE(1) | Y_IGNORE(2) | Z_IGNORE(4) | VZ_IGNORE(32) | AX_IGNORE(64) | AY_IGNORE(128) | AZ_IGNORE(256) | YAW_IGNORE(1024) = 1511 (0x05E7)
  const velocityTypeMask = 1 | 2 | 4 | 32 | 64 | 128 | 256 | 1024;
  const MAV_FRAME_BODY_NED = 8;

  payload.writeUInt32LE(timeBootMs >>> 0, 0);
  payload.writeFloatLE(0, 4); // x
  payload.writeFloatLE(0, 8); // y
  payload.writeFloatLE(0, 12); // z
  payload.writeFloatLE(vx, 16); // vx
  payload.writeFloatLE(mappedVy, 20); // vy
  payload.writeFloatLE(0, 24); // vz
  payload.writeFloatLE(0, 28); // afx
  payload.writeFloatLE(0, 32); // afy
  payload.writeFloatLE(0, 36); // afz
  payload.writeFloatLE(0, 40); // yaw
  payload.writeFloatLE(yawRate, 44); // yaw_rate
  payload.writeUInt16LE(velocityTypeMask, 48); // type_mask
  payload.writeUInt8(targetSysId & 0xff, 50);
  payload.writeUInt8(targetCompId & 0xff, 51);
  payload.writeUInt8(MAV_FRAME_BODY_NED, 52);

  // MAVLink v2 trims trailing zero bytes from payload
  let trimmedLen = payload.length;
  while (trimmedLen > 1 && payload[trimmedLen - 1] === 0) {
    trimmedLen--;
  }

  const frame = Buffer.alloc(10 + trimmedLen + 2);
  frame[0] = MAVLINK_STX_V2;
  frame[1] = trimmedLen;
  frame[2] = 0; // incompat_flags
  frame[3] = 0; // compat_flags
  frame[4] = seq & 0xff;
  frame[5] = sourceSysId & 0xff;
  frame[6] = sourceCompId & 0xff;
  frame[7] = MSG_ID_SET_POSITION_TARGET_LOCAL_NED & 0xff;
  frame[8] = (MSG_ID_SET_POSITION_TARGET_LOCAL_NED >> 8) & 0xff;
  frame[9] = (MSG_ID_SET_POSITION_TARGET_LOCAL_NED >> 16) & 0xff;
  payload.copy(frame, 10, 0, trimmedLen);

  const crc = computeMavlinkCrc(
    frame.subarray(1, 10 + trimmedLen),
    MSG_META[MSG_ID_SET_POSITION_TARGET_LOCAL_NED].crcExtra
  );
  frame.writeUInt16LE(crc, 10 + trimmedLen);
  return frame;
}

/**
 * Direct W152D <-> Car USB Serial MAVLink Driver (/dev/ttyUSB0 @ 921600)
 */
export class MavlinkSerialDriver extends EventEmitter {
  constructor({ port = '/dev/ttyUSB0', baudrate = 921600 } = {}) {
    super();
    this.port = port;
    this.baudrate = baudrate;
    this.enabled = false;
    this.connected = false;
    this.fd = null;
    this.readBuf = Buffer.alloc(1024);
    this.reading = false;
    this.reconnectTimer = null;
    this.txSeq = 0;
    this.bootEpochMs = Date.now();
    this.lastRxMs = 0;
    this.parser = new MavlinkStreamParser();

    // LiDAR 5-fragment accumulator (360 bins @ 1 deg)
    this.resetLidarAccumulator();

    // Odometry state & trail
    this.robotPose = { x: 0, y: 0, theta: 0 };
    this.odomTwist = { lx: 0, ly: 0, az: 0 };
    this.attitudeYaw = null;
    this.trail = [];
  }

  resetLidarAccumulator() {
    this.scanRanges = new Float32Array(LIDAR_SCAN_BINS).fill(Infinity);
    this.scanFragments = new Array(LIDAR_PACKET_COUNT).fill(false);
    this.scanFragmentCount = 0;
    this.scanMinCm = 2;
    this.scanMaxCm = 1200;
  }

  configure({ port, baudrate }) {
    const nextPort = port ? (port.startsWith('/') ? port : `/dev/${port}`) : this.port;
    const nextBaud = Number(baudrate) || this.baudrate;
    const changed = nextPort !== this.port || nextBaud !== this.baudrate;
    this.port = nextPort;
    this.baudrate = nextBaud;
    if (changed && this.enabled) {
      this.stop();
      this.start();
    }
  }

  start() {
    if (this.enabled) return;
    this.enabled = true;
    this.tryOpen();
  }

  stop() {
    this.enabled = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.closeFd();
  }

  closeFd() {
    const wasConnected = this.connected;
    this.connected = false;
    if (this.fd !== null) {
      const oldFd = this.fd;
      this.fd = null;
      try {
        fs.closeSync(oldFd);
      } catch {
        // ignore close errors
      }
    }
    if (wasConnected) {
      this.emit('status', { connected: false, port: this.port, baudrate: this.baudrate });
    }
  }

  scheduleReconnect() {
    if (!this.enabled || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.enabled && this.fd === null) {
        this.tryOpen();
      }
    }, 1200);
  }

  async tryOpen() {
    if (!this.enabled || this.fd !== null) return;

    if (!fs.existsSync(this.port)) {
      this.scheduleReconnect();
      return;
    }

    await configureSerialPort(this.port, this.baudrate);
    if (!this.enabled) return;

    const O_RDWR = fs.constants.O_RDWR;
    const O_NOCTTY = fs.constants.O_NOCTTY || 0;
    const O_NONBLOCK = fs.constants.O_NONBLOCK || 0;

    fs.open(this.port, O_RDWR | O_NOCTTY | O_NONBLOCK, (err, fd) => {
      if (err || !this.enabled) {
        if (!err && typeof fd === 'number') {
          try {
            fs.closeSync(fd);
          } catch {}
        }
        this.scheduleReconnect();
        return;
      }

      this.fd = fd;
      this.connected = true;
      this.parser = new MavlinkStreamParser();
      this.resetLidarAccumulator();
      this.emit('status', { connected: true, port: this.port, baudrate: this.baudrate });
      this.pollReadLoop();
    });
  }

  pollReadLoop() {
    if (!this.enabled || this.fd === null || this.reading) return;
    this.reading = true;

    const step = () => {
      if (!this.enabled || this.fd === null) {
        this.reading = false;
        return;
      }

      fs.read(this.fd, this.readBuf, 0, this.readBuf.length, null, (err, bytesRead) => {
        if (!this.enabled || this.fd === null) {
          this.reading = false;
          return;
        }

        if (err) {
          if (err.code === 'EAGAIN' || err.code === 'EWOULDBLOCK' || err.code === 'EINTR') {
            setTimeout(step, 12);
            return;
          }
          this.reading = false;
          this.closeFd();
          this.scheduleReconnect();
          return;
        }

        if (bytesRead > 0) {
          this.lastRxMs = Date.now();
          const slice = Buffer.from(this.readBuf.subarray(0, bytesRead));
          const frames = this.parser.push(slice);
          for (const f of frames) {
            this.handleFrame(f);
          }
          setImmediate(step);
        } else {
          setTimeout(step, 15);
        }
      });
    };

    step();
  }

  sendVelocity(lx = 0, ly = 0, az = 0) {
    if (!this.enabled || this.fd === null) return false;
    const packet = packVelocityCommand({
      timeBootMs: Date.now() - this.bootEpochMs,
      vx: lx,
      vy: ly,
      yawRate: az,
      seq: this.txSeq++
    });

    try {
      fs.write(this.fd, packet, 0, packet.length, null, (err) => {
        if (err && err.code !== 'EAGAIN' && err.code !== 'EWOULDBLOCK') {
          this.closeFd();
          this.scheduleReconnect();
        }
      });
      return true;
    } catch {
      this.closeFd();
      this.scheduleReconnect();
      return false;
    }
  }

  handleFrame(frame) {
    const p = frame.payload;
    switch (frame.msgId) {
      case MSG_ID_ODOMETRY: {
        const x = p.readFloatLE(8);
        const y = p.readFloatLE(12);
        const qw = p.readFloatLE(20);
        const qx = p.readFloatLE(24);
        const qy = p.readFloatLE(28);
        const qz = p.readFloatLE(32);
        const vx = p.readFloatLE(36);
        const vy = -p.readFloatLE(40); // FRD -> FLU
        const yawspeed = -p.readFloatLE(56); // FRD -> FLU

        const theta = quaternionToYaw(qw, qx, qy, qz);
        this.robotPose = { x, y, theta };
        this.odomTwist = { lx: vx, ly: vy, az: yawspeed };

        const lastPt = this.trail[this.trail.length - 1];
        if (!lastPt || Math.hypot(x - lastPt.x, y - lastPt.y) >= 0.06) {
          this.trail.push({ x, y });
          if (this.trail.length > 240) this.trail = this.trail.slice(-240);
        }

        this.emit('odom', {
          pose: this.robotPose,
          twist: this.odomTwist,
          trail: this.trail
        });
        break;
      }

      case MSG_ID_ATTITUDE: {
        const yaw = p.readFloatLE(12);
        this.attitudeYaw = -yaw; // NED -> FLU
        break;
      }

      case MSG_ID_OBSTACLE_DISTANCE: {
        const minDistCm = p.readUInt16LE(152);
        const maxDistCm = p.readUInt16LE(154);
        const incU8 = p.readUInt8(157);
        const incF = p.readFloatLE(158);
        const angleOffset = p.readFloatLE(162);

        const signedIncDeg = Math.abs(incF) > 1e-6 ? incF : incU8 === 0 ? 1.0 : incU8;
        if (Math.abs(Math.abs(signedIncDeg) - 1.0) > 1e-3) break;

        const startBin = Math.round(normalizeDegrees360(angleOffset));
        if (startBin < 0 || startBin >= LIDAR_SCAN_BINS || startBin % LIDAR_PACKET_BINS !== 0) break;

        const fragIdx = Math.floor(startBin / LIDAR_PACKET_BINS);
        if (fragIdx === 0 && this.scanFragmentCount > 0) {
          this.resetLidarAccumulator();
        }

        if (this.scanFragmentCount === 0) {
          this.scanMinCm = minDistCm;
          this.scanMaxCm = maxDistCm;
        } else {
          this.scanMinCm = Math.min(this.scanMinCm, minDistCm);
          this.scanMaxCm = Math.max(this.scanMaxCm, maxDistCm);
        }

        for (let src = 0; src < LIDAR_PACKET_BINS; src++) {
          const distCm = p.readUInt16LE(8 + src * 2);
          const cwDeg = angleOffset + signedIncDeg * src;
          const rosDeg = normalizeDegrees180(-cwDeg);
          let rosIdx = Math.round(rosDeg + 180);
          if (rosIdx >= LIDAR_SCAN_BINS) rosIdx -= LIDAR_SCAN_BINS;
          if (rosIdx < 0) rosIdx += LIDAR_SCAN_BINS;

          if (distCm === 0xffff || distCm === maxDistCm + 1 || distCm < minDistCm) {
            this.scanRanges[rosIdx] = Infinity;
          } else {
            this.scanRanges[rosIdx] = distCm * 0.01;
          }
        }

        if (!this.scanFragments[fragIdx]) {
          this.scanFragments[fragIdx] = true;
          this.scanFragmentCount += 1;
        }

        if (this.scanFragmentCount === LIDAR_PACKET_COUNT) {
          const points = [];
          const { x: rx, y: ry, theta: rTheta } = this.robotPose;
          const rMin = this.scanMinCm * 0.01;
          const rMax = this.scanMaxCm * 0.01;

          for (let i = 0; i < LIDAR_SCAN_BINS; i++) {
            const r = this.scanRanges[i];
            if (Number.isFinite(r) && r >= rMin && r <= rMax) {
              const angle = -Math.PI + i * DEG_TO_RAD;
              points.push({
                x: rx + r * Math.cos(rTheta + angle),
                y: ry + r * Math.sin(rTheta + angle),
                dist: r
              });
            }
          }
          this.emit('scan', points);
          this.resetLidarAccumulator();
        }
        break;
      }

      case MSG_ID_SYS_STATUS: {
        const voltMv = p.readUInt16LE(14);
        const currCa = p.readInt16LE(16);
        const remPct = p.readInt8(30);
        if (voltMv !== 0xffff && voltMv > 0) {
          const voltage = Number((voltMv / 1000).toFixed(1));
          const percentage =
            remPct >= 0 && remPct <= 100
              ? remPct
              : Math.min(100, Math.max(0, Math.round(((voltage - 10.5) / 2.1) * 100)));
          this.emit('battery', {
            percentage,
            voltage,
            current: currCa === -1 ? 0 : Number((currCa / 100).toFixed(1)),
            isCharging: false,
            powerSupplyStatus: 2
          });
        }
        break;
      }

      case MSG_ID_BATTERY_STATUS: {
        const v0 = p.readUInt16LE(10);
        const currCa = p.readInt16LE(30);
        const remPct = p.readInt8(35);
        if (v0 !== 0xffff && v0 > 0) {
          const voltage = Number((v0 / 1000).toFixed(1));
          const percentage =
            remPct >= 0 && remPct <= 100
              ? remPct
              : Math.min(100, Math.max(0, Math.round(((voltage - 10.5) / 2.1) * 100)));
          this.emit('battery', {
            percentage,
            voltage,
            current: currCa === -1 ? 0 : Number((currCa / 100).toFixed(1)),
            isCharging: false,
            powerSupplyStatus: 2
          });
        }
        break;
      }

      default:
        break;
    }
  }
}
