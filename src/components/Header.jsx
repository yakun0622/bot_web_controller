import React, { useState } from 'react';
import {
  Battery,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  Cpu,
  Link2,
  RefreshCw,
  Settings,
  Video
} from 'lucide-react';
import {
  Button,
  DescriptionList,
  Dialog,
  Divider,
  FormField,
  Input,
  Popover,
  ProgressBar,
  SegmentedControl,
  Select,
  StatusBadge,
  StatusTag,
  Tooltip,
  useAbcConfig
} from '@abc-design/react';
import { rosService } from '../services/rosService';

export default function Header({
  status,
  connectionMode = 'w152d',
  gatewayOnline = false,
  driverMode = 'mavlink_serial',
  gatewayUrl = '',
  rosUrl = 'ws://192.168.2.88:9090',
  videoUrl = '',
  rosProtocol = 'auto',
  detectedProtocol = 'ros2',
  onSaveSettings,
  battery,
  settingsOpen: externalSettingsOpen,
  onSettingsOpenChange
}) {
  const { toast } = useAbcConfig();
  const [internalSettingsOpen, setInternalSettingsOpen] = useState(false);
  const showSettingsModal = externalSettingsOpen ?? internalSettingsOpen;
  const setShowSettingsModal = onSettingsOpenChange ?? setInternalSettingsOpen;

  const [tempConnMode, setTempConnMode] = useState(connectionMode);
  const [tempGatewayUrl, setTempGatewayUrl] = useState(gatewayUrl);
  const [tempRosUrl, setTempRosUrl] = useState(rosUrl);
  const [tempVideoUrl, setTempVideoUrl] = useState(videoUrl);
  const [tempProtocol, setTempProtocol] = useState(rosProtocol);

  const openSettings = () => {
    setTempConnMode(connectionMode || 'w152d');
    setTempGatewayUrl(gatewayUrl || '');
    setTempRosUrl(rosUrl || 'ws://192.168.2.88:9090');
    setTempVideoUrl(videoUrl || '');
    setTempProtocol(rosProtocol || 'auto');
    setShowSettingsModal(true);
  };

  const handleConnect = (e) => {
    e?.preventDefault?.();
    onSaveSettings({
      connectionMode: tempConnMode,
      gatewayUrl: tempGatewayUrl.trim(),
      rosUrl: tempRosUrl.trim() || 'ws://192.168.2.88:9090',
      videoUrl: tempVideoUrl.trim(),
      rosProtocol: tempProtocol
    });
    setShowSettingsModal(false);
    toast.info(
      tempConnMode === 'w152d'
        ? `已应用 W152D 上位机直连配置 (${tempGatewayUrl.trim() || '同源自动探测'})`
        : `正在连接 Rosbridge: ${tempRosUrl.trim()}`
    );
  };

  const hasBattery = Boolean(battery && typeof battery.percentage === 'number');
  const pct = hasBattery ? battery.percentage : 0;
  const isCharging = Boolean(battery?.isCharging);

  const batteryVariant = !hasBattery
    ? 'default'
    : isCharging
      ? 'success'
      : pct <= 20
        ? 'danger'
        : pct <= 55
          ? 'warning'
          : 'success';

  const renderBatteryIcon = () => {
    if (!hasBattery) return <Battery className="h-3.5 w-3.5 text-[var(--abc-fg-muted)]" />;
    if (isCharging) return <BatteryCharging className="h-3.5 w-3.5 text-emerald-500" />;
    if (pct <= 20) return <BatteryLow className="h-3.5 w-3.5 text-rose-500" />;
    if (pct <= 55) return <BatteryMedium className="h-3.5 w-3.5 text-amber-500" />;
    return <Battery className="h-3.5 w-3.5 text-emerald-500" />;
  };

  const mappedStatus =
    status === 'connected'
      ? 'active'
      : status === 'connecting' || gatewayOnline
        ? 'starting'
        : 'unavailable';

  const statusLabel =
    connectionMode === 'w152d'
      ? status === 'connected'
        ? driverMode === 'mavlink_serial'
          ? 'W152D · 串口已连'
          : 'W152D · ROS2已连'
        : gatewayOnline
          ? driverMode === 'mavlink_serial'
            ? 'W152D · 待插串口'
            : 'W152D · 待启ROS2'
          : 'W152D · 网关离线'
      : status === 'connected'
        ? `已连接 · ${detectedProtocol.toUpperCase()}`
        : status === 'connecting'
          ? '连接中'
          : '未连接';

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Battery Popover */}
        <Popover
          placement="bottomRight"
          title={
            <div className="flex items-center justify-between gap-3">
              <span>动力电池遥测</span>
              <StatusTag
                size="xs"
                tone={!hasBattery ? 'neutral' : isCharging ? 'success' : pct <= 20 ? 'danger' : 'info'}
                dot={hasBattery}
              >
                {!hasBattery ? '等待数据' : isCharging ? '充电中' : '放电中'}
              </StatusTag>
            </div>
          }
          content={
            <div className="w-52 space-y-3">
              <ProgressBar value={pct} max={100} size="sm" variant={batteryVariant} />
              <DescriptionList
                columns={1}
                density="compact"
                variant="divided"
                items={[
                  {
                    key: 'pct',
                    label: '剩余电量',
                    value: hasBattery ? `${pct}%` : '--',
                    mono: true
                  },
                  {
                    key: 'volt',
                    label: '母线电压',
                    value: hasBattery ? `${battery.voltage.toFixed(1)} V` : '--',
                    mono: true
                  },
                  {
                    key: 'curr',
                    label: '实时电流',
                    value: hasBattery ? `${battery.current.toFixed(1)} A` : '--',
                    mono: true
                  }
                ]}
              />
            </div>
          }
        >
          <Button
            size="xs"
            variant="outline"
            leftIcon={renderBatteryIcon()}
            aria-label="查看电池状态详情"
          >
            <span className="font-mono font-semibold">{hasBattery ? `${pct}%` : '--%'}</span>
            {hasBattery && (
              <span className="hidden sm:inline font-mono text-[11px] text-[var(--abc-fg-muted)]">
                {battery.voltage.toFixed(1)}V
              </span>
            )}
          </Button>
        </Popover>

        {/* Connection StatusBadge */}
        <StatusBadge
          status={mappedStatus}
          label={statusLabel}
          pulse={status === 'connecting'}
        />

        {/* Quick Reconnect Action when offline */}
        {status === 'disconnected' && !gatewayOnline && (
          <Tooltip content="立即重新连接上位机网关">
            <Button
              size="xs"
              variant="secondary"
              leftIcon={<RefreshCw className="h-3 w-3" />}
              onClick={() => {
                rosService.reconnect();
                toast.info('正在重新握手连接...');
              }}
            >
              <span className="hidden sm:inline">重连</span>
            </Button>
          </Tooltip>
        )}

        <Divider orientation="vertical" className="hidden sm:inline-block" />

        {/* Connection Settings Button */}
        <Tooltip content="切换 W152D 直连网关 / 外部 Rosbridge 与摄像头流地址">
          <Button
            size="xs"
            variant="outline"
            leftIcon={<Settings className="h-3.5 w-3.5" />}
            onClick={openSettings}
          >
            <span className="hidden sm:inline">连接配置</span>
          </Button>
        </Tooltip>
      </div>

      {/* Connection Mode & Stream Settings Dialog */}
      <Dialog
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="上位机通信与视频流配置"
        description="默认适配 W152D 上位机 USB 串口 / 本机 ROS 2 直连架构（无需 ros-agent 或 9090 转发端口）"
        size="md"
        fullscreenable={false}
        footer={
          <>
            <Button size="sm" variant="outline" onClick={() => setShowSettingsModal(false)}>
              取消
            </Button>
            <Button size="sm" variant="primary" onClick={handleConnect}>
              保存并生效
            </Button>
          </>
        }
      >
        <form onSubmit={handleConnect} className="space-y-4">
          <FormField label="上位机接入架构模式">
            <SegmentedControl
              block
              size="sm"
              value={tempConnMode}
              onChange={(val) => setTempConnMode(val)}
              options={[
                {
                  value: 'w152d',
                  label: 'W152D 上位机直连 (推荐)',
                  icon: <Cpu className="h-3.5 w-3.5" />
                },
                {
                  value: 'rosbridge',
                  label: '外部 Rosbridge WS (:9090)',
                  icon: <Link2 className="h-3.5 w-3.5" />
                }
              ]}
            />
          </FormField>

          {tempConnMode === 'w152d' ? (
            <FormField
              label="W152D 网关地址（同机部署留空即可）"
              helperText="若网页直接部署在 W152D 上请留空（自动走同源 /api/bot）；若在电脑本地调试远端 W152D，可填如 http://192.168.2.88:8081"
            >
              <Input
                size="sm"
                value={tempGatewayUrl}
                onChange={(e) => setTempGatewayUrl(e.target.value)}
                placeholder="留空自动探测同源，或填 http://192.168.2.88:8081"
                prefix={<Cpu className="h-3.5 w-3.5 text-[var(--abc-fg-muted)]" />}
                allowClear
              />
            </FormField>
          ) : (
            <>
              <FormField label="ROS 协议栈版本">
                <Select
                  size="sm"
                  value={tempProtocol}
                  onChange={(val) => setTempProtocol(String(val || 'auto'))}
                  options={[
                    { value: 'auto', label: '自动探测 (ROS 2 Nav2 / ROS 1)' },
                    { value: 'ros2', label: '强制 ROS 2 (Nav2)' },
                    { value: 'ros1', label: '强制 ROS 1 (move_base)' }
                  ]}
                />
              </FormField>

              <FormField label="外部 Rosbridge WebSocket 地址" required>
                <Input
                  size="sm"
                  value={tempRosUrl}
                  onChange={(e) => setTempRosUrl(e.target.value)}
                  placeholder="ws://192.168.2.88:9090"
                  prefix={<Link2 className="h-3.5 w-3.5 text-[var(--abc-fg-muted)]" />}
                  allowClear
                  required
                />
              </FormField>
            </>
          )}

          <FormField
            label="机载摄像头视频流地址 (HTTP / MJPEG / RTSP)"
            helperText="支持直连小车 ESP32-CAM HTTP 流、RTSP 相机，或填入 /api/bot/camera.mjpeg 订阅本机 ROS 相机话题"
          >
            <Input
              size="sm"
              value={tempVideoUrl}
              onChange={(e) => setTempVideoUrl(e.target.value)}
              placeholder="http://192.168.2.165:81 或 /api/bot/camera.mjpeg"
              prefix={<Video className="h-3.5 w-3.5 text-[var(--abc-fg-muted)]" />}
              allowClear
            />
          </FormField>
        </form>
      </Dialog>
    </>
  );
}
