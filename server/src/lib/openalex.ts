import type { Paper, PapersResponse } from '../types/paper.js'
import type { FetchPapersParams } from './arxiv.js'

// OpenAlex fallback — arXiv가 레이트리밋(429) 등으로 실패할 때 사용.
// arXiv를 source로 필터링해 arXiv ID/초록을 그대로 유지한다(상세·요약 흐름 호환).

const ENDPOINT = 'https://api.openalex.org/works'
const ARXIV_SOURCE_ID = 'S4306400194' // OpenAlex에서 arXiv source
const MAILTO = 'mprlabsnu@gmail.com' // polite pool (한도 상향)

interface OpenAlexWork {
  id?: string
  title?: string
  display_name?: string
  publication_date?: string
  abstract_inverted_index?: Record<string, number[]>
  authorships?: { author?: { display_name?: string } }[]
  topics?: { display_name?: string }[]
  concepts?: { display_name?: string }[]
  primary_location?: { landing_page_url?: string; pdf_url?: string }
}

/** OpenAlex의 abstract_inverted_index(단어→위치)를 원문 텍스트로 복원 */
function reconstructAbstract(inv?: Record<string, number[]>): string {
  if (!inv) return ''
  const words: string[] = []
  for (const [word, positions] of Object.entries(inv)) {
    for (const p of positions) words[p] = word
  }
  return words.join(' ').trim()
}

/** "https://arxiv.org/abs/2606.05559" → "2606.05559" (버전 제거) */
function arxivIdFromUrl(url?: string): string {
  const m = (url ?? '').match(/arxiv\.org\/abs\/(.+)$/)
  return m ? m[1].replace(/v\d+$/, '') : ''
}

function buildSearch(params: FetchPapersParams): string {
  const terms: string[] = []
  if (params.topics) {
    terms.push(...params.topics.split(',').map((t) => t.trim()).filter(Boolean))
  }
  if (params.q?.trim()) terms.push(params.q.trim())
  // category(cs.AI 등)는 OpenAlex가 직접 매핑되지 않으므로 검색어로만 보조
  return terms.join(' ')
}

function workToPaper(w: OpenAlexWork): Paper {
  const url = w.primary_location?.landing_page_url ?? ''
  const cats = (w.topics ?? w.concepts ?? [])
    .slice(0, 3)
    .map((c) => c.display_name)
    .filter((x): x is string => Boolean(x))

  return {
    id: arxivIdFromUrl(url) || (w.id ?? '').replace('https://openalex.org/', 'openalex:'),
    title: w.title ?? w.display_name ?? '',
    authors: (w.authorships ?? [])
      .map((a) => a.author?.display_name)
      .filter((x): x is string => Boolean(x)),
    abstract: reconstructAbstract(w.abstract_inverted_index),
    categories: cats,
    publishedAt: w.publication_date ? `${w.publication_date}T00:00:00Z` : '',
    url: url || (w.id ?? ''),
    pdfUrl: w.primary_location?.pdf_url || undefined,
  }
}

/** arXiv ID로 단일 논문 조회 (상세 페이지 fallback). 없으면 null. */
export async function fetchPaperByIdOpenAlex(id: string): Promise<Paper | null> {
  const qs = new URLSearchParams({
    filter: `locations.landing_page_url:https://arxiv.org/abs/${id}`,
    per_page: '1',
    mailto: MAILTO,
  })
  const res = await fetch(`${ENDPOINT}?${qs.toString()}`)
  if (!res.ok) {
    throw new Error(`OpenAlex API 응답 오류: ${res.status}`)
  }
  const data = (await res.json()) as { results?: OpenAlexWork[] }
  const work = (data.results ?? [])[0]
  return work ? workToPaper(work) : null
}

export async function fetchPapersOpenAlex(
  params: FetchPapersParams,
): Promise<PapersResponse> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20))
  const search = buildSearch(params)

  const qs = new URLSearchParams({
    filter: `primary_location.source.id:${ARXIV_SOURCE_ID}`,
    per_page: String(pageSize),
    page: String(page),
    mailto: MAILTO,
  })
  if (search) qs.set('search', search)
  // relevance 정렬은 검색어가 있을 때만 유효, 그 외엔 최신순
  qs.set(
    'sort',
    params.sort === 'relevance' && search ? 'relevance_score:desc' : 'publication_date:desc',
  )

  const res = await fetch(`${ENDPOINT}?${qs.toString()}`)
  if (!res.ok) {
    throw new Error(`OpenAlex API 응답 오류: ${res.status}`)
  }

  const data = (await res.json()) as { results?: OpenAlexWork[]; meta?: { count?: number } }
  const papers = (data.results ?? []).map(workToPaper)
  return { papers, total: Number(data.meta?.count ?? papers.length), page, pageSize }
}
