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
| **마지막 갱신** | 2026-09-21 |

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
│   ├── Resume/
│   │   ├── Taekyung_Ho_Resume.pdf  # 사이트에서 내려받는 이력서 (이력서 카드 내용의 기준)
│   │   └── …                       # 지원처별 변형본·docx 원본 (사이트와 무관)
│   ├── Cover_Letter/               # 커버레터 모음 (사이트와 무관)
│   └── Transcript_TAEKYUNGHO.pdf
└── external/
    └── normalize.css               # 브라우저 기본 스타일 초기화
```

---

## 🛠️ 핵심 내비게이션 시스템 (노드 배치)

중앙 허브를 중심으로 노드가 **정원형**으로 균등 배치됩니다. 각도는 하드코딩하지 않고 계산됩니다.

- `js/index.js` 가 `.node-nav` 에 `--n`(노드 개수), 각 `.node-btn` 에 `--i`(DOM 순번)를 넣습니다.
- CSS 가 `--angle: calc(360deg / var(--n) * var(--i) - 90deg)` 로 각도를 계산합니다.
- **DOM 순서 = 12시 방향부터 시계방향 배치 순서**이고, 반지름은 `--node-radius` 하나로 통일됩니다.
- 페이지가 열렸을 때 Jean 판이 주차되는 코너도 그 노드의 각도에서 자동 유도됩니다(반대편).

### 허브 — 3가지 상태

Jean 판과 노드 링은 `.hub` 하나로 묶여 있고, **같은 DOM 이 홈 링과 코너 메뉴를 겸합니다**. 상태는 `body[data-hub]` 에 들어갑니다.

| 상태 | 화면 |
|---|---|
| `home` | Jean 판 중앙, 노드 링 원본 크기 |
| `parked` | 페이지가 열리고 Jean 판만 **열린 노드의 반대편 코너**로 축소. 나머지 노드는 Jean 안으로 들어감 |
| `menu` | 노드 링이 Jean 주위로 다시 나옴. 현재 페이지의 노드는 자리를 지킨 채 흐려짐 |

- 노드 클릭 → `parked` · Jean 클릭 → `menu` · Jean 한 번 더 → `home`
- **Jean 과 노드를 제외한 아무 곳**(카드 본문 포함)을 누르면 메뉴가 닫힙니다
- 메뉴에서 다른 노드를 누르면 홈을 거치지 않고 그 페이지로 바로 갑니다

### 노드 추가 / 제거 방법

각도·코너 위치는 개수에 맞춰 자동 재계산되므로, 아래 3가지만 하면 됩니다.

1. `<nav class="node-nav">` 안에 `<button class="node-btn" data-target="X">` 를 넣거나 지웁니다. (목록에서의 위치 = 원 위에서의 위치)
2. 같은 id 를 갖는 `<section id="X" class="view">` 를 넣거나 지웁니다.
3. 영문은 HTML 본문에 그대로 쓰고, 한국어만 `js/index.js` 의 `ko` 객체에 넣습니다. 빠뜨리면 콘솔에 `[i18n]` 경고가 뜹니다.

---

## 🎨 무엇을 바꾸려면 어디를 고치나

| 하고 싶은 것 | 고칠 곳 |
|---|---|
| 사이트 전체 색감 | `css/tokens.css` **한 곳** (홈 + 상세 페이지 모두 따라옴) |
| 전환 애니메이션 속도 | `css/tokens.css` 의 `--dur-*` (JS 가 이 값을 읽어 씀) |
| 홈 화면 전체 크기 | `css/style.css` 의 `--node-radius` 한 줄 |
| 카드가 커질 수 있는 범위 | `css/tokens.css` 의 `--bumper-t/r/b/l` (방향별) |
| 특정 카드만 다른 범퍼 | 그 `<section>` 에 `--bumper-*` 덮어쓰기 |
| 카드 비율 고정 | 그 `<section>` 에 `data-card-ratio="1/1"` 같은 속성 |
| 본문 한 줄 길이 | `css/tokens.css` 의 `--text-measure` |
| 상세 페이지 레이아웃 | `css/portfolio-page.css` |
| 영문 문구 | `index.html` 본문 (JS 가 여기서 읽어감) |
| 한국어 문구 | `js/index.js` 의 `ko` 객체 |

---

## 📑 변경 이력

| 날짜 | 변경 파일 | 변경 내용 |
|------|----------|----------|
| 2026-09-21 | `index.html`, `js/index.js` | 이력서 카드를 `docs/Resume/Taekyung_Ho_Resume.pdf` 기준으로 재작성 — 다운로드 경로 수정, 학력(정확한 학위명·졸업 예정·GPA·수강과목) → 프로젝트(Dragonic Tactics, 10..9..8..) → 경력(공군, 제10전투비행단) 순으로 재구성. Dragonic Tactics 를 "경력"에서 "프로젝트"로 옮기고, ECS 를 실제 적용한 10..9..8.. 쪽으로 정정. 공군 항목의 근거 없는 "100% 작전 준비 태세" 문구 제거 |
| 2026-09-21 | `css/tokens.css`, `css/style.css`, `js/index.js` | 카드 크기를 고정값이 아니라 "범퍼 상자"(화면 − 방향별 범퍼 − Jean 판 자리) 안에서 최대로 키우도록 변경. `data-card-ratio` 로 비율 고정 가능, 범퍼는 카드별 덮어쓰기 가능. 카드는 넓히되 산문만 `--text-measure` 로 제한(줄당 약 73자) |
| 2026-09-21 | `index.html`, `css/style.css`, `js/index.js` | 스크롤을 카드가 아닌 안쪽 `.card-scroll` 이 맡도록 분리 — 스크롤바가 둥근 모서리 밖으로 나가던 문제 해결 |
| 2026-09-21 | 전반 | 내비게이션을 허브 구조로 전환 — 뷰마다 있던 back 버튼 7개와 `opposite-*` 8방향 클래스를 없애고, Jean 판+노드 링을 `.hub` 하나로 통합(home/parked/menu 3상태). 상세→상세 직행 가능. 노드 확대 풍선을 카드 FLIP 연출로 교체. `<main>` 미닫힘 등 HTML 정합성 수정 |
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
