# 🤖 AI Agent Guide — Taekyung Ho Portfolio

> **[AI 에이전트 필독 규칙]**
> 이 파일은 이 프로젝트에서 작업을 시작하는 AI 에이전트가 **가장 먼저 읽어야 할 문서**입니다.
> 프로젝트 구조, 아키텍처, 디자인 시스템, 미완성 항목을 모두 파악한 후 작업을 시작하세요.
> **작업 완료 후 반드시 이 파일의 [변경 이력] 섹션을 갱신**하세요.

---

## 📋 프로젝트 기본 정보

| 항목 | 내용 |
|------|------|
| **사이트 이름** | Taekyung Ho \| Portfolio |
| **소유자** | 허태경 (Taekyung Ho) |
| **배포 URL** | `taekyung00.github.io` (GitHub Pages) |
| **로컬 실행** | `python -m http.server 8000` → `http://localhost:8000` |
| **마지막 갱신** | 2026-05-06 |

---

## 🗂️ 디렉토리 구조

```
portfolio/                          ← 프로젝트 루트
├── README.md                       ← 이 파일 (AI 가이드)
├── index.html                      ← 메인 SPA 진입점 (모든 뷰 포함)
├── css/
│   └── style.css                   ← 통합 스타일시트 (디자인 시스템 전체)
├── js/
│   └── index.js                    ← 전체 인터랙션 로직 (뷰 전환, i18n, 애니메이션)
├── portfolio/                      ← 프로젝트 상세 서브 페이지
│   ├── 01_hello.html               ← Hello Quad (3D 첫 쿼드)
│   ├── 02_meshes.html              ← Meshes 데모
│   ├── 03_fog.html                 ← Fog 데모
│   ├── 04_toon.html                ← Toon Shading 데모
│   ├── 05_shadow.html              ← Shadow 데모
│   ├── 06_value.html               ← Value 데모
│   └── 07_gradient.html            ← Gradient 데모
├── img/
│   ├── face.jpg                    ← 프로필 사진 (홈 중앙 + Back 버튼 이미지)
│   ├── cout.jpg                    ← C++ cout 이미지 (서브 페이지 로고)
│   ├── skills-bg.jpg               ← (현재 미사용)
│   └── portfolio_thumbnails/       ← 01~07 프로젝트 썸네일 JPG
├── docs/
│   ├── Resume.pdf                  ← 실제 이력서 (다운로드용)
│   └── Resume.docx                 ← 이력서 원본
└── external/
    └── normalize.css               ← 브라우저 기본 스타일 초기화
```

---

## 🏗️ 핵심 아키텍처: 풀스크린 SPA

이 포트폴리오는 **단일 HTML 파일(index.html) 내에 모든 섹션을 "뷰(View)"로 겹쳐놓은 SPA**입니다.
실제 페이지 이동이 없으며, JavaScript가 `.active` 클래스를 교체하는 방식으로 화면이 전환됩니다.

```
body[data-view="home"]
└── main
     ├── section#home.view.active    ← 현재 보이는 화면
     ├── section#about.view
     ├── section#skills.view
     ├── section#projects.view
     ├── section#resume.view
     ├── section#sns.view
     ├── section#q1.view
     └── section#q2.view
```

모든 `.view`는 `position: absolute`로 겹쳐 있으며, `.active`가 붙으면 `opacity: 1 / visibility: visible`이 됩니다.

---

## 🎯 홈 화면: 노드 내비게이션

홈 화면은 **중앙 프로필 그룹**과 주변을 둘러싼 **7개의 위성 노드 버튼**으로 구성됩니다.

### 노드 위치 — CSS 극좌표 방식

각 노드의 위치는 `--angle`(방향 각도)과 `--dist`(중심으로부터 거리)로 결정됩니다.

```css
/* 노드 transform 핵심 공식 */
transform:
  translate(-50%, -50%)            /* 노드 자신의 중심 기준 정렬 */
  rotate(var(--angle))             /* 배치 방향 설정 */
  translate(var(--dist))           /* 중심에서 해당 방향으로 밀기 */
  rotate(calc(var(--angle) * -1))  /* 노드 글자가 똑바로 보이게 역회전 */
  translate(var(--tx, 0), var(--ty, 0))  /* JS가 애니메이션용으로 제어 */
  scale(var(--scale, 1));          /* JS가 애니메이션용으로 제어 */
```

