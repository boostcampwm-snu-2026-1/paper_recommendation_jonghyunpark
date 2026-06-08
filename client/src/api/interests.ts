import { apiGet, apiPut } from './client'

// 관심분야 백엔드 동기화 (익명 기기 ID 기준). server /api/interests/:userId 와 1:1.
export interface InterestsPayload {
  interests: string[]
  customKeywords: string[]
}

export function fetchInterests(userId: string): Promise<InterestsPayload> {
  return apiGet<InterestsPayload>(`/interests/${encodeURIComponent(userId)}`)
}

export function saveInterests(
  userId: string,
  payload: InterestsPayload,
): Promise<{ ok: boolean }> {
  return apiPut<{ ok: boolean }>(`/interests/${encodeURIComponent(userId)}`, payload)
}
