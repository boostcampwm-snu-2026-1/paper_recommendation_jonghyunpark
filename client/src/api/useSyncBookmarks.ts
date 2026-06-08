import { useEffect, useRef } from 'react'
import { useUserPrefs } from '@/store/userPrefs'
import { useAuth } from '@/store/auth'
import { fetchBookmarks, saveBookmarks } from './bookmarks'

// 북마크를 백엔드(userId 기준)와 동기화한다. (useSyncInterests와 동일 패턴)
//  1) 로그인/전환 시: 서버 → store 하이드레이션(해당 유저 북마크로 교체)
//  2) 이후 변경 시: store → 서버 (디바운스 저장)
export function useSyncBookmarks() {
  const userId = useAuth((s) => s.userId)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 1) 로그인/전환 시 해당 유저 북마크 로드
  useEffect(() => {
    if (!userId) return
    let active = true

    fetchBookmarks(userId)
      .then(({ bookmarks }) => {
        if (active) useUserPrefs.setState({ bookmarks })
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
      if (state.bookmarks === prev.bookmarks) return
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        void saveBookmarks(userId, state.bookmarks)
      }, 600)
    })

    return () => {
      unsub()
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [userId])
}
