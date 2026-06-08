import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/store/auth'
import { useUserPrefs } from '@/store/userPrefs'

const navItems = [
  { to: '/', label: '홈', end: true },
  { to: '/search', label: '검색', end: false },
  { to: '/library', label: '내 서재', end: false },
]

/** 앱 공통 레이아웃 — 상단 네비 + 페이지 영역(Outlet). 로그인 안되면 /login으로. */
export default function Layout() {
  const userId = useAuth((s) => s.userId)
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()

  // 로그인 가드
  if (!userId) return <Navigate to="/login" replace />

  const handleLogout = () => {
    logout()
    // 다음 사용자를 위해 로컬 관심사 상태 초기화 (서버 데이터는 그대로 보존됨)
    useUserPrefs.setState({ interests: [], customKeywords: [], onboarded: false })
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-full bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <nav className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
          <NavLink to="/" className="text-lg font-bold">
            📚 Paper Rec
          </NavLink>
          <div className="flex gap-4 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive
                    ? 'font-semibold text-blue-600'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-gray-500">👤 {userId}</span>
            <button
              onClick={handleLogout}
              className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:border-red-400 hover:text-red-500 dark:border-gray-700 dark:text-gray-300"
            >
              로그아웃
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
