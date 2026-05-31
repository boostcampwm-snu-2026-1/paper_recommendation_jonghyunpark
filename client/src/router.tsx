import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import OnboardingPage from '@/pages/OnboardingPage'
import SearchPage from '@/pages/SearchPage'
import PaperDetailPage from '@/pages/PaperDetailPage'
import LibraryPage from '@/pages/LibraryPage'
import NotFoundPage from '@/pages/NotFoundPage'

// 기획서 5.2의 5개 페이지 라우트 골격
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'paper/:id', element: <PaperDetailPage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
