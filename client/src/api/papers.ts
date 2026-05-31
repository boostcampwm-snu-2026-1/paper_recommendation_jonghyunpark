import { apiGet } from './client'
import type { Paper, PapersResponse } from '@/types/paper'

// /api/papers (BFF → arXiv) 호출. 파라미터는 server의 쿼리와 1:1 대응.
export interface PapersQuery {
  /** 키워드 검색어 */
  q?: string
  /** arXiv 카테고리(콤마 구분, 예: "cs.AI,cs.LG") */
  category?: string
  /** 관심 토픽(콤마 구분 구문). 여러 개는 OR로 묶인다. */
  topics?: string
  /** 1-based 페이지 */
  page?: number
  pageSize?: number
  sort?: 'recent' | 'relevance'
}

export function fetchPapers(query: PapersQuery): Promise<PapersResponse> {
  return apiGet<PapersResponse>('/papers', {
    q: query.q,
    category: query.category,
    topics: query.topics,
    page: query.page,
    pageSize: query.pageSize,
    sort: query.sort,
  })
}

/** 단일 논문 조회 (상세 페이지용) */
export function fetchPaperById(id: string): Promise<Paper> {
  return apiGet<Paper>(`/papers/${id}`)
}