| 노드 | data-target | `--angle` | `--dist` | 화면 방향 |
|------|------------|-----------|----------|----------|
| Skills | `skills` | -38.6deg | 360px | 우상단 |
| Graphics | `projects` | 12.8deg | 420px | 우측 |
| Resume | `resume` | 64.2deg | 300px | 우하단 |
| Social Media | `sns` | 115.6deg | 300px | 좌하단 |
| About Me | `about` | 167deg | 420px | 좌측 |
| ? (미공개) | `q1` | -90deg | 300px | 위 |
| ? (미공개) | `q2` | 218.4deg | 360px | 좌상단 |

> **타원 설계 의도**: Graphics/About Me는 `420px`, Skills/q2는 `360px`, 나머지는 `300px`로 거리에 차이를 두어 정원이 아닌 타원형 배치를 구현합니다.

---

## 🎬 애니메이션 시스템 (index.js)

### 1. 호버 힌트 (mouseenter)
- 호버된 노드: 1.1배 확대 + 대상 코너 방향으로 10% 이동
- 나머지 노드 + 중앙 그룹: 0.95배 축소 + 대상 코너 방향으로 5% 이동
- 모두 CSS `--tx`, `--ty`, `--scale` 변수를 JS에서 직접 `setProperty()`로 제어

### 2. 클릭 전환 (node → detail view)
```
① center-group: 대상 코너로 이동 + 0.42배 축소 (back 버튼 크기와 일치)
② 미클릭 노드: 대상 코너로 이동 + 0배 축소 (사라짐)
③ 클릭된 노드: .expanding-node 클래스 추가 + 25배로 폭발적 확대 → 화면 덮음
④ 300ms 후: switchView(target) 호출 → 새 뷰 .active 처리
```

### 3. 뒤로가기 전환 (back btn → home)
```
① back btn: 30배 확대 (1.1s)
② content-wrapper: 원래 노드 방향 반대편으로 이동 + 투명화
③ 450ms 후: switchView("home") 호출
④ transition: none으로 center-group, nodeBtns를 즉시 초기 위치 snap
⑤ requestAnimationFrame 이후: transition 복구, isAnimating = false
⑥ 1000ms 후: back btn, content-wrapper 인라인 스타일 완전 정리
```

> **핵심 기법**: `transition: none` → `offsetHeight` 강제 reflow → `requestAnimationFrame` 패턴으로 역방향 애니메이션 없이 홈 요소들을 순간 복구합니다.

### 뷰별 Back 버튼 위치 (노드의 반대편)

| 뷰 | Back 버튼 위치 | CSS 클래스 |
|----|----------------|-----------|
| skills | 좌하단 | `.opposite-ne` |
| projects | 좌중단 | `.opposite-east` |
| resume | 좌상단 | `.opposite-se` |
| sns | 우상단 | `.opposite-sw` |
| about | 우중단 | `.opposite-west` |
| q1 | 하단중앙 | `.opposite-north` |
| q2 | 우하단 | `.opposite-nw` |

`getTargetCornerTranslation(viewId)`가 뷰 ID에 따른 픽셀 오프셋 `{ x, y }`를 반환합니다.

---

## 🌐 다국어 시스템 (i18n)

- 홈 화면 **좌하단에 ENG/KOR 토글 스위치** 존재
- `[data-i18n="key"]` 속성을 가진 모든 DOM 요소를 `updateLanguage()`가 순회하여 `innerHTML` 교체
- 번역 데이터: `index.js` 내 `translations.en` / `translations.ko` 객체에 하드코딩
- KOR 활성화 시: 토글 스위치에 `.ko-active` 클래스 추가, 노브가 오른쪽으로 이동

---

## 🎨 디자인 시스템 (style.css)

### CSS 변수 토큰

```css
:root {
  /* 폰트 */
  --ff-primary: 'Outfit', sans-serif;
  --ff-secondary: "Source Code Pro", monospace;
  --fw-reg: 300;
  --fw-bold: 700;
  --fw-black: 900;

  /* 색상 */
  --clr-light:        #ffffff;
  --clr-dark:         #0f172a;     /* 배경 (Slate-900) */
  --clr-accent:       #38bdf8;     /* 강조색 (Sky-400) */
  --clr-bg-gradient:  linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  --clr-glass:        rgba(255, 255, 255, 0.05);   /* 유리 배경 */
  --clr-glass-border: rgba(255, 255, 255, 0.1);    /* 유리 테두리 */

  /* 트랜지션 */
  --transition-slow: 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: 0.3s ease;
}
```

