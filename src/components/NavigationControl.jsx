import React, { useState } from 'react';
import { RefreshCw, Compass, MapPin } from 'lucide-react';
import { rosService } from '../services/rosService';

export default function NavigationControl({
  isRunning,
  selectedMap,
  availableMaps,
  onSetInitialPose
}) {
  const [multiPointNav, setMultiPointNav] = useState(false);

  return (
    <div className="card">
      <div className="card-header">
        <span>导航控制</span>
      </div>

      <div className="card-body">
        {/* Map Selection Dropdown */}
        <div className="form-group">
          <label className="form-label">选择地图</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <select
              className="form-select"
              style={{ flex: 1 }}
              value={selectedMap}
              onChange={(e) => rosService.setSelectedMap(e.target.value)}
            >
              {(availableMaps || ['test_room']).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <button className="btn btn-outline" style={{ padding: '6px 8px' }} title="刷新地图列表">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Start / Stop Navigation Button (Red soft pill matching image.png) */}
        <button
          className={`btn ${isRunning ? 'btn-danger-light' : 'btn-primary'}`}
          style={{ width: '100%', padding: '10px' }}
          onClick={() => rosService.toggleNavigationMode()}
        >
          <span>{isRunning ? '停止导航' : '开始导航'}</span>
        </button>

        {/* Status Indicator */}
        <div
          style={{
            fontSize: 12,
            color: isRunning ? '#15803d' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isRunning ? '#10b981' : '#cbd5e1',
              display: 'inline-block'
            }}
          />
          <span>{isRunning ? '导航节点运行中' : '导航节点未运行'}</span>
        </div>

        {/* Set Initial Pose Action Button (Yellow soft button matching image.png) */}
        <button
          className="btn btn-warning-light"
          style={{ width: '100%', padding: '9px' }}
          onClick={onSetInitialPose}
        >
          <Compass size={15} />
          <span>设置初始位置</span>
        </button>

        {/* Multi-point Nav Mode Toggle Button (Green soft button matching image.png) */}
        <button
          className="btn btn-success-light"
          style={{ width: '100%', padding: '9px' }}
          onClick={() => setMultiPointNav(!multiPointNav)}
        >
          <span>多点导航: {multiPointNav ? '已开启' : '已关闭'}</span>
        </button>

        {/* Tip Box (Soft purple tip box matching image.png) */}
        <div
          style={{
            backgroundColor: '#f3e8ff',
            border: '1px solid #e9d5ff',
            color: '#7e22ce',
            borderRadius: 6,
            padding: '10px',
            fontSize: 12,
            textAlign: 'center',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <MapPin size={14} />
          <span>双击地图设定导航目标点</span>
        </div>
      </div>
    </div>
  );
}
