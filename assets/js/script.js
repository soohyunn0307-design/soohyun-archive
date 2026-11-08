/* =========================================================
   Lee Soohyun — Web Archive
   각 페이지는 <body data-page="..."> 값에 따라 필요한 기능만 실행합니다.
   ========================================================= */

const A = window.ARCHIVE;
const $ = (sel, root = document) => root.querySelector(sel);
const params = new URLSearchParams(location.search);

/* ---------- 작은 도우미 ---------- */
const escapeHtml = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// "남은 장면 I, 2026, 130.3 × 193.9 cm, 장지에 채색" — 비어 있는 값은 건너뜀
const workCaption = (w) => [w.title, w.year, w.size, w.medium].filter(Boolean).join(", ");

const stars = (n) => "★".repeat(n);

const photoTitle = (p) => [p.date, p.place].filter(Boolean).join(" ") || "—";

/* =========================================================
   1. 잔상 효과 — 장노출 궤적 (Works · Drawings · Journal 그리드)
   커서가 지나간 길을 따라 이미지가 끌리듯 번지고, 멈추면 약 1초에 걸쳐 원래대로 돌아옴.
   (afterimage-lab 의 B-1 설정)
   ========================================================= */
const TRAIL = {
    restore: 0.045,   // 원본이 다시 덮이는 속도 — 작을수록 번진 자국이 오래 남음
    decay: 0.88,      // 흔들림이 줄어드는 속도 — 1에 가까울수록 멈춘 뒤에도 오래 흔들림
    hold: 4,          // 최대 몇 초 동안 효과를 이어 갈지
};

function afterimageTile({ href, src, alt, caption, ratio }) {
    const a = document.createElement("a");
    a.className = "tile";
    a.href = href;
    a.innerHTML = `
        <div class="ai"${ratio ? ` style="--ratio:${ratio}"` : ""}>
            <img class="ai-main" src="${src}" alt="${escapeHtml(alt)}" loading="lazy">
            <canvas class="ai-trail" aria-hidden="true"></canvas>
        </div>
        ${caption ? `<p class="cap">${escapeHtml(caption)}</p>` : ""}`;
    attachTrail(a.querySelector(".ai"));
    return a;
}

function attachTrail(box) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const img = box.querySelector("img");
    const canvas = box.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    let vx = 0, vy = 0, running = false, quietFor = 0, last = 0, W = 0, H = 0, dpr = 1;
    let buf, bctx;

    // 이미지를 object-fit: cover 와 똑같이 그림
    const cover = (c, ox = 0, oy = 0) => {
        const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
        const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
        c.drawImage(img, (W - dw) / 2 + ox, (H - dh) / 2 + oy, dw, dh);
    };

    // 처음 움직일 때 캔버스를 이미지 크기에 맞춰 준비
    const prepare = () => {
        dpr = Math.min(2, devicePixelRatio || 1);
        const r = box.getBoundingClientRect();
        W = canvas.width = Math.round(r.width * dpr);
        H = canvas.height = Math.round(r.height * dpr);
        buf = document.createElement("canvas");
        buf.width = W; buf.height = H;
        bctx = buf.getContext("2d");
    };

    // 원래 위치 → 끌린 위치 사이에 여러 장을 촘촘히 겹쳐 평균을 냄
    // (한 장만 옮겨 그리면 윤곽선이 두 겹으로 보이지만, 이렇게 하면 모션 블러처럼 끊김 없이 번짐)
    const smear = (dx, dy) => {
        const dist = Math.hypot(dx, dy);
        const n = Math.max(4, Math.min(16, Math.ceil(dist / (2 * dpr))));
        bctx.clearRect(0, 0, W, H);
        for (let i = 0; i < n; i++) {
            const t = i / (n - 1);
            bctx.globalAlpha = 1 / (i + 1);   // 누적 평균: 모든 장이 같은 비중
            cover(bctx, dx * t, dy * t);
        }
        bctx.globalAlpha = 1;
    };

    const loop = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000) || 1 / 60;
        last = now;
        const f = dt * 60;   // 화면 주사율(60/120Hz)과 상관없이 같은 시간이 걸리도록

        // 원본을 옅게 계속 덮어서 번진 자국이 천천히 지워지게
        ctx.filter = "none";
        ctx.globalAlpha = 1 - Math.pow(1 - TRAIL.restore, f);
        cover(ctx);

        // 움직이는 동안 지나간 방향으로 길게 번진 상을 덧그림
        const speed = Math.hypot(vx, vy);
        if (speed > 0.15) {
            smear(-vx * 3.5 * dpr, -vy * 3.5 * dpr);
            ctx.globalAlpha = Math.min(0.35, 0.22 * f);
            ctx.filter = `blur(${Math.min(3, speed * 0.15) * dpr}px)`;
            ctx.drawImage(buf, 0, 0);
        }
        const k = Math.pow(TRAIL.decay, f);
        vx *= k; vy *= k;

        quietFor = speed > 0.15 ? 0 : quietFor + dt;
        if (quietFor < TRAIL.hold) {
            requestAnimationFrame(loop);
        } else {
            running = false;
            box.classList.remove("is-trailing");   // 다시 선명한 원본 이미지가 보이게
        }
    };

    box.addEventListener("pointermove", (e) => {
        if (!img.complete || !img.naturalWidth) return;
        vx = vx * 0.6 + e.movementX * 0.4;
        vy = vy * 0.6 + e.movementY * 0.4;
        quietFor = 0;
        if (running) return;

        prepare();
        ctx.globalAlpha = 1;
        ctx.filter = "none";
        cover(ctx);
        box.classList.add("is-trailing");
        running = true;
        last = performance.now();
        requestAnimationFrame(loop);
    });
}

