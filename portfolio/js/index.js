document.addEventListener("DOMContentLoaded", () => {
    const views = document.querySelectorAll(".view");
    const nodeBtns = document.querySelectorAll(".node-btn");
    const backBtns = document.querySelectorAll(".home-back-btn");

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

    nodeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-target");
            switchView(target);
        });
    });

    backBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            switchView("home");
        });
    });
});
