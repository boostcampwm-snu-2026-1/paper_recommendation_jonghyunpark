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
    // BFF(/api/*)는 Vercel Functions로 배포되며, 로컬에서는 필요 시 프록시를 추가한다.
    // proxy: { '/api': 'http://localhost:3000' },
  },
})
