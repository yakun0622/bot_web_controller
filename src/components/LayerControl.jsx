import React from 'react';
import { Button, Card, Switch } from '@abc-design/react';

const LAYER_ITEMS = [
  { key: 'showMap', label: '栅格底图 (OccupancyGrid)', dotColor: '#3b82f6' },
  { key: 'showCostmap', label: '膨胀代价层 (Costmap)', dotColor: '#38bdf8' },
  { key: 'showScan', label: '激光雷达点云 (LaserScan)', dotColor: '#ef4444' },
  { key: 'showRobot', label: '机器人本体位姿 (AMCL)', dotColor: '#2563eb' },
  { key: 'showPath', label: '全局规划路径 (NavPlan)', dotColor: '#06b6d4' },
  { key: 'showGoal', label: '目标航点标记 (GoalPose)', dotColor: '#9333ea' }
];

export default function LayerControl({ layers, onToggleLayer, onEnableAllLayers }) {
  const allVisible = LAYER_ITEMS.every((item) => Boolean(layers[item.key]));

  return (
    <Card
      size="sm"
      padding="sm"
      title="图层渲染控制"
      extra={
        !allVisible && onEnableAllLayers ? (
          <Button size="xs" variant="ghost" onClick={onEnableAllLayers}>
            全部显示
          </Button>
        ) : null
      }
    >
      <div className="divide-y divide-[var(--abc-border)]">
        {LAYER_ITEMS.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-2 py-2 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                aria-hidden="true"
                style={{ backgroundColor: item.dotColor }}
                className="h-2 w-2 shrink-0 rounded-full"
              />
              <span className="truncate text-[var(--abc-fg-secondary)]">{item.label}</span>
            </div>
            <Switch
              size="sm"
              ariaLabel={`切换${item.label}`}
              checked={Boolean(layers[item.key])}
              onChange={() => onToggleLayer(item.key)}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
