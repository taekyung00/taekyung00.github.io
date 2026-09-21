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

function nodeButtons() {
    return [...document.querySelectorAll(".node-btn")];
}

// data-target 에 해당하는 노드가 원 위에서 놓인 각도. 없으면 null.
function nodeAngle(target) {
    const btns = nodeButtons();
    const i = btns.findIndex((b) => b.dataset.target === target);
    return i < 0 ? null : -90 + (360 / btns.length) * i;
}

// 노드가 있는 방향 -> back 버튼을 붙일 위치 클래스(노드의 반대편).
function backBtnClass(angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    const key = `${axisSign(Math.cos(rad))},${axisSign(Math.sin(rad))}`;
    return {
        "0,-1": "opposite-north",
        "1,-1": "opposite-ne",
        "1,0": "opposite-east",
        "1,1": "opposite-se",
        "0,1": "opposite-south",
        "-1,1": "opposite-sw",
        "-1,0": "opposite-west",
        "-1,-1": "opposite-nw",
    }[key];
}

(() => {
    const nav = document.querySelector(".node-nav");
    const btns = nodeButtons();
    nav.style.setProperty("--n", btns.length);
    btns.forEach((btn, i) => btn.style.setProperty("--i", i));

    document.querySelectorAll(".view").forEach((view) => {
        const back = view.querySelector(".home-back-btn");
        const angle = nodeAngle(view.id);
        if (back && angle !== null) back.classList.add(backBtnClass(angle));
    });
})();

