import { useNavigate } from 'react-router-dom'
import InterestSelector from '@/components/InterestSelector'
import { useUserPrefs } from '@/store/userPrefs'

/** 온보딩 / 관심사 선택 (F1) — 분야 칩 + 커스텀 키워드 선택 후 피드로 진입 */
export default function OnboardingPage() {
  const navigate = useNavigate()
  const interests = useUserPrefs((s) => s.interests)
  const customKeywords = useUserPrefs((s) => s.customKeywords)
  const completeOnboarding = useUserPrefs((s) => s.completeOnboarding)

  const selectedCount = interests.length + customKeywords.length

  const handleStart = () => {
    completeOnboarding()
    navigate('/')
  }

  return (
    <section>
      <h1 className="text-2xl font-bold">관심 분야 선택</h1>
      <p className="mt-2 text-sm text-gray-500">
        딥러닝/AI 세부 분야와 키워드를 고르면 맞춤 피드를 만들어 드립니다.
        선택하지 않아도 CS/AI 최신 논문을 볼 수 있어요.
      </p>

      <div className="mt-6">
        <InterestSelector />
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={handleStart}
          className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
        >
          {selectedCount > 0 ? `${selectedCount}개 선택 · 시작하기` : '건너뛰고 시작하기'}
        </button>
      </div>
    </section>
  )
}
