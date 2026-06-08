import { apiGet, apiPut } from './client'
import type { Paper } from '@/types/paper'

// 북마크 백엔드 동기화 (userId 기준). server /api/bookmarks/:userId 와 1:1.
export function fetchBookmarks(userId: string): Promise<{ bookmarks: Paper[] }> {
  return apiGet<{ bookmarks: Paper[] }>(`/bookmarks/${encodeURIComponent(userId)}`)
}

export function saveBookmarks(
  userId: string,
  bookmarks: Paper[],
): Promise<{ ok: boolean }> {
  return apiPut<{ ok: boolean }>(`/bookmarks/${encodeURIComponent(userId)}`, {
    bookmarks,
  })
}
