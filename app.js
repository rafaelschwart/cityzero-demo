/* CITY 0 OPS · renderer. Hash-routed sections, all content from DATA. */

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* Two modes (memo Carlos 26.08, §5-6: pantalla / reporte / motor):
   - pitch (default): the demo the prospect sees. Few screens, the rule applied.
   - full (?full=1 or cmdk toggle, persisted): the whole internal build.
   On any public host (the deployed demo) internal mode is locked out:
   the prospect-facing URL only ever serves the pitch. */
const PUBLIC_DEMO = !["localhost", "127.0.0.1", ""].includes(location.hostname);
const FULL = (() => {
  if (PUBLIC_DEMO) return false;
  const p = new URLSearchParams(location.search).get("full");
  if (p === "1") localStorage.setItem("c0.full", "1");
  if (p === "0") localStorage.removeItem("c0.full");
  return localStorage.getItem("c0.full") === "1";
})();

const SECTIONS_SIMPLE = [
  { group: "Your gym · live" },
  { id: "home", label: "Today", badge: () => DATA.today.do.length, hot: true },
  { id: "hours", label: "Hours" },
  { id: "classes", label: "Classes" },
  { group: "More members" },
  { id: "grow", label: "Grow" },
  { id: "pipeline", label: "Pipeline", badge: () => DATA.pipeline.cards.filter(c => c.breach).length, hot: true },
  { id: "campaigns", label: "Campaigns" },
  { id: "keep", label: "Keep" },
  { group: "Marketing" },
  { id: "paidmedia", label: "Ads Report" },
  { id: "pulsereport", label: "Monthly Report" },
  { group: "Under the hood" },
  { id: "engine", label: "The Engine" },
];

const SECTIONS_FULL = [
  { group: "Pitch · ops manager" },
  { id: "home", label: "Today" },
  { id: "grow", label: "Grow" },
  { id: "keep", label: "Keep" },
  { id: "engine", label: "The Engine" },
  { group: "Guide" },
  { id: "start", label: "Start Here" },
  { group: "Monitor · live" },
  { id: "overview", label: "Overview" },
  { id: "exceptions", label: "Exceptions", badge: () => DATA.exceptions.filter(x => x.status === "OPEN").length, hot: true },
  { id: "surfaces", label: "Surfaces" },
  { id: "routes", label: "Routes & Links", badge: () => DATA.routesSummary.failing, hot: true },
  { id: "reviews", label: "Review Signal", badge: () => DATA.reviews.filter(r => r.classification === "OPERATIONAL" && !r.reply).length, hot: true },
  { id: "report", label: "Morning Report" },
  { group: "Gym OS · Glofox + BioStar" },
  { id: "classes", label: "Classes" },
  { id: "members", label: "Members" },
  { id: "access", label: "Access Control" },
  { group: "Growth" },
  { id: "landing", label: "Landing Page", badge: () => JSON.parse(localStorage.getItem("c0.leads") || "[]").length || null },
  { id: "pipeline", label: "Pipeline", badge: () => DATA.pipeline.cards.filter(c => c.breach).length, hot: true },
  { id: "leads", label: "Lead Channels" },
  { id: "campaigns", label: "Campaigns" },
  { group: "Automation · phase 2" },
  { id: "workflows", label: "Workflows" },
  { id: "triggers", label: "Triggers" },
  { id: "tasks", label: "Tasks", badge: () => DATA.tasks.length },
  { group: "Analytics" },
  { id: "analytics", label: "Analytics" },
  { group: "Pulse Metrics · marketing data" },
  { id: "pulsereport", label: "Pulse Report" },
  { id: "paidmedia", label: "Paid Media" },
  { id: "meta", label: "Meta Health", badge: () => DATA.exceptions.filter(x => x.status === "OPEN" && x.id >= "EX-005").length, hot: true },
  { group: "System" },
  { id: "integrations", label: "Integrations" },
  { id: "audit", label: "Audit Log" },
  { id: "settings", label: "Owners & Thresholds" },
];

const SECTIONS = FULL ? SECTIONS_FULL : SECTIONS_SIMPLE;

const SECTION_DESC = {
  overview: "The day at a glance: open problems, what broke this morning, live activity and the insights that matter.",
  exceptions: "Every verified disagreement between City Zero's public surfaces, with the evidence side by side, an age and an owner.",
  surfaces: "The public surfaces the monitor reads every morning, and the hours comparison that started this case.",
  routes: "Every linked route on the site checked daily with its real HTTP status.",
  reviews: "Real Google reviews classified by the model. Operational ones get a draft reply a person approves.",
  report: "The daily email exactly as it lands in the inbox. Quiet days are one line.",
  pipeline: "Concept board for Phase 2: every lead with an owner, a stage and an SLA clock. Sample names, real channels.",
  leads: "The seven real channels a City Zero lead can arrive through today, each with its public evidence.",
  members: "Phase 2 concept: member list with risk flags. Real plans and prices, sample rows.",
  workflows: "Three automations already live in the monitor plus four Phase 2 drafts. Click one to see its steps.",
  triggers: "When X happens, do Y. The five monitor rules are armed with real counts; Phase 2 rules wait for Discovery.",
  tasks: "The working queue: six real tasks that exist today plus three sample CRM tasks.",
  analytics: "Funnel and sources with SAMPLE numbers; review trend and revenue sensitivity computed from REAL data.",
  pulsereport: "Mockup of the monthly client report, mirroring the real Pulse Metrics schema block by block.",
  paidmedia: "The answer to their hiring post: Arqentia as media buyer, instrumented by Pulse. Sample scenario.",
  meta: "Their own hiring post as evidence: Facebook and Instagram disconnected, phantom pages, and the cleanup order.",
  integrations: "What gets read, what is never touched, and what Phase 2 adds. Read-only is the architecture.",
  audit: "Everything the monitor did, in order, from the two real sweeps.",
  settings: "Who owns each surface (blank on purpose: the kickoff question) and the thresholds you can edit here.",
  start: "",
  home: "Your gym breathing on one screen: who is in, which floor, tonight's classes, and the three things to do before noon.",
  grow: "Everything that turns a stranger into a member: the count on its way to 500, the funnel with names, the tours to confirm.",
  keep: "Growth you already paid for: failed charges to recover, quiet members to call back, first visits to welcome.",
  hours: "The heatmap of your week, drawn from real door events: staff the peaks, move classes into the crowd, aim ads at the quiet hours.",
  engine: "Everything running underneath, in silence: the crosses, the reserve, 15 of 316 endpoints. Depth as inventory, not as noise.",
  classes: "The weekly timetable with live fill and waitlists per class, straight from their Glofox booking system.",
  access: "Who is in the gym right now, the daily curve, visit cohorts and at-risk members, fed by BioStar 2's local API.",
  campaigns: "Follow-up sequences with the whole workflow visible: triggers from Glofox, BioStar and the landing; sends from City Zero's own accounts.",
  landing: "The conversion page for paid traffic: one goal, two fields, real proof and prices. Its leads land in the Pipeline live.",
};
i18nAdd({
  "Your gym breathing on one screen: who is in, which floor, tonight's classes, and the three things to do before noon.": "Tu gimnasio respirando en una pantalla: quién está, en qué piso, las clases de hoy y las tres cosas por hacer antes del mediodía.",
  "Everything that turns a stranger into a member: the count on its way to 500, the funnel with names, the tours to confirm.": "Todo lo que convierte a un desconocido en miembro: el conteo camino a 500, el funnel con nombres, los tours por confirmar.",
  "Growth you already paid for: failed charges to recover, quiet members to call back, first visits to welcome.": "Crecimiento que ya pagaste: cobros fallidos por recuperar, miembros apagándose por llamar, primeras visitas por dar la bienvenida.",
  "The heatmap of your week, drawn from real door events: staff the peaks, move classes into the crowd, aim ads at the quiet hours.": "El heatmap de tu semana, dibujado con eventos reales de puerta: staff a los picos, clases donde hay gente, ads a las horas muertas.",
  "Everything running underneath, in silence: the crosses, the reserve, 15 of 316 endpoints. Depth as inventory, not as noise.": "Todo lo que corre debajo, en silencio: los cruces, la reserva, 15 de 316 endpoints. La profundidad como inventario, no como ruido.",
  "The day at a glance: open problems, what broke this morning, live activity and the insights that matter.": "El día de un vistazo: problemas abiertos, qué se rompió esta mañana, actividad en vivo y los insights que importan.",
  "Every verified disagreement between City Zero's public surfaces, with the evidence side by side, an age and an owner.": "Cada contradicción verificada entre las superficies públicas de City Zero, con la evidencia lado a lado, edad y dueño.",
  "The public surfaces the monitor reads every morning, and the hours comparison that started this case.": "Las superficies públicas que el monitor lee cada mañana, y la comparación de horarios que inició este caso.",
  "Every linked route on the site checked daily with its real HTTP status.": "Cada ruta linkeada del sitio, verificada a diario con su código HTTP real.",
  "Real Google reviews classified by the model. Operational ones get a draft reply a person approves.": "Reseñas reales de Google clasificadas por el modelo. Las operativas reciben un borrador que una persona aprueba.",
  "The daily email exactly as it lands in the inbox. Quiet days are one line.": "El correo diario tal como llega al inbox. Los días tranquilos son una línea.",
  "Concept board for Phase 2: every lead with an owner, a stage and an SLA clock. Sample names, real channels.": "Tablero concepto de Fase 2: cada lead con dueño, etapa y reloj SLA. Nombres de muestra, canales reales.",
  "The seven real channels a City Zero lead can arrive through today, each with its public evidence.": "Los siete canales reales por donde hoy puede entrar un lead a City Zero, cada uno con su evidencia pública.",
  "Phase 2 concept: member list with risk flags. Real plans and prices, sample rows.": "Concepto de Fase 2: lista de miembros con flags de riesgo. Planes y precios reales, filas de muestra.",
  "Three automations already live in the monitor plus four Phase 2 drafts. Click one to see its steps.": "Tres automatizaciones ya vivas en el monitor más cuatro borradores de Fase 2. Clic en una para ver sus pasos.",
  "When X happens, do Y. The five monitor rules are armed with real counts; Phase 2 rules wait for Discovery.": "Cuando pase X, haz Y. Las cinco reglas del monitor están armadas con conteos reales; las de Fase 2 esperan Discovery.",
  "The working queue: six real tasks that exist today plus three sample CRM tasks.": "La cola de trabajo: seis tareas reales que existen hoy más tres de muestra del CRM.",
  "Funnel and sources with SAMPLE numbers; review trend and revenue sensitivity computed from REAL data.": "Funnel y fuentes con números SAMPLE; tendencia de reseñas y sensibilidad de revenue calculadas con datos REALES.",
  "Mockup of the monthly client report, mirroring the real Pulse Metrics schema block by block.": "Mockup del reporte mensual del cliente, replicando el schema real de Pulse Metrics bloque por bloque.",
  "The answer to their hiring post: Arqentia as media buyer, instrumented by Pulse. Sample scenario.": "La respuesta a su post de contratación: Arqentia como media buyer, instrumentado por Pulse. Escenario de muestra.",
  "Their own hiring post as evidence: Facebook and Instagram disconnected, phantom pages, and the cleanup order.": "Su propio post de contratación como evidencia: Facebook e Instagram desconectados, páginas fantasma y el orden de limpieza.",
  "What gets read, what is never touched, and what Phase 2 adds. Read-only is the architecture.": "Qué se lee, qué nunca se toca y qué agrega la Fase 2. Read-only es la arquitectura.",
  "Everything the monitor did, in order, from the two real sweeps.": "Todo lo que hizo el monitor, en orden, de los dos barridos reales.",
  "Who owns each surface (blank on purpose: the kickoff question) and the thresholds you can edit here.": "Quién es dueño de cada superficie (vacío a propósito: la pregunta del kickoff) y los umbrales, editables aquí.",
});

function p2chip() {
  return `<span class="chip amber">PHASE 2 · CONCEPT · SAMPLE DATA</span>`;
}

