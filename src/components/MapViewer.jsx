import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Compass, MapPin, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import {
  Button,
  Card,
  StatusBadge,
  StatusTag,
  Tooltip,
  useAbcConfig
} from '@abc-design/react';
import { rosService } from '../services/rosService';

export default function MapViewer({
  mapData,
  scanData,
  robotPose,
  pathData,
  targetPose,
  remainingDistance,
  estimatedTime,
  navigationRunning = true,
  mappingRunning = false,
  layers,
  isSettingInitialPose,
  setIsSettingInitialPose
}) {
  const { resolvedTheme, toast } = useAbcConfig();
  const isDark = resolvedTheme === 'dark';

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Canvas pan & zoom state
  const [scale, setScale] = useState(2.4);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [viewportTick, setViewportTick] = useState(0);

  const mapWidth = mapData?.info?.width || 120;
  const mapHeight = mapData?.info?.height || 120;
  const resolution = mapData?.info?.resolution || 0.05;

  // Compute true world coordinate of the map grid center (respects ROS OccupancyGrid origin)
  const originX = mapData?.info?.origin?.position?.x ?? (-mapWidth * resolution) / 2;
  const originY = mapData?.info?.origin?.position?.y ?? (-mapHeight * resolution) / 2;
  const mapCenterWorldX = originX + (mapWidth * resolution) / 2;
  const mapCenterWorldY = originY + (mapHeight * resolution) / 2;

  const handleResetView = () => {
    setScale(2.4);
    setOffset({ x: 0, y: 0 });
  };

  // Convert canvas pixel mouse coords to ROS world coords (meters)
  const pxToWorld = useCallback(
    (clientX, clientY, canvas) => {
      const rect = canvas.getBoundingClientRect();
      const cx = canvas.width / 2 + offset.x;
      const cy = canvas.height / 2 + offset.y;

      const canvasX = clientX - rect.left;
      const canvasY = clientY - rect.top;

      const relX = (canvasX - cx) / scale;
      const relY = (canvasY - cy) / scale;

      const worldX = mapCenterWorldX + relX * resolution;
      const worldY = mapCenterWorldY - relY * resolution;

      return { worldX, worldY };
    },
    [offset.x, offset.y, scale, mapCenterWorldX, mapCenterWorldY, resolution]
  );

  // Convert ROS world coords (meters) to canvas pixel coords
  const worldToPx = useCallback(
    (wx, wy, canvas) => {
      const cx = canvas.width / 2 + offset.x;
      const cy = canvas.height / 2 + offset.y;

      const relX = ((wx - mapCenterWorldX) / resolution) * scale;
      const relY = (-(wy - mapCenterWorldY) / resolution) * scale;

      return { px: cx + relX, py: cy + relY };
    },
    [offset.x, offset.y, scale, mapCenterWorldX, mapCenterWorldY, resolution]
  );

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Observe container resize so switching ProLayout modes or resizing split panes redraws crisply
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => {
      setViewportTick((n) => n + 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.5), 10.0));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  const handleDoubleClick = (e) => {
    if (!canvasRef.current) return;
    const { worldX, worldY } = pxToWorld(e.clientX, e.clientY, canvasRef.current);

    if (isSettingInitialPose) {
      rosService.setInitialPose(worldX, worldY, 0);
      setIsSettingInitialPose(false);
      toast.success(`已标定初始位姿 (${worldX.toFixed(2)}, ${worldY.toFixed(2)})`);
    } else {
      rosService.setGoalPose(worldX, worldY, 0);
      toast.success(`已设定导航目标 (${worldX.toFixed(2)}, ${worldY.toFixed(2)})`);
    }
  };

  // Theme-aware SLAM Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (containerRef.current) {
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 0. Theme-adaptive canvas backdrop + subtle metric grid
    ctx.fillStyle = isDark ? '#0b1120' : '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2 + offset.x;
    const cy = canvas.height / 2 + offset.y;

    const meterPx = (1.0 / resolution) * scale;
    if (meterPx >= 18) {
      ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(15, 23, 42, 0.045)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gx = cx % meterPx; gx < canvas.width; gx += meterPx) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, canvas.height);
      }
      for (let gy = cy % meterPx; gy < canvas.height; gy += meterPx) {
        ctx.moveTo(0, gy);
        ctx.lineTo(canvas.width, gy);
      }
      ctx.stroke();
    }

    // 1. Draw Occupancy Grid Map
    if (layers.showMap && mapData && mapData.data) {
      const { width, height } = mapData.info;
      const cellPx = scale;

      const startPxX = cx - (width / 2) * cellPx;
      const startPxY = cy - (height / 2) * cellPx;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const val = mapData.data[y * width + x];
          let color = null;

          if (val === 100) {
            color = isDark ? '#475569' : '#cbd5e1';
          } else if (val === 0) {
            color = isDark ? '#131f35' : '#eff6ff';
          } else if (val > 0 && layers.showCostmap) {
            color = isDark ? 'rgba(56, 189, 248, 0.28)' : 'rgba(96, 165, 250, 0.4)';
          }

          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(
              startPxX + x * cellPx,
              startPxY + (height - 1 - y) * cellPx,
              cellPx + 0.5,
              cellPx + 0.5
            );
          }
        }
      }
    }

    // 2. Draw Planned Path
    if (layers.showPath && pathData && pathData.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = isDark ? '#22d3ee' : '#06b6d4';
      ctx.lineWidth = 2.8;
      ctx.setLineDash([5, 4]);

      pathData.forEach((pt, idx) => {
        const { px, py } = worldToPx(pt.x, pt.y, canvas);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Draw Laser Scan Points
    if (layers.showScan && scanData && scanData.length > 0) {
      ctx.fillStyle = isDark ? '#fb7185' : '#ef4444';
      scanData.forEach((pt) => {
        const { px, py } = worldToPx(pt.x, pt.y, canvas);
        ctx.beginPath();
        ctx.arc(px, py, 2.3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // 4. Draw Goal Target Marker
    if (layers.showGoal && targetPose) {
      const { px, py } = worldToPx(targetPose.x, targetPose.y, canvas);
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, 2 * Math.PI);
      ctx.fillStyle = isDark ? 'rgba(192, 132, 252, 0.28)' : 'rgba(168, 85, 247, 0.28)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, 2 * Math.PI);
      ctx.fillStyle = isDark ? '#c084fc' : '#9333ea';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    // 5. Draw Robot Pose (Directional Arrow)
    if (layers.showRobot && robotPose) {
      const { px, py } = worldToPx(robotPose.x, robotPose.y, canvas);
      const angle = -robotPose.theta;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, 2 * Math.PI);
      ctx.fillStyle = isDark ? 'rgba(59, 130, 246, 0.28)' : 'rgba(37, 99, 235, 0.2)';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-7, -7);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-7, 7);
      ctx.closePath();
      ctx.fillStyle = isDark ? '#3b82f6' : '#2563eb';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    }
  }, [
    scale,
    offset,
    mapData,
    scanData,
    robotPose,
    pathData,
    targetPose,
    layers,
    isDark,
    resolution,
    worldToPx,
    viewportTick
  ]);

  return (
    <Card
      size="sm"
      padding="none"
      className="bot-map-card"
      bodyClassName="relative flex flex-1 min-h-0 flex-col"
      title={
        <div className="flex flex-wrap items-center gap-2">
          <span>SLAM 栅格地图</span>
          <StatusBadge
            status={mappingRunning ? 'running' : navigationRunning ? 'active' : 'paused'}
            label={mappingRunning ? '建图中' : navigationRunning ? '导航就绪' : '导航待机'}
          />
          {isSettingInitialPose && (
            <StatusTag size="xs" tone="primary" dot>
              位姿标定模式
            </StatusTag>
          )}
        </div>
      }
      extra={
        <div className="flex items-center gap-1.5">
          <Tooltip content="放大地图">
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="放大地图"
              onClick={() => setScale((s) => Math.min(s * 1.2, 10.0))}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>

          <Tooltip content="缩小地图">
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="缩小地图"
              onClick={() => setScale((s) => Math.max(s * 0.8, 0.5))}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>

          <Button
            size="xs"
            variant={isSettingInitialPose ? 'primary' : 'warning'}
            leftIcon={<Compass className="h-3.5 w-3.5" />}
            onClick={() => setIsSettingInitialPose(!isSettingInitialPose)}
          >
            <span className="hidden sm:inline">
              {isSettingInitialPose ? '取消标定' : '初始位姿'}
            </span>
          </Button>

          <Tooltip content="复位视图中心与缩放比例">
            <Button
              size="xs"
              variant="outline"
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={handleResetView}
            >
              <span className="hidden sm:inline">重置</span>
            </Button>
          </Tooltip>
        </div>
      }
    >
      <div
        ref={containerRef}
        style={{
          cursor: isPanning ? 'grabbing' : isSettingInitialPose ? 'crosshair' : 'grab'
        }}
        className="relative flex-1 min-h-72 w-full overflow-hidden bg-[var(--abc-bg-muted)]"
      >
        {/* Top-Left Map Metadata Pill */}
        <div className="pointer-events-none absolute top-2.5 left-2.5 z-10 flex items-center gap-2 rounded-[var(--abc-radius-md)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)]/92 px-2.5 py-1 text-[11px] font-mono text-[var(--abc-fg-muted)] shadow-xs backdrop-blur-xs">
          <span>
            {mapWidth}×{mapHeight} ({resolution}m/px)
          </span>
          <span>·</span>
          <span>{Math.round(scale * 100)}%</span>
        </div>

        {/* Center Interaction Prompt Pill */}
        <div className="pointer-events-none absolute top-2.5 left-1/2 z-10 -translate-x-1/2 hidden sm:flex">
          <StatusTag
            size="sm"
            tone={isSettingInitialPose ? 'warning' : 'primary'}
            icon={<MapPin className="h-3.5 w-3.5" />}
            dot={false}
          >
            {isSettingInitialPose ? '双击地图标定初始位姿' : '双击地图设定导航目标点'}
          </StatusTag>
        </div>

        {/* Top-Right Telemetry & Navigation Progress HUD */}
        <div className="pointer-events-none absolute top-2.5 right-2.5 z-10 min-w-36 space-y-1.5 rounded-[var(--abc-radius-lg)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)]/92 px-3 py-2 text-xs shadow-xs backdrop-blur-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[var(--abc-fg-muted)]">剩余距离</span>
            <span className="font-mono font-semibold tabular-nums text-[var(--abc-fg)]">
              {(remainingDistance || 0).toFixed(2)} m
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[var(--abc-fg-muted)]">预计到达</span>
            <span className="font-mono font-semibold tabular-nums text-[var(--abc-fg)]">
              {(estimatedTime || 0).toFixed(1)} s
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[var(--abc-border)] pt-1 text-[11px]">
            <span className="text-[var(--abc-fg-muted)]">位姿 (X,Y)</span>
            <span className="font-mono tabular-nums text-[var(--abc-fg-secondary)]">
              {(robotPose?.x || 0).toFixed(2)}, {(robotPose?.y || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* SLAM Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          className="block h-full w-full"
        />
      </div>
    </Card>
  );
}
