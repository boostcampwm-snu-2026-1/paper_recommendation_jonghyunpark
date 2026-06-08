import type { PaperSummary } from '../types/paper.js'
import { getDb } from './mongo.js'

// 논문 요약 캐시 (paperId 기준). 중복 Gemini 호출 방지 + 영구 보관.
//  - MongoDB 연결 시 `summaries` 컬렉션 (_id = paperId)
//  - 미연결 시 인메모리 폴백

export interface SummaryStore {
  get(paperId: string): Promise<PaperSummary | null>
  set(paperId: string, summary: PaperSummary): Promise<void>
}

interface SummaryDoc {
  _id: string // paperId
  summary: string
  keywords: string[]
  createdAt?: Date
}

const memory = new Map<string, PaperSummary>()

export const summaryStore: SummaryStore = {
  async get(paperId) {
    const db = await getDb()
    if (db) {
      const doc = await db.collection<SummaryDoc>('summaries').findOne({ _id: paperId })
      return doc
        ? { paperId, summary: doc.summary, keywords: doc.keywords ?? [] }
        : null
    }
    return memory.get(paperId) ?? null
  },

  async set(paperId, summary) {
    const db = await getDb()
    if (db) {
      await db.collection<SummaryDoc>('summaries').updateOne(
        { _id: paperId },
        {
          $set: { summary: summary.summary, keywords: summary.keywords },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true },
      )
      return
    }
    memory.set(paperId, summary)
  },
}