/* ---------- icons (20x20, stroke 1.25, currentColor) ---------- */
const I = {
  alert: `<svg viewBox="0 0 20 20" fill="none"><path d="M11.6 17.5H8.4c-3.86 0-5.79 0-6.5-1.26-.71-1.25.28-2.92 2.25-6.24l1.6-2.71C7.65 4.1 8.6 2.5 10 2.5s2.35 1.6 4.25 4.79l1.6 2.71c1.98 3.33 2.96 4.99 2.25 6.24-.71 1.26-2.64 1.26-6.5 1.26Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/><path d="M10 7.5v3.75" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/><path d="M10 14.16v.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  clock: `<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.25"/><path d="M10 6.25V10l2.5 2.1" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  routes: `<svg viewBox="0 0 20 20" fill="none"><path d="M14.17 10a4.17 4.17 0 1 1-8.34 0 4.17 4.17 0 0 1 8.34 0Z" stroke="currentColor" stroke-width="1.25"/><path d="M15.54 3.77A1.67 1.67 0 1 0 17.53 6.43M15.54 3.77A8.33 8.33 0 1 0 18.29 9.17" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/></svg>`,
  star: `<svg viewBox="0 0 20 20" fill="none"><path d="m10 2.5 2.32 4.7 5.18.75-3.75 3.66.89 5.16L10 14.33l-4.64 2.44.89-5.16L2.5 7.95l5.18-.75L10 2.5Z" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"/></svg>`,
  download: `<svg viewBox="0 0 20 20" fill="none"><path d="M2.5 14.17c0 .77 0 1.16.09 1.48a2.5 2.5 0 0 0 1.76 1.77c.32.08.71.08 1.48.08h8.34c.77 0 1.16 0 1.48-.08a2.5 2.5 0 0 0 1.76-1.77c.09-.32.09-.71.09-1.48" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/><path d="M13.75 9.58S10.99 13.33 10 13.33c-.99 0-3.75-3.75-3.75-3.75M10 12.5v-10" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  sparkles: `<svg viewBox="0 0 20 20" fill="none"><path d="M10 3.33 11.4 7.1c.15.4.22.6.36.74.13.14.34.21.74.36L16.25 9.6l-3.75 1.4c-.4.15-.6.22-.74.36-.14.14-.21.34-.36.74L10 15.83 8.6 12.1c-.15-.4-.22-.6-.36-.74-.13-.14-.34-.21-.74-.36L3.75 9.6l3.75-1.4c.4-.15.6-.22.74-.36.14-.14.21-.34.36-.74L10 3.33Z" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"/><path d="M15.83 2.5v3.33M17.5 4.17h-3.33" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/></svg>`,
  chevR: `<svg viewBox="0 0 24 24" fill="none"><path d="M9 6s6 4.42 6 6-6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  x: `<svg viewBox="0 0 20 20" fill="none"><path d="M15 5 5 15M15 15 5 5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/></svg>`,
  userplus: `<svg viewBox="0 0 20 20" fill="none"><circle cx="8.33" cy="6.25" r="3.33" stroke="currentColor" stroke-width="1.25"/><path d="M2.5 16.67c0-2.76 2.61-5 5.83-5 1.13 0 2.19.28 3.09.75" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/><path d="M15 11.67v5M17.5 14.17h-5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/></svg>`,
  checkmsg: `<svg viewBox="0 0 20 20" fill="none"><path d="M17.5 9.58a7.5 7.5 0 1 0-3.62 6.03c.34-.2.51-.31.63-.34.12-.03.28 0 .61.05l1.86.31c.42.07.63.1.77-.03.14-.14.1-.35.03-.77l-.31-1.86c-.06-.33-.08-.5-.05-.61.03-.12.13-.29.34-.63a7.46 7.46 0 0 0 .74-2.15Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/><path d="m7.08 10 2.08 2.08 3.76-4.16" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  sweep: `<svg viewBox="0 0 20 20" fill="none"><path d="M18.33 10a8.33 8.33 0 1 1-2.44-5.89" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/><path d="M15.83 1.67v2.5h2.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.33 10a3.33 3.33 0 1 1-6.66 0 3.33 3.33 0 0 1 6.66 0Z" stroke="currentColor" stroke-width="1.25"/></svg>`,
  mail: `<svg viewBox="0 0 20 20" fill="none"><rect x="2.5" y="4.17" width="15" height="11.67" rx="2" stroke="currentColor" stroke-width="1.25"/><path d="m2.5 5.83 6.02 4.3c.89.63 2.07.63 2.96 0l6.02-4.3" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/></svg>`,
  check: `<svg viewBox="0 0 20 20" fill="none"><path d="m4.17 10.83 3.33 3.34 8.33-8.34" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chevL: `<svg viewBox="0 0 24 24" fill="none"><path d="M15 6s-6 4.42-6 6 6 6 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chevD: `<svg viewBox="0 0 24 24" fill="none"><path d="M6 9s4.42 6 6 6 6-6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

/* review time series, built from the real captured sample */
function reviewSeries(mode) {
  const buckets = new Map();
  const key = d => {
    if (mode === "yearly") return String(d.getUTCFullYear());
    if (mode === "monthly") return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    return `${d.getUTCFullYear()} Q${Math.floor(d.getUTCMonth() / 3) + 1}`;
  };
  DATA.reviews.forEach(r => {
    const k = key(new Date(r.date + "T12:00:00Z"));
    if (!buckets.has(k)) buckets.set(k, { a: 0, b: 0 });
    const b = buckets.get(k);
    if (r.stars >= 4) b.a += 1; else b.b += 1;
  });
  // Fill empty periods. A time axis with gaps but even spacing misreads:
  // it hides that a quarter or month had no reviews at all.
  let keys = [...buckets.keys()].sort();
  if (mode === "monthly") {
    const filled = [];
    const [y0, m0] = keys[0].split("-").map(Number);
    const [y1, m1] = keys[keys.length - 1].split("-").map(Number);
    for (let y = y0, m = m0; y < y1 || (y === y1 && m <= m1); m === 12 ? (m = 1, y++) : m++) {
      filled.push(`${y}-${String(m).padStart(2, "0")}`);
    }
    keys = filled;
  } else if (mode === "quarterly") {
    const filled = [];
    const [y0, q0] = [Number(keys[0].slice(0, 4)), Number(keys[0].slice(6))];
    const last = keys[keys.length - 1];
    const [y1, q1] = [Number(last.slice(0, 4)), Number(last.slice(6))];
    for (let y = y0, q = q0; y < y1 || (y === y1 && q <= q1); q === 4 ? (q = 1, y++) : q++) {
      filled.push(`${y} Q${q}`);
    }
    keys = filled;
  }
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return keys.map(k => {
    const v = buckets.get(k) || { a: 0, b: 0 };
    let label = k, tipLabel = k;
    if (mode === "monthly") {
      const [y, m] = k.split("-").map(Number);
      label = `${MON[m - 1]} '${String(y).slice(2)}`; tipLabel = `${MON[m - 1]} ${y}`;
    } else if (mode === "quarterly") {
      label = `${k.slice(5)} '${k.slice(2, 4)}`; tipLabel = `${k.slice(5)} ${k.slice(0, 4)}`;
    }
    return { label, tip: tipLabel, a: v.a, b: v.b, empty: !buckets.has(k) };
  });
}

let chartMode = "quarterly";

/* ---------- shared pieces ---------- */

function ageOf(x) { return daysSince(x.firstEvidence); }
function ageChip(x) {
  const d = ageOf(x);
  const cls = x.severity === "red" ? "age-red" : "age-amber";
  return `<span class="mono ${cls}">${d} DAYS</span>`;
}
function sevChip(x) {
  const d = ageOf(x);
  return `<span class="chip ${x.severity}">OPEN ${d} DAYS</span>`;
}

function topbar(title, sub, actions = "") {
  return `<div class="topbar">
    <div><h1>${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ""}</div>
    <div class="sweep">
      <button class="topsearch" onclick="openCmdk()" aria-label="${tr("Search", "Buscar")}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
        <span class="tslabel">${tr("Search the dashboard...", "Busca en el dashboard...")}</span>
        <span class="kbd">Ctrl K</span>
      </button>
      <span class="stamp"><span class="dot"></span>LAST SWEEP ${fmtDate(DATA.meta.sweepDate).toUpperCase()} ${DATA.meta.sweepTime}</span>
      ${actions}
    </div>
  </div>`;
}

function fmtDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function demoNote() {
  return `<div class="demo-note"><div class="alert">${I.alert}<div class="atitle">Demo data policy</div><div class="adesc">Every value is captured public evidence (sweeps 2026-08-20 and 2026-08-24) except draft replies, thresholds and rows marked SAMPLE, which are proposals. No internal City Zero data.</div></div></div>`;
}

/* ---------- sections ---------- */

/* ---- ops manager screens: Today / Grow / Keep (gym language, no API talk) ---- */

const kindChip = k => ({ CHARGE: "amber", TOUR: "gray", RISK: "red", ALERT: "red" }[k] || "gray");
const modeChip = () => DATA.live
  ? `<span class="chip green">LIVE-SIM · PIPELINE DATA</span>`
  : `<span class="chip amber">DEMO · SAMPLE DATA</span>`;

/* foto de miembro: retratos AI (assets/members/p0..p9.jpg), mapeados por hash de nombre */
function memberPhoto(name) { return `assets/members/p${_mhash(name) % 10}.webp`; }
function favatar(name, size) {
  const ini = esc(name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase());
  return `<span class="favatar" style="width:${size}px;height:${size}px"><i>${ini}</i><img src="${memberPhoto(name)}" alt="" loading="lazy" onerror="this.remove()"></span>`;
}

function vToday() {
  const t = DATA.today;
  const floors = t.byFloor.map(f => `
    <div class="ftile ${f.offline ? "off" : ""}">
      <div class="fn mono">${f.n}</div>
      <div class="fl">${tr("Floor", "Piso")} ${f.floor} · ${esc(f.name)}</div>
      ${f.offline ? `<div class="fwarn">${tr("reader offline", "lector caído")}</div>` : ""}
    </div>`).join("");
  const feed = t.feed.map(r => `
    <li class="feedrow click" onclick="openMember('${r.name.replace(/'/g, "\\'")}')" data-tip="${tr("Open member profile", "Abrir perfil del miembro")}"><span class="mono ft">${esc(r.t)}</span>${favatar(r.name, 30)}<b>${esc(r.name)}</b><span class="ffl">${tr("Floor", "Piso")} ${r.floor}</span></li>`).join("");
  const ig = DATA.ig;
  const igPosts = ig.top.map(p => `
    <li class="igrow">
      <span class="mono igw">${esc(p.when)}</span>
      <div class="igtxt">${esc(p.text)}</div>
      <span class="iglk mono">${p.likes} likes</span>
    </li>`).join("");
  const cls = t.classesToday.map(c => {
    const pct = Math.round(100 * c.booked / c.cap);
    return `
    <li class="crow ${c.done ? "done" : ""}">
      <span class="mono cat">${esc(c.at)}</span>
      <div class="cmid"><b>${esc(c.name)}</b>
        <div class="cbar"><i style="width:${pct}%" class="${pct >= 95 ? "hotbar" : ""}"></i></div>
      </div>
      <span class="cnum mono">${c.booked}/${c.cap}${c.wait ? ` <span class="chip amber">+${c.wait} ${tr("wait", "espera")}</span>` : ""}</span>
    </li>`;
  }).join("");
  const dos = t.do.map(d => `
    <li class="drow">
      <span class="chip ${kindChip(d.kind)}">${esc(d.kind)}</span>
      <div class="dbody"><b>${esc(d.who)}</b><span>${esc(d.what)}</span></div>
      <span class="dact">${esc(d.act)}</span>
    </li>`).join("");
  const know = t.know.map(k => `<li>${esc(k)}</li>`).join("");
  const now = new Date();
  const dateStr = now.toLocaleDateString(LANG === "es" ? "es-US" : "en-US", { weekday: "long", month: "long", day: "numeric" });
  return `
  <div class="hero">
    <img src="assets/banner.webp" alt="" onerror="this.closest('.hero').remove()">
    <div class="heroshade"></div>
    <div class="herotxt">
      <span class="mono">CITY ZERO · BRICKELL</span>
      <b>${esc(dateStr)}</b>
    </div>
  </div>
  ${topbar("Today", tr("YOUR GYM, LIVE: EVERY BADGE, EVERY FLOOR, EVERY CLASS, AS IT HAPPENS.", "TU GIMNASIO, EN VIVO: CADA ENTRADA, CADA PISO, CADA CLASE, MIENTRAS PASA."), modeChip())}
  <div class="livetiles">
    <div class="ltile">
      <div class="lk">${tr("In the gym now", "En el gym ahora")} <span class="livedot"></span></div>
      <div class="lv mono" id="innow-val">${t.inNow}</div>
    </div>
    <div class="ltile">
      <div class="lk">${tr("Check-ins today", "Check-ins hoy")}</div>
      <div class="lv mono" id="today-val">${t.todayTotal}</div>
    </div>
    ${floors}
  </div>
  <div class="grid half">
    <div class="panel">
      <div class="ptitle">${tr("Walking in right now", "Entrando ahora mismo")} <span class="hint">${tr("the front door, live", "la puerta, en vivo")}</span></div>
      <ul class="feed" id="livefeed">${feed}</ul>
    </div>
    <div class="vstack">
      <div class="panel">
        <div class="ptitle">${tr("Today's classes", "Las clases de hoy")} <span class="hint">${tr("fill and waitlists as they stand", "ocupación y waitlists al momento")}</span></div>
        <ul class="clslist">${cls}</ul>
      </div>
      <div class="panel">
        <div class="ptitle">Instagram <span class="chip green" style="margin-left:6px">REAL</span>
          <span class="hint">${tr("captured", "capturado")} ${esc(ig.captured)} · ${esc(ig.handle)}</span></div>
        <div class="igstats">
          <div class="igstat"><b class="mono">${ig.followers.toLocaleString()}</b><span>${tr("followers", "seguidores")}</span></div>
          <div class="igstat"><b class="mono">${ig.postsCount}</b><span>posts</span></div>
          <div class="igstat"><b class="mono">0</b><span>${tr("paid ads behind them", "ads pagados detrás")}</span></div>
        </div>
        <ul class="iglist">${igPosts}</ul>
        <div class="iginsight">${esc(ig.insight)}</div>
      </div>
    </div>
  </div>
  <div class="grid half">
    <div class="panel">
      <div class="ptitle">${tr("Do now", "Hacer ahora")} <span class="hint">${tr("each one acts in the system you already use", "cada una se ejecuta en el sistema que ya usas")}</span></div>
      <ul class="dlist">${dos}</ul>
    </div>
    <div class="panel">
      <div class="ptitle">${tr("Worth knowing", "Vale saber")}</div>
      <ul class="knowlist">${know}</ul>
    </div>
  </div>
  ${demoNote()}`;
}

function vGrow() {
  const g = DATA.grow;
  const pct = Math.min(100, Math.round(100 * g.members / g.goal));
  const funnel = g.funnel.map((s, i) => `
    ${i ? `<div class="farr">${I.chevR}</div>` : ""}
    <div class="fstage">
      <div class="fsn mono">${s.n}</div>
      <div class="fsl">${esc(s.stage)}</div>
      <div class="fnames">${s.names.map(n => `<span class="nchip">${esc(n)}</span>`).join("")}</div>
    </div>`).join("");
  const tours = g.tours.map(tr_ => `
    <li class="drow">
      <span class="chip ${tr_.confirmed ? "green" : "amber"}">${tr_.confirmed ? tr("CONFIRMED", "CONFIRMADO") : tr("UNCONFIRMED", "SIN CONFIRMAR")}</span>
      <div class="dbody"><b>${esc(tr_.name)}</b><span>${esc(tr_.when)}</span></div>
      ${tr_.confirmed ? "" : `<span class="dact">${tr("Confirm by text", "Confirmar por texto")}</span>`}
    </li>`).join("");
  const miles = g.milestones.map(m => `<div class="mstone">${esc(m)}</div>`).join("");
  const moves = g.moves ? g.moves.map(m => `
    <div class="wcard"><div class="wtop"><h3>${esc(m.t)}</h3><span class="chip gray">${tr("SUGGESTED", "SUGERIDO")}</span></div><p>${esc(m.d)}</p></div>`).join("") : "";
  return `
  ${topbar("Grow", tr("THE ROAD TO 500, WITH NAMES ON IT. THE GOAL IS THEIRS; THIS MEASURES EVERY STEP.", "EL CAMINO A 500, CON NOMBRES. LA META ES DE ELLOS; ESTO MIDE CADA PASO."), modeChip())}
  <div class="grid"><div class="panel wide">
    <div class="ptitle">${tr("The member count", "El conteo de miembros")} <span class="hint">${tr("their stated goal: 500", "la meta que ellos pusieron: 500")}</span></div>
    <div class="road">
      <div class="roadnums"><span class="mono rn">${g.members}</span><span class="rgoal">${tr("of", "de")} <b>${g.goal}</b></span></div>
      <div class="roadbar"><i style="width:${pct}%"></i><span class="rpct mono">${pct}%</span></div>
      <div class="roadmeta">
        <span><b class="ok-g">+${g.joins}</b> ${tr("joined this month", "altas este mes")}</span>
        <span><b class="bad-r">−${g.cancels}</b> ${tr("left", "bajas")}${DATA.live ? "" : ""} <span class="chip gray">SAMPLE</span></span>
        <span><b>+${g.net}</b> ${tr("net", "neto")}</span>
        <span class="rpace">${tr("At this pace, 500 arrives in", "A este ritmo, 500 llega en")} ~${g.monthsToGoal} ${tr("months. The whole system exists to shorten that line.", "meses. Todo el sistema existe para acortar esa línea.")}</span>
      </div>
    </div>
  </div></div>
  ${aiPanel(g)}
  <div class="grid"><div class="panel wide">
    <div class="ptitle">${tr("This month's funnel", "El funnel del mes")} <span class="hint">${tr("trial to member", "de trial a miembro")}: ${g.trialConv}%</span></div>
    <div class="funnel">${funnel}</div>
  </div></div>
  <div class="grid">
    <div class="panel">
      <div class="ptitle">${tr("Tours on the calendar", "Tours en el calendario")} <span class="hint">${tr("an unconfirmed tour is a member you lose politely", "un tour sin confirmar es un miembro que se pierde con educación")}</span></div>
      <ul class="dlist">${tours}</ul>
    </div>
    <div class="panel">
      <div class="ptitle">${tr("Momentum", "Momentum")}</div>
      <div class="miles">${miles}</div>
    </div>
  </div>
  <div class="grid"><div class="panel wide">
    <div class="ptitle">${tr("Growth moves on the table", "Jugadas de crecimiento sobre la mesa")} <span class="hint">${tr("no ad budget required", "sin presupuesto de pauta")}</span></div>
    <div class="wgrid">${moves}</div>
  </div></div>
  ${demoNote()}`;
}

/* Pulse Intelligence: recomendaciones desde los datos + el loop que aprende
   de cada accept/dismiss del operador. CONCEPT: entrena con sus numeros reales
   tras el go-live; aqui el loop es visible y persistente. */
function aiPanel(g) {
  const ai = g.ai;
  if (!ai) return "";
  const fb = Object.keys(STATE.aiRecs).length;
  const conf = (ai.learn.conf[ai.learn.conf.length - 1] + fb * 0.3).toFixed(1);
  const recs = ai.recs.map(r => {
    const st = STATE.aiRecs[r.t];
    return `
    <div class="airec ${st === "accepted" ? "ok" : ""} ${st === "dismissed" ? "off" : ""}">
      <div class="aitop">
        <span class="aiconf mono" data-tip="${tr("model confidence", "confianza del modelo")}">${r.conf}%</span>
        <b>${esc(r.t)}</b>
        ${st === "accepted" ? `<span class="chip green">${tr("IN THE PLAN", "EN EL PLAN")}</span>` : ""}
        ${st === "dismissed" ? `<span class="chip gray">${tr("DISMISSED", "DESCARTADA")}</span>` : ""}
      </div>
      <p>${esc(r.d)}</p>
      <div class="aiev">${tr("Based on", "Basado en")}: ${esc(r.ev)}</div>
      <div class="aibtns">
        ${st ? `<button class="btn ghost xs" onclick="aiReact('${r.t.replace(/'/g, "\\'")}', null)">${tr("Undo", "Deshacer")}</button>`
             : `<button class="btn xs" onclick="aiReact('${r.t.replace(/'/g, "\\'")}', 'accepted')">${tr("Apply to plan", "Aplicar al plan")}</button>
                <button class="btn ghost xs" onclick="aiReact('${r.t.replace(/'/g, "\\'")}', 'dismissed')">${tr("Dismiss", "Descartar")}</button>`}
      </div>
    </div>`;
  }).join("");
  const pts = ai.learn.conf.map((v, i) => `${8 + i * 34},${40 - (v - 55) * 1.3}`).join(" ");
  return `
  <div class="grid"><div class="panel wide">
    <div class="ptitle">Pulse Intelligence
      <span class="chip amber" style="margin-left:8px">${tr("CONCEPT · TRAINS ON THEIR DATA AFTER GO-LIVE", "CONCEPT · ENTRENA CON SUS DATOS TRAS EL GO-LIVE")}</span>
      <span class="hint">${tr("every accept or dismiss below becomes a training signal", "cada aplicar o descartar de abajo se vuelve señal de entrenamiento")}</span></div>
    <div class="aigrid">
      <div class="airecs">${recs}</div>
      <div class="ailearn">
        <div class="ailt">${tr("A system that learns this gym", "Un sistema que aprende este gimnasio")}</div>
        <div class="ailconf"><span class="mono">${conf}%</span><span>${tr("recommendation confidence", "confianza de recomendación")}</span></div>
        <svg class="aispark" viewBox="0 0 120 44" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="${pts}" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="aill">${tr("4 weeks of learning on the SAMPLE world", "4 semanas de aprendizaje sobre el mundo SAMPLE")}</div>
        <div class="ailrow"><b>${tr("Signals ingested", "Señales ingeridas")}</b><span>${esc(ai.learn.signals)}</span></div>
        <div class="ailrow"><b>${tr("Your calls woven in", "Tus decisiones tejidas")}</b><span class="mono">${fb}</span></div>
        <div class="ailrow"><b>${tr("Next retrain", "Próximo reentreno")}</b><span>${esc(ai.learn.retrain)}</span></div>
      </div>
    </div>
  </div></div>`;
}
function aiReact(t, v) {
  if (v) STATE.aiRecs[t] = v; else delete STATE.aiRecs[t];
  persist();
  if (v === "accepted") toast(tr("Added to the plan", "Agregada al plan"), tr("Logged as a positive training signal.", "Registrada como señal positiva de entrenamiento."));
  else if (v === "dismissed") toast(tr("Dismissed", "Descartada"), tr("The model weighs this pattern down next retrain.", "El modelo baja el peso de este patrón en el próximo reentreno."));
  render();
}

function vKeep() {
  const k = DATA.keep;
  const rec = k.recovery.map(r => `
    <li class="drow click" onclick="openMember('${r.name.replace(/'/g, "\\'")}')">
      <span class="chip amber">$${r.amount}</span>
      <div class="dbody"><b>${esc(r.name)}</b><span>${tr("autopay failed, trained", "autopago falló, entrenó hace")} ${r.days} ${tr("day(s) ago. Expired card, not churn.", "día(s). Tarjeta vencida, no baja.")}</span></div>
      <span class="dact">${tr("Send payment link", "Enviar link de pago")}</span>
    </li>`).join("");
  const save = k.saveList.map(s => `
    <li class="drow click" onclick="openMember('${s.name.replace(/'/g, "\\'")}')">
      <span class="chip red">${s.never ? tr("never came", "nunca vino") : `${s.days}d`}</span>
      <div class="dbody"><b>${esc(s.name)}</b><span>${esc(s.plan)} · ${s.never ? tr("paying since day one, zero visits", "paga desde el día uno, cero visitas") : tr("paying, not coming", "paga y no viene")}</span></div>
      <span class="dact">${tr("Win-back call", "Llamada de rescate")}</span>
    </li>`).join("");
  const fv = k.firstVisits.map(f => `
    <li class="drow click" onclick="openMember('${f.name.replace(/'/g, "\\'")}')">
      <span class="chip green">${tr("NEW", "NUEVO")}</span>
      <div class="dbody"><b>${esc(f.name)}</b><span>${tr("first check-in", "primer check-in")} ${esc(f.when)}</span></div>
      <span class="dact">${tr("Send welcome text", "Enviar texto de bienvenida")}</span>
    </li>`).join("");
  return `
  ${topbar("Keep", tr("A MEMBER SAVED IS A MEMBER GAINED: NET GROWTH STARTS HERE.", "UN MIEMBRO SALVADO ES UN MIEMBRO GANADO: EL CRECIMIENTO NETO EMPIEZA AQUÍ."), modeChip())}
  <div class="livetiles two">
    <div class="ltile"><div class="lk">${tr("Recoverable right now", "Recuperable ahora mismo")}</div><div class="lv mono">$${(k.recoverySum || 0).toLocaleString()}</div><div class="lsub">${tr("failed charges from people still training", "cobros fallidos de gente que sigue entrenando")}</div></div>
    <div class="ltile"><div class="lk">${tr("Walking out quietly", "Saliendo en silencio")}</div><div class="lv mono">$${(k.saveSum || 0).toLocaleString()}<span class="lmo">/${tr("mo", "mes")}</span></div><div class="lsub">${tr("active plans with 14+ days of silence", "planes activos con 14+ días de silencio")}</div></div>
  </div>
  <div class="grid">
    <div class="panel">
      <div class="ptitle">${tr("Money to recover", "Plata por recuperar")} <span class="hint">${tr("a payment link away", "a un link de pago de distancia")}</span></div>
      <ul class="dlist">${rec}</ul>
    </div>
    <div class="panel">
      <div class="ptitle">${tr("Going quiet", "Se están apagando")} <span class="hint">${tr("the next cancellations, caught early", "las próximas bajas, detectadas a tiempo")}</span></div>
      <ul class="dlist">${save}</ul>
    </div>
  </div>
  <div class="grid"><div class="panel wide">
    <div class="ptitle">${tr("First visits this week", "Primeras visitas de la semana")} <span class="hint">${tr("a welcome text in 24h is the cheapest retention there is", "un texto de bienvenida en 24h es la retención más barata que existe")}</span></div>
    <ul class="dlist">${fv}</ul>
  </div></div>
  ${demoNote()}`;
}

/* semaforo de ocupacion: verde (tranquilo) -> amarillo -> naranja -> rojo (lleno) */
function heatColor(v, max) {
  const r = max ? v / max : 0;
  if (r <= 0.02) return "transparent";
  if (r < 0.35) return `color-mix(in srgb, #4ade80 ${Math.round(20 + (r / 0.35) * 45)}%, transparent)`;
  if (r < 0.6) return `color-mix(in srgb, #facc15 ${Math.round(38 + ((r - 0.35) / 0.25) * 34)}%, transparent)`;
  if (r < 0.82) return `color-mix(in srgb, #fb923c ${Math.round(48 + ((r - 0.6) / 0.22) * 30)}%, transparent)`;
  return `color-mix(in srgb, #ef4444 ${Math.round(58 + ((r - 0.82) / 0.18) * 32)}%, transparent)`;
}
const heatBand = r => r < 0.35 ? "#4ade80" : r < 0.6 ? "#facc15" : r < 0.82 ? "#fb923c" : "#ef4444";

/* The hours heatmap: the week's temperature, straight from the door events. */
function vHours() {
  const H = DATA.heatmap;
  const nH = H.to - H.from + 1;
  const hourLabels = [];
  for (let h = H.from; h <= H.to; h++) hourLabels.push(h % 3 === 0 ? `${h % 12 || 12}${h < 12 ? "a" : "p"}` : "");
  const markAt = {};
  H.classes.forEach(c => { (markAt[`${c.d}-${c.h}`] = markAt[`${c.d}-${c.h}`] || []).push(c.name); });
  const rows = H.days.map((day, d) => {
    const cells = H.matrix[d].map((v, i) => {
      const pct = Math.round(88 * v / H.max);
      const marks = markAt[`${d}-${i + H.from}`];
      const hh = i + H.from;
      const tip = `${day} ${hh % 12 || 12} ${hh < 12 ? "AM" : "PM"} · ${v} ${tr("check-ins avg", "check-ins prom.")}${marks ? " · " + marks.join(", ") : ""}`;
      return `<div class="hmcell" id="hm-${d}-${i}" onclick="hourDetail(${d},${i})" data-tip="${esc(tip)}" style="background:${heatColor(v, H.max)}">${marks ? `<i class="hmdot"></i>` : ""}</div>`;
    }).join("");
    return `<div class="hmday">${tr(day, ({ Mon: "Lun", Tue: "Mar", Wed: "Mié", Thu: "Jue", Fri: "Vie", Sat: "Sáb", Sun: "Dom" })[day] || day)}</div>${cells}`;
  }).join("");
  const ins = H.insights;
  const cards = [
    { t: tr("Staff the peaks", "Staff a los picos"), d: `${esc(ins.peak)}. ${tr("Front desk and coach coverage should follow this map, not a guess.", "La cobertura de front desk y coaches sigue este mapa, no una corazonada.")}` },
    { t: tr("Put classes where people already are", "Pon las clases donde ya hay gente"), d: `${esc(ins.misplaced)}. ${tr("Moving one class one hour can fill it without a single ad.", "Mover una clase una hora puede llenarla sin un solo anuncio.")}` },
    { t: tr("Aim ads at the quiet hours", "Apunta los ads a las horas muertas"), d: `${esc(ins.dead)}. ${tr("Off-peak passes and promos sell the hours the gym already pays for.", "Pases off-peak y promos venden las horas que el gimnasio ya paga.")}` },
  ].map(c => `<div class="wcard"><div class="wtop"><h3>${c.t}</h3><span class="chip gray">${tr("PLAY", "JUGADA")}</span></div><p>${c.d}</p></div>`).join("");
  return `
  ${topbar("Hours", tr("THE WEEK'S TEMPERATURE: EVERY BADGE, AVERAGED OVER FOUR WEEKS.", "LA TEMPERATURA DE LA SEMANA: CADA ENTRADA, PROMEDIADA EN CUATRO SEMANAS."), modeChip())}
  <div class="grid"><div class="panel wide">
    <div class="ptitle">${tr("When your gym is full, and when it is empty", "Cuándo tu gimnasio está lleno, y cuándo vacío")}
      <span class="hint">${tr("hover any cell", "pasa el mouse por una celda")} · <i class="hmdot inl"></i> = ${tr("a class runs there", "ahí corre una clase")}</span></div>
    <div class="hmwrap">
      <div class="hmgrid" style="grid-template-columns:44px repeat(${nH}, 1fr)">
        ${rows}
        <div class="hmday"></div>${hourLabels.map(l => `<div class="hmhour mono">${l}</div>`).join("")}
      </div>
    </div>
    <div class="hmlegend">
      <span>${tr("calm", "tranquilo")}</span>
      ${[0.15, 0.45, 0.7, 0.92].map(r => `<i style="background:${heatColor(r * H.max, H.max)}"></i>`).join("")}
      <span>${tr("packed", "lleno")}</span>
      <span style="margin-left:14px">${tr("green = room to sell, red = at capacity", "verde = espacio por vender, rojo = a tope")}</span>
    </div>
  </div></div>
  <div class="grid"><div class="panel wide">
    <div class="ptitle">${tr("Who is where, hour by hour", "Quién está dónde, hora por hora")}
      <span class="hint">${tr("click any cell in the map above", "clic en cualquier celda del mapa de arriba")}</span></div>
    <div id="hourpanel"></div>
  </div></div>
  <div class="grid"><div class="panel wide">
    <div class="ptitle">${tr("Three plays hiding in this map", "Tres jugadas escondidas en este mapa")}</div>
    <div class="wgrid three">${cards}</div>
  </div></div>
  ${demoNote()}`;
}

