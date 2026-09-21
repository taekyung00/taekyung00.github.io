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
│   ├── tokens.css                  # ★ 디자인 토큰 단일 출처 (색·글꼴·전환속도)
│   ├── style.css                   # 홈 화면 레이아웃
│   └── portfolio-page.css          # 프로젝트 상세 페이지 공통 스타일
├── js/
│   └── index.js                    # 전체 인터랙션 로직 (뷰 전환, i18n, 애니메이션)
├── portfolio/                      # 프로젝트 상세 서브 페이지
│   ├── 01_hello.html               # Hello Quad (3D 기초)
│   ├── 02_meshes.html              # Meshes 데모
│   ├── 05_shadow.html              # Shadow 데모
│   ├── 06_value.html               # Value 데모
│   └── 07_gradient.html            # Gradient 데모
├── img/
│   ├── face.jpg                    # 프로필 사진 (Back 버튼 이미지, 파비콘)
│   ├── portfolio_thumbnails/       # 프로젝트 썸네일 JPG
├── docs/
│   ├── Resume.pdf                  # 실제 이력서 (다운로드용)
│   └── Resume.docx                 # 이력서 원본
└── external/
    └── normalize.css               # 브라우저 기본 스타일 초기화
```

---

## 🛠️ 핵심 내비게이션 시스템 (노드 배치)

중앙 허브를 중심으로 노드가 **정원형**으로 균등 배치됩니다. 각도는 하드코딩하지 않고 계산됩니다.

- `js/index.js` 가 `.node-nav` 에 `--n`(노드 개수), 각 `.node-btn` 에 `--i`(DOM 순번)를 넣습니다.
- CSS 가 `--angle: calc(360deg / var(--n) * var(--i) - 90deg)` 로 각도를 계산합니다.
- **DOM 순서 = 12시 방향부터 시계방향 배치 순서**이고, 반지름은 `--node-radius` 하나로 통일됩니다.
- 전환 애니메이션이 향하는 코너와 back 버튼의 `opposite-*` 위치도 각도에서 자동 유도됩니다.

### 노드 추가 / 제거 방법

각도·전환 방향·back 버튼 위치는 자동 재계산되므로, 아래 3가지만 하면 됩니다.

1. `<nav class="node-nav">` 안에 `<button class="node-btn" data-target="X">` 를 넣거나 지웁니다. (목록에서의 위치 = 원 위에서의 위치)
2. 같은 id 를 갖는 `<section id="X" class="view">` 를 넣거나 지웁니다. 안의 `<button class="home-back-btn">` 에는 **위치 클래스를 붙이지 않습니다** (JS가 지정).
3. 영문은 HTML 본문에 그대로 쓰고, 한국어만 `js/index.js` 의 `ko` 객체에 넣습니다. 빠뜨리면 콘솔에 `[i18n]` 경고가 뜹니다.

> `opposite-*` 위치 클래스는 8방향뿐이므로, 노드가 9개를 넘으면 두 view 가 같은 back 버튼 위치를 공유합니다.

---

## 🎨 무엇을 바꾸려면 어디를 고치나

| 하고 싶은 것 | 고칠 곳 |
|---|---|
| 사이트 전체 색감 | `css/tokens.css` **한 곳** (홈 + 상세 페이지 모두 따라옴) |
| 전환 애니메이션 속도 | `css/tokens.css` 의 `--dur-*` (JS 가 이 값을 읽어 씀) |
| 홈 화면 전체 크기 | `css/style.css` 의 `--node-radius` 한 줄 |
| 상세 페이지 레이아웃 | `css/portfolio-page.css` |
| 영문 문구 | `index.html` 본문 (JS 가 여기서 읽어감) |
| 한국어 문구 | `js/index.js` 의 `ko` 객체 |

---

## 📑 변경 이력

| 날짜 | 변경 파일 | 변경 내용 |
|------|----------|----------|
| 2026-09-21 | `css/tokens.css`, `css/style.css`, `js/index.js` | 노드 클릭 전환을 "팍 터지는" 느낌으로 조정(가속 곡선 `cubic-bezier(.16,1,.3,1)`, 0.8s->0.45s), 전환 후 빈 화면 0.6s->0.1s(`--dur-view-fade` 분리), 풍선 배율을 화면 크기 기반 계산으로 교체(고정 25 는 모서리가 비었음) |
| 2026-09-21 | `index.html`, `css/style.css`, `js/index.js` | 홈 중앙을 이름판으로 교체(Jean / 가는 선 / Taekyung Ho, 한국어는 허태경 / Jean), 부제목 대비 개선 |
| 2026-09-21 | `index.html`, `css/style.css` | 홈 중앙 프로필 사진을 이름판(`.center-plate`)으로 교체(크기·라운드 정사각형 유지), 부제목 대비 4.61:1 -> 13.29:1 로 개선 |
| 2026-09-21 | 전반 | 디자인 토큰을 `css/tokens.css` 로 단일화(색상 리터럴 0개), 상세 페이지 인라인 CSS 5벌(약 720줄) 을 `css/portfolio-page.css` 로 통합, 상세 페이지에 홈 복귀 링크 추가, 영문 문구 중복 제거(HTML 을 원본으로), 애니메이션 타이밍 토큰화, 미완성 상태로 공개돼 있던 `03_fog`/`04_toon` 삭제 |
| 2026-09-21 | `index.html`, `js/index.js`, `css/style.css` | 노드 각도/전환 코너/back 버튼 위치를 개수 기반 자동 계산으로 전환(노드 추가·제거 용이화), 누락 시 조용히 깨지던 `opposite-south` 추가 및 i18n 누락 경고 |
| 2026-09-21 | `index.html`, `css/style.css` | 홈 좌상단 `cout.png` 로고 제거, 노드 정원형 배치, 레이아웃 크기를 `--node-radius` 기준 비례 계산으로 통일 |
| 2026-09-21 | `js/index.js` | 노드 호버 시 히트박스가 커서 밖으로 밀려나 깜빡이던 문제 수정(제자리 확대로 변경) |
| 2026-05-07 | `index.html`, `js/index.js`, `README.md` | 노드 위치 swap 및 전체 프로젝트 인코딩 UTF-8 통합 및 손상된 한글 복구 |
| 2026-05-07 | `index.html`, `css/style.css` | 홈 화면 좌상단 `cout.png` 로고 추가 |
| 2026-05-06 | `index.html`, `js/index.js` | 이력서 및 학력 정보 업데이트 (DigiPen, 공군 ROMAD 등) |