/* =========================================================
   2. 떠다니는 흐릿한 이미지 (메인, Artist's notes 배경)
   ========================================================= */
function startDrift(stage, { interactive = true } = {}) {
    const rnd = (a, b) => a + Math.random() * (b - a);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const caption = $(".frag-caption");
    const items = [];

    // 배경용(Artist's notes)일 때는 몇 장만, 작고 옅게
    const list = interactive ? A.fragments : A.fragments.filter((_, i) => i % 2 === 0);

    list.forEach((f) => {
        const el = document.createElement(interactive ? "a" : "div");
        el.className = "frag";
        if (interactive) el.href = `work.html?id=${f.work}`;
        el.style.left = f.x + "%";
        el.style.top = f.y + "%";
        el.style.width = (interactive ? f.w : Math.min(f.w * 0.6, 12)) + "vw";
        // 흐림 정도 · 투명도 · 속도를 컷마다 다르게
        el.style.setProperty("--b1", rnd(0.5, 2.5).toFixed(1) + "px");
        el.style.setProperty("--b2", rnd(4, 9).toFixed(1) + "px");
        el.style.setProperty("--o1", (interactive ? rnd(0.8, 0.95) : rnd(0.3, 0.4)).toFixed(2));
        el.style.setProperty("--o2", (interactive ? rnd(0.45, 0.7) : rnd(0.1, 0.2)).toFixed(2));
        el.style.setProperty("--dur", rnd(7, 15).toFixed(1) + "s");
        el.style.setProperty("--delay", -rnd(0, 15).toFixed(1) + "s");
        el.innerHTML = `<img src="${f.src}" alt="">`;
        stage.appendChild(el);

        items.push({
            el,
            ax: rnd(2, 6),  ay: rnd(2, 5),          // 떠도는 범위 (vw / vh)
            sx: rnd(0.04, 0.11), sy: rnd(0.03, 0.09), // 떠도는 속도
            px: rnd(0, Math.PI * 2), py: rnd(0, Math.PI * 2),
            paused: false, t: 0,
        });

        if (interactive) {
            const work = A.works.find((w) => w.id === f.work);
            el.setAttribute("aria-label", work ? workCaption(work) : "작품 보기");
            el.addEventListener("pointerenter", () => {
                items.find((i) => i.el === el).paused = true;
                stage.classList.add("has-focus");
                if (caption && work) {
                    caption.textContent = workCaption(work);
                    caption.classList.add("is-on");
                }
            });
            el.addEventListener("pointerleave", () => {
                items.find((i) => i.el === el).paused = false;
                stage.classList.remove("has-focus");
                caption && caption.classList.remove("is-on");
            });
        }
    });

    if (reduce) return;

    // 각 컷이 제자리 주변을 천천히 떠돌아다님 (마우스를 올린 컷은 멈춤)
    let last = performance.now();
    const vw = () => innerWidth / 100, vh = () => innerHeight / 100;
    const frame = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        items.forEach((it) => {
            if (!it.paused) it.t += dt;
            const x = Math.sin(it.t * it.sx * Math.PI * 2 + it.px) * it.ax * vw()
                    + Math.sin(it.t * it.sx * 0.37 * Math.PI * 2) * it.ax * 0.6 * vw();
            const y = Math.cos(it.t * it.sy * Math.PI * 2 + it.py) * it.ay * vh();
            it.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        });
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
}

