import { serve } from '@hono/node-server'
import { app } from './app.js'

// 로컬 개발용 Node 서버 진입점. (배포는 추후 Vercel Functions 어댑터로 분리 가능)
const port = Number(process.env.PORT ?? 3000)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[server] BFF listening on http://localhost:${info.port}`)
})
