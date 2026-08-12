import React, { useEffect, useMemo, useState } from 'react';
import { Camera, RefreshCw, Play, Pause, Video, Info, Check, Copy, Sliders } from 'lucide-react';
import {
  buildRtspMjpegUrl,
  getStoredProxyBase,
  getStoredRtspTransport,
  isRtspUrl,
  resolveRtspProxy,
  setStoredProxyBase,
  setStoredRtspTransport
} from '../utils/videoStream';

export default function CameraFeed({ isSimulated, streamUrl }) {
  const [isPaused, setIsPaused] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgReady, setImgReady] = useState(false);
  const [streamKey, setStreamKey] = useState(Date.now());
  const [showRtspHelp, setShowRtspHelp] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState('');
  const [proxyBase, setProxyBase] = useState(getStoredProxyBase());
  const [rtspTransport, setRtspTransport] = useState(getStoredRtspTransport());
  const [proxyStatus, setProxyStatus] = useState(isRtspUrl(streamUrl) ? 'checking' : 'idle');

  const isRtsp = isRtspUrl(streamUrl);
  const hasStream = Boolean(streamUrl?.trim());

  useEffect(() => {
    setImgError(false);
    setImgReady(false);
    setStreamKey(Date.now());
  }, [streamUrl, rtspTransport]);

  useEffect(() => {
    if (!isRtsp || isPaused || !hasStream) {
      setProxyStatus('idle');
      return undefined;
    }

    let cancelled = false;
    setProxyStatus('checking');

    resolveRtspProxy(proxyBase).then((result) => {
      if (cancelled) return;
      if (!proxyBase && result.base) {
        setProxyBase(result.base);
      }
      setProxyStatus(result.status);
    });

    return () => {
      cancelled = true;
    };
  }, [isRtsp, isPaused, hasStream, streamKey]);

  const playbackUrl = useMemo(() => {
    if (!hasStream) return '';
    if (isRtsp) {
      return buildRtspMjpegUrl(streamUrl, proxyBase || '', rtspTransport, streamKey);
    }
    const separator = streamUrl.includes('?') ? '&' : '?';
    return `${streamUrl}${separator}t=${streamKey}`;
  }, [hasStream, isRtsp, streamUrl, proxyBase, rtspTransport, streamKey]);

  const handleRefresh = () => {
    setImgError(false);
    setImgReady(false);
    setStreamKey(Date.now());
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(''), 2000);
  };

  const showPlaceholder = !hasStream || isPaused || imgError || (isRtsp && proxyStatus !== 'ok' && proxyStatus !== 'checking');
  const proxyBlocked = isRtsp && (proxyStatus === 'offline' || proxyStatus === 'no-ffmpeg');

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Video size={16} color={isRtsp ? '#8b5cf6' : '#2563eb'} />
          <span>摄像头视频流</span>
          {isRtsp && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                backgroundColor: '#f3e8ff',
                color: '#7e22ce',
                padding: '2px 6px',
                borderRadius: 4,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              RTSP
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {isRtsp && (
            <button
              className="btn btn-outline"
              style={{ padding: '2px 6px', fontSize: 11, color: '#7e22ce', borderColor: '#e9d5ff' }}
              onClick={() => setShowRtspHelp(true)}
              title="RTSP 转码设置"
            >
              <Sliders size={12} />
              <span>RTSP设置</span>
            </button>
          )}

          <button
            className="btn btn-outline"
            style={{ padding: '2px 6px', fontSize: 11 }}
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? '恢复播放' : '暂停播放'}
          >
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
          </button>

          <button
            className="btn btn-outline"
            style={{ padding: '2px 6px', fontSize: 11 }}
            onClick={handleRefresh}
            title="刷新画面"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      <div className="card-body">
        <div
          style={{
            width: '100%',
            aspectRatio: '4 / 3',
            backgroundColor: '#0f172a',
            borderRadius: 6,
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {!isPaused && hasStream && (!isRtsp || proxyStatus === 'ok') && (
            <img
              key={playbackUrl}
              src={playbackUrl}
              alt="Camera Stream"
              onLoad={() => {
                setImgReady(true);
                setImgError(false);
              }}
              onError={() => {
                setImgReady(false);
                setImgError(true);
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: imgError ? 'none' : 'block'
              }}
            />
          )}

          {(showPlaceholder || (!imgReady && hasStream && !isPaused && !imgError)) && (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                gap: 8,
                padding: 16,
                textAlign: 'center',
                position: 'absolute',
                inset: 0,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 0)',
                  backgroundSize: '16px 16px'
                }}
              />
              <Camera size={36} color={isRtsp ? '#8b5cf6' : '#3b82f6'} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', zIndex: 1 }}>
                {isPaused
                  ? '预览已暂停'
                  : !hasStream
                    ? (isSimulated ? '模拟视频流 (Bot Front Cam)' : '等待视频流连接...')
                    : proxyStatus === 'checking' || (!imgReady && !imgError && !proxyBlocked)
                      ? (isRtsp ? '正在连接 RTSP 视频流...' : '正在连接视频流...')
                      : proxyStatus === 'offline'
                        ? 'RTSP 转码代理未运行'
                        : proxyStatus === 'no-ffmpeg'
                          ? '未检测到 ffmpeg'
                          : imgError
                            ? (isRtsp ? 'RTSP 拉流失败' : '视频流连接失败')
                            : '等待视频流连接...'}
              </span>

              {isRtsp && !isPaused && hasStream && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, maxWidth: 300, zIndex: 1 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>
                    {proxyStatus === 'offline'
                      ? '浏览器无法直接播放 rtsp://，请启动本项目自带的转码代理。开发环境运行 npm run dev 即可。'
                      : proxyStatus === 'no-ffmpeg'
                        ? '代理已启动，但系统未安装 ffmpeg，无法将 RTSP 转为网页可播放的 MJPEG。'
                        : imgError
                          ? '请检查摄像头地址、账号密码，或在 RTSP 设置中切换 TCP/UDP。'
                          : '正在通过本地代理将 RTSP 转为网页预览。'}
                  </span>
                  {(proxyBlocked || imgError) && (
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: 11, padding: '4px 10px', color: '#e2e8f0', borderColor: '#475569' }}
                      onClick={() => setShowRtspHelp(true)}
                    >
                      <Info size={12} color="#a855f7" />
                      <span>查看 RTSP 说明</span>
                    </button>
                  )}
                </div>
              )}

              {!isRtsp && !hasStream && (
                <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace', zIndex: 1 }}>
                  MJPEG / HTTP Stream | 640x480
                </span>
              )}
            </div>
          )}

          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              display: 'flex',
              gap: 6
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                color: imgReady && !isPaused && !imgError ? '#10b981' : '#94a3b8',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: imgReady && !isPaused && !imgError ? '#10b981' : '#94a3b8'
                }}
              />
              {imgReady && !isPaused && !imgError ? 'LIVE' : 'IDLE'}
            </div>

            {isRtsp && (
              <div
                style={{
                  backgroundColor: 'rgba(126, 34, 206, 0.85)',
                  color: '#ffffff',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 600
                }}
              >
                RTSP → MJPEG
              </div>
            )}
          </div>
        </div>
      </div>

      {showRtspHelp && (
        <div className="modal-overlay" onClick={() => setShowRtspHelp(false)}>
          <div className="modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Video size={18} color="#7e22ce" />
                <span>RTSP 视频流转码设置</span>
              </div>
              <button
                onClick={() => setShowRtspHelp(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
              >
                ✕
              </button>
            </div>

            <div className="card-body" style={{ fontSize: 12, gap: 12, maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ backgroundColor: '#f3e8ff', border: '1px solid #e9d5ff', borderRadius: 6, padding: 10, color: '#6b21a8' }}>
                浏览器不能直接播放原生 <code>rtsp://</code>。本项目会用 ffmpeg 将 RTSP 转成 MJPEG 后再预览。
                <div style={{ marginTop: 6 }}>开发环境：<code>npm run dev</code>（已内置代理）</div>
                <div>生产环境：安装 ffmpeg 后运行 <code>npm run rtsp-proxy</code></div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>RTSP 传输方式</label>
                <select
                  className="form-select"
                  value={rtspTransport}
                  onChange={(e) => {
                    const next = e.target.value === 'udp' ? 'udp' : 'tcp';
                    setRtspTransport(next);
                    setStoredRtspTransport(next);
                  }}
                >
                  <option value="tcp">TCP（推荐，更稳定）</option>
                  <option value="udp">UDP（部分摄像头需要）</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>自定义代理地址（可选）</label>
                <input
                  type="text"
                  className="form-input"
                  value={proxyBase}
                  onChange={(e) => setProxyBase(e.target.value)}
                  onBlur={() => setStoredProxyBase(proxyBase)}
                  placeholder="留空自动探测，例如 http://192.168.2.88:8081"
                />
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  默认会依次尝试当前页面同源 <code>/api/rtsp</code> 和 <code>:8081</code>。
                </span>
              </div>

              <hr style={{ borderColor: '#e2e8f0' }} />

              <div style={{ fontWeight: 600, color: '#0f172a' }}>常用启动命令</div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: 10 }}>
                <div style={{ fontWeight: 600, color: '#2563eb' }}>开发预览</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', color: '#38bdf8', padding: '6px 10px', borderRadius: 4, fontFamily: 'monospace', fontSize: 11, marginTop: 6 }}>
                  <span>npm run dev</span>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '2px 6px', fontSize: 10, color: 'white', borderColor: '#475569' }}
                    onClick={() => copyToClipboard('npm run dev', 'dev')}
                  >
                    {copiedCmd === 'dev' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: 10 }}>
                <div style={{ fontWeight: 600, color: '#2563eb' }}>生产环境独立代理</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', color: '#38bdf8', padding: '6px 10px', borderRadius: 4, fontFamily: 'monospace', fontSize: 11, marginTop: 6 }}>
                  <span>npm run rtsp-proxy</span>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '2px 6px', fontSize: 10, color: 'white', borderColor: '#475569' }}
                    onClick={() => copyToClipboard('npm run rtsp-proxy', 'proxy')}
                  >
                    {copiedCmd === 'proxy' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setStoredProxyBase(proxyBase);
                    setShowRtspHelp(false);
                    handleRefresh();
                  }}
                >
                  确定并重连
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
