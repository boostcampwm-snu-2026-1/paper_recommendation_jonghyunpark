import { useUserPrefs } from '@/store/userPrefs'
import type { Paper } from '@/types/paper'

/** 내 서재(북마크) 토글 버튼 — ☆/⭐ */
export default function BookmarkButton({
  paper,
  showLabel = false,
}: {
  paper: Paper
  showLabel?: boolean
}) {
  const bookmarked = useUserPrefs((s) => s.bookmarks.some((b) => b.id === paper.id))
  const toggleBookmark = useUserPrefs((s) => s.toggleBookmark)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleBookmark(paper)
      }}
      aria-pressed={bookmarked}
      title={bookmarked ? '내 서재에서 제거' : '내 서재에 저장'}
      className={
        showLabel
          ? `inline-flex shrink-0 items-center gap-1 rounded border px-2 py-1 text-sm ${
              bookmarked
                ? 'border-yellow-400 text-yellow-600'
                : 'border-gray-300 text-gray-500 hover:border-yellow-400 hover:text-yellow-600 dark:border-gray-700'
            }`
          : `shrink-0 text-xl leading-none ${
              bookmarked ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'
            }`
      }
    >
      {bookmarked ? '⭐' : '☆'}
      {showLabel && <span>{bookmarked ? '저장됨' : '내 서재'}</span>}
    </button>
  )
}
