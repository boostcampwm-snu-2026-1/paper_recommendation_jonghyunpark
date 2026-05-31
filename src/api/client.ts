// BFF(/api/*) 호출용 얇은 fetch 래퍼.
// 외부 API(arXiv/Semantic Scholar/Gemini)는 모두 이 BFF 뒤에 숨긴다.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/** GET 요청 후 JSON 파싱. path 는 `/papers` 처럼 BFF 기준 경로. */
export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new ApiError(`API 요청 실패: ${path}`, res.status)
  }
  return res.json() as Promise<T>
}
