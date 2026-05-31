import { Link } from 'react-router-dom'
import type { Paper } from '@/types/paper'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('ko-KR')
}

function formatAuthors(authors: string[]): string {
  if (authors.length === 0) return '저자 미상'
  if (authors.length <= 3) return authors.join(', ')
  return `${authors.slice(0, 3).join(', ')} 외 ${authors.length - 3}명`
}

/** 논문 한 개 카드 — 제목(상세 링크)·저자·발행일·카테고리 태그 */
export default function PaperCard({ paper }: { paper: Paper }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <Link
        to={`/paper/${paper.id}`}
        className="text-base font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-100"
      >
        {paper.title}
      </Link>

      <p className="mt-1 text-sm text-gray-500">{formatAuthors(paper.authors)}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {paper.publishedAt && (
          <span className="text-xs text-gray-400">{formatDate(paper.publishedAt)}</span>
        )}
        {paper.categories.map((cat) => (
          <span
            key={cat}
            className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300"
          >
            {cat}
          </span>
        ))}
      </div>
    </article>
  )
}
