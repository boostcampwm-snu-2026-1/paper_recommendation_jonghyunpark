import { apiPost } from './client'
import type { Paper, PaperSummary } from '@/types/paper'

// /api/summarize (BFF → Gemini) 호출. 서버가 paperId 기준으로 캐시한다.
export function summarizePaper(paper: Paper): Promise<PaperSummary> {
  return apiPost<PaperSummary>('/summarize', {
    paperId: paper.id,
    title: paper.title,
    abstract: paper.abstract,
  })
}
