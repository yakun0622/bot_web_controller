import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createRtspMiddleware } from './server/rtsp-proxy.mjs';

function rtspProxyPlugin() {
  return {
    name: 'rtsp-proxy',
    configureServer(server) {
      server.middlewares.use(createRtspMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(createRtspMiddleware());
    }
  };
}

export default defineConfig({
  plugins: [react({ exclude: [/node_modules/, /vendor\//] }), rtspProxyPlugin()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-abc': ['@abc-design/react'],
          'vendor-icons': ['lucide-react'],
          'vendor-ros': ['roslib']
        }
      }
    }
  }
});