/* clic en una hora del heatmap: distribución por piso, como un corte del edificio */
const CLASS_FLOOR = { "Zumba": 2, "Cardio Dance": 2, "Body Fit": 2, "Jiu Jitsu": 2,
                      "Spin": 3, "Full Body Conditioning": 3 };
function hourDetail(d, i) {
  const H = DATA.heatmap;
  const h = H.from + i;
  const total = Math.round(H.matrix[d][i]);
  document.querySelectorAll(".hmcell.selcell").forEach(c => c.classList.remove("selcell"));
  document.getElementById(`hm-${d}-${i}`)?.classList.add("selcell");
  const box = document.getElementById("hourpanel");
  if (!box) return;
  const marks = (H.classes || []).filter(c => c.d === d && c.h === h);
  const w = { 1: 40, 2: 15, 3: 30, 4: 15 };
  if (h <= 9) w[4] += 8;
  if (h >= 17) { w[2] += 4; w[3] += 5; }
  marks.forEach(m => { w[CLASS_FLOOR[m.name] || 2] += 16; });
  const sumW = w[1] + w[2] + w[3] + w[4];
  const counts = {}; let acc = 0;
  [1, 2, 3, 4].forEach(f => { counts[f] = Math.round(total * w[f] / sumW); acc += counts[f]; });
  counts[1] += total - acc;
  const fname = {};
  (DATA.today.byFloor || []).forEach(f => { fname[f.floor] = f.name; });
  const CAPS = { 1: 40, 2: 35, 3: 45, 4: 25 };   // aforo por piso (SAMPLE)
  const vals = [1, 2, 3, 4].map(f => counts[f]);
  const maxC = Math.max(...vals, 1), minC = Math.min(...vals);
  const DAYN = LANG === "es"
    ? ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
    : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const hlabel = `${DAYN[d]} ${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;
  const floors = [4, 3, 2, 1].map(f => {
    const c = counts[f];
    const load = c / CAPS[f];
    const col = heatBand(load);
    const busiest = c === maxC && total > 0, quietest = c === minC && total > 0 && maxC !== minC;
    const cls = marks.filter(m => (CLASS_FLOOR[m.name] || 2) === f).map(m => `<span class="chip gray" style="font-size:9px;padding:1px 6px">${esc(m.name)}</span>`).join(" ");
    const loadTag = load >= 0.82 ? tr("at capacity", "a tope") : load >= 0.6 ? tr("filling up", "llenándose") : load >= 0.35 ? tr("active", "activo") : tr("room to sell", "espacio por vender");
    return `<div class="bldrow ${quietest ? "quiet" : ""}" style="border-color:color-mix(in srgb, ${col} ${busiest ? 45 : 22}%, transparent)">
      <div class="bln">${tr("Floor", "Piso")} ${f}<span>${esc(fname[f] || "")} · ${tr("cap", "aforo")} ${CAPS[f]}</span></div>
      <div class="blbar"><i style="width:${total ? Math.max(4, Math.min(100, Math.round(load * 100))) : 0}%;background:${col}"></i>${cls}</div>
      <div class="blc mono" style="color:${col}">${c}</div>
      <div class="bltag" style="color:${col}">${loadTag}</div>
    </div>`;
  }).join("");
  box.innerHTML = `
    <div class="bldhead"><b>${esc(hlabel)}</b> · ${total} ${tr("people across 4 floors on an average week", "personas en 4 pisos en una semana promedio")}
      ${total === 0 ? `<span class="hint">${tr("the gym is closed or empty at this hour", "el gimnasio está cerrado o vacío a esta hora")}</span>` : ""}</div>
    <div class="bld">${floors}</div>
    <div class="bldfoot">${tr("Split modeled from door weights and the class schedule (SAMPLE); with BioStar live, every badge carries its exact door.", "Distribución modelada con pesos de puerta y el horario de clases (SAMPLE); con BioStar en vivo, cada entrada trae su puerta exacta.")}</div>`;
}
function mountHourDetail() {
  const H = DATA.heatmap;
  let bd = 0, bi = 0, bv = -1;
  H.matrix.forEach((row, d) => row.forEach((v, i) => { if (v > bv) { bv = v; bd = d; bi = i; } }));
  hourDetail(bd, bi);
}

/* filter the class calendar: matching blocks stay, the rest dim out */
function filterCal(q) {
  q = (q || "").trim().toLowerCase();
  document.querySelectorAll(".calblk").forEach(b => {
    b.classList.toggle("dim", !!q && !b.dataset.q.includes(q));
  });
}

/* live feed ticker: the screen breathes while the seller talks */
let _feedTimer = null;
function startFeedTicker() {
  clearInterval(_feedTimer);
  if (new URLSearchParams(location.search).get("anim") === "off") return;
  const base = DATA.today.inNow;
  _feedTimer = setInterval(() => {
    const list = document.getElementById("livefeed");
    if (!list) { clearInterval(_feedTimer); return; }
    const pool = DATA.today.pool || [];
    if (!pool.length) return;
    const name = pool[Math.floor(Math.random() * pool.length)];
    const floors = (DATA.today.byFloor || []).filter(f => !f.offline).map(f => f.floor);
    const fl = floors.length ? floors[Math.floor(Math.random() * floors.length)] : 1;
    const t = new Date().toTimeString().slice(0, 5);
    const li = document.createElement("li");
    li.className = "feedrow feedin click";
    li.onclick = () => openMember(name);
    li.innerHTML = `<span class="mono ft">${t}</span>${favatar(name, 30)}<b>${esc(name)}</b><span class="ffl">${tr("Floor", "Piso")} ${fl}</span>`;
    list.prepend(li);
    while (list.children.length > 12) list.lastChild.remove();
    DATA.today.todayTotal += 1;
    DATA.today.inNow = Math.max(base - 2, Math.min(base + 7, DATA.today.inNow + (Math.random() < 0.6 ? 1 : -1)));
    const iv = document.getElementById("innow-val"), tv = document.getElementById("today-val");
    if (iv) iv.textContent = DATA.today.inNow;
    if (tv) tv.textContent = DATA.today.todayTotal;
  }, 5200 + Math.random() * 2600);
}

/* The engine room: what runs underneath, shown as inventory, not as UI. */
function vEngine() {
  const crosses = [
    { t: "Ghost member", d: "Pays and does not come: next quarter's churn list, with first and last name, weeks before the cancellation call." },
    { t: "Recoverable charge", d: "Failed autopay + still training = expired card, not churn. Money that a payment link brings back this week." },
    { t: "Real tour show-rate", d: "Glofox keeps every lead state change with a date: booked tours vs tours that walked in, per channel and per seller." },
    { t: "LTV per channel", d: "Which channel brings members who stay, not just leads. Spend against lifetime payments and visit frequency." },
  ].map(c => `<div class="wcard"><div class="wtop"><h3>${esc(c.t)}</h3><span class="chip green">RUNS NOW</span></div><p>${esc(c.d)}</p></div>`).join("");
  const reserve = [
    "Floor usage per member segment (four floors, every badge carries a door)",
    "Waitlist pressure per class and slot",
    "Hourly occupancy computed free from access events (Suprema sells this as a licensed module)",
    "Shared-membership detection (one credential, improbable visit patterns)",
    "Churn reasons from Glofox's own enum (PRICE, NO_USAGE, MOVED...)",
    "Failed-autopay webhooks in real time (NON_SUFFICIENT_FUNDS)",
    "Waiver and e-agreement compliance per member",
  ].map(r => `<li>${esc(r)}</li>`).join("");
  return `
  ${topbar("The Engine", "EVERYTHING ELSE RUNS HERE, IN SILENCE. DEPTH IS INVENTORY, NOT NOISE.")}
  <div class="grid"><div class="panel wide">
    <div class="ptitle">The rule that decides what you see <span class="hint">product principle, applied to every pixel</span></div>
    <div class="engrule">Every element on the screen answers a decision the owner takes this week. If there is no decision, it goes to the monthly report. If not even there, it stays running here.</div>
  </div></div>
  <div class="grid"><div class="panel wide">
    <div class="ptitle">The crosses no single platform can see <span class="hint">Meta, Glofox and BioStar each hold a third of the answer</span></div>
    <div class="wgrid">${crosses}</div>
  </div></div>
  <div class="grid">
    <div class="panel">
      <div class="ptitle">In reserve <span class="hint">revealed as the relationship advances</span></div>
      <ul class="benlist">${reserve}</ul>
    </div>
    <div class="panel">
      <div class="ptitle">The size of the engine <span class="hint">from the official specs</span></div>
      <div class="engstats">
        <div class="estat"><b>316</b><span>endpoints documented across Glofox and BioStar 2</span></div>
        <div class="estat"><b>15</b><span>calls this system actually needs</span></div>
        <div class="estat"><b>0</b><span>writes to their systems: read-only is the architecture</span></div>
      </div>
      <p class="engnote">They already pay Glofox's top plan and use a fraction of it. BioStar's API is free on every tier. The engine turns on what they already own.</p>
    </div>
  </div>
  ${demoNote()}`;
}

function vOverview() {
  const open = DATA.exceptions.filter(x => x.status === "OPEN");
  const oldestEx = open.reduce((a, b) => ageOf(b) > ageOf(a) ? b : a);
  const oldest = ageOf(oldestEx);
  const past80 = open.filter(x => ageOf(x) > 80).length;
  const overdue = open.filter(x => ageOf(x) > 7).sort((a, b) => ageOf(b) - ageOf(a));
  const opReviews = DATA.reviews.filter(r => r.classification === "OPERATIONAL" && !r.reply);
  const rows = open.map(x => `
    <tr onclick="location.hash='exceptions/${x.id}'" style="cursor:pointer">
      <td class="mono" style="color:var(--meta);white-space:nowrap">${x.id}</td>
      <td><div class="t">${esc(x.title)}</div><div class="d">${esc(x.valueA.surface)} · ${esc(x.valueB.surface)}</div></td>
      <td class="num">${ageChip(x)}</td>
      <td class="mono" style="color:var(--dim)">${x.owner ? esc(x.owner) : "UNASSIGNED"}</td>
    </tr>`).join("");

  const greetDate = new Date(DATA.meta.sweepDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
  const hour = 6;
  const greeting = hour < 12 ? "Good morning, Rafa" : "Good evening, Rafa";

  const metricCards = [
    { icon: I.alert, tone: "red", label: "Open exceptions", value: String(open.length), note: [`${past80}`, `past 80 days · 0 new since Aug 20`] },
    { icon: I.clock, tone: "amber", label: "Oldest open", value: `${oldest}d`, note: [oldestEx.id, `from the ${fmtDate(oldestEx.firstEvidence)} review`] },
    { icon: I.routes, tone: "red", label: "Routes failing", value: `1/${DATA.routesSummary.checked}`, note: ["404", "GET /classes-schedule/, linked from home"] },
    { icon: I.star, tone: "white", label: "Reviews to answer", value: String(opReviews.length), note: ["0/20", "owner replies in the sample"] },
  ].map(m => `
    <div class="mcard">
      <div class="mhead2"><span class="mic ${m.tone}">${m.icon}</span><span>${esc(m.label)}</span></div>
      <div class="mval">${m.value}</div>
      <p class="mnote"><b>${esc(m.note[0])}</b> <span>${esc(m.note[1])}</span></p>
    </div>`).join("");

  const actions = [
    { icon: I.sweep, label: "Run sweep now", run: "runSweepDemo()" },
    { icon: I.userplus, label: `Assign owners (${open.filter(x => !x.owner).length})`, to: "settings" },
    { icon: I.checkmsg, label: `Approve replies (${opReviews.length})`, to: "reviews" },
    { icon: I.download, label: "Export morning report", run: "exportReport()" },
  ].map(a => `
    <div class="acard" onclick="${a.run ? a.run : `location.hash='${a.to}'`}">
      <div class="al"><span class="aic">${a.icon}</span><span>${esc(a.label)}</span></div>
      <span class="ar">${I.chevR}</span>
    </div>`).join("");

  const activityIcon = { sweep: I.sweep, review: I.star, exception: I.alert, report: I.mail };
  const activity = DATA.auditlog.slice(0, 6).map(e => `
    <div class="act">
      <span class="aic big">${activityIcon[e.kind] || I.sweep}</span>
      <div class="actbody"><p>${esc(e.what)}</p></div>
      <time class="mono">${esc(e.at.slice(5))}</time>
    </div>`).join("");

  const ex1 = DATA.exceptions.find(x => x.id === "EX-001");
  const ex2 = DATA.exceptions.find(x => x.id === "EX-002");
  const intel = [
    { tone: "red", title: "They are shopping for what we sell", to: "paidmedia", body: `City Zero posted today looking for Meta help: the deeper need is an <b>ad media buyer</b>. Paid Media shows Arqentia as that buyer, instrumented by <b>Pulse Metrics</b>, with their broken FB↔IG link as step 0.` },
    { tone: "amber", title: "Aging, member-reported", to: "exceptions/EX-001", body: `The weekend hours mismatch is <b>${ageOf(ex1)} days old</b> counting from Matt O's one-star review, and both values were still live this morning.` },
    { tone: "white", title: "Fifth finding verified", to: "exceptions/EX-002", body: `The homepage sells <b>"40+ classes"</b> while About says <b>"35 classes"</b>. Same sentence, different number, both live on Aug 24.` },
    { tone: "green", title: "Weekdays agree", to: "surfaces", body: `Mon-Fri hours match on the site and Google. The disagreement is <b>weekend-only</b>: 3:30 pm against 6 PM.` },
  ].filter(c => !STATE.dismissed.includes(c.title)).slice(0, 3).map(c => `
    <div class="icard">
      <div class="ictop">
        <span class="ictitle ${c.tone}">${I.sparkles}<span>${esc(c.title)}</span></span>
        <button class="icx" aria-label="Dismiss" onclick="dismissIntel('${c.title.replace(/'/g, "\\'")}')">${I.x}</button>
      </div>
      <div class="icbody">
        <p>${c.body}</p>
        <button class="btn ghost mini" onclick="location.hash='${c.to}'">View</button>
      </div>
    </div>`).join("");

  return `
  <div class="inner">
    <div class="ovhead">
      <div>
        <h1 class="greet">${greeting}</h1>
        <div class="greetsub"><span class="it">${esc(DATA.meta.client)}</span><span class="gd"></span><span>${greetDate}</span><span class="gd"></span><span class="stamp"><span class="dot"></span>SWEEP 06:00 ET</span></div>
      </div>
      <button class="btn ghost" onclick="exportReport()">Export ${I.download.replace("<svg", "<svg class='bicon'")}</button>
    </div>

    <div class="ovsec"><div class="ptitle">Top metrics</div>
      <div class="mgrid">${metricCards}</div></div>

    <div class="ovsec"><div class="ptitle">Quick actions</div>
      <div class="mgrid">${actions}</div>
      <div class="mgrid" id="sweep-skeleton" style="display:none">
        ${Array.from({ length: 4 }, () => `<div class="skeleton" style="height:64px"></div>`).join("")}
      </div></div>

    <div class="ovsec chartsec">
      <div class="chartpanel">
        <div class="chead">
          <div class="ptitle" style="margin:0">Review signal over time <span class="hint">REAL · sample of 20 captured Aug 20</span></div>
          <div class="dd" id="dd-timeframe">
            <button class="ddbtn" onclick="this.parentElement.classList.toggle('open')">${chartMode} ${I.chevR.replace("<svg", "<svg class='ddchev'")}</button>
            <div class="ddmenu">
              ${["monthly", "quarterly", "yearly"].map(m => `<button class="dditem ${m === chartMode ? "on" : ""}" onclick="chartMode='${m}';render()">${m}</button>`).join("")}
            </div>
          </div>
        </div>
        <div id="ovchart"></div>
        <div class="clegend">
          <span><i class="sw" style="background:#fff"></i>Positive (4-5 stars)</span>
          <span><i class="sw" style="background:var(--meta)"></i>Critical (1-2 stars)</span>
        </div>
      </div>
      <div class="donutpanel">
        <div class="ptitle">Open exceptions</div>
        <div class="donutwrap">
          <div id="ovdonut"></div>
          <div class="dlegend" id="ovdlegend"></div>
        </div>
      </div>
    </div>

    <div class="ovsec twocol">
      <div>
        <div class="ptitle">Recent activity <span class="hint">from the audit log · all real</span></div>
        <div class="acts">${activity}</div>
      </div>
      <div>
        <div class="ptitle">Ops intelligence <a class="seeall" href="#exceptions">See all ${I.chevR.replace("<svg", "<svg class='ddchev'")}</a></div>
        <div class="icards">${intel}</div>
      </div>
    </div>
  </div>
  ${demoNote()}`;
}

function mountOverviewCharts() {
  const chartEl = document.getElementById("ovchart");
  if (chartEl) {
    areaLineChart(chartEl, {
      data: reviewSeries(chartMode),
      aName: "Positive", bName: "Critical", height: 272,
    });
    if (typeof animateAreaChart === "function") animateAreaChart(chartEl);
  }
  const donutEl = document.getElementById("ovdonut");
  const legendEl = document.getElementById("ovdlegend");
  if (donutEl && legendEl) {
    const open = DATA.exceptions.filter(x => x.status === "OPEN");
    const seg = [
      { name: "Red · member-facing", value: open.filter(x => x.severity === "red").length, fill: "#D64F4F" },
      { name: "Amber · watch", value: open.filter(x => x.severity === "amber").length, fill: "#D9A13B" },
    ];
    const total = open.length;
    const api = donutChart(donutEl, { data: seg, total, label: "open exceptions", size: 172 });
    if (typeof animateDonut === "function") animateDonut(donutEl);
    legendEl.innerHTML = seg.map((s, i) => `
      <div class="dlrow" data-i="${i}">
        <span class="dln"><i class="sw" style="background:${s.fill}"></i>${esc(s.name)}</span>
        <b>${s.value}</b>
        <span class="dlp">${Math.round(s.value / total * 100)}%</span>
      </div>`).join("");
    legendEl.querySelectorAll(".dlrow").forEach(row => {
      const i = Number(row.dataset.i);
      row.addEventListener("mouseenter", () => { api.setActive(i); syncLegend(i); });
      row.addEventListener("mouseleave", () => { api.setActive(null); syncLegend(null); });
    });
    const syncLegend = i => legendEl.querySelectorAll(".dlrow").forEach((r, j) => r.style.opacity = i == null || i === j ? 1 : .4);
    api.onActive = syncLegend;
  }
}

