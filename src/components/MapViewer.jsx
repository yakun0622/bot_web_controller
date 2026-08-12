import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, MapPin, ZoomIn, ZoomOut, Compass } from 'lucide-react';
import { rosService } from '../services/rosService';

export default function MapViewer({
  mapData,
  scanData,
  robotPose,
  pathData,
  targetPose,
  remainingDistance,
  estimatedTime,
  layers,
  isSettingInitialPose,
  setIsSettingInitialPose
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Canvas pan & zoom state
  const [scale, setScale] = useState(2.2); // zoom scale
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // pan offset in px
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Map info overlay values
  const mapWidth = mapData?.info?.width || 384;
  const mapHeight = mapData?.info?.height || 384;

  const handleResetView = () => {
    setScale(2.2);
    setOffset({ x: 0, y: 0 });
  };

  // Convert canvas pixel mouse coords to world ROS coords (meters)
  const pxToWorld = (px, py, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const cx = canvas.width / 2 + offset.x;
    const cy = canvas.height / 2 + offset.y;

    const canvasX = px - rect.left;
    const canvasY = py - rect.top;

    const relX = (canvasX - cx) / scale;
    const relY = (canvasY - cy) / scale;

    const resolution = mapData?.info?.resolution || 0.05;
    const worldX = relX * resolution;
    const worldY = -relY * resolution; // inverted Y axis for ROS coords

    return { worldX, worldY };
  };

  // Convert ROS world coords (meters) to canvas pixel coords
  const worldToPx = (wx, wy, canvas) => {
    const resolution = mapData?.info?.resolution || 0.05;
    const cx = canvas.width / 2 + offset.x;
    const cy = canvas.height / 2 + offset.y;

    const relX = (wx / resolution) * scale;
    const relY = (-wy / resolution) * scale;

    return { px: cx + relX, py: cy + relY };
  };

  // Canvas Mouse Interaction: Drag pan, Wheel zoom, DoubleClick nav goal
  const handleMouseDown = (e) => {
    if (e.button === 0) { // left click
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
    } else {
      rosService.setGoalPose(worldX, worldY, 0);
    }
  };

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Resize canvas to fill parent container
    if (containerRef.current) {
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const resolution = mapData?.info?.resolution || 0.05;
    const cx = canvas.width / 2 + offset.x;
    const cy = canvas.height / 2 + offset.y;

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
            color = null; // Keep occupied cells in map data, but do not render blue walls
          } else if (val === 0) {
            color = '#eff6ff'; // Free space (light blue tint matching image.png)
          } else if (val > 0 && layers.showCostmap) {
            color = 'rgba(96, 165, 250, 0.4)'; // Costmap inflation layer
          }

          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(startPxX + x * cellPx, startPxY + (height - 1 - y) * cellPx, cellPx + 0.5, cellPx + 0.5);
          }
        }
      }
    }

    // 2. Draw Planned Path (cyan line matching image.png)
    if (layers.showPath && pathData && pathData.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);

      pathData.forEach((pt, idx) => {
        const { px, py } = worldToPx(pt.x, pt.y, canvas);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Draw Laser Scan Points (red dots matching image.png)
    if (layers.showScan && scanData && scanData.length > 0) {
      ctx.fillStyle = '#ef4444';
      scanData.forEach((pt) => {
        const { px, py } = worldToPx(pt.x, pt.y, canvas);
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // 4. Draw Goal Target Marker (flag/crosshair)
    if (layers.showGoal && targetPose) {
      const { px, py } = worldToPx(targetPose.x, targetPose.y, canvas);
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#9333ea';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 5. Draw Robot Pose (Triangle Arrow)
    if (layers.showRobot && robotPose) {
      const { px, py } = worldToPx(robotPose.x, robotPose.y, canvas);
      const angle = -robotPose.theta; // inverted theta for canvas Y axis

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);

      // Robot outer halo
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
      ctx.fill();

      // Triangle body
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-7, -7);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-7, 7);
      ctx.closePath();
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    }
  }, [scale, offset, mapData, scanData, robotPose, pathData, targetPose, layers]);

  return (
    <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header bar */}
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>SLAM 栅格地图</span>
          <span className="tag-badge green">导航中</span>
          {isSettingInitialPose && (
            <span className="tag-badge blue">请在地图上点击设置位姿</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn ${isSettingInitialPose ? 'btn-primary' : 'btn-warning-light'}`}
            style={{ padding: '5px 10px', fontSize: 12 }}
            onClick={() => setIsSettingInitialPose(!isSettingInitialPose)}
          >
            <Compass size={14} />
            <span>设置初始位置</span>
          </button>

          <button
            className="btn btn-outline"
            style={{ padding: '5px 10px', fontSize: 12 }}
            onClick={handleResetView}
          >
            <RotateCcw size={14} />
            <span>重置视图</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#f8fafc',
          cursor: isPanning ? 'grabbing' : isSettingInitialPose ? 'crosshair' : 'grab'
        }}
      >
        {/* Map Top-Left Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(4px)',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 12,
            color: '#64748b',
            boxShadow: 'var(--shadow-sm)',
            pointerEvents: 'none'
          }}
        >
          {mapWidth} × {mapHeight} | 缩放: {Math.round(scale * 100)}%
        </div>

        {/* Center Pill Tip */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#e0e7ff',
            color: '#4338ca',
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            boxShadow: '0 2px 6px rgba(99, 102, 241, 0.2)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <MapPin size={14} />
          <span>{isSettingInitialPose ? '单击地图设置初始位姿' : '双击地图设定导航目标点'}</span>
        </div>

        {/* Top-Right Navigation Info Card */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '10px 14px',
            boxShadow: 'var(--shadow-sm)',
            fontSize: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            minWidth: 140
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
            <span>剩余距离</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
              {(remainingDistance || 0).toFixed(2)} m
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
            <span>预计时间</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
              {(estimatedTime || 0).toFixed(1)} s
            </span>
          </div>
        </div>

        {/* Canvas Renderer */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
