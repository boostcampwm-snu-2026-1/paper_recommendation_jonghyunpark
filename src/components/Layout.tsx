import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: '홈', end: true },
  { to: '/search', label: '검색', end: false },
  { to: '/library', label: '내 서재', end: false },
]

/** 앱 공통 레이아웃 — 상단 네비 + 페이지 영역(Outlet) */
export default function Layout() {
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
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
