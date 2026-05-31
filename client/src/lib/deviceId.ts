// 익명 기기 식별자. 로그인 없이 관심분야를 백엔드에 키잉하기 위한 UUID.
// 최초 1회 생성 후 localStorage에 보관한다.

const DEVICE_ID_KEY = 'paper-rec/device-id'

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}