document.addEventListener("DOMContentLoaded", () => {
    const views = document.querySelectorAll(".view");
    const nodeBtns = document.querySelectorAll(".node-btn");
    const backBtns = document.querySelectorAll(".home-back-btn");
    const centerGroup = document.querySelector(".center-group");
    const homeTitle = document.querySelector(".home-title");
    
    // --- i18n ---
    // 영문은 index.html 의 내용이 원본이다. 최초 로드 때 DOM 에서 읽어두므로
    // 여기에 영문을 또 적지 않는다(예전엔 두 벌이 따로 놀아 6군데가 어긋나 있었다).
    // 새 문구를 추가할 때는 HTML 에 data-i18n 을 달고, 아래에 한국어만 넣으면 된다.
    const ko = {
            "home-title": "허태경",
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
        const elements = document.querySelectorAll("[data-i18n]");
        elements.forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (translations[currentLang][key]) {
                el.innerHTML = translations[currentLang][key]; // innerHTML allows formatting like <br>
            } else {
                console.warn(`[i18n] '${currentLang}' 번역 누락: ${key}`);
            }
        });
        
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

    function switchView(targetId) {
        views.forEach(view => {
            if (view.id === targetId) {
                view.classList.add("active");
            } else {
                view.classList.remove("active");
            }
        });
        document.body.setAttribute("data-view", targetId);
    }

    // Hover logic (Hint Animation)
    nodeBtns.forEach(btn => {
        btn.addEventListener("mouseenter", () => {
            if (isAnimating) return;
            const target = btn.getAttribute("data-target");
            const corner = getTargetCornerTranslation(target);
            
            // Move center group and other nodes slightly towards the target corner (shrinking)
            const shrinkRatio = 0.05; 
            const hintTx = corner.x * shrinkRatio;
            const hintTy = corner.y * shrinkRatio;
            
            centerGroup.style.setProperty("--tx", `${hintTx}px`);
            centerGroup.style.setProperty("--ty", `${hintTy}px`);
            centerGroup.style.setProperty("--scale", "0.95");
            
            nodeBtns.forEach(otherBtn => {
                if (otherBtn !== btn) {
                    otherBtn.style.setProperty("--tx", `${hintTx}px`);
                    otherBtn.style.setProperty("--ty", `${hintTy}px`);
                    otherBtn.style.setProperty("--scale", "0.95");
                }
            });

            // Hovered node itself grows in place only (no translate). Moving it
            // toward the corner used to slide the hitbox out from under the
            // cursor mid-hover, triggering a mouseleave -> mouseenter loop
            // (visible as flickering).
            btn.style.setProperty("--tx", "0px");
            btn.style.setProperty("--ty", "0px");
            btn.style.setProperty("--scale", "1.15");
        });

        btn.addEventListener("mouseleave", () => {
            if (isAnimating) return;
            centerGroup.style.setProperty("--tx", "0px");
            centerGroup.style.setProperty("--ty", "0px");
            centerGroup.style.setProperty("--scale", "1");
            
            nodeBtns.forEach(otherBtn => {
                otherBtn.style.setProperty("--tx", "0px");
                otherBtn.style.setProperty("--ty", "0px");
                otherBtn.style.setProperty("--scale", "1");
            });
        });

        // Click logic (Full Transition)
        btn.addEventListener("click", () => {
            if (isAnimating) return;
            isAnimating = true;
            btn.blur(); // Remove focus to prevent hover/focus glitches
            
            const target = btn.getAttribute("data-target");
            const corner = getTargetCornerTranslation(target);

            // 1. Center group shrinks and moves to corner
            centerGroup.style.setProperty("--tx", `${corner.x}px`);
            centerGroup.style.setProperty("--ty", `${corner.y}px`);
            centerGroup.style.setProperty("--scale", "0.42"); // 120px / 280px = 0.428 (size of back btn)
            if(homeTitle) homeTitle.style.opacity = "0";

            // 2. Unclicked nodes shrink to 0 and move to corner
            nodeBtns.forEach(otherBtn => {
                if (otherBtn !== btn) {
                    otherBtn.style.setProperty("--tx", `${corner.x}px`);
                    otherBtn.style.setProperty("--ty", `${corner.y}px`);
                    otherBtn.style.setProperty("--scale", "0");
                    otherBtn.style.opacity = "0";
                }
            });

            // 3. Clicked node expands massively to cover screen
            btn.classList.add("expanding-node");
            btn.style.setProperty("--tx", `${corner.x * 0.3}px`); 
            btn.style.setProperty("--ty", `${corner.y * 0.3}px`);
            btn.style.setProperty("--scale", "25"); // Massive scale

            // Wait for transition to mostly finish, then switch view earlier to remove pause
            setTimeout(() => {
                switchView(target);
                isAnimating = false;
            }, cssMs("--dur-view-swap"));
        });
    });

    // Back logic (Expansion Principle)
    backBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (isAnimating) return;
            isAnimating = true;
            btn.blur(); // Remove focus to prevent hover/focus glitches
            
            // 1. The clicked back button expands massively
            btn.classList.add("expanding-node");
            btn.style.pointerEvents = "none"; // Prevent the giant bubble from intercepting mouse events
            btn.style.transition = "transform var(--dur-back-expand) var(--ease-emphasized), background var(--transition-fast)";
            btn.style.transform = `scale(30)`;
            
            // 2. The detail page content shrinks towards the opposite corner (the original node position)
            const currentViewId = document.body.getAttribute("data-view");
            const corner = getTargetCornerTranslation(currentViewId); 
            
            const contentWrapper = btn.closest('.view').querySelector('.content-wrapper');
            if (contentWrapper) {
                contentWrapper.style.transition = "transform var(--dur-back-shrink) var(--ease-emphasized), opacity var(--transition-slow)";
                contentWrapper.style.transform = `translate(${-corner.x}px, ${-corner.y}px) scale(0)`;
                contentWrapper.style.opacity = "0";
            }
            
            setTimeout(() => {
                // Switch back to home
                switchView("home");
                
                // Immediately reset the home elements because they don't need reverse animation anymore.
                // Force a reflow to ensure transitions don't play
                document.body.offsetHeight;
                
                centerGroup.style.transition = "none";
                centerGroup.style.setProperty("--tx", "0px");
                centerGroup.style.setProperty("--ty", "0px");
                centerGroup.style.setProperty("--scale", "1");
                if(homeTitle) homeTitle.style.opacity = "1";
                
                nodeBtns.forEach(nodeBtn => {
                    nodeBtn.classList.remove("expanding-node");
                    nodeBtn.style.transition = "none";
                    nodeBtn.style.setProperty("--tx", "0px");
                    nodeBtn.style.setProperty("--ty", "0px");
                    nodeBtn.style.setProperty("--scale", "1");
                    nodeBtn.style.opacity = "1";
                });
                
                // Force another reflow to apply the 0px positions instantly
                document.body.offsetHeight;
                
                // Use requestAnimationFrame to ensure the 'none' transition is painted
                // BEFORE we restore the CSS transitions, preventing any race conditions.
                requestAnimationFrame(() => {
                    centerGroup.style.transition = "";
                    nodeBtns.forEach(nodeBtn => {
                        nodeBtn.style.transition = "";
                    });
                    
                    // Allow user interaction immediately!
                    isAnimating = false;
                });
                
                // 상세 view 가 완전히 사라진 뒤에 잔여 스타일을 정리한다
                setTimeout(() => {
                    // Instantly snap the hidden detail view elements back to normal without animation
                    btn.style.transition = "none";
                    btn.classList.remove("expanding-node");
                    btn.style.transform = "";
                    if (contentWrapper) {
                        contentWrapper.style.transition = "none";
                        contentWrapper.style.transform = "";
                        contentWrapper.style.opacity = "";
                    }
                    
                    // Clear the inline 'none' transition after a tiny delay so future interactions work
                    setTimeout(() => {
                        btn.style.transition = "";
                        btn.style.pointerEvents = "auto"; // Restore pointer events
                        if (contentWrapper) contentWrapper.style.transition = "";
                    }, 50);
                }, cssMs("--dur-back-cleanup"));
            }, cssMs("--dur-back-swap"));
        });
    });
});