/* =========================================================
   3. 페이지별 기능
   ========================================================= */
const pages = {

    home() {
        startDrift($("#drift"));
    },

    notes() {
        startDrift($("#drift"), { interactive: false });
    },

    /* ----- Works / Drawings 목록 ----- */
    works() { renderList("works"); },
    drawings() { renderList("drawings"); },

    /* ----- 작품 상세 ----- */
    work() {
        const list = [...A.works, ...A.drawings];
        const i = list.findIndex((w) => w.id === params.get("id"));
        const w = list[i];
        const root = $("#detail");
        if (!w) {
            root.innerHTML = `<p class="empty">작품을 찾을 수 없어요. <a href="works.html">Works로 돌아가기</a></p>`;
            return;
        }
        document.title = `${w.title} — Lee Soohyun`;
        const isDrawing = A.drawings.includes(w);
        const back = isDrawing ? "drawings.html" : "works.html";
        // 메뉴에서 Works 또는 Drawings를 굵게 표시
        document.querySelectorAll(".site-nav a").forEach((a) => {
            if (a.getAttribute("href") === back) a.setAttribute("aria-current", "page");
        });
        const next = list[(i + 1) % list.length];

        root.innerHTML = `
            <div class="detail">
                <div class="detail-media"><img src="${w.image}" alt="${escapeHtml(w.title)}"></div>
                <div class="detail-info">
                    <h1>${escapeHtml(w.title)}</h1>
                    <p class="meta">${[w.year, w.medium, w.size].filter(Boolean).map(escapeHtml).join("\n")}</p>
                </div>
            </div>
            ${w.details && w.details.length ? `
            <div class="detail-cuts">
                ${w.details.map((d) => `<img src="${d}" alt="${escapeHtml(w.title)} 디테일" loading="lazy">`).join("")}
            </div>` : ""}
            <nav class="detail-nav">
                <a href="${back}">← ${isDrawing ? "Drawings" : "Works"}</a>
                <a href="work.html?id=${next.id}">${escapeHtml(next.title)} →</a>
            </nav>`;
    },

    /* ----- Journal 목록 ----- */
    journal() {
        const grid = $("#grid");
        const tabs = document.querySelectorAll(".star-tabs button");
        const show = (n) => {
            tabs.forEach((b) => b.classList.toggle("is-active", b.dataset.stars === String(n)));
            grid.replaceChildren(
                ...A.journal
                    .filter((p) => n === "all" || p.stars === Number(n))
                    .map((p) => afterimageTile({
                        href: `photo.html?id=${p.id}`,
                        src: p.src,
                        alt: photoTitle(p),
                        ratio: "3 / 2",
                    }))
            );
            history.replaceState(null, "", n === "all" ? "journal.html" : `journal.html?stars=${n}`);
        };
        tabs.forEach((b) => b.addEventListener("click", () => show(b.dataset.stars)));
        show(params.get("stars") || "all");
    },

    /* ----- 사진 상세 ----- */
    photo() {
        const p = A.journal.find((x) => x.id === params.get("id"));
        const root = $("#detail");
        if (!p) {
            root.innerHTML = `<p class="empty">사진을 찾을 수 없어요. <a href="journal.html">Journal로 돌아가기</a></p>`;
            return;
        }
        // 위쪽 별 탭은 이 사진의 별점을 표시 (누르면 해당 목록으로)
        document.querySelectorAll(".star-tabs a").forEach((a) =>
            a.classList.toggle("is-active", a.dataset.stars === String(p.stars)));

        // 비슷한 사진: 같은 장소 → 같은 별점 → 나머지 순서로 3장
        const others = A.journal.filter((x) => x.id !== p.id);
        const score = (x) => (p.place && x.place === p.place ? 2 : 0) + (x.stars === p.stars ? 1 : 0);
        const similar = others.sort((a, b) => score(b) - score(a)).slice(0, 3);

        root.innerHTML = `
            <div class="detail">
                <div class="detail-media"><img src="${p.src}" alt="${escapeHtml(photoTitle(p))}"></div>
                <div class="detail-info">
                    <h1>${escapeHtml(photoTitle(p))}</h1>
                    <p class="meta">${escapeHtml(p.info || "사진 정보")}</p>
                    ${p.comment ? `<p class="comment">${escapeHtml(p.comment)}</p>` : ""}
                    <div class="rate">
                        <div class="rate-options" role="group" aria-label="이 사진에 별점 주기">
                            <button type="button" data-v="1" aria-label="별 하나">☆</button>
                            <button type="button" data-v="2" aria-label="별 둘">☆☆</button>
                            <button type="button" data-v="3" aria-label="별 셋">☆☆☆</button>
                        </div>
                        <p class="rate-note" id="rateNote">이 잔상에 별점을 남겨 주세요</p>
                    </div>
                </div>
            </div>
            <p class="section-label">비슷한 사진</p>
            <div class="grid grid--three" id="similar"></div>`;

        $("#similar").append(...similar.map((x) =>
            afterimageTile({ href: `photo.html?id=${x.id}`, src: x.src, alt: photoTitle(x), ratio: "3 / 2" })));

        // 방문자 별점 — 지금은 이 브라우저에만 저장됨 (모두가 공유하려면 서버가 필요)
        const key = `rating:${p.id}`;
        const buttons = document.querySelectorAll(".rate-options button");
        const paint = (v) => buttons.forEach((b) => {
            const n = Number(b.dataset.v);
            b.textContent = (n === v ? "★" : "☆").repeat(n);
            b.classList.toggle("is-chosen", n === v);
        });
        let saved = null;
        try { saved = Number(localStorage.getItem(key)) || null; } catch (e) {}
        if (saved) {
            paint(saved);
            $("#rateNote").textContent = "별점을 남겨 주셔서 고마워요";
        }
        buttons.forEach((b) => b.addEventListener("click", () => {
            const v = Number(b.dataset.v);
            paint(v);
            try { localStorage.setItem(key, v); } catch (e) {}
            $("#rateNote").textContent = "별점을 남겨 주셔서 고마워요";
        }));
    },
};

/* Works · Drawings 목록 (Latest / Earliest 정렬) */
function renderList(kind) {
    const grid = $("#grid");
    const items = A[kind];
    if (!items.length) {
        grid.outerHTML = `<p class="empty">드로잉 작업을 준비 중입니다.</p>`;
        $(".sort") && $(".sort").remove();
        return;
    }
    const buttons = document.querySelectorAll(".sort button");
    const show = (order) => {
        buttons.forEach((b) => b.classList.toggle("is-active", b.dataset.order === order));
        // 연도가 없는 작품은 항상 맨 뒤로
        const sorted = [...items].sort((a, b) => {
            if (a.year == null) return 1;
            if (b.year == null) return -1;
            return order === "latest" ? b.year - a.year : a.year - b.year;
        });
        grid.replaceChildren(...sorted.map((w) => afterimageTile({
            href: `work.html?id=${w.id}`,
            src: w.image,
            alt: w.title,
            caption: workCaption(w),
        })));
    };
    buttons.forEach((b) => b.addEventListener("click", () => show(b.dataset.order)));
    show("latest");
}

/* 실행 */
const page = document.body.dataset.page;
if (pages[page]) pages[page]();
