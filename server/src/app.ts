import { Hono } from 'hono'
import { fetchPapers } from './lib/arxiv.js'

// BFF 라우터. 외부 API(arXiv / Semantic Scholar / Gemini)는 모두 이 뒤에 숨긴다.
export const app = new Hono()

// 헬스 체크
app.get('/api/health', (c) =>
  c.json({ status: 'ok', service: 'paper-recommendation-server' }),
)

// arXiv 프록시 — 검색·카테고리·토픽·페이지 (XML→JSON 정규화)
//   ?q=키워드 &category=cs.AI,cs.LG &topics=vision language action,continual learning
//   &page=1 &pageSize=20 &sort=recent|relevance
app.get('/api/papers', async (c) => {
  const { q, category, topics, page, pageSize, sort } = c.req.query()
  try {
    const result = await fetchPapers({
      q,
      category,
      topics,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      sort: sort === 'relevance' ? 'relevance' : 'recent',
    })
    return c.json(result)
  } catch (err) {
    console.error('[api/papers] error:', err)
    return c.json({ error: 'arXiv 논문을 가져오지 못했습니다.' }, 502)
  }
})

// TODO(다음 task): 유사 논문 — arXiv ID → Semantic Scholar
// app.get('/api/similar', ...)

// TODO(다음 task): 초록 LLM 요약 — Gemini (키는 서버 .env)
// app.post('/api/summarize', ...)
