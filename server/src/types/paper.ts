// 논문 도메인 타입. client/src/types/paper.ts 와 동일한 형태로 맞춘다(폴더 독립 구조라 미러링).

export interface Paper {
  /** arXiv ID (버전 제거, 예: "2401.01234") — 라우팅 `/paper/:id` 의 id */
  id: string
  title: string
  authors: string[]
  /** 초록(원문) */
  abstract: string
  /** arXiv 카테고리 태그 (예: ["cs.AI", "cs.LG"]) */
  categories: string[]
  /** ISO 문자열 (발행일) */
  publishedAt: string
  /** 원문(arXiv) 링크 */
  url: string
  /** PDF 링크 (있을 경우) */
  pdfUrl?: string
}

/** /api/papers 응답 형태 */
export interface PapersResponse {
  papers: Paper[]
  /** 전체 검색 결과 수 (페이지네이션용) */
  total: number
  page: number
  pageSize: number
}
