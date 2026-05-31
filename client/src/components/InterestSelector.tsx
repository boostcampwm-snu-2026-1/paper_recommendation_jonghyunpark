import { useState } from 'react'
import { INTEREST_GROUPS } from '@/data/interests'
import { useUserPrefs } from '@/store/userPrefs'

/** 관심분야 선택 UI — 그룹별 토픽 칩(다중 선택) + 커스텀 키워드 입력 */
export default function InterestSelector() {
  const interests = useUserPrefs((s) => s.interests)
  const customKeywords = useUserPrefs((s) => s.customKeywords)
  const toggleInterest = useUserPrefs((s) => s.toggleInterest)
  const addCustomKeyword = useUserPrefs((s) => s.addCustomKeyword)
  const removeCustomKeyword = useUserPrefs((s) => s.removeCustomKeyword)

  const [keyword, setKeyword] = useState('')

  const submitKeyword = () => {
    addCustomKeyword(keyword)
    setKeyword('')
  }

  return (
    <div className="space-y-6">
      {INTEREST_GROUPS.map((group) => (
        <div key={group.group}>
          <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            {group.group}
          </h3>
          <div className="flex flex-wrap gap-2">
            {group.topics.map((topic) => {
              const selected = interests.includes(topic.id)
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => toggleInterest(topic.id)}
                  aria-pressed={selected}
                  className={
                    selected
                      ? 'rounded-full border border-blue-600 bg-blue-600 px-3 py-1 text-sm text-white'
                      : 'rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:border-blue-400 dark:border-gray-700 dark:text-gray-300'
                  }
                >
                  {topic.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* 커스텀 키워드 */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          직접 추가 (키워드)
        </h3>
        <div className="flex gap-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submitKeyword()
              }
            }}
            placeholder="예: speculative decoding"
            className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          <button
            type="button"
            onClick={submitKeyword}
            className="rounded bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-700 dark:bg-gray-700"
          >
            추가
          </button>
        </div>

        {customKeywords.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {customKeywords.map((k) => (
              <span
                key={k}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {k}
                <button
                  type="button"
                  onClick={() => removeCustomKeyword(k)}
                  aria-label={`${k} 제거`}
                  className="text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
