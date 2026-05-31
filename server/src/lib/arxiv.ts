import { XMLParser } from 'fast-xml-parser'
import type { Paper, PapersResponse } from '../types/paper.js'

// arXiv API(Atom XML) 호출 + Paper[] 정규화.
// 외부 API는 BFF 뒤에 숨기고, 프론트엔드에는 항상 이 JSON 형태로만 내려준다.

const ARXIV_ENDPOINT = 'https://export.arxiv.org/api/query'
const DEFAULT_CATEGORY = 'cs.AI'

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

export async function fetchPapers(params: FetchPapersParams): Promise<PapersResponse> {
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

  const res = await fetch(`${ARXIV_ENDPOINT}?${query.toString()}`)
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
