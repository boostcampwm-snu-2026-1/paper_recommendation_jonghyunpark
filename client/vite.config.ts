import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // inotify 파일워처 한도(ENOSPC)가 찬 환경에서는 VITE_USE_POLLING=1 로 폴링 사용.
    // (정상 환경에서는 native 워처를 써서 CPU 낭비 없음)
    watch: process.env.VITE_USE_POLLING
      ? { usePolling: true, interval: 300 }
      : undefined,
    // 로컬 개발 시 /api 요청을 server(BFF, 3000 포트)로 프록시한다.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
