import type { Paper } from '@/types/paper'
import { useSummary } from '@/api/useSummary'

/** Gemini LLM 요약 표시 (F4) — 로딩/에러/재시도 포함 */
export default function SummaryBox({ paper }: { paper: Paper }) {
  const { data, isLoading, isError, refetch, isFetching } = useSummary(paper)

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
          🤖 AI 요약 (Gemini)
        </h2>
        {!isLoading && (
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs text-blue-600 hover:underline disabled:opacity-50"
          >
            {isFetching ? '생성 중…' : '다시 생성'}
          </button>
        )}
      </div>

      <div className="mt-3">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-blue-100 dark:bg-blue-900" />
            <div className="h-3 w-11/12 animate-pulse rounded bg-blue-100 dark:bg-blue-900" />
            <div className="h-3 w-9/12 animate-pulse rounded bg-blue-100 dark:bg-blue-900" />
          </div>
        ) : isError ? (
          <div className="text-sm">
            <p className="text-red-500">요약을 생성하지 못했습니다.</p>
            <button
              onClick={() => refetch()}
              className="mt-2 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        ) : data ? (
          <>
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-800 dark:text-gray-200">
              {data.summary}
            </p>
            {data.keywords.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {data.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
