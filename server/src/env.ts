// .env 로드 — 반드시 다른 모듈(특히 process.env를 읽는 app/interestStore)보다 먼저 import할 것.
// Node 내장 loadEnvFile 사용. .env 가 없으면(예: 배포 환경에서 주입) 조용히 넘어간다.
try {
  process.loadEnvFile()
} catch {
  // .env 파일 없음 — 플랫폼 주입 환경변수에 의존
}
