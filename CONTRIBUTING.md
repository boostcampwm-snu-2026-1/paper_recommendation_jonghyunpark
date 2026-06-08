# 기여 가이드 (개발 관리 규칙)

## 브랜치 전략

```
main  ←(PR)─  dev  ←(PR)─  feature/<기능명>
```

- **main** — 배포/안정 버전. 직접 push 금지, `dev`에서 PR로만 머지.
- **dev** — 기능 통합 브랜치. `feature/*`를 PR로 받는다.
- **feature/\<name\>** — 기능별 작업 브랜치. `dev`에서 분기.
  - 예: `feature/llm-recommend`, `feature/search-page`, `fix/arxiv-rate-limit`

## 작업 흐름

1. 작업할 [Issue](../../issues)를 고르고 본인에게 assign.
2. `dev`에서 feature 브랜치 분기:
   ```bash
   git checkout dev && git pull
   git checkout -b feature/<name>
   ```
3. 작업 → 커밋 → push.
4. `feature/<name> → dev` PR 생성. 본문에 `Closes #<이슈번호>` 연결.
5. 리뷰 후 `dev`에 머지. 안정화되면 `dev → main` PR로 릴리스.

## 커밋 메시지 컨벤션

`<type>: <요약>` 형식.

- `feat:` 새 기능 / `fix:` 버그 수정 / `chore:` 설정·잡일
- `docs:` 문서 / `refactor:` 리팩터링 / `test:` 테스트

## 문서

- 기획·설계 문서는 **[GitHub Wiki](../../wiki)** 에서 관리한다.
- 코드 실행법·구조는 [README](./README.md) 참고.

## 보안

- 비밀 키는 `server/.env` / `client/.env` 에만 (커밋 금지, `.env.example` 참고).
- 키가 노출되면 즉시 폐기·재발급한다.
