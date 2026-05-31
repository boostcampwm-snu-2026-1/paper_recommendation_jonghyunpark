import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from '@/api/queryClient'
import { useSyncInterests } from '@/api/useSyncInterests'
import { router } from '@/router'

/** 전역 Provider 구성 — TanStack Query + Router */
export default function App() {
  // 관심분야를 백엔드와 동기화 (익명 기기 ID 기준)
  useSyncInterests()

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
