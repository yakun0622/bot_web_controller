import React, { useState } from 'react';
import {
  Battery,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  Link2,
  PlayCircle,
  Settings,
  Video,
  Zap
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
  Switch,
  Tooltip,
  useAbcConfig
} from '@abc-design/react';
import { rosService } from '../services/rosService';

export default function Header({
  status,
  isSimulated,
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

  const pct = battery?.percentage ?? 86;
  const isCharging = Boolean(battery?.isCharging);

  const batteryVariant = isCharging
    ? 'success'
    : pct <= 20
      ? 'danger'
      : pct <= 55
        ? 'warning'
        : 'success';

  const renderBatteryIcon = () => {
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
        ? isSimulated
          ? '在线 · 仿真'
          : `已连接 · ${detectedProtocol.toUpperCase()}`
        : '未连接';

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Battery Popover */}
        <Popover
          placement="bottomRight"
          title={
            <div className="flex items-center justify-between gap-3">
              <span>动力电池状态</span>
              <StatusTag
                size="xs"
                tone={isCharging ? 'success' : pct <= 20 ? 'danger' : 'info'}
                dot
              >
                {isCharging ? '充电中' : '放电中'}
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
                  { key: 'pct', label: '剩余电量', value: `${pct}%`, mono: true },
                  {
                    key: 'volt',
                    label: '母线电压',
                    value: `${(battery?.voltage ?? 12.4).toFixed(1)} V`,
                    mono: true
                  },
                  {
                    key: 'curr',
                    label: '实时电流',
                    value: `${(battery?.current ?? -1.2).toFixed(1)} A`,
                    mono: true
                  }
                ]}
              />
              {isSimulated && (
                <Button
                  size="xs"
                  variant="outline"
                  block
                  leftIcon={<Zap className="h-3.5 w-3.5 text-amber-500" />}
                  onClick={() => {
                    rosService.toggleSimCharging();
                    toast.info(isCharging ? '已模拟拔出充电器' : '已模拟接入充电桩');
                  }}
                >
                  {isCharging ? '模拟拔掉充电器' : '模拟接入充电桩'}
                </Button>
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
            <span className="font-mono font-semibold">{pct}%</span>
            <span className="hidden sm:inline font-mono text-[11px] text-[var(--abc-fg-muted)]">
              {(battery?.voltage ?? 12.4).toFixed(1)}V
            </span>
          </Button>
        </Popover>

        {/* Simulation Mode Switch */}
        <Tooltip content={isSimulated ? '关闭仿真并重连真机 ROS Bridge' : '开启内置无硬件仿真模式'}>
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-[var(--abc-radius-md)] border border-[var(--abc-border)] bg-[var(--abc-bg-muted)]/70 px-2.5 py-1 text-xs">
            <PlayCircle
              className="h-3.5 w-3.5"
              style={{ color: isSimulated ? 'var(--abc-primary)' : 'var(--abc-fg-muted)' }}
            />
            <span className="font-medium text-[var(--abc-fg-secondary)]">仿真</span>
            <Switch
              size="xs"
              ariaLabel="切换仿真模式"
              checked={isSimulated}
              onChange={(checked) => {
                if (checked) {
                  rosService.setSimulationMode(true);
                  toast.success('已切换至内置仿真模式');
                } else {
                  rosService.connect(rosUrl, {
                    fallbackToSimulation: true,
                    rosProtocol
                  });
                  toast.info(`正在尝试连接真机 ${rosUrl}`);
                }
              }}
            />
          </div>
        </Tooltip>

        {/* ROS Connection StatusBadge */}
        <StatusBadge
          status={mappedStatus}
          label={statusLabel}
          pulse={status === 'connecting'}
        />

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
        description="支持 ROS 2 (Nav2) 与 ROS 1 (move_base) 双协议自动识别及机载 HTTP / RTSP 视频流接入"
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
            helperText="示例: ws://192.168.2.88:9090 或 ws://localhost:9090（连接超时自动进入内置仿真模式）"
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