function vExceptions(selId) {
  const open = DATA.exceptions.filter(x => x.status === "OPEN");
  const sel = DATA.exceptions.find(x => x.id === selId) || open[0];
  const list = open.map(x => `
    <div class="row ${x.id === sel.id ? "sel" : ""}" onclick="location.hash='exceptions/${x.id}'">
      <div class="id">${x.id}</div>
      <div><div class="title">${esc(x.title)}</div><div class="surf">${esc(x.valueA.surface)} · ${esc(x.valueB.surface)}</div></div>
      <div class="age">${ageChip(x)}</div>
    </div>`).join("");

  const tl = [
    { when: x => fmtDate(x.firstEvidence), what: x => esc(x.firstEvidenceNote) },
    { when: x => fmtDate(x.detected || "2026-08-20"), what: () => "Detected and captured by the monitor. Evidence stored." },
    { when: x => fmtDate(x.lastConfirmed), what: x => x.lastConfirmed === DATA.meta.sweepDate ? "Re-confirmed this morning. Both values still live." : "Last confirmed on this date's sweep." },
  ].map(step => `<li><span class="when">${step.when(sel)}</span>${step.what(sel)}</li>`).join("");

  return `
  ${topbar("Exceptions", `${open.length} OPEN · 0 RESOLVED`)}
  <div class="grid xgrid">
    <div class="panel" style="padding:0">
      <div class="xlist">${list}</div>
    </div>
    <div class="panel last detail">
      <div class="crumbs"><a href="#overview">CITY 0 OPS</a>${I.chevR}<a href="#exceptions">Exceptions</a>${I.chevR}<span class="cur">${sel.id}</span></div>
      <h3>${sel.id} · ${esc(sel.title)}</h3>
      <div class="meta-row">${sevChip(sel)}<span class="chip gray" data-tip="The comparison rule that raised this exception. Every exception traces to a rule.">RULE ${esc(sel.rule)}</span></div>
      <div class="evidence">
        <div class="card"><div class="k">${esc(sel.valueA.surface)}</div><div class="q">${esc(sel.valueA.value)}</div></div>
        <div class="card"><div class="k">${esc(sel.valueB.surface)}</div><div class="q">${esc(sel.valueB.value)}</div></div>
      </div>
      <div class="evnote">${esc(sel.note)}</div>
      <div class="ptitle" style="margin-bottom:10px">Timeline</div>
      <ul class="tl">${tl}</ul>
      <dl class="kv">
        <dt>Owner</dt><dd>${sel.owner ? esc(sel.owner) : "Unassigned, set at kickoff, one owner per surface type"}</dd>
        <dt>Detected</dt><dd class="mono">${(sel.detected || "2026-08-20") + (sel.detected === "2026-08-24" ? " capture" : " sweep")}</dd>
        <dt>Age</dt><dd class="mono">${ageOf(sel)} days since first public evidence</dd>
      </dl>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn" onclick="toast('Evidence opened', 'In production this shows the stored page capture.')">View captured evidence</button>
        <button class="btn outline" onclick="assignOwnerDialog('${sel.id}')">Assign owner</button>
      </div>
    </div>
  </div>
  ${demoNote()}`;
}

function vSurfaces() {
  const cards = DATA.surfaces.map(s => {
    const chips = [];
    if (s.sevCount.red) chips.push(`<span class="chip red">${s.sevCount.red} RED</span>`);
    if (s.sevCount.amber) chips.push(`<span class="chip amber">${s.sevCount.amber} AMBER</span>`);
    if (!s.sevCount.red && !s.sevCount.amber) chips.push(`<span class="chip green">CLEAR</span>`);
    return `<div class="scard">
      <div class="top"><h3>${esc(s.name)}</h3><span class="read">${esc(s.lastRead)}</span></div>
      <div class="kind">${esc(s.kind)}${s.pages ? ` · <span class="mono">${s.pages}</span> pages` : ""}</div>
      <ul>${s.watched.map(w => `<li>${esc(w)}</li>`).join("")}</ul>
      <div class="finding"><span>${esc(s.finding)}</span><span>${chips.join(" ")}</span></div>
    </div>`;
  }).join("");

  const hours = DATA.hours.map(h => `
    <tr>
      <td class="t" style="white-space:nowrap">${h.day}</td>
      <td>${esc(h.site)}</td>
      <td>${esc(h.google)}</td>
      <td class="num">${h.agree ? '<span class="chip green">AGREES</span>' : '<span class="chip red">DISAGREES</span>'}</td>
    </tr>`).join("");

  return `
  ${topbar("Surfaces", "EVERY PUBLIC SURFACE CITY ZERO OWNS, READ DAILY")}
  <div class="grid">
    <div class="panel wide">
      <div class="ptitle">Hours, side by side <span class="hint">the signature comparison · EX-001</span></div>
      <table class="hours">
        <thead><tr><th>Day</th><th>cityzero.com footer</th><th>Google Business Profile</th><th style="text-align:right">State</th></tr></thead>
        <tbody>${hours}</tbody>
      </table></div>
      <div class="evnote" style="margin-top:12px">Weekday hours agree on both surfaces. The weekend closing differs by 2.5 hours, and a member already reviewed it: "Fix your Google hours. They are wrong." (${fmtDate("2026-05-31")}).</div>
    </div>
  </div>
  <div class="surfaces">${cards}</div>
  ${demoNote()}`;
}

function vRoutes() {
  const PER = 5;
  const pages = Math.ceil(DATA.routes.length / PER);
  const page = Math.min(STATE.routePage, pages);
  const rows = DATA.routes.slice((page - 1) * PER, page * PER).map(r => `
    <tr>
      <td class="mono" style="color:${r.code === 200 ? "var(--body)" : "var(--red)"}">${esc(r.path)}</td>
      <td class="num"><span class="${r.code === 200 ? "ok-green" : "age-red"}">${r.code}</span></td>
      <td style="color:var(--dim)">${esc(r.linkedFrom)}</td>
      <td>${esc(r.note)}</td>
      <td class="num" style="color:var(--dim)">${esc(r.checked)}</td>
    </tr>`).join("");

  return `
  ${topbar("Routes & Links", `${DATA.routesSummary.checked} LINKED ROUTES · ${DATA.routesSummary.failing} FAILING`)}
  <div class="metrics" style="grid-auto-columns: 1fr 1fr 2fr">
    <div class="metric"><div class="k">Checked daily</div><div class="v">${DATA.routesSummary.checked}</div>
      <div class="s">Discovered in the 50-page crawl of Aug 20</div></div>
    <div class="metric"><div class="k">Failing now</div><div class="v red">1</div>
      <div class="s">Linked from the homepage</div></div>
    <div class="metric"><div class="k">The failing route</div>
      <div class="v" style="font-size:16px;line-height:1.4">GET /classes-schedule/ → 404</div>
      <div class="s">The visitor who clicks "View classes" on the homepage lands here. The working page is /class-schedules/. One-line fix for whoever administers WordPress.</div></div>
  </div>
  <div class="grid"><div class="panel wide">
    <div class="ptitle">Route check <span class="hint">10 of ${DATA.routesSummary.checked} shown · full list re-checked every sweep</span></div>
    <div class="tablewrap"><table>
      <thead><tr><th>Route</th><th style="text-align:right">Status</th><th>Linked from</th><th>Note</th><th style="text-align:right">Checked</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <div class="pager">
      <button class="pgbtn" ${page === 1 ? "disabled" : ""} onclick="STATE.routePage=${page - 1};render()">${I.chevL} Previous</button>
      ${Array.from({ length: pages }, (_, i) => `<button class="pgbtn ${i + 1 === page ? "on" : ""}" onclick="STATE.routePage=${i + 1};render()">${i + 1}</button>`).join("")}
      <button class="pgbtn" ${page === pages ? "disabled" : ""} onclick="STATE.routePage=${page + 1};render()">Next ${I.chevR}</button>
    </div>
  </div></div>
  ${demoNote()}`;
}

function vReviews() {
  const s = DATA.reviewsSummary;
  const needReply = DATA.reviews.filter(r => r.classification === "OPERATIONAL" && !r.reply);

  const shown = STATE.reviewTab === "queue"
    ? DATA.reviews.filter(r => r.classification === "OPERATIONAL")
    : STATE.reviewTab === "praise"
      ? DATA.reviews.filter(r => r.classification === "PRAISE")
      : DATA.reviews;
  const items = shown.map(r => {
    const op = r.classification === "OPERATIONAL";
    return `<div class="review">
      <div class="who">
        <div class="stars ${r.stars <= 2 ? "low" : "high"}">${"★".repeat(r.stars)}${"·".repeat(5 - r.stars)}</div>
        <div class="name">${esc(r.author)}</div>
        <div class="date">${esc(r.date)}</div>
      </div>
      <div>
        <div class="body-text">${esc(r.text)}</div>
        <div class="flags">
          <span class="chip ${op ? "red" : "gray"}">${r.classification}</span>
          ${r.linked ? `<a class="chip amber" style="text-decoration:none;cursor:pointer" href="#exceptions/${r.linked}">LINKED ${r.linked}</a>` : ""}
          ${op && !r.reply ? `<span class="chip white">NO OWNER REPLY</span>` : ""}
        </div>
        ${r.draft ? `<div class="draft" ${r.reply ? 'style="border-color:color-mix(in oklab, var(--green) 40%, transparent)"' : ""}>
          <div class="k"><span>${r.reply ? "Approved reply · ready to publish from your Google account" : "Draft reply · written by the monitor, published only by your team"}</span>${r.reply ? '<span class="chip green">APPROVED</span>' : ""}</div>
          <p>${esc(r.draft)}</p>
          <div class="actions">
            ${r.reply ? "" : `<button class="btn mini" onclick="approveReply(${DATA.reviews.indexOf(r)})">Approve reply</button>`}
            <button class="btn outline mini" onclick="editDraftSheet(${DATA.reviews.indexOf(r)})">Edit draft</button>
            <button class="btn ghost mini" onclick="toast(tr('Copied', 'Copiado'), tr('Paste it into Google from your own account.', 'Pégala en Google desde su propia cuenta.'))">Copy for Google</button>
          </div>
        </div>` : ""}
      </div>
    </div>`;
  }).join("");

  return `
  ${topbar("Review Signal", `${s.rating} ACROSS ${s.count} REVIEWS · SAMPLE OF 20 CAPTURED AUG 20`)}
  <div class="grid split">
    <div class="panel">
      <div class="tabs" style="margin-bottom:16px">
        <button class="tab ${STATE.reviewTab === "queue" ? "on" : ""}" onclick="STATE.reviewTab='queue';render()">Queue <span class="n">${DATA.reviews.filter(r => r.classification === "OPERATIONAL").length}</span></button>
        <button class="tab ${STATE.reviewTab === "all" ? "on" : ""}" onclick="STATE.reviewTab='all';render()">All <span class="n">${DATA.reviews.length}</span></button>
        <button class="tab ${STATE.reviewTab === "praise" ? "on" : ""}" onclick="STATE.reviewTab='praise';render()">Praise <span class="n">${DATA.reviews.filter(r => r.classification === "PRAISE").length}</span></button>
      </div>
      ${items}
    </div>
    <div class="panel last">
      <div class="ptitle">All-time distribution</div>
      <div class="donutwrap">
        <div id="revdonut"></div>
        <div class="dlegend" id="revdlegend"></div>
      </div>
      <div class="evnote" style="margin-top:16px">${s.count} reviews, ${s.distribution[5]} five-star. In the 20 most recent: ${esc(s.sampleBreakdown)}, and ${esc(s.ownerReplies)}. Both one-star reviews name an operational cause this monitor watches.</div>
      <div class="ptitle" style="margin-top:24px">How classification works</div>
      <div class="evnote">The model reads each new review and answers one question: does it name an operational cause (hours, booking, refunds, staffing)? If yes, it lands in this queue with a draft. It never publishes. Every reply reaches Google from your account, after a person reads it.</div>
    </div>
  </div>
  ${demoNote()}`;
}

function vReport() {
  const ex1 = DATA.exceptions.find(x => x.id === "EX-001");
  const ex4 = DATA.exceptions.find(x => x.id === "EX-004");
  return `
  ${topbar("Morning Report", "ONE EMAIL, EVERY DAY AT 06:30 ET, TO A LIST YOU CHOOSE")}
  <div class="grid"><div class="panel wide">
    <div class="ptitle">Today's report, rendered <span class="hint">exactly what lands in the inbox</span></div>
    <div class="mail">
      <div class="mhead">
        <div class="from">FROM ops@monitor.arqentia.com · TO front-desk@, ops@ · ${fmtDate(DATA.meta.sweepDate).toUpperCase()} 06:30 ET</div>
        <div class="subj">CITY 0 OPS · ${DATA.exceptions.filter(x => x.status === "OPEN").length} open · 1 route failing · 2 new from their own hiring post</div>
      </div>
      <div class="mbody">
        <div class="sect"><div class="k gray">What changed</div>
          <p>City Zero published a hiring post about their Meta accounts. EX-005 (Facebook and Instagram disconnected) and EX-006 (unknown duplicate pages) opened from their own words. All ${DATA.surfaces.length} surfaces read.</p></div>
        <div class="sect"><div class="k red">What broke</div>
          <ul>
            <li><span class="mono">GET /classes-schedule/</span> returned <span class="mono age-red">404</span> again. Linked from the homepage as "View classes". Working page: <span class="mono">/class-schedules/</span>.</li>
          </ul></div>
        <div class="sect"><div class="k amber">Open past threshold (7 days)</div>
          <ul>
            <li>EX-001 Weekend hours disagree · <span class="mono age-red">${ageOf(ex1)} days</span> · site says 3:30 pm, Google says 6 PM · owner unassigned</li>
            <li>EX-004 Event refund terms not visible pre-payment · <span class="mono age-amber">${ageOf(ex4)} days</span> · owner unassigned</li>
          </ul></div>
        <div class="sect"><div class="k gray">Review queue</div>
          <p>2 operational reviews still have no public reply. Drafts are waiting in the dashboard.</p></div>
      </div>
      <div class="mfoot">READ-ONLY MONITOR · REPLY TO THIS EMAIL TO REACH ARQENTIA · IF A QUIET DAY, THIS REPORT IS ONE LINE</div>
    </div>
  </div></div>
  ${demoNote()}`;
}

function vSettings() {
  const owners = DATA.owners.map((o, i) => `
    <tr>
      <td class="t">${esc(o.surface)}</td>
      <td style="color:${o.owner ? "var(--foreground)" : "var(--muted-foreground)"}">${o.owner ? esc(o.owner) : "Unassigned"}</td>
      <td style="color:var(--muted-foreground)">${esc(o.hint)}</td>
      <td class="num"><button class="btn outline mini" onclick="assignSurfaceOwnerDialog(${i})">Assign</button></td>
    </tr>`).join("");
  const th = DATA.thresholds.map((t, i) => `
    <tr>
      <td class="t">${esc(t.name)}</td>
      <td style="width:130px"><input class="input" style="height:30px;font-size:12.5px;font-family:var(--mono)" value="${esc(t.value)}" onchange="saveThreshold(${i}, this.value)"></td>
      <td style="color:var(--muted-foreground)">${esc(t.detail)}</td>
    </tr>`).join("");

  return `
  ${topbar("Owners & Thresholds", "A FINDING WITH NO OWNER AND NO AGE IS A NOTE. WITH BOTH, IT IS A TASK.")}
  <div class="grid half">
    <div class="panel">
      <div class="ptitle">Surface owners <span class="hint">set at kickoff, one per surface type</span></div>
      <div class="tablewrap"><table>
        <thead><tr><th>Surface</th><th>Owner</th><th>Likely today</th><th></th></tr></thead>
        <tbody>${owners}</tbody>
      </table></div>
    </div>
    <div class="panel last">
      <div class="ptitle">Thresholds <span class="hint">proposed defaults · you approve them at kickoff</span></div>
      <div class="tablewrap"><table>
        <thead><tr><th>Rule</th><th>Value</th><th>What it does</th></tr></thead>
        <tbody>${th}</tbody>
      </table></div>
      <div class="evnote" style="margin-top:16px">Owner names are deliberately blank in this demo. Assigning them is a 30-minute kickoff exercise, and it is the single input the monitor cannot discover from outside.</div>
    </div>
  </div>
  ${demoNote()}`;
}

/* ---------- START HERE (internal guide, EN base + ES via i18n) ---------- */

const GUIDE = [
  { group: "Monitor · live", note: "Real captured data from public surfaces (sweeps Aug 20 and Aug 24).",
    ids: ["overview", "exceptions", "surfaces", "routes", "reviews", "report"] },
  { group: "Gym OS · Glofox + BioStar", note: "The centralized read of everything the gym systems ingest: Glofox API + BioStar 2 local API.",
    ids: ["classes", "members", "access"] },
  { group: "Growth", note: "From click to member: landing, pipeline, campaigns. Sample volumes, real design.",
    ids: ["landing", "pipeline", "leads", "campaigns"] },
  { group: "Automation · phase 2", note: "Half real, half concept: the monitor side runs today, the CRM side waits for Discovery.",
    ids: ["workflows", "triggers", "tasks"] },
  { group: "Analytics", note: "Shapes are the real design; every number says if it is REAL or SAMPLE.",
    ids: ["analytics"] },
  { group: "Pulse Metrics · marketing data", note: "Your own Pulse product as the marketing-data layer. The Meta integration is Phase 2 scope.",
    ids: ["pulsereport", "paidmedia", "meta"] },
  { group: "System", note: "The architecture and the trace.",
    ids: ["integrations", "audit", "settings"] },
];
i18nAdd({
  "Real captured data from public surfaces (sweeps Aug 20 and Aug 24).": "Datos reales capturados de superficies públicas (barridos 20 y 24 de agosto).",
  "Concept to sell Phase 2. Sample lead names; real channels, roles, prices and SLAs.": "Concepto para vender la Fase 2. Nombres de leads de muestra; canales, roles, precios y SLAs reales.",
  "Half real, half concept: the monitor side runs today, the CRM side waits for Discovery.": "Mitad real, mitad concepto: lo del monitor ya corre, lo del CRM espera Discovery.",
  "Shapes are the real design; every number says if it is REAL or SAMPLE.": "Las formas son el diseño real; cada número dice si es REAL o SAMPLE.",
  "Your own Pulse product as the marketing-data layer. The Meta integration is Phase 2 scope.": "Tu producto Pulse como capa de datos de marketing. La integración Meta es alcance de Fase 2.",
  "The architecture and the trace.": "La arquitectura y la traza.",
});

const GLOSSARY = [
  { t: "Sweep", d: "The daily 06:00 pass: the monitor reads every public surface and stores exactly what each one published. Two real sweeps exist, Aug 20 and Aug 24; everything else derives from those captures." },
  { t: "Surface", d: "Any public place where City Zero publishes information: cityzero.com, Google Business Profile, the Glofox portal, ClassPass, Wellhub, Instagram, Linktree, and now the Facebook page. The monitor reads what anyone can see; it never logs into anything." },
  { t: "Exception", d: "Two surfaces saying different things about the same fact, with captured evidence. Example: the site says weekends close at 3:30 pm and Google says 6 PM. Not a system error: it is the finding this product sells." },
  { t: "Age", d: "Days since the first public evidence of the problem. EX-001's 85 days count from Matt O's May 31 review, recomputed automatically from the sweep date." },
  { t: "Owner", d: "The person responsible for a surface. UNASSIGNED across the demo on purpose: assigning owners is the 30-minute kickoff exercise, and the one input the monitor cannot discover from outside. You can assign them in Owners & Thresholds and the change persists." },
  { t: "Threshold", d: "The rule for when something counts as overdue. Example: an exception open past 7 days re-raises in every morning report until closed. Editable in Owners & Thresholds." },
  { t: "Trigger", d: "A when-X-do-Y rule. Armed means watching; you can pause the live ones with their switch. P2 DRAFT rules cannot be armed yet: they depend on Discovery answers." },
  { t: "Workflow", d: "A sequence of steps that always ends at a person. The system prepares, notifies and tracks; a human decides and publishes. That boundary holds in every phase." },
  { t: "Draft reply", d: "A review response written by the monitor. It never publishes itself: someone on the team reviews it (you can edit and approve it in Review Signal) and posts it from City Zero's own Google account." },
];
i18nAdd({
  "Sweep": "Barrido", "Surface": "Superficie", "Exception": "Excepción", "Age": "Edad",
  "Owner": "Dueño", "Threshold": "Umbral", "Trigger": "Trigger", "Workflow": "Workflow", "Draft reply": "Borrador de respuesta",
  "The daily 06:00 pass: the monitor reads every public surface and stores exactly what each one published. Two real sweeps exist, Aug 20 and Aug 24; everything else derives from those captures.": "La pasada diaria de las 06:00: el monitor lee cada superficie pública y guarda exactamente lo que publicó. Existen dos barridos reales, 20 y 24 de agosto; todo lo demás se deriva de esas capturas.",
  "Any public place where City Zero publishes information: cityzero.com, Google Business Profile, the Glofox portal, ClassPass, Wellhub, Instagram, Linktree, and now the Facebook page. The monitor reads what anyone can see; it never logs into anything.": "Cualquier lugar público donde City Zero publica información: cityzero.com, Google Business Profile, el portal Glofox, ClassPass, Wellhub, Instagram, Linktree y ahora la página de Facebook. El monitor lee lo que cualquiera ve; nunca inicia sesión en nada.",
  "Two surfaces saying different things about the same fact, with captured evidence. Example: the site says weekends close at 3:30 pm and Google says 6 PM. Not a system error: it is the finding this product sells.": "Dos superficies diciendo cosas distintas sobre el mismo hecho, con evidencia capturada. Ejemplo: el sitio dice que el finde cierran 3:30 pm y Google dice 6 PM. No es un error del sistema: es el hallazgo que este producto vende.",
  "Days since the first public evidence of the problem. EX-001's 85 days count from Matt O's May 31 review, recomputed automatically from the sweep date.": "Días desde la primera evidencia pública del problema. Los 85 días de EX-001 se cuentan desde la reseña de Matt O del 31 de mayo, recalculados automáticamente.",
  "The person responsible for a surface. UNASSIGNED across the demo on purpose: assigning owners is the 30-minute kickoff exercise, and the one input the monitor cannot discover from outside. You can assign them in Owners & Thresholds and the change persists.": "La persona responsable de una superficie. UNASSIGNED en todo el demo a propósito: asignar dueños es el ejercicio de 30 minutos del kickoff, y el único dato que el monitor no puede descubrir desde afuera. Puedes asignarlos en Dueños y Umbrales y el cambio persiste.",
  "The rule for when something counts as overdue. Example: an exception open past 7 days re-raises in every morning report until closed. Editable in Owners & Thresholds.": "La regla de cuándo algo cuenta como vencido. Ejemplo: una excepción abierta más de 7 días se re-eleva en cada reporte matutino hasta cerrarse. Editable en Dueños y Umbrales.",
  "A when-X-do-Y rule. Armed means watching; you can pause the live ones with their switch. P2 DRAFT rules cannot be armed yet: they depend on Discovery answers.": "Una regla cuando-pase-X-haz-Y. Armado significa vigilando; las vivas se pausan con su switch. Las P2 DRAFT no pueden armarse aún: dependen de respuestas de Discovery.",
  "A sequence of steps that always ends at a person. The system prepares, notifies and tracks; a human decides and publishes. That boundary holds in every phase.": "Una secuencia de pasos que siempre termina en una persona. El sistema prepara, notifica y da seguimiento; un humano decide y publica. Esa frontera se mantiene en todas las fases.",
  "A review response written by the monitor. It never publishes itself: someone on the team reviews it (you can edit and approve it in Review Signal) and posts it from City Zero's own Google account.": "Una respuesta a reseña escrita por el monitor. Nunca se publica sola: alguien del equipo la revisa (puedes editarla y aprobarla en Señal de Reseñas) y la publica desde la cuenta de Google de City Zero.",
});

