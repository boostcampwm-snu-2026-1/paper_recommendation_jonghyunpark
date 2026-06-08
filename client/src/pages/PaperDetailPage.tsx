import { Link, useParams } from 'react-router-dom'
import { usePaper } from '@/api/usePaper'
import SummaryBox from '@/components/SummaryBox'
import BookmarkButton from '@/components/BookmarkButton'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('ko-KR')
}

/** 논문 상세 (F3) — 메타정보 + LLM 요약(F4). 유사 논문(F5)은 추후. */
export default function PaperDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: paper, isLoading, isError, refetch } = usePaper(id)

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-40 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      </div>
    )
  }

  if (isError || !paper) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm dark:border-gray-700">
        <p className="text-red-500">논문을 불러오지 못했습니다. (ID: {id})</p>
        <button
          onClick={() => refetch()}
          className="mt-3 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
        >
          다시 시도
        </button>
        <div className="mt-3">
          <Link to="/" className="text-blue-600 hover:underline">
            ← 홈으로
          </Link>
        </div>
      </div>
    )
  }

  return (
    <article className="space-y-5">
      <div>
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← 홈으로
        </Link>
      </div>

      <header>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold">{paper.title}</h1>
          <BookmarkButton paper={paper} showLabel />
        </div>
        <p className="mt-2 text-sm text-gray-500">{paper.authors.join(', ')}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {paper.publishedAt && (
            <span className="text-xs text-gray-400">{formatDate(paper.publishedAt)}</span>
          )}
          {paper.categories.map((cat) => (
            <span
              key={cat}
              className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              {cat}
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-3 text-sm">
          <a href={paper.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
            arXiv 원문 ↗
          </a>
          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              PDF ↗
            </a>
          )}
        </div>
      </header>

      {/* AI 요약 (Gemini) */}
      <SummaryBox paper={paper} />

      {/* 초록 원문 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">초록</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {paper.abstract}
        </p>
      </section>
    </article>
  )
}
