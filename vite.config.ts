import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { fileURLToPath } from 'url'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    nodePolyfills()
  ],
  server: {
    allowedHosts: ['goprofi.ai'],
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