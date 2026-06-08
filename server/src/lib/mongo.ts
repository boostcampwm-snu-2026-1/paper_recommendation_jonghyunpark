import { MongoClient, type Db } from 'mongodb'

// MongoDB 연결 (lazy 싱글턴).
//  - MONGODB_URI 가 있으면 Atlas/로컬 MongoDB 연결
//  - 없거나 연결 실패 시 null → 각 store가 인메모리 폴백으로 동작
// 연결은 최초 사용 시 1회만 시도하고 재사용한다.

let dbPromise: Promise<Db | null> | null = null

async function connect(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.warn('[mongo] MONGODB_URI 미설정 → 인메모리 폴백 (재시작 시 초기화)')
    return null
  }
  try {
    const client = new MongoClient(uri)
    await client.connect()
    const dbName = process.env.MONGODB_DB || 'paper_rec'
    console.log(`[mongo] 연결됨: ${dbName}`)
    return client.db(dbName)
  } catch (err) {
    console.error('[mongo] 연결 실패 → 인메모리 폴백:', err)
    return null
  }
}

export function getDb(): Promise<Db | null> {
  if (!dbPromise) dbPromise = connect()
  return dbPromise
}
