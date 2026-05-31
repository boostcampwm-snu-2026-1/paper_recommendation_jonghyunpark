import { Hono } from 'hono'

// BFF 라우터. 외부 API(arXiv / Semantic Scholar / Gemini)는 모두 이 뒤에 숨긴다.
// 현재는 골격 — /api/health 만 구현, 나머지는 다음 task에서 채운다.
export const app = new Hono()

// 헬스 체크
app.get('/api/health', (c) =>
  c.json({ status: 'ok', service: 'paper-recommendation-server' }),
)

// TODO(다음 task): arXiv 프록시 — 검색·카테고리·페이지 (XML→JSON)
// app.get('/api/papers', ...)

// TODO(다음 task): 유사 논문 — arXiv ID → Semantic Scholar
// app.get('/api/similar', ...)

// TODO(다음 task): 초록 LLM 요약 — Gemini (키는 서버 .env)
// app.post('/api/summarize', ...)
