import { useUserPrefs } from '@/store/userPrefs'

/** 내 서재 (F7) — 북마크한 논문 목록. 현재는 골격(스토어 연동만). */
export default function LibraryPage() {
  const bookmarks = useUserPrefs((s) => s.bookmarks)

  return (
    <section>
      <h1 className="text-2xl font-bold">내 서재</h1>
      <p className="mt-2 text-sm text-gray-500">북마크한 논문 {bookmarks.length}편</p>

      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-400 dark:border-gray-700">
        {bookmarks.length === 0
          ? '아직 북마크한 논문이 없습니다.'
          : 'TODO(F7): 북마크 PaperList + 삭제'}
      </div>
    </section>
  )
}