function vStart() {
  const findings = [
    { id: "EX-001", t: "Weekend hours disagree", d: "The site says Saturday and Sunday close at 3:30 pm. Google says 6 PM. A member complained about it on May 31 and both values are still live.", sev: "red", age: ageOf(DATA.exceptions[0]) },
    { id: "EX-002", t: "They don't agree on their class count", d: "The homepage says “40+ classes”. The About page says “35 classes”. Same marketing sentence, two numbers, both live.", sev: "amber", age: ageOf(DATA.exceptions[1]) },
    { id: "EX-003", t: "The footer publishes someone else's contacts", d: "The footer emails and phone belong to Kropp/Qode Interactive, the template the site was built from. Whoever writes there is not writing to City Zero.", sev: "amber", age: ageOf(DATA.exceptions[2]) },
    { id: "EX-004", t: "The homepage class button errors", d: "“View classes” points to a page that returns 404. The right page exists under another name. The highest-intent visitor is the one who crashes.", sev: "amber", age: null },
    { id: "EX-005", t: "Facebook and Instagram disconnected", d: "They wrote it themselves in a hiring post: the Business Suite link broke and the approval request is lost. They are hiring someone to fix it.", sev: "red", age: null },
    { id: "EX-006", t: "Phantom Facebook pages", d: "“There are a few Facebook Pages for City Zero we don't know who created.” The owner problem at platform scale, told by them. See Meta Health.", sev: "red", age: null },
  ];
  i18nAdd({
    "Weekend hours disagree": "El horario del finde no coincide",
    "The site says Saturday and Sunday close at 3:30 pm. Google says 6 PM. A member complained about it on May 31 and both values are still live.": "El sitio dice que sábado y domingo cierran a las 3:30 pm. Google dice 6 PM. Un miembro se quejó el 31 de mayo y ambos valores siguen publicados.",
    "They don't agree on their class count": "No saben cuántas clases ofrecen",
    "The homepage says “40+ classes”. The About page says “35 classes”. Same marketing sentence, two numbers, both live.": "El home dice “40+ classes”. La página About dice “35 classes”. La misma frase, dos números, ambas en vivo.",
    "The footer publishes someone else's contacts": "El footer publica contactos ajenos",
    "The footer emails and phone belong to Kropp/Qode Interactive, the template the site was built from. Whoever writes there is not writing to City Zero.": "Los emails y el teléfono del footer son de Kropp/Qode Interactive, la plantilla con la que armaron el sitio. Quien escriba ahí no le escribe a City Zero.",
    "The homepage class button errors": "El botón de clases del home da error",
    "“View classes” points to a page that returns 404. The right page exists under another name. The highest-intent visitor is the one who crashes.": "“View classes” apunta a una página que devuelve 404. La página buena existe con otro nombre. El visitante con más intención es el que se estrella.",
    "Facebook and Instagram disconnected": "Facebook e Instagram desconectados",
    "They wrote it themselves in a hiring post: the Business Suite link broke and the approval request is lost. They are hiring someone to fix it.": "Ellos mismos lo escribieron en un post de contratación: el enlace de Business Suite se rompió y la solicitud de aprobación está perdida. Están contratando a quien lo arregle.",
    "Phantom Facebook pages": "Páginas de Facebook fantasma",
    "“There are a few Facebook Pages for City Zero we don't know who created.” The owner problem at platform scale, told by them. See Meta Health.": "“Hay varias páginas de City Zero que no sabemos quién creó.” El problema de dueños a escala de plataforma, contado por ellos. Ver Salud Meta.",
  });

  const findingCards = findings.map(f => `
    <div class="mcard" style="gap:12px;cursor:pointer" onclick="location.hash='${f.id === "EX-004" ? "routes" : `exceptions/${f.id}`}'">
      <div class="mhead2"><span class="mic ${f.sev}">${I.alert}</span><span class="mono" style="font-size:11px">${f.id === "EX-004" ? "ROUTE 404" : f.id}</span>${f.age ? `<span class="chip ${f.sev}" style="margin-left:auto">${f.age} days</span>` : ""}</div>
      <div style="font-weight:600;font-size:14px;line-height:1.35">${f.t}</div>
      <p style="font-size:12.5px;color:var(--muted-foreground);line-height:1.5">${f.d}</p>
    </div>`).join("");

  const mapa = GUIDE.map(g => `
    <div class="panel" style="margin-bottom:16px">
      <div class="ptitle">${g.group} <span class="hint">${g.note}</span></div>
      <div class="tablewrap"><table>
        <thead><tr><th style="width:150px">Section</th><th>What it shows</th><th style="width:90px"></th></tr></thead>
        <tbody>${g.ids.map(id => `
          <tr>
            <td class="t">${SECTIONS.find(x => x.id === id)?.label || id}</td>
            <td style="color:var(--muted-foreground)">${SECTION_DESC[id] || ""}</td>
            <td class="num"><button class="btn outline xs" onclick="location.hash='${id}'">Open</button></td>
          </tr>`).join("")}</tbody>
      </table></div>
    </div>`).join("");

  const gloss = GLOSSARY.map((g, i) => `
    <div class="accitem ${i === 0 ? "open" : ""}">
      <button class="acctrig" onclick="toggleAcc(this)"><span>${g.t}</span>${I.chevD}</button>
      <div class="accbody"><div>${g.d}</div></div>
    </div>`).join("");

  const files = [
    { f: "data.js", que: "All the data: exceptions, reviews, routes, hours, leads, workflows, triggers, tasks, Pulse blocks, audit log", ej: "Change a price, add a lead, fix a date" },
    { f: "app.js", que: "All screens (vOverview, vExceptions, vStart...) and every interface text", ej: "Change a title, drop a column, reorder a section" },
    { f: "styles.css", que: "The full shadcn design system: tokens in :root, radius, every component", ej: "Change the background, radius or a status color" },
    { f: "i18n.js", que: "The EN base plus the Spanish dictionary and the language toggle", ej: "Add or fix a translation" },
    { f: "charts.js + animations.js", que: "The two chart engines and the anime.js motion pass", ej: "Change series colors, easing or stagger" },
    { f: "components.js", que: "Behaviors and persistence: dialog, sheet, Ctrl+K, toasts, switches, localStorage state", ej: "Add a Ctrl+K command or a toast" },
  ];
  i18nAdd({
    "All the data: exceptions, reviews, routes, hours, leads, workflows, triggers, tasks, Pulse blocks, audit log": "Todos los datos: excepciones, reseñas, rutas, horarios, leads, workflows, triggers, tareas, bloques Pulse, bitácora",
    "Change a price, add a lead, fix a date": "Cambiar un precio, agregar un lead, corregir una fecha",
    "All screens (vOverview, vExceptions, vStart...) and every interface text": "Todas las pantallas (vOverview, vExceptions, vStart...) y cada texto de la interfaz",
    "Change a title, drop a column, reorder a section": "Cambiar un título, quitar una columna, reordenar una sección",
    "The full shadcn design system: tokens in :root, radius, every component": "El design system shadcn completo: tokens en :root, radius, cada componente",
    "Change the background, radius or a status color": "Cambiar el fondo, el radius o un color de estado",
    "The EN base plus the Spanish dictionary and the language toggle": "La base EN más el diccionario en español y el toggle de idioma",
    "Add or fix a translation": "Agregar o corregir una traducción",
    "The two chart engines and the anime.js motion pass": "Los dos motores de gráficos y el pase de motion con anime.js",
    "Change series colors, easing or stagger": "Cambiar colores de serie, easing o stagger",
    "Behaviors and persistence: dialog, sheet, Ctrl+K, toasts, switches, localStorage state": "Comportamientos y persistencia: dialog, sheet, Ctrl+K, toasts, switches, estado en localStorage",
    "Add a Ctrl+K command or a toast": "Agregar un comando al Ctrl+K o un toast",
  });
  const fileRows = files.map(x => `
    <tr>
      <td class="mono" style="white-space:nowrap;color:var(--foreground)">${x.f}</td>
      <td style="color:var(--muted-foreground)">${x.que}</td>
      <td style="color:var(--muted-foreground)">${x.ej}</td>
    </tr>`).join("");

  const story = [
    ["1.", "City Zero publishes its information on ", "8 public surfaces", ": its site, Google, the booking portal (Glofox), ClassPass, Wellhub, Instagram, Linktree and Facebook."],
    ["2.", "Today those surfaces ", "contradict each other", ": different hours, different class counts, a broken homepage link, someone else's contacts in the footer, and a Facebook page disconnected from Instagram. Nobody at City Zero finds out until a customer complains."],
    ["3.", "This dashboard is ", "the product Arqentia proposes", " (Phase 1 of the proposal, $9,400): a monitor that reads those surfaces every morning, detects when they stop agreeing, and gives every problem evidence, an age in days and an owner."],
    ["4.", "The ", "Monitor", " group runs on real captured data. ", "CRM, Automation, Analytics and Pulse Metrics", " are the Phase 2 vision with sample data marked, to show how far the platform grows."],
  ];
  i18nAdd({
    "City Zero publishes its information on ": "City Zero publica su información en ",
    "8 public surfaces": "8 superficies públicas",
    ": its site, Google, the booking portal (Glofox), ClassPass, Wellhub, Instagram, Linktree and Facebook.": ": su sitio, Google, el portal de reservas (Glofox), ClassPass, Wellhub, Instagram, Linktree y Facebook.",
    "Today those surfaces ": "Hoy esas superficies ",
    "contradict each other": "se contradicen",
    ": different hours, different class counts, a broken homepage link, someone else's contacts in the footer, and a Facebook page disconnected from Instagram. Nobody at City Zero finds out until a customer complains.": ": horarios distintos, número de clases distinto, un link roto en el home, contactos ajenos en el footer y una página de Facebook desconectada de Instagram. Nadie en City Zero se entera hasta que un cliente se queja.",
    "This dashboard is ": "Este dashboard es ",
    "the product Arqentia proposes": "el producto que Arqentia les propone",
    " (Phase 1 of the proposal, $9,400): a monitor that reads those surfaces every morning, detects when they stop agreeing, and gives every problem evidence, an age in days and an owner.": " (Fase 1 de la propuesta, $9,400): un monitor que lee esas superficies cada mañana, detecta cuando dejan de coincidir y le pone a cada problema evidencia, edad en días y un responsable.",
    "The ": "El grupo ", "Monitor": "Monitor",
    " group runs on real captured data. ": " corre con datos reales capturados. ",
    "CRM, Automation, Analytics and Pulse Metrics": "CRM, Automatización, Analítica y Pulse Metrics",
    " are the Phase 2 vision with sample data marked, to show how far the platform grows.": " son la visión de Fase 2 con datos de muestra marcados, para enseñar hasta dónde crece la plataforma.",
    "The real problems the monitor found": "Los problemas reales que el monitor encontró",
    "click any card for its evidence · the two Meta ones come from a City Zero post": "clic en cualquiera para ver su evidencia · los dos de Meta salieron de un post de City Zero",
    "Captured from public surfaces in the Aug 20 and Aug 24 sweeps. Nothing invented, nothing retouched.": "Capturado de superficies públicas en los barridos del 20 y 24 de agosto. Nada inventado, nada retocado.",
    "Sample data to demonstrate Phase 2: lead names, volumes, plan mix. Always labeled.": "Datos de muestra para enseñar la Fase 2: nombres de leads, volúmenes, mix de planes. Siempre marcado.",
    "The whole section is Phase 2 concept: sold with the proposal, built after Discovery.": "La sección entera es concepto de Fase 2: se vende con la propuesta, se construye tras Discovery.",
    "Red = hurting members now. Amber = watch. Green = in order or an armed rule. Age is days since first evidence.": "Rojo = afecta a miembros ya. Ámbar = vigilar. Verde = en orden o regla armada. La edad son días desde la primera evidencia.",
    "No build, no dependencies: edit a file, save, refresh the browser. To run it:": "Sin build ni dependencias: editas un archivo, guardas y refrescas el navegador. Para correrlo:",
    "inside": "dentro de",
    "Shortcuts:": "Atajos:",
    "opens the command palette ·": "abre el buscador de comandos ·",
    "in the URL measures overflows ·": "en la URL mide overflows ·",
    "opens each overlay. The fastest way to change something: ask me and I tell you exactly which file I touch.": "abre cada overlay. La forma más rápida de cambiar algo: pídemelo y te digo exactamente qué archivo toco.",
  });

  return `
  <div class="inner">
    <div class="ovhead" style="margin-bottom:24px">
      <div>
        <h1 class="greet" style="font-style:normal">What you are looking at, and how to change it</h1>
        <div class="greetsub"><span class="chip amber">INTERNAL · this section is not shown to the prospect</span></div>
      </div>
      <button class="btn" onclick="location.hash='overview'">Go to dashboard ${I.chevR.replace("<svg", "<svg class='bicon'")}</button>
    </div>

    <div class="ovsec">
      <div class="panel wide">
        <div class="ptitle">Two modes (memo Carlos 26.08) <span class="hint">pantalla / reporte / motor</span></div>
        <p style="font-size:13px;color:var(--muted-foreground);line-height:1.6">
          <b style="color:var(--foreground)">Pitch mode</b> is what the prospect sees and the DEFAULT: 4 sections only
          (Today, Monthly Report, Morning Email, The Engine), opening on the owner's screen with the three numbers and
          this week's decisions. <b style="color:var(--foreground)">Internal mode</b> (this one) is the full 20-section build.
          Switch from the Ctrl+K palette ("Pitch mode / Internal mode") or with <span class="mono">?full=1</span> /
          <span class="mono">?full=0</span> in the URL. The rule that decides what lives on the pitch screen:
          every element answers a decision the owner takes this week; depth goes to the monthly report; the rest runs in the engine.
        </p>
      </div>
    </div>

    <div class="ovsec">
      <div class="panel" style="max-width:900px">
        <div class="ptitle">The story in four sentences</div>
        <div style="display:grid;gap:10px;font-size:14px;line-height:1.6;max-width:75ch">
          ${story.map(sn => `<p><b style="color:var(--foreground)">${sn[0]}</b> ${sn.slice(1).map((part, i) => i % 2 ? `<b>${part}</b>` : part).join("")}</p>`).join("")}
        </div>
      </div>
    </div>

    <div class="ovsec">
      <div class="ptitle">The real problems the monitor found <span class="hint">click any card for its evidence · the two Meta ones come from a City Zero post</span></div>
      <div class="mgrid" style="grid-template-columns:repeat(3,1fr)">${findingCards}</div>
    </div>

    <div class="ovsec">
      <div class="ptitle">How to read the labels</div>
      <div class="mgrid">
        <div class="mcard" style="gap:10px"><span class="chip white" style="width:fit-content">REAL</span><p style="font-size:12.5px;color:var(--muted-foreground)">Captured from public surfaces in the Aug 20 and Aug 24 sweeps. Nothing invented, nothing retouched.</p></div>
        <div class="mcard" style="gap:10px"><span class="chip gray" style="width:fit-content">SAMPLE</span><p style="font-size:12.5px;color:var(--muted-foreground)">Sample data to demonstrate Phase 2: lead names, volumes, plan mix. Always labeled.</p></div>
        <div class="mcard" style="gap:10px"><span class="chip amber" style="width:fit-content">PHASE 2 · CONCEPT</span><p style="font-size:12.5px;color:var(--muted-foreground)">The whole section is Phase 2 concept: sold with the proposal, built after Discovery.</p></div>
        <div class="mcard" style="gap:10px"><div style="display:flex;gap:6px"><span class="chip red">85 days</span><span class="chip green">ARMED</span></div><p style="font-size:12.5px;color:var(--muted-foreground)">Red = hurting members now. Amber = watch. Green = in order or an armed rule. Age is days since first evidence.</p></div>
      </div>
    </div>

    <div class="ovsec">
      <div class="ptitle">The complete map, section by section</div>
      ${mapa}
    </div>

    <div class="ovsec twocol">
      <div class="panel">
        <div class="ptitle">Glossary <span class="hint">the terms the dashboard uses</span></div>
        <div class="acc">${gloss}</div>
      </div>
      <div class="panel">
        <div class="ptitle">How to make changes</div>
        <p style="font-size:13px;color:var(--muted-foreground);margin-bottom:12px">No build, no dependencies: edit a file, save, refresh the browser. To run it: <span class="kbd">python -m http.server 4780</span> inside <span class="mono">dashboard-demo/</span>.</p>
        <div class="tablewrap"><table>
          <thead><tr><th>File</th><th>What it controls</th><th>Example change</th></tr></thead>
          <tbody>${fileRows}</tbody>
        </table></div>
        <hr class="separator">
        <p style="font-size:13px;color:var(--muted-foreground)">Shortcuts: <span class="kbd">Ctrl K</span> opens the command palette · <span class="mono">?debug=1</span> in the URL measures overflows · <span class="mono">?open=cmdk|dialog|sheet</span> opens each overlay. The fastest way to change something: ask me and I tell you exactly which file I touch.</p>
      </div>
    </div>
  </div>
  ${demoNote()}`;
}

/* ---------- CRM ---------- */

