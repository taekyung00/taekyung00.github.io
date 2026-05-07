# 🚀 AI Agent Guide — Taekyung Ho Portfolio

> **[AI 에이전트 필독 규칙]**
> 이 파일은 프로젝트에서 작업하는 AI 에이전트가 **가장 먼저 읽어야 할 문서**입니다.
> 프로젝트 구조, 아키텍처, 디자인 시스템 및 미완성 항목을 모두 파악한 후 작업을 시작하세요.
> **작업 완료 후 반드시 하단 [변경 이력] 섹션을 갱신**하세요.

---

## 📌 프로젝트 기본 정보

| 항목 | 내용 |
|------|------|
| **웹사이트 이름** | Taekyung Ho | Portfolio |
| **소유자** | 허태경 (Taekyung Ho) |
| **배포 URL** | `taekyung00.github.io` (GitHub Pages) |
| **로컬 실행** | `python -m http.server 8000` 또는 `http://localhost:8000` |
| **마지막 갱신** | 2026-05-07 |

---

## 📂 디렉토리 구조

```
portfolio/                          # 프로젝트 루트
├── README.md                       # 이 가이드 파일
├── index.html                      # 메인 SPA 진입점 (모든 뷰 포함)
├── css/
│   └── style.css                   # 통합 스타일시트 (디자인 시스템 전체)
├── js/
│   └── index.js                    # 전체 인터랙션 로직 (뷰 전환, i18n, 애니메이션)
├── portfolio/                      # 프로젝트 상세 서브 페이지
│   ├── 01_hello.html               # Hello Quad (3D 기초)
│   ├── 02_meshes.html              # Meshes 데모
│   ├── 03_fog.html                 # Fog 데모
│   ├── 04_toon.html                # Toon Shading 데모
│   ├── 05_shadow.html              # Shadow 데모
│   ├── 06_value.html               # Value 데모
│   └── 07_gradient.html            # Gradient 데모
├── img/
│   ├── face.jpg                    # 프로필 사진 (홈 중앙 + Back 버튼 이미지)
│   ├── cout.png                    # C++ cout 이미지 (홈 좌상단 로고)
│   ├── portfolio_thumbnails/       # 01~07 프로젝트 썸네일 JPG
├── docs/
│   ├── Resume.pdf                  # 실제 이력서 (다운로드용)
│   └── Resume.docx                 # 이력서 원본
└── external/
    └── normalize.css               # 브라우저 기본 스타일 초기화
```

---

## 🛠️ 핵심 내비게이션 시스템 (노드 배치)

이 사이트는 중앙 허브에서 노드가 뻗어나가는 형태의 비정형 배치를 사용합니다.

| 노드 | data-target | 각도 (--angle) | 거리 (--dist) | 화면 방향 |
|------|------------|---------------|--------------|----------|
| About Me | `about` | -90deg | 300px | 중앙 상단 |
| Skills | `skills` | -38.6deg | 360px | 우상단 |
| Resume | `resume` | 218.4deg | 360px | 좌상단 |
| Social Media | `sns` | 167deg | 420px | 좌측 |
| Graphics | `projects` | 12.8deg | 420px | 우측 |
| ? (미공개) | `q1` | 115.6deg | 300px | 좌하단 |
| ? (미공개) | `q2` | 64.2deg | 300px | 우하단 |

---

## 📑 변경 이력

| 날짜 | 변경 파일 | 변경 내용 |
|------|----------|----------|
| 2026-05-07 | `index.html`, `js/index.js`, `README.md` | 노드 위치 swap 및 전체 프로젝트 인코딩 UTF-8 통합 및 손상된 한글 복구 |
| 2026-05-07 | `index.html`, `css/style.css` | 홈 화면 좌상단 `cout.png` 로고 추가 |
| 2026-05-06 | `index.html`, `js/index.js` | 이력서 및 학력 정보 업데이트 (DigiPen, 공군 ROMAD 등) |