### 주요 컴포넌트 스타일
- **Glassmorphism 카드**: `background: var(--clr-glass)` + `backdrop-filter: blur(20px)` + `border: 1px solid var(--clr-glass-border)`
- **노드 버튼**: 원형 (`border-radius: 50%`), 100×100px, glassmorphism 스타일
- **Back 버튼**: 120×120px, `border-radius: 30px`, 프로필 사진 표시
- **반응형**: `@media (max-width: 768px)` — 노드/back 버튼 80px로 축소
- **포트폴리오 그리드**: 4열 → 3열(1100px) → 2열(850px) → 1열(550px)

---

## 📄 서브 페이지 구조 (`portfolio/*.html`)

7개의 OpenGL/WebGL 그래픽스 데모 상세 페이지입니다.
각 페이지는 `../css/style.css`와 `../js/index.js`를 로드합니다.

```html
<header>          ← 로고 + 햄버거 네비게이션
<section.intro>   ← 프로젝트 제목 + 썸네일 이미지
<div.portfolio-item-individual>  ← 설명, 작업 목록, 회고
<div.portfolio-item-individual>  ← iframe WebGL 데모
<footer>          ← 연락처, 소셜 링크
```

> ⚠️ **CSS 불일치 주의**: 서브 페이지는 구버전 HTML 구조(`header`, `nav`, `hamburger`, `footer` 등)를 사용하지만, `style.css`는 SPA 메인 페이지용으로 재작성되어 있습니다. `header`, `nav`, `footer` 관련 스타일이 현재 `style.css`에 정의되어 있지 않습니다.

---

## ⚠️ 현재 미완성 항목 (TODO)

| 항목 | 파일 | 상태 |
|------|------|------|
| 서브 페이지 프로젝트 설명 | `portfolio/01~07.html` | 템플릿 placeholder 텍스트 그대로 |
| ~~Resume 경력/학력 내용~~ | ~~`index.html` #resume 섹션~~ | ~~placeholder 상태~~ → ✅ 완료 |
| ~~Resume 경력 첫 번째 항목~~ | ~~`index.html` L176-180~~ | ~~"Title, Company" 등 미입력~~ → ✅ 완료 |
| q1 노드 콘텐츠 | `index.html` #q1 | "Coming Soon" |
| q2 노드 콘텐츠 | `index.html` #q2 | "Secret Node" |
| WebGL iframe 소스 | `portfolio/*.html` L88 | `../webgl/` 디렉토리 없음 |
| 서브 페이지 이메일/SNS | `portfolio/*.html` footer | placeholder 링크 |
| 서브 페이지 CSS 불일치 | `portfolio/*.html` | `header`, `nav`, `footer` 스타일 없음 |

---

## 🔗 외부 의존성

| 라이브러리 | 버전 | 로드 방식 | 용도 |
|----------|------|----------|------|
| Font Awesome | 5.11.2 | CDN | PDF, LinkedIn, GitHub 아이콘 |
| Google Fonts — Outfit | latest | CDN | 메인 폰트 |
| Google Fonts — Source Code Pro | latest | CDN | 모노스페이스 폰트 (서브 페이지) |
| normalize.css | — | 로컬 | 브라우저 기본 스타일 초기화 |

---

## 📝 변경 이력

> **[AI 에이전트 규칙]** 이 프로젝트에서 작업을 완료할 때마다 아래 표에 변경 사항을 추가하세요.
> 형식: `날짜 | 변경된 파일 | 변경 내용 요약`

| 날짜 | 변경 파일 | 변경 내용 |
|------|----------|----------|
| 2026-05-05 | `index.html`, `css/style.css`, `js/index.js` | 초기 SPA 구조 구축, 노드 내비게이션 시스템, glassmorphism 디자인 시스템 완성 |
| 2026-05-05 | `css/style.css`, `js/index.js` | 반응형 레이아웃 개선, 모바일/데스크탑 뷰포트 분기, 노드 배치 타원형으로 조정 |
| 2026-05-06 | `index.html` | About Me 섹션 내용 업데이트 (Student Programmer 자기소개), 불필요한 시각 요소 제거 |
| 2026-05-06 | `index.html`, `js/index.js` | Resume 섹션 내용 교체 — Dragonic Tactics 프로듀서/엔지니어, 대한민국 공군 병장, DigiPen 학사 이력 반영. 영/한 번역 데이터 동시 업데이트 |
| 2026-05-06 | `index.html`, `js/index.js` | 학력 표기 수정 — "B.S. in Real-Time Interactive Simulation, DigiPen Institute of Technology"로 정정. 영/한 공통 적용 |
| 2026-05-06 | `README.md` | AI 에이전트 가이드 문서 최초 생성 |
