import { useEffect, useRef, useState } from 'react'
import { useUserPrefs } from '@/store/userPrefs'
import { getDeviceId } from '@/lib/deviceId'
import { fetchInterests, saveInterests } from './interests'

// 관심분야를 백엔드(익명 기기 ID 기준)와 동기화한다.
//  1) 앱 시작: 서버 → store 하이드레이션 (서버가 비어있으면 로컬 값을 서버로 마이그레이션)
//  2) 이후 변경: store → 서버 (디바운스 저장)
// 서버 불가 시에도 localStorage 영속으로 계속 동작(graceful degradation).
export function useSyncInterests() {
  const [ready, setReady] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 1) 초기 로드
  useEffect(() => {
    let active = true
    const id = getDeviceId()

    fetchInterests(id)
      .then((server) => {
        if (!active) return
        const hasServer =
          server.interests.length > 0 || server.customKeywords.length > 0
        if (hasServer) {
          useUserPrefs.setState({
            interests: server.interests,
            customKeywords: server.customKeywords,
          })
        } else {
          const { interests, customKeywords } = useUserPrefs.getState()
          if (interests.length > 0 || customKeywords.length > 0) {
            void saveInterests(id, { interests, customKeywords })
          }
        }
      })
      .catch(() => {
        // 서버 불가 — 로컬 상태로 계속 동작
      })
      .finally(() => {
        if (active) setReady(true)
      })

    return () => {
      active = false
    }
  }, [])

  // 2) 변경 → 서버 저장(디바운스)
  useEffect(() => {
    if (!ready) return
    const unsub = useUserPrefs.subscribe((state, prev) => {
      if (
        state.interests === prev.interests &&
        state.customKeywords === prev.customKeywords
      ) {
        return
      }
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        void saveInterests(getDeviceId(), {
          interests: state.interests,
          customKeywords: state.customKeywords,
        })
      }, 600)
    })

    return () => {
      unsub()
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [ready])
}
