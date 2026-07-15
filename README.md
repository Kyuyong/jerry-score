<div align="center">
  <img src="./score.jpg" alt="Jerry Score icon" width="120" height="120" />

  # Jerry Score

  소장 중인 PDF 악보를 iPad에서 보고, Apple Pencil로 간단히 필기 메모하는 개인용 PWA
</div>

---

## 개요

| 항목 | 내용 |
|---|---|
| 타입 | PWA (Progressive Web App) |
| 타겟 디바이스 | iPad (Safari) |
| 배포 방식 | 앱스토어 없음 — Safari "홈 화면에 추가"로 사용 |
| 원본 파일 저장 | 사용자의 Google Drive (전용 "Jerry Score" 폴더) |

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | React 19 (Vite 8) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS v4 (`@tailwindcss/vite`) |
| 라우팅 | React Router (`HashRouter`, GitHub Pages 정적 호스팅 대응) |
| PDF 렌더링 | PDF.js (`pdfjs-dist`) |
| 필기 레이어 | Canvas API (PDF 렌더링 캔버스 위 오버레이) |
| 필기 데이터 저장 | IndexedDB (`idb`) |
| 악보 메타데이터 저장 | localStorage |
| 원본 PDF 저장 | Google Drive REST API |
| 인증 | Google Identity Services (OAuth 2.0 토큰 클라이언트, `drive.file` 스코프) |
| PWA | `vite-plugin-pwa` (서비스 워커, 오프라인 캐싱, 매니페스트) |
| 배포 | GitHub Actions → GitHub Pages |

## 주요 기능

- **악보 목록**: 검색, 장르 태그 필터, 카드 그리드, 제목/태그 편집
- **PDF 업로드**: Google Drive 전용 폴더에 자동 저장, 목록에 즉시 반영
- **악보 뷰어**: PDF.js 렌더링, 확대/축소, 페이지 이동, 페이지 썸네일 내비게이션
- **필기 메모**: Apple Pencil/터치로 캔버스에 필기, 페이지별 IndexedDB 저장, 필기 지우기
- **설정**: Google 계정 연동 상태, Drive 저장 용량 확인

## 로컬 개발

### 요구 사항

- Node.js 20 이상
- Google Cloud Console에서 발급받은 OAuth 2.0 클라이언트 ID
  - Drive API 활성화
  - OAuth 동의 화면에 `drive.file` 스코프 추가, 본인 계정을 테스트 사용자로 등록
  - 승인된 JavaScript 원본에 `http://localhost:5173` 추가

### 설치 및 실행

```bash
npm install

# .env 파일 생성 후 클라이언트 ID 입력
cp .env.example .env
```

`.env`:

```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

```bash
npm run dev       # 개발 서버 (http://localhost:5173)
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
```

## 배포 (GitHub Pages)

`main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동으로 빌드 후 GitHub Pages에 배포해요.

1. 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정
2. 저장소 **Settings → Secrets and variables → Actions**에 `VITE_GOOGLE_CLIENT_ID` 시크릿 등록
3. Google Cloud Console의 **승인된 JavaScript 원본**에 배포 도메인(`https://<계정>.github.io`) 추가

배포 후 iPad Safari에서 배포 URL 접속 → **홈 화면에 추가**로 설치해서 사용해요.

## 데이터 저장 구조

```
Jerry Score
├── PDF 원본        → Google Drive (전용 폴더, 앱이 생성한 파일만 접근)
├── 필기 데이터      → IndexedDB (기기 로컬)
├── 악보 목록/태그   → localStorage (기기 로컬)
└── 인증            → Google OAuth 세션 (sessionStorage)
```

## v2 예정 기능

- 블루투스 페달로 페이지 넘기기
- 필기 데이터 Google Drive 동기화 (기기 간 공유)
- 정밀 필압 감지 (네이티브 전환 검토 시)
- 셋리스트 관리 기능
