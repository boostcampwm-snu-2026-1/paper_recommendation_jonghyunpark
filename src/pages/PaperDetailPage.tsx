import { useParams } from 'react-router-dom'

/** 논문 상세 (F3) — 메타정보 + LLM 요약(F4) + 비슷한 논문(F5). 현재는 골격. */
export default function PaperDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <section>
      <h1 className="text-2xl font-bold">논문 상세</h1>
      <p className="mt-2 text-sm text-gray-500">arXiv ID: {id}</p>

      <div className="mt-6 space-y-4">
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-400 dark:border-gray-700">
          TODO(F3): 제목·저자·초록·원문 링크
        </div>
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-400 dark:border-gray-700">
          TODO(F4): SummaryBox (Gemini 요약)
        </div>
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-400 dark:border-gray-700">
          TODO(F5): SimilarPapers
        </div>
      </div>
    </section>
  )
}
