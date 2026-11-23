#!/usr/bin/env python3
"""
Lightweight local ROS 2 rclpy stdio bridge for W152D upper computer.
Eliminates the need for external micro-ros-agent or rosbridge_server (port 9090).
"""
import base64
import json
import math
import sys
import threading
import time

import rclpy
from rclpy.executors import SingleThreadedExecutor
from rclpy.node import Node
from rclpy.qos import DurabilityPolicy, HistoryPolicy, QoSProfile, ReliabilityPolicy

from geometry_msgs.msg import PoseStamped, PoseWithCovarianceStamped, Twist
from nav_msgs.msg import OccupancyGrid, Odometry, Path
from sensor_msgs.msg import BatteryState, CompressedImage, LaserScan
from std_msgs.msg import Float32

try:
    import tf2_ros
    HAS_TF2 = True
except Exception:
    HAS_TF2 = False

try:
    from nav2_msgs.srv import LoadMap, SaveMap as Nav2SaveMap
    HAS_NAV2_SRV = True
except Exception:
    HAS_NAV2_SRV = False


def quat_to_yaw(q):
    siny_cosp = 2.0 * (q.w * q.z + q.x * q.y)
    cosy_cosp = 1.0 - 2.0 * (q.y * q.y + q.z * q.z)
    return math.atan2(siny_cosp, cosy_cosp)


def emit(event_type, payload):
    line = json.dumps({"type": event_type, "data": payload}, separators=(",", ":"))
    sys.stdout.write(line + "\n")
    sys.stdout.flush()


