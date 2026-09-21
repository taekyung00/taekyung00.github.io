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

function cssNum(token) {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(token));
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
            "about-p1": "사람들의 삶을 더 편리하고 이롭게 만드는 도구를 개발하는 데서 가장 큰 즐거움을 느끼는 학생 프로그래머 허태경입니다.",
            "about-p2": "현재 C++와 OpenGL을 기반으로 기술적 기반을 다지고 있습니다. 이를 활용해 커스텀 2D 엔진을 직접 설계하고 게임 프로젝트를 개발하며 실무 경험을 쌓고 있습니다.",
            "skills-title": "보유 기술",
            "skill1-title": "C++ Systems Programming",
            "skill1-desc": "C++의 기초 문법부터 Modern C++의 최신 기능까지 깊이 있게 이해하고 활용합니다. 하드웨어와 밀접한 low-level 시스템 최적화 및 직접적인 메모리 관리는 물론, TMP(Template Metaprogramming)와 Modules 같은 고수준 추상화 기법을 활용하여 하드웨어 제어와 소프트웨어 설계의 균형을 맞춘 효율적인 프로그램을 개발합니다.",
            "skill2-title": "Computer Graphics Development",
            "skill2-desc": "2D 그래픽스 프로그래밍 학습을 통해 기본적인 렌더링 파이프라인을 구축하였으며, 이후 OpenGL 기반의 3D 구현으로 역량을 확장했습니다. 선형대수학(linear algebra)을 활용한 정교한 공간 변환 및 그래픽 구현에 능숙하며, Post-processing 및 MSAA(Multisample Anti-Aliasing)와 같은 고급 셰이더 작성 기술을 통해 시각적 품질과 성능을 동시에 확보하는 최적화된 렌더링 환경을 구축합니다.",
            "skill3-title": "Architecture Programming & Engine Development",
            "skill3-desc": "<b>Dragonic Tactics</b> 프로젝트를 포함한 엔진 개발 과정에서 Singleton 등 주요 디자인 패턴을 활용하고, ECS(Entity Component System) 기반의 고성능 아키텍처를 설계하였습니다. 커스텀 2D 그래픽스 파이프라인을 직접 구현하였으며, 특히 렌더링 병목 현상을 해결하기 위해 Batch Rendering 및 Instancing Rendering과 같은 그래픽스 최적화 기법을 적용하여 엔진의 런타임 성능을 극대화한 경험이 있습니다.",
            "projects-title": "그래픽스 데모",
            "projects-subtitle": "고급 렌더링 기법 및 그래픽스 알고리즘 구현 데모입니다.",
            "resume-title": "이력서",
            "resume-download": " PDF 다운로드",
            "resume-exp-title": "경력",
            "resume-exp1": "<b>Producer & Engine/Graphics Engineer, Dragonic Tactics</b><br>2025년 9월 – 2026년 6월<br><b>C++ 및 OpenGL</b>을 활용한 고성능 2D 엔진을 설계하고, <b>ECS 아키텍처</b> 기반 배치 렌더링을 구현하여 엔진 성능을 최적화했습니다.",
            "resume-exp2": "<b>병장 (ROMAD 전문가), 대한민국 공군</b><br>2022년 8월 – 2024년 5월<br>임무 핵심 전술 통신 시스템 및 무선 장비를 관리하며, 고압적인 현장 환경에서 <b>100% 작전 준비 태세</b>를 유지했습니다.",
            "resume-edu-title": "학력",
            "resume-edu1": "<b>B.S. in Real-Time Interactive Simulation, DigiPen Institute of Technology</b><br>2022년 3월 – 2028년 4월<br><em>대구, 대한민국 & 미국 Redmond, WA</em>",
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

    // 판이 차지한 쪽 띠를 비우고 남은 사각형에 카드를 둔다. 크기는 그대로
    // 두고 위치만 옮기되, 남은 자리에 안 들어갈 때만 줄인다.
    function layoutCard(view, park) {
        const content = view.querySelector(".view-content");
        const card = view.querySelector(".content-wrapper");
        if (!content || !card) return;

        const W = window.innerWidth, H = window.innerHeight;
        const base = cssNum("--view-pad");
        const gap = cssNum("--card-gap");
        const prefW = cssNum("--card-width");
        const prefH = cssNum("--card-max-height");
        const minH = cssNum("--card-min-height");
        const p = plateRectAt(park);

        // 판은 늘 가장자리에 있으므로 그쪽 여백만 키우면 된다.
        const pads = [];
        if (p.left > W / 2) pads.push({ t: base, r: Math.max(base, W - p.left + gap), b: base, l: base });
        if (p.right < W / 2) pads.push({ t: base, r: base, b: base, l: Math.max(base, p.right + gap) });
        if (p.top > H / 2) pads.push({ t: base, r: base, b: Math.max(base, H - p.top + gap), l: base });
        if (p.bottom < H / 2) pads.push({ t: Math.max(base, p.bottom + gap), r: base, b: base, l: base });
        if (!pads.length) pads.push({ t: base, r: base, b: base, l: base });

        // 모서리 주차는 가로·세로 두 후보가 나온다. "카드가 줄지 않고
        // 들어가는가"를 먼저 보고, 그 다음에 남는 면적을 본다. 면적만 보면
        // 거의 정사각형인 창에서 축이 홱 바뀌어 카드가 튄다.
        const free = (c) => ({ w: W - c.l - c.r, h: H - c.t - c.b });
        pads.sort((a, b) => {
            const A = free(a), B = free(b);
            const af = A.w >= prefW && A.h >= prefH, bf = B.w >= prefW && B.h >= prefH;
            if (af !== bf) return af ? -1 : 1;
            return B.w * B.h - A.w * A.h;
        });
        const pick = pads[0], f = free(pick);

        content.style.setProperty("--pad-t", `${pick.t}px`);
        content.style.setProperty("--pad-r", `${pick.r}px`);
        content.style.setProperty("--pad-b", `${pick.b}px`);
        content.style.setProperty("--pad-l", `${pick.l}px`);
        // 클램프는 선택이 아니라 필수다: --card-width 는 뷰포트 기준이라
        // 부모의 padding 이 막지 못하고, 넘치면 양끝이 잘린다.
        card.style.setProperty("--card-width", `${Math.min(prefW, f.w)}px`);
        card.style.setProperty("--card-max-height", `${Math.max(minH, Math.min(prefH, f.h))}px`);
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

    setHub("home");
});
