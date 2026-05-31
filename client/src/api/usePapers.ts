import { useQuery } from '@tanstack/react-query'
import { fetchPapers, type PapersQuery } from './papers'

// 추천 피드/검색에서 공통으로 쓰는 논문 목록 쿼리 훅.
export function usePapers(query: PapersQuery) {
  return useQuery({
    queryKey: ['papers', query],
    queryFn: () => fetchPapers(query),
  })
}
