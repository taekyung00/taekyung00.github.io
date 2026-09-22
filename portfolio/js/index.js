// ── 노드 원형 배치 ────────────────────────────────────────────────
// DOM 순서가 곧 시계방향 배치 순서이고, 첫 노드가 12시(-90deg)에 놓인다.
// 노드를 추가/제거하면 각도·전환 방향·back 버튼 위치가 모두 여기서 다시
// 계산되므로, 나머지 노드는 손댈 필요가 없다.

// 애니메이션 시간의 단일 출처는 css/tokens.css 의 --dur-* 토큰이다.
// 여기서는 그 값을 읽어 setTimeout 에 쓰고, 인라인 transition 에는 var() 를
// 그대로 넘긴다. 속도를 바꾸려면 tokens.css 만 고치면 JS 도 따라온다.
function cssMs(token) {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(token)) * 1000;
}

// 대각선이 아닌(축에 가까운) 성분은 0으로 눌러 가장자리 중앙에 붙게 한다.
const axisSign = (v) => (Math.abs(v) < 0.35 ? 0 : Math.sign(v));

// 링 반지름(px). @property 로 등록해 둔 덕에 계산된 값이 나온다.
function nodeRadiusPx() {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--node-radius"));
    if (!Number.isFinite(v) || v === 0) {
        console.warn("[hub] --node-radius 를 읽지 못했습니다(@property 미지원?)");
        return 345;
    }
    return v;
}

// 기본은 루트에서 읽지만, 요소를 넘기면 그 요소 기준으로 읽는다.
// 커스텀 속성은 상속되므로, 특정 섹션에만 값을 덮어쓰면 그 카드에만 적용된다.
function cssNum(token, el = document.documentElement) {
    return parseFloat(getComputedStyle(el).getPropertyValue(token));
}

function nodeButtons() {
    return [...document.querySelectorAll(".node-btn")];
}

// data-target 에 해당하는 노드가 원 위에서 놓인 각도. 없으면 null.
function nodeAngle(target) {
    const btns = nodeButtons();
    const i = btns.findIndex((b) => b.dataset.target === target);
    return i < 0 ? null : -90 + (360 / btns.length) * i;
}

(() => {
    const nav = document.querySelector(".node-nav");
    const btns = nodeButtons();
    nav.style.setProperty("--n", btns.length);
    btns.forEach((btn, i) => btn.style.setProperty("--i", i));

})();

