// Gemini API 호출 — 논문 초록을 한국어로 요약 + 핵심 키워드 추출.
// API 키는 서버 .env(GEMINI_API_KEY)에서만 읽는다 (클라이언트 노출 금지).

const DEFAULT_MODEL = 'gemini-2.5-flash'

export interface SummaryResult {
  /** 한국어 핵심 요약(3~4문장) */
  summary: string
  /** 핵심 키워드 */
  keywords: string[]
}

const responseSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    keywords: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'keywords'],
}

export async function summarizePaper(input: {
  title: string
  abstract: string
}): Promise<SummaryResult> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY 미설정')

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`

  const prompt =
    '너는 CS/AI 논문을 빠르게 파악하도록 돕는 조수다. ' +
    '아래 논문을 한국어로 3~4문장의 핵심 요약과 핵심 키워드 3~5개로 정리해라. ' +
    '요약은 연구 문제·방법·기여가 드러나게 간결하게 써라.\n\n' +
    `제목: ${input.title}\n초록: ${input.abstract}`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    }),
  })

  if (!res.ok) {
    throw new Error(`Gemini API 오류: ${res.status}`)
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini 응답이 비어 있습니다.')

  const parsed = JSON.parse(text) as { summary?: string; keywords?: unknown }
  return {
    summary: String(parsed.summary ?? '').trim(),
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String) : [],
  }
}
