#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

CLI_DEPLOY_TARGET="${1:-}"
CLI_DEPLOY_PATH="${2:-}"
ENV_DEPLOY_TARGET="${DEPLOY_TARGET:-}"
ENV_DEPLOY_PATH="${DEPLOY_PATH:-}"
ENV_DEPLOY_PORT="${DEPLOY_PORT:-}"
DEPLOY_CONFIG="${DEPLOY_CONFIG:-$PROJECT_DIR/deploy.config}"

if [[ -f "$DEPLOY_CONFIG" ]]; then
  # shellcheck source=/dev/null
  source "$DEPLOY_CONFIG"
fi

DEPLOY_TARGET="${CLI_DEPLOY_TARGET:-${ENV_DEPLOY_TARGET:-${DEPLOY_TARGET:-}}}"
DEPLOY_PATH="${CLI_DEPLOY_PATH:-${ENV_DEPLOY_PATH:-${DEPLOY_PATH:-/var/www/bot-web-controller}}}"
DEPLOY_PORT="${ENV_DEPLOY_PORT:-${DEPLOY_PORT:-22}}"

if [[ -z "$DEPLOY_TARGET" ]]; then
  echo "用法: ./deploy.sh <user@host> [remote-path]"
  echo "示例: ./deploy.sh robot@192.168.2.88 /var/www/bot-web-controller"
  echo "也可以修改 deploy.config，或设置 DEPLOY_TARGET、DEPLOY_PATH 和 DEPLOY_PORT 环境变量。"
  exit 1
fi

if [[ ! "$DEPLOY_TARGET" =~ ^[A-Za-z0-9._@-]+$ ]]; then
  echo "错误: 部署目标格式无效: $DEPLOY_TARGET" >&2
  exit 1
fi

if [[ ! "$DEPLOY_PATH" =~ ^/[A-Za-z0-9._/-]+$ ]]; then
  echo "错误: 远端目录必须是安全的绝对路径: $DEPLOY_PATH" >&2
  exit 1
fi

if [[ ! "$DEPLOY_PORT" =~ ^[0-9]+$ ]]; then
  echo "错误: DEPLOY_PORT 必须是数字。" >&2
  exit 1
fi

for command_name in node npm ssh rsync; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "错误: 缺少命令 $command_name。" >&2
    exit 1
  fi
done

NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
if (( NODE_MAJOR < 18 || NODE_MAJOR == 19 )); then
  echo "错误: 当前 Node.js $(node --version)，Vite 5 构建需要 Node.js 18 或 20 以上版本。" >&2
  exit 1
fi

echo "[1/4] 构建生产版本"
npm run build

if [[ ! -f "$PROJECT_DIR/dist/index.html" ]]; then
  echo "错误: 构建完成后未找到 dist/index.html。" >&2
  exit 1
fi

echo "[2/4] 准备远端目录 $DEPLOY_TARGET:$DEPLOY_PATH"
ssh -p "$DEPLOY_PORT" "$DEPLOY_TARGET" "mkdir -p '$DEPLOY_PATH'"

echo "[3/4] 上传发布文件"
rsync \
  --archive \
  --compress \
  --human-readable \
  --progress \
  -e "ssh -p $DEPLOY_PORT" \
  "$PROJECT_DIR/dist/" \
  "$DEPLOY_TARGET:${DEPLOY_PATH%/}/"

echo "[4/4] 同步并启动 W152D 一体化直连中控服务 (:8081)"
ssh -p "$DEPLOY_PORT" "$DEPLOY_TARGET" "mkdir -p '${DEPLOY_PATH%/}/server'"
rsync \
  --archive \
  --compress \
  -e "ssh -p $DEPLOY_PORT" \
  "$PROJECT_DIR/server/rtsp-proxy.mjs" \
  "$PROJECT_DIR/server/bot-gateway.mjs" \
  "$PROJECT_DIR/server/mavlink-serial.mjs" \
  "$PROJECT_DIR/server/ros2-bridge-worker.py" \
  "$PROJECT_DIR/server/bot-rtsp-proxy.service" \
  "$PROJECT_DIR/server/nginx-rtsp.conf" \
  "$DEPLOY_TARGET:${DEPLOY_PATH%/}/server/"

ssh -p "$DEPLOY_PORT" "$DEPLOY_TARGET" "bash -s" <<EOF
set -e
DEPLOY_PATH='${DEPLOY_PATH%/}'
chmod +x "\$DEPLOY_PATH/server/ros2-bridge-worker.py" 2>/dev/null || true
if ! command -v node >/dev/null 2>&1; then
  echo "警告: 远端未找到 node，跳过 W152D 直连网关启动。"
  exit 0
fi
PID_FILE="/var/run/bot-rtsp-proxy.pid"
if [[ -f "\$PID_FILE" ]]; then
  OLD_PID="\$(cat "\$PID_FILE" || true)"
  if [[ -n "\$OLD_PID" ]] && kill -0 "\$OLD_PID" 2>/dev/null; then
    kill "\$OLD_PID" || true
    sleep 0.5
  fi
fi
nohup node "\$DEPLOY_PATH/server/rtsp-proxy.mjs" > /var/log/bot-rtsp-proxy.log 2>&1 &
echo \$! > "\$PID_FILE"
echo "W152D 一体化 Web 与串口/ROS2 直连服务已启动: http://0.0.0.0:8081"
EOF

echo "发布完成: $DEPLOY_TARGET:$DEPLOY_PATH"
echo "可直接浏览器访问 http://<W152D-IP>:8081（已内置静态页 + /dev/ttyUSB0 MAVLink 直连 + 本机 ROS2 网关 + RTSP 转码）。"
