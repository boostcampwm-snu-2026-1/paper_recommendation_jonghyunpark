import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from '@/api/queryClient'
import { useSyncInterests } from '@/api/useSyncInterests'
import { useSyncBookmarks } from '@/api/useSyncBookmarks'
import { router } from '@/router'

/** 전역 Provider 구성 — TanStack Query + Router */
export default function App() {
  // 관심분야·북마크를 백엔드와 동기화 (로그인 userId 기준)
  useSyncInterests()
  useSyncBookmarks()

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
