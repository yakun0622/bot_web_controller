import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Compass,
  Crosshair,
  Map as MapIcon,
  MapPin,
  RefreshCw,
  RotateCcw,
  Settings,
  WifiOff,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  StatusBadge,
  StatusTag,
  Tooltip,
  useAbcConfig
} from '@abc-design/react';
import { rosService } from '../services/rosService';

function getOriginYaw(orientation) {
  if (!orientation) return 0;
  const { x = 0, y = 0, z = 0, w = 1 } = orientation;
  return Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
}

export default function MapViewer({
  status = 'disconnected',
  rosUrl = '',
  mapData,
  costmapData,
  scanData,
  robotPose,
  pathData,
  targetPose,
  waypoints = [],
  activeWaypointIndex = -1,
  multiPointNav = false,
  loopWaypoints = false,
  remainingDistance,
  estimatedTime,
  navigationRunning = false,
  mappingRunning = false,
  layers,
  isSettingInitialPose,
  setIsSettingInitialPose,
  isSettingGoalPose = false,
  setIsSettingGoalPose,
  onOpenSettings
}) {
  const { resolvedTheme, toast } = useAbcConfig();
  const isDark = resolvedTheme === 'dark';

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const offscreenMapRef = useRef(null);

  const [scale, setScale] = useState(2.4);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [viewportTick, setViewportTick] = useState(0);
  const [poseDrag, setPoseDrag] = useState(null);

  const activePointersRef = useRef(new Map());
  const panOriginRef = useRef({ x: 0, y: 0 });
  const pinchStateRef = useRef(null);

  const connected = status === 'connected';
  const hasMap = Boolean(mapData?.info && mapData?.data);

  const mapWidth = mapData?.info?.width || 0;
  const mapHeight = mapData?.info?.height || 0;
  const resolution = mapData?.info?.resolution || 0.05;
  const originYaw = useMemo(
    () => getOriginYaw(mapData?.info?.origin?.orientation),
    [mapData?.info?.origin?.orientation]
  );

  const originX = mapData?.info?.origin?.position?.x ?? (-mapWidth * resolution) / 2;
  const originY = mapData?.info?.origin?.position?.y ?? (-mapHeight * resolution) / 2;
  const halfW = (mapWidth * resolution) / 2;
  const halfH = (mapHeight * resolution) / 2;
  const mapCenterWorldX = hasMap
    ? originX + halfW * Math.cos(originYaw) - halfH * Math.sin(originYaw)
    : 0;
  const mapCenterWorldY = hasMap
    ? originY + halfW * Math.sin(originYaw) + halfH * Math.cos(originYaw)
    : 0;

  const isPoseToolActive = Boolean(connected && (isSettingInitialPose || isSettingGoalPose));

  useEffect(() => {
    if (!connected) {
      setPoseDrag(null);
      setIsSettingInitialPose?.(false);
      setIsSettingGoalPose?.(false);
    }
  }, [connected, setIsSettingInitialPose, setIsSettingGoalPose]);

  const handleResetView = () => {
    setScale(2.4);
    setOffset({ x: 0, y: 0 });
  };

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

      return { worldX, worldY, canvasX, canvasY };
    },
    [offset.x, offset.y, scale, mapCenterWorldX, mapCenterWorldY, resolution]
  );

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

  // Pre-bake OccupancyGrid + Costmap texture
  useEffect(() => {
    if (!layers.showMap && !layers.showCostmap) {
      offscreenMapRef.current = null;
      return;
    }
    const baseGrid = layers.showMap ? mapData : null;
    const costGrid = layers.showCostmap ? costmapData : null;
    const refGrid = baseGrid || costGrid;
    if (!refGrid?.info || !refGrid?.data) {
      offscreenMapRef.current = null;
      return;
    }

    const { width, height } = refGrid.info;
    if (!width || !height) return;

    let offCanvas = offscreenMapRef.current;
    if (!offCanvas || offCanvas.width !== width || offCanvas.height !== height) {
      offCanvas = document.createElement('canvas');
      offCanvas.width = width;
      offCanvas.height = height;
      offscreenMapRef.current = offCanvas;
    }

    const octx = offCanvas.getContext('2d');
    const imgData = octx.createImageData(width, height);
    const buf = imgData.data;

    const mapArr = baseGrid?.data;
    const costArr =
      costGrid?.info?.width === width && costGrid?.info?.height === height ? costGrid.data : null;

    const freeR = isDark ? 19 : 239;
    const freeG = isDark ? 31 : 246;
    const freeB = isDark ? 53 : 255;

    const wallR = isDark ? 100 : 148;
    const wallG = isDark ? 116 : 163;
    const wallB = isDark ? 139 : 184;

    const costR = isDark ? 56 : 59;
    const costG = isDark ? 189 : 130;
    const costB = isDark ? 248 : 246;

    for (let y = 0; y < height; y++) {
      const canvasRow = height - 1 - y;
      for (let x = 0; x < width; x++) {
        const srcIdx = y * width + x;
        const dstIdx = (canvasRow * width + x) * 4;

        const val = mapArr ? mapArr[srcIdx] : -1;
        const cVal = costArr ? costArr[srcIdx] : 0;

        if (val === 100) {
          buf[dstIdx] = wallR;
          buf[dstIdx + 1] = wallG;
          buf[dstIdx + 2] = wallB;
          buf[dstIdx + 3] = 255;
        } else if (layers.showCostmap && ((val > 0 && val < 100) || (cVal > 0 && cVal < 100))) {
          const intensity = Math.max(val > 0 && val < 100 ? val : 0, cVal > 0 && cVal < 100 ? cVal : 0);
          buf[dstIdx] = costR;
          buf[dstIdx + 1] = costG;
          buf[dstIdx + 2] = costB;
          buf[dstIdx + 3] = Math.min(185, Math.round(45 + intensity * 1.4));
        } else if (val === 0) {
          buf[dstIdx] = freeR;
          buf[dstIdx + 1] = freeG;
          buf[dstIdx + 2] = freeB;
          buf[dstIdx + 3] = 255;
        } else {
          buf[dstIdx + 3] = 0;
        }
      }
    }

    octx.putImageData(imgData, 0, 0);
    setViewportTick((n) => n + 1);
  }, [mapData, costmapData, layers.showMap, layers.showCostmap, isDark]);

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
      setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.5), 12.0));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture?.(e.pointerId);

    if (isPoseToolActive && e.button === 0) {
      const { worldX, worldY, canvasX, canvasY } = pxToWorld(e.clientX, e.clientY, canvas);
      const defaultTheta = isSettingInitialPose
        ? robotPose?.theta || 0
        : Math.atan2(worldY - (robotPose?.y || 0), worldX - (robotPose?.x || 0));

      setPoseDrag({
        pointerId: e.pointerId,
        mode: isSettingInitialPose ? 'initial' : 'goal',
        worldX,
        worldY,
        theta: defaultTheta,
        startPx: canvasX,
        startPy: canvasY,
        curPx: canvasX,
        curPy: canvasY
      });
      return;
    }

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = Array.from(activePointersRef.current.values());

    if (pts.length === 2) {
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      pinchStateRef.current = { startDist: Math.max(10, dist), startScale: scale };
      setIsPanning(false);
    } else if (pts.length === 1 && e.button === 0) {
      setIsPanning(true);
      panOriginRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    }
  };

  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (poseDrag && poseDrag.pointerId === e.pointerId) {
      const rect = canvas.getBoundingClientRect();
      const curPx = e.clientX - rect.left;
      const curPy = e.clientY - rect.top;
      const dx = curPx - poseDrag.startPx;
      const dy = curPy - poseDrag.startPy;

      const nextTheta = Math.hypot(dx, dy) >= 8 ? Math.atan2(-dy, dx) : poseDrag.theta;
      setPoseDrag((prev) => (prev ? { ...prev, curPx, curPy, theta: nextTheta } : null));
      return;
    }

    if (!activePointersRef.current.has(e.pointerId)) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = Array.from(activePointersRef.current.values());

    if (pts.length === 2 && pinchStateRef.current) {
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const ratio = dist / pinchStateRef.current.startDist;
      setScale(Math.min(Math.max(pinchStateRef.current.startScale * ratio, 0.5), 12.0));
    } else if (pts.length === 1 && isPanning) {
      setOffset({
        x: e.clientX - panOriginRef.current.x,
        y: e.clientY - panOriginRef.current.y
      });
    }
  };

  const handlePointerUpOrCancel = (e) => {
    if (poseDrag && poseDrag.pointerId === e.pointerId) {
      const { mode, worldX, worldY, theta } = poseDrag;
      const deg = ((theta * 180) / Math.PI).toFixed(0);
      setPoseDrag(null);

      if (mode === 'initial') {
        if (rosService.setInitialPose(worldX, worldY, theta)) {
          setIsSettingInitialPose?.(false);
          toast.success(`已发布初始位姿 (${worldX.toFixed(2)}, ${worldY.toFixed(2)}, θ=${deg}°)`);
        }
      } else if (rosService.setGoalPose(worldX, worldY, theta)) {
        if (!multiPointNav) {
          setIsSettingGoalPose?.(false);
        }
        toast.success(
          multiPointNav
            ? `已添加巡航航点 (${worldX.toFixed(2)}, ${worldY.toFixed(2)}, θ=${deg}°)`
            : `已下发导航目标 (${worldX.toFixed(2)}, ${worldY.toFixed(2)}, θ=${deg}°)`
        );
      }
      return;
    }

    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) {
      pinchStateRef.current = null;
    }
    if (activePointersRef.current.size === 0) {
      setIsPanning(false);
    }
  };

  const handleDoubleClick = (e) => {
    if (!connected || isPoseToolActive || !canvasRef.current) return;
    const { worldX, worldY } = pxToWorld(e.clientX, e.clientY, canvasRef.current);
    const naturalTheta = Math.atan2(worldY - (robotPose?.y || 0), worldX - (robotPose?.x || 0));
    if (rosService.setGoalPose(worldX, worldY, naturalTheta)) {
      toast.success(
        multiPointNav
          ? `已追加巡航航点 #${waypoints.length + 1} (${worldX.toFixed(2)}, ${worldY.toFixed(2)})`
          : `已下发导航目标 (${worldX.toFixed(2)}, ${worldY.toFixed(2)})`
      );
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (containerRef.current) {
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 0. Theme-adaptive backdrop + metric 1m grid
    ctx.fillStyle = isDark ? '#0b1120' : '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2 + offset.x;
    const cy = canvas.height / 2 + offset.y;

    const meterPx = (1.0 / resolution) * scale;
    if (meterPx >= 16) {
      ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(15, 23, 42, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gx = ((cx % meterPx) + meterPx) % meterPx; gx < canvas.width; gx += meterPx) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, canvas.height);
      }
      for (let gy = ((cy % meterPx) + meterPx) % meterPx; gy < canvas.height; gy += meterPx) {
        ctx.moveTo(0, gy);
        ctx.lineTo(canvas.width, gy);
      }
      ctx.stroke();
    }

    if (!connected) return;

    // 1. Blit pre-baked OccupancyGrid + Costmap texture
    if ((layers.showMap || layers.showCostmap) && offscreenMapRef.current) {
      const offCanvas = offscreenMapRef.current;
      const drawW = offCanvas.width * scale;
      const drawH = offCanvas.height * scale;

      ctx.save();
      ctx.translate(cx, cy);
      if (Math.abs(originYaw) > 1e-4) {
        ctx.rotate(-originYaw);
      }
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offCanvas, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    // 2. Multi-Point Patrol Route & Numbered Waypoints
    if (layers.showGoal && waypoints && waypoints.length > 0) {
      if (waypoints.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = isDark ? 'rgba(168, 85, 247, 0.55)' : 'rgba(147, 51, 234, 0.45)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        waypoints.forEach((wp, i) => {
          const { px, py } = worldToPx(wp.x, wp.y, canvas);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        if (loopWaypoints && waypoints.length > 2) {
          const firstPt = worldToPx(waypoints[0].x, waypoints[0].y, canvas);
          ctx.lineTo(firstPt.px, firstPt.py);
        }
        ctx.stroke();
        ctx.restore();
      }

      waypoints.forEach((wp, idx) => {
        const { px, py } = worldToPx(wp.x, wp.y, canvas);
        const isCurrent = idx === activeWaypointIndex;

        const tickLen = 15;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(-wp.theta) * tickLen, py + Math.sin(-wp.theta) * tickLen);
        ctx.strokeStyle = isCurrent ? '#f59e0b' : '#9333ea';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, 9, 0, 2 * Math.PI);
        ctx.fillStyle = isCurrent ? '#f59e0b' : '#9333ea';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px ui-monospace, SFMono-Regular, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(idx + 1), px, py + 0.5);
      });
    }

    // 3. Planned Path
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

    // 4. Laser Scan Points
    if (layers.showScan && scanData && scanData.length > 0) {
      ctx.fillStyle = isDark ? '#fb7185' : '#ef4444';
      scanData.forEach((pt) => {
        const { px, py } = worldToPx(pt.x, pt.y, canvas);
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // 5. Active Goal Target Marker
    if (layers.showGoal && targetPose) {
      const { px, py } = worldToPx(targetPose.x, targetPose.y, canvas);
      const gAngle = -(targetPose.theta || 0);

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(gAngle);

      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, 2 * Math.PI);
      ctx.fillStyle = isDark ? 'rgba(192, 132, 252, 0.26)' : 'rgba(168, 85, 247, 0.24)';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(16, 0);
      ctx.lineTo(11, -4);
      ctx.moveTo(16, 0);
      ctx.lineTo(11, 4);
      ctx.strokeStyle = isDark ? '#c084fc' : '#9333ea';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, 2 * Math.PI);
      ctx.fillStyle = isDark ? '#c084fc' : '#9333ea';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.restore();
    }

    // 6. Robot Pose Arrow
    if (layers.showRobot && robotPose && (hasMap || scanData?.length > 0)) {
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

    // 7. Interactive Pose-Vector Drag Preview
    if (poseDrag) {
      const { startPx, startPy, theta, mode } = poseDrag;
      const isInit = mode === 'initial';
      const strokeCol = isInit ? '#f59e0b' : '#9333ea';
      const arrowLen = Math.max(
        32,
        Math.min(72, Math.hypot(poseDrag.curPx - startPx, poseDrag.curPy - startPy))
      );
      const endX = startPx + Math.cos(-theta) * arrowLen;
      const endY = startPy + Math.sin(-theta) * arrowLen;

      ctx.save();
      ctx.beginPath();
      ctx.arc(startPx, startPy, 12, 0, 2 * Math.PI);
      ctx.fillStyle = isInit ? 'rgba(245, 158, 11, 0.25)' : 'rgba(147, 51, 234, 0.25)';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(startPx, startPy);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 3;
      ctx.stroke();

      const headAngle = Math.atan2(endY - startPy, endX - startPx);
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - 10 * Math.cos(headAngle - 0.45), endY - 10 * Math.sin(headAngle - 0.45));
      ctx.lineTo(endX - 10 * Math.cos(headAngle + 0.45), endY - 10 * Math.sin(headAngle + 0.45));
      ctx.closePath();
      ctx.fillStyle = strokeCol;
      ctx.fill();

      const degText = `${((theta * 180) / Math.PI).toFixed(0)}°`;
      ctx.font = 'bold 11px ui-monospace, SFMono-Regular, monospace';
      ctx.fillStyle = strokeCol;
      ctx.fillText(degText, endX + 10, endY - 8);
      ctx.restore();
    }
  }, [
    connected,
    hasMap,
    scale,
    offset,
    mapData,
    costmapData,
    scanData,
    robotPose,
    pathData,
    targetPose,
    waypoints,
    activeWaypointIndex,
    loopWaypoints,
    layers,
    isDark,
    resolution,
    originYaw,
    worldToPx,
    viewportTick,
    poseDrag
  ]);

  const promptText = isSettingInitialPose
    ? '按住地图拖拽箭头标定初始位置与朝向'
    : isSettingGoalPose
      ? multiPointNav
        ? '按住拖拽连续添加带朝向的巡航航点'
        : '按住地图拖拽箭头设定目标点与朝向'
      : multiPointNav
        ? '双击地图追加巡航航点（或点「设定目标」拖拽朝向）'
        : '双击地图快速前往（或点「设定目标」拖拽朝向）';

  const headerBadgeStatus = !connected
    ? status === 'connecting'
      ? 'starting'
      : 'unavailable'
    : mappingRunning
      ? 'running'
      : navigationRunning
        ? 'active'
        : 'paused';

  const headerBadgeLabel = !connected
    ? status === 'connecting'
      ? '连接握手中'
      : '未连接'
    : mappingRunning
      ? '建图中'
      : navigationRunning
        ? '导航就绪'
        : '待机';

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
            status={headerBadgeStatus}
            label={headerBadgeLabel}
            pulse={status === 'connecting'}
          />
          {isSettingInitialPose && (
            <StatusTag size="xs" tone="warning" dot>
              初始位姿标定
            </StatusTag>
          )}
          {isSettingGoalPose && (
            <StatusTag size="xs" tone="purple" dot>
              {multiPointNav ? '航点朝向编排' : '目标朝向设定'}
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
              onClick={() => setScale((s) => Math.min(s * 1.2, 12.0))}
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

          <Tooltip content="在地图上按住拖拽箭头，设定带精确朝向角的目标位姿">
            <Button
              size="xs"
              disabled={!connected}
              variant={isSettingGoalPose ? 'primary' : 'outline'}
              leftIcon={<Crosshair className="h-3.5 w-3.5" />}
              onClick={() => {
                const next = !isSettingGoalPose;
                setIsSettingGoalPose?.(next);
                if (next) setIsSettingInitialPose?.(false);
              }}
            >
              <span className="hidden sm:inline">{isSettingGoalPose ? '取消目标' : '设定目标'}</span>
            </Button>
          </Tooltip>

          <Tooltip content="在地图上按住拖拽箭头，标定机器人当前初始位置与朝向 (/initialpose)">
            <Button
              size="xs"
              disabled={!connected}
              variant={isSettingInitialPose ? 'primary' : 'warning'}
              leftIcon={<Compass className="h-3.5 w-3.5" />}
              onClick={() => {
                const next = !isSettingInitialPose;
                setIsSettingInitialPose?.(next);
                if (next) setIsSettingGoalPose?.(false);
              }}
            >
              <span className="hidden sm:inline">
                {isSettingInitialPose ? '取消标定' : '初始位姿'}
              </span>
            </Button>
          </Tooltip>

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
          cursor: !connected ? 'default' : isPoseToolActive ? 'crosshair' : isPanning ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
        className="relative flex-1 min-h-72 w-full overflow-hidden bg-[var(--abc-bg-muted)]"
      >
        {/* Top-Left Map Metadata Pill */}
        <div className="pointer-events-none absolute top-2.5 left-2.5 z-10 flex items-center gap-2 rounded-[var(--abc-radius-md)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)]/92 px-2.5 py-1 text-[11px] font-mono text-[var(--abc-fg-muted)] shadow-xs backdrop-blur-xs">
          <span>
            {hasMap ? `${mapWidth}×${mapHeight} (${resolution}m/px)` : '等待 /map 话题'}
          </span>
          <span>·</span>
          <span>{Math.round(scale * 100)}%</span>
        </div>

        {/* Center Interaction Prompt Pill (only when connected & map available) */}
        {connected && hasMap && (
          <div className="pointer-events-none absolute top-2.5 left-1/2 z-10 -translate-x-1/2 hidden sm:flex">
            <StatusTag
              size="sm"
              tone={isSettingInitialPose ? 'warning' : isSettingGoalPose ? 'purple' : 'primary'}
              icon={<MapPin className="h-3.5 w-3.5" />}
              dot={false}
            >
              {promptText}
            </StatusTag>
          </div>
        )}

        {/* Top-Right Telemetry & Navigation Progress HUD */}
        <div className="pointer-events-none absolute top-2.5 right-2.5 z-10 min-w-36 space-y-1.5 rounded-[var(--abc-radius-lg)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)]/92 px-3 py-2 text-xs shadow-xs backdrop-blur-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[var(--abc-fg-muted)]">剩余距离</span>
            <span className="font-mono font-semibold tabular-nums text-[var(--abc-fg)]">
              {connected ? `${(remainingDistance || 0).toFixed(2)} m` : '--'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[var(--abc-fg-muted)]">预计到达</span>
            <span className="font-mono font-semibold tabular-nums text-[var(--abc-fg)]">
              {connected ? `${(estimatedTime || 0).toFixed(1)} s` : '--'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[var(--abc-border)] pt-1 text-[11px]">
            <span className="text-[var(--abc-fg-muted)]">位姿 (X,Y,θ)</span>
            <span className="font-mono tabular-nums text-[var(--abc-fg-secondary)]">
              {connected
                ? `${(robotPose?.x || 0).toFixed(2)}, ${(robotPose?.y || 0).toFixed(2)}, ${(((robotPose?.theta || 0) * 180) / Math.PI).toFixed(0)}°`
                : '--'}
            </span>
          </div>
        </div>

        {/* Disconnected or Waiting-for-Map Overlay */}
        {(!connected || (!hasMap && (!scanData || scanData.length === 0))) && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
            <div className="pointer-events-auto max-w-sm rounded-[var(--abc-radius-xl)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)]/95 p-4 shadow-md backdrop-blur-xs">
              {!connected ? (
                <EmptyState
                  compact
                  icon={<WifiOff className="h-6 w-6 text-[var(--abc-fg-muted)]" />}
                  title={status === 'connecting' ? '正在连接 ROS Bridge...' : 'ROS Bridge 未连接'}
                  description={`目标地址: ${rosUrl || '未配置'}。请确认机器人端已启动 rosbridge_websocket，系统将在后台自动退避重连。`}
                  action={
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="xs"
                        variant="primary"
                        leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                        onClick={() => rosService.reconnect()}
                      >
                        立即重连
                      </Button>
                      {onOpenSettings && (
                        <Button
                          size="xs"
                          variant="outline"
                          leftIcon={<Settings className="h-3.5 w-3.5" />}
                          onClick={onOpenSettings}
                        >
                          连接配置
                        </Button>
                      )}
                    </div>
                  }
                />
              ) : (
                <EmptyState
                  compact
                  icon={<MapIcon className="h-6 w-6 text-[var(--abc-primary)]" />}
                  title="已连接，等待 /map 栅格地图数据"
                  description="ROS Bridge 通信正常，请确认机器人端已启动 map_server (Nav2) 或 slam_toolbox 建图节点。"
                />
              )}
            </div>
          </div>
        )}

        {/* SLAM Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUpOrCancel}
          onPointerCancel={handlePointerUpOrCancel}
          onDoubleClick={handleDoubleClick}
          className="block h-full w-full"
        />
      </div>
    </Card>
  );
}
