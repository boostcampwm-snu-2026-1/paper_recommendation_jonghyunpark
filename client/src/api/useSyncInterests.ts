import { useEffect, useRef } from 'react'
import { useUserPrefs } from '@/store/userPrefs'
import { useAuth } from '@/store/auth'
import { fetchInterests, saveInterests } from './interests'

// 로그인한 userId 기준으로 관심분야를 백엔드와 동기화한다.
//  1) 로그인/전환 시: 서버 → store 하이드레이션(해당 유저 데이터로 교체)
//  2) 이후 변경 시: store → 서버 (디바운스 저장)
// userId 가 바뀌면(다른 사람 로그인) 그 유저 데이터로 다시 로드한다.
export function useSyncInterests() {
  const userId = useAuth((s) => s.userId)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 1) 로그인/전환 시 해당 유저 데이터 로드
  useEffect(() => {
    if (!userId) return
    let active = true

    fetchInterests(userId)
      .then((server) => {
        if (!active) return
        useUserPrefs.setState({
          interests: server.interests,
          customKeywords: server.customKeywords,
          // 서버에 관심사가 있으면 온보딩 완료된 유저로 간주
          onboarded: server.interests.length > 0 || server.customKeywords.length > 0,
        })
      })
      .catch(() => {
        // 서버 불가 — 로컬 상태로 계속 동작
      })

    return () => {
      active = false
    }
  }, [userId])

  // 2) 변경 → 서버 저장(디바운스)
  useEffect(() => {
    if (!userId) return
    const unsub = useUserPrefs.subscribe((state, prev) => {
      if (
        state.interests === prev.interests &&
        state.customKeywords === prev.customKeywords
      ) {
        return
      }
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        void saveInterests(userId, {
          interests: state.interests,
          customKeywords: state.customKeywords,
        })
      }, 600)
    })

    return () => {
      unsub()
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [userId])
}
