# 📚 사용자 맞춤형 논문 추천 서비스

CS/AI 연구자를 위한 **관심사 기반 논문 추천 + LLM 요약** 웹 서비스.
arXiv 논문을 관심사로 모아 보여주고, Gemini로 요약하며, 앞으로 LLM 기반 추천·피드백으로 발전시킨다.

- 기획·설계 문서: **[GitHub Wiki](../../wiki)**
- 개발 task: **[GitHub Issues](../../issues)**

## 주요 기능

| 상태 | 기능 |
|:---:|------|
| ✅ | 관심분야 선택(온보딩) — 딥러닝/AI 토픽 큐레이션 |
| ✅ | 관심사 기반 추천 피드 (arXiv) |
| ✅ | 논문 상세 + **Gemini LLM 요약**(키워드 포함) |
| ✅ | 관심사·요약 **MongoDB 영구 저장**(익명 기기 ID) |
| ⬜ | LLM 기반 추천 + 추천 피드백(쓸모있음/중립/없음) |
| ⬜ | 검색 · 북마크/내 서재 · 유사 논문 |

## 기술 스택

- **client**: Vite + React + TypeScript, React Router, TanStack Query, Zustand, Tailwind CSS
- **server (BFF)**: Hono — arXiv / Gemini 프록시(API 키 은닉), MongoDB 영속화
- **DB**: MongoDB Atlas
- **외부 API**: arXiv, Google Gemini

## 폴더 구조

```
.
├── client/   # 프론트엔드 (Vite + React + TS)
├── server/   # BFF (Hono) — arXiv / Gemini 프록시, MongoDB
└── docs/     # 기획서·태스크 (→ Wiki로도 관리)
```

`client`와 `server`는 각각 독립 프로젝트다(별도 `package.json` / `npm install`).

## 로컬 개발

> Node 환경이 conda `node` env에 있다: `conda activate node`

```bash
# 1) 서버(BFF) — http://localhost:3000
cd server && npm install && npm run dev

# 2) 클라이언트 — http://localhost:5173 (/api 요청은 server로 프록시됨)
cd client && npm install && npm run dev
```

- 파일워처 한도(ENOSPC)가 찬 환경에서는 **client·server 둘 다 `npm run dev:poll`** 로 실행.
- 헬스 체크: `curl http://localhost:3000/api/health` → `{"status":"ok"}`

## 환경변수

각 폴더의 `.env.example` 참고 (`.env`는 커밋 금지).

- `client/.env` — `VITE_` 접두사 값만 (클라이언트 번들에 노출됨). 비밀 키 금지.
- `server/.env` — `GEMINI_API_KEY`, `MONGODB_URI` 등 비밀 키는 **서버 전용**.

---

## 🛠 개발 관리

### 브랜치 전략

```
main  ←(PR)─  dev  ←(PR)─  feature/<기능명>
```

| 브랜치 | 역할 | 규칙 |
|--------|------|------|
| `main` | 배포/안정 버전 | 직접 push 금지, `dev`에서 PR로만 머지 |
| `dev` | 기능 통합 | `feature/*`를 PR로 받아 통합 |
| `feature/<name>` | 기능별 작업 | `dev`에서 분기, 작업 후 `dev`로 PR |

- 예) `feature/llm-recommend`, `feature/search-page`, `fix/arxiv-rate-limit`

### 이슈 관리

- 개발 task는 **GitHub Issues**로 등록·관리한다.
- 라벨 예시: `feature`, `infra`, `llm`, `frontend`, `bug`, `docs`
- 작업 시작 시 이슈를 assign하고, PR 본문에 `Closes #<번호>`로 연결한다.

### PR 흐름

1. `dev`에서 `feature/<name>` 브랜치 분기
2. 작업 → 커밋(`feat:`/`fix:`/`chore:` 등 컨벤션) → push
3. `feature/<name> → dev` PR 생성, 리뷰 후 머지
4. 안정화되면 `dev → main` PR로 릴리스

### 문서

- 기획서·설계 등 문서는 **GitHub Wiki**에서 관리한다. (레포의 `docs/`는 원본 보관용)
```
