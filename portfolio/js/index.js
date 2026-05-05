document.addEventListener("DOMContentLoaded", () => {
    const views = document.querySelectorAll(".view");
    const nodeBtns = document.querySelectorAll(".node-btn");
    const backBtns = document.querySelectorAll(".home-back-btn");
    const centerGroup = document.querySelector(".center-group");
    const homeTitle = document.querySelector(".home-title");
    
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
            btn.style.transition = "transform 0.8s cubic-bezier(0.19, 1, 0.22, 1), background 0.3s ease";
            btn.style.transform = `scale(30)`;
            
            // 2. The detail page content shrinks towards the opposite corner (the original node position)
            const currentViewId = document.body.getAttribute("data-view");
            const corner = getTargetCornerTranslation(currentViewId); 
            
            const contentWrapper = btn.closest('.view').querySelector('.content-wrapper');
            if (contentWrapper) {
                contentWrapper.style.transition = "transform 0.8s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.5s ease";
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
                }, 800); // Wait 800ms to ensure the crossfade is totally finished
            }, 300); // Reduced from 500ms to 300ms for even faster transition
        });
    });
});
