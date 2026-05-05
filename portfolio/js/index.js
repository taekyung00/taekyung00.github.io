document.addEventListener("DOMContentLoaded", () => {
    const views = document.querySelectorAll(".view");
    const nodeBtns = document.querySelectorAll(".node-btn");
    const backBtns = document.querySelectorAll(".home-back-btn");
    const centerGroup = document.querySelector(".center-group");
    const homeTitle = document.querySelector(".home-title");
    
    // --- i18n Translation Data ---
    const translations = {
        en: {
            "home-title": "Taekyung Ho",
            "home-subtitle": "Software Engineer & Graphics Engineer",
            "node-skills": "Skills",
            "node-projects": "Graphics",
            "node-resume": "Resume",
            "node-sns": "Social Media",
            "node-about": "About Me",
            "node-q1": "?",
            "node-q2": "?",
            "about-title": "About Me",
            "about-subtitle": "Student Programmer Taekyung",
            "about-p1": "I am Taekyung, a student programmer who finds the greatest joy in developing tools that make people's lives easier and more beneficial.",
            "about-p2": "I am currently building my technical foundation based on C++ and OpenGL. Leveraging these skills, I am gaining practical experience by designing a custom 2D engine from scratch and developing game projects.",
            "skills-title": "SKILLS",
            "skill1-title": "C++ Systems Programming",
            "skill1-desc": "I have a broad understanding from fundamental C++ syntax to the latest features of <b>Modern C++</b>. I develop efficient programs that balance hardware control and software design by utilizing <b>low-level system optimization</b>, <b>direct memory management</b>, and high-level abstraction techniques like <b>TMP</b> (Template Metaprogramming) and <b>Modules</b>.",
            "skill2-title": "Computer Graphics Development",
            "skill2-desc": "I built a foundational rendering pipeline through 2D graphics programming and later expanded my capabilities to <b>OpenGL</b>-based 3D implementation. Proficient in sophisticated spatial transformations and graphics using <b>linear algebra</b>, I build optimized rendering environments that secure both visual quality and performance through <b>advanced shader writing techniques</b> like <b>Post-processing</b> and <b>MSAA</b>.",
            "skill3-title": "Architecture Programming & Engine Development",
            "skill3-desc": "During engine development, including the <b>Dragonic Tactics</b> project, I applied major design patterns such as <b>Singleton</b> and designed a high-performance architecture based on <b>ECS (Entity Component System)</b>. I directly implemented a custom 2D graphics pipeline and maximized the engine's runtime performance by applying graphics optimization techniques like <b>Batch Rendering</b> and <b>Instancing Rendering</b> to resolve rendering bottlenecks.",
            "projects-title": "Graphics Demos",
            "projects-subtitle": "Advanced rendering techniques and real-time shader demonstrations",
            "resume-title": "Resume",
            "resume-download": " Download PDF",
            "resume-exp-title": "Experience",
            "resume-exp1": "<b>Title, Company</b><br>Month Year - Present<br><em>City, State, Country</em><br>What you did, how you did it, result.",
            "resume-exp2": "<b>Software Test Engineer Intern, Qualtrics</b><br>Month Year - Month Year <br><em>Seattle, WA</em><br>Implemented an extensible script in Python to automate project...",
            "resume-edu-title": "Education",
            "resume-edu1": "<b>Bachelor of Science in Computer Science...</b><br>Year-Year<br><em>Daegu, Korea & Redmond, WA, USA</em>",
            "sns-title": "Connect with Me",
            "sns-email": "taek020422@gmail.com",
            "q1-title": "Coming Soon",
            "q1-desc": "This section is under development.",
            "q2-title": "Secret Node",
            "q2-desc": "Wait for it..."
        },
        ko: {
            "home-title": "허태경",
            "home-subtitle": "소프트웨어 엔지니어 & 그래픽스 엔지니어",
            "node-skills": "기술",
            "node-projects": "그래픽스",
            "node-resume": "이력서",
            "node-sns": "소셜 미디어",
            "node-about": "내 소개",
            "node-q1": "?",
            "node-q2": "?",
            "about-title": "About Me",
            "about-subtitle": "학생 프로그래머 태경",
            "about-p1": "사람들의 삶을 더 편하고 이롭게 만드는 도구를 개발할 때 가장 큰 즐거움을 느끼는 학생 프로그래머, 태경입니다.",
            "about-p2": "현재 C++와 OpenGL을 기반으로 기술적 토대를 다지고 있으며, 이를 활용해 커스텀 2D 엔진을 직접 설계하고 게임 프로젝트를 개발하며 실무 역량을 쌓고 있습니다.",
            "skills-title": "보유 기술",
            "skill1-title": "C++ Systems Programming",
            "skill1-desc": "C++의 기초 문법부터 <b>Modern C++</b>의 최신 속성까지 폭넓게 이해하고 있습니다. 하드웨어와 밀접한 <b>low-level 시스템 최적화</b> 및 <b>직접적인 메모리 관리</b>는 물론, <b>TMP</b>(Template Metaprogramming)와 <b>Modules</b> 같은 고수준 추상화 기법을 활용하여 하드웨어 제어와 소프트웨어 설계의 균형을 맞춘 효율적인 프로그램을 개발합니다.",
            "skill2-title": "Computer Graphics Development",
            "skill2-desc": "2D 그래픽 프로그래밍 학습을 통해 기본적인 렌더링 파이프라인을 구축하였으며, 이후 <b>OpenGL</b> 기반의 3D 구현으로 역량을 확장했습니다. <b>선형대수학(linear algebra)</b>을 활용한 정교한 공간 변환 및 그래픽 구현에 능숙하며, <b>Post-processing</b> 및 <b>MSAA</b>(Multisample Anti-Aliasing)와 같은 <b>고급 쉐이더 작성 기술</b>을 통해 시각적 품질과 성능을 동시에 확보하는 최적화된 렌더링 환경을 구축합니다.",
            "skill3-title": "Architecture Programming & Engine Development",
            "skill3-desc": "<b>Dragonic Tactics</b> 프로젝트를 포함한 엔진 개발 과정에서 <b>Singleton</b> 등 주요 디자인 패턴을 적용하고, <b>ECS(Entity Component System)</b> 기반의 고성능 아키텍처를 설계하였습니다. 커스텀 2D 그래픽 파이프라인을 직접 구현하였으며, 특히 렌더링 병목 현상을 해결하기 위해 <b>Batch Rendering</b> 및 <b>Instancing Rendering</b>과 같은 그래픽스 최적화 기법을 적용하여 엔진의 런타임 성능을 극대화한 경험이 있습니다.",
            "projects-title": "그래픽스 데모",
            "projects-subtitle": "고급 렌더링 기법 및 실시간 쉐이더 구현 데모입니다",
            "resume-title": "이력서",
            "resume-download": " PDF 다운로드",
            "resume-exp-title": "경력",
            "resume-exp1": "<b>직책, 회사명</b><br>년월 - 현재<br><em>근무 도시, 국가</em><br>어떤 업무를 수행했고, 어떤 결과를 냈는지 간략히 적습니다.",
            "resume-exp2": "<b>소프트웨어 테스트 엔지니어 인턴, Qualtrics</b><br>년월 - 년월<br><em>시애틀, WA</em><br>파이썬을 활용해 프로젝트 자동화를 위한 확장 가능한 스크립트를 구현했습니다...",
            "resume-edu-title": "학력",
            "resume-edu1": "<b>컴퓨터 공학 학사...</b><br>입학년도-졸업년도<br><em>대한민국 대구 & 미국 시애틀</em>",
            "sns-title": "연락처 및 소셜 미디어",
            "sns-email": "taek020422@gmail.com",
            "q1-title": "준비 중",
            "q1-desc": "이 섹션은 현재 개발 중입니다.",
            "q2-title": "비밀 노드",
            "q2-desc": "조금만 기다려주세요..."
        }
    };

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

    
    // Helper to get corner translation based on target view ID
    function getTargetCornerTranslation(targetId) {
        const halfW = window.innerWidth / 2;
        const halfH = window.innerHeight / 2;
        // The back button is 120x120, its center is 60px from the 40px margin = 100px from edge.
        const offset = 100;
        
        let tx = 0, ty = 0;
        switch(targetId) {
            case 'skills': tx = -halfW + offset; ty = halfH - offset; break;
            case 'projects': tx = -halfW + offset; ty = 0; break;
            case 'resume': tx = -halfW + offset; ty = -halfH + offset; break;
            case 'sns': tx = halfW - offset; ty = -halfH + offset; break;
            case 'about': tx = halfW - offset; ty = 0; break;
            case 'q1': tx = 0; ty = halfH - offset; break;
            case 'q2': tx = halfW - offset; ty = halfH - offset; break;
        }
        return { x: tx, y: ty };
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

            // Hovered node itself slightly grows and moves towards the corner
            btn.style.setProperty("--tx", `${corner.x * 0.1}px`);
            btn.style.setProperty("--ty", `${corner.y * 0.1}px`);
            btn.style.setProperty("--scale", "1.1");
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
            }, 300); // Reduced from 500ms to 300ms for even faster transition
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
            btn.style.transition = "transform 1.1s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease";
            btn.style.transform = `scale(30)`;
            
            // 2. The detail page content shrinks towards the opposite corner (the original node position)
            const currentViewId = document.body.getAttribute("data-view");
            const corner = getTargetCornerTranslation(currentViewId); 
            
            const contentWrapper = btn.closest('.view').querySelector('.content-wrapper');
            if (contentWrapper) {
                contentWrapper.style.transition = "transform 1.0s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease";
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
                
                // WAIT for the detail view to completely fade out (var(--transition-slow) is 0.6s)
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
                }, 1000); // Wait 1000ms to ensure the crossfade and slower expansion is totally finished
            }, 450); // Increased from 300ms to 450ms to match the slower animation speed
        });
    });
});
