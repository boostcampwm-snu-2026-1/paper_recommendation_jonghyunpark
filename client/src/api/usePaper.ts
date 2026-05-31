import { useQuery } from '@tanstack/react-query'
import { fetchPaperById } from './papers'

// 단일 논문 조회 훅 (상세 페이지).
export function usePaper(id: string | undefined) {
  return useQuery({
    queryKey: ['paper', id],
    queryFn: () => fetchPaperById(id!),
    enabled: !!id,
  })
}
