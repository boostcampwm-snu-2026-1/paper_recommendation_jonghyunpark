// 관심분야 저장 페이로드. client store(interests/customKeywords)와 동일 형태.
export interface InterestsPayload {
  /** 카탈로그 토픽 id 목록 */
  interests: string[]
  /** 사용자 커스텀 키워드 */
  customKeywords: string[]
}
