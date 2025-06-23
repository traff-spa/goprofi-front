import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { fileURLToPath } from 'url'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
// import fs from 'fs';


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
    // https: {
    //   key: fs.readFileSync('./app/ssl/server.key'),
    //   cert: fs.readFileSync('./app/ssl/server.crt')
    // }
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      '@app': fileURLToPath(new URL("./src/app", import.meta.url)),
      '@components': fileURLToPath(new URL("./src/app/components", import.meta.url))
    }
  },
})