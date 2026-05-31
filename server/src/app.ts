import { Hono } from 'hono'
import { fetchPapers } from './lib/arxiv.js'
import { interestStore } from './lib/interestStore.js'

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

// 관심분야 저장/조회 (익명 기기 ID 기준, Upstash Redis 또는 인메모리 폴백)
app.get('/api/interests/:userId', async (c) => {
  const userId = c.req.param('userId')
  const data = await interestStore.get(userId)
  return c.json(data ?? { interests: [], customKeywords: [] })
})

app.put('/api/interests/:userId', async (c) => {
  const userId = c.req.param('userId')
  if (!userId || userId.length > 100) {
    return c.json({ error: '유효하지 않은 userId' }, 400)
  }

  const body = await c.req.json().catch(() => null)
  if (
    !body ||
    !Array.isArray(body.interests) ||
    !Array.isArray(body.customKeywords)
  ) {
    return c.json({ error: 'interests/customKeywords 배열이 필요합니다.' }, 400)
  }

  const onlyStrings = (arr: unknown[]) =>
    arr.filter((x): x is string => typeof x === 'string').slice(0, 100)

  await interestStore.set(userId, {
    interests: onlyStrings(body.interests),
    customKeywords: onlyStrings(body.customKeywords),
  })
  return c.json({ ok: true })
})

// TODO(다음 task): 유사 논문 — arXiv ID → Semantic Scholar
// app.get('/api/similar', ...)

// TODO(다음 task): 초록 LLM 요약 — Gemini (키는 서버 .env)
// app.post('/api/summarize', ...)
