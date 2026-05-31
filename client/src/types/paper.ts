// 논문 도메인 공통 타입. arXiv / Semantic Scholar 응답을 BFF에서 이 형태로 정규화한다.

export interface Paper {
  /** arXiv ID (예: "2401.01234") — 라우팅 `/paper/:id` 의 id로 사용 */
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

/** LLM 요약 결과 (Gemini, BFF 경유) */
export interface PaperSummary {
  paperId: string
  /** 3~4줄 핵심 요약 */
  summary: string
}
