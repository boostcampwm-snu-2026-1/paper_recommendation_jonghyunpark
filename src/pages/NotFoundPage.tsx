import { Link } from 'react-router-dom'

/** 404 — 정의되지 않은 경로 */
export default function NotFoundPage() {
  return (
    <section className="text-center">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="mt-2 text-sm text-gray-500">페이지를 찾을 수 없습니다.</p>
      <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
        홈으로 돌아가기
      </Link>
    </section>
  )
}