function vPipeline() {
  const p = DATA.pipeline;
  const live = JSON.parse(localStorage.getItem("c0.leads") || "[]");
  live.forEach(l => {
    if (!p.cards.some(c => c.name === l.name && c.landing)) {
      p.cards.unshift({ name: l.name, source: "Landing page - tour form", landing: true, stage: STATE.stages[l.name] || "new", days: 0, owner: "Front desk", next: "Confirm tour slot by text" });
    }
  });
  const breaches = p.cards.filter(c => c.breach).length;
  const cols = p.stages.map(st => {
    const cards = p.cards.filter(c => c.stage === st.key).map(c => `
      <div class="kcard click${c.breach ? " breach" : ""}" onclick="openLead('${c.name.replace(/'/g, "\\'")}')" data-tip="${tr("Open lead: notes, status, sequences", "Abrir lead: notas, estado, secuencias")}">
        <div class="kname"><span class="avatar sm">${esc(c.name.split(" ").map(w => w[0]).join("").slice(0, 2))}</span>${esc(c.name)}</div>
        <div class="ksrc">${esc(c.source)}${c.landing ? ' <span class="chip green" style="font-size:9px;padding:1px 6px;vertical-align:1px">LIVE</span>' : ""}${c.paid ? ' <span class="chip green" style="font-size:9px;padding:1px 6px;vertical-align:1px">PULSE</span>' : ""}</div>
        <div class="knext${c.breach ? " bad" : ""}">${esc(c.next)}</div>
        <div class="kmeta"><span>${esc(c.owner)}</span><span style="display:inline-flex;align-items:center;gap:8px"><span class="mono">${c.days}d</span>${c.stage !== "member" ? `<button class="btn ghost xs" style="height:20px;padding:0 6px" data-tip="Advance to next stage" onclick="event.stopPropagation();advanceLead('${c.name.replace(/'/g, "\\'")}')">${I.chevR.replace("<svg", "<svg style='width:12px;height:12px'")}</button>` : ""}</span></div>
      </div>`).join("");
    const n = p.cards.filter(c => c.stage === st.key).length;
    return `<div class="kcol">
      <div class="khead"><span>${esc(st.label)}</span><span class="mono">${n}</span></div>
      <div class="ksla">${esc(st.sla)}</div>
      ${cards}
    </div>`;
  }).join("");

  return `
  ${topbar("Pipeline", "EVERY LEAD, ONE BOARD, AN OWNER AND A CLOCK ON EACH", p2chip())}
  <div class="metrics">
    <div class="metric"><div class="k">Leads on board</div><div class="v">${p.cards.length}</div><div class="s">Sample volume</div></div>
    <div class="metric"><div class="k">SLA breaches</div><div class="v red">${breaches}</div><div class="s">Idle past 48h in New</div></div>
    <div class="metric"><div class="k">Stages</div><div class="v">${p.stages.length}</div><div class="s">New to Member, each with its own SLA</div></div>
    <div class="metric"><div class="k">Channels feeding in</div><div class="v">${DATA.leadChannels.length}</div><div class="s">All real: see Lead Channels</div></div>
  </div>
  <div class="grid"><div class="panel wide">
    <div class="ptitle">Board <span class="hint">names and volumes are sample; stages, SLAs, channels and roles are the real design</span></div>
    <div class="kanban">${cols}</div>
  </div></div>
  ${demoNote()}`;
}

function vLeads() {
  const rows = DATA.leadChannels.map(c => `
    <tr>
      <td class="t">${esc(c.channel)}</td>
      <td>${c.real ? '<span class="chip green">REAL CHANNEL</span>' : '<span class="chip gray">SAMPLE</span>'}</td>
      <td style="color:var(--dim)">${esc(c.evidence)}</td>
    </tr>`).join("");
  return `
  ${topbar("Lead Channels", "WHERE A CITY ZERO LEAD CAN COME FROM TODAY", p2chip())}
  <div class="grid split">
    <div class="panel">
      <div class="ptitle">Channels <span class="hint">every channel verified on public surfaces</span></div>
      <div class="tablewrap"><table>
        <thead><tr><th>Channel</th><th>Status</th><th>Public evidence</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </div>
    <div class="panel last">
      <div class="ptitle">The question CRM answers</div>
      <div class="evnote" style="margin-top:0">The Fitness Sales Associate job post requires follow-up by calls, texts, emails and meetings. That is direct public evidence of a multichannel sales process. <strong style="color:var(--white)">What no public surface shows is which system records those touches</strong>, and that is Discovery question 3.</div>
      <div class="ptitle" style="margin-top:22px">What Phase 2 adds</div>
      <div class="evnote">One lead record per person regardless of channel, an owner by channel, an SLA timer from first contact, and the journey report: where leads stop between form, call, tour, trial and membership.</div>
    </div>
  </div>
  ${demoNote()}`;
}

function vMembers() {
  const m = DATA.members;
  const mix = m.planMix.map(x => `
    <div class="drow">
      <div class="lab" style="width:auto">${esc(x.plan)}</div>
      <div class="track"><div class="fill" style="width:${x.pct}%"></div></div>
      <div class="val">${x.pct}%</div>
    </div>`).join("");
  const rows = m.rows.map(r => `
    <tr>
      <td class="t" style="display:flex;align-items:center;gap:10px"><span class="avatar sm">${esc(r.name.split(" ").map(w => w[0]).join("").slice(0, 2))}</span>${esc(r.name)}</td>
      <td class="mono">${esc(r.plan)}</td>
      <td class="mono" style="color:var(--dim)">${esc(r.since)}</td>
      <td>${r.status === "active" ? '<span class="chip green">ACTIVE</span>' : '<span class="chip amber">FROZEN</span>'}</td>
      <td style="color:${r.risk ? "var(--amber)" : "var(--dim)"}">${r.risk ? esc(r.risk) : "-"}</td>
    </tr>`).join("");
  return `
  ${topbar("Members", "PLAN MIX, STATUS AND RISK FLAGS", p2chip())}
  <div class="grid split">
    <div class="panel">
      <div class="ptitle">Member list <span class="hint">sample rows · real list needs Glofox export</span></div>
      <div class="tablewrap"><table>
        <thead><tr><th>Member</th><th>Plan</th><th>Since</th><th>Status</th><th>Risk flag</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </div>
    <div class="panel last">
      <div class="ptitle">Plan mix <span class="hint">plans and prices real · mix sample</span></div>
      <div class="dist" style="grid-template-columns:1fr">${mix.replace(/class="drow"/g, 'class="drow" style="grid-template-columns:150px 1fr 44px"')}</div>
      <div class="evnote" style="margin-top:16px">${esc(m.note)}</div>
    </div>
  </div>
  ${demoNote()}`;
}

/* ---------- AUTOMATION ---------- */

function vWorkflows(selName) {
  const sel = DATA.workflows.find(w => w.name === decodeURIComponent(selName || "")) || DATA.workflows[1];
  const rows = DATA.workflows.map(w => `
    <tr onclick="location.hash='workflows/${encodeURIComponent(w.name)}'" style="cursor:pointer" class="${w.name === sel.name ? "selrow" : ""}">
      <td><div class="t">${esc(w.name)}</div><div class="d">${esc(w.trigger)}</div></td>
      <td>${w.phase === 1 ? '<span class="chip green">LIVE P1</span>' : '<span class="chip amber">DRAFT P2</span>'}</td>
      <td class="num">${w.runs30 ?? "-"}</td>
      <td class="num" style="color:var(--dim)">${w.lastRun ?? "-"}</td>
    </tr>`).join("");
  const steps = sel.steps.map((s, i) => `<li><span class="when">STEP ${String(i + 1).padStart(2, "0")}</span>${esc(s)}</li>`).join("");
  return `
  ${topbar("Workflows", "3 LIVE IN THE MONITOR · 4 DRAFTED FOR PHASE 2", p2chip())}
  <div class="grid split">
    <div class="panel">
      <div class="ptitle">All workflows <span class="hint">click one to see its anatomy</span></div>
      <div class="tablewrap"><table>
        <thead><tr><th>Workflow</th><th>Status</th><th style="text-align:right">Runs 30d</th><th style="text-align:right">Last run</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </div>
    <div class="panel last">
      <div class="ptitle">Anatomy</div>
      <h3 style="color:var(--white);font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.03em">${esc(sel.name)}</h3>
      <div class="meta-row" style="margin:10px 0 16px">
        ${sel.phase === 1 ? '<span class="chip green">LIVE IN PHASE 1</span>' : '<span class="chip amber">PHASE 2 DRAFT</span>'}
        <span class="chip gray">OWNER ${esc(sel.owner).toUpperCase()}</span>
      </div>
      <div class="evnote" style="margin:0 0 14px">Trigger: ${esc(sel.trigger)}.</div>
      <div class="acc">${sel.steps.map((st, i) => `
        <div class="accitem ${i === 0 ? "open" : ""}">
          <button class="acctrig" onclick="toggleAcc(this)"><span>Step ${String(i + 1).padStart(2, "0")} · ${esc(st)}</span>${I.chevD}</button>
          <div class="accbody"><div>${i === sel.steps.length - 1
            ? "Final step. The workflow closes here and the outcome lands in the audit log."
            : "Runs automatically, then hands to the next step. A person can intervene at any point."}</div></div>
        </div>`).join("")}</div>
      <div class="evnote">Every workflow ends at a person. The system prepares, notifies and tracks; a human decides and publishes. That boundary holds in every phase.</div>
    </div>
  </div>
  ${demoNote()}`;
}

function vTriggers() {
  const rows = DATA.triggers.map((t, i) => `
    <tr>
      <td><div class="t">${esc(t.when)}</div><div class="d">If ${esc(t.cond)}</div></td>
      <td>${esc(t.then)}</td>
      <td>${t.phase === 1
        ? `<span style="display:inline-flex;align-items:center;gap:8px"><button class="switch" role="switch" aria-checked="${t.armed}" onclick="toggleTrigger(${i}, this)"><span class="thumb"></span></button><span class="chip ${t.armed ? "green" : "gray"}">${t.armed ? "ARMED" : "PAUSED"}</span></span>`
        : `<span style="display:inline-flex;align-items:center;gap:8px"><button class="switch" role="switch" aria-checked="false" disabled data-tip="Drafted for Phase 2. Arming it needs Discovery: lead system of record, Glofox edition, event volumes."><span class="thumb"></span></button><span class="chip amber">P2 DRAFT</span></span>`}</td>
      <td class="num">${t.fires30 ?? "-"}</td>
      <td class="num text-muted">${t.lastFired ?? "-"}</td>
    </tr>`).join("");
  const armed = DATA.triggers.filter(t => t.armed).length;
  return `
  ${topbar("Triggers", "WHEN THIS HAPPENS, DO THAT. NOTHING FIRES SILENTLY.", p2chip())}
  <div class="metrics">
    <div class="metric"><div class="k">Armed now</div><div class="v">${armed}</div><div class="s">All five are the live monitor rules</div></div>
    <div class="metric"><div class="k">Drafted for Phase 2</div><div class="v">${DATA.triggers.length - armed}</div><div class="s">CRM and events, pending Discovery</div></div>
    <div class="metric"><div class="k">Fired last 30 days</div><div class="v">${DATA.triggers.reduce((a, t) => a + (t.fires30 || 0), 0)}</div><div class="s">Real counts from the two sweeps</div></div>
  </div>
  <div class="grid"><div class="panel wide">
    <div class="ptitle">All triggers</div>
    <div class="tablewrap"><table>
      <thead><tr><th>When</th><th>Then</th><th>State</th><th style="text-align:right">Fires 30d</th><th style="text-align:right">Last fired</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </div></div>
  ${demoNote()}`;
}

function vTasks() {
  const real = DATA.tasks.filter(t => t.real);
  const sample = DATA.tasks.filter(t => !t.real);
  const row = t => {
    const i = DATA.tasks.indexOf(t);
    const done = STATE.tasksDone.has(i);
    return `
    <tr class="${done ? "taskdone" : ""}">
      <td style="width:34px"><button class="cbx" role="checkbox" aria-checked="${done}" onclick="toggleTask(${i}, this)">${I.check}</button></td>
      <td><div class="t">${esc(t.title)}</div><div class="d">From ${esc(t.src)}</div></td>
      <td>${esc(t.assignee)}</td>
      <td class="mono">${esc(t.due)}</td>
      <td>${t.real ? '<span class="chip white">REAL</span>' : '<span class="chip gray">SAMPLE</span>'}</td>
    </tr>`;
  };
  const doneCount = STATE.tasksDone.size;
  return `
  ${topbar("Tasks", `${real.length} REAL FROM THE MONITOR · ${sample.length} SAMPLE FROM CRM`, p2chip())}
  <div class="grid"><div class="panel wide">
    <div class="ptitle">Queue <span class="hint">the six real ones exist today, no platform needed to start them</span></div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      <div class="progress" style="max-width:280px"><div class="bar" style="width:${Math.round(doneCount / DATA.tasks.length * 100)}%"></div></div>
      <span class="mono text-muted">${doneCount}/${DATA.tasks.length} done</span>
    </div>
    <div class="tablewrap"><table>
      <thead><tr><th></th><th>Task</th><th>Assignee</th><th>Due</th><th>Origin</th></tr></thead>
      <tbody>${real.map(row).join("")}${sample.map(row).join("")}</tbody>
    </table></div>
  </div></div>
  ${demoNote()}`;
}

/* ---------- PULSE METRICS: META HEALTH ---------- */

function vMeta() {
  const pl = DATA.pulse;
  const ex5 = DATA.exceptions.find(x => x.id === "EX-005");
  const ex6 = DATA.exceptions.find(x => x.id === "EX-006");
  const metaTasks = DATA.tasks.filter(t => t.kind === "meta");

  const exCard = x => `
    <div class="mcard" style="gap:12px;cursor:pointer" onclick="location.hash='exceptions/${x.id}'">
      <div class="mhead2"><span class="mic red">${I.alert}</span><span class="mono" style="font-size:11px">${x.id}</span><span class="chip red" style="margin-left:auto">OPEN</span></div>
      <div style="font-weight:600;font-size:14px;line-height:1.35">${esc(x.title)}</div>
      <p style="font-size:12.5px;color:var(--muted-foreground);line-height:1.5">${esc(x.valueA.value)}</p>
    </div>`;

  return `
  ${topbar("Meta Health", `<span class="pulse-mark">● PULSE · METRICS</span> by Arqentia · independent marketing data, on City Zero's side`, `<span class="chip amber">NEW INTEGRATION · PHASE 2 SCOPE</span>`)}

  <div class="metrics">
    <div class="metric"><div class="k">FB ↔ IG link state</div><div class="v red">${pl.linkState.state}</div>
      <div class="s">${esc(pl.linkState.since)}</div></div>
    <div class="metric"><div class="k">Pages carrying the brand</div><div class="v">1<span class="unit">+ ${esc(pl.pageInventory.unknown)} unknown</span></div>
      <div class="s">${esc(pl.pageInventory.evidence)}</div></div>
    <div class="metric"><div class="k">Instagram audience</div><div class="v">${pl.igReal.followers.toLocaleString("en-US")}</div>
      <div class="s">REAL · the asset at risk while the link is down</div></div>
    <div class="metric"><div class="k">Engagement medians</div><div class="v">${pl.igReal.medianLikes}<span class="unit">likes · ${pl.igReal.medianComments} com · ${(pl.igReal.medianVideoViews / 1000).toFixed(1)}k views</span></div>
      <div class="s">REAL · ${esc(pl.igReal.sample)}</div></div>
  </div>

  <div class="grid split">
    <div class="panel">
      <div class="ptitle">The evidence, in their own words <span class="hint">hiring post published by City Zero · captured 2026-08-24</span></div>
      <div class="mail" style="max-width:none">
        <div class="mhead">
          <div class="from">CITY ZERO · PUBLIC JOB POST · CAPTURED 2026-08-24</div>
          <div class="subj">Looking for a Facebook/Meta specialist</div>
        </div>
        <div class="mbody"><p style="font-size:13.5px;line-height:1.65;color:color-mix(in oklab, var(--foreground) 88%, transparent)">${esc(pl.jobPost)}</p></div>
        <div class="mfoot">VERBATIM · THE KEY LINE: “WE DON’T KNOW WHO CREATED” THE OTHER PAGES</div>
      </div>
      <div class="mgrid" style="grid-template-columns:1fr 1fr;margin-top:16px">
        ${exCard(ex5)}${exCard(ex6)}
      </div>
      <div class="alert" style="margin-top:16px">${I.sparkles}<div class="atitle">This cleanup is step 0 of Paid Media</div><div class="adesc">They asked for a Meta specialist; the need behind it is a media buyer. Once the plumbing is fixed, <a href="#paidmedia" style="color:var(--foreground)">Paid Media</a> shows how Arqentia runs their ads instrumented by Pulse.</div></div>
    </div>

    <div class="panel">
      <div class="ptitle">What the Pulse engine adds</div>
      <div class="evnote" style="margin-top:0">${esc(pl.moat)}</div>
      <hr class="separator">
      <div class="ptitle" style="font-size:13px">The watch, once connected</div>
      <div class="acc">
        <div class="accitem open">
          <button class="acctrig" onclick="toggleAcc(this)"><span>Link-state watch</span>${I.chevD}</button>
          <div class="accbody"><div>Reads the FB↔IG connection state daily. A silent disconnect opens an exception the same morning, with the date it broke, instead of surfacing weeks later through a hiring post.</div></div>
        </div>
        <div class="accitem">
          <button class="acctrig" onclick="toggleAcc(this)"><span>Page inventory</span>${I.chevD}</button>
          <div class="accbody"><div>Keeps the list of every Facebook page carrying the brand, with admins documented. Any page the inventory has not seen before opens an exception with the link and creation evidence.</div></div>
        </div>
        <div class="accitem">
          <button class="acctrig" onclick="toggleAcc(this)"><span>Audience pulse</span>${I.chevD}</button>
          <div class="accbody"><div>Follower and engagement baselines per surface, so a drop reads as a dated event and not a feeling. The Instagram numbers on this page are the real captured baseline.</div></div>
        </div>
      </div>
      <hr class="separator">
      <div class="evnote">${esc(pl.scope)} Pulse Metrics today crosses ${pl.todayIntegrations.join(", ")} for ecommerce; this module reuses that independent-layer engine for City Zero's Meta surfaces.</div>
    </div>
  </div>

  <div class="grid"><div class="panel wide">
    <div class="ptitle">The cleanup, in order <span class="hint">the same scope their post asks for · all real tasks, also in the Tasks queue</span></div>
    <div class="tablewrap"><table>
      <thead><tr><th style="width:44%">Task</th><th>Assignee</th><th>Why this order</th></tr></thead>
      <tbody>
        <tr><td><div class="t">${esc(metaTasks[0].title)}</div><div class="d">From ${esc(metaTasks[0].src)}</div></td><td>${esc(metaTasks[0].assignee)}</td><td style="color:var(--muted-foreground)">Unknown pages may be interfering with the connection, their own hypothesis. Inventory first, then touch the link.</td></tr>
        <tr><td><div class="t">${esc(metaTasks[1].title)}</div><div class="d">From ${esc(metaTasks[1].src)}</div></td><td>${esc(metaTasks[1].assignee)}</td><td style="color:var(--muted-foreground)">The lost approval request blocks every reconnect attempt from either side.</td></tr>
        <tr><td><div class="t">${esc(metaTasks[2].title)}</div><div class="d">From ${esc(metaTasks[2].src)}</div></td><td>${esc(metaTasks[2].assignee)}</td><td style="color:var(--muted-foreground)">So this cannot happen silently again: every Meta asset with a named admin, watched by the monitor.</td></tr>
      </tbody>
    </table></div>
  </div></div>
  ${demoNote()}`;
}


/* ---------- GYM OS: CLASSES (Glofox API) ---------- */

function vClasses() {
  const C = DATA.classes;
  const allSlots = C.grid.flatMap((r, ri) => r.slots.map((v, i) => ({ v, cap: C.list[ri].cap })));
  const fill = Math.round(allSlots.reduce((a, x) => a + x.v / x.cap, 0) / allSlots.length * 100);
  const waitTotal = C.grid.reduce((a, r) => a + (r.wait || []).reduce((x, y) => x + y, 0), 0);
  const under = allSlots.filter(x => x.v / x.cap < 0.6).length;

  /* week instances: live from the pipeline, or composed from the static schedule */
  let week = C.week && C.week.length ? C.week : null;
  if (!week) {
    const capBy = {}, coachBy = {}, slotBy = {};
    C.list.forEach(c => { capBy[c.name] = c.cap; coachBy[c.name] = c.coach; });
    C.grid.forEach(g => { slotBy[g.cls] = g; });
    week = DATA.heatmap.classes.map(m => ({
      d: m.d, h: m.h, name: m.name, coach: coachBy[m.name] || "Team",
      cap: capBy[m.name] || 20, booked: (slotBy[m.name]?.slots || [])[m.d] ?? 0,
      wait: (slotBy[m.name]?.wait || [])[m.d] || 0,
    }));
  }
  const H0 = 6, H1 = 21;
  const byCell = {};
  week.forEach(w => { if (w.d < 6) (byCell[`${w.d}-${w.h}`] = byCell[`${w.d}-${w.h}`] || []).push(w); });
  const nowD = new Date();
  const jsDay = (nowD.getDay() + 6) % 7;          // 0 = lunes
  const monday = new Date(nowD); monday.setDate(nowD.getDate() - jsDay);
  const dayHead = C.days.map((d, i) => {
    const dt = new Date(monday); dt.setDate(monday.getDate() + i);
    const today = i === jsDay;
    return `<div class="calday ${today ? "istoday" : ""}">${tr(d, ({ Mon: "Lun", Tue: "Mar", Wed: "Mié", Thu: "Jue", Fri: "Vie", Sat: "Sáb" })[d] || d)} <span class="mono">${dt.getDate()}</span>${today ? `<span class="chip green tdy">${tr("TODAY", "HOY")}</span>` : ""}</div>`;
  }).join("");
  let calRows = "";
  for (let h = H0; h <= H1; h++) {
    calRows += `<div class="calh mono">${h % 12 || 12} ${h < 12 ? "AM" : "PM"}</div>`;
    for (let d = 0; d < 6; d++) {
      const blocks = (byCell[`${d}-${h}`] || []).map(w => {
        const pct = Math.round(100 * w.booked / w.cap);
        const tone = pct >= 95 ? "hot" : pct < 55 ? "low" : "";
        const photo = (C.photos || {})[w.name];
        return `<div class="calblk ${tone}" data-q="${esc((w.name + " " + w.coach).toLowerCase())}"
          data-tip="${esc(`${w.name} · ${w.coach} · ${w.booked}/${w.cap}${w.wait ? ` · +${w.wait} waitlist` : ""}`)}">
          ${photo ? `<img class="cbimg" src="${photo}" alt="" loading="lazy" onerror="this.remove()">` : ""}
          <div class="cbin">
            <b>${esc(w.name)}</b>
            <span class="cbm mono">${w.booked}/${w.cap}${w.wait ? ` <em>+${w.wait}</em>` : ""}</span>
            <div class="cbbar"><i style="width:${pct}%"></i></div>
          </div>
        </div>`;
      }).join("");
      const isNow = d === jsDay && h === nowD.getHours();
      const nowLine = isNow ? `<div class="nowline" style="top:${Math.round(nowD.getMinutes() / 60 * 100)}%"><i></i></div>` : "";
      calRows += `<div class="calcell ${d === jsDay ? "tdcol" : ""}">${nowLine}${blocks}</div>`;
    }
  }

  return `
  ${topbar("Classes", tr("THE WEEK'S TIMETABLE, FILLED STRAIGHT FROM THEIR OWN BOOKING SYSTEM.", "LA GRILLA DE LA SEMANA, LLENADA DIRECTO DESDE SU PROPIO SISTEMA DE RESERVAS."), p2chip())}
  <div class="metrics">
    <div class="metric"><div class="k">Average fill</div><div class="v">${fill}%</div><div class="s">SAMPLE · across the weekly grid</div></div>
    <div class="metric"><div class="k">On waitlists</div><div class="v">${waitTotal}</div><div class="s">Zumba and Cardio Dance carry them</div></div>
    <div class="metric"><div class="k">Underfilled slots</div><div class="v red">${under}</div><div class="s">Below 60%: rebalance before adding classes</div></div>
    <div class="metric"><div class="k">Data source today</div><div class="v" style="font-size:16px;line-height:1.3">Public portal</div><div class="s">Capacity + waitlist already visible (REAL); API makes it live</div></div>
  </div>
  <div class="grid"><div class="panel wide">
    <div class="ptitle">${tr("Week calendar", "Calendario de la semana")}
      <span class="hint">${tr("green bar = full, amber = room to sell; the red line is now", "barra verde = llena, ámbar = espacio por vender; la línea roja es ahora")}</span></div>
    <div class="calsearchrow">
      <span class="csicon">${I.sweep.replace("<svg", "<svg style='width:14px;height:14px;opacity:.55'")}</span>
      <input class="input calsearch" placeholder="${tr("Filter by class or coach...", "Filtra por clase o coach...")}"
        oninput="filterCal(this.value)" aria-label="${tr("Filter classes", "Filtrar clases")}">
    </div>
    <div class="calwrap">
      <div class="cal">
        <div class="calh"></div>${dayHead}
        ${calRows}
      </div>
    </div>
  </div></div>
  <div class="grid"><div class="panel wide">
    <div class="ptitle">What the grid says</div>
    <ul style="list-style:none;display:grid;gap:8px">${C.insights.map(i => `<li style="font-size:13.5px;color:var(--muted-foreground);padding-left:14px;position:relative"><i class="sw" style="background:#23E3A4;position:absolute;left:0;top:7px"></i>${esc(i)}</li>`).join("")}</ul>
  </div></div>
  ${demoNote()}`;
}

/* ---------- GYM OS: ACCESS (BioStar 2) ---------- */

function vAccess() {
  const A = DATA.access;
  const maxH = Math.max(...A.hourly);
  const bars = A.hourly.map((v, h) => `
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px" data-tip="${h}:00 · ${v} check-ins">
      <div style="width:100%;height:${Math.max(3, Math.round(v / maxH * 96))}px;background:${v === maxH ? "#23E3A4" : "var(--accent)"};border-radius:3px 3px 0 0;align-self:end"></div>
      ${h % 4 === 0 ? `<span class="mono" style="font-size:9px;color:var(--muted-foreground)">${h}</span>` : `<span style="height:12px"></span>`}
    </div>`).join("");

  const cohorts = A.cohorts.map(c => `
    <div class="drow" style="grid-template-columns:150px 1fr 44px">
      <div class="lab" style="width:auto">${esc(c.label)}</div>
      <div class="track"><div class="fill${c.label.includes("14+") ? " red" : ""}" style="width:${c.pct}%"></div></div>
      <div class="val">${c.pct}%</div>
    </div>
    <div style="font-size:11px;color:var(--dim);margin:-2px 0 6px 0">${esc(c.note)}</div>`).join("");

  const risk = A.atRisk.map(r => `
    <tr class="click" onclick="openMember('${r.name.replace(/'/g, "\\'")}')">
      <td class="t" style="display:flex;align-items:center;gap:10px"><span class="avatar sm">${esc(r.name.split(" ").map(w => w[0]).join("").slice(0, 2))}</span>${esc(r.name)}</td>
      <td class="mono">${esc(r.plan)}</td>
      <td class="age-amber">${esc(r.last)}</td>
      <td style="color:var(--muted-foreground)">${esc(r.action)}</td>
    </tr>`).join("");

  const doors = A.doorEvents.map(d => `
    <li class="logrow" style="grid-template-columns:64px 1fr 130px 90px">
      <span class="when mono">${esc(d.at)}</span>
      <span class="lwhat">${esc(d.who)}</span>
      <span style="color:var(--muted-foreground);font-size:12px">${esc(d.door)}</span>
      <span>${d.ev === "Granted" ? '<span class="chip green">GRANTED</span>' : '<span class="chip red">DENIED</span>'}</span>
    </li>`).join("");

  const value = A.value.map(v => `
    <div class="mcard" style="gap:8px">
      <div style="font-weight:600;font-size:13.5px">${esc(v.t)}</div>
      <p style="font-size:12.5px;color:var(--muted-foreground);line-height:1.55">${esc(v.d)}</p>
    </div>`).join("");

  return `
  ${topbar("Access · BioStar", `BIOSTAR 2 LOCAL API · /api/events + /api/users + /api/doors · their own server`, p2chip())}
  <div class="metrics">
    <div class="metric"><div class="k">In the gym now</div><div class="v" style="color:#23E3A4">${A.inNow}</div><div class="s">SAMPLE · live from door events</div></div>
    <div class="metric"><div class="k">Check-ins today</div><div class="v">${A.todayTotal}</div><div class="s">SAMPLE · main entrance</div></div>
    <div class="metric"><div class="k">Peak hour</div><div class="v">${A.peak.hour}</div><div class="s">${A.peak.value} members · staff to this curve</div></div>
    <div class="metric"><div class="k">Absent 14+ days</div><div class="v red">${A.cohorts[3].pct}%</div><div class="s">Win-back campaign fires automatically</div></div>
  </div>
  <div class="grid split">
    <div class="panel">
      <div class="ptitle">Today by hour <span class="hint">hover a bar · SAMPLE volumes, real screen</span></div>
      <div style="display:flex;align-items:flex-end;gap:3px;height:130px;padding-top:8px">${bars}</div>
      <hr class="separator">
      <div class="ptitle" style="font-size:13px">Visit frequency cohorts</div>
      <div class="dist">${cohorts}</div>
    </div>
    <div class="panel">
      <div class="ptitle">Door events <span class="hint">the live feed BioStar already logs</span></div>
      <ul class="log">${doors}</ul>
      <hr class="separator">
      <div class="ptitle" style="font-size:13px">At risk · no recent check-in</div>
      <div class="tablewrap"><table>
        <thead><tr><th>Member</th><th>Plan</th><th>Last visit</th><th>Automation</th></tr></thead>
        <tbody>${risk}</tbody>
      </table></div>
    </div>
  </div>
  <div class="grid"><div class="panel wide">
    <div class="ptitle">Where the access data pays <span class="hint">${esc(A.note)}</span></div>
    <div class="mgrid">${value}</div>
  </div></div>
  ${demoNote()}`;
}

/* ---------- GROWTH: CAMPAIGNS (workflow visualization) ---------- */

function vCampaigns(selId) {
  const sel = DATA.campaigns.find(c => c.id === selId) || DATA.campaigns[0];
  const ICONK = { trigger: I.sweep, email: I.mail, sms: I.checkmsg, wait: I.clock, task: I.userplus, branch: I.routes, goal: I.star };
  const list = DATA.campaigns.map(c => `
    <div class="row ${c.id === sel.id ? "sel" : ""}" onclick="location.hash='campaigns/${c.id}'" style="grid-template-columns:1fr auto">
      <div><div class="title">${esc(c.name)}</div><div class="surf">${esc(c.trigger)}</div></div>
      <div style="text-align:right">
        <div class="mono" style="font-size:12px;color:#23E3A4">${c.stats.rate}</div>
        <div class="mono" style="font-size:10.5px;color:var(--muted-foreground)">${c.stats.converted}/${c.stats.entered}</div>
      </div>
    </div>`).join("");

  const DETAILK = {
    trigger: tr("Fires automatically from the systems they already use. No one has to remember anything.", "Se dispara solo desde los sistemas que ya usan. Nadie tiene que acordarse de nada."),
    email: tr("Sent from City Zero's own account; opens and clicks tracked back to this sequence.", "Sale de la cuenta propia de City Zero; aperturas y clics se atribuyen a esta secuencia."),
    sms: tr("A short text from the gym's number, with one tap to act.", "Un texto corto desde el número del gym, con un tap para actuar."),
    wait: tr("A timer running in the engine. The person feels cadence, not spam.", "Un temporizador corriendo en el motor. La persona siente cadencia, no spam."),
    task: tr("Creates a front-desk task with the member's full context attached.", "Crea una tarea de front desk con todo el contexto del miembro."),
    branch: tr("Checks the data and exits anyone who already did the thing. Nobody gets chased after saying yes.", "Revisa los datos y saca a quien ya lo hizo. Nadie recibe seguimiento después de decir que sí."),
    goal: tr("Sequence ends; the result feeds the monthly report.", "La secuencia termina; el resultado alimenta el reporte mensual."),
  };
  const flow = sel.steps.map((st, i) => `
    ${i ? `<div class="vedge"><i style="animation-delay:${(i * 0.5).toFixed(1)}s"></i></div>` : ""}
    <div class="vnode ${st.k} vfin" style="animation-delay:${i * 90}ms" onclick="this.classList.toggle('open')" role="button" tabindex="0"
      onkeydown="if(event.key==='Enter')this.classList.toggle('open')">
      <span class="fic">${ICONK[st.k] || I.sweep}</span>
      <div class="vbody">
        <div class="vhead"><span class="fk">${st.k.toUpperCase()}</span><span class="ft">${esc(st.t)}</span></div>
        <div class="vdetail">
          <p>${DETAILK[st.k] || ""}</p>
          <span class="mono vstat">~${Math.max(sel.stats.converted, Math.round(sel.stats.entered * Math.pow(0.86, i)))} ${tr("people reach this step", "personas llegan a este paso")}</span>
        </div>
      </div>
      <span class="vchev">${I.chevR}</span>
    </div>`).join("");

  return `
  ${topbar("Campaigns", `FOLLOW-UP SEQUENCES · TRIGGERS FROM GLOFOX + BIOSTAR + LANDING · SENDS FROM CITY ZERO'S OWN ACCOUNTS`, p2chip())}
  <div class="grid xgrid">
    <div class="panel" style="padding:8px">
      <div class="xlist">${list}</div>
      <div class="evnote" style="padding:10px 14px 6px">${esc(DATA.campaignsNote)}</div>
    </div>
    <div class="panel">
      <div class="ptitle">${esc(sel.name)} <span class="hint">${esc(sel.trigger)}</span></div>
      <div class="meta-row" style="margin-top:0">
        <span class="chip amber">${sel.status}</span>
        <span class="chip gray">${sel.stats.entered} entered</span>
        <span class="chip gray">${sel.stats.active} active</span>
        <span class="chip green">${sel.stats.converted} converted · ${sel.stats.rate}</span>
      </div>
      <div class="vflow">${flow}</div>
      <div class="evnote" style="margin-top:16px">${tr("Click any step to see what it does. Every step is visible, editable and pausable; a branch exits people the moment the goal is met.", "Clic en cualquier paso para ver qué hace. Cada paso es visible, editable y pausable; un branch saca a la gente en cuanto se cumple la meta.")}</div>
    </div>
  </div>
  ${demoNote()}`;
}

/* ---------- GROWTH: LANDING PAGE ---------- */

function vLanding() {
  const leads = JSON.parse(localStorage.getItem("c0.leads") || "[]");
  const why = DATA.landing.why.map(w => `
    <div class="mcard" style="gap:8px">
      <div style="font-weight:600;font-size:13.5px">${esc(w.t)}</div>
      <p style="font-size:12.5px;color:var(--muted-foreground);line-height:1.55">${esc(w.d)}</p>
    </div>`).join("");
  const leadRows = leads.length ? leads.map(l => `
    <tr>
      <td class="t" style="display:flex;align-items:center;gap:10px"><span class="avatar sm">${esc((l.name || "?").slice(0, 2).toUpperCase())}</span>${esc(l.name)}</td>
      <td class="mono">${esc(l.phone)}</td>
      <td class="mono" style="color:var(--muted-foreground)">${new Date(l.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
      <td><span class="chip green">LIVE · TO PIPELINE</span></td>
    </tr>`).join("") : `<tr><td colspan="4" style="color:var(--muted-foreground);padding:18px 10px">No tour requests yet. Open the landing, submit the form, and watch the lead appear here and in the Pipeline. That loop is the demo.</td></tr>`;

  return `
  ${topbar("Landing Page", `ONE GOAL: THE FREE GUIDED TOUR · TWO-FIELD FORM · LEADS LAND IN THIS DASHBOARD`, `<a class="btn" href="landing.html" target="_blank" rel="noopener">Open landing ${I.chevR.replace("<svg", "<svg class='bicon'")}</a>`)}
  <div class="grid split">
    <div class="panel" style="padding:10px">
      <iframe src="landing.html" title="City Zero landing preview" style="width:100%;height:640px;border:0;border-radius:var(--radius-lg);background:#101316"></iframe>
    </div>
    <div class="panel">
      <div class="ptitle">Why it converts</div>
      <div style="display:grid;gap:10px">${why}</div>
      <hr class="separator">
      <div class="evnote">City Zero has no structured landing today: cityzero.com is a template site with a broken class link and someone else's contacts in the footer. This page is the paid-traffic destination: fast, single-purpose, honest prices, real proof.</div>
    </div>
  </div>
  <div class="grid"><div class="panel wide">
    <div class="ptitle">Tour requests captured <span class="hint">submitted on the landing · stored locally · appear in Pipeline as source “Landing page”</span></div>
    <div class="tablewrap"><table>
      <thead><tr><th>Name</th><th>Phone</th><th>When</th><th>Status</th></tr></thead>
      <tbody>${leadRows}</tbody>
    </table></div>
  </div></div>
  ${demoNote()}`;
}

/* ---------- PULSE METRICS: MONTHLY REPORT (client mockup) ---------- */

function vPulseReport() {
  const r = DATA.pulseReport;
  const src = k => r.sources[k] || { name: k, color: "var(--muted-foreground)" };
  const srcBadge = k => `<span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--muted-foreground)"><i class="sw" style="background:${src(k).color};width:7px;height:7px;margin:0"></i>${esc(src(k).name)}</span>`;
  const alertChip = { green: '<span class="chip green">HEALTHY</span>', yellow: '<span class="chip amber">WATCH</span>', red: '<span class="chip red">ALERT</span>' }[r.executive_summary.alert_level];

  const kpiCards = r.kpis.map(k => `
    <div class="mcard" style="gap:14px${k.hero ? ";border-color:rgba(35,227,164,.35)" : ""}">
      <div class="mhead2" style="justify-content:space-between">${srcBadge(k.source)}${k.sample ? '<span class="chip gray" style="font-size:9px;padding:1px 6px">SAMPLE</span>' : '<span class="chip green" style="font-size:9px;padding:1px 6px">REAL</span>'}</div>
      <div class="mval" style="${k.hero ? "color:#23E3A4" : k.bad ? "color:var(--red)" : ""}">${esc(String(k.value))}</div>
      <p class="mnote"><span style="color:var(--foreground);font-weight:500">${esc(k.label)}</span><span> · ${esc(k.benchmark)}</span></p>
    </div>`).join("");

  const sectionBlocks = r.sections.map(sec => {
    const mets = (sec.metrics || []).map(m => `
      <div style="min-width:110px"><div style="font-size:11.5px;color:var(--muted-foreground)">${esc(m.label)}</div>
      <div style="font-size:21px;font-weight:500;font-variant-numeric:tabular-nums">${esc(String(m.value))}</div></div>`).join("");
    const table = sec.table ? `
      <div class="tablewrap" style="margin-top:12px"><table>
        <thead><tr>${sec.table.headers.map((h, i) => `<th${i >= 2 ? ' style="text-align:right"' : ""}>${esc(h)}</th>`).join("")}</tr></thead>
        <tbody>${sec.table.rows.map(row => `<tr>${row.map((c, i) => `<td class="${i === 0 ? "t" : "num"}" style="${i === 0 ? "font-weight:500" : "text-align:right"};${i === sec.table.highlight ? "color:#23E3A4;font-weight:600" : ""}">${esc(String(c))}</td>`).join("")}</tr>`).join("")}</tbody>
      </table></div>` : "";
    const anomalies = sec.anomalies ? `
      <div class="ptitle" style="font-size:13px;margin:16px 0 6px">${esc(sec.anomalies.title)}</div>
      <div class="tablewrap"><table>
        <thead><tr>${sec.anomalies.headers.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead>
        <tbody>${sec.anomalies.rows.map(row => `<tr>${row.map((c, i) => i === row.length - 1
          ? `<td><span class="chip ${c === "critical" ? "red" : "amber"}">${esc(String(c).toUpperCase())}</span></td>`
          : `<td class="${i === 0 ? "t" : ""}">${esc(String(c))}</td>`).join("")}</tr>`).join("")}</tbody>
      </table></div>` : "";
    const insights = (sec.insights || []).map(i => `<li>${esc(i)}</li>`).join("");
    return `
    <div class="panel" style="margin-bottom:16px">
      <div class="ptitle"><span style="display:inline-flex;align-items:center;gap:8px"><i class="sw" style="background:${src(sec.id).color};width:9px;height:9px;margin:0"></i>${esc(sec.name)}</span>
        ${sec.sample === false ? '<span class="chip green">REAL</span>' : '<span class="chip gray">SAMPLE</span>'}</div>
      ${mets ? `<div style="display:flex;gap:28px;flex-wrap:wrap;margin:4px 0 2px">${mets}</div>` : ""}
      ${table}${anomalies}
      ${insights ? `<div class="mail" style="max-width:none;border:0;margin-top:12px"><div class="sect"><div class="k gray">Insights</div><ul>${insights}</ul></div></div>` : ""}
    </div>`;
  }).join("");

  const kCol = (title, cards, chipCls) => `
    <div class="kcol">
      <div class="khead"><span>${title}</span><span class="mono">${cards.length}</span></div>
      ${cards.map(c => `<div class="kcard">
        <div class="kname" style="font-weight:500;font-size:12.5px;line-height:1.35">${esc(c.title)}</div>
        <div class="ksrc" style="margin-top:6px">${srcBadge(c.source)}</div>
        ${c.outcome ? `<div class="knext">${esc(c.outcome)}</div>` : ""}
        ${c.impact ? `<div class="knext" style="color:#23E3A4">${esc(c.impact)}</div>` : ""}
      </div>`).join("")}
    </div>`;

  return `
  ${topbar("Pulse Report", `<span class="pulse-mark">● PULSE · METRICS</span> monthly client report · ${esc(r.periodLabel)}`, `<span class="chip amber">MOCKUP · SAMPLE SCENARIO</span>`)}

  <div class="grid"><div class="panel wide" style="border-color:rgba(35,227,164,.25)">
    <div style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;align-items:flex-start">
      <div style="max-width:66ch">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">${alertChip}<span class="mono text-muted" style="font-size:11px">EXECUTIVE SUMMARY · ${esc(r.period)}</span></div>
        <h3 style="font-size:17px;font-weight:600;line-height:1.4">${esc(r.executive_summary.headline)}</h3>
        <ul style="list-style:none;margin-top:12px;display:grid;gap:7px">
          ${r.executive_summary.summary_bullets.map(b => `<li style="font-size:13px;color:var(--muted-foreground);padding-left:14px;position:relative"><i class="sw" style="background:#23E3A4;position:absolute;left:0;top:6px"></i>${esc(b)}</li>`).join("")}
        </ul>
      </div>
      <div style="text-align:center;flex-shrink:0;padding:8px 18px">
        <div style="font-size:44px;font-weight:600;line-height:1;color:${r.executive_summary.health_score >= 80 ? "var(--green)" : r.executive_summary.health_score >= 60 ? "var(--amber)" : "var(--red)"}">${r.executive_summary.health_score}</div>
        <div style="font-size:11px;color:var(--muted-foreground);margin-top:6px">HEALTH SCORE / 100</div>
      </div>
    </div>
  </div></div>

  <div class="grid"><div class="panel wide" style="background:transparent;border:0;box-shadow:none;padding:4px 0 0">
    <div class="ptitle" style="padding:0 0 0 2px">KPIs <span class="hint">each with its source · the schema allows 6-12</span></div>
    <div class="mgrid" style="grid-template-columns:repeat(4,1fr)">${kpiCards}</div>
  </div></div>

  <div class="grid"><div style="grid-column:1/-1">
    <div class="ptitle" style="padding-left:2px">Per-platform sections <span class="hint">metrics + tables + insights per source, exactly like the MCB report</span></div>
    ${sectionBlocks}
  </div></div>

  <div class="grid"><div class="panel wide">
    <div class="ptitle">The work, kanban style <span class="hint">completed · in progress · recommendations, every card cites its source</span></div>
    <div class="kanban" style="grid-template-columns:repeat(3,1fr)">
      ${kCol("Completed", r.kanban.completed)}
      ${kCol("In progress", r.kanban.in_progress)}
      ${kCol("Recommendations", r.kanban.recommendations)}
    </div>
  </div></div>

  <div class="grid"><div class="panel wide">
    <div class="ptitle">Diagnosis</div>
    <h3 style="font-size:15.5px;font-weight:600;max-width:70ch">${esc(r.diagnosis.headline)}</h3>
    <div style="display:flex;gap:28px;flex-wrap:wrap;margin:16px 0">
      ${r.diagnosis.stats.map(st => `<div><div style="font-size:22px;font-weight:500;font-variant-numeric:tabular-nums">${esc(st.value)}</div><div style="font-size:11.5px;color:var(--muted-foreground)">${esc(st.label)} · ${esc(st.meta)}</div></div>`).join("")}
    </div>
    ${r.diagnosis.narrative_paragraphs.map(pg => `<p style="font-size:13.5px;color:color-mix(in oklab, var(--foreground) 85%, transparent);max-width:75ch;margin-bottom:10px;line-height:1.6">${esc(pg)}</p>`).join("")}
    <hr class="separator">
    <p style="font-size:14px;font-weight:500"><span class="pulse-grad" style="font-weight:600">Bottom line:</span> ${esc(r.diagnosis.bottom_line)}</p>
    <p class="mono text-muted" style="font-size:10px;margin-top:14px;letter-spacing:.06em">STRUCTURE MIRRORS THE LIVE PULSE SCHEMA (EXECUTIVE_SUMMARY · KPIS · SECTIONS · KANBAN · DIAGNOSIS) · REAL REPORT REQUIRES AD ACCOUNTS + GLOFOX EXPORT · NO PRICING IMPLIED</p>
  </div></div>
  ${demoNote()}`;
}

/* ---------- PULSE METRICS: PAID MEDIA ---------- */

function vPaidMedia() {
  const pm = DATA.paidmedia;

  const serviceCards = pm.service.map((x, i) => `
    <div class="mcard" style="gap:10px">
      <div class="mhead2"><span class="mono" style="font-size:11px;color:#23E3A4">0${i + 1}</span><span>${esc(x.step)}</span></div>
      <p style="font-size:12.5px;color:var(--muted-foreground);line-height:1.55">${esc(x.what)}</p>
    </div>`).join("");

  const funnelRows = pm.funnel.map((f, i) => `
    <div class="drow" style="grid-template-columns:170px 1fr 150px">
      <div class="lab" style="width:auto">${esc(f.stage)}</div>
      <div class="track"><div class="fill${i === pm.funnel.length - 1 ? "" : ""}" style="width:${100 - i * 19}%;${i === pm.funnel.length - 1 ? "background:#23E3A4" : ""}"></div></div>
      <div class="val" style="min-width:140px">${esc(f.v)} <span style="color:var(--muted-foreground)">· ${esc(f.note)}</span></div>
    </div>`).join("");

  const attMax = Math.max(...pm.attribution.rows.map(r => r.members));
  const attRows = pm.attribution.rows.map(r => {
    const real = r.src.startsWith("Real");
    const comb = r.src.startsWith("Platforms");
    return `<div class="drow" style="grid-template-columns:210px 1fr 44px">
      <div class="lab" style="width:auto;${real ? "color:#23E3A4;font-weight:600" : ""}">${esc(r.src)}</div>
      <div class="track"><div class="fill${comb ? " red" : ""}" style="width:${Math.round(r.members / attMax * 100)}%;${real ? "background:#23E3A4" : ""}"></div></div>
      <div class="val">${r.members}</div>
    </div>`;
  }).join("");

  const wasteRows = pm.waste.map(w => `
    <tr>
      <td><div class="t">${esc(w.what)}</div></td>
      <td style="color:var(--muted-foreground)">${esc(w.how)}</td>
      <td style="color:var(--muted-foreground)">${esc(w.tie)}</td>
    </tr>`).join("");

  const prereqRows = pm.prereqs.map((x, i) => `
    <li><span class="when">STEP 0.${i + 1}</span>${esc(x.what)}, <span style="color:var(--muted-foreground)">${esc(x.state)}</span></li>`).join("");

  return `
  ${topbar("Paid Media", `<span class="pulse-mark">● PULSE · METRICS</span> by Arqentia · they asked for a media buyer; this is the buyer with instruments`, `<span class="chip amber">PHASE 2 · SAMPLE SCENARIO</span>`)}

  <div class="metrics">
    <div class="metric"><div class="k">Sample monthly budget</div><div class="v">$3,000</div>
      <div class="s">SAMPLE · scenario, not a quote. Real budget is a Discovery decision</div></div>
    <div class="metric"><div class="k">Cost per lead</div><div class="v">${pm.unitMath.cpl}</div>
      <div class="s">SAMPLE · 120 leads into the CRM pipeline</div></div>
    <div class="metric"><div class="k">Real cost per member</div><div class="v" style="color:#23E3A4">${pm.unitMath.costPerMember}</div>
      <div class="s">SAMPLE · spend ÷ Glofox joins, the number platforms never give</div></div>
    <div class="metric"><div class="k">Payback anchor</div><div class="v">$179.99<span class="unit">/ mo plan</span></div>
      <div class="s">REAL price · month one nearly covers acquisition in this scenario</div></div>
  </div>

  <div class="grid"><div class="panel wide">
    <div class="ptitle">The service: media buying with instruments <span class="hint">Arqentia runs the campaigns · Pulse crosses every dollar against real outcomes</span></div>
    <div class="mgrid">${serviceCards}</div>
  </div></div>

  <div class="grid split">
    <div class="panel">
      <div class="ptitle">Spend to members, one funnel <span class="hint">SAMPLE scenario · leads land in the CRM Pipeline with their campaign attached</span></div>
      <div class="dist">${funnelRows}</div>
      <div class="evnote" style="margin-top:14px">${esc(pm.unitMath.anchor)} Two of the leads on the <a href="#pipeline" style="color:var(--foreground)">Pipeline board</a> carry their ad campaign as source: that handoff is the integration.</div>
      <hr class="separator">
      <div class="ptitle" style="font-size:13px">Step 0: the plumbing <span class="hint">real, from their own hiring post</span></div>
      <ul class="tl">${prereqRows}</ul>
      <div class="evnote">You cannot buy Meta media with Facebook and Instagram disconnected and phantom pages splitting the brand. The <a href="#meta" style="color:var(--foreground)">Meta Health cleanup</a> is the first week of this engagement.</div>
    </div>

    <div class="panel">
      <div class="ptitle">Who really brought the member <span class="hint">SAMPLE scenario · the Pulse attribution cross</span></div>
      <div class="dist">${attRows}</div>
      <div class="evnote" style="margin-top:14px">${esc(pm.attribution.note)}</div>
      <hr class="separator">
      <div class="evnote" style="margin-top:0"><b style="color:var(--foreground)">The moat, in one line:</b> ${esc(pm.moat)}</div>
    </div>
  </div>

  <div class="grid"><div class="panel wide">
    <div class="ptitle">Where the money leaks, and how this setup catches it <span class="hint">the anomalies cross, adapted to a gym</span></div>
    <div class="tablewrap"><table>
      <thead><tr><th style="width:24%">Leak</th><th style="width:40%">How Pulse catches it</th><th>Why City Zero specifically</th></tr></thead>
      <tbody>${wasteRows}</tbody>
    </table></div>
  </div></div>
  ${demoNote()}`;
}

/* ---------- ANALYTICS ---------- */

function vAnalytics() {
  const a = DATA.analytics;
  const fmax = a.sampleFunnel[0].n;
  const funnel = a.sampleFunnel.map((s, i) => {
    const pct = Math.round(s.n / fmax * 100);
    const conv = i ? ` <span style="color:var(--dim)">${Math.round(s.n / a.sampleFunnel[i - 1].n * 100)}% of prev</span>` : "";
    return `<div class="drow" style="grid-template-columns:190px 1fr 110px">
      <div class="lab" style="width:auto">${esc(s.stage)}</div>
      <div class="track"><div class="fill" style="width:${pct}%"></div></div>
      <div class="val">${s.n}${conv}</div>
    </div>`;
  }).join("");
  const smax = Math.max(...a.sampleSources.map(s => s.n));
  const sources = a.sampleSources.map(s => `
    <div class="drow" style="grid-template-columns:190px 1fr 44px">
      <div class="lab" style="width:auto">${esc(s.source)}</div>
      <div class="track"><div class="fill" style="width:${Math.round(s.n / smax * 100)}%"></div></div>
      <div class="val">${s.n}</div>
    </div>`).join("");

  const q = {};
  DATA.reviews.forEach(r => {
    const d = new Date(r.date);
    const k = `${d.getFullYear()} Q${Math.floor(d.getMonth() / 3) + 1}`;
    (q[k] = q[k] || []).push(r.stars);
  });
  const quarters = Object.entries(q).sort((a2, b2) => a2[0].localeCompare(b2[0]));
  const qrows = quarters.map(([k, stars]) => {
    const avg = stars.reduce((x, y) => x + y, 0) / stars.length;
    return `<div class="drow" style="grid-template-columns:110px 1fr 110px">
      <div class="lab" style="width:auto">${k}</div>
      <div class="track"><div class="fill${avg < 4 ? " red" : ""}" style="width:${Math.round(avg / 5 * 100)}%"></div></div>
      <div class="val">${avg.toFixed(2)} · ${stars.length} rev</div>
    </div>`;
  }).join("");

  const sens = a.sensitivity.map(s => `
    <tr>
      <td class="num" style="text-align:left">${s.members.toLocaleString("en-US")}</td>
      <td class="mono" style="color:var(--dim)">${s.members.toLocaleString("en-US")} × $180 × 12</td>
      <td class="num">$${s.revenue.toLocaleString("en-US")}</td>
    </tr>`).join("");

  return `
  ${topbar("Analytics", "SHAPES ARE THE REAL DESIGN · SAMPLE NUMBERS MARKED", p2chip())}
  <div class="grid half">
    <div class="panel">
      <div class="ptitle">Conversion funnel, monthly <span class="hint">SAMPLE numbers</span></div>
      <div class="dist">${funnel}</div>
      <div class="evnote" style="margin-top:14px">The five Discovery numbers turn this from sample into measurement: leads per channel, tours, trials, conversions, cancellations.</div>
    </div>
    <div class="panel last">
      <div class="ptitle">Leads by source, monthly <span class="hint">SAMPLE numbers · channels real</span></div>
      <div class="dist">${sources}</div>
      <div class="evnote" style="margin-top:14px">Attribution across channels is scoreboard system 09, publicly not visible today.</div>
    </div>
  </div>
  <div class="grid half">
    <div class="panel">
      <div class="ptitle">Review average by quarter <span class="hint">REAL · computed from the ${DATA.reviews.length} sampled reviews in Review Signal</span></div>
      <div class="dist">${qrows}</div>
      <div class="evnote" style="margin-top:14px">Small sample: ${DATA.reviews.length} reviews across ${quarters.length} quarters. The two dips are the two operational one-stars.</div>
    </div>
    <div class="panel last">
      <div class="ptitle">Membership revenue sensitivity <span class="hint">REAL formula · hypothetical member counts</span></div>
      <div class="tablewrap"><table>
        <thead><tr><th>If active members are</th><th>Formula</th><th style="text-align:right">Annual membership</th></tr></thead>
        <tbody>${sens}</tbody>
      </table></div>
      <div class="evnote" style="margin-top:12px">$180 sits between the real $179.99 and $199.99 plans. Excludes events, PT, day passes, aggregators, retail, churn. City Zero knows the real number; that number decides G2.</div>
    </div>
  </div>
  ${demoNote()}`;
}

/* ---------- SYSTEM ---------- */

function vIntegrations() {
  const cards = DATA.integrations.map(i => `
    <div class="scard">
      <div class="top"><h3>${esc(i.name)}</h3>
        <span>${i.status === "CONNECTED" ? '<span class="chip green">CONNECTED</span>' : i.status === "PLANNED" ? '<span class="chip amber">PLANNED P2</span>' : '<span class="chip red">OUT OF SCOPE</span>'}</span></div>
      <div class="kind">Access: <span class="mono">${esc(i.mode)}</span> · Phase ${i.phase}</div>
      <div class="finding" style="border-top:0;padding-top:8px"><span>${esc(i.detail)}</span></div>
    </div>`).join("");
  const feas = DATA.feasibility.map(f => `
    <tr>
      <td class="t">${esc(f.need)}</td>
      <td class="mono" style="font-size:11.5px;color:var(--muted-foreground)">${esc(f.how)}</td>
      <td>${f.status === "READ" ? '<span class="chip green">READ</span>' : f.status === "PUSH" ? '<span class="chip green">WEBHOOK</span>' : f.status === "GATE" ? '<span class="chip amber">GATE</span>' : '<span class="chip gray">WRITE OPTIONAL</span>'}</td>
      <td style="color:var(--muted-foreground)">${esc(f.note)}</td>
    </tr>`).join("");
  return `
  ${topbar("Integrations", "READ-ONLY IS THE ARCHITECTURE, NOT A SETTING")}
  <div class="grid"><div class="panel wide">
    <div class="ptitle">The whole wedge needs 15 of 316 endpoints <span class="hint">simplicity is the architecture: we answer questions, we do not integrate platforms</span></div>
    <div class="intstory">
      <div class="istat"><b>316</b><span>endpoints documented across Glofox (65 operations + 10 webhook domains) and BioStar 2 (251). Full inventories live in the case file, extracted from the official specs.</span></div>
      <div class="istat"><b>15</b><span>calls the wedge actually uses: 8 Glofox reads + 4 webhook domains, and 7 BioStar reads. Everything else stays documented and deliberately out of scope.</span></div>
      <div class="istat"><b>3</b><span>surfaces the gym ever sees: a morning email, this dashboard, and one exception list. Nobody at City Zero operates a new system.</span></div>
    </div>
  </div></div>
  <div class="grid"><div class="panel wide">
    <div class="ptitle">Glofox + BioStar feasibility <span class="hint">grounded in the official API docs; both accesses are Discovery items, not guesses</span></div>
    <div class="tablewrap"><table>
      <thead><tr><th style="width:24%">The requirement</th><th style="width:30%">How the API covers it</th><th>Status</th><th>Note</th></tr></thead>
      <tbody>${feas}</tbody>
    </table></div>
  </div></div>
  <div class="surfaces">${cards}</div>
  ${demoNote()}`;
}

function vAudit() {
  const rows = DATA.auditlog.map(e => `
    <li class="logrow">
      <span class="when mono">${esc(e.at)}</span>
      <span class="chip ${e.kind === "exception" ? "red" : e.kind === "review" ? "amber" : "gray"}">${esc(e.kind).toUpperCase()}</span>
      <span class="lwhat">${esc(e.what)}</span>
    </li>`).join("");
  return `
  ${topbar("Audit Log", "EVERYTHING THE MONITOR DID, IN ORDER, FOREVER")}
  <div class="grid"><div class="panel wide">
    <div class="ptitle">Event stream <span class="hint">all real · the complete history of the two sweeps</span></div>
    <ul class="log">${rows}</ul>
  </div></div>
  ${demoNote()}`;
}

/* ---------- router ---------- */

const VIEWS = {
  home: vToday, grow: vGrow, keep: vKeep, engine: vEngine, hours: vHours,
  start: vStart,
  overview: vOverview, exceptions: vExceptions, surfaces: vSurfaces, routes: vRoutes,
  reviews: vReviews, report: vReport, settings: vSettings,
  pipeline: vPipeline, leads: vLeads, members: vMembers,
  workflows: vWorkflows, triggers: vTriggers, tasks: vTasks,
  analytics: vAnalytics, pulsereport: vPulseReport, paidmedia: vPaidMedia, meta: vMeta, integrations: vIntegrations, audit: vAudit,
  classes: vClasses, access: vAccess, campaigns: vCampaigns, landing: vLanding,
};

function render() {
  let [id, arg] = (location.hash.replace(/^#/, "") || (FULL ? "start" : "home")).split("/");
  if (PUBLIC_DEMO && !SECTIONS.some(s => s.id === id)) id = "home";
  const view = VIEWS[id] || (FULL ? vOverview : vToday);
  $("#nav").innerHTML = SECTIONS.map(s => {
    if (s.group) return `<div class="navgroup">${s.group}</div>`;
    const b = s.badge ? s.badge() : null;
    return `<a href="#${s.id}" class="${s.id === id ? "active" : ""}">${s.label}${b ? `<span class="n ${s.hot ? "hot" : ""}">${b}</span>` : ""}</a>`;
  }).join("");
  $("#content").innerHTML = view(arg);
  const tb = $("#content .topbar");
  if (tb && SECTION_DESC[id]) tb.insertAdjacentHTML("afterend", `<div class="secdesc">${SECTION_DESC[id]}</div>`);
  if (id === "overview" || !VIEWS[id]) mountOverviewCharts();
  if (id === "reviews") mountReviewDonut();
  const st = document.getElementById("side-status");
  if (st && FULL) {
    const openCount = DATA.exceptions.filter(x => x.status === "OPEN").length;
    const replyCount = DATA.reviews.filter(r => r.classification === "OPERATIONAL" && !r.reply).length;
    st.innerHTML = `
    <div class="ssrow"><span class="dot"></span><b>${tr("Now", "Ahora")}</b></div>
    <div class="ssline"><span class="mono">${openCount}</span> ${tr("open", "abiertas")} · <span class="mono">1</span> ${tr("route failing", "ruta fallando")} · <span class="mono">${replyCount}</span> ${tr("to answer", "por responder")}</div>`;
  } else if (st) {
    const unconf = DATA.grow.tours.filter(t => !t.confirmed).length;
    st.innerHTML = `
    <div class="ssrow"><span class="dot"></span><b>${tr("Now", "Ahora")}</b></div>
    <div class="ssline"><span class="mono">${DATA.today.inNow}</span> ${tr("in the gym", "en el gym")} · <span class="mono">${unconf}</span> ${tr("tours to confirm", "tours por confirmar")}</div>`;
  }
  document.querySelectorAll(".langbtn").forEach(b => b.classList.toggle("on", b.dataset.l === LANG));
  document.title = `CITY 0 OPS · ${SECTIONS.find(s => s.id === id)?.label || (FULL ? "Start Here" : "Today")}`;
  window.scrollTo(0, 0);
  applyTranslations();
  requestAnimationFrame(() => animatePage());
  if (id === "home") startFeedTicker(); else clearInterval(_feedTimer);
  if (id === "hours") mountHourDetail();
}

window.addEventListener("hashchange", render);
render();

function mountReviewDonut() {
  const donutEl = document.getElementById("revdonut");
  const legendEl = document.getElementById("revdlegend");
  if (!donutEl || !legendEl) return;
  const d = DATA.reviewsSummary.distribution;
  const seg = [
    { name: "5 star", value: d[5], fill: "#C4C4C4" },
    { name: "4 star", value: d[4], fill: "#707070" },
    { name: "1 star", value: d[1], fill: "#D64F4F" },
  ].filter(x => x.value > 0);
  const total = DATA.reviewsSummary.count;
  const api = donutChart(donutEl, { data: seg, total, label: "reviews all-time", size: 164 });
  if (typeof animateDonut === "function") animateDonut(donutEl);
  legendEl.innerHTML = seg.map((x, i) => `
    <div class="dlrow" data-i="${i}">
      <span class="dln"><i class="sw" style="background:${x.fill}"></i>${x.name}</span>
      <b>${x.value}</b>
      <span class="dlp">${(x.value / total * 100).toFixed(x.value / total * 100 % 1 ? 1 : 0)}%</span>
    </div>`).join("");
  const syncLegend = i => legendEl.querySelectorAll(".dlrow").forEach((r, j) => r.style.opacity = i == null || i === j ? 1 : .4);
  legendEl.querySelectorAll(".dlrow").forEach(row => {
    const i = Number(row.dataset.i);
    row.addEventListener("mouseenter", () => { api.setActive(i); syncLegend(i); });
    row.addEventListener("mouseleave", () => { api.setActive(null); syncLegend(null); });
  });
  api.onActive = syncLegend;
}

/* dropdown: close on outside click */
document.addEventListener("click", e => {
  document.querySelectorAll(".dd.open").forEach(dd => { if (!dd.contains(e.target)) dd.classList.remove("open"); });
});

/* charts re-render on resize */
let _rz;
window.addEventListener("resize", () => { clearTimeout(_rz); _rz = setTimeout(render, 200); });
