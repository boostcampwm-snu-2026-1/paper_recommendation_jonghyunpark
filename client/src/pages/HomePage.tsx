import { Link, Navigate } from 'react-router-dom'
import { useUserPrefs } from '@/store/userPrefs'
import { usePapers } from '@/api/usePapers'
import PaperList from '@/components/PaperList'
import { getTopicLabel, interestsToQueries } from '@/data/interests'

/** 홈 / 추천 피드 (F2) — 관심분야 토픽 기반. 관심사 없으면 CS/AI 최신 fallback. */
export default function HomePage() {
  const interests = useUserPrefs((s) => s.interests)
  const customKeywords = useUserPrefs((s) => s.customKeywords)
  const onboarded = useUserPrefs((s) => s.onboarded)

  // 첫 방문(온보딩 전)이면 관심분야 선택으로 유도
  if (!onboarded) return <Navigate to="/onboarding" replace />

  const queries = interestsToQueries(interests, customKeywords)
  const topics = queries.length > 0 ? queries.join(',') : undefined

  const { data, isLoading, isError, refetch } = usePapers({
    topics,
    pageSize: 20,
    sort: 'recent',
  })

  const labels = [...interests.map(getTopicLabel), ...customKeywords]

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">추천 피드</h1>
          <p className="mt-2 text-sm text-gray-500">
            {labels.length > 0
              ? `관심사: ${labels.join(', ')}`
              : '관심사가 없어 CS/AI 최신 논문을 보여줍니다.'}
          </p>
        </div>
        <Link
          to="/onboarding"
          className="shrink-0 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:border-blue-400 dark:border-gray-700 dark:text-gray-300"
        >
          관심분야 편집
        </Link>
      </div>

      <div className="mt-6">
        <PaperList
          papers={data?.papers}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyMessage="추천할 논문이 없습니다. 관심분야를 조정해 보세요."
        />
      </div>
    </section>
  )
}
