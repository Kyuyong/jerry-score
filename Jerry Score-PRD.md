# Jerry Score — PRD (Product Requirements Document)

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 프로젝트명 | Jerry Score |
| 타입 | PWA (Progressive Web App) |
| 목적 | 소장 중인 PDF 악보를 iPad에서 보고, Apple Pencil로 간단히 필기 메모하는 개인용 앱 |
| 타겟 디바이스 | iPad (Safari) |
| 배포 방식 | 앱스토어 배포 없음 — Safari "홈 화면에 추가"로 사용 |
| 개발 도구 | Claude Code CLI + Cursor AI |
| 앱 아이콘 파일 | score.jpg (개발 폴더에 배치 예정) |
| 현재 보유 악보 | 약 20개 (향후 계속 수집되어 증가 예정) |

**Xcode 대신 PWA를 선택한 이유:** 개인용으로만 쓰고 앱스토어에 배포하지 않을 계획이라 연 $99 개발자 계정이 불필요함. Jerry Prompter 개발 경험을 그대로 재사용 가능. 페달 넘기기, 정밀 필압 등 네이티브 전용 기능은 v1에서 제외하기로 함.

---

## 2. 기술 스택

| 항목 | 기술 |
|---|---|
| 프레임워크 | React 18 (Vite 기반) |
| 스타일링 | Tailwind CSS |
| PDF 렌더링 | PDF.js |
| 필기 레이어 | Canvas API (PDF 위에 오버레이) |
| 로컬 저장 | IndexedDB (필기 데이터), localStorage (악보 목록/메타데이터) |
| 원본 파일 저장 | Google Drive (전용 폴더) |
| 인증 | Google OAuth (MoaMate와 동일 방식) |
| PWA | Vite PWA Plugin (vite-plugin-pwa) |

> Firebase Storage도 검토했으나, PDF 바이너리 저장은 무료 트래픽 한도(1GB/일)에 걸릴 수 있어 이미 여유 용량(15GB 중 7GB)이 있는 Google Drive로 확정함.

---

## 3. 디자인 시스템

### 브랜드 컬러 (아이콘 이미지에서 추출)

| 이름 | 컬러 | 용도 |
|---|---|---|
| Primary (Teal) | `#0E7C6B` | 배경, 주요 버튼, 앱바 |
| Accent (Mustard) | `#F2C265` | 강조 요소, 포인트 아이콘, 태그 |
| Dark (Charcoal) | `#4A4A4A` | 텍스트, 아이콘 라인 |
| Light (Off-white) | `#F2F1EA` | 보조 배경, 구분선, 비활성 요소 |

> 위 색상은 아이콘 이미지를 시각적으로 참고해 추출한 근사치예요. 실제 개발 시 `score.jpg` 파일을 열어 정확한 픽셀값(스포이드 툴 등)으로 한 번 더 검증하는 걸 권장해요.

### 앱 아이콘
- 파일명: `score.jpg`
- 컨셉: 빨랫줄에 걸린 음표 + 높은음자리표 (악보를 "널어놓고 본다"는 이미지)
- 배경: Teal (`#0E7C6B`)
- 포인트: 머스타드 옐로 음표 + 차콜 그레이 높은음자리표

---

## 4. 데이터 저장 구조

| 저장 대상 | 저장 위치 | 비고 |
|---|---|---|
| PDF 원본 파일 | Google Drive (전용 폴더) | 기기 간 접근 가능, 용량 걱정 없음 |
| 필기 데이터 | IndexedDB (로컬) | 우선 로컬로 시작, 필요 시 추후 Drive로 이전 검토 |
| 악보 목록 / 메타데이터 (제목, 장르 태그 등) | localStorage | |
| 인증 정보 | Google OAuth 세션 | |

```
Jerry Score
├── PDF 저장 → Google Drive (전용 폴더)
├── 필기 데이터 → IndexedDB (로컬)
├── 악보 목록/메타데이터 → localStorage
└── 인증 → Google OAuth (MoaMate와 동일 방식)
```

**용량 계산:** PDF 100개 × 평균 5MB = 약 500MB → Google Drive 무료 15GB 중 여유 있음.

---

## 5. 화면 구성

### 5-1. 악보 목록 화면 (메인)
- 상단: 검색바
- 악보 카드 그리드 (제목, 장르 태그 표시)
- 우상단: PDF 업로드(Google Drive 연동) 버튼
- 태그별 필터링

### 5-2. 악보 뷰어 화면
- PDF.js 기반 렌더링, 확대/축소, 페이지 넘기기
- Apple Pencil / 터치로 필기 메모 (Canvas 오버레이)
- 필기 지우기 / 초기화
- 페이지 썸네일 내비게이션

### 5-3. 설정 화면
- Google 계정 연동 상태 확인
- 저장 용량 확인
- 앱 정보

---

## 6. 기능 상세 스펙

### 6-1. PDF 악보 업로드 & Google Drive 연동
- Google OAuth 로그인 (MoaMate와 동일 방식)
- PDF 업로드 시 전용 Google Drive 폴더에 저장
- 악보 목록에 자동 반영

### 6-2. PDF 악보 보기
- PDF.js로 렌더링
- 핀치 줌 / 페이지 스와이프
- 페이지 번호 표시

### 6-3. Apple Pencil 필기 메모
- PDF 위에 Canvas 레이어로 필기
- 기본 터치/펜슬 선 긋기 지원 (PWA 환경 특성상 정밀 필압 감지는 제한적)
- 페이지별 필기 데이터 IndexedDB 저장
- 필기 지우기 / 페이지별 초기화

### 6-4. 악보 목록 관리
- 제목, 장르 태그 입력/수정
- 태그 기준 필터/검색
- 악보 삭제 (Google Drive 파일도 함께 삭제)

---

## 7. PWA 설정

- `vite-plugin-pwa`로 서비스 워커 생성, 오프라인 캐싱
- `display: standalone` — 주소창 숨김
- 홈 화면 아이콘: `score.jpg` 기반 PNG 192×192, 512×512 생성 필요
- Safari 저장 용량 한도 대응: 대용량 PDF는 로컬 캐싱보다 Google Drive 스트리밍 우선 검토

---

## 8. 개발 순서 (권장)

| 단계 | 내용 |
|---|---|
| Phase 1 | Vite + React + Tailwind + PWA 기본 세팅 (아이콘 `score.jpg` 반영) |
| Phase 2 | Google OAuth 로그인 연동 |
| Phase 3 | Google Drive 업로드/목록 연동 |
| Phase 4 | PDF.js 뷰어 (확대/축소, 페이지 넘기기) |
| Phase 5 | Apple Pencil 필기 레이어 (Canvas) + IndexedDB 저장 |
| Phase 6 | 악보 목록 관리 (제목/태그, 검색/필터) |
| Phase 7 | PWA 아이콘 + 오프라인 캐싱 + 배포 테스트 |

---

## 9. v2 예정 기능

- 블루투스 페달로 페이지 넘기기
- 필기 데이터 Google Drive로 이전 (기기 간 동기화)
- 정밀 필압 감지 (네이티브 전환 검토 시)
- 셋리스트 관리 기능
