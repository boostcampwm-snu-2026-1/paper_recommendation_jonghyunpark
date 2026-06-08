import { XMLParser } from 'fast-xml-parser'
import type { Paper, PapersResponse } from '../types/paper.js'
import { fetchPapersOpenAlex, fetchPaperByIdOpenAlex } from './openalex.js'

// arXiv API(Atom XML) 호출 + Paper[] 정규화.
// 외부 API는 BFF 뒤에 숨기고, 프론트엔드에는 항상 이 JSON 형태로만 내려준다.
// arXiv가 레이트리밋(429) 등으로 실패하면 OpenAlex로 자동 fallback 한다.

const ARXIV_ENDPOINT = 'https://export.arxiv.org/api/query'
const DEFAULT_CATEGORY = 'cs.AI'

// arXiv는 과도한 호출에 429를 던진다. 자기 식별 User-Agent + 429/503 백오프 재시도로 완화.
const USER_AGENT =
  'paper-recommendation/0.1 (research demo; contact: mprlabsnu@gmail.com)'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function arxivFetch(url: string, maxRetries = 1): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if ((res.status === 429 || res.status === 503) && attempt < maxRetries) {
      await sleep(600 * 2 ** attempt) // 0.6s (그 후 OpenAlex fallback)
      continue
    }
    return res
  }
}

export interface FetchPapersParams {
  /** 키워드 검색어 */
  q?: string
  /** arXiv 카테고리(콤마 구분, 예: "cs.AI,cs.LG") */
  category?: string
  /** 관심 토픽(콤마 구분 구문). 여러 개는 OR로 묶는다. 예: "vision language action,continual learning" */
  topics?: string
  /** 1-based 페이지 */
  page?: number
  pageSize?: number
  /** 정렬: 최신순(기본) | 관련도순 */
  sort?: 'recent' | 'relevance'
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
})

/** 항상 배열로 정규화 (fast-xml-parser는 단일 요소를 객체로 반환) */
function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

/** 개행/연속 공백을 한 칸으로 정리 */
function clean(text: unknown): string {
  return String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** "http://arxiv.org/abs/2605.30348v1" → "2605.30348" (버전 제거) */
function extractArxivId(rawId: string): string {
  const tail = rawId.split('/abs/')[1] ?? rawId
  return tail.replace(/v\d+$/, '')
}

interface ArxivEntry {
  id: string
  title: string
  summary: string
  published: string
  author?: { name: string } | { name: string }[]
  category?: { '@_term': string } | { '@_term': string }[]
  link?: ArxivLink | ArxivLink[]
}

interface ArxivLink {
  '@_href': string
  '@_title'?: string
  '@_type'?: string
}

function entryToPaper(entry: ArxivEntry): Paper {
  const links = toArray(entry.link)
  const pdfLink = links.find((l) => l['@_title'] === 'pdf')

  return {
    id: extractArxivId(entry.id),
    title: clean(entry.title),
    authors: toArray(entry.author).map((a) => clean(a.name)),
    abstract: clean(entry.summary),
    categories: toArray(entry.category).map((c) => c['@_term']),
    publishedAt: entry.published,
    url: entry.id.replace('http://', 'https://'),
    pdfUrl: pdfLink?.['@_href'],
  }
}

/** 구문에 공백이 있으면 따옴표로 묶어 정확도를 높인다. */
function arxivTerm(phrase: string): string {
  return phrase.includes(' ') ? `all:"${phrase}"` : `all:${phrase}`
}

function splitCsv(value?: string): string[] {
  return (value ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

/** q/category/topics 로 arXiv search_query 문자열을 만든다. */
function buildSearchQuery(q?: string, category?: string, topics?: string): string {
  const parts: string[] = []

  const cats = splitCsv(category)
  if (cats.length > 0) {
    parts.push(`(${cats.map((c) => `cat:${c}`).join(' OR ')})`)
  }

  // 관심 토픽들은 OR로 묶는다(아무거나 매칭되면 피드에 노출)
  const topicList = splitCsv(topics)
  if (topicList.length > 0) {
    parts.push(`(${topicList.map(arxivTerm).join(' OR ')})`)
  }

  const keyword = q?.trim()
  if (keyword) parts.push(arxivTerm(keyword))

  // 아무 조건도 없으면 CS/AI 최신 피드를 기본값으로
  if (parts.length === 0) return `cat:${DEFAULT_CATEGORY}`
  return parts.join(' AND ')
}

async function fetchPapersArxiv(params: FetchPapersParams): Promise<PapersResponse> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20))
  const start = (page - 1) * pageSize

  const query = new URLSearchParams({
    search_query: buildSearchQuery(params.q, params.category, params.topics),
    start: String(start),
    max_results: String(pageSize),
    sortBy: params.sort === 'relevance' ? 'relevance' : 'submittedDate',
    sortOrder: 'descending',
  })

  const res = await arxivFetch(`${ARXIV_ENDPOINT}?${query.toString()}`)
  if (!res.ok) {
    throw new Error(`arXiv API 응답 오류: ${res.status}`)
  }

  const xml = await res.text()
  const parsed = parser.parse(xml)
  const feed = parsed.feed ?? {}

  const total = Number(feed['opensearch:totalResults'] ?? 0)
  const papers = toArray<ArxivEntry>(feed.entry).map(entryToPaper)

  return { papers, total, page, pageSize }
}

/** 추천/검색 피드. arXiv 우선, 실패 시 OpenAlex로 자동 fallback. */
export async function fetchPapers(params: FetchPapersParams): Promise<PapersResponse> {
  try {
    return await fetchPapersArxiv(params)
  } catch (err) {
    console.warn(
      `[papers] arXiv 실패 → OpenAlex fallback: ${(err as Error).message}`,
    )
    return fetchPapersOpenAlex(params)
  }
}

async function fetchPaperByIdArxiv(id: string): Promise<Paper | null> {
  const query = new URLSearchParams({ id_list: id, max_results: '1' })
  const res = await arxivFetch(`${ARXIV_ENDPOINT}?${query.toString()}`)
  if (!res.ok) {
    throw new Error(`arXiv API 응답 오류: ${res.status}`)
  }
  const parsed = parser.parse(await res.text())
  const entry = toArray<ArxivEntry>(parsed.feed?.entry)[0]
  return entry ? entryToPaper(entry) : null
}

/** 단일 논문 조회 (상세 페이지용). arXiv 우선, 실패 시 OpenAlex fallback. 없으면 null. */
export async function fetchPaperById(id: string): Promise<Paper | null> {
  try {
    return await fetchPaperByIdArxiv(id)
  } catch (err) {
    console.warn(
      `[paper:${id}] arXiv 실패 → OpenAlex fallback: ${(err as Error).message}`,
    )
    return fetchPaperByIdOpenAlex(id)
  }
}
