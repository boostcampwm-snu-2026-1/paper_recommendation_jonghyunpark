import { Hono } from 'hono'
import { fetchPapers, fetchPaperById } from './lib/arxiv.js'
import { interestStore } from './lib/interestStore.js'
import { bookmarkStore } from './lib/bookmarkStore.js'
import { summarizePaper } from './lib/gemini.js'
import { summaryStore } from './lib/summaryStore.js'
import type { Paper, PaperSummary } from './types/paper.js'

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

// 단일 논문 조회 (상세 페이지용)
app.get('/api/papers/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const paper = await fetchPaperById(id)
    if (!paper) return c.json({ error: '논문을 찾을 수 없습니다.' }, 404)
    return c.json(paper)
  } catch (err) {
    console.error('[api/papers/:id] error:', err)
    return c.json({ error: '논문을 가져오지 못했습니다.' }, 502)
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

// 북마크 저장/조회 (userId 기준, users 문서의 bookmarks 필드)
app.get('/api/bookmarks/:userId', async (c) => {
  const bookmarks = await bookmarkStore.get(c.req.param('userId'))
  return c.json({ bookmarks })
})

app.put('/api/bookmarks/:userId', async (c) => {
  const userId = c.req.param('userId')
  if (!userId || userId.length > 100) {
    return c.json({ error: '유효하지 않은 userId' }, 400)
  }

  const body = await c.req.json().catch(() => null)
  if (!body || !Array.isArray(body.bookmarks)) {
    return c.json({ error: 'bookmarks 배열이 필요합니다.' }, 400)
  }

  // 가벼운 정규화: id(string)가 있는 항목만, 최대 500개
  const bookmarks = (body.bookmarks as unknown[])
    .filter(
      (b): b is { id: string } =>
        typeof b === 'object' && b !== null && typeof (b as { id?: unknown }).id === 'string',
    )
    .slice(0, 500) as Paper[]

  await bookmarkStore.set(userId, bookmarks)
  return c.json({ ok: true })
})

// 논문 초록 LLM 요약 (Gemini, 키는 서버 .env)
// paperId 기준으로 summaryStore(MongoDB/인메모리)에 캐시해 중복 호출을 막는다.
app.post('/api/summarize', async (c) => {
  const body = await c.req.json().catch(() => null)
  const paperId: unknown = body?.paperId
  const title: unknown = body?.title
  const abstract: unknown = body?.abstract

  if (typeof paperId !== 'string' || typeof abstract !== 'string' || !abstract) {
    return c.json({ error: 'paperId, abstract 가 필요합니다.' }, 400)
  }

  const cached = await summaryStore.get(paperId)
  if (cached) return c.json(cached)

  try {
    const { summary, keywords } = await summarizePaper({
      title: typeof title === 'string' ? title : '',
      abstract,
    })
    const result: PaperSummary = { paperId, summary, keywords }
    await summaryStore.set(paperId, result)
    return c.json(result)
  } catch (err) {
    console.error('[api/summarize] error:', err)
    return c.json({ error: '요약 생성에 실패했습니다.' }, 502)
  }
})

// TODO(다음 task): 유사 논문 — arXiv ID → Semantic Scholar
// app.get('/api/similar', ...)
