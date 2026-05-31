import type { Paper } from '@/types/paper'
import PaperCard from './PaperCard'

interface PaperListProps {
  papers?: Paper[]
  isLoading: boolean
  isError: boolean
  onRetry?: () => void
  /** 결과가 0건일 때 보여줄 문구 */
  emptyMessage?: string
}

function StateBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400 dark:border-gray-700">
      {children}
    </div>
  )
}

/** 논문 카드 리스트 + 로딩/빈/에러 상태 처리 */
export default function PaperList({
  papers,
  isLoading,
  isError,
  onRetry,
  emptyMessage = '표시할 논문이 없습니다.',
}: PaperListProps) {
  if (isLoading) {
    // 스켈레톤
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800"
          />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <StateBox>
        <p className="text-red-500">논문을 불러오지 못했습니다.</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
          >
            다시 시도
          </button>
        )}
      </StateBox>
    )
  }

  if (!papers || papers.length === 0) {
    return <StateBox>{emptyMessage}</StateBox>
  }

  return (
    <div className="space-y-3">
      {papers.map((paper) => (
        <PaperCard key={paper.id} paper={paper} />
      ))}
    </div>
  )
}
