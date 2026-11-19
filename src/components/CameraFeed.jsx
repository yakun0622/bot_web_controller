import React, { useEffect, useMemo, useState } from 'react';
import { Camera, Info, Pause, Play, RefreshCw, Sliders, Video } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  CodeBlock,
  Divider,
  Drawer,
  FormField,
  Input,
  Select,
  StatusTag,
  Tooltip,
  useAbcConfig
} from '@abc-design/react';
import {
  buildRtspMjpegUrl,
  getStoredProxyBase,
  getStoredRtspTransport,
  isRtspUrl,
  resolveRtspProxy,
  setStoredProxyBase,
  setStoredRtspTransport
} from '../utils/videoStream';

export default function CameraFeed({
  isSimulated,
  streamUrl,
  rtspDrawerOpen: externalRtspOpen,
  onRtspDrawerOpenChange
}) {
  const { toast } = useAbcConfig();
  const [isPaused, setIsPaused] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgReady, setImgReady] = useState(false);
  const [streamKey, setStreamKey] = useState(Date.now());
  const [internalRtspHelp, setInternalRtspHelp] = useState(false);

  const showRtspHelp = externalRtspOpen ?? internalRtspHelp;
  const setShowRtspHelp = onRtspDrawerOpenChange ?? setInternalRtspHelp;

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
    toast.info('正在重新拉取视频流');
  };

  const isLive = imgReady && !isPaused && !imgError;
  const showPlaceholder =
    !hasStream || isPaused || imgError || (isRtsp && proxyStatus !== 'ok' && proxyStatus !== 'checking');
  const proxyBlocked = isRtsp && (proxyStatus === 'offline' || proxyStatus === 'no-ffmpeg');

  return (
    <>
      <Card
        size="sm"
        padding="sm"
        title={
          <div className="flex items-center gap-2">
            <Video
              className="h-4 w-4 shrink-0"
              style={{ color: isRtsp ? '#8b5cf6' : 'var(--abc-primary)' }}
            />
            <span>机载视频监控</span>
            {isRtsp && (
              <StatusTag tone="purple" size="xs" dot={false}>
                RTSP
              </StatusTag>
            )}
          </div>
        }
        extra={
          <div className="flex items-center gap-1">
            {isRtsp && (
              <Tooltip content="RTSP 转码与传输设置">
                <Button
                  size="xs"
                  variant="outline"
                  leftIcon={<Sliders className="h-3 w-3" />}
                  onClick={() => setShowRtspHelp(true)}
                >
                  转码
                </Button>
              </Tooltip>
            )}

            <Tooltip content={isPaused ? '恢复实时预览' : '暂停画面'}>
              <Button
                size="icon-sm"
                variant="outline"
                aria-label={isPaused ? '恢复播放' : '暂停播放'}
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </Button>
            </Tooltip>

            <Tooltip content="重连刷新画面">
              <Button
                size="icon-sm"
                variant="outline"
                aria-label="刷新画面"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
          </div>
        }
      >
        <div
          style={{ aspectRatio: '4 / 3' }}
          className="relative flex w-full items-center justify-center overflow-hidden rounded-[var(--abc-radius-md)] border border-slate-700 bg-slate-950"
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
                background: 'linear-gradient(135deg, #1e293b 0%, #090d16 100%)'
              }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-4 text-center text-slate-300"
            >
              <div
                aria-hidden="true"
                style={{
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 0)',
                  backgroundSize: '16px 16px'
                }}
                className="pointer-events-none absolute inset-0"
              />
              <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <Camera className="h-5 w-5" style={{ color: isRtsp ? '#a855f7' : '#38bdf8' }} />
              </div>

              <div className="relative z-10 text-xs font-semibold text-slate-100">
                {isPaused
                  ? '实时视频预览已暂停'
                  : !hasStream
                    ? isSimulated
                      ? '仿真相机待机 (Front RGB Cam)'
                      : '未配置视频流地址'
                    : proxyStatus === 'checking' || (!imgReady && !imgError && !proxyBlocked)
                      ? isRtsp
                        ? '正在握手 RTSP 视频流...'
                        : '正在连接视频流...'
                      : proxyStatus === 'offline'
                        ? 'RTSP 转码代理未运行'
                        : proxyStatus === 'no-ffmpeg'
                          ? '系统未检测到 FFmpeg'
                          : imgError
                            ? isRtsp
                              ? 'RTSP 视频拉流失败'
                              : '视频流无法访问'
                            : '等待视频流信号...'}
              </div>

              {isRtsp && !isPaused && hasStream && (
                <div className="relative z-10 flex max-w-[280px] flex-col items-center gap-2">
                  <span className="text-[11px] leading-relaxed text-slate-400">
                    {proxyStatus === 'offline'
                      ? '浏览器不支持直连 rtsp://，请启动内置转码服务（开发模式运行 npm run dev 即可）。'
                      : proxyStatus === 'no-ffmpeg'
                        ? '代理服务在线，但主机未安装 ffmpeg，无法将 RTSP 实时转码为 MJPEG。'
                        : imgError
                          ? '请核对摄像头 IP、鉴权账号密码，或在转码设置中切换 TCP / UDP 传输。'
                          : '正通过本地代理将 RTSP 转为低延迟 MJPEG...'}
                  </span>
                  {(proxyBlocked || imgError) && (
                    <Button
                      size="xs"
                      variant="secondary"
                      leftIcon={<Info className="h-3.5 w-3.5" />}
                      onClick={() => setShowRtspHelp(true)}
                    >
                      配置 RTSP 转码代理
                    </Button>
                  )}
                </div>
              )}

              {!isRtsp && (imgError || !hasStream) && (
                <span className="relative z-10 font-mono text-[10px] text-slate-400">
                  {streamUrl || 'MJPEG / HTTP Stream · 640×480'}
                </span>
              )}
            </div>
          )}

          {/* Top-left HUD status tags */}
          <div className="pointer-events-none absolute top-2 left-2 z-20 flex items-center gap-1.5">
            <StatusTag
              size="xs"
              tone={isLive ? 'success' : 'neutral'}
              variant="solid"
              dot
            >
              {isLive ? 'LIVE' : 'IDLE'}
            </StatusTag>
            {isRtsp && (
              <StatusTag size="xs" tone="purple" variant="solid" dot={false}>
                RTSP → MJPEG ({rtspTransport.toUpperCase()})
              </StatusTag>
            )}
          </div>
        </div>
      </Card>

      {/* Complex RTSP Settings & CLI Commands -> Right-side Drawer per ABC Design container guidelines */}
      <Drawer
        open={showRtspHelp}
        onClose={() => setShowRtspHelp(false)}
        title="RTSP 视频流转码代理配置"
        description="基于 Node.js + FFmpeg 将机载 RTSP 相机实时转码为浏览器兼容的 multipart MJPEG 流"
        badge={
          <StatusTag
            size="xs"
            tone={proxyStatus === 'ok' ? 'success' : proxyStatus === 'checking' ? 'info' : 'warning'}
          >
            {proxyStatus === 'ok'
              ? '代理就绪'
              : proxyStatus === 'no-ffmpeg'
                ? '缺少 FFmpeg'
                : proxyStatus === 'offline'
                  ? '代理离线'
                  : '待检测'}
          </StatusTag>
        }
        size="md"
        storageKey="bot_rtsp_drawer"
        footer={
          <>
            <Button size="sm" variant="outline" onClick={() => setShowRtspHelp(false)}>
              关闭
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setStoredProxyBase(proxyBase);
                setShowRtspHelp(false);
                handleRefresh();
              }}
            >
              应用并重连视频流
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert
            tone="info"
            showIcon
            title="转码工作机制说明"
            description="现代浏览器已移除原生 RTSP 插件支持。本项目内置轻量转码中间件，客户端断开或暂停时会自动回收 FFmpeg 子进程，零常驻算力开销。"
          />

          <FormField
            label="RTSP 底层传输协议"
            helperText="局域网无线环境下优先推荐 TCP，可避免 UDP 丢包引起的花屏与断流"
          >
            <Select
              size="sm"
              value={rtspTransport}
              onChange={(val) => {
                const next = val === 'udp' ? 'udp' : 'tcp';
                setRtspTransport(next);
                setStoredRtspTransport(next);
              }}
              options={[
                { value: 'tcp', label: 'TCP 传输（推荐，抗丢包更稳定）' },
                { value: 'udp', label: 'UDP 传输（超低延迟，部分海康/大华相机需要）' }
              ]}
            />
          </FormField>

          <FormField
            label="自定义转码代理服务地址（可选）"
            helperText="留空时自动依次探测当前站点同源 /api/rtsp 与当前主机 :8081 端口"
          >
            <Input
              size="sm"
              value={proxyBase}
              onChange={(e) => setProxyBase(e.target.value)}
              onBlur={() => setStoredProxyBase(proxyBase)}
              placeholder="例如 http://192.168.2.88:8081（留空自动探测）"
              allowClear
            />
          </FormField>

          <Divider label="服务端启动指令参考" />

          <div className="space-y-3">
            <CodeBlock
              title="开发环境（Vite 已自动挂载 /api/rtsp 中间件）"
              language="bash"
              variant="terminal"
              copyLabel="复制"
              copiedLabel="已复制"
              code="npm run dev"
            />

            <CodeBlock
              title="生产环境独立启动 RTSP 转码守护进程 (:8081)"
              language="bash"
              variant="terminal"
              copyLabel="复制"
              copiedLabel="已复制"
              code="npm run rtsp-proxy"
            />
          </div>
        </div>
      </Drawer>
    </>
  );
}
