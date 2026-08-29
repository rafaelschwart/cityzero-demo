/* CITY 0 OPS · motion pass, powered by anime.js (vendor/anime.min.js).
   Rules applied from the design skills: transform/opacity only, ease-out
   expo curves, 30ms stagger, micro-interactions 150-300ms, exits faster
   than entries, everything gated on prefers-reduced-motion. */

const _q = new URLSearchParams(location.search);
const REDUCED = (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  || _q.get("anim") === "off" || _q.has("open") || _q.has("debug");

function fmtLike(sample, value) {
  // Reproduce the original number formatting (thousands separators)
  const dec = /\.\d+/.test(sample) ? (sample.split(".")[1].match(/^\d+/) || [""])[0].length : 0;
  let s = value.toFixed(dec);
  if (/\d,\d{3}/.test(sample)) s = Number(s).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  return s;
}

function countUp(el) {
  const original = el.textContent;
  const m = original.match(/-?[\d,]+(\.\d+)?/);
  if (!m) return;
  const target = parseFloat(m[0].replace(/,/g, ""));
  if (!isFinite(target) || target === 0) return;
  const obj = { v: 0 };
  anime({
    targets: obj, v: target, duration: 720, easing: "easeOutExpo",
    update: () => { el.textContent = original.replace(m[0], fmtLike(m[0], obj.v)); },
    complete: () => { el.textContent = original; },
  });
}

function animatePage() {
  if (REDUCED || typeof anime === "undefined") return;
  anime.remove(".mcard,.acard,.panel,.metric,.scard,.icard,.kcol,.chartpanel,.donutpanel");

  // Section entrance: cards and panels rise in with a 30ms cascade.
  const blocks = document.querySelectorAll("#content .metric, #content .mcard, #content .acard, #content .panel, #content .scard, #content .chartpanel, #content .donutpanel, #content .kcol, #content .kpicard, #content .crmcard, #content .crmhead, #content .kbbar, #content .kbcol, #content .ltile, #content .ftile, #content .pwow");
  if (blocks.length) {
    anime({
      targets: blocks, opacity: [0, 1], translateY: [10, 0],
      duration: 420, delay: anime.stagger(30, { start: 40 }), easing: "easeOutExpo",
    });
  }

  // Row-level cascade inside tables and lists (cheap: first 30 rows).
  const rows = document.querySelectorAll("#content tbody tr, #content .xlist .row, #content .act, #content .icard, #content .logrow, #content .review, #content .kbtask, #content .ibrow, #content .pfwd, #content .feedrow, #content .crow");
  if (rows.length) {
    anime({
      targets: [...rows].slice(0, 30), opacity: [0, 1], translateY: [6, 0],
      duration: 300, delay: anime.stagger(20, { start: 120 }), easing: "easeOutQuart",
    });
  }

  // Numbers count up in place (metric values, health score, KPI cards).
  document.querySelectorAll("#content .mval, #content .metric .v, #content .donut-center .dv, #content .kpiv, #content .crailbig, #content .railn, #content .goaln, #content .ltile .lv, #content .ftile .fn").forEach(countUp);

  // Template chart draw-in (Recharts-style): lines sweep left to right, area fades under them.
  const act = document.querySelector("#content .actsvg");
  if (act) {
    act.querySelectorAll('path[fill="none"]').forEach((p, i) => {
      const len = p.getTotalLength ? p.getTotalLength() : 1400;
      p.setAttribute("stroke-dasharray", len);
      p.setAttribute("stroke-dashoffset", len);
      anime({ targets: p, strokeDashoffset: [len, 0], duration: 1000 + i * 140, easing: "easeOutQuart", delay: 160 + i * 90 });
    });
    const area = act.querySelector('path[fill^="url"]');
    if (area) anime({ targets: area, opacity: [0, 1], duration: 800, delay: 520, easing: "easeOutQuad" });
    anime({ targets: "#content .actlegs .actleg", opacity: [0, 1], translateY: [-4, 0], duration: 320, delay: anime.stagger(60, { start: 300 }), easing: "easeOutQuad" });
  }

  // Lead Flow bars grow from the baseline with a cascade (Recharts bar mount).
  document.querySelectorAll("#content .cfbar").forEach((b, i) => {
    b.style.transformOrigin = "center bottom";
    anime({ targets: b, scaleY: [0, 1], duration: 620, delay: 120 + i * 26, easing: "easeOutQuart" });
  });

  // Goal ticks, health strips and the tour chip pop in.
  const goal = document.querySelectorAll("#content .goalbars i");
  if (goal.length) anime({ targets: goal, opacity: [0, 1], duration: 240, delay: anime.stagger(9, { start: 220 }), easing: "easeOutQuad" });
  const strips = document.querySelectorAll("#content .hstrip");
  if (strips.length) anime({ targets: strips, opacity: [0, 1], duration: 380, delay: anime.stagger(24, { start: 180 }), easing: "easeOutQuad" });
  const chip = document.querySelector("#content .tlchip");
  if (chip) anime({ targets: chip, opacity: [0, 1], scale: [0.92, 1], duration: 380, delay: 340, easing: "easeOutExpo" });

  // Progress bars fill via scaleX so no layout is animated.
  document.querySelectorAll("#content .progress .bar").forEach(bar => {
    bar.style.transformOrigin = "left center";
    anime({ targets: bar, scaleX: [0, 1], duration: 600, delay: 200, easing: "easeOutExpo" });
  });

  // Dist bars sweep in the same way.
  document.querySelectorAll("#content .dist .fill").forEach((f, i) => {
    f.style.transformOrigin = "left center";
    anime({ targets: f, scaleX: [0, 1], duration: 520, delay: 140 + i * 40, easing: "easeOutExpo" });
  });
}

/* Charts: line draw-in + area fade, donut sweep. Called by chart mounts. */
function animateAreaChart(mount) {
  if (REDUCED || typeof anime === "undefined") return;
  mount.querySelectorAll("polyline").forEach(pl => {
    const len = pl.getTotalLength ? pl.getTotalLength() : 1200;
    pl.setAttribute("stroke-dasharray", len);
    pl.setAttribute("stroke-dashoffset", len);
    anime({ targets: pl, strokeDashoffset: [len, 0], duration: 900, easing: "easeOutQuart", delay: 120 });
  });
  const area = mount.querySelector("polygon");
  if (area) anime({ targets: area, opacity: [0, 1], duration: 700, delay: 400, easing: "easeOutQuad" });
}

function animateDonut(mount) {
  if (REDUCED || typeof anime === "undefined") return;
  const paths = mount.querySelectorAll("path");
  anime({
    targets: paths, opacity: [0, 1], scale: [0.86, 1],
    transformOrigin: "50% 50%", duration: 520,
    delay: anime.stagger(70, { start: 80 }), easing: "easeOutExpo",
  });
  const center = mount.parentElement && mount.parentElement.querySelector(".donut-center");
  if (center) anime({ targets: center, opacity: [0, 1], duration: 400, delay: 300, easing: "easeOutQuad" });
}

/* Micro-interaction: tactile press on buttons and action cards (scale 0.97). */
document.addEventListener("pointerdown", e => {
  if (REDUCED || typeof anime === "undefined") return;
  const el = e.target.closest(".btn, .acard, .tab, .pgbtn, .dditem, .kbtask, .kbicon, .pgb, .kpicard.ov");
  if (!el) return;
  anime.remove(el);
  anime({ targets: el, scale: [1, 0.97], duration: 90, easing: "easeOutQuad" });
});
document.addEventListener("pointerup", e => {
  if (REDUCED || typeof anime === "undefined") return;
  const el = e.target.closest(".btn, .acard, .tab, .pgbtn, .dditem, .kbtask, .kbicon, .pgb, .kpicard.ov");
  if (!el) return;
  anime({ targets: el, scale: 1, duration: 180, easing: "easeOutExpo" });
});
