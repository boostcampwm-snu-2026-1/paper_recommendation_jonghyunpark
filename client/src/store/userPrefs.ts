import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Paper } from '@/types/paper'

// 관심사 + 북마크를 localStorage에 영속화하는 전역 스토어 (개인화 신호).
// 5단계에서 InterestSelector / BookmarkButton / 온보딩이 이 스토어를 사용한다.

interface UserPrefsState {
  /** 온보딩에서 고른 관심분야 토픽 id (data/interests.ts 카탈로그 기준) */
  interests: string[]
  /** 사용자가 직접 입력한 커스텀 키워드 */
  customKeywords: string[]
  /** 북마크한 논문 (논문 객체 전체를 저장해 오프라인 조회 가능) */
  bookmarks: Paper[]
  /** 온보딩 완료 여부 */
  onboarded: boolean

  setInterests: (interests: string[]) => void
  toggleInterest: (id: string) => void
  addCustomKeyword: (keyword: string) => void
  removeCustomKeyword: (keyword: string) => void
  toggleBookmark: (paper: Paper) => void
  isBookmarked: (id: string) => boolean
  completeOnboarding: () => void
}

export const useUserPrefs = create<UserPrefsState>()(
  persist(
    (set, get) => ({
      interests: [],
      customKeywords: [],
      bookmarks: [],
      onboarded: false,

      setInterests: (interests) => set({ interests }),

      toggleInterest: (id) =>
        set((state) => ({
          interests: state.interests.includes(id)
            ? state.interests.filter((i) => i !== id)
            : [...state.interests, id],
        })),

      addCustomKeyword: (keyword) =>
        set((state) => {
          const k = keyword.trim()
          if (!k || state.customKeywords.includes(k)) return state
          return { customKeywords: [...state.customKeywords, k] }
        }),

      removeCustomKeyword: (keyword) =>
        set((state) => ({
          customKeywords: state.customKeywords.filter((k) => k !== keyword),
        })),

      toggleBookmark: (paper) =>
        set((state) => {
          const exists = state.bookmarks.some((b) => b.id === paper.id)
          return {
            bookmarks: exists
              ? state.bookmarks.filter((b) => b.id !== paper.id)
              : [...state.bookmarks, paper],
          }
        }),

      isBookmarked: (id) => get().bookmarks.some((b) => b.id === id),

      completeOnboarding: () => set({ onboarded: true }),
    }),
    { name: 'paper-rec/user-prefs' },
  ),
)
