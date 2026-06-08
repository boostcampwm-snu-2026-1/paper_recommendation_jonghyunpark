import type { Paper } from '../types/paper.js'
import { getDb } from './mongo.js'

// 북마크 영속 저장소 (익명/로그인 userId 기준).
//  - MongoDB 연결 시 `users` 컬렉션의 bookmarks 필드 (관심사와 같은 문서)
//  - 미연결 시 인메모리 폴백

export interface BookmarkStore {
  get(userId: string): Promise<Paper[]>
  set(userId: string, bookmarks: Paper[]): Promise<void>
}

interface UserDoc {
  _id: string
  bookmarks?: Paper[]
  createdAt?: Date
  updatedAt?: Date
}

const memory = new Map<string, Paper[]>()

export const bookmarkStore: BookmarkStore = {
  async get(userId) {
    const db = await getDb()
    if (db) {
      const doc = await db.collection<UserDoc>('users').findOne({ _id: userId })
      return doc?.bookmarks ?? []
    }
    return memory.get(userId) ?? []
  },

  async set(userId, bookmarks) {
    const db = await getDb()
    if (db) {
      await db.collection<UserDoc>('users').updateOne(
        { _id: userId },
        {
          $set: { bookmarks, updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true },
      )
      return
    }
    memory.set(userId, bookmarks)
  },
}
