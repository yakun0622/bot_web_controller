import React, { useState } from 'react';
import {
  Compass,
  Crosshair,
  FolderOpen,
  Play,
  RefreshCw,
  Repeat,
  Route,
  Square,
  Trash2
} from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  FormField,
  Input,
  Select,
  StatusBadge,
  StatusTag,
  Switch,
  Tooltip,
  useAbcConfig
} from '@abc-design/react';
import { rosService } from '../services/rosService';

export default function NavigationControl({
  connected = false,
  isRunning,
  selectedMap,
  availableMaps = [],
  multiPointNav = false,
  loopWaypoints = false,
  waypoints = [],
  activeWaypointIndex = -1,
  onSetInitialPose,
  onSetGoalPose
}) {
  const { toast } = useAbcConfig();
  const [refreshing, setRefreshing] = useState(false);
  const [customMapInput, setCustomMapInput] = useState('');

  const mapOptions = availableMaps.map((m) => ({
    value: m,
    label: m
  }));

  const handleRefreshMaps = async () => {
    setRefreshing(true);
    try {
      const list = await rosService.refreshAvailableMaps();
      toast.info(
        list.length > 0
          ? `已同步地图列表（共 ${list.length} 张）`
          : '暂无已记录地图，可在下方直接输入机器人端 .yaml 地图路径加载'
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadCustomMap = async (e) => {
    e.preventDefault();
    const target = customMapInput.trim();
    if (!target) return;
    const ok = await rosService.setSelectedMap(target);
    if (ok) {
      toast.success(`已通知 map_server 加载地图「${target}」`);
      setCustomMapInput('');
    } else {
      toast.warning(`请求 /map_server/load_map 未响应，请确认文件路径与节点状态`);
    }
  };

  return (
    <Card
      size="sm"
      padding="sm"
      title="自主导航控制"
      extra={
        <StatusBadge
          status={!connected ? 'unavailable' : isRunning ? 'active' : 'paused'}
          label={!connected ? '离线' : isRunning ? '运行中' : '待机'}
        />
      }
    >
      <div className="space-y-3">
        {mapOptions.length > 0 && (
          <FormField label="已保存 / 发现的地图">
            <div className="flex items-center gap-1.5">
              <div className="min-w-0 flex-1">
                <Select
                  size="sm"
                  disabled={!connected}
                  value={selectedMap}
                  placeholder="选择要加载的地图..."
                  options={mapOptions}
                  onChange={async (val) => {
                    if (val) {
                      const ok = await rosService.setSelectedMap(String(val));
                      if (ok) toast.success(`已加载地图「${val}」`);
                    }
                  }}
                />
              </div>
              <Tooltip content="同步远端可用地图列表">
                <Button
                  size="icon-sm"
                  variant="outline"
                  disabled={!connected}
                  loading={refreshing}
                  aria-label="刷新地图列表"
                  onClick={handleRefreshMaps}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>
            </div>
          </FormField>
        )}

        <form onSubmit={handleLoadCustomMap}>
          <FormField label={mapOptions.length > 0 ? '或指定地图路径加载' : '加载机器人端地图 (.yaml)'}>
            <div className="flex items-center gap-1.5">
              <div className="min-w-0 flex-1">
                <Input
                  size="sm"
                  disabled={!connected}
                  value={customMapInput}
                  onChange={(e) => setCustomMapInput(e.target.value)}
                  placeholder="如 room.yaml 或绝对路径..."
                  allowClear
                />
              </div>
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={!connected || !customMapInput.trim()}
                leftIcon={<FolderOpen className="h-3.5 w-3.5" />}
              >
                加载
              </Button>
              {mapOptions.length === 0 && (
                <Tooltip content="查询远端地图列表服务">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    disabled={!connected}
                    loading={refreshing}
                    aria-label="刷新地图列表"
                    onClick={handleRefreshMaps}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
              )}
            </div>
          </FormField>
        </form>

        <Button
          size="sm"
          disabled={!connected}
          variant={isRunning ? 'danger' : 'primary'}
          block
          leftIcon={isRunning ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          onClick={() => {
            if (rosService.toggleNavigationMode()) {
              toast.info(isRunning ? '自主导航已停止并取消活动目标' : '自主导航已启用');
            }
          }}
        >
          {isRunning ? '停止导航并取消目标' : '启用自主导航'}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            disabled={!connected}
            variant="warning"
            leftIcon={<Compass className="h-3.5 w-3.5" />}
            onClick={onSetInitialPose}
          >
            初始位姿
          </Button>

          <Button
            size="sm"
            disabled={!connected}
            variant="outline"
            leftIcon={<Crosshair className="h-3.5 w-3.5" />}
            onClick={onSetGoalPose}
          >
            设定目标
          </Button>
        </div>

        {/* Multi-Point Patrol Controls */}
        <div className="space-y-2 rounded-[var(--abc-radius-md)] border border-[var(--abc-border)] bg-[var(--abc-bg-muted)]/60 p-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="h-3.5 w-3.5 text-[var(--abc-primary)]" />
              <span className="font-medium text-[var(--abc-fg)]">多点巡航编排</span>
              {waypoints.length > 0 && (
                <StatusTag size="xs" tone="purple" dot={false}>
                  {activeWaypointIndex >= 0
                    ? `${activeWaypointIndex + 1}/${waypoints.length}`
                    : `${waypoints.length} 点`}
                </StatusTag>
              )}
            </div>
            <Switch
              size="sm"
              disabled={!connected}
              ariaLabel="切换多点巡航模式"
              checked={multiPointNav}
              onChange={(checked) => {
                rosService.setMultiPointNav(checked);
                toast.info(
                  checked ? '多点巡航已开启：双击地图可连续追加航点' : '已切回单点导航模式'
                );
              }}
            />
          </div>

          {multiPointNav && (
            <div className="space-y-2 border-t border-[var(--abc-border)] pt-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[var(--abc-fg-muted)]">
                  <Repeat className="h-3 w-3" />
                  <span>首尾闭合循环巡航</span>
                </span>
                <Switch
                  size="xs"
                  disabled={!connected}
                  ariaLabel="切换循环巡航"
                  checked={loopWaypoints}
                  onChange={(checked) => rosService.setLoopWaypoints(checked)}
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  size="xs"
                  variant="primary"
                  className="flex-1"
                  disabled={!connected || waypoints.length === 0}
                  leftIcon={<Play className="h-3 w-3" />}
                  onClick={() => {
                    if (rosService.startWaypointPatrol()) {
                      toast.success(`开始执行 ${waypoints.length} 点连续巡航`);
                    }
                  }}
                >
                  执行巡航 ({waypoints.length})
                </Button>
                <Tooltip content="清空全部巡航航点">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    disabled={waypoints.length === 0}
                    aria-label="清空航点"
                    onClick={() => {
                      rosService.clearWaypoints();
                      toast.info('已清空巡航航点队列');
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          )}
        </div>

        <Alert
          tone="info"
          showIcon
          description={
            multiPointNav
              ? '双击地图可依次添加有序巡航点；点击「设定目标」可在地图拖拽指定每个航点朝向角。'
              : '连接真机后，双击地图可快速前往目标点；点击「初始位姿」或「设定目标」可按住拖拽方向箭头。'
          }
        />
      </div>
    </Card>
  );
}
