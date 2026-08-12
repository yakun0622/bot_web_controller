import React, { useState } from 'react';
import { Bot, Settings, PlayCircle, Battery, BatteryCharging, BatteryLow, BatteryMedium, Zap } from 'lucide-react';
import { rosService } from '../services/rosService';

export default function Header({ status, isSimulated, rosUrl, videoUrl, onSaveSettings, battery }) {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBatteryPopover, setShowBatteryPopover] = useState(false);
  const [tempRosUrl, setTempRosUrl] = useState(rosUrl);
  const [tempVideoUrl, setTempVideoUrl] = useState(videoUrl);

  const openSettings = () => {
    setTempRosUrl(rosUrl);
    setTempVideoUrl(videoUrl);
    setShowSettingsModal(true);
  };

  const handleConnect = (e) => {
    e.preventDefault();
    onSaveSettings({
      rosUrl: tempRosUrl.trim(),
      videoUrl: tempVideoUrl.trim()
    });
    setShowSettingsModal(false);
  };

  const getBatteryIcon = () => {
    if (battery?.isCharging) {
      return <BatteryCharging size={16} color="#10b981" />;
    }
    const pct = battery?.percentage || 0;
    if (pct <= 20) {
      return <BatteryLow size={16} color="#ef4444" />;
    } else if (pct <= 60) {
      return <BatteryMedium size={16} color="#f59e0b" />;
    }
    return <Battery size={16} color="#10b981" />;
  };

  const getBatteryColor = () => {
    if (battery?.isCharging) return '#10b981';
    const pct = battery?.percentage || 0;
    if (pct <= 20) return '#ef4444';
    if (pct <= 60) return '#f59e0b';
    return '#10b981';
  };

  return (
    <header className="app-header">
      <div className="header-title">
        <Bot size={22} />
        <span>机器人中控台</span>
      </div>

      <div className="header-actions">
        {/* Battery Status Indicator */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowBatteryPopover(!showBatteryPopover)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '4px 10px',
              borderRadius: 20,
              cursor: 'pointer'
            }}
            title="电池状态 (点击查看详情)"
          >
            {getBatteryIcon()}
            <span style={{ color: getBatteryColor() }}>
              {battery?.percentage ?? 86}%
            </span>
            <span className="mobile-hide-text" style={{ fontSize: 11, color: '#64748b' }}>
              ({battery?.voltage ?? 12.4}V)
            </span>
          </button>

          {/* Battery Popover */}
          {showBatteryPopover && (
            <div
              style={{
                position: 'absolute',
                top: 40,
                right: 0,
                width: 220,
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                boxShadow: 'var(--shadow-md)',
                padding: 12,
                zIndex: 50,
                fontSize: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}
            >
              <div style={{ fontWeight: 600, borderBottom: '1px solid #f1f5f9', pb: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span>电池详细状态</span>
                <span style={{ color: getBatteryColor(), fontWeight: 700 }}>
                  {battery?.isCharging ? '⚡ 充电中' : '放电中'}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${battery?.percentage ?? 86}%`,
                    height: '100%',
                    backgroundColor: getBatteryColor(),
                    transition: 'width 0.3s'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>剩余电量:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{battery?.percentage ?? 86}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>工作电压:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{battery?.voltage ?? 12.4} V</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>工作电流:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{battery?.current ?? -1.2} A</span>
              </div>

              {isSimulated && (
                <button
                  className="btn btn-outline"
                  style={{ marginTop: 4, padding: '4px 8px', fontSize: 11 }}
                  onClick={() => rosService.toggleSimCharging()}
                >
                  <Zap size={12} color="#f59e0b" />
                  <span>{battery?.isCharging ? '模拟拔掉充电器' : '模拟插上充电器'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Simulation toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: '#f1f5f9', padding: '4px 8px', borderRadius: 20 }}>
          <PlayCircle size={14} color={isSimulated ? '#2563eb' : '#64748b'} />
          <span className="mobile-hide-text" style={{ fontWeight: 500, color: isSimulated ? '#2563eb' : '#64748b' }}>
            仿真模式
          </span>
          <label className="switch">
            <input
              type="checkbox"
              checked={isSimulated}
              onChange={(e) => {
                if (e.target.checked) {
                  rosService.setSimulationMode(true);
                } else {
                  rosService.connect(rosUrl, { fallbackToSimulation: true });
                }
              }}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* Status indicator badge */}
        <div className={`status-badge ${status}`}>
          <span className="status-dot"></span>
          <span>
            {status === 'connecting'
              ? '连接中'
              : status === 'connected'
                ? (isSimulated ? '已连接 (仿真)' : '已连接')
                : '已断开'}
          </span>
        </div>

        {/* Settings button */}
        <button
          className="btn btn-outline"
          onClick={openSettings}
          style={{ padding: '6px 10px' }}
          title="连接设置"
        >
          <Settings size={16} />
          <span className="mobile-hide-text">设置</span>
        </button>
      </div>

      {/* Settings modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <span>连接设置</span>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleConnect} className="card-body">
              <div className="form-group">
                <label className="form-label">ROS Websocket 地址</label>
                <input
                  type="text"
                  className="form-input"
                  value={tempRosUrl}
                  onChange={(e) => setTempRosUrl(e.target.value)}
                  placeholder="ws://192.168.2.88:9090"
                  required
                />
                <span style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  示例: ws://192.168.2.88:9090 或 ws://localhost:9090
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">摄像头视频流地址 (支持 HTTP / RTSP / MJPEG)</label>
                <input
                  type="text"
                  className="form-input"
                  value={tempVideoUrl}
                  onChange={(e) => setTempVideoUrl(e.target.value)}
                  placeholder="http://192.168.2.165:81 或 rtsp://192.168.2.88:554/live"
                  required
                />
                <span style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  示例: http://192.168.2.165:81 或 rtsp://admin:123456@192.168.2.88:554/live。RTSP 需本机安装 ffmpeg，开发环境运行 npm run dev 即可预览。
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowSettingsModal(false)}
                >
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  保存并连接
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
