import { apiGet } from './client'
import type { PapersResponse } from '@/types/paper'

// /api/papers (BFF → arXiv) 호출. 파라미터는 server의 쿼리와 1:1 대응.
export interface PapersQuery {
  /** 키워드 검색어 */
  q?: string
  /** arXiv 카테고리(콤마 구분, 예: "cs.AI,cs.LG") */
  category?: string
  /** 1-based 페이지 */
  page?: number
  pageSize?: number
  sort?: 'recent' | 'relevance'
}

export function fetchPapers(query: PapersQuery): Promise<PapersResponse> {
  return apiGet<PapersResponse>('/papers', {
    q: query.q,
    category: query.category,
    page: query.page,
    pageSize: query.pageSize,
    sort: query.sort,
  })
}
