import React, { useEffect, useState } from 'react';
import { Cpu, Eraser, Play, Square, Usb, Video } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  FormField,
  Input,
  SegmentedControl,
  Select,
  StatusBadge,
  StatusTag,
  Tooltip,
  useAbcConfig
} from '@abc-design/react';
import { rosService } from '../services/rosService';

const BAUD_OPTIONS = [
  { value: '921600', label: '921600 bps (雪哥小车默认)' },
  { value: '460800', label: '460800 bps' },
  { value: '230400', label: '230400 bps' },
  { value: '115200', label: '115200 bps' }
];

const NODE_ORDER = ['driver', 'slam', 'nav2', 'camera'];

export default function W152DControl({
  gatewayOnline = false,
  driverMode = 'mavlink_serial',
  serialConnected = false,
  ros2Connected = false,
  serialPort = '/dev/ttyUSB0',
  serialBaud = 921600,
  serialDeviceExists = false,
  rosAvailable = false,
  managedNodes = {},
  onUseRosCamera
}) {
  const { toast } = useAbcConfig();
  const [portDraft, setPortDraft] = useState(serialPort);
  const [baudDraft, setBaudDraft] = useState(String(serialBaud));
  const [busyNode, setBusyNode] = useState('');

  useEffect(() => {
    setPortDraft(serialPort || '/dev/ttyUSB0');
  }, [serialPort]);

  useEffect(() => {
    setBaudDraft(String(serialBaud || 921600));
  }, [serialBaud]);

  const handleDriverSwitch = async (nextMode) => {
    const res = await rosService.setW152DDriverMode(nextMode);
    if (res?.ok) {
      toast.success(
        nextMode === 'mavlink_serial'
          ? '已切至 USB 串口直连引擎 (免 ROS 2 即可遥控与看雷达)'
          : '已切至本机 ROS 2 直通引擎 (支持 SLAM 建图与 Nav2)'
      );
    } else {
      toast.warning('W152D 网关未在线，无法切换驱动模式');
    }
  };

  const handleApplySerial = async (e) => {
    e.preventDefault();
    const res = await rosService.updateW152DSerialConfig(portDraft.trim(), Number(baudDraft));
    if (res?.ok) {
      toast.success(`已应用串口配置: ${res.serialPort} @ ${res.serialBaud}`);
    }
  };

  const handleToggleNode = async (nodeId, currentlyRunning) => {
    setBusyNode(nodeId);
    try {
      const op = currentlyRunning ? 'stop' : 'start';
      const res = await rosService.controlW152DNode(nodeId, op);
      if (res?.ok) {
        toast.info(`${currentlyRunning ? '已停止' : '已启动'}节点: ${managedNodes[nodeId]?.label || nodeId}`);
      } else {
        toast.error(res?.error || '节点启停失败');
      }
    } finally {
      setBusyNode('');
    }
  };

  return (
    <Card
      size="sm"
      padding="sm"
      title={
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-[var(--abc-primary)]" />
          <span>W152D 机载直连控制</span>
        </div>
      }
      extra={
        <StatusBadge
          status={
            !gatewayOnline
              ? 'unavailable'
              : driverMode === 'mavlink_serial'
                ? serialConnected
                  ? 'active'
                  : 'pending'
                : ros2Connected
                  ? 'active'
                  : 'pending'
          }
          label={
            !gatewayOnline
              ? '网关离线'
              : driverMode === 'mavlink_serial'
                ? serialConnected
                  ? '串口已通'
                  : '待插串口'
                : ros2Connected
                  ? 'ROS2就绪'
                  : '等待ROS2'
          }
        />
      }
    >
      <div className="space-y-3">
        <SegmentedControl
          block
          size="xs"
          disabled={!gatewayOnline}
          value={driverMode}
          onChange={(val) => handleDriverSwitch(val)}
          options={[
            {
              value: 'mavlink_serial',
              label: 'USB 串口直连',
              icon: <Usb className="h-3 w-3" />
            },
            {
              value: 'local_ros2',
              label: '本机 ROS 2 导航',
              icon: <Cpu className="h-3 w-3" />
            }
          ]}
        />

        {driverMode === 'mavlink_serial' ? (
          <form onSubmit={handleApplySerial} className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--abc-fg-muted)]">物理设备状态</span>
              <StatusTag
                size="xs"
                tone={serialConnected ? 'success' : serialDeviceExists ? 'info' : 'warning'}
              >
                {serialConnected
                  ? `MAVLink 通信中 (${serialPort})`
                  : serialDeviceExists
                    ? `检测到 ${serialPort}，握手中`
                    : `未检测到 ${serialPort}`}
              </StatusTag>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <FormField label="串口设备节点">
                <Input
                  size="xs"
                  disabled={!gatewayOnline}
                  value={portDraft}
                  onChange={(e) => setPortDraft(e.target.value)}
                  placeholder="/dev/ttyUSB0"
                />
              </FormField>

              <FormField label="通信波特率">
                <Select
                  size="xs"
                  disabled={!gatewayOnline}
                  value={baudDraft}
                  options={BAUD_OPTIONS}
                  onChange={(val) => setBaudDraft(String(val || '921600'))}
                />
              </FormField>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="submit"
                size="xs"
                variant="outline"
                disabled={!gatewayOnline}
                className="flex-1"
              >
                应用串口参数
              </Button>
              <Tooltip content="清空画布上的里程计历史轨迹线">
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  disabled={!gatewayOnline}
                  leftIcon={<Eraser className="h-3 w-3" />}
                  onClick={() => {
                    rosService.clearOdomTrail();
                    toast.info('已清空里程计轨迹');
                  }}
                >
                  清轨迹
                </Button>
              </Tooltip>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            {!rosAvailable && gatewayOnline && (
              <Alert
                tone="warning"
                showIcon
                description="当前主机未检测到 /opt/ros/humble，可使用「USB 串口直连」直接遥控底盘与查看雷达。"
              />
            )}

            <div className="divide-y divide-[var(--abc-border)] rounded-[var(--abc-radius-md)] border border-[var(--abc-border)] bg-[var(--abc-bg-muted)]/50 px-2.5">
              {NODE_ORDER.map((nodeId) => {
                const item = managedNodes[nodeId] || {
                  id: nodeId,
                  label: nodeId,
                  desc: '',
                  running: false
                };
                return (
                  <div
                    key={nodeId}
                    className="flex items-center justify-between gap-2 py-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-medium text-[var(--abc-fg)]">
                        <span className="truncate">{item.label}</span>
                        {item.running && (
                          <StatusTag size="xs" tone="success" dot>
                            运行中
                          </StatusTag>
                        )}
                      </div>
                      <div className="truncate text-[11px] text-[var(--abc-fg-muted)]">
                        {item.desc}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {nodeId === 'camera' && item.running && onUseRosCamera && (
                        <Tooltip content="将左侧监控画面切换为本机 ROS /camera/image_raw/compressed 视频流">
                          <Button
                            size="icon-sm"
                            variant="outline"
                            aria-label="切换至 ROS 相机流"
                            onClick={onUseRosCamera}
                          >
                            <Video className="h-3.5 w-3.5" />
                          </Button>
                        </Tooltip>
                      )}
                      <Button
                        size="xs"
                        disabled={!gatewayOnline || !rosAvailable}
                        loading={busyNode === nodeId}
                        variant={item.running ? 'danger' : 'outline'}
                        leftIcon={
                          item.running ? (
                            <Square className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )
                        }
                        onClick={() => handleToggleNode(nodeId, item.running)}
                      >
                        {item.running ? '停止' : '启动'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
