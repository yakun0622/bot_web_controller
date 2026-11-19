import React, { useState } from 'react';
import { Compass, Play, RefreshCw, Route, Square } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  FormField,
  Select,
  StatusBadge,
  Switch,
  Tooltip,
  useAbcConfig
} from '@abc-design/react';
import { rosService } from '../services/rosService';

export default function NavigationControl({
  isRunning,
  selectedMap,
  availableMaps,
  onSetInitialPose
}) {
  const { toast } = useAbcConfig();
  const [multiPointNav, setMultiPointNav] = useState(false);

  const mapOptions = (availableMaps || ['test_room']).map((m) => ({
    value: m,
    label: m
  }));

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
            <Tooltip content="刷新可用地图列表">
              <Button
                size="icon-sm"
                variant="outline"
                aria-label="刷新地图列表"
                onClick={() => toast.success(`已同步地图库（共 ${mapOptions.length} 张地图）`)}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant={isRunning ? 'danger' : 'primary'}
            leftIcon={isRunning ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            onClick={() => {
              rosService.toggleNavigationMode();
              toast.info(isRunning ? '自主导航已暂停' : '自主导航已启动');
            }}
          >
            {isRunning ? '停止导航' : '开始导航'}
          </Button>

          <Button
            size="sm"
            variant="warning"
            leftIcon={<Compass className="h-3.5 w-3.5" />}
            onClick={onSetInitialPose}
          >
            初始位姿
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-[var(--abc-radius-md)] border border-[var(--abc-border)] bg-[var(--abc-bg-muted)]/60 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <Route className="h-3.5 w-3.5 text-[var(--abc-primary)]" />
            <span className="font-medium text-[var(--abc-fg)]">多点巡航模式</span>
          </div>
          <Switch
            size="sm"
            ariaLabel="切换多点巡航模式"
            checked={multiPointNav}
            onChange={(checked) => {
              setMultiPointNav(checked);
              toast.info(checked ? '多点巡航模式已开启' : '已切回单点导航模式');
            }}
          />
        </div>

        <Alert
          tone="info"
          showIcon
          description="双击中央栅格地图任意自由区域即可立即下发 2D 导航目标点。"
        />
      </div>
    </Card>
  );
}