class W152DRosBridge(Node):
    def __init__(self):
        super().__init__("w152d_web_bridge")

        sensor_qos = QoSProfile(
            reliability=ReliabilityPolicy.BEST_EFFORT,
            durability=DurabilityPolicy.VOLATILE,
            history=HistoryPolicy.KEEP_LAST,
            depth=1,
        )
        map_latched_qos = QoSProfile(
            reliability=ReliabilityPolicy.RELIABLE,
            durability=DurabilityPolicy.TRANSIENT_LOCAL,
            history=HistoryPolicy.KEEP_LAST,
            depth=1,
        )
        map_volatile_qos = QoSProfile(
            reliability=ReliabilityPolicy.RELIABLE,
            durability=DurabilityPolicy.VOLATILE,
            history=HistoryPolicy.KEEP_LAST,
            depth=1,
        )

        self.cmd_pub = self.create_publisher(Twist, "/cmd_vel", 10)
        self.goal_pub = self.create_publisher(PoseStamped, "/goal_pose", 10)
        self.init_pose_pub = self.create_publisher(PoseWithCovarianceStamped, "/initialpose", 10)

        self.robot_pose = {"x": 0.0, "y": 0.0, "theta": 0.0}
        self.pose_source = "none"
        self.last_tf_or_amcl_ts = 0.0
        self.last_scan_emit = 0.0
        self.last_map_emit = 0.0
        self.last_costmap_emit = 0.0
        self.last_cam_emit = 0.0
        self.battery = {"percentage": None, "voltage": 0.0, "current": 0.0, "isCharging": False}

        if HAS_TF2:
            self.tf_buffer = tf2_ros.Buffer()
            self.tf_listener = tf2_ros.TransformListener(self.tf_buffer, self)
            self.create_timer(0.1, self.poll_tf)

        self.create_subscription(OccupancyGrid, "/map", self.on_map, map_latched_qos)
        self.create_subscription(OccupancyGrid, "/map", self.on_map, map_volatile_qos)
        self.create_subscription(OccupancyGrid, "/global_costmap/costmap", self.on_costmap, sensor_qos)
        self.create_subscription(LaserScan, "/scan", self.on_scan, sensor_qos)
        self.create_subscription(Odometry, "/odom", self.on_odom, sensor_qos)
        self.create_subscription(PoseWithCovarianceStamped, "/amcl_pose", self.on_amcl, map_volatile_qos)
        self.create_subscription(Path, "/plan", self.on_path, sensor_qos)
        self.create_subscription(Path, "/received_global_plan", self.on_path, sensor_qos)
        self.create_subscription(BatteryState, "/battery_state", self.on_battery_state, sensor_qos)
        self.create_subscription(Float32, "/voltage", self.on_voltage, sensor_qos)
        self.create_subscription(Float32, "/battery_voltage", self.on_voltage, sensor_qos)
        self.create_subscription(Float32, "/battery_percent", self.on_percent, sensor_qos)
        self.create_subscription(CompressedImage, "/camera/image_raw/compressed", self.on_camera, sensor_qos)

        emit("ready", {"node": "w152d_web_bridge"})

    def poll_tf(self):
        for child in ("base_footprint", "base_link"):
            try:
                tf = self.tf_buffer.lookup_transform("map", child, rclpy.time.Time())
                t = tf.transform.translation
                yaw = quat_to_yaw(tf.transform.rotation)
                self.robot_pose = {"x": round(t.x, 4), "y": round(t.y, 4), "theta": round(yaw, 4)}
                self.pose_source = "tf"
                self.last_tf_or_amcl_ts = time.monotonic()
                emit("pose", {"pose": self.robot_pose, "source": "tf"})
                return
            except Exception:
                pass

    def on_amcl(self, msg):
        p = msg.pose.pose.position
        yaw = quat_to_yaw(msg.pose.pose.orientation)
        self.robot_pose = {"x": round(p.x, 4), "y": round(p.y, 4), "theta": round(yaw, 4)}
        self.pose_source = "amcl"
        self.last_tf_or_amcl_ts = time.monotonic()
        emit("pose", {"pose": self.robot_pose, "source": "amcl"})

    def on_odom(self, msg):
        t = msg.twist.twist
        if time.monotonic() - self.last_tf_or_amcl_ts > 2.0:
            p = msg.pose.pose.position
            yaw = quat_to_yaw(msg.pose.pose.orientation)
            self.robot_pose = {"x": round(p.x, 4), "y": round(p.y, 4), "theta": round(yaw, 4)}
            self.pose_source = "odom"
            emit(
                "pose",
                {
                    "pose": self.robot_pose,
                    "source": "odom",
                    "twist": {"lx": round(t.linear.x, 3), "az": round(t.angular.z, 3)},
                },
            )

    def on_scan(self, scan):
        now = time.monotonic()
        if now - self.last_scan_emit < 0.09:
            return
        self.last_scan_emit = now

        rx = self.robot_pose["x"]
        ry = self.robot_pose["y"]
        rt = self.robot_pose["theta"]
        pts = []
        angle = scan.angle_min
        step = max(1, len(scan.ranges) // 360)
        for i in range(0, len(scan.ranges), step):
            r = scan.ranges[i]
            a = angle + i * scan.angle_increment
            if math.isfinite(r) and scan.range_min <= r <= scan.range_max:
                pts.append(
                    {
                        "x": round(rx + r * math.cos(rt + a), 3),
                        "y": round(ry + r * math.sin(rt + a), 3),
                        "dist": round(r, 3),
                    }
                )
        emit("scan", pts)

    def serialize_grid(self, msg):
        info = msg.info
        return {
            "info": {
                "width": info.width,
                "height": info.height,
                "resolution": round(float(info.resolution), 5),
                "origin": {
                    "position": {
                        "x": round(info.origin.position.x, 4),
                        "y": round(info.origin.position.y, 4),
                        "z": 0.0,
                    },
                    "orientation": {
                        "x": info.origin.orientation.x,
                        "y": info.origin.orientation.y,
                        "z": info.origin.orientation.z,
                        "w": info.origin.orientation.w,
                    },
                },
            },
            "data": list(msg.data),
        }

    def on_map(self, msg):
        now = time.monotonic()
        if now - self.last_map_emit < 0.8:
            return
        self.last_map_emit = now
        emit("map", self.serialize_grid(msg))

    def on_costmap(self, msg):
        now = time.monotonic()
        if now - self.last_costmap_emit < 1.2:
            return
        self.last_costmap_emit = now
        emit("costmap", self.serialize_grid(msg))

    def on_path(self, msg):
        pts = [{"x": round(p.pose.position.x, 3), "y": round(p.pose.position.y, 3)} for p in msg.poses]
        emit("path", pts)

    def on_battery_state(self, msg):
        pct = msg.percentage
        if pct <= 1.0:
            pct = round(pct * 100.0)
        self.battery = {
            "percentage": max(0, min(100, int(pct))),
            "voltage": round(float(msg.voltage or 0.0), 1),
            "current": round(float(msg.current or 0.0), 1),
            "isCharging": msg.power_supply_status == 1,
            "powerSupplyStatus": int(msg.power_supply_status or 2),
        }
        emit("battery", self.battery)

    def on_voltage(self, msg):
        v = round(float(msg.data), 1)
        pct = self.battery.get("percentage")
        if pct is None:
            pct = max(0, min(100, int(round(((v - 10.5) / 2.1) * 100.0))))
        self.battery["voltage"] = v
        self.battery["percentage"] = pct
        emit("battery", self.battery)

    def on_percent(self, msg):
        val = float(msg.data)
        pct = int(round(val * 100.0)) if val <= 1.0 else int(round(val))
        self.battery["percentage"] = max(0, min(100, pct))
        emit("battery", self.battery)

    def on_camera(self, msg):
        now = time.monotonic()
        if now - self.last_cam_emit < 0.08:
            return
        self.last_cam_emit = now
        b64 = base64.b64encode(bytes(msg.data)).decode("ascii")
        emit("jpeg", b64)

    def handle_command(self, cmd):
        action = cmd.get("action")
        if action == "cmd_vel":
            msg = Twist()
            msg.linear.x = float(cmd.get("lx", 0.0))
            msg.linear.y = float(cmd.get("ly", 0.0))
            msg.angular.z = float(cmd.get("az", 0.0))
            self.cmd_pub.publish(msg)
        elif action == "goal_pose":
            msg = PoseStamped()
            msg.header.stamp = self.get_clock().now().to_msg()
            msg.header.frame_id = "map"
            msg.pose.position.x = float(cmd.get("x", 0.0))
            msg.pose.position.y = float(cmd.get("y", 0.0))
            theta = float(cmd.get("theta", 0.0))
            msg.pose.orientation.z = math.sin(theta * 0.5)
            msg.pose.orientation.w = math.cos(theta * 0.5)
            self.goal_pub.publish(msg)
        elif action == "initial_pose":
            msg = PoseWithCovarianceStamped()
            msg.header.stamp = self.get_clock().now().to_msg()
            msg.header.frame_id = "map"
            msg.pose.pose.position.x = float(cmd.get("x", 0.0))
            msg.pose.pose.position.y = float(cmd.get("y", 0.0))
            theta = float(cmd.get("theta", 0.0))
            msg.pose.pose.orientation.z = math.sin(theta * 0.5)
            msg.pose.pose.orientation.w = math.cos(theta * 0.5)
            cov = [0.0] * 36
            cov[0] = 0.25
            cov[7] = 0.25
            cov[35] = 0.0685
            msg.pose.covariance = cov
            self.init_pose_pub.publish(msg)
        elif action == "save_map" and HAS_NAV2_SRV:
            name = str(cmd.get("name", "map")).strip()
            cli = self.create_client(Nav2SaveMap, "/map_saver/save_map")
            if cli.wait_for_service(timeout_sec=1.5):
                req = Nav2SaveMap.Request()
                req.map_topic = "/map"
                req.map_url = name
                req.image_format = "pgm"
                req.map_mode = "trinary"
                req.free_thresh = 0.25
                req.occupied_thresh = 0.65
                cli.call_async(req)
        elif action == "load_map" and HAS_NAV2_SRV:
            url = str(cmd.get("map_url", "")).strip()
            cli = self.create_client(LoadMap, "/map_server/load_map")
            if cli.wait_for_service(timeout_sec=1.5):
                req = LoadMap.Request()
                req.map_url = url
                cli.call_async(req)


def stdin_reader(node):
    for line in sys.stdin:
        raw = line.strip()
        if not raw:
            continue
        try:
            node.handle_command(json.loads(raw))
        except Exception as exc:
            emit("log", {"level": "warn", "message": f"指令解析异常: {exc}"})


def main():
    rclpy.init()
    node = W152DRosBridge()
    t = threading.Thread(target=stdin_reader, args=(node,), daemon=True)
    t.start()

    executor = SingleThreadedExecutor()
    executor.add_node(node)
    try:
        executor.spin()
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
