/* ───────────────────────────────────────────────────────────────────
   임시: 강조색 고르기 데모.  결정되면 이 파일과 index.html 의
   <script src="js/theme-demo.js"> 한 줄을 지우면 흔적이 남지 않는다.

   강조색은 한 값이 아니라 네 토큰이 한 묶음이다. 따로 고르면 대비가
   깨지므로 세트로만 바꾼다:
     --clr-accent       채움(버튼·활성 탭·노드 호버). 흰 글자를 올린다
     --clr-accent-soft  유리 위에 놓는 작은 파란 글자. 채움색보다 어둡다
     --clr-accent-2     이름판 그라데이션 끝
     --clr-accent-glow  후광(같은 색의 반투명)
   아래 값들은 전부 "흰 글자 ≥ 4.5:1, 유리 위 작은 글자 ≥ 4.5:1,
   큰 제목 ≥ 3:1"을 배경 그라데이션 양끝 × 유리 두 농도에서 확인한 것이다.
   패널에 실제 측정값이 같이 나오므로 눈과 숫자를 함께 보고 고르면 된다. */
(() => {
    const PALETTES = [
        { name: "Apple Blue", accent: "#0071e3", soft: "#0066cc", second: "#5e5ce6" },
        { name: "Ocean",      accent: "#1b5e9c", soft: "#1a5992", second: "#2f5fa8" },
        { name: "Deep Navy",  accent: "#28407e", soft: "#263c76", second: "#4a3f86" },
        { name: "Teal",       accent: "#0f6f78", soft: "#0e6870", second: "#177f6a" },
        { name: "Forest",     accent: "#1f6b4a", soft: "#1d6345", second: "#3f7a38" },
        { name: "Graphite",   accent: "#44506a", soft: "#404b63", second: "#5a5273" },
        { name: "Plum",       accent: "#6b3f8f", soft: "#653b87", second: "#8e3f79" },
        { name: "Burgundy",   accent: "#8f2f4a", soft: "#872c46", second: "#9c4232" },
        { name: "Bronze",     accent: "#7a5220", soft: "#734d1e", second: "#8a6a2a" },
    ];

    // ── 대비 계산 (WCAG) ──
    const lum = (hex) => {
        const v = [1, 3, 5].map(i => {
            const c = parseInt(hex.slice(i, i + 2), 16) / 255;
            return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
    };
    const ratio = (a, b) => {
        const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
        return (x + 0.05) / (y + 0.05);
    };
    // 유리를 배경 위에 합성한 실제 색(글자가 실제로 놓이는 바탕)
    const over = (alpha, bg) => "#" + [1, 3, 5].map(i =>
        Math.round(255 * alpha + parseInt(bg.slice(i, i + 2), 16) * (1 - alpha))
            .toString(16).padStart(2, "0")).join("");
    const GLASSES = [0.55, 0.72].flatMap(a => ["#e8eef8", "#f7f2ea"].map(bg => over(a, bg)));
    const worst = (fg) => Math.min(...GLASSES.map(g => ratio(fg, g)));

    const apply = (p) => {
        const r = document.documentElement.style;
        r.setProperty("--clr-accent", p.accent);
        r.setProperty("--clr-accent-soft", p.soft);
        r.setProperty("--clr-accent-2", p.second);
        const [rr, gg, bb] = [1, 3, 5].map(i => parseInt(p.accent.slice(i, i + 2), 16));
        r.setProperty("--clr-accent-glow", `rgba(${rr}, ${gg}, ${bb}, 0.35)`);
        try { localStorage.setItem("accent", p.name); } catch (e) { /* 사생활 보호 모드 */ }
        panel.querySelectorAll(".td-sw").forEach(el =>
            el.classList.toggle("is-on", el.dataset.name === p.name));
        readout.innerHTML =
            `<b>${p.name}</b> ${p.accent}<br>` +
            `흰 글자 ${ratio("#ffffff", p.accent).toFixed(2)} · ` +
            `유리 위 ${worst(p.soft).toFixed(2)} · ` +
            `큰 제목 ${worst(p.accent).toFixed(2)}`;
    };

    const panel = document.createElement("div");
    panel.className = "theme-demo";
    panel.innerHTML = `
        <div class="td-title">강조색 후보 <span>(임시 데모)</span></div>
        <div class="td-grid"></div>
        <div class="td-readout"></div>
        <div class="td-title" style="margin-top:10px">화면 바꿔 보기</div>
        <div class="td-views"></div>`;
    const grid = panel.querySelector(".td-grid");
    const readout = panel.querySelector(".td-readout");

    PALETTES.forEach(p => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "td-sw";
        b.dataset.name = p.name;
        b.title = p.name;
        b.style.background = `linear-gradient(135deg, ${p.accent}, ${p.second})`;
        b.innerHTML = `<span>${p.name}</span>`;
        b.addEventListener("click", () => apply(p));
        grid.appendChild(b);
    });

    // 카드마다 강조색이 쓰이는 맥락이 달라서(제목·버튼·탭·링크) 바로 건너뛸 수 있게 둔다
    const views = panel.querySelector(".td-views");
    [["home", "홈"], ["about", "About"], ["skills", "Skills"], ["projects", "Graphics"],
     ["games", "Games"], ["resume", "Resume"], ["sns", "SNS"]].forEach(([id, label]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "td-view";
        b.textContent = label;
        // 해시를 바꾼 뒤 popstate 를 직접 쏜다. 사이트는 hashchange 가 아니라
        // popstate 로 화면을 맞추므로(뒤로/앞으로와 같은 경로), 이래야 동작한다.
        b.addEventListener("click", () => {
            if (id === "home") history.pushState({}, "", location.pathname + location.search);
            else location.hash = id;
            dispatchEvent(new PopStateEvent("popstate"));
        });
        views.appendChild(b);
    });

    const css = document.createElement("style");
    css.textContent = `
        .theme-demo {
            position: fixed; top: 16px; right: 16px; z-index: 9999;
            width: 232px; padding: 14px;
            background: rgba(255,255,255,0.92);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(0,0,0,0.1); border-radius: 16px;
            box-shadow: 0 16px 40px -16px rgba(0,0,0,0.3);
            font: 12px/1.45 var(--ff-primary); color: #1d1d1f;
        }
        .td-title { font-weight: 700; margin-bottom: 8px; }
        .td-title span { font-weight: 400; color: #8e8e93; }
        .td-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .td-sw {
            height: 40px; border: 2px solid transparent; border-radius: 10px;
            cursor: pointer; padding: 0; position: relative; overflow: hidden;
        }
        .td-sw span {
            position: absolute; inset: auto 0 2px 0; text-align: center;
            font-size: 9px; font-weight: 700; color: #fff;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }
        .td-sw.is-on { border-color: #1d1d1f; }
        .td-readout {
            margin-top: 10px; padding: 8px; border-radius: 8px;
            background: rgba(0,0,0,0.04); font-size: 11px; line-height: 1.5;
        }
        .td-views { display: flex; flex-wrap: wrap; gap: 4px; }
        .td-view {
            padding: 3px 8px; border-radius: 999px; cursor: pointer;
            border: 1px solid rgba(0,0,0,0.15); background: #fff;
            font: inherit; font-size: 11px; color: #3a3a3c;
        }
        .td-view:hover { background: #f0f0f2; }
    `;

    document.head.appendChild(css);
    document.body.appendChild(panel);

    let saved = null;
    try { saved = localStorage.getItem("accent"); } catch (e) { /* 무시 */ }
    apply(PALETTES.find(p => p.name === saved) || PALETTES[0]);
})();
