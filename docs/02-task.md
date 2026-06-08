# ✅ 개발 Task — TODO List

> 기획서([01-기획서.md](01-기획서.md))의 MVP에 더해, **LLM 기반 추천**과 **사용자 피드백** 방향을 추가로 반영.
> GitHub Issue 없이 이 체크리스트로 진행 상황을 관리한다.
> 분류 표기: `[기능]` `[컴포넌트]` `[인프라/API]`
>
> **백엔드 방향 변경**: 저장소를 **MongoDB**로 통일한다.
> (관심분야 임시 저장에 쓰던 Upstash/인메모리 폴백은 MongoDB 구현으로 대체)

---

## 1단계 — 프로젝트 셋업 & BFF

- [x] `[인프라]` Vite + React + TS 초기화, 폴더 구조 정리(`pages`/`components`/`api`/`store`/`types`)
- [x] `[인프라]` 라우팅·상태·스타일 설치 (React Router, TanStack Query, Zustand, Tailwind) + 5개 라우트 골격
- [x] `[인프라]` `client` / `server` 폴더 분리 (각 독립 프로젝트)
- [x] `[인프라]` `.env.example` 작성 (client `VITE_` / server 비밀키 분리)
- [ ] `[인프라]` Vercel 배포 1회 확인
- [x] `[API]` BFF 골격(Hono) + `/api/health`
- [x] `[API]` arXiv 프록시 `/api/papers` (XML→JSON, 검색·카테고리·**토픽**·페이지)
- [ ] `[API]` 유사 논문 프록시 `/api/similar` (arXiv ID → Semantic Scholar) — *추후*

## 2단계 — 공통 UI & 데이터 연동

- [x] `[컴포넌트]` 앱 레이아웃 & 네비게이션 (홈·검색·서재)
- [x] `[인프라]` API 클라이언트 + 공통 타입(`Paper`) + Query 훅(`usePapers`)
- [x] `[컴포넌트]` `PaperCard` (제목·저자·발행일·카테고리 태그)
- [x] `[컴포넌트]` `PaperList` (로딩/빈/에러 상태 포함)
- [ ] `[컴포넌트]` `SearchBar` (입력·디바운스·제출)

## 3단계 — 추천 피드 & 검색

- [x] `[기능]` 홈 / 추천 피드 (F2) — 관심사(토픽) 기반 arXiv 논문, 관심사 없으면 cs.AI 최신 fallback
- [ ] `[기능]` 검색 페이지 (F6) — 결과 리스트 + URL 쿼리 동기화

## 4단계 — 개인화 (관심사 선택)

- [x] `[기능/인프라]` 관심사 상태 스토어 (Zustand + localStorage 영속화)
- [x] `[데이터]` 관심분야 카탈로그 (딥러닝/AI 토픽 큐레이션, `data/interests.ts`)
- [x] `[컴포넌트]` `InterestSelector` — 분야 칩 + 커스텀 키워드
- [x] `[기능]` 온보딩 / 관심사 선택 (F1) — 첫 방문 유도
- [x] `[인프라]` 관심분야 백엔드 동기화 (익명 기기 ID 기준) — *MongoDB로 이전 예정(5단계)*

---

# 🆕 신규 방향 (LLM 추천 + 피드백 + MongoDB)

## 5단계 — 백엔드(MongoDB) 전환 & 데이터 모델

- [ ] `[인프라]` MongoDB 연결 (Atlas 권장 / 로컬 가능), `MONGODB_URI` 서버 `.env`
- [ ] `[인프라]` DB 접속 모듈 + 드라이버 선택(`mongodb` 공식 드라이버)
- [ ] `[인프라]` 컬렉션 설계 (초안)
  - `users` — `{ _id: deviceId(익명), interests[], customKeywords[], createdAt, updatedAt }`
  - `summaries` — `{ paperId, summary, keywords[], model, createdAt }` (요약/추천 캐시)
  - `recommendations` — `{ userId, paperId, keywords[], summary, reason, createdAt }`
  - `feedback` — `{ userId, paperId, verdict: 'useful'|'neutral'|'not_useful', createdAt }`
- [ ] `[API]` 관심분야 저장을 **MongoDB(`users`)로 이전** (기존 Upstash/인메모리 대체)
- [ ] `[API]` (선택) 북마크도 MongoDB로 이전

## 6단계 — 논문 LLM 요약 (F4)

- [ ] `[API]` `/api/summarize` (Gemini) — 초록 → 3~4줄 핵심 요약 + 핵심 키워드 몇 개
- [ ] `[인프라]` 요약 결과 **MongoDB(`summaries`) 캐시** (paperId 기준 중복 호출 방지)
- [ ] `[컴포넌트]` `SummaryBox` — 상세 페이지에서 요약 표시 (로딩/에러/재시도)
- [ ] `[기능]` 논문 상세 페이지 (F3) — 제목·저자·초록·원문 링크 + `SummaryBox`

## 7단계 — LLM 기반 논문 추천

- [ ] `[API]` 후보 수집 — 관심사 기반 arXiv 피드에서 후보 N개 확보(기존 `/api/papers` 재사용)
- [ ] `[API]` `/api/recommendations` — LLM이 **사용자 관심사 + 피드백 이력**을 바탕으로 후보를 선별/순위
- [ ] `[기능]` 추천 논문마다 LLM이 생성: **keyword(태그)** + **간단 summary(1~2줄)** + 추천 이유
- [ ] `[인프라]` 추천 결과 MongoDB(`recommendations`) 저장 (재방문 시 재사용/이력)
- [ ] `[컴포넌트]` 추천 카드/섹션 — keyword·summary·피드백 버튼 포함
- [ ] `[기능]` 추천 화면 (홈 상단 섹션 또는 별도 `/recommend`)

## 8단계 — 추천 피드백 (쓸모있음 / 중립 / 쓸모없음)

- [ ] `[컴포넌트]` 3-way 피드백 UI — 👍 쓸모있음 / 😐 중립 / 👎 쓸모없음 (추천 카드에)
- [ ] `[API]` `/api/feedback` — `{ userId, paperId, verdict }` MongoDB(`feedback`) 저장 (재선택 시 갱신)
- [ ] `[기능]` 피드백을 **다음 추천에 반영** — 추천 생성 시 LLM 프롬프트에 이력 포함
  - 쓸모있음 → 유사 성향 가중 / 쓸모없음 → 회피
- [ ] `[기능]` (선택) 내 피드백 모아보기 / 통계

## 9단계 — 잔여 MVP (보강)

- [ ] `[컴포넌트]` `BookmarkButton` — 북마크 토글
- [ ] `[기능]` 내 서재 페이지 (F7) — 북마크 리스트 + 삭제
- [ ] `[컴포넌트]` `SimilarPapers` — 비슷한 논문 (F5, Semantic Scholar) — *추후*

---

## 진행 순서 메모

- **5(MongoDB) → 6(요약) → 7(추천) → 8(피드백)** 순서 권장
  - 추천(7)·피드백(8)이 모두 **MongoDB(5)** 와 **요약 파이프라인(6)** 위에 올라가므로 토대 먼저.
  - 7단계 추천 카드의 keyword/summary는 6단계 요약 로직을 재사용/확장.
- **LLM 키 보안**: Gemini 키는 `VITE_` 접두사 **없이** 서버 `.env` 에만 (`server/.env`).
- **비용/레이트리밋**: LLM 요약·추천은 호출 비용이 있으므로 `summaries`/`recommendations` 캐시로 중복 호출을 줄인다.
- 이미 완료된 1~4단계는 신규 방향(5~8)의 입력(관심사·arXiv 피드)으로 그대로 활용.
