import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { fileURLToPath } from 'url'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const spaFallback = () => ({
  name: 'spa-fallback',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (
        !req.url.includes('.') && 
        !req.url.startsWith('/api') &&
        !req.url.startsWith('/@')
      ) {
        req.url = '/index.html';
      }
      next();
    });
  }
});

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    nodePolyfills(),
    spaFallback()
  ],
  server: {
    allowedHosts: ['goprofi.ai', 'goprofi.app'],
    port: 3001,
    host: true
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      '@app': fileURLToPath(new URL("./src/app", import.meta.url)),
      '@components': fileURLToPath(new URL("./src/app/components", import.meta.url))
    }
  },
})