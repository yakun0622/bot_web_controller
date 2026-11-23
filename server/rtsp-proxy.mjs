import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn, execFile } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createBotGatewayMiddleware, shutdownBotGateway } from './bot-gateway.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PARENT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(PARENT_DIR, 'dist');

function resolveStaticRoot() {
  if (fs.existsSync(path.join(DIST_DIR, 'index.html'))) return DIST_DIR;
  if (
    fs.existsSync(path.join(PARENT_DIR, 'index.html')) &&
    fs.existsSync(path.join(PARENT_DIR, 'assets'))
  ) {
    return PARENT_DIR;
  }
  return null;
}

export const RTSP_PROXY_PATH = '/api/rtsp';
export const RTSP_PROXY_PORT = Number(process.env.RTSP_PROXY_PORT || 8081);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

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
    // keep original if not URI-encoded
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
    '-loglevel',
    'error',
    '-nostdin',
    '-rtsp_transport',
    transport,
    '-i',
    rtspUrl,
    '-an',
    '-r',
    '15',
    '-q:v',
    '6',
    '-f',
    'mpjpeg',
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
          hint: '请先安装 ffmpeg，然后重启服务'
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

function serveStaticDist(req, res) {
  const staticRoot = resolveStaticRoot();
  if (!staticRoot) {
    writeJson(res, 404, {
      error: 'dist not built',
      hint: 'Run npm run build first, or access /api/bot/health'
    });
    return;
  }

  let pathname = '/';
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    pathname = '/';
  }

  if (pathname === '/server' || pathname.startsWith('/server/')) {
    writeJson(res, 404, { error: 'not found' });
    return;
  }

  const safeRel = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '').replace(/^[/\\]+/, '');
  let targetFile = path.resolve(staticRoot, safeRel || 'index.html');
  if (!targetFile.startsWith(staticRoot + path.sep) && targetFile !== staticRoot) {
    writeJson(res, 403, { error: 'forbidden' });
    return;
  }

  if (!fs.existsSync(targetFile) || fs.statSync(targetFile).isDirectory()) {
    targetFile = path.join(staticRoot, 'index.html');
  }

  const ext = path.extname(targetFile).toLowerCase();
  res.statusCode = 200;
  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
  fs.createReadStream(targetFile).pipe(res);
}

function startStandaloneServer() {
  const botGateway = createBotGatewayMiddleware();
  const rtspProxy = createRtspMiddleware();

  const server = http.createServer((req, res) => {
    botGateway(req, res, () => {
      rtspProxy(req, res, () => {
        serveStaticDist(req, res);
      });
    });
  });

  const gracefulStop = () => {
    shutdownBotGateway();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 500).unref();
  };
  process.once('SIGINT', gracefulStop);
  process.once('SIGTERM', gracefulStop);

  server.listen(RTSP_PROXY_PORT, '0.0.0.0', () => {
    console.log(`[w152d-server] Web Console & Direct Bot Gateway listening on http://0.0.0.0:${RTSP_PROXY_PORT}`);
    console.log(`[w152d-server] Bot Gateway API: http://0.0.0.0:${RTSP_PROXY_PORT}/api/bot/health`);
    console.log(`[w152d-server] RTSP Proxy API:  http://0.0.0.0:${RTSP_PROXY_PORT}${RTSP_PROXY_PATH}/health`);
  });
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  startStandaloneServer();
}
