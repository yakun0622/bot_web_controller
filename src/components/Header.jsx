import React, { useState } from 'react';
import {
  Battery,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
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
  Select,
  StatusBadge,
  StatusTag,
  Tooltip,
  useAbcConfig
} from '@abc-design/react';
import { rosService } from '../services/rosService';

export default function Header({
  status,
  rosUrl,
  videoUrl,
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

  const [tempRosUrl, setTempRosUrl] = useState(rosUrl);
  const [tempVideoUrl, setTempVideoUrl] = useState(videoUrl);
  const [tempProtocol, setTempProtocol] = useState(rosProtocol);

  const openSettings = () => {
    setTempRosUrl(rosUrl);
    setTempVideoUrl(videoUrl);
    setTempProtocol(rosProtocol || 'auto');
    setShowSettingsModal(true);
  };

  const handleConnect = (e) => {
    e?.preventDefault?.();
    const nextRos = tempRosUrl.trim();
    const nextVideo = tempVideoUrl.trim();
    if (!nextRos) return;

    onSaveSettings({
      rosUrl: nextRos,
      videoUrl: nextVideo,
      rosProtocol: tempProtocol
    });
    setShowSettingsModal(false);
    toast.info(`正在连接至 ${nextRos}`);
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
    status === 'connecting'
      ? 'starting'
      : status === 'connected'
        ? 'active'
        : 'unavailable';

  const statusLabel =
    status === 'connecting'
      ? '连接中'
      : status === 'connected'
        ? `已连接 · ${detectedProtocol.toUpperCase()}`
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
              {!hasBattery && (
                <div className="text-[11px] leading-relaxed text-[var(--abc-fg-muted)]">
                  尚未收到 <code>/battery_state</code> 话题数据。连接机器人并发布电源状态后自动刷新。
                </div>
              )}
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

        {/* ROS Connection StatusBadge */}
        <StatusBadge
          status={mappedStatus}
          label={statusLabel}
          pulse={status === 'connecting'}
        />

        {/* Quick Reconnect Action when disconnected */}
        {status === 'disconnected' && (
          <Tooltip content={`立即重连 ${rosUrl}`}>
            <Button
              size="xs"
              variant="secondary"
              leftIcon={<RefreshCw className="h-3 w-3" />}
              onClick={() => {
                rosService.reconnect();
                toast.info(`正在尝试重连 ${rosUrl}`);
              }}
            >
              <span className="hidden sm:inline">重连</span>
            </Button>
          </Tooltip>
        )}

        <Divider orientation="vertical" className="hidden sm:inline-block" />

        {/* Connection Settings Button */}
        <Tooltip content="配置 ROS 协议栈、WebSocket 端点与摄像头流地址">
          <Button
            size="xs"
            variant="outline"
            leftIcon={<Settings className="h-3.5 w-3.5" />}
            onClick={openSettings}
          >
            <span className="hidden md:inline">连接配置</span>
          </Button>
        </Tooltip>
      </div>

      {/* 3-field Connection Settings Dialog */}
      <Dialog
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="机器人通信与视频流配置"
        description="支持 ROS 2 (Nav2) 与 ROS 1 (move_base) 双协议自动识别、断线退避重连及机载 HTTP / RTSP 视频流接入"
        size="md"
        fullscreenable={false}
        footer={
          <>
            <Button size="sm" variant="outline" onClick={() => setShowSettingsModal(false)}>
              取消
            </Button>
            <Button size="sm" variant="primary" onClick={handleConnect}>
              保存并重连
            </Button>
          </>
        }
      >
        <form onSubmit={handleConnect} className="space-y-4">
          <FormField
            label="ROS 协议栈与导航契约版本"
            helperText="自动探测将通过 rosbridge 话题图自动匹配 ROS 2 (/goal_pose, /plan) 或 ROS 1 (/move_base_simple/goal)"
          >
            <Select
              size="sm"
              value={tempProtocol}
              onChange={(val) => setTempProtocol(String(val || 'auto'))}
              options={[
                { value: 'auto', label: '自动探测 (推荐，兼容 ROS 2 Nav2 与 ROS 1)' },
                { value: 'ros2', label: '强制 ROS 2 (Nav2 · pkg/msg/Type)' },
                { value: 'ros1', label: '强制 ROS 1 (move_base · pkg/Type)' }
              ]}
            />
          </FormField>

          <FormField
            label="ROS Bridge WebSocket 地址"
            required
            helperText="示例: ws://192.168.2.88:9090 或 ws://localhost:9090（断线后将自动退避重连）"
          >
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

          <FormField
            label="机载摄像头视频流地址 (HTTP / MJPEG / RTSP)"
            helperText="原生 rtsp:// 流将自动通过内置 FFmpeg 代理转码为低延迟 MJPEG 预览"
          >
            <Input
              size="sm"
              value={tempVideoUrl}
              onChange={(e) => setTempVideoUrl(e.target.value)}
              placeholder="http://192.168.2.165:81 或 rtsp://192.168.2.88:554/live"
              prefix={<Video className="h-3.5 w-3.5 text-[var(--abc-fg-muted)]" />}
              allowClear
            />
          </FormField>
        </form>
      </Dialog>
    </>
  );
}
