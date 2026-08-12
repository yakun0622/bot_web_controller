import http from 'node:http';
import { spawn, execFile } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const RTSP_PROXY_PATH = '/api/rtsp';
export const RTSP_PROXY_PORT = Number(process.env.RTSP_PROXY_PORT || 8081);

let ffmpegAvailable = null;

export function hasFfmpeg() {
  if (ffmpegAvailable !== null) return Promise.resolve(ffmpegAvailable);
  return new Promise((resolve) => {
    execFile('ffmpeg', ['-version'], { timeout: 5000 }, (error) => {
      ffmpegAvailable = !error;
      resolve(ffmpegAvailable);
    });
  });
}

function parseRtspUrl(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let decoded = raw.trim();
  try {
    decoded = decodeURIComponent(decoded).trim();
  } catch {
    // keep original if it is not URI-encoded
  }
  const lower = decoded.toLowerCase();
  if (!lower.startsWith('rtsp://') && !lower.startsWith('rtsps://')) return null;
  return decoded;
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
}

function writeJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function startFfmpeg(rtspUrl, transport) {
  const args = [
    '-hide_banner',
    '-loglevel', 'error',
    '-nostdin',
    '-rtsp_transport', transport,
    '-i', rtspUrl,
    '-an',
    '-r', '15',
    '-q:v', '6',
    '-f', 'mpjpeg',
    'pipe:1'
  ];
  return spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
}

export function createRtspMiddleware({ pathPrefix = RTSP_PROXY_PATH } = {}) {
  return (req, res, next) => {
    let url;
    try {
      url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    } catch {
      return next?.();
    }

    if (!url.pathname.startsWith(pathPrefix)) {
      return next?.();
    }

    setCors(res);
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const subpath = url.pathname.slice(pathPrefix.length) || '/';

    if (req.method !== 'GET') {
      writeJson(res, 405, { error: 'method not allowed' });
      return;
    }

    if (subpath === '/' || subpath === '/health') {
      hasFfmpeg().then((ok) => {
        writeJson(res, ok ? 200 : 503, {
          ok,
          ffmpeg: ok,
          pathPrefix,
          port: RTSP_PROXY_PORT
        });
      });
      return;
    }

    if (subpath !== '/mjpeg') {
      writeJson(res, 404, { error: 'not found', hint: `${pathPrefix}/mjpeg?url=rtsp://...` });
      return;
    }

    const rtspUrl = parseRtspUrl(url.searchParams.get('url') || '');
    if (!rtspUrl) {
      writeJson(res, 400, { error: 'invalid rtsp url' });
      return;
    }

    const transport = url.searchParams.get('transport') === 'udp' ? 'udp' : 'tcp';

    hasFfmpeg().then((ok) => {
      if (!ok) {
        writeJson(res, 503, {
          error: 'ffmpeg not found',
          hint: '请先安装 ffmpeg，然后重启 RTSP 代理'
        });
        return;
      }

      const ffmpeg = startFfmpeg(rtspUrl, transport);
      let gotData = false;
      let stderr = '';
      let settled = false;

      const cleanup = () => {
        if (!ffmpeg.killed) {
          ffmpeg.kill('SIGKILL');
        }
      };

      const fail = (status, payload) => {
        if (settled || res.headersSent) return;
        settled = true;
        clearTimeout(timeout);
        cleanup();
        writeJson(res, status, payload);
      };

      const timeout = setTimeout(() => {
        fail(504, {
          error: 'rtsp timeout',
          detail: stderr.slice(-800) || '摄像头无响应，请检查 RTSP 地址、账号密码和网络'
        });
      }, 10000);

      ffmpeg.stdout.on('data', (chunk) => {
        if (settled) return;
        if (!gotData) {
          gotData = true;
          settled = true;
          clearTimeout(timeout);
          res.writeHead(200, {
            'Content-Type': 'multipart/x-mixed-replace; boundary=ffmpeg',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*'
          });
        }
        if (!res.writableEnded) res.write(chunk);
      });

      ffmpeg.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
        if (stderr.length > 4000) stderr = stderr.slice(-4000);
      });

      ffmpeg.on('exit', () => {
        clearTimeout(timeout);
        if (!gotData) {
          fail(502, {
            error: 'ffmpeg failed',
            detail: stderr.slice(-800) || '无法拉取 RTSP 流'
          });
          return;
        }
        if (!res.writableEnded) res.end();
      });

      ffmpeg.on('error', () => {
        fail(500, { error: 'failed to start ffmpeg' });
      });

      req.on('close', () => {
        clearTimeout(timeout);
        cleanup();
      });
      res.on('close', cleanup);
    });
  };
}

function startStandaloneServer() {
  const middleware = createRtspMiddleware();
  const server = http.createServer((req, res) => {
    middleware(req, res, () => {
      writeJson(res, 404, {
        error: 'not found',
        hint: `${RTSP_PROXY_PATH}/mjpeg?url=rtsp://...`
      });
    });
  });

  server.listen(RTSP_PROXY_PORT, '0.0.0.0', () => {
    console.log(`[rtsp-proxy] http://0.0.0.0:${RTSP_PROXY_PORT}${RTSP_PROXY_PATH}/mjpeg?url=rtsp://...`);
  });
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  startStandaloneServer();
}
