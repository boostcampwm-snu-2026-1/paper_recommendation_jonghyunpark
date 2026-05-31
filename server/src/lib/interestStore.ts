import { Redis } from '@upstash/redis'
import type { InterestsPayload } from '../types/interests.js'

// 관심분야 영속 저장소.
//  - UPSTASH_REDIS_REST_URL/TOKEN 이 있으면 Upstash Redis(서버리스 KV)
//  - 없으면 인메모리 폴백(개발용, 프로세스 재시작 시 초기화) → 키 없이도 로컬에서 동작

export interface InterestStore {
  get(userId: string): Promise<InterestsPayload | null>
  set(userId: string, payload: InterestsPayload): Promise<void>
}

const redisKey = (userId: string) => `interests:${userId}`

function createStore(): InterestStore {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (url && token) {
    const redis = new Redis({ url, token })
    console.log('[interestStore] Upstash Redis 사용')
    return {
      async get(userId) {
        return (await redis.get<InterestsPayload>(redisKey(userId))) ?? null
      },
      async set(userId, payload) {
        await redis.set(redisKey(userId), payload)
      },
    }
  }

  console.warn(
    '[interestStore] UPSTASH 미설정 → 인메모리 폴백(개발용, 재시작 시 초기화). ' +
      '프로덕션에서는 UPSTASH_REDIS_REST_URL/TOKEN 을 설정하세요.',
  )
  const mem = new Map<string, InterestsPayload>()
  return {
    async get(userId) {
      return mem.get(redisKey(userId)) ?? null
    },
    async set(userId, payload) {
      mem.set(redisKey(userId), payload)
    },
  }
}

export const interestStore = createStore()
