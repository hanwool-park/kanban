# Kanban 프론트엔드

Next.js로 만든 칸반 보드 MVP. 데이터는 저장되지 않으며, 새로고침하면 더미 데이터로 돌아간다.

## 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인한다.

## 테스트

```bash
npm test                         # 단위 테스트 (Vitest)
npx playwright install chromium  # 최초 1회
npm run test:e2e                 # 통합 테스트 (Playwright)
```

이미 설치된 Chromium을 쓰려면 `CHROMIUM_PATH`에 실행 파일 경로를 지정한다.
