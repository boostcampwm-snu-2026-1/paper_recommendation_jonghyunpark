import { useUserPrefs } from '@/store/userPrefs'
import PaperList from '@/components/PaperList'

/** 내 서재 (F7) — 북마크한 논문 목록. 각 카드의 ⭐로 제거. */
export default function LibraryPage() {
  const bookmarks = useUserPrefs((s) => s.bookmarks)

  return (
    <section>
      <h1 className="text-2xl font-bold">내 서재</h1>
      <p className="mt-2 text-sm text-gray-500">저장한 논문 {bookmarks.length}편</p>

      <div className="mt-6">
        <PaperList
          papers={bookmarks}
          isLoading={false}
          isError={false}
          emptyMessage="아직 저장한 논문이 없습니다. 논문 카드의 ☆를 눌러 내 서재에 추가하세요."
        />
      </div>
    </section>
  )
}