document.addEventListener("DOMContentLoaded", () => {
    const views = document.querySelectorAll(".view");
    const nodeBtns = document.querySelectorAll(".node-btn");
    const centerGroup = document.querySelector(".center-group");
    const centerPlate = document.querySelector(".center-plate");
    const plateHint = document.querySelector(".plate-hint");
    
    // --- i18n ---
    // 영문은 index.html 의 내용이 원본이다. 최초 로드 때 DOM 에서 읽어두므로
    // 여기에 영문을 또 적지 않는다(예전엔 두 벌이 따로 놀아 6군데가 어긋나 있었다).
    // 새 문구를 추가할 때는 HTML 에 data-i18n 을 달고, 아래에 한국어만 넣으면 된다.
    const ko = {
            "home-title": "허태경",
            "home-subname": "Jean",
            "home-subtitle": "소프트웨어 엔지니어 & 그래픽스 엔지니어",
            "node-skills": "기술",
            "node-projects": "그래픽스",
            "node-resume": "이력서",
            "node-sns": "SNS",
            "node-about": "내 소개",
            "node-q1": "?",
            "node-q2": "?",
            "about-title": "About Me",
            "about-subtitle": "학생 프로그래머 허태경",
            "about-p1": "사람들의 삶을 더 편하고 생산적으로 만드는, 믿을 수 있는 소프트웨어와 도구를 만드는 데 집중하는 컴퓨터과학 전공 학생 허태경입니다.",
            "about-p2": "가장 탄탄한 기반은 C++, 시스템, 컴퓨터 그래픽스, 소프트웨어 아키텍처입니다. 팀 프로젝트를 통해 자체 C++ 엔진을 만들고 리팩터링했으며, OpenGL 렌더링 시스템을 개발하면서 기술적 아이디어를 유지보수 가능한 소프트웨어로 옮기는 실무 경험을 쌓았습니다.",
            "skills-title": "보유 기술",
            "skill1-title": "C++ Systems Programming",
            "skill1-desc": "C++의 기초 문법부터 Modern C++의 최신 기능까지 깊이 있게 이해하고 활용합니다. 하드웨어와 밀접한 low-level 시스템 최적화 및 직접적인 메모리 관리는 물론, TMP(Template Metaprogramming)와 Modules 같은 고수준 추상화 기법을 활용하여 하드웨어 제어와 소프트웨어 설계의 균형을 맞춘 효율적인 프로그램을 개발합니다.",
            "skill2-title": "Computer Graphics Development",
            "skill2-desc": "2D 그래픽스 프로그래밍으로 기본 렌더링 파이프라인을 구축한 뒤 <b>OpenGL</b> 기반 3D로 역량을 확장했습니다. 공간 변환의 바탕이 되는 <b>선형대수</b>를 토대로 <b>shadow mapping</b>, <b>procedural geometric modeling</b>, <b>value/gradient noise</b>를 <b>GLSL</b>로 직접 구현했으며(Graphics 데모 참고), <b>Post-processing</b>과 <b>MSAA</b>로 시각적 품질과 성능을 함께 확보합니다.",
            "skill3-title": "Architecture Programming & Engine Development",
            // 사실관계는 resume-proj1/2 와 같아야 한다: ECS 뼈대는 10..9..8.., raylib->OpenGL 은 Dragonic Tactics
            "skill3-desc": "<b>10..9..8..</b>에서 엔진 아키텍처의 뼈대를 세웠습니다 — <b>ECS(Entity Component System)</b>를 중심으로 Singleton 패턴을 적용하고, 재사용 가능한 엔진 시스템과 게임플레이 로직을 분리했습니다. 이어 <b>Dragonic Tactics</b>에서는 엔진의 raylib 의존성을 걷어내고 <b>OpenGL</b>을 직접 연동한 백엔드로 교체해, 텍스처 매핑·<b>배치/인스턴스 렌더링</b>·가상 해상도를 갖춘 커스텀 2D 파이프라인을 구축하고 시스템 간 통신을 위한 <b>EventBus</b>를 설계했습니다.",
            "skills-tags-label": "언어 · 도구",
            "projects-title": "그래픽스 데모",
            "projects-subtitle": "2026년 상반기에 만든 OpenGL 3D 데모 — 고급 렌더링 기법과 실시간 셰이더 구현",
            "proj-date-hello": "5월 21일",
            "proj-date-meshes": "5월 30일",
            "proj-date-shadow": "6월 2일",
            "proj-date-gradient": "6월 9일",
            "proj-date-value": "6월 15일",
            "resume-title": "이력서",
            "resume-download": " PDF 다운로드",
            // 이력서 카드 — 순서·내용은 docs/Resume/Taekyung_Ho_Resume.pdf 기준
            "resume-edu-title": "학력",
            "resume-edu1": "<b>B.S. in Computer Science in Real-Time Interactive Simulation, DigiPen Institute of Technology</b><br>2028년 5월 졸업 예정 · GPA 3.96 / 4.0<br><em>미국 워싱턴주 레드먼드</em><br>주요 수강 과목: 자료구조, 알고리즘 분석, 운영체제, 컴퓨터 그래픽스 I & II, 선형대수",
            "resume-proj-title": "프로젝트",
            "resume-proj1": "<b>Dragonic Tactics — Producer & Engine/Graphics Engineer</b><br>2025년 9월 – 2026년 6월<br><em>2D 턴제 전술 RPG · C++, OpenGL</em><br>raylib 의존성을 걷어내고 <b>OpenGL</b>을 직접 연동해, 텍스처 매핑·배치 렌더링·인스턴스 렌더링·가상 해상도를 갖춘 2D 렌더링 파이프라인을 직접 구축했습니다. 시스템 간 통신을 위한 <b>EventBus</b>를 설계했고, 5인 팀의 Producer를 맡았습니다.",
            "resume-proj2": "<b>10..9..8.. — Technical Lead</b><br>2025년 봄<br><em>2D 던전 탐험 퍼즐 게임 · C++, raylib</em><br>\"10걸음\" 이동 제한을 핵심 규칙으로 삼은 퍼즐 게임입니다. DigiPen의 Game Implementation Techniques 과정에서 만든 자체 C++ 엔진 위에 <b>ECS</b>와 싱글턴 패턴을 적용하고, 재사용 가능한 엔진 시스템과 게임플레이 로직을 분리해 개발했습니다.",
            "resume-exp-title": "경력",
            "resume-exp1": "<b>ROMAD 전문가, 대한민국 공군</b><br>2022년 8월 – 2024년 5월<br><em>제10전투비행단, 수원</em><br>부대의 일원으로서 동료들과 협력하며, 까다로운 여건 속에서도 맡은 임무를 안정적으로 수행했습니다.",
            "sns-title": "연락처 및 소셜 미디어",
            "sns-email": "taek020422@gmail.com",
            "q1-title": "준비 중",
            "q1-desc": "이 섹션은 현재 개발 중입니다.",
            "q2-title": "비밀 노드",
            "q2-desc": "조금만 기다려주세요..."
    };

    // Jean 판의 호버 힌트. 언어뿐 아니라 허브 상태에 따라서도 달라지므로
    // data-i18n(요소 1개 = 문구 1개)으로는 표현되지 않아 여기서 관리한다.
    const PLATE_HINT = {
        en: { parked: "MENU", menu: "HOME" },
        ko: { parked: "메뉴", menu: "홈" },
    };

    const en = {};
    document.querySelectorAll("[data-i18n]").forEach(el => {
        en[el.getAttribute("data-i18n")] = el.innerHTML.trim();
    });
    const translations = { en, ko };

    let currentLang = "en";
    const langSwitch = document.getElementById("lang-toggle-btn");
    const enLabel = document.querySelector(".en-label");
    const koLabel = document.querySelector(".ko-label");

    function updateLanguage() {
        // 언어에 따라 조판이 달라져야 하는 곳이 있어 CSS 에서도 알 수 있게 표시한다
        // (예: 3글자뿐인 한글 이름은 이름판 안에서 더 크게).
        document.body.dataset.lang = currentLang;

        const elements = document.querySelectorAll("[data-i18n]");
        elements.forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (translations[currentLang][key]) {
                el.innerHTML = translations[currentLang][key]; // innerHTML allows formatting like <br>
            } else {
                console.warn(`[i18n] '${currentLang}' 번역 누락: ${key}`);
            }
        });
        
        updatePlateAffordance();

        // Update switch UI
        if (langSwitch && enLabel && koLabel) {
            if (currentLang === "ko") {
                langSwitch.classList.add("ko-active");
                enLabel.classList.remove("active");
                koLabel.classList.add("active");
            } else {
                langSwitch.classList.remove("ko-active");
                koLabel.classList.remove("active");
                enLabel.classList.add("active");
            }
        }
    }

    if (langSwitch) {
        langSwitch.addEventListener("click", () => {
            currentLang = currentLang === "en" ? "ko" : "en";
            updateLanguage();
        });
    }

    // Initialize with default language
    updateLanguage();

    
    // 전환 애니메이션이 향하는 지점: 노드가 놓인 방향의 정반대 코너.
    function getTargetCornerTranslation(targetId) {
        const angle = nodeAngle(targetId);
        if (angle === null) return { x: 0, y: 0 };

        const halfW = window.innerWidth / 2;
        const halfH = window.innerHeight / 2;
        // The back button is 120x120, its center is 60px from the 40px margin = 100px from edge.
        const offset = 100;
        const rad = (angle * Math.PI) / 180;

        return {
            x: axisSign(-Math.cos(rad)) * (halfW - offset),
            y: axisSign(-Math.sin(rad)) * (halfH - offset),
        };
    }

    let isAnimating = false;

    const hub = document.querySelector(".hub");

    // 홈은 항상 활성 상태로 남아 상세 페이지 위의 내비게이션 레이어가 된다.
    function switchView(targetId) {
        views.forEach(view => {
            if (view.id === "home") return;
            view.classList.toggle("active", view.id === targetId);
        });
        document.body.dataset.view = targetId;
    }

    // ── 허브 상태 ────────────────────────────────────────────────
    // home   : Jean 판이 화면 중앙, 노드 링 원본 크기
    // parked : 페이지가 열려 있고 Jean 버튼만 코너에 축소되어 남음
    // menu   : parked + 노드 링이 Jean 주위로 다시 나옴

    // 허브를 화면 가장자리 쪽으로 얼마나 들여 놓을지 계산한다.
    // 들이는 양은 상태마다 다르다: parked 에서는 노드가 Jean 안으로 들어가
    // 보이지 않으므로 판만 피하면 되고, menu 에서는 링 전체가 화면 안에
    // 들어와야 한다. 예전에는 둘 다 링 기준이라 parked 일 때 Jean 이
    // 필요보다 한참 안쪽에 놓여 카드 위에 올라앉았다.
    function hubPark(target, state) {
        const angle = nodeAngle(target);
        if (angle === null) return { tx: 0, ty: 0, s: 1 };

        const R = nodeRadiusPx();
        // 계산된 width 는 레이아웃 값이라 허브의 transform 에 영향받지 않는다.
        // offsetWidth 는 border-box 이고 transform 의 영향도 받지 않는다.
        // getComputedStyle().width 는 box-sizing 과 무관하게 content-box 라
        // 패딩·테두리만큼 짧게 나온다(판은 약 19px 차이).
        const rNode = nodeBtns[0].offsetWidth / 2;
        const plateHalf = centerPlate.offsetWidth / 2;
        const M = cssNum("--hub-margin");
        const W = window.innerWidth, H = window.innerHeight;

        // 축척은 링 기준으로 한 번만 정한다. 상태마다 달라지면 메뉴를 여닫을
        // 때 Jean 판 크기까지 변해 버린다.
        const s = Math.min(cssNum("--hub-scale-parked"),
                           (Math.min(W, H) / 2 - M) / (R + rNode));
        const E = (state === "menu" ? R + rNode : plateHalf) * s;
        const rad = (angle * Math.PI) / 180;

        return {
            tx: axisSign(-Math.cos(rad)) * Math.max(0, W / 2 - E - M),
            ty: axisSign(-Math.sin(rad)) * Math.max(0, H / 2 - E - M),
            s,
        };
    }

    // 홈에서는 Jean 판이 버튼이 아니므로 버튼 의미도 붙이지 않는다.
    function updatePlateAffordance() {
        const state = document.body.dataset.hub;
        const clickable = state === "parked" || state === "menu";
        const word = clickable ? PLATE_HINT[currentLang][state] : "";
        plateHint.textContent = word;
        centerPlate.setAttribute("tabindex", clickable ? "0" : "-1");
        if (clickable) centerPlate.setAttribute("aria-label", word);
        else centerPlate.removeAttribute("aria-label");
    }


    // 주차된 Jean 판이 화면에서 실제로 차지하는 사각형.
    // offsetLeft/Top/Width/Height 는 레이아웃 값이라 transform 에 영향받지
    // 않고, .hub 이 inset:0 이라 허브 좌표계가 곧 뷰포트 좌표계다.
    // {tx,ty,s} 로 역산하면 안 된다 — .center-group 안에서 부제목이 자리를
    // 차지해 판 중심이 허브 중심보다 약 20px 위에 있기 때문이다.
    // 허브 좌표계에서의 위치. offsetParent 가 .hub 라고 단정하면 안 된다 —
    // 판의 offsetParent 는 .center-group 이고(부제목이 판보다 넓어 그만큼
    // 안쪽으로 들어가 있다), 그래서 .hub 에 닿을 때까지 누적해야 한다.
    function offsetWithinHub(el) {
        let x = 0, y = 0, n = el;
        while (n && n !== hub) {
            x += n.offsetLeft;
            y += n.offsetTop;
            n = n.offsetParent;
        }
        return { x, y };
    }

    function plateRectAt(park) {
        const W = window.innerWidth, H = window.innerHeight;
        const cx = W / 2, cy = H / 2;
        const o = offsetWithinHub(centerPlate);
        const map = (x, y) => [cx + (x - cx) * park.s + park.tx,
                               cy + (y - cy) * park.s + park.ty];
        const [left, top] = map(o.x, o.y);
        const [right, bottom] = map(o.x + centerPlate.offsetWidth,
                                    o.y + centerPlate.offsetHeight);
        return { left, top, right, bottom };
    }

    // 카드는 "범퍼 상자" 안에서 최대한 커진다. 범퍼 상자란 화면에서
    // 방향별 범퍼와 Jean 판이 차지한 띠를 뺀 나머지 사각형이다.
    // 비율(data-card-ratio)을 지정한 카드는 그 비율을 지키며 상자에 맞춘다.
    function layoutCard(view, park) {
        const content = view.querySelector(".view-content");
        const card = view.querySelector(".content-wrapper");
        if (!content || !card) return;

        // --- 읽기 (쓰기와 섞지 않는다) ---
        const W = window.innerWidth, H = window.innerHeight;
        // 범퍼는 view 기준으로 읽는다. 기본값은 :root 에서 상속되지만,
        // 특정 카드만 다르게 하고 싶으면 그 <section> 에 --bumper-* 를
        // 덮어쓰면 된다(내용이 다른 새 노드를 위해 열어둔 여지).
        const bT = cssNum("--bumper-t", view), bR = cssNum("--bumper-r", view);
        const bB = cssNum("--bumper-b", view), bL = cssNum("--bumper-l", view);
        const gap = cssNum("--card-gap");
        const minH = cssNum("--card-min-height");
        const ratio = view.dataset.cardRatio;
        const p = plateRectAt(park);

        // 판은 늘 가장자리에 있으므로 그쪽 범퍼만 키우면 된다.
        const horiz = [], vert = [];
        if (p.left > W / 2) horiz.push({ t: bT, r: Math.max(bR, W - p.left + gap), b: bB, l: bL });
        if (p.right < W / 2) horiz.push({ t: bT, r: bR, b: bB, l: Math.max(bL, p.right + gap) });
        if (p.top > H / 2) vert.push({ t: bT, r: bR, b: Math.max(bB, H - p.top + gap), l: bL });
        if (p.bottom < H / 2) vert.push({ t: Math.max(bT, p.bottom + gap), r: bR, b: bB, l: bL });

        // 모서리 주차는 가로·세로 두 후보가 나온다. 면적으로 고르면 거의
        // 정사각형인 창에서 축이 홱 바뀌어 카드가 튀므로, 화면 방향으로
        // 정한다(가로가 길면 좌우 띠를 비우는 쪽이 늘 더 넓다).
        const prefer = W >= H ? horiz : vert;
        const pick = (prefer[0] || horiz[0] || vert[0]
                      || { t: bT, r: bR, b: bB, l: bL });

        const box = { w: W - pick.l - pick.r, h: H - pick.t - pick.b };

        let width = box.w, height = null;
        if (ratio) {
            const [rw, rh] = ratio.split("/").map(Number);
            if (rw > 0 && rh > 0) {
                const k = Math.min(box.w / rw, box.h / rh);   // contain 맞춤
                width = rw * k;
                height = rh * k;
            }
        }

        // --- 쓰기 ---
        content.style.setProperty("--pad-t", `${pick.t}px`);
        content.style.setProperty("--pad-r", `${pick.r}px`);
        content.style.setProperty("--pad-b", `${pick.b}px`);
        content.style.setProperty("--pad-l", `${pick.l}px`);
        card.style.setProperty("--card-width", `${width}px`);
        card.style.setProperty("--card-max-height", `${Math.max(minH, box.h)}px`);
        // 비율 카드만 높이가 고정된다. 나머지는 auto 로 되돌려 내용이 정한다.
        if (height !== null) card.style.setProperty("--card-height", `${height}px`);
        else card.style.removeProperty("--card-height");
    }

    function setHub(state, target) {
        document.body.dataset.hub = state;
        updatePlateAffordance();

        // 노드를 누른 순간에는 커서가 노드 위에 있어 mouseleave 가 오지
        // 않는다. 힌트 변형이 남아 있으면 판의 실제 위치가 계산과 어긋나므로
        // 홈을 떠날 때 직접 지운다.
        if (state !== "home") {
            centerGroup.style.setProperty("--tx", "0px");
            centerGroup.style.setProperty("--ty", "0px");
            centerGroup.style.setProperty("--scale", "1");
            nodeBtns.forEach(b => {
                b.style.setProperty("--tx", "0px");
                b.style.setProperty("--ty", "0px");
                b.style.setProperty("--scale", "1");
            });
        }
        if (state === "home") {
            hub.style.setProperty("--hub-tx", "0px");
            hub.style.setProperty("--hub-ty", "0px");
            hub.style.setProperty("--hub-scale", "1");
            return;
        }
        const p = hubPark(target, state);
        hub.style.setProperty("--hub-tx", `${p.tx}px`);
        hub.style.setProperty("--hub-ty", `${p.ty}px`);
        hub.style.setProperty("--hub-scale", `${p.s}`);

        // 카드 배치는 parked 기준으로만 잡는다. menu 에서 다시 계산하면
        // 링이 판보다 훨씬 커서 메뉴를 여닫을 때마다 카드 크기가 변한다.
        if (state === "parked") {
            const view = document.getElementById(target);
            if (view) layoutCard(view, p);
        }
    }

    // 열려 있는 페이지의 노드는 자리를 지킨 채 흐려진다(나머지 위치 고정).
    function markCurrent(target) {
        nodeBtns.forEach(b => b.classList.toggle("is-current", b.dataset.target === target));
    }

    // 노드가 페이지가 되는 연출: 카드를 노드 자리·크기에서 제자리로 키운다.
    // 화면을 덮는 풍선 대신 이 방식이라야 "노드 하나가 확대된" 느낌이 난다.
    function flipCardIn(view, fromRect) {
        const card = view.querySelector(".content-wrapper");
        if (!card) return;
        // .view 는 display:none 이 아니라 visibility:hidden 이라 활성화 전에도
        // 레이아웃이 잡혀 있어 최종 위치를 미리 잴 수 있다.
        const to = card.getBoundingClientRect();
        if (!to.width || !to.height) return;

        const scale = fromRect.width / to.width;   // 균일 배율 (글자가 찌그러지지 않게)
        const dx = fromRect.left - to.left;
        const dy = fromRect.top - to.top;

        card.style.transition = "none";
        card.style.transformOrigin = "0 0";        // 중앙 기준이면 절반 크기 보정이 더 필요하다
        card.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
        // 스크롤은 카드가 아니라 안쪽 .card-scroll 이 한다.
        const scroller = card.querySelector(".card-scroll");
        if (scroller) {
            scroller.style.overflow = "hidden";   // 확대 중 스크롤바가 같이 늘어나 보인다
            scroller.scrollTop = 0;
        }
        void card.offsetWidth;                     // 시작 상태를 확정시키는 강제 reflow

        requestAnimationFrame(() => {
            card.style.transition = "transform var(--dur-node-fly) var(--ease-emphasized)";
            card.style.transform = "";
        });

        // 정리는 rAF 밖에서 예약한다. 배경 탭처럼 rAF 가 늦게 도는 상황에서
        // 안쪽에 두면 카드가 축소된 시작 상태로 남아버린다.
        setTimeout(() => {
            card.style.transition = "";
            card.style.transform = "";
            card.style.transformOrigin = "";
            if (scroller) scroller.style.overflow = "";
        }, cssMs("--dur-node-fly") + 50);
    }

    function openNode(target, btn) {
        if (isAnimating) return;
        isAnimating = true;
        btn.blur();

        // 순서가 중요하다. setHub 이 주차 위치를 정하고 그에 맞춰 카드
        // 배치까지 끝낸 뒤라야, flipCardIn 이 카드의 *정정된* 최종 위치를
        // 잰다. 읽기(주차 계산) -> 쓰기(배치) -> 읽기(rect) 순이라
        // 강제 레이아웃은 2회로 끝난다.
        // 전제: .view.active 는 opacity/visibility/z-index 만 바꾼다.
        // 여기에 레이아웃에 영향 주는 속성을 넣으면 FLIP 이 조용히 깨진다.
        setHub("parked", target);

        const view = document.getElementById(target);
        if (view) flipCardIn(view, btn.getBoundingClientRect());
        switchView(target);
        markCurrent(target);

        setTimeout(() => { isAnimating = false; }, cssMs("--dur-node-fly"));
    }

    function goHome() {
        if (isAnimating) return;
        isAnimating = true;
        switchView("home");
        markCurrent(null);
        setHub("home");
        setTimeout(() => { isAnimating = false; }, cssMs("--dur-node-fly"));
    }

    // ── 노드 ────────────────────────────────────────────────────
    nodeBtns.forEach(btn => {
        // 호버 힌트는 홈에서만. 축소된 메뉴 상태에서 돌면 화면 절반 거리만큼
        // 날아가고, mouseleave 가 모든 노드의 --scale 을 되돌려 흐림도 풀린다.
        btn.addEventListener("mouseenter", () => {
            if (isAnimating || document.body.dataset.hub !== "home") return;
            const corner = getTargetCornerTranslation(btn.dataset.target);
            const hintTx = corner.x * 0.05;
            const hintTy = corner.y * 0.05;

            centerGroup.style.setProperty("--tx", `${hintTx}px`);
            centerGroup.style.setProperty("--ty", `${hintTy}px`);
            centerGroup.style.setProperty("--scale", "0.95");

            nodeBtns.forEach(other => {
                if (other === btn) return;
                other.style.setProperty("--tx", `${hintTx}px`);
                other.style.setProperty("--ty", `${hintTy}px`);
                other.style.setProperty("--scale", "0.95");
            });

            // 호버한 노드는 제자리에서만 커진다. 커서 쪽에서 밀려나면
            // mouseleave/mouseenter 가 번갈아 발동해 깜빡인다.
            btn.style.setProperty("--tx", "0px");
            btn.style.setProperty("--ty", "0px");
            btn.style.setProperty("--scale", "1.15");
        });

        btn.addEventListener("mouseleave", () => {
            if (isAnimating || document.body.dataset.hub !== "home") return;
            centerGroup.style.setProperty("--tx", "0px");
            centerGroup.style.setProperty("--ty", "0px");
            centerGroup.style.setProperty("--scale", "1");
            nodeBtns.forEach(other => {
                other.style.setProperty("--tx", "0px");
                other.style.setProperty("--ty", "0px");
                other.style.setProperty("--scale", "1");
            });
        });

        btn.addEventListener("click", () => openNode(btn.dataset.target, btn));
    });

    // ── Jean 판 ─────────────────────────────────────────────────
    // parked 에서 누르면 노드들이 나오고, menu 에서 누르면 홈으로 간다.
    centerPlate.addEventListener("click", () => {
        const state = document.body.dataset.hub;
        if (state === "parked") setHub("menu", document.body.dataset.view);
        else if (state === "menu") goHome();
    });

    centerPlate.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            centerPlate.click();
        }
    });

    // 빈곳 = Jean 과 노드를 제외한 전부(카드 본문 포함). 누르면 메뉴가 닫힌다.
    // .hub 는 화면 전체를 덮지만 pointer-events:none 이라, 실제로 클릭 대상이
    // 되는 것은 .center-plate 와 .node-btn 뿐이다.
    document.addEventListener("click", (e) => {
        if (document.body.dataset.hub !== "menu") return;
        if (e.target.closest(".hub")) return;
        setHub("parked", document.body.dataset.view);
    });

    // 창 크기가 바뀌면 주차 위치와 카드 배치를 다시 잡는다.
    // resize 는 드래그 중 초당 수십 번 오므로 프레임 단위로 합친다.
    let resizePending = false;
    window.addEventListener("resize", () => {
        if (resizePending) return;
        resizePending = true;
        requestAnimationFrame(() => {
            resizePending = false;
            const state = document.body.dataset.hub;
            const target = document.body.dataset.view;
            if (!state || state === "home") return;
            setHub(state, target);
            // menu 중에는 setHub 이 카드를 건드리지 않으므로 여기서 직접 맞춘다.
            if (state === "menu") {
                const view = document.getElementById(target);
                if (view) layoutCard(view, hubPark(target, "parked"));
            }
        });
    });

    // ── 카드 안 탭 UI ─────────────────────────────────────────────
    // [data-tabs] 안의 role=tab 버튼이 aria-controls 가 가리키는 패널을 켠다.
    // 카드마다 다시 쓰려고 마크업 규약만 맞추면 되게 했다(Skills 가 첫 사용처).
    // 탭 클릭은 문서 클릭 리스너(메뉴 닫기)와 겹치지만 그쪽은 preventDefault
    // 를 하지 않으므로 서로 방해하지 않는다.
    document.querySelectorAll("[data-tabs]").forEach(tabs => {
        const btns = [...tabs.querySelectorAll("[role=tab]")];
        const select = (btn) => btns.forEach(b => {
            const on = b === btn;
            b.setAttribute("aria-selected", on);
            b.tabIndex = on ? 0 : -1;
            const panel = document.getElementById(b.getAttribute("aria-controls"));
            if (panel) panel.classList.toggle("is-active", on);
        });
        btns.forEach((b, i) => {
            b.addEventListener("click", () => select(b));
            // 좌우 화살표로 이동 (WAI-ARIA tabs 관례). 끝에서는 반대편으로 감는다.
            b.addEventListener("keydown", (e) => {
                const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                if (!d) return;
                e.preventDefault();
                const next = btns[(i + d + btns.length) % btns.length];
                next.focus();
                select(next);
            });
        });
    });

    setHub("home");
});
