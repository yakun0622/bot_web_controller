import React, { useState } from 'react';
import {
  Compass,
  Crosshair,
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
  Select,
  StatusBadge,
  StatusTag,
  Switch,
  Tooltip,
  useAbcConfig
} from '@abc-design/react';
import { rosService } from '../services/rosService';

export default function NavigationControl({
  isRunning,
  selectedMap,
  availableMaps,
  multiPointNav = false,
  loopWaypoints = false,
  waypoints = [],
  activeWaypointIndex = -1,
  onSetInitialPose,
  onSetGoalPose
}) {
  const { toast } = useAbcConfig();
  const [refreshing, setRefreshing] = useState(false);

  const mapOptions = (availableMaps || ['test_room']).map((m) => ({
    value: m,
    label: m
  }));

  const handleRefreshMaps = async () => {
    setRefreshing(true);
    try {
      const list = await rosService.refreshAvailableMaps();
      toast.success(`已同步地图库（共 ${list.length} 张地图）`);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card
      size="sm"
      padding="sm"
      title="自主导航控制"
      extra={
        <StatusBadge
          status={isRunning ? 'active' : 'paused'}
          label={isRunning ? '运行中' : '已暂停'}
        />
      }
    >
      <div className="space-y-3">
        <FormField label="活动导航地图">
          <div className="flex items-center gap-1.5">
            <div className="min-w-0 flex-1">
              <Select
                size="sm"
                value={selectedMap}
                options={mapOptions}
                onChange={(val) => {
                  if (val) {
                    rosService.setSelectedMap(String(val));
                    toast.info(`已切换活动地图为「${val}」`);
                  }
                }}
              />
            </div>
            <Tooltip content="同步远端可用地图列表">
              <Button
                size="icon-sm"
                variant="outline"
                loading={refreshing}
                aria-label="刷新地图列表"
                onClick={handleRefreshMaps}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
          </div>
        </FormField>

        <Button
          size="sm"
          variant={isRunning ? 'danger' : 'primary'}
          block
          leftIcon={isRunning ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          onClick={() => {
            rosService.toggleNavigationMode();
            toast.info(isRunning ? '自主导航已停止并取消活动目标' : '自主导航已启动');
          }}
        >
          {isRunning ? '停止自主导航' : '启动自主导航'}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="warning"
            leftIcon={<Compass className="h-3.5 w-3.5" />}
            onClick={onSetInitialPose}
          >
            初始位姿
          </Button>

          <Button
            size="sm"
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
                  disabled={waypoints.length === 0}
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
              : '双击地图可快速前往目标点；点击「初始位姿」或「设定目标」可在地图按住拖拽方向箭头。'
          }
        />
      </div>
    </Card>
  );
}
