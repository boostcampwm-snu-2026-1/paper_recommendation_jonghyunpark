import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/store/auth'

/** 간단 로그인 — user ID만 입력 (비밀번호 없음). 이미 로그인돼 있으면 홈으로. */
export default function LoginPage() {
  const userId = useAuth((s) => s.userId)
  const login = useAuth((s) => s.login)
  const navigate = useNavigate()
  const [value, setValue] = useState('')

  if (userId) return <Navigate to="/" replace />

  const submit = () => {
    const v = value.trim()
    if (!v) return
    login(v)
    navigate('/')
  }

  return (
    <section className="mx-auto max-w-sm py-12">
      <h1 className="text-2xl font-bold">로그인</h1>
      <p className="mt-2 text-sm text-gray-500">
        사용할 아이디를 입력하세요. 비밀번호는 없으며, 같은 아이디로 어디서든
        관심사가 이어집니다.
      </p>

      <div className="mt-6 space-y-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              submit()
            }
          }}
          placeholder="예: jonghyun"
          maxLength={50}
          autoFocus
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <button
          onClick={submit}
          disabled={!value.trim()}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          시작하기
        </button>
      </div>
    </section>
  )
}
