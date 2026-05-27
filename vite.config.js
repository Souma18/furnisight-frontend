import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/conversation': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
      '/message': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
      '/notification': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
      '/promotion': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
      '/subscribe': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
      '/api/v1/notifications': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
    },
  },
})

