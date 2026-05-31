/** 온보딩 / 관심사 선택 (F1) — 첫 방문 유도. 현재는 골격. */
export default function OnboardingPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold">관심 분야 선택</h1>
      <p className="mt-2 text-sm text-gray-500">
        CS/AI 세부 분야와 키워드를 고르면 맞춤 피드를 만들어 드립니다.
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-400 dark:border-gray-700">
        TODO(F1): InterestSelector + 시작 버튼
      </div>
    </section>
  )
}
