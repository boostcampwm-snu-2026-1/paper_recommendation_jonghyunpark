import { useUserPrefs } from '@/store/userPrefs'

/** 홈 / 추천 피드 (F2) — 관심사 기반 arXiv 논문 목록. 현재는 골격. */
export default function HomePage() {
  const interests = useUserPrefs((s) => s.interests)

  return (
    <section>
      <h1 className="text-2xl font-bold">추천 피드</h1>
      <p className="mt-2 text-sm text-gray-500">
        {interests.length > 0
          ? `관심사: ${interests.join(', ')}`
          : '아직 관심사가 없습니다. 온보딩에서 분야를 선택하세요.'}
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-400 dark:border-gray-700">
        TODO(F2): 관심사 기반 PaperList 연동
      </div>
    </section>
  )
}
