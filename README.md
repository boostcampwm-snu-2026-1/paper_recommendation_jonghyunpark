# 📚 사용자 맞춤형 논문 추천 서비스

CS/AI 연구자를 위한 관심사 기반 논문 추천 + LLM 요약 웹 서비스.
기획·태스크 문서는 [docs/](docs/) 참고.

## 폴더 구조

```
.
├── client/   # 프론트엔드 (Vite + React + TS, React Router / TanStack Query / Zustand / Tailwind)
├── server/   # BFF (Hono) — arXiv / Semantic Scholar / Gemini 프록시. API 키 은닉
└── docs/     # 기획서·태스크
```

`client`와 `server`는 각각 독립 프로젝트다(별도 `package.json` / `npm install`).

## 로컬 개발

> 이 프로젝트는 Node 환경이 conda `node` env에 있다: `conda activate node`

```bash
# 1) 서버(BFF) — http://localhost:3000
cd server && npm install && npm run dev

# 2) 클라이언트 — http://localhost:5173 (/api 요청은 server로 프록시됨)
cd client && npm install && npm run dev
```

- 파일워처 한도(ENOSPC)가 찬 환경에서는 client를 `npm run dev:poll` 로 실행.
- 헬스 체크: `curl http://localhost:3000/api/health` → `{"status":"ok"}`

## 환경변수

- `client/.env` — `VITE_` 접두사 값만 (클라이언트 번들에 노출됨). 비밀 키 금지.
- `server/.env` — `GEMINI_API_KEY` 등 비밀 키는 **서버 전용**. 각 폴더의 `.env.example` 참고.
