import { QueryClient } from '@tanstack/react-query'

// 앱 전역 단일 QueryClient. 외부 API는 자주 안 바뀌므로 staleTime을 넉넉히 둔다.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
