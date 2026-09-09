# 야구한입 (baseball-bite)

앱인토스용 비게임 WebView 미니앱 MVP입니다.

## 기능
- 날짜별로 매일 다른 5문제 자동 선택
- 규칙/기록/포지션/투수/상황 카테고리
- 정답 즉시 확인 + 쉬운 해설
- 오늘 점수, 누적 정답, 참여 일수, 연속 참여 저장(localStorage)
- 결과 공유(Web Share API)
- 별도 로그인/서버/개인정보 수집 없음

## 앱인토스 설정
- appName: `baseball-bite`
- displayName: `야구한입`
- type: `partner` (비게임)
- SDK: `@apps-in-toss/web-framework@2.4.1`

## 로컬 웹 미리보기
```bash
npm install
npm run dev
```

## .ait 빌드
```bash
npm install
npm run build
```
프로젝트 루트에 `.ait` 번들이 생성됩니다.
