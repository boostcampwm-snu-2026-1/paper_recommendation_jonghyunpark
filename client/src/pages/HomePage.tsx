import { useUserPrefs } from '@/store/userPrefs'
import { usePapers } from '@/api/usePapers'
import PaperList from '@/components/PaperList'

/** 홈 / 추천 피드 (F2) — 관심사 기반 arXiv 논문. 관심사 없으면 최신 fallback. */
export default function HomePage() {
  const interests = useUserPrefs((s) => s.interests)
  const category = interests.length > 0 ? interests.join(',') : undefined

  const { data, isLoading, isError, refetch } = usePapers({
    category,
    pageSize: 20,
    sort: 'recent',
  })

  return (
    <section>
      <h1 className="text-2xl font-bold">추천 피드</h1>
      <p className="mt-2 text-sm text-gray-500">
        {interests.length > 0
          ? `관심사: ${interests.join(', ')}`
          : '관심사가 없어 CS/AI 최신 논문을 보여줍니다.'}
      </p>

      <div className="mt-6">
        <PaperList
          papers={data?.papers}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyMessage="추천할 논문이 없습니다."
        />
      </div>
    </section>
  )
}
