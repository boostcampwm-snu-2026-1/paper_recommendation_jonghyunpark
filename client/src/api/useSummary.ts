import { useQuery } from '@tanstack/react-query'
import { summarizePaper } from './summary'
import type { Paper } from '@/types/paper'

// 논문 LLM 요약 훅. 요약은 잘 안 바뀌므로 한 번 생성하면 계속 캐시한다.
export function useSummary(paper: Paper | undefined) {
  return useQuery({
    queryKey: ['summary', paper?.id],
    queryFn: () => summarizePaper(paper!),
    enabled: !!paper && !!paper.abstract,
    staleTime: Infinity,
    retry: 1,
  })
}
