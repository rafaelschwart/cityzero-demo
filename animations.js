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
  const blocks = document.querySelectorAll("#content .metric, #content .mcard, #content .acard, #content .panel, #content .scard, #content .chartpanel, #content .donutpanel, #content .kcol");
  if (blocks.length) {
    anime({
      targets: blocks, opacity: [0, 1], translateY: [10, 0],
      duration: 420, delay: anime.stagger(30, { start: 40 }), easing: "easeOutExpo",
    });
  }

  // Row-level cascade inside tables and lists (cheap: first 30 rows).
  const rows = document.querySelectorAll("#content tbody tr, #content .xlist .row, #content .act, #content .icard, #content .logrow, #content .review");
  if (rows.length) {
    anime({
      targets: [...rows].slice(0, 30), opacity: [0, 1], translateY: [6, 0],
      duration: 300, delay: anime.stagger(20, { start: 120 }), easing: "easeOutQuart",
    });
  }

  // Numbers count up in place (metric values, health score, KPI cards).
  document.querySelectorAll("#content .mval, #content .metric .v, #content .donut-center .dv").forEach(countUp);

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
  const el = e.target.closest(".btn, .acard, .tab, .pgbtn, .dditem");
  if (!el) return;
  anime.remove(el);
  anime({ targets: el, scale: [1, 0.97], duration: 90, easing: "easeOutQuad" });
});
document.addEventListener("pointerup", e => {
  if (REDUCED || typeof anime === "undefined") return;
  const el = e.target.closest(".btn, .acard, .tab, .pgbtn, .dditem");
  if (!el) return;
  anime({ targets: el, scale: 1, duration: 180, easing: "easeOutExpo" });
});
