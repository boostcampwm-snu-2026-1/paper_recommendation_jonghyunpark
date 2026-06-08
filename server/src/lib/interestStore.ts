import type { InterestsPayload } from '../types/interests.js'
import { getDb } from './mongo.js'

// 관심분야 영속 저장소 (익명 기기 ID 기준).
//  - MongoDB 연결 시 `users` 컬렉션 (_id = deviceId)
//  - 미연결 시 인메모리 폴백(개발용, 재시작 시 초기화)

export interface InterestStore {
  get(userId: string): Promise<InterestsPayload | null>
  set(userId: string, payload: InterestsPayload): Promise<void>
}

interface UserDoc {
  _id: string
  interests: string[]
  customKeywords: string[]
  createdAt?: Date
  updatedAt?: Date
}

const memory = new Map<string, InterestsPayload>()

export const interestStore: InterestStore = {
  async get(userId) {
    const db = await getDb()
    if (db) {
      const doc = await db.collection<UserDoc>('users').findOne({ _id: userId })
      return doc
        ? { interests: doc.interests ?? [], customKeywords: doc.customKeywords ?? [] }
        : null
    }
    return memory.get(userId) ?? null
  },

  async set(userId, payload) {
    const db = await getDb()
    if (db) {
      await db.collection<UserDoc>('users').updateOne(
        { _id: userId },
        {
          $set: {
            interests: payload.interests,
            customKeywords: payload.customKeywords,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true },
      )
      return
    }
    memory.set(userId, payload)
  },
}
