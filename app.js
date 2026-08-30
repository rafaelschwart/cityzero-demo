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

/* iconos de nav (lucide outline, 16px) — anatomia del template shadcn admin */
const _nsvg = p => `<svg class="navico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const NAV_ICONS = {
  home: _nsvg('<path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/>'),
  hours: _nsvg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>'),
  classes: _nsvg('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18"/>'),
  grow: _nsvg('<path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/>'),
  pipeline: _nsvg('<rect x="3" y="4" width="5" height="13" rx="1"/><rect x="10" y="4" width="5" height="9" rx="1"/><rect x="17" y="4" width="4" height="16" rx="1"/>'),
  campaigns: _nsvg('<path d="M3 11l18-7-7 18-2.5-7.5L3 11z"/>'),
  keep: _nsvg('<path d="M19 14c1.5-1.5 2-3.2 2-5a5 5 0 0 0-9-3 5 5 0 0 0-9 3c0 1.8.5 3.5 2 5l7 7 7-7z"/>'),
  inbox: _nsvg('<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1z"/>'),
  paidmedia: _nsvg('<path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="7"/><rect x="12" y="6" width="3" height="11"/><rect x="17" y="12" width="3" height="5"/>'),
  pulsereport: _nsvg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 15h8M8 11h3"/>'),
  engine: _nsvg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
  _: _nsvg('<circle cx="12" cy="12" r="2"/>'),
};

const SECTIONS_SIMPLE = [
  { group: "Your gym · live" },
  { id: "home", label: "Overview", badge: () => DATA.today.do.length, hot: true },
  { id: "hours", label: "Hours" },
  { id: "calendar", label: "Calendar" },
  { id: "classes", label: "Classes" },
  { group: "More members" },
  { id: "grow", label: "Grow" },
  { id: "pipeline", label: "Pipeline", badge: () => DATA.pipeline.cards.filter(c => c.breach).length, hot: true },
  { id: "campaigns", label: "Campaigns" },
  { id: "inbox", label: "Inbox", badge: () => DATA.inbox.convos.reduce((a, c) => a + c.unread, 0) || null, hot: true },
  { id: "keep", label: "Keep" },
  { group: "Marketing" },
  { id: "paidmedia", label: "Ads Report" },
  { id: "pulsereport", label: "Monthly Report" },
  { id: "store", label: "Store" },
  { group: "Under the hood" },
  { id: "engine", label: "The Engine" },
  { group: "Account" },
  { id: "profile", label: "Profile" },
];

const SECTIONS_FULL = [
  { group: "Pitch · ops manager" },
  { id: "home", label: "Overview" },
  { id: "grow", label: "Grow" },
  { id: "keep", label: "Keep" },
  { id: "engine", label: "The Engine" },
  { group: "Guide" },
  { id: "start", label: "Start Here" },
  { group: "Monitor · live" },
  { id: "overview", label: "Monitor" },
  { id: "exceptions", label: "Exceptions", badge: () => DATA.exceptions.filter(x => x.status === "OPEN").length, hot: true },
  { id: "surfaces", label: "Surfaces" },
  { id: "routes", label: "Routes & Links", badge: () => DATA.routesSummary.failing, hot: true },
  { id: "reviews", label: "Review Signal", badge: () => DATA.reviews.filter(r => r.classification === "OPERATIONAL" && !r.reply).length, hot: true },
  { id: "report", label: "Morning Report" },
  { group: "Gym OS · Glofox + BioStar" },
  { id: "calendar", label: "Calendar" },
  { id: "classes", label: "Classes" },
  { id: "members", label: "Members" },
  { id: "access", label: "Access Control" },
  { group: "Growth" },
  { id: "landing", label: "Landing Page", badge: () => JSON.parse(localStorage.getItem("c0.leads") || "[]").length || null },
  { id: "pipeline", label: "Pipeline", badge: () => DATA.pipeline.cards.filter(c => c.breach).length, hot: true },
  { id: "leads", label: "Lead Channels" },
  { id: "campaigns", label: "Campaigns" },
  { id: "store", label: "Store" },
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
  { id: "profile", label: "Profile" },
];

const SECTIONS = FULL ? SECTIONS_FULL : SECTIONS_SIMPLE;

const SECTION_DESC = {
  overview: "The day at a glance: open problems, what broke this morning, live activity and the insights that matter.",
  profile: "The demo account behind this dashboard: read-only access, what it watches, and who sponsors it on the client side.",
  store: "The retail layer Glofox already supports, as a concept: merch, shakes and day passes with sales, traffic and inventory in one screen. All volumes SAMPLE.",
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
  inbox: "Email, WhatsApp, Instagram, Facebook and web chat in one queue. Nobody asks 'who saw this?' again.",
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
  return `<div class="demo-note"><div class="alert">${I.alert}<div class="atitle">${tr("Demo data policy", "Política de datos del demo")}</div><div class="adesc">${tr("Every value is captured public evidence (sweeps 2026-08-20 and 2026-08-24) except draft replies, thresholds and rows marked SAMPLE, which are proposals. No internal City Zero data.", "Cada valor es evidencia pública capturada (barridos 2026-08-20 y 2026-08-24) excepto borradores de respuesta, umbrales y filas marcadas SAMPLE, que son propuestas. Cero datos internos de City Zero.")}</div></div></div>`;
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

/* ---------- Overview (template port: dashboard/default) ---------- */

/* Catmull-Rom → Bézier: el equivalente vanilla del type="natural" de Recharts
   (performance-overview.tsx del template). */
function _smoothPath(pts) {
  let d = "M" + pts[0][0].toFixed(1) + "," + pts[0][1].toFixed(1);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)},${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)},${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

function ovChart() {
  /* Port de performance-overview.tsx: 3 series independientes en pasos de 12h
     (la forma del dataset del template: principal con picos, dos líneas estables
     con oscilación propia), escala única desde 0, curvas naturales. */
  const n = 180;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.now() - (n - 1 - i) * 432e5);
    let main = 96 + ((i * 37) % 23) + Math.sin(i / 3.1) * 9 + Math.sin(i / 7.7) * 6;
    if (i % 13 === 0) main += 88 + (i * 7) % 72;
    else if (i % 9 === 0) main += 44;
    const book = 62 + Math.sin(i / 5.3) * 5 + ((i * 11) % 7) - 3;
    const ret = 45 + Math.sin(i / 6.7) * 4 + ((i * 5) % 5) - 2;
    pts.push({ d, v: Math.round(Math.max(28, main)), b: Math.round(book), n: Math.round(ret) });
  }
  const max = Math.max.apply(null, pts.map(p => p.v)) * 1.05;
  const W = 1000, H = 240;
  const X = i => i / (n - 1) * W, Y = v => H - v / max * H;
  const y0 = pts.map(p => Y(p.v)), y1 = pts.map(p => Y(p.b)), y2 = pts.map(p => Y(p.n));
  const line = _smoothPath(pts.map((p, i) => [X(i), y0[i]]));
  const area = line + `L${W},${H}L0,${H}Z`;
  const bline = _smoothPath(pts.map((p, i) => [X(i), y1[i]]));
  const nline = _smoothPath(pts.map((p, i) => [X(i), y2[i]]));
  window._OVC = { pts, days: n, H, y0, y1, y2 };
  const lf = new Intl.DateTimeFormat(LANG === "es" ? "es" : "en-US", { month: "short", day: "numeric" });
  const labels = [];
  for (let i = 0; i < n; i += 22) labels.push(lf.format(pts[i].d));
  return { area, line, bline, nline, labels };
}

/* Hover layer del Gym Activity: crosshair + dots por serie + tooltip con
   fecha y valores (port del tooltip Recharts del template), animado con anime.js. */
let _ovLast = -1, _ovOn = false;
function ovHover(e) {
  const C = window._OVC; if (!C) return;
  const wrap = e.currentTarget;
  const svg = wrap.querySelector(".actsvg");
  const hov = document.getElementById("achover");
  if (!svg || !hov) return;
  const r = svg.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
  const x = Math.min(Math.max(e.clientX - r.left, 0), r.width);
  const i = Math.max(0, Math.min(C.days - 1, Math.round(x / r.width * (C.days - 1))));
  const px = (r.left - wr.left) + i / (C.days - 1) * r.width;
  const topSvg = r.top - wr.top;
  const ys = [C.y0[i], C.y1[i], C.y2[i]];
  hov.querySelectorAll(".acdot").forEach((d, k) => {
    d.style.left = px + "px";
    d.style.top = (topSvg + ys[k] / C.H * r.height) + "px";
  });
  const tip = document.getElementById("actip");
  if (i !== _ovLast) {
    _ovLast = i;
    const p = C.pts[i];
    const lf = new Intl.DateTimeFormat(LANG === "es" ? "es" : "en-US", { day: "numeric", month: "long", year: "numeric" });
    tip.innerHTML = `<b>${lf.format(p.d)}</b>
      <span><i></i>${tr("Check-ins", "Check-ins")}<em>${p.v}</em></span>
      <span><i class="dim"></i>${tr("Class bookings", "Reservas de clase")}<em>${p.b}</em></span>
      <span><i class="dim2"></i>${tr("Returning members", "Miembros recurrentes")}<em>${p.n}</em></span>`;
  }
  const tw = tip.offsetWidth || 190;
  const flip = px + tw + 28 > wr.width;
  tip.style.left = (flip ? px - tw - 16 : px + 16) + "px";
  tip.style.top = Math.max(topSvg + 6, Math.min(topSvg + ys[0] / C.H * r.height - 24, topSvg + r.height - 96)) + "px";
  if (!_ovOn) {
    _ovOn = true;
    const anim = typeof anime !== "undefined" && !(typeof REDUCED !== "undefined" && REDUCED);
    hov.style.opacity = 1;
    if (anim) {
      anime.remove([tip, hov]);
      anime({ targets: tip, opacity: [0, 1], scale: [0.94, 1], duration: 200, easing: "easeOutExpo" });
      anime({ targets: hov.querySelectorAll(".acdot"), scale: [0, 1], duration: 280, delay: anime.stagger(45), easing: "easeOutBack" });
    } else { tip.style.opacity = 1; }
  }
}
function ovLeave() {
  const hov = document.getElementById("achover"); if (!hov) return;
  _ovOn = false; _ovLast = -1;
  if (typeof anime !== "undefined" && !(typeof REDUCED !== "undefined" && REDUCED)) {
    anime.remove(hov);
    anime({ targets: hov, opacity: 0, duration: 130, easing: "easeOutQuad" });
  } else hov.style.opacity = 0;
}

function ovCard(icon, label, value, valId, badge, badgeCls, sub, hash) {
  return `<div class="kpicard ov click" onclick="location.hash='${hash}'">
    <span class="ovic">${icon}</span>
    <div class="ovlab">${label}</div>
    <div class="kpirow"><span class="kpiv"${valId ? ` id="${valId}"` : ""}>${value}</span><span class="kbadge ${badgeCls}">${badge}</span></div>
    <div class="kpilast">${sub}</div>
  </div>`;
}

function ovMemberRows() {
  const lf = new Intl.DateTimeFormat(LANG === "es" ? "es" : "en-US", { month: "short", day: "numeric", year: "numeric" });
  return DATA.members.rows.map((r, i) => {
    const billing = r.risk && r.risk.toLowerCase().indexOf("charge") >= 0
      ? `<span class="chip red">${tr("Retrying", "Reintentando")}</span>` : `<span class="chip green">${tr("Paid", "Pagado")}</span>`;
    const status = r.status === "active" ? `<span class="pill">${tr("Active", "Activo")}</span>` : `<span class="pill" style="color:var(--amber)">${tr("Frozen", "Congelado")}</span>`;
    const nm = r.name.replace(/'/g, "\\'");
    return `<tr class="ovmr" data-q="${esc(r.name.toLowerCase())}" data-st="${r.status}">
      <td onclick="event.stopPropagation()"><input type="checkbox" class="ck" aria-label="Select ${esc(r.name)}"></td>
      <td class="t click" style="white-space:nowrap" onclick="openMember('${nm}')">${favatar(r.name, 26)} <span style="vertical-align:6px">${esc(r.name)} <span class="mono" style="color:var(--muted-foreground);font-size:11px">#CZ${1400 + i * 37}</span></span></td>
      <td>${status}</td>
      <td>${billing}</td>
      <td class="mono" style="font-size:12.5px">${esc(r.plan)}</td>
      <td style="color:var(--muted-foreground);font-size:12.5px">${lf.format(new Date(r.since + "T12:00:00"))}</td>
    </tr>`;
  }).join("");
}

function ovFilter() {
  const q = (document.getElementById("ovq") ? document.getElementById("ovq").value : "").toLowerCase();
  const st = document.getElementById("ovst") ? document.getElementById("ovst").value : "all";
  document.querySelectorAll(".ovmr").forEach(el => {
    const ok = (!q || (el.getAttribute("data-q") || "").indexOf(q) >= 0) && (st === "all" || el.getAttribute("data-st") === st);
    el.style.display = ok ? "" : "none";
  });
}

function ovExport() {
  const csv = "Name,Plan,Since,Status,Note\n" + DATA.members.rows.map(r =>
    [r.name, `"${r.plan}"`, r.since, r.status, `"${r.risk || ""}"`].join(",")).join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "cityzero-members-sample.csv";
  a.click();
  toast(tr("Export", "Exportación"), tr("Sample member CSV downloaded", "CSV sample de miembros descargado"));
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
    <li class="crow click ${c.done ? "done" : ""}" onclick="openClass('${c.name.replace(/'/g, "\\'")}', ${c.booked}, ${c.cap}, ${c.wait || 0})">
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
    <img src="${typeof THEME !== "undefined" && THEME === "light" ? "assets/banners/light/home.webp" : "assets/banner.webp"}" alt="" onerror="this.closest('.hero').remove()">
    <div class="heroshade"></div>
    <div class="herotxt">
      <span class="mono">CITY ZERO · BRICKELL</span>
      <b>${esc(dateStr)}</b>
    </div>
  </div>
  ${topbar("Overview", tr("YOUR GYM, LIVE: EVERY BADGE, EVERY FLOOR, EVERY CLASS, AS IT HAPPENS.", "TU GIMNASIO, EN VIVO: CADA ENTRADA, CADA PISO, CADA CLASE, MIENTRAS PASA."), modeChip())}
  <div class="kpigrid" style="margin-top:18px">
    ${ovCard(KB_I.grid, tr("In the gym now", "En el gym ahora"), t.inNow, "innow-val", `<span class="livedot"></span> LIVE`, "up", tr("Badges through the door, right now", "Entradas por la puerta, ahora mismo"), "#hours")}
    ${ovCard(KB_I.cal3, tr("Check-ins today", "Check-ins hoy"), t.todayTotal, "today-val", CRM_I.tUp + "+12%", "up", tr("vs the 28-day average", "vs el promedio de 28 días"), "#hours")}
    ${ovCard(KB_I.listI, tr("Active members", "Miembros activos"), DATA.grow.members, null, CRM_I.tUp + "+" + DATA.grow.joins, "up", tr("The road to 500, measured", "El camino a 500, medido"), "#grow")}
    ${ovCard(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`, tr("Recoverable revenue", "Ingreso rescatable"), "$" + (DATA.keep.recoverySum + DATA.keep.saveSum).toLocaleString(), null, CRM_I.tDn + tr("leaking", "fugando"), "down", tr("Overdue members who still show up", "Miembros vencidos que siguen viniendo"), "#keep")}
  </div>
  ${(() => { const c = ovChart(); return `
  <div class="crmcard">
    <div class="cchead">
      <div>
        <div class="cctitle">${tr("Gym Activity", "Actividad del gimnasio")}</div>
        <div class="ccdesc">${tr("Door check-ins for the last 3 months", "Check-ins de puerta de los últimos 3 meses")} · <span class="chip gray" style="font-size:9px;padding:1px 6px">SAMPLE ${tr("curve", "curva")}</span></div>
      </div>
      <div class="ccact">
        <select class="select" style="height:30px;width:auto;font-size:12.5px" onchange="toast(tr('Demo range','Rango demo'), tr('The sample dataset covers 3 months','El dataset sample cubre 3 meses')); this.selectedIndex=0">
          <option selected>${tr("3 months", "3 meses")}</option><option>${tr("30 days", "30 días")}</option><option>${tr("7 days", "7 días")}</option>
        </select>
        <select class="select" style="height:30px;width:auto;font-size:12.5px" onchange="toast(tr('Floors','Pisos'), tr('SAMPLE: per-floor split needs the BioStar door map','SAMPLE: el corte por piso requiere el mapa de puertas BioStar')); this.selectedIndex=0">
          <option selected>${tr("All floors", "Todos los pisos")}</option><option>${tr("Floor 1 · Main", "Piso 1 · Principal")}</option><option>${tr("Floor 2 · Studio", "Piso 2 · Studio")}</option><option>${tr("Floor 3 · Weights", "Piso 3 · Pesas")}</option><option>${tr("Floor 4 · Rooftop", "Piso 4 · Rooftop")}</option>
        </select>
        <button class="btn outline sm" onclick="location.hash='${FULL ? "#report" : "#pulsereport"}'">${tr("View report", "Ver reporte")}</button>
      </div>
    </div>
    <div class="actwrap" onmousemove="ovHover(event)" onmouseleave="ovLeave()">
      <div class="achover" id="achover" aria-hidden="true">
        <i class="acdot"></i><i class="acdot dim"></i><i class="acdot dim2"></i>
        <div class="actip" id="actip"></div>
      </div>
      <div class="actlegs">
        <span class="actleg"><i></i>${tr("Check-ins", "Check-ins")}</span>
        <span class="actleg dim"><i></i>${tr("Class bookings", "Reservas de clase")}</span>
        <span class="actleg dim"><i></i>${tr("Returning members", "Miembros recurrentes")}</span>
      </div>
      <svg class="actsvg" viewBox="0 0 1000 240" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="ovg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stop-color="currentColor" stop-opacity=".36"/><stop offset="95%" stop-color="currentColor" stop-opacity=".04"/>
        </linearGradient></defs>
        <path d="${c.area}" fill="url(#ovg)"/>
        <path d="${c.bline}" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width="1.4" vector-effect="non-scaling-stroke"/>
        <path d="${c.nline}" fill="none" stroke="currentColor" stroke-opacity=".32" stroke-width="1.2" vector-effect="non-scaling-stroke"/>
        <path d="${c.line}" fill="none" stroke="currentColor" stroke-width="1.25" vector-effect="non-scaling-stroke"/>
      </svg>
      <div class="actx">${c.labels.map(l => `<span>${l}</span>`).join("")}</div>
    </div>
  </div>`; })()}
  <div class="livetiles">${floors}</div>
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
  <div class="crmcard" style="margin-top:20px">
    <div class="cchead" style="flex-wrap:wrap">
      <div>
        <div class="cctitle">${DATA.grow.members} ${tr("Members", "Miembros")}</div>
        <div class="ccdesc">${tr("Recent member records with plan, billing, status and signup date.", "Registros recientes con plan, cobro, estado y fecha de alta.")} <span class="chip gray" style="font-size:9px;padding:1px 6px;vertical-align:1px">SAMPLE ${tr("rows", "filas")}</span></div>
      </div>
      <div class="ccact">
        <span class="kbsearch">${KB_I.search}<input id="ovq" type="search" placeholder="${tr("Search members...", "Buscar miembros...")}" oninput="ovFilter()"></span>
        <select id="ovst" class="select" style="height:32px;width:auto;font-size:12.5px" onchange="ovFilter()">
          <option value="all">${tr("All status", "Todo estado")}</option>
          <option value="active">${tr("Active", "Activo")}</option>
          <option value="frozen">${tr("Frozen", "Congelado")}</option>
        </select>
        <button class="btn outline sm" onclick="ovExport()">${tr("Export", "Exportar")}</button>
      </div>
    </div>
    <div class="tablewrap"><table class="crmtable">
      <thead><tr><th style="width:34px"></th><th>${tr("Member", "Miembro")}</th><th>${tr("Status", "Estado")}</th><th>${tr("Billing", "Cobro")}</th><th>${tr("Plan", "Plan")}</th><th>${tr("Joined", "Alta")}</th></tr></thead>
      <tbody>${ovMemberRows()}</tbody>
    </table></div>
    <div class="ccfoot"><p>${tr(`Viewing ${DATA.members.rows.length} sample rows of ${DATA.grow.members} members · real rows need Glofox export access`, `Viendo ${DATA.members.rows.length} filas sample de ${DATA.grow.members} miembros · las reales requieren export de Glofox`)}</p></div>
  </div>
  ${demoNote()}`;
}

/* ---------- Profile (template port: dashboard/profile) ---------- */

function avToggle(e) { e.stopPropagation(); const m = document.getElementById("avmenu"); if (m) m.classList.toggle("open"); }
function avHide() { const m = document.getElementById("avmenu"); if (m) m.classList.remove("open"); }
function avGo(h) { avHide(); location.hash = h; }
document.addEventListener("click", avHide);

function vProfile() {
  const badges = `
    <span class="chip amber">DEMO ${tr("ACCOUNT", "CUENTA")}</span>
    <span class="chip green">✓ ${tr("Verified", "Verificada")}</span>
    <span class="chip gray">${tr("Read-only", "Solo lectura")}</span>
    <span class="chip gray">Miami · UTC-4</span>`;
  const tabs = [tr("Overview", "Resumen"), "Personal", tr("Employment", "Empleo"), tr("Compensation", "Compensación"), tr("Time off", "Vacaciones"), tr("Documents", "Documentos")];
  const tabRow = tabs.map((l, i) => `<button class="tab${i === 0 ? " on" : ""}"${i === 0 ? "" : ` onclick="toast('${l}', tr('SAMPLE tab: ships with the real build', 'Tab SAMPLE: llega con el build real'))"`}>${l}</button>`).join("");
  const wd = [
    [tr("Account ID", "ID de cuenta"), "CZ-DEMO-011"], [tr("Department", "Departamento"), tr("Operations", "Operaciones")], [tr("Start date", "Fecha de inicio"), "Aug 20, 2026"],
    [tr("Engagement status", "Estado"), tr("Active", "Activo")], [tr("Team", "Equipo"), "Arqentia · Gym OS"], [tr("Engagement length", "Antigüedad"), tr("9 days", "9 días")],
    [tr("Access level", "Nivel de acceso"), tr("Read-only monitor", "Monitor solo lectura")], [tr("Current project", "Proyecto actual"), tr("Road to 500 members", "Camino a 500 miembros")], ["", ""],
  ].filter(x => x[0]).map(x => `<div class="pfwd"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
  return `
  ${topbar("Profile", tr("THE DEMO ACCOUNT: WHAT IT SEES, WHAT IT CAN NEVER TOUCH", "LA CUENTA DEMO: QUÉ VE Y QUÉ NUNCA PUEDE TOCAR"), p2chip())}
  <div class="crmcard" style="margin-top:18px">
    <div class="pfhead">
      <span class="pfava">RS</span>
      <div class="pfmain">
        <h2>City Zero Demo</h2>
        <p>citizerodemo@arqentia.com · ${tr("Operations Dashboard Account", "Cuenta del dashboard de operaciones")}</p>
        <div class="pfbadges">${badges}</div>
      </div>
      <div class="pfact">
        <button class="btn outline sm" onclick="location.href='mailto:citizerodemo@arqentia.com'">${tr("Email", "Correo")}</button>
        <button class="btn outline sm" onclick="toast(tr('Edit profile', 'Editar perfil'), tr('SAMPLE: profile editing ships with the real build', 'SAMPLE: la edición llega con el build real'))">${CRM_I.pen.replace("<svg", "<svg style='width:13px;height:13px'")} ${tr("Edit profile", "Editar perfil")}</button>
      </div>
    </div>
    <div class="tabs" style="margin-top:16px">${tabRow}</div>
  </div>
  <div class="pfgrid">
    <div class="crmcard" style="margin-bottom:0">
      <div class="cctitle" style="margin-bottom:8px">${tr("About", "Acerca de")}</div>
      <p class="pfabout">${tr(
    "This account runs the CITY 0 OPS pilot for City Zero: one screen over Glofox and BioStar 2 that watches check-ins, classes, leads and payments without writing to any of them. Everything it shows is either captured public evidence or rows marked SAMPLE; the focus is the road from 200+ to 500 members.",
    "Esta cuenta corre el piloto CITY 0 OPS para City Zero: una pantalla sobre Glofox y BioStar 2 que observa check-ins, clases, leads y cobros sin escribir en ninguno. Todo lo que muestra es evidencia pública capturada o filas marcadas SAMPLE; el foco es el camino de 200+ a 500 miembros.")}</p>
      <div class="cctitle" style="margin:20px 0 10px">${tr("Work details", "Detalles")}</div>
      <div class="pfwdgrid">${wd}</div>
      <hr class="ksep2" style="margin:18px 0">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div class="cctitle">${tr("Reporting line", "Línea de reporte")}</div>
          <div class="ccdesc">${tr("Client sponsor", "Sponsor del cliente")}</div>
        </div>
        <button class="btn outline sm" onclick="toast(tr('Org chart', 'Organigrama'), tr('SAMPLE: org data needs Discovery', 'SAMPLE: el organigrama requiere Discovery'))">${tr("Org chart", "Organigrama")}</button>
      </div>
      <div class="pfrep"><span class="pfava sm">BP</span><div><b>Beto Pérez</b><span>${tr("Founder · City Zero (public)", "Founder · City Zero (público)")}</span></div></div>
    </div>
    <div class="pfrail">
      <div class="crmcard" style="margin-bottom:14px">
        <div class="cctitle" style="margin-bottom:10px">${tr("Record status", "Estado del registro")}</div>
        <div class="pfst">${KB_I.check2}<div><b>${tr("Demo access active", "Acceso demo activo")}</b><span>${tr("Read-only: no writes to any City Zero system", "Solo lectura: sin escrituras a ningún sistema de City Zero")}</span></div></div>
        <p class="ccdesc" style="margin-top:12px">${tr("Updated Aug 29, 2026 by Arqentia", "Actualizado 29 ago 2026 por Arqentia")}</p>
      </div>
      <div class="crmcard" style="margin-bottom:0">
        <div class="cctitle" style="margin-bottom:10px">${tr("Upcoming events", "Próximos eventos")}</div>
        <div class="pfev">${KB_I.cal3}<div><b>${tr("Demo walkthrough", "Recorrido del demo")}</b><span>${tr("This week", "Esta semana")}</span></div></div>
        <div class="pfev">${KB_I.cal3}<div><b>Discovery</b><span>${tr("Pending authorization", "Pendiente de autorización")}</span></div></div>
      </div>
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
          <polyline points="${pts}" fill="none" stroke="var(--live)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
  if (r < 0.35) return `color-mix(in srgb, var(--live) ${Math.round(20 + (r / 0.35) * 45)}%, transparent)`;
  if (r < 0.6) return `color-mix(in srgb, var(--warnY, #eab308) ${Math.round(38 + ((r - 0.35) / 0.25) * 34)}%, transparent)`;
  if (r < 0.82) return `color-mix(in srgb, var(--warnO, #f97316) ${Math.round(48 + ((r - 0.6) / 0.22) * 30)}%, transparent)`;
  return `color-mix(in srgb, var(--red) ${Math.round(58 + ((r - 0.82) / 0.18) * 32)}%, transparent)`;
}
const heatBand = r => r < 0.35 ? "var(--live)" : r < 0.6 ? "var(--warnY, #eab308)" : r < 0.82 ? "var(--warnO, #f97316)" : "var(--red)";

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

/* Inbox unificado (Studio Chat del template, adaptado a City Zero) */
function vInbox(selId) {
  const ib = DATA.inbox;
  const sel = ib.convos.find(c => c.id === selId) || ib.convos[0];
  const unreadTotal = ib.convos.reduce((a, c) => a + c.unread, 0);
  const chIcon = { WhatsApp: "wa", Instagram: "ig", Email: "mail", Facebook: "fb", "Web chat": "chat", Phone: "ph" };
  const chans = ib.channels.map(([n, c]) => `
    <div class="ibch"><span>${esc(n)}</span><b class="mono">${c || ""}</b></div>`).join("");
  const rows = (pin) => ib.convos.filter(c => c.pin === pin).map(c => `
    <div class="ibrow ${c.id === sel.id ? "sel" : ""}" onclick="location.hash='inbox/${c.id}'">
      ${favatar(c.name, 32)}
      <div class="ibmid">
        <div class="ibtop"><b>${esc(c.name)}</b><span class="mono">${esc(c.when)}</span></div>
        <div class="ibprev">${esc(c.prev)}</div>
        <div class="ibchip">${esc(c.ch)}</div>
      </div>
      ${c.unread ? `<span class="n hot ibun">${c.unread}</span>` : ""}
    </div>`).join("");
  const msgs = sel.thread.map(m => m.who === "them" ? `
    <div class="msg them">${favatar(sel.name, 26)}<div class="mb"><p>${esc(m.txt)}</p><span class="mt mono">${esc(m.t)}</span></div></div>` : `
    <div class="msg us"><div class="mb"><p>${esc(m.txt)}</p><span class="mt mono">${esc(m.t)}</span></div><span class="favatar" style="width:26px;height:26px"><i>CZ</i></span></div>`).join("");
  return `
  ${topbar("Inbox", tr("EVERY CHANNEL A LEAD CAN ARRIVE THROUGH, ONE SCREEN, ONE REPLY BOX.", "TODOS LOS CANALES POR DONDE LLEGA UN LEAD, UNA PANTALLA, UNA CAJA DE RESPUESTA."), p2chip())}
  <div class="grid"><div class="panel wide ibwrap">
    <div class="ibgrid">
      <aside class="ibleft">
        <div class="iblt">${tr("Inbox", "Bandeja")}<b class="mono">${unreadTotal}</b></div>
        <div class="ibsec">${tr("Channels", "Canales")}</div>
        ${chans}
        <div class="ibnote">${esc(ib.note)}</div>
      </aside>
      <div class="iblist">
        <div class="ibsec">${tr("Pinned", "Fijados")}</div>
        ${rows(true)}
        <div class="ibsec">${tr("Today", "Hoy")}</div>
        ${rows(false)}
      </div>
      <div class="ibthread">
        <div class="ibhead">
          ${favatar(sel.name, 34)}
          <div><b>${esc(sel.name)}</b><span>${esc(sel.role)} · ${esc(sel.ch)}</span></div>
          <span class="chip gray" style="margin-left:auto">SAMPLE</span>
        </div>
        <div class="ibmsgs">${msgs}</div>
        <div class="ibcomposer">
          <div class="ibtabs"><b>${tr("Reply", "Responder")}</b><span>${tr("Internal note", "Nota interna")}</span></div>
          <textarea class="input" id="ib-draft" rows="2" placeholder="${tr("Type your message...", "Escribe tu mensaje...")}"></textarea>
          <div class="ibtools">
            <span class="hint">${tr("Sends from City Zero's own account", "Sale de la cuenta propia de City Zero")} · ${esc(sel.ch)}</span>
            <button class="btn" onclick="ibSend('${sel.id}')">${tr("Send", "Enviar")}</button>
          </div>
        </div>
      </div>
    </div>
  </div></div>
  ${demoNote()}`;
}
function ibSend(id) {
  const el = document.getElementById("ib-draft");
  const txt = (el?.value || "").trim();
  if (!txt) return;
  const c = DATA.inbox.convos.find(x => x.id === id);
  c.thread.push({ who: "us", t: tr("now", "ahora"), txt });
  c.unread = 0;
  toast(tr("Reply sent", "Respuesta enviada"), tr("Queued on the channel's own account (demo).", "En cola en la cuenta propia del canal (demo)."));
  render();
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

/* ---------- CRM (template port: Overview / Board / List) ---------- */

let PIPE_VIEW = localStorage.getItem("c0.pipeview") || "overview";
let PIPE_PAGE = 0;

function setPipeView(v) { PIPE_VIEW = v; PIPE_PAGE = 0; localStorage.setItem("c0.pipeview", v); render(); }

function leadHealth(c) {
  if (c.breach) return { key: "at-risk", label: tr("At Risk", "En riesgo"), score: 7 };
  if (c.stage !== "member" && c.days >= 9) return { key: "on-hold", label: tr("On Hold", "En pausa"), score: 4 };
  if (c.stage !== "member" && (c.days >= 6 || (c.stage === "new" && c.days >= 2))) return { key: "needs-review", label: tr("Needs Review", "Necesita revisión"), score: 11 };
  return { key: "on-track", label: tr("On Track", "En curso"), score: 18 };
}

function leadValue(c) { return [1560, 1900, 2160, 2400][_mhash(c.name) % 4]; }
function fmtMoney(v) { return "$" + v.toLocaleString("en-US"); }
function pipePri(c) {
  if (c.breach || c.days <= 1) return [tr("High", "Alta"), "red"];
  if (c.days <= 4) return [tr("Medium", "Media"), "amber"];
  return [tr("Low", "Baja"), "gray"];
}

const CRM_I = {
  arrUR: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>`,
  tUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  tDn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>`,
  cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
  pen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>`,
  chL: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  chR: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
};

const KB_I = {
  grip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  moreV: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>`,
  flame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  minus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>`,
  clip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,
  msg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
  check2: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  sliders: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>`,
  updown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>`,
  chevD: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  kanb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5v11"/><path d="M12 5v6"/><path d="M18 5v14"/></svg>`,
  listI: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/></svg>`,
  grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  cal3: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
};

let KB_Q = "", KB_PRI = "all", KB_SORT = "days";

function priKey(c) { if (c.breach || c.days <= 1) return "high"; if (c.days <= 4) return "medium"; return "low"; }

function kbSearch(v) {
  const q = v.toLowerCase();
  document.querySelectorAll(".kbtask").forEach(el => {
    el.style.opacity = !q || (el.getAttribute("data-q") || "").indexOf(q) >= 0 ? "" : ".25";
  });
}
function kbCyclePri() {
  const order = ["all", "high", "medium", "low"];
  KB_PRI = order[(order.indexOf(KB_PRI) + 1) % order.length];
  render();
}
function kbToggleSort() { KB_SORT = KB_SORT === "days" ? "priority" : "days"; render(); }

function kbTeam(c) {
  const s = c.source.toLowerCase();
  if (c.paid) return ["Paid", "#a78bfa"];
  if (s.indexOf("landing") >= 0 || s.indexOf("form") >= 0 || s.indexOf("website") >= 0) return ["Forms", "#60a5fa"];
  if (s.indexOf("instagram") >= 0 || s.indexOf("dm") >= 0) return ["Social", "#f472b6"];
  if (s.indexOf("classpass") >= 0 || s.indexOf("wellhub") >= 0) return ["Partner", "#2dd4bf"];
  return ["Front desk", "#fbbf24"];
}

function kbTaskCard(c, stKey) {
  const h = _mhash(c.name);
  const pk = priKey(c);
  const badge = { high: [KB_I.flame, "high", "High"], medium: [`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>`, "med", "Medium"], low: [KB_I.minus, "low", "Low"] }[pk];
  const loc = (typeof LANG !== "undefined" && LANG === "es") ? "es" : "en-US";
  const since = new Intl.DateTimeFormat(loc, { month: "short", day: "numeric" }).format(new Date(Date.now() - c.days * 864e5));
  const ini = esc(c.name.split(" ").map(w => w[0]).join("").slice(0, 2));
  const nm = c.name.replace(/'/g, "\\'");
  const details = stKey === "tour" || stKey === "trial";
  const done = stKey === "member";
  const prog = Math.min(96, 18 + (h % 60) + (["new", "contacted", "tour", "trial", "member"].indexOf(c.stage) + 1) * 12);
  const team = kbTeam(c);
  const ownerRow = `
    <div class="kbmeta">
      <span class="kbown"><span class="kbava">${ini}</span>${esc(c.owner)}</span>
      <span class="kbdue">${since}${KB_I.cal3}</span>
    </div>`;
  const detailRows = `
    <div class="kbdet">
      <div class="kbpl"><span>${tr("Progress", "Progreso")}</span><span class="mono">${prog}%</span></div>
      <div class="progress" style="height:8px"><div class="bar" style="width:${prog}%"></div></div>
      <div class="kbrow"><span>${tr("Owner", "Dueño")}</span><span class="kbrv">${esc(c.owner)}<span class="kbava">${ini}</span></span></div>
      <div class="kbrow"><span>${tr("In stage since", "En etapa desde")}</span><span class="kbrv">${since}${KB_I.cal3}</span></div>
      <div class="kbrow"><span>${tr("Channel", "Canal")}</span><span class="ktag" style="background:color-mix(in oklab, ${team[1]} 16%, transparent);color:color-mix(in oklab, ${team[1]} 72%, var(--foreground))">${team[0]}</span></div>
    </div>`;
  const foot = done
    ? `<div class="kbdone">${KB_I.check2}${tr("Member", "Miembro")}</div>`
    : `<div class="kbfoot">
        <span>${KB_I.clip}${h % 4}</span>
        <span>${KB_I.msg}${1 + h % 9}</span>
        <span>${KB_I.file}${h % 3}</span>
      </div>`;
  return `
  <article class="kbtask click${c.breach ? " breach" : ""}" data-q="${esc((c.name + " " + c.source + " " + c.next).toLowerCase())}" onclick="openLead('${nm}')">
    <div class="kbth"><h3>${esc(c.name)}</h3><span class="kbadge ${badge[1]}">${badge[0]}${badge[2]}</span></div>
    <p class="kbdesc">${esc(c.next)}</p>
    ${details ? detailRows : ownerRow}
    <hr class="ksep2">
    ${foot}
  </article>`;
}

function kbColumn(st, p) {
  let cards = p.cards.filter(c => c.stage === st.key);
  if (KB_PRI !== "all") cards = cards.filter(c => priKey(c) === KB_PRI);
  const rank = { high: 0, medium: 1, low: 2 };
  cards = cards.slice().sort((a, b) => KB_SORT === "priority" ? rank[priKey(a)] - rank[priKey(b)] : a.days - b.days);
  return `
  <section class="kbcol">
    <div class="kbhead">
      <div class="kbhl">
        <div class="kbtitle">${KB_I.grip}<h2 data-tip="SLA: ${esc(st.sla)}">${esc(st.label)}</h2></div>
        <p>${cards.length} ${cards.length === 1 ? "lead" : "leads"}</p>
      </div>
      <div class="kbha">
        <button class="kbicon" data-tip="${tr("Leads enter from live channels", "Los leads entran de canales en vivo")}" onclick="window.open('landing.html','_blank')">${KB_I.plus}</button>
        <button class="kbicon" data-tip="SLA: ${esc(st.sla)}">${KB_I.moreV}</button>
      </div>
    </div>
    <div class="kbcards">${cards.map(c => kbTaskCard(c, st.key)).join("")}</div>
  </section>`;
}

function kbToolbar() {
  const priLbl = KB_PRI === "all" ? tr("Filter", "Filtrar") : { high: "High", medium: "Medium", low: "Low" }[KB_PRI];
  const sortLbl = KB_SORT === "days" ? tr("Sort", "Orden") : tr("Priority", "Prioridad");
  return `
  <div class="kbbar">
    ${pipeTabs(true)}
    <div class="kbact">
      <span class="kbsearch">${KB_I.search}<input type="search" placeholder="${tr("Search leads", "Buscar leads")}" oninput="kbSearch(this.value)"></span>
      <button class="btn outline sm" onclick="kbCyclePri()">${KB_I.sliders}${priLbl}</button>
      <button class="btn outline sm" onclick="kbToggleSort()">${KB_I.updown}${sortLbl}</button>
      <span class="btngrp">
        <button class="btn solid sm" data-tip="${tr("Leads enter from the live landing form", "Los leads entran del form del landing en vivo")}" onclick="window.open('landing.html','_blank')">${KB_I.plus}${tr("Add lead", "Añadir lead")}</button>
        <button class="btn solid sm sq" onclick="toast(tr('Lead intake', 'Entrada de leads'), tr('CSV import and automations land with Phase 2', 'Import CSV y automatizaciones llegan con Fase 2'))">${KB_I.chevD}</button>
      </span>
    </div>
  </div>`;
}

function pipeTabs(inline) {
  const t = [["overview", tr("Overview", "Resumen"), KB_I.grid], ["board", tr("Board", "Tablero"), KB_I.kanb], ["list", tr("List", "Lista"), KB_I.listI]];
  return `<div class="tabs"${inline ? "" : ' style="margin-bottom:16px"'}>${t.map(([k, l, ic]) =>
    `<button class="tab${PIPE_VIEW === k ? " on" : ""}" onclick="setPipeView('${k}')">${ic}${l}</button>`).join("")}</div>`;
}

function kpiCard(desc, big, dir, delta, last) {
  return `<div class="kpicard">
    <div class="kpitop"><span>${desc}</span>${CRM_I.arrUR}</div>
    <div class="kpirow"><span class="kpiv">${big}</span><span class="kbadge ${dir}">${dir === "up" ? CRM_I.tUp : CRM_I.tDn}${delta}</span></div>
    <div class="kpilast"><b>${last}</b> ${tr("last month", "mes pasado")}</div>
  </div>`;
}

function pipeTableRows(cards) {
  return cards.map(c => {
    const h = leadHealth(c), pri = pipePri(c);
    const idx = DATA.pipeline.cards.indexOf(c) + 1;
    const stage = DATA.pipeline.stages.find(s => s.key === c.stage);
    const strip = Array.from({ length: 18 }, (_, k) => `<i class="${k < h.score ? "on" : ""}"></i>`).join("");
    const nm = c.name.replace(/'/g, "\\'");
    return `<tr>
      <td onclick="event.stopPropagation()"><input type="checkbox" class="ck" aria-label="Select ${esc(c.name)}"></td>
      <td class="mono" style="font-size:12.5px">LD-${String(idx).padStart(3, "0")}</td>
      <td class="t" style="white-space:nowrap">${esc(c.name)}</td>
      <td><span class="pill">${esc(stage ? stage.label : c.stage)}</span></td>
      <td style="color:var(--${pri[1] === "gray" ? "muted-foreground" : pri[1]})">${pri[0]}</td>
      <td><div class="hstrip" data-tip="${h.label}">${strip}</div></td>
      <td class="mono">${fmtMoney(leadValue(c))}</td>
      <td style="text-align:right"><button class="btn ghost xs pedit" data-tip="${tr("Open lead", "Abrir lead")}" onclick="openLead('${nm}')">${CRM_I.pen.replace("<svg", "<svg style='width:14px;height:14px'")}</button></td>
    </tr>`;
  }).join("");
}

function pipeListFilter() {
  const p = DATA.pipeline;
  const q = (document.getElementById("pipeq") ? document.getElementById("pipeq").value : "").toLowerCase();
  const st = document.getElementById("pipestage") ? document.getElementById("pipestage").value : "all";
  const hl = document.getElementById("pipehealth") ? document.getElementById("pipehealth").value : "all";
  const rows = p.cards.filter(c =>
    (!q || c.name.toLowerCase().includes(q) || c.source.toLowerCase().includes(q)) &&
    (st === "all" || c.stage === st) && (hl === "all" || leadHealth(c).key === hl));
  const pages = Math.max(1, Math.ceil(rows.length / 10));
  if (PIPE_PAGE >= pages) PIPE_PAGE = pages - 1;
  if (PIPE_PAGE < 0) PIPE_PAGE = 0;
  const view = rows.slice(PIPE_PAGE * 10, PIPE_PAGE * 10 + 10);
  const tb = document.getElementById("pipetbody");
  if (!tb) return;
  tb.innerHTML = pipeTableRows(view) || `<tr><td colspan="8" style="text-align:center;padding:34px 0;color:var(--muted-foreground)">${tr("No results.", "Sin resultados.")}</td></tr>`;
  document.getElementById("pipecount").textContent = tr(`Viewing ${view.length} out of ${rows.length} leads`, `Viendo ${view.length} de ${rows.length} leads`);
  let pg = `<button class="pgb${PIPE_PAGE === 0 ? " off" : ""}" onclick="pipePg(-1)">${CRM_I.chL}${tr("Previous", "Anterior")}</button>`;
  for (let i = 0; i < pages; i++) pg += `<button class="pgb num${i === PIPE_PAGE ? " on" : ""}" onclick="pipePgTo(${i})">${i + 1}</button>`;
  pg += `<button class="pgb${PIPE_PAGE >= pages - 1 ? " off" : ""}" onclick="pipePg(1)">${tr("Next", "Siguiente")}${CRM_I.chR}</button>`;
  document.getElementById("pipepgn").innerHTML = pg;
}
function pipePg(d) { PIPE_PAGE += d; pipeListFilter(); }
function pipePgTo(i) { PIPE_PAGE = i; pipeListFilter(); }

function crmOverview(p) {
  const g = DATA.grow;
  const open = p.cards.filter(c => c.stage !== "member");
  const value = open.reduce((s, c) => s + leadValue(c), 0);
  const l2t = Math.round(g.funnel[1].n / g.funnel[0].n * 1000) / 10;
  const l2m = Math.round(g.funnel[2].n / g.funnel[0].n * 1000) / 10;
  const loc = (typeof LANG !== "undefined" && LANG === "es") ? "es" : "en-US";
  const mfmt = new Intl.DateTimeFormat(loc, { month: "short" });
  const max = Math.max.apply(null, p.flow);
  const now = new Date();
  const months = p.flow.map((v, i) => mfmt.format(new Date(now.getFullYear(), now.getMonth() - (p.flow.length - 1 - i), 1)));
  const total = p.flow.reduce((a, b) => a + b, 0);
  const tPct = Math.round(p.toursBooked / total * 100);
  const bars = p.flow.map((v, i) => `<div class="cfcol" data-tip="${months[i]} · ${v} leads"><div class="cfbar" style="height:${Math.round(v / max * 100)}%"></div></div>`).join("");
  const today = g.tours.filter(t => t.when.indexOf("Today") === 0 || t.when.indexOf("Hoy") === 0);
  const t1 = today[0] || g.tours[0];
  const jg = p.joinsGoal;
  const active = Math.round(jg.done / jg.target * 42);
  const goalBars = Array.from({ length: 42 }, (_, i) => `<i class="${i < active ? "on" : ""}"></i>`).join("");

  return `
  <section class="crmhead">
    <h2>${tr("Pipeline Overview", "Resumen del pipeline")}</h2>
    <p>${tr("Keep tabs on lead quality, open tours, and conversion across the current sales cycle.", "Calidad de leads, tours abiertos y conversión del ciclo de venta actual.")} <span class="chip gray" style="vertical-align:1px">SAMPLE</span></p>
  </section>
  <div class="kpigrid">
    ${kpiCard(tr("Lead Pipeline Value", "Valor del pipeline"), fmtMoney(value), "up", "+12%", fmtMoney(Math.round(value * 0.89 / 100) * 100))}
    ${kpiCard(tr("Lead-to-Tour Rate", "Tasa lead a tour"), l2t + "%", "down", "-2.5%", (l2t + 2.5).toFixed(1) + "%")}
    ${kpiCard(tr("Open Leads", "Leads abiertos"), open.length, "up", "+3", open.length - 3)}
    ${kpiCard(tr("Lead-to-Member Rate", "Tasa lead a miembro"), l2m + "%", "up", "+1.6%", (l2m - 1.6).toFixed(1) + "%")}
  </div>

  <div class="crmcard">
    <div class="cchead">
      <div class="cctitle">${tr("Lead Flow", "Flujo de leads")}</div>
      <select class="select" style="height:30px;width:auto;font-size:12.5px" onchange="toast(tr('Demo range','Rango demo'), tr('The sample dataset covers the last 12 months','El dataset sample cubre los últimos 12 meses')); this.selectedIndex=2">
        <option>${tr("Last 30 days", "Últimos 30 días")}</option><option>${tr("Last quarter", "Último trimestre")}</option><option selected>${tr("Last 12 months", "Últimos 12 meses")}</option>
      </select>
    </div>
    <div class="ccbody">
      <div class="cflowwrap">
        <div class="cflow">${bars}</div>
        <div class="cflowx">${months.map(m => `<span>${m}</span>`).join("")}</div>
      </div>
      <div class="crail">
        <div>
          <div class="crailbig">${total} <span>leads</span></div>
          <div class="crailsub" style="margin-top:6px">${tr("Total leads captured over the last 12 months.", "Total de leads capturados en los últimos 12 meses.")}</div>
        </div>
        <div class="railbox">
          <div class="railk">${tr("Tours booked", "Tours agendados")}</div>
          <div>
            <div class="railn">${p.toursBooked} <span>tours</span></div>
            <div class="crailsub" style="margin-top:5px">${tr(tPct + "% of leads booked a tour.", tPct + "% de los leads agendaron tour.")}</div>
          </div>
          <div class="progress" style="height:9px"><div class="bar" style="width:${tPct}%"></div></div>
          <div class="railf"><b>${p.toursBooked} ${tr("booked", "agendados")}</b><span>${total} ${tr("captured", "capturados")}</span></div>
        </div>
      </div>
    </div>
  </div>

  <div class="crmrow2" style="margin-bottom:16px">
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead">
        <div class="cctitle">${tr("Upcoming Tours", "Próximos tours")}</div>
        <button class="btn outline sm" onclick="location.hash='#classes'">${CRM_I.cal.replace("<svg", "<svg style='width:14px;height:14px'")} ${tr("View Classes", "Ver clases")}</button>
      </div>
      <div class="tlticks"><div><span>4:45 PM</span><i></i></div><div><span>5:00 PM</span><i></i></div><div><span>6:00 PM</span><i></i></div><div><span>6:20 PM</span><i></i></div></div>
      <div class="tlarea">
        <div class="tlline"></div>
        <div class="tlchip" onclick="location.hash='#grow'" data-tip="${tr("All tours live in Grow", "Los tours viven en Grow")}">
          <span class="ico">${CRM_I.cal.replace("<svg", "<svg style='width:14px;height:14px'")}</span>
          <span style="min-width:0"><span class="tn" style="display:block">${tr("Tour with", "Tour con")} ${esc(t1.name)}</span><span class="ts" style="display:block">${tr("Guided tour form", "Formulario de tour")} · ${esc(t1.when)}${t1.confirmed ? "" : " · " + tr("unconfirmed", "sin confirmar")}</span></span>
        </div>
        <div class="tlmark"></div>
      </div>
    </div>
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead" style="margin-bottom:8px"><div class="cctitle">${tr("Monthly Joins Goal", "Meta de altas del mes")}</div></div>
      <div class="goalhead">
        <div class="goaln">${jg.done} <span>${tr("joined", "altas")}</span></div>
        <div class="goalt">${jg.target} ${tr("target", "meta")}</div>
      </div>
      <div class="goalbars">${goalBars}</div>
      <div class="goalsub">${Math.round(jg.done / jg.target * 100)}${tr("% of this month's join target reached.", "% de la meta de altas del mes alcanzada.")}</div>
    </div>
  </div>

  <div class="crmcard">
    <div class="cchead">
      <div>
        <div class="cctitle">${tr("Recent Leads", "Leads recientes")}</div>
        <div class="ccdesc">${tr("Leads moving through tour, trial and joining stages.", "Leads moviéndose por tour, trial y alta.")}</div>
      </div>
      <button class="btn ghost sm" onclick="setPipeView('list')">${tr("Open list view", "Abrir vista lista")} →</button>
    </div>
    <div class="tablewrap"><table class="crmtable">
      <thead><tr><th style="width:34px"></th><th>ID</th><th>${tr("Lead", "Lead")}</th><th>${tr("Stage", "Etapa")}</th><th>${tr("Priority", "Prioridad")}</th><th>${tr("Health", "Salud")}</th><th>${tr("Value", "Valor")}</th><th style="text-align:right">${tr("Edit", "Editar")}</th></tr></thead>
      <tbody>${pipeTableRows(p.cards.slice(0, 6))}</tbody>
    </table></div>
  </div>`;
}

function crmList(p) {
  setTimeout(pipeListFilter, 0);
  return `
  <div class="crmcard">
    <div class="cchead" style="flex-wrap:wrap">
      <div>
        <div class="cctitle">${tr("Recent Leads", "Leads recientes")}</div>
        <div class="ccdesc">${tr("Track leads moving through tour, trial and joining stages.", "Sigue los leads por tour, trial y alta.")}</div>
      </div>
      <div class="ccact">
        <input id="pipeq" class="input" style="height:28px;width:190px;font-size:12.5px" placeholder="${tr("Search leads...", "Buscar leads...")}" oninput="PIPE_PAGE=0;pipeListFilter()">
        <select id="pipestage" class="select" style="height:28px;width:auto;font-size:12.5px" onchange="PIPE_PAGE=0;pipeListFilter()">
          <option value="all">${tr("All stages", "Todas las etapas")}</option>
          ${p.stages.map(s => `<option value="${s.key}">${esc(s.label)}</option>`).join("")}
        </select>
        <select id="pipehealth" class="select" style="height:28px;width:auto;font-size:12.5px" onchange="PIPE_PAGE=0;pipeListFilter()">
          <option value="all">${tr("All health", "Toda salud")}</option>
          <option value="on-track">${tr("On Track", "En curso")}</option>
          <option value="needs-review">${tr("Needs Review", "Necesita revisión")}</option>
          <option value="at-risk">${tr("At Risk", "En riesgo")}</option>
          <option value="on-hold">${tr("On Hold", "En pausa")}</option>
        </select>
      </div>
    </div>
    <div class="tablewrap"><table class="crmtable">
      <thead><tr><th style="width:34px"></th><th>ID</th><th>${tr("Lead", "Lead")}</th><th>${tr("Stage", "Etapa")}</th><th>${tr("Priority", "Prioridad")}</th><th>${tr("Health", "Salud")}</th><th>${tr("Value", "Valor")}</th><th style="text-align:right">${tr("Edit", "Editar")}</th></tr></thead>
      <tbody id="pipetbody"></tbody>
    </table></div>
    <div class="ccfoot"><p id="pipecount"></p><div class="pgn" id="pipepgn"></div></div>
  </div>`;
}

function vPipeline() {
  const qv = new URLSearchParams(location.search).get("pview");
  if (qv && ["overview", "board", "list"].indexOf(qv) >= 0 && !vPipeline._qs) { PIPE_VIEW = qv; vPipeline._qs = true; }
  const p = DATA.pipeline;
  const live = JSON.parse(localStorage.getItem("c0.leads") || "[]");
  live.forEach(l => {
    if (!p.cards.some(c => c.name === l.name && c.landing)) {
      p.cards.unshift({ name: l.name, source: "Landing page - tour form", landing: true, stage: STATE.stages[l.name] || "new", days: 0, owner: "Front desk", next: "Confirm tour slot by text" });
    }
  });
  const breaches = p.cards.filter(c => c.breach).length;
  const cols = p.stages.map(st => kbColumn(st, p)).join("");

  let body;
  if (PIPE_VIEW === "board") {
    body = `${kbToolbar()}<div class="kanban2">${cols}</div>`;
  } else if (PIPE_VIEW === "list") {
    body = crmList(p);
  } else {
    body = crmOverview(p);
  }

  return `
  ${topbar("Pipeline", "EVERY LEAD, ONE BOARD, AN OWNER AND A CLOCK ON EACH", p2chip())}
  ${PIPE_VIEW === "board" ? "" : pipeTabs()}
  ${body}
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

/* ---------- Classes (port de dashboard/academy: estadísticas por clase) ---------- */

function clsStatsFor(name) {
  const C = DATA.classes;
  const li = C.list.find(x => x.name === name) || { cap: 20, coach: "Team coach" };
  const g = C.grid.find(x => x.cls === name);
  const slots = g ? g.slots : [12, 14, 13, 15, 12, 10];
  const waits = g && g.wait ? g.wait : [0, 0, 0, 0, 0, 0];
  const fills = slots.map(s => Math.min(100, Math.round(s / li.cap * 100)));
  const avg = Math.round(fills.reduce((a, b) => a + b, 0) / fills.length);
  const bi = fills.indexOf(Math.max.apply(null, fills));
  const sess = (DATA.heatmap.classes || []).filter(c => c.name === name).length || 6;
  return { li, slots, waits, fills, avg, bi, sess, info: (C.info || {})[name] || {}, wsum: waits.reduce((a, b) => a + b, 0) };
}

function clsStatMount() {
  const sel = document.getElementById("clsPick");
  const box = document.getElementById("clsStatBox");
  if (!sel || !box) return;
  const name = sel.value;
  const s = clsStatsFor(name);
  const days = [tr("Mon", "Lun"), tr("Tue", "Mar"), tr("Wed", "Mié"), tr("Thu", "Jue"), tr("Fri", "Vie"), tr("Sat", "Sáb")];
  const bars = s.fills.map((f, i) => `
    <div class="csb" data-tip="${days[i]}: ${s.slots[i]}/${s.li.cap} (${f}%)${s.waits[i] ? " · +" + s.waits[i] + " wait" : ""}">
      <div class="csbt"><i style="height:${f}%" class="${f >= 95 ? "hot" : f < 55 ? "low" : ""}"></i></div>
      <span>${days[i]}</span>
    </div>`).join("");
  const insight = s.wsum > 0
    ? tr(`${s.wsum} people are waiting for a spot: demand for another slot already exists.`, `${s.wsum} personas esperan cupo: la demanda para otro horario ya existe.`)
    : s.avg < 60
      ? tr(`Room to sell: averages ${s.avg}% full. A push here costs $0 in ads.`, `Espacio por vender: promedia ${s.avg}%. Empujarla cuesta $0 en ads.`)
      : tr(`Healthy fill at ${s.avg}%. Best day: ${days[s.bi]} at ${s.fills[s.bi]}%.`, `Ocupación sana de ${s.avg}%. Mejor día: ${days[s.bi]} con ${s.fills[s.bi]}%.`);
  const nm = name.replace(/'/g, "\\'");
  box.innerHTML = `
    <div class="csinst">
      <span class="kbava" style="width:30px;height:30px;font-size:11px">${esc((s.info.inst || s.li.coach || "TC").split(" ").map(w => w[0]).join("").slice(0, 2))}</span>
      <div><b>${esc(s.info.inst || s.li.coach || "Team coach")}</b><span>${s.info.real ? tr("instructor · REAL", "instructor · REAL") : tr("Team coach · SAMPLE", "Coach del equipo · SAMPLE")} · ${s.info.dur || 50} min</span></div>
      <button class="btn outline sm" style="margin-left:auto" onclick="openClass('${nm}')">${tr("Open class card", "Abrir ficha")}</button>
    </div>
    <div class="csmini">
      <div><span>${tr("Avg. fill", "Ocupación prom.")}</span><b>${s.avg}%</b></div>
      <div><span>${tr("Waitlist", "Lista de espera")}</span><b class="${s.wsum ? "amber" : ""}">${s.wsum}</b></div>
      <div><span>${tr("Sessions / week", "Sesiones / semana")}</span><b>${s.sess}</b></div>
      <div><span>${tr("Capacity per class", "Capacidad por clase")}</span><b>${s.li.cap} ${tr("spots", "cupos")}</b></div>
    </div>
    <div class="csbars">${bars}</div>
    <div class="csnote">${insight}</div>`;
}

function vClassStats() {
  const C = DATA.classes;
  const allSlots = C.grid.flatMap((r, ri) => r.slots.map(v => ({ v, cap: (C.list[ri] || { cap: 20 }).cap })));
  const fill = Math.round(allSlots.reduce((a, x) => a + x.v / x.cap, 0) / allSlots.length * 100);
  const waitTotal = C.grid.reduce((a, r) => a + (r.wait || []).reduce((x, y) => x + y, 0), 0);
  const weekCount = (DATA.heatmap.classes || []).length || 36;
  const atCap = allSlots.filter(x => x.v / x.cap >= 0.95).length;
  const members = allSlots.reduce((a, x) => a + x.v, 0);
  const infoIco = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;color:var(--muted-foreground)"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
  const upIco = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>`;
  const acCard = (t, big, badge, ctx) => `
    <div class="kpicard ackpi">
      <div class="ach"><span>${t}</span>${infoIco}</div>
      <div class="kpirow"><span class="kpiv">${big}</span>${badge ? `<span class="kbadge up" style="border-radius:4px;padding:2px 5px">${upIco}${badge}</span>` : ""}</div>
      <div class="acctx">${ctx}</div>
    </div>`;

  const lf = new Intl.DateTimeFormat(LANG === "es" ? "es" : "en-US", { weekday: "long", day: "numeric", month: "long" });
  const todayStr = lf.format(new Date());
  const nowH = new Date().getHours();
  const schedRows = DATA.today.classesToday.map(c => {
    const h24 = parseInt(c.at) + (c.at.indexOf("PM") > 0 && parseInt(c.at) !== 12 ? 12 : 0);
    const st = c.done ? [tr("Done", "Hecha"), "gray"] : h24 === nowH ? [tr("In Progress", "En curso"), "green"] : c.booked >= c.cap ? [tr("Full", "Llena"), "red"] : [tr("Upcoming", "Próxima"), "amber"];
    const dur = ((C.info || {})[c.name] || {}).dur || 50;
    const nm = c.name.replace(/'/g, "\\'");
    return `
    <div class="asrow click" onclick="openClass('${nm}', ${c.booked}, ${c.cap}, ${c.wait || 0})">
      <div class="asl"><i class="asbar ${st[1]}"></i><div class="ast"><b>${esc(c.at)} · ${dur} min</b><span>${todayStr}</span></div></div>
      <div class="asmid"><b>${esc(c.name)}</b><span>${c.booked}/${c.cap} ${tr("booked", "reservados")}${c.wait ? ` · +${c.wait} ${tr("waitlist", "en espera")}` : ""}</span></div>
      <span class="asbadge ${st[1]}">${st[0]}</span>
    </div>`;
  }).join("");

  /* Class Status: port de assignment-status.tsx (barras agrupadas con patrón
     de puntos): Booked / Open seats / Waitlist por clase. */
  const groups = C.grid.slice(0, 5).map(g => {
    const li = C.list.find(x => x.name === g.cls) || { cap: 20 };
    const avg = Math.round(g.slots.reduce((a, b) => a + b, 0) / g.slots.length);
    return {
      abbr: g.cls.split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase(),
      name: g.cls, booked: avg, open: Math.max(0, li.cap - avg),
      wait: (g.wait || []).reduce((a, b) => a + b, 0),
    };
  });
  const gmax = Math.max.apply(null, groups.flatMap(g => [g.booked, g.open, g.wait])) * 1.1;
  const gCols = groups.map(g => `
    <div class="gcol" data-tip="${esc(g.name)}: ${g.booked} ${tr("booked", "reservados")} · ${g.open} ${tr("open", "libres")} · ${g.wait} ${tr("waitlist", "espera")}">
      <div class="gbars">
        <i class="gbar b2" style="height:${Math.max(4, Math.round(g.booked / gmax * 100))}%"></i>
        <i class="gbar b3" style="height:${Math.max(4, Math.round(g.open / gmax * 100))}%"></i>
        <i class="gbar bd" style="height:${Math.max(4, Math.round(g.wait / gmax * 100))}%"></i>
      </div>
      <span>${esc(g.name)}</span>
    </div>`).join("");
  const gLegend = `
    <div class="gleg">
      <span><i class="b2"></i>${tr("Booked", "Reservados")}</span>
      <span><i class="b3"></i>${tr("Open seats", "Cupos libres")}</span>
      <span><i class="bd"></i>${tr("Waitlist", "Lista de espera")}</span>
    </div>`;

  /* Performance Highlights: port exacto del custom bar de performance-highlights.tsx:
     track tintado chart-3 18%, fill sólido chart-3, avatares dentro, % al final. */
  const top = C.grid.map(g => {
    const s = clsStatsFor(g.cls);
    return { name: g.cls, avg: s.avg, inst: s.info.inst || s.li.coach || "Team coach" };
  }).sort((a, b) => b.avg - a.avg).slice(0, 4);
  const phRows = top.map(t => {
    const abbr = t.name.split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase();
    const avs = [t.name.split(" ").map(w => w[0]).join("").slice(0, 2), t.inst.split(" ").map(w => w[0]).join("").slice(0, 2)]
      .map((a, i) => `<span class="phav" style="left:${8 + i * 14}px">${esc(a)}</span>`).join("");
    return `
    <div class="phrow2">
      <span class="phlab mono">${abbr}</span>
      <div class="phtrack2">
        <i style="width:${Math.max(t.avg, 24)}%"></i>
        ${avs}
        <b style="left:${8 + 2 * 14 + 16}px">${esc(t.name)}</b>
        <em class="mono">${t.avg}%</em>
      </div>
    </div>`;
  }).join("");

  /* próximas instancias reales del horario semanal */
  const now = new Date();
  const jsD = (now.getDay() + 6) % 7;
  const ups = [];
  for (let off = 0; off < 7 && ups.length < 4; off++) {
    const d = (jsD + off) % 7;
    if (d > 5) continue;
    (DATA.heatmap.classes || []).filter(c => c.d === d && (off > 0 || c.h > now.getHours())).sort((a, b) => a.h - b.h).forEach(c => {
      if (ups.length >= 4) return;
      const dt = new Date(now); dt.setDate(now.getDate() + off);
      const g = C.grid.find(x => x.cls === c.name);
      const w = g && g.wait ? g.wait[d] || 0 : 0;
      const isNew = c.name === "Pilates Sculpt" || c.name === "Vinyasa Yoga";
      ups.push({ name: c.name, h: c.h, dt, tag: w ? [`+${w} ${tr("waitlist", "espera")}`, "amber"] : isNew ? [tr("New slot", "Horario nuevo"), "green"] : null });
    });
  }
  const mfmt = new Intl.DateTimeFormat(LANG === "es" ? "es" : "en-US", { month: "short" });
  const ueRows = ups.map(u => `
    <div class="uerow click" onclick="openClass('${u.name.replace(/'/g, "\\'")}')">
      <span class="ued"><b>${mfmt.format(u.dt).toUpperCase().replace(".", "")}</b><i>${u.dt.getDate()}</i></span>
      <div class="uet"><b>${esc(u.name)}</b><span>${u.h % 12 || 12}:00 ${u.h < 12 ? "AM" : "PM"}</span></div>
      ${u.tag ? `<span class="chip ${u.tag[1]}">${u.tag[0]}</span>` : ""}
    </div>`).join("");

  const opts = C.list.map(c => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join("");
  setTimeout(clsStatMount, 0);
  return `
  ${topbar("Classes", tr("EVERY FORMAT MEASURED: FILL, WAITLISTS AND THE SLOTS WORTH SELLING", "CADA FORMATO MEDIDO: OCUPACIÓN, LISTAS DE ESPERA Y LOS HORARIOS POR VENDER"), modeChip())}
  <div class="acthdr">
    <button class="btn outline sm" onclick="location.hash='#inbox'">${tr("Message members", "Mensajear miembros")}</button>
    <button class="btn outline sm" onclick="location.hash='#hours'">${tr("Occupancy map", "Mapa de ocupación")}</button>
    <button class="btn solid sm" onclick="toast(tr('Add class', 'Añadir clase'), tr('SAMPLE: class writes go to Glofox after Discovery', 'SAMPLE: las escrituras van a Glofox tras Discovery'))">${KB_I.plus}${tr("Add class", "Añadir clase")}</button>
  </div>
  <div class="kpigrid">
    ${acCard(tr("Class seats filled", "Cupos ocupados"), members, "2.8%", tr("this week, across 8 formats · SAMPLE", "esta semana, en 8 formatos · SAMPLE"))}
    ${acCard(tr("Avg. fill rate", "Ocupación promedio"), fill + "%", "1.1%", tr("vs last month", "vs el mes pasado"))}
    ${acCard(tr("Classes this week", "Clases esta semana"), weekCount, "", `${DATA.today.classesToday.length} ${tr("today", "hoy")} · ${atCap} ${tr("at capacity", "a tope")}`)}
    ${acCard(tr("Waitlist spots", "Lista de espera"), waitTotal, "", tr("Zumba 19 · Cardio Dance 7 · Spin 5", "Zumba 19 · Cardio Dance 7 · Spin 5"))}
  </div>
  <div class="acgrid">
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div class="cctitle" style="font-size:14px">${tr("Class Schedule", "Horario de clases")}</div>
        <button class="btn ghost sm" onclick="location.hash='#calendar'">${tr("View Full Schedule", "Ver horario completo")} →</button></div>
      <div class="asched">${schedRows}</div>
    </div>
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div class="cctitle" style="font-size:14px">${tr("Class Status", "Estado por clase")}</div>
        <button class="btn ghost sm" onclick="location.hash='#hours'">${tr("View Report", "Ver reporte")} →</button></div>
      ${gLegend}
      <div class="gchart">${gCols}</div>
    </div>
  </div>
  <div class="acgrid2">
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div class="cctitle" style="font-size:14px">${tr("Performance Highlights", "Las que más llenan")}</div>
        <button class="btn ghost sm" onclick="location.hash='#hours'">${tr("View Insights", "Ver insights")} →</button></div>
      <div class="phwrap"><i></i><i></i><i></i>${phRows}</div>
      <p class="ccdesc" style="margin-top:10px">${tr("Average fill across the week · SAMPLE volumes on the real public schedule", "Ocupación promedio de la semana · volúmenes SAMPLE sobre el horario público real")}</p>
    </div>
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div class="cctitle" style="font-size:14px">${tr("Upcoming", "Próximas")}</div>
        <button class="btn ghost sm" onclick="location.hash='#calendar'">${tr("View Calendar", "Ver calendario")} →</button></div>
      ${ueRows}
    </div>
  </div>
  <div class="crmcard" style="margin-top:14px">
    <div class="cchead"><div class="cctitle" style="font-size:14px">${tr("Class Statistics", "Estadísticas por clase")}</div>
      <select id="clsPick" class="select" style="height:30px;width:auto;font-size:12.5px" onchange="clsStatMount()">${opts}</select></div>
    <div id="clsStatBox"></div>
  </div>
  ${demoNote()}`;
}

/* ---------- Calendar (port de dashboard/calendar: grilla mensual) ---------- */

let CAL_OFF = 0, CAL_FILTER = "all";
function calNav(d) { CAL_OFF += d; render(); }
function calToday() { CAL_OFF = 0; render(); }
function calFilter(v) { CAL_FILTER = v; render(); }

function vCalendar() {
  const C = DATA.classes;
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + CAL_OFF, 1);
  const dim = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const lead = first.getDay(); // domingo = 0, como FullCalendar
  const weekly = (DATA.heatmap.classes || []).filter(c => CAL_FILTER === "all" || c.name === CAL_FILTER);
  const byDow = {};
  weekly.forEach(c => { (byDow[c.d] = byDow[c.d] || []).push(c); });
  Object.values(byDow).forEach(l => l.sort((a, b) => a.h - b.h));
  const fmtT = h => `${h % 12 || 12}${h < 12 ? "a" : "p"}`;
  let events = 0;
  let cells = "";
  const total = Math.ceil((lead + dim) / 7) * 7;
  for (let i = 0; i < total; i++) {
    const dayN = i - lead + 1;
    if (dayN < 1 || dayN > dim) { cells += `<div class="mcell off"></div>`; continue; }
    const dt = new Date(first.getFullYear(), first.getMonth(), dayN);
    const dow = (dt.getDay() + 6) % 7; // 0 = lunes; 6 = domingo (sin clases)
    const list = dow <= 5 ? (byDow[dow] || []) : [];
    events += list.length;
    const isToday = CAL_OFF === 0 && dayN === now.getDate();
    const shown = list.slice(0, 3).map(c => {
      const g = C.grid.find(x => x.cls === c.name);
      const li = C.list.find(x => x.name === c.name) || { cap: 20 };
      const booked = g ? (g.slots[dow] || 0) : 0;
      const pct = Math.round(booked / li.cap * 100);
      const tone = pct >= 95 ? "hot" : pct < 55 ? "low" : "";
      const photo = (C.photos || {})[c.name];
      return `
      <div class="mev click ${tone}" onclick="openClass('${c.name.replace(/'/g, "\\'")}')" data-tip="${esc(c.name)} · ${c.h % 12 || 12}:00 ${c.h < 12 ? "AM" : "PM"} · ${booked}/${li.cap}${pct >= 95 ? " · " + tr("FULL", "LLENA") : pct < 55 ? " · " + tr("room to sell", "espacio por vender") : ""}">
        ${photo ? `<img src="${photo}" alt="" loading="lazy">` : ""}<span class="men">${esc(c.name)}</span><span class="met mono">${fmtT(c.h)}</span>
      </div>`;
    }).join("");
    const more = list.length > 3 ? `<div class="mevmore" data-tip="${esc(list.slice(3).map(c => `${c.name} ${fmtT(c.h)}`).join(" · "))}">+${list.length - 3} ${tr("more", "más")}</div>` : "";
    cells += `<div class="mcell${isToday ? " istoday" : ""}"><span class="mnum mono">${dayN}</span>${shown}${more}</div>`;
  }
  const title = new Intl.DateTimeFormat(LANG === "es" ? "es" : "en-US", { month: "long", year: "numeric" }).format(first);
  const dows = [tr("Sun", "Dom"), tr("Mon", "Lun"), tr("Tue", "Mar"), tr("Wed", "Mié"), tr("Thu", "Jue"), tr("Fri", "Vie"), tr("Sat", "Sáb")];
  const opts = C.list.map(c => `<option value="${esc(c.name)}"${CAL_FILTER === c.name ? " selected" : ""}>${esc(c.name)}</option>`).join("");
  return `
  ${topbar("Calendar", tr("EVERY CLASS OF THE MONTH, STRAIGHT FROM THE WEEKLY SCHEDULE", "CADA CLASE DEL MES, DIRECTO DEL HORARIO SEMANAL"), modeChip())}
  <div class="mcal">
    <div class="mcalhdr">
      <div class="mchl">
        <b>${title.charAt(0).toUpperCase() + title.slice(1)}</b>
        <span>${dim} ${tr("days", "días")} - ${events} ${tr("events", "eventos")}</span>
      </div>
      <div class="mchr">
        <select class="select" style="height:32px;width:auto;font-size:12.5px" onchange="calFilter(this.value)">
          <option value="all"${CAL_FILTER === "all" ? " selected" : ""}>${tr("All classes", "Todas las clases")}</option>${opts}
        </select>
        <span class="btngrp">
          <button class="btn outline sm sq" onclick="calNav(-1)">${KB_I.chevD.replace("m6 9 6 6 6-6", "m15 18-6-6 6-6")}</button>
          <button class="btn outline sm" style="border-radius:0;border-left:0;border-right:0" onclick="calToday()">${tr("Today", "Hoy")}</button>
          <button class="btn outline sm sq" onclick="calNav(1)">${KB_I.chevD.replace("m6 9 6 6 6-6", "m9 18 6-6-6-6")}</button>
        </span>
        <select class="select" style="height:32px;width:auto;font-size:12.5px" onchange="toast(tr('Views', 'Vistas'), tr('Month is the demo view; week and day ship with the real build', 'Mes es la vista demo; semana y día llegan con el build real')); this.selectedIndex=0">
          <option selected>${tr("Month", "Mes")}</option><option>${tr("Week", "Semana")}</option><option>${tr("Day", "Día")}</option>
        </select>
        <button class="btn solid sm" onclick="toast(tr('Add event', 'Añadir evento'), tr('SAMPLE: schedule writes go to Glofox after Discovery', 'SAMPLE: las escrituras al horario van a Glofox tras Discovery'))">${KB_I.plus}${tr("Add event", "Añadir evento")}</button>
      </div>
    </div>
    <div class="mdows">${dows.map(d => `<div>${d}</div>`).join("")}</div>
    <div class="mgrid">${cells}</div>
  </div>
  ${demoNote()}`;
}

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
        return `<div class="calblk click ${tone}" data-q="${esc((w.name + " " + w.coach).toLowerCase())}"
          onclick="openClass('${w.name.replace(/'/g, "\\'")}', ${w.booked}, ${w.cap}, ${w.wait || 0})"
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

  const hs = r.executive_summary.health_score;
  const ringC = 2 * Math.PI * 34;
  return `
  ${topbar("Pulse Report", `<span class="pulse-mark">● PULSE · METRICS</span> monthly client report · ${esc(r.periodLabel)}`, `<span class="chip amber">MOCKUP · SAMPLE SCENARIO</span>`)}

  <div class="repnote">
    <span class="chip amber">${tr("CLIENT DELIVERABLE · ONCE A MONTH", "ENTREGABLE AL CLIENTE · UNA VEZ AL MES")}</span>
    <p><b>${tr("What you are looking at:", "Qué estás viendo:")}</b> ${tr("the document City Zero receives every month: the closed period explained, with health score, real cost per member and next month's plan. The live day-to-day cockpit while campaigns run is the", "el documento que City Zero recibe cada mes: el período cerrado explicado, con health score, costo real por miembro y el plan del mes siguiente. La cabina diaria en vivo mientras corren las campañas es el")} <a href="#paidmedia">${tr("Ads Report", "Reporte de Ads")} →</a></p>
  </div>

  <div class="grid"><div class="panel wide pwow">
    <div class="pwgrid">
      <div class="pwring">
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="34" fill="none" stroke="color-mix(in srgb, var(--foreground) 10%, transparent)" stroke-width="7"/>
          <circle cx="40" cy="40" r="34" fill="none" stroke="${hs >= 80 ? "var(--green)" : hs >= 60 ? "var(--amber)" : "var(--red)"}" stroke-width="7" stroke-linecap="round"
            stroke-dasharray="${(ringC * hs / 100).toFixed(1)} ${ringC.toFixed(1)}" transform="rotate(-90 40 40)"/>
        </svg>
        <div class="pwrv"><b class="mono">${hs}</b><span>${tr("HEALTH", "SALUD")}</span></div>
        <div class="pwrl">${tr("of 100 · trending up with the Meta cleanup", "de 100 · subiendo con la limpieza Meta")}</div>
      </div>
      <div class="pwhero">
        <span class="pwlab">${tr("What a member really costs you", "Lo que de verdad te cuesta un miembro")}</span>
        <b>$158</b>
        <p>${tr("The ad platforms would have told you $120. The difference is 6 members they claimed but never walked in.", "Las plataformas te habrían dicho $120. La diferencia son 6 miembros que reclamaron y nunca entraron.")}</p>
      </div>
      <div class="pwvs">
        <span class="pwlab">${tr("Platforms claim vs your front door", "Lo que reclaman vs tu puerta")}</span>
        <div class="pwbar"><span>${tr("Meta + Google claim", "Meta + Google reclaman")}</span><div class="pwtrack"><i style="width:100%;background:color-mix(in srgb, var(--foreground) 30%, transparent)"></i></div><b class="mono">25</b></div>
        <div class="pwbar"><span>${tr("Real joins in Glofox", "Altas reales en Glofox")}</span><div class="pwtrack"><i style="width:76%;background:var(--mint)"></i></div><b class="mono">19</b></div>
        <span class="chip red" style="align-self:flex-start">+32% ${tr("over-reported", "inflado")}</span>
      </div>
    </div>
    <div class="moneypath">
      <div class="mpn"><b class="mono">$3,000</b><span>${tr("ad spend", "inversión")}</span></div>
      <span class="mpa">${I.chevR}</span>
      <div class="mpn"><b class="mono">120</b><span>leads</span></div>
      <span class="mpa">${I.chevR}</span>
      <div class="mpn"><b class="mono">41</b><span>tours</span></div>
      <span class="mpa">${I.chevR}</span>
      <div class="mpn"><b class="mono">19</b><span>${tr("members", "miembros")}</span></div>
      <span class="mpa">${I.chevR}</span>
      <div class="mpn hot"><b class="mono">$158</b><span>${tr("per member", "por miembro")}</span></div>
    </div>
    <div class="pwfoot">${tr("Every number traced from spend to badge-in. This is the report, not a dashboard to decode.", "Cada número trazado del gasto al check-in. Esto es el reporte, no un dashboard por descifrar.")}</div>
  </div></div>

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

/* Estado del Ads Report: tab activo + rango de tiempo (funcionales) */
let ADS_TAB = "overview", ADS_RANGE = "week", ADS_FROM = "", ADS_TO = "";
function adsTab(t) { ADS_TAB = t; render(); }
function adsRange(v) { ADS_RANGE = v; render(); }
function adsApply() {
  const f = document.getElementById("adsFrom"), t = document.getElementById("adsTo");
  if (f && t && f.value && t.value && f.value <= t.value) { ADS_FROM = f.value; ADS_TO = t.value; render(); }
  else toast(tr("Date range", "Rango de fechas"), tr("Pick a valid from/to pair", "Elige un desde/hasta válido"));
}
function adsDays() {
  if (ADS_RANGE === "today") return 1;
  if (ADS_RANGE === "2weeks") return 14;
  if (ADS_RANGE === "custom" && ADS_FROM && ADS_TO)
    return Math.max(1, Math.min(90, Math.round((new Date(ADS_TO) - new Date(ADS_FROM)) / 864e5) + 1));
  return 7;
}
function adsLabel() {
  if (ADS_RANGE === "today") return tr("today", "hoy");
  if (ADS_RANGE === "2weeks") return tr("last 14 days", "últimos 14 días");
  if (ADS_RANGE === "custom" && ADS_FROM && ADS_TO) {
    const lf = new Intl.DateTimeFormat(LANG === "es" ? "es" : "en-US", { month: "short", day: "numeric" });
    return `${lf.format(new Date(ADS_FROM + "T12:00:00"))} – ${lf.format(new Date(ADS_TO + "T12:00:00"))} · ${adsDays()} ${tr("days", "días")}`;
  }
  return tr("this week", "esta semana");
}
function adsScale() {
  const d = adsDays();
  const r = x => Math.max(0, Math.round(x / 7 * d));
  return { d, spendN: Math.round(742 / 7 * d), leads: r(31), leadsPrev: r(23), tours: r(13), flow: [r(14), r(9), r(5), r(3)] };
}
function adsXL(d) {
  if (d === 1) return ["6 AM", "12 PM", "6 PM", tr("now", "ahora")];
  const end = ADS_RANGE === "custom" && ADS_TO ? new Date(ADS_TO + "T12:00:00") : new Date();
  const lf = new Intl.DateTimeFormat(LANG === "es" ? "es" : "en-US", { month: "short", day: "numeric" });
  const out = [];
  for (let k = 3; k >= 0; k--) out.push(lf.format(new Date(end.getTime() - Math.round((d - 1) * k / 3) * 864e5)));
  return out;
}

/* Tabs de plataforma: detalle Meta / Google con desglose y fuentes basura */
function adsPlatformBody(p) {
  const A = adsScale();
  const meta = p === "Meta";
  const share = meta ? 0.6 : 0.4;
  const t = x => Math.round(x * share);
  const tiles = [
    [`${tr("Spend", "Inversión")} · ${adsLabel()}`, "$" + Math.round(A.spendN * share).toLocaleString("en-US"), tr("of the blended budget", "del presupuesto combinado")],
    ["Leads", t(A.leads), tr("into the Pipeline, campaign attached", "al Pipeline, con su campaña")],
    [tr("Cost per lead", "Costo por lead"), meta ? "$21" : "$31", tr("blended across campaigns", "combinado entre campañas")],
    [tr("Claims vs real", "Claims vs real"), meta ? "14 → 9" : "11 → 6", tr("claimed members vs Glofox joins · MTD", "miembros clamados vs altas Glofox · mes en curso")],
  ].map(x => `<div class="astile"><div class="ash">${x[0]}</div><div class="kpirow"><span class="kpiv" style="font-size:24px">${x[1]}</span></div><div class="assub">${x[2]}</div></div>`).join("");
  const rows = (meta
    ? [[tr("Guided Tour campaign", "Campaña Guided Tour"), `<span class="chip green">${tr("Delivering", "Activa")}</span>`, 14, "$132"], [tr("Trial offer", "Oferta de trial"), `<span class="chip amber">${tr("Learning", "Aprendiendo")}</span>`, 5, "$203"]]
    : [[`brand + "gym near me"`, `<span class="chip green">${tr("Delivering", "Activa")}</span>`, 9, "$163"], [tr("generic fitness", "fitness genérica"), `<span class="chip gray">${tr("Paused", "Pausada")}</span>`, 3, "$220"]])
    .map(r => `<tr><td class="t">${p} · ${r[0]}</td><td>${r[1]}</td><td class="num">${r[2]}</td><td class="num">${r[3]}</td></tr>`).join("");
  const brk = (meta
    ? [["Feed", 46, false], ["Reels", 31, false], ["Stories", 14, false], ["Audience Network", 9, true]]
    : [[`"gym near me"`, 41, false], [tr("brand terms", "términos de marca"), 33, false], [`"fitness" ${tr("broad", "amplio")}`, 18, true], ["Display", 8, true]])
    .map(b => `
    <div class="stsrc">
      <div class="stsl"><b>${b[0]}</b></div>
      <div class="stst"><i style="width:${Math.max(b[1], 12)}%"></i></div>
      <span class="stsd mono ${b[2] ? "down" : "up"}">${b[1]}%</span>
      ${b[2] ? `<span class="chip red" style="font-size:9px;padding:1px 6px">${tr("junk source", "fuente basura")}</span>` : "<span style='width:70px'></span>"}
    </div>`).join("");
  return `
  <div class="astiles" style="grid-template-columns:repeat(4,1fr)">${tiles}</div>
  <div class="acgrid" style="grid-template-columns:1.3fr 1fr;margin-bottom:14px">
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div class="cctitle" style="font-size:14px">${p} · ${tr("Campaigns", "Campañas")}</div><span class="chip gray">SAMPLE · MTD</span></div>
      <div class="tablewrap"><table class="crmtable">
        <thead><tr><th>${tr("Campaign", "Campaña")}</th><th>${tr("Status", "Estado")}</th><th style="text-align:right">Leads</th><th style="text-align:right">${tr("Cost / member", "Costo / miembro")}</th></tr></thead>
        <tbody>${rows}</tbody></table></div>
    </div>
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div><div class="cctitle" style="font-size:14px">${meta ? tr("Placements", "Ubicaciones") : tr("Search terms", "Términos de búsqueda")}</div>
        <div class="ccdesc">${tr("Share of leads · junk sources get cut at this level", "Share de leads · las fuentes basura se cortan a este nivel")}</div></div></div>
      ${brk}
      ${meta ? `<div class="evnote" style="margin-top:12px">${tr("Step 0 applies here: Business Suite reconnected and one official page (EX-005/EX-006) before a dollar moves.", "El paso 0 aplica aquí: Business Suite reconectado y una sola página oficial (EX-005/EX-006) antes de mover un dólar.")}</div>` : `<div class="evnote" style="margin-top:12px">${tr('"Broad" and Display bill clicks that bounce in seconds: they are the first cut of every optimization pass.', 'Lo "amplio" y Display facturan clicks que rebotan en segundos: son el primer corte de cada pase de optimización.')}</div>`}
    </div>
  </div>`;
}

/* Tab Creatives: la parrilla de creativos con su performance */
function adsCreativesBody() {
  const cards = [
    ["assets/classes/zumba.jpg", "Zumba energy reel", tr("Winner", "Ganador"), "green", ["CTR 2.4%", "CPL $19", "41 leads"]],
    ["assets/classes/fbc.jpg", "FBC 6AM crew", tr("Winner", "Ganador"), "green", ["CTR 2.1%", "CPL $22", "17 leads"]],
    ["assets/classes/pilates.jpg", "Pilates Sculpt intro", tr("Testing", "En prueba"), "amber", ["CTR 1.6%", "CPL $27", "9 leads"]],
    ["assets/classes/vinyasa.jpg", "Vinyasa morning spot", tr("Testing", "En prueba"), "amber", ["CTR 1.4%", "CPL $31", "5 leads"]],
    ["assets/banners/pipeline.webp", "Noir brand film 15s", tr("Fatigued", "Fatigado"), "red", ["CTR 0.9% ↓38%", tr("freq 3.2", "frec 3.2"), "6 leads"]],
    ["assets/banners/keep.webp", "Member stories carousel", tr("Paused", "Pausado"), "gray", ["CTR 1.1%", "CPL $38", "3 leads"]],
  ].map(c => `
    <div class="crcard">
      <img src="${c[0]}" alt="" loading="lazy" onerror="this.style.display='none'">
      <div class="crb">
        <div class="crt"><b>${esc(c[1])}</b><span class="chip ${c[3]}">${c[2]}</span></div>
        <div class="crm mono">${c[4].map(m => `<span>${m}</span>`).join("")}</div>
      </div>
    </div>`).join("");
  return `
  <div class="crmcard">
    <div class="cchead"><div><div class="cctitle" style="font-size:14px">${tr("Creative performance", "Rendimiento de creativos")}</div>
      <div class="ccdesc">${tr("Art from the real public surfaces · volumes SAMPLE · fatigue is flagged when CTR drops 30% from its peak; winners inherit the budget", "Arte de las superficies públicas reales · volúmenes SAMPLE · la fatiga se marca cuando el CTR cae 30% de su pico; los ganadores heredan el presupuesto")}</div></div><span class="chip gray">SAMPLE</span></div>
    <div class="crgrid">${cards}</div>
  </div>`;
}

/* Tab Attribution: metodología + el cruce completo */
function adsAttrBody(pm, attRows) {
  const steps = [
    [tr("Capture", "Captura"), tr("Every ad click lands with its campaign id; the lead enters the Pipeline carrying it.", "Cada click llega con su id de campaña; el lead entra al Pipeline cargándolo.")],
    [tr("Match", "Cruce"), tr("New Glofox joins are matched by email and phone against those leads: deterministic, on City Zero's data.", "Las altas de Glofox se cruzan por email y teléfono contra esos leads: determinístico, sobre los datos de City Zero.")],
    [tr("Dedupe", "Depuración"), tr("When Meta and Google both claim the same person, the overlap is removed: one member, one credit.", "Cuando Meta y Google claman a la misma persona, el traslape se elimina: un miembro, un crédito.")],
  ].map((s, i) => `<div class="mcard" style="gap:8px"><div class="mhead2"><span class="mono" style="font-size:11px;color:var(--mint)">0${i + 1}</span><span>${s[0]}</span></div><p style="font-size:12.5px;color:var(--muted-foreground);line-height:1.55">${s[1]}</p></div>`).join("");
  const tbl = [
    ["Meta · Guided Tour", 11, 9], ["Meta · Trial offer", 3, 2],
    ["Google · brand", 8, 6], ["Google · generic", 3, 2],
  ].map(r => `<tr><td class="t">${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td><td class="num" style="color:var(--red)">+${r[1] - r[2]}</td></tr>`).join("");
  return `
  <div class="crmcard">
    <div class="cchead"><div class="cctitle" style="font-size:14px">${tr("How attribution is decided", "Cómo se decide la atribución")}</div><span class="chip gray">${tr("The Pulse moat", "El moat de Pulse")}</span></div>
    <div class="mgrid" style="grid-template-columns:repeat(3,1fr)">${steps}</div>
  </div>
  <div class="acgrid" style="grid-template-columns:1fr 1fr;margin-bottom:14px">
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div class="cctitle" style="font-size:14px">${tr("Claims vs Glofox, by campaign", "Claims vs Glofox, por campaña")}</div><span class="chip gray">SAMPLE · MTD</span></div>
      <div class="tablewrap"><table class="crmtable">
        <thead><tr><th>${tr("Campaign", "Campaña")}</th><th style="text-align:right">${tr("Claimed", "Clamados")}</th><th style="text-align:right">${tr("Real (Glofox)", "Reales (Glofox)")}</th><th style="text-align:right">${tr("Inflated", "Inflado")}</th></tr></thead>
        <tbody>${tbl}</tbody></table></div>
      <div class="evnote" style="margin-top:12px">${tr("Combined over-report this month: +32%. The closed verdict, with the month sealed, ships in the", "Sobre-reporte combinado del mes: +32%. El veredicto cerrado, con el mes sellado, sale en el")} <a href="#pulsereport" style="color:var(--foreground)">${tr("Monthly Report", "Reporte Mensual")} →</a></div>
    </div>
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div class="cctitle" style="font-size:14px">${tr("The totals, side by side", "Los totales, lado a lado")}</div></div>
      <div class="dist">${attRows}</div>
      <div class="evnote" style="margin-top:12px">${esc(pm.attribution.note)}</div>
    </div>
  </div>`;
}

function vPaidMedia() {
  if (!vPaidMedia._qs) {
    const qa = new URLSearchParams(location.search);
    if (["overview", "meta", "google", "creatives", "attribution"].indexOf(qa.get("atab")) >= 0) ADS_TAB = qa.get("atab");
    if (["today", "week", "2weeks", "custom"].indexOf(qa.get("arange")) >= 0) ADS_RANGE = qa.get("arange");
    vPaidMedia._qs = true;
  }
  const pm = DATA.paidmedia;

  const serviceCards = pm.service.map((x, i) => `
    <div class="mcard" style="gap:10px">
      <div class="mhead2"><span class="mono" style="font-size:11px;color:#23E3A4">0${i + 1}</span><span>${tr(x.step, ({ "Plan": "Planear", "Launch": "Lanzar", "Optimize weekly": "Optimizar semanal", "Report monthly": "Reportar mensual" })[x.step] || x.step)}</span></div>
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

  /* ---- Analytics port (dashboard/analytics del template) adaptado a ads ----
     Escala SEMANA + ritmo: la cabina opera; los totales cerrados viven en el
     Monthly Report. Nada de repetir el resumen mensual aquí. */
  const A = adsScale();
  const RL = adsLabel();
  const tiles = [
    [`${tr("Spend", "Inversión")} · ${RL}`, "$" + A.spendN.toLocaleString("en-US"), `<span class="kbadge up">${CRM_I.tUp}${tr("on pace", "a ritmo")}</span>`, tr("$2,140 of $3,000 this month · 71% spent, 74% elapsed", "$2,140 de $3,000 del mes · 71% gastado, 74% transcurrido")],
    [`Leads · ${RL}`, A.leads, `<span class="kbadge up">${CRM_I.tUp}+${Math.max(1, A.leads - A.leadsPrev)}</span>`, `${tr("vs", "vs")} ${A.leadsPrev} ${tr("the previous period", "el período anterior")}`],
    [tr("Junk clicks cut", "Clicks basura cortados"), "9%", `<span class="kbadge up">${CRM_I.tUp}+2 pts</span>`, tr("of billed clicks removed in the period", "de los clicks facturados, removidos en el período")],
    [`${tr("Tours booked", "Tours agendados")} · ${RL}`, A.tours, `<span class="kbadge up">${CRM_I.tUp}+${Math.max(1, Math.round(A.tours * 0.3))}</span>`, tr("from ad leads, confirmed in Glofox", "de leads de ads, confirmados en Glofox")],
    [tr("Projected cost / member", "Costo proyectado / miembro"), "$161", `<span class="chip gray" style="font-size:9px">MTD</span>`, tr("in progress · the closed number ships in the Monthly Report", "en curso · el número cerrado sale en el Reporte Mensual")],
  ].map(t => `
    <div class="astile">
      <div class="ash">${t[0]}<span style="margin-left:auto;color:var(--muted-foreground)">…</span></div>
      <div class="kpirow"><span class="kpiv">${t[1]}</span>${t[2]}</div>
      <div class="assub">${t[3]}</div>
    </div>`).join("");

  /* Lead Quality: dos líneas suaves (sólida = leads reales, punteada = clicks basura) */
  const n = 28, W = 1000, H = 220;
  const q1 = [], q2 = [];
  for (let i = 0; i < n; i++) {
    q1.push(4.2 + Math.sin(i / 2.4 + A.d) * 1.4 + ((i * 17 + A.d * 3) % 7) * 0.28);
    q2.push(2.2 + Math.sin(i / 3.2 + 2 + A.d) * 1.1 + ((i * 11 + A.d) % 5) * 0.22);
  }
  const qmax = Math.max.apply(null, q1.concat(q2)) * 1.15;
  const qp = a => _smoothPath(a.map((v, i) => [i / (n - 1) * W, H - v / qmax * H]));
  const rtBars = Array.from({ length: 28 }, (_, i) => {
    const h = 22 + ((i * 29) % 61);
    return `<span class="rtb" style="height:${h}%"></span>`;
  }).join("");
  const chanRows = [
    ["Meta · Guided Tour", A.flow[0], "M"], ["Google · brand + gym near me", A.flow[1], "G"],
    ["Meta · Trial offer", A.flow[2], "M"], ["Google · generic fitness", A.flow[3], "G"],
  ].map(c => `<div class="rtrow"><span class="rtc mono">${c[2]}</span><span class="rtn">${esc(c[0])}</span><b class="mono">${c[1]}</b></div>`).join("");

  const campSt = {
    Delivering: `<span class="chip green">${tr("Delivering", "Activa")}</span>`,
    Learning: `<span class="chip amber">${tr("Learning", "Aprendiendo")}</span>`,
    Paused: `<span class="chip gray">${tr("Paused", "Pausada")}</span>`,
  };
  const campRows = [
    ["Meta · Guided Tour campaign", "Delivering", 52, 9, "$1,190", "$132"],
    ["Google · brand + \"gym near me\"", "Delivering", 34, 6, "$980", "$163"],
    ["Meta · Trial offer", "Learning", 22, 3, "$610", "$203"],
    ["Google · generic fitness", "Paused", 12, 1, "$220", "$220"],
  ].map(r => `
    <tr><td class="t">${esc(r[0])}</td><td>${campSt[r[1]]}</td><td class="num">${r[2]}</td><td class="num">${r[3]}</td><td class="num">${r[4]}</td><td class="num">${r[5]}</td></tr>`).join("");

  const head = `
  ${topbar("Ads Report", `<span class="pulse-mark">● PULSE · METRICS</span> by Arqentia · they asked for a media buyer; this is the buyer with instruments`, `<span class="chip amber">PHASE 2 · SAMPLE SCENARIO</span>`)}

  <div class="repnote">
    <span class="chip green">${tr("OPERATING VIEW · WHILE CAMPAIGNS RUN", "VISTA OPERATIVA · MIENTRAS CORREN LAS CAMPAÑAS")}</span>
    <p><b>${tr("What you are looking at:", "Qué estás viendo:")}</b> ${tr("the day-to-day cockpit of paid campaigns: spend, leads, tours and real cost per member as they happen (SAMPLE scenario). The polished document the client receives every month is the", "la cabina diaria de las campañas pagadas: inversión, leads, tours y costo real por miembro mientras suceden (escenario SAMPLE). El documento pulido que el cliente recibe cada mes es el")} <a href="#pulsereport">${tr("Monthly Report", "Reporte Mensual")} →</a></p>
  </div>

  <div class="kbbar" style="border-bottom:0;padding-bottom:0">
    <div class="tabs">
      ${[["overview", tr("Overview", "Resumen")], ["meta", "Meta"], ["google", "Google"], ["creatives", tr("Creatives", "Creativos")], ["attribution", tr("Attribution", "Atribución")]]
      .map(([k, l]) => `<button class="tab${ADS_TAB === k ? " on" : ""}" onclick="adsTab('${k}')">${l}</button>`).join("")}
    </div>
    <div class="ccact">
      ${ADS_RANGE === "custom" ? `
        <input type="date" id="adsFrom" class="input" style="height:32px;width:auto;font-size:12px" value="${ADS_FROM}">
        <input type="date" id="adsTo" class="input" style="height:32px;width:auto;font-size:12px" value="${ADS_TO}">
        <button class="btn outline sm" onclick="adsApply()">${tr("Apply", "Aplicar")}</button>` : ""}
      <select class="select" style="height:32px;width:auto;font-size:12.5px" onchange="adsRange(this.value)">
        <option value="today"${ADS_RANGE === "today" ? " selected" : ""}>${tr("Today", "Hoy")}</option>
        <option value="week"${ADS_RANGE === "week" ? " selected" : ""}>${tr("This week", "Esta semana")}</option>
        <option value="2weeks"${ADS_RANGE === "2weeks" ? " selected" : ""}>${tr("Last 2 weeks", "Últimas 2 semanas")}</option>
        <option value="custom"${ADS_RANGE === "custom" ? " selected" : ""}>${tr("Custom range...", "Rango de fechas...")}</option>
      </select>
    </div>
  </div>`;

  if (ADS_TAB === "meta") return `${head}${adsPlatformBody("Meta")}${demoNote()}`;
  if (ADS_TAB === "google") return `${head}${adsPlatformBody("Google")}${demoNote()}`;
  if (ADS_TAB === "creatives") return `${head}${adsCreativesBody()}${demoNote()}`;
  if (ADS_TAB === "attribution") return `${head}${adsAttrBody(pm, attRows)}${demoNote()}`;

  return `${head}

  <div class="astiles">${tiles}</div>

  <div class="repnote" style="margin-top:0">
    <span class="chip gray">${tr("ACTIONS THIS WEEK", "ACCIONES DE LA SEMANA")}</span>
    <p>${tr("Moved $120 from Google generic to Meta Guided Tour · cut 2 junk placements billing bounce-in-seconds clicks · paused delivery outside staffed hours (inherited from the real-hours monitor). This is what the client never sees in a monthly PDF: the steering.", "Se movieron $120 de Google genérica a Meta Guided Tour · se cortaron 2 placements basura que facturaban clicks de segundos · se pausó la entrega fuera de horario atendido (heredado del monitor de horarios reales). Esto es lo que un PDF mensual nunca muestra: el volante.")}</p>
  </div>

  <div class="acgrid" style="grid-template-columns:1.7fr 1fr;margin-bottom:14px">
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div><div class="cctitle" style="font-size:14px">${tr("Lead Quality", "Calidad de leads")}</div>
        <div class="ccdesc">${tr("Real leads vs junk clicks per day · the anomaly cross that cuts waste", "Leads reales vs clicks basura por día · el cruce de anomalías que corta el desperdicio")}</div></div>
        <span class="actleg" style="gap:14px"><span class="actleg"><i></i>${tr("Real leads", "Leads reales")}</span><span class="actleg dim"><i style="border-radius:0;height:2px"></i>${tr("Junk clicks", "Clicks basura")}</span></span></div>
      <svg class="actsvg" style="height:230px" viewBox="0 0 1000 220" preserveAspectRatio="none" aria-hidden="true">
        <path d="${qp(q1)}" fill="none" stroke="currentColor" stroke-width="1.4" vector-effect="non-scaling-stroke"/>
        <path d="${qp(q2)}" fill="none" stroke="currentColor" stroke-opacity=".45" stroke-width="1.2" stroke-dasharray="5 5" vector-effect="non-scaling-stroke"/>
      </svg>
      <div class="cflowx" style="margin-top:8px">${adsXL(A.d).map(l => `<span>${l}</span>`).join("")}</div>
    </div>
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div class="cctitle" style="font-size:14px">${tr("Lead Flow", "Flujo de leads")}</div><span class="actleg"><i style="background:var(--live);border-radius:999px"></i>SAMPLE</span></div>
      <div class="crailbig" style="font-size:28px">${A.leads} <span>${RL}</span></div>
      <div class="rtstrip">${rtBars}</div>
      <div class="rtrows">${chanRows}</div>
    </div>
  </div>

  <div class="acgrid" style="grid-template-columns:1.7fr 1fr;margin-bottom:14px">
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div><div class="cctitle" style="font-size:14px">${tr("Campaign Performance", "Rendimiento por campaña")}</div>
        <div class="ccdesc">${tr("Month to date · steer budgets here, judge them in the Monthly Report", "Mes en curso · aquí se mueve el presupuesto; se juzga en el Reporte Mensual")}</div></div><span class="chip gray">SAMPLE</span></div>
      <div class="tablewrap"><table class="crmtable">
        <thead><tr><th>${tr("Campaign", "Campaña")}</th><th>${tr("Status", "Estado")}</th><th style="text-align:right">Leads</th><th style="text-align:right">${tr("Members", "Miembros")}</th><th style="text-align:right">${tr("Spend", "Inversión")}</th><th style="text-align:right">${tr("Cost / member", "Costo / miembro")}</th></tr></thead>
        <tbody>${campRows}</tbody>
      </table></div>
    </div>
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div><div class="cctitle" style="font-size:14px">${tr("Attribution", "Atribución")}</div>
        <div class="ccdesc">${tr("Platform claims vs Glofox reality · month to date; the closed verdict ships in the Monthly Report", "Claims de plataformas vs realidad Glofox · mes en curso; el veredicto cerrado sale en el Reporte Mensual")}</div></div></div>
      <div class="dist">${attRows}</div>
      <div class="evnote" style="margin-top:12px">${esc(pm.attribution.note)}</div>
    </div>
  </div>

  <div class="grid"><div class="panel wide">
    <div class="ptitle">The service: media buying with instruments <span class="hint">Arqentia runs the campaigns · Pulse crosses every dollar against real outcomes</span></div>
    <div class="mgrid">${serviceCards}</div>
  </div></div>

  <div class="grid split">
    <div class="panel">
      <div class="ptitle">Spend to members, one funnel <span class="hint">SAMPLE scenario · leads land in the CRM Pipeline with their campaign attached</span></div>
      <div class="dist">${funnelRows}</div>
      <div class="evnote" style="margin-top:14px">${tr(pm.unitMath.anchor, "Un plan de $179.99 casi devuelve la adquisición en el mes uno. El anual de $1,900 la devuelve 12 veces. Matemática ilustrativa sobre volúmenes sample; los planes y precios son los públicos reales.")} ${tr("Two of the leads on the", "Dos de los leads del")} <a href="#pipeline" style="color:var(--foreground)">${tr("Pipeline board", "tablero del Pipeline")}</a> ${tr("carry their ad campaign as source: that handoff is the integration.", "llevan su campaña de ads como fuente: ese handoff es la integración.")}</div>
    </div>
    <div class="panel">
      <div class="ptitle" style="font-size:13px">Step 0: the plumbing <span class="hint">real, from their own hiring post</span></div>
      <ul class="tl">${prereqRows}</ul>
      <div class="evnote">${tr("You cannot buy Meta media with Facebook and Instagram disconnected and phantom pages splitting the brand. The", "No se puede comprar media en Meta con Facebook e Instagram desconectados y páginas fantasma dividiendo la marca. La")} <a href="#meta" style="color:var(--foreground)">${tr("Meta Health cleanup", "limpieza de Meta Health")}</a> ${tr("is the first week of this engagement.", "es la primera semana de este engagement.")}</div>
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

/* ---------- CITY ZERO STORE (port de dashboard/ecommerce) ---------- */

function vStore() {
  const st = DATA.store;
  const icons = {
    "$": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    bag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    receipt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/></svg>`,
    undo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`,
    box: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  };
  const cells = st.metrics.map(m => `
    <div class="stcell">
      <div class="sth">${tr(m.k, m.ke)}<span class="ovic" style="width:28px;height:28px">${icons[m.ico] || icons["$"]}</span></div>
      <div class="stv">${m.v}</div>
      <div class="std ${m.good ? "up" : "down"}">${m.d} <span>${tr(m.ds, m.dse)}</span></div>
    </div>`).join("");

  /* Sales Overview: línea con glow sobre mini-barras (12 meses, pasos semanales) */
  const n = 48, W = 1000, H = 230;
  const line = [];
  for (let i = 0; i < n; i++) {
    line.push(52 + i * 2.1 + Math.sin(i / 2.1) * 16 + ((i * 13) % 9) * 2.4 - 10);
  }
  const lmax = Math.max.apply(null, line) * 1.12;
  const lpath = line.map((v, i) => (i ? "L" : "M") + (i / (n - 1) * W).toFixed(1) + "," + (H - v / lmax * H).toFixed(1)).join("");
  const salesBars = Array.from({ length: n }, (_, i) => `<span class="stb" style="height:${14 + ((i * 23) % 34)}%"></span>`).join("");
  const now = new Date();
  const mfmt = new Intl.DateTimeFormat(LANG === "es" ? "es" : "en-US", { month: "short", year: "2-digit" });
  const mLabels = [];
  for (let i = 11; i >= 0; i--) mLabels.push(mfmt.format(new Date(now.getFullYear(), now.getMonth() - i, 1)).replace(".", ""));

  /* Store Traffic: barras finas 24h + línea roja de anomalías */
  const tBars = Array.from({ length: 56 }, (_, i) => {
    let h = 12 + ((i * 31) % 52);
    if (i % 13 === 0) h += 34;
    return `<span class="stb thin" style="height:${h}%"></span>`;
  }).join("");
  const aPath = Array.from({ length: 56 }, (_, i) => {
    const y = 212 - (i % 17 === 0 ? 26 + (i * 7) % 20 : ((i * 11) % 8));
    return (i ? "L" : "M") + (i / 55 * W).toFixed(1) + "," + y;
  }).join("");

  const srcRows = st.sources.map(s => `
    <div class="stsrc">
      <div class="stsl"><b>${esc(s.name)}</b><span class="mono">${s.n}</span></div>
      <div class="stst"><i style="width:${s.pct}%"><span class="stsc mono">${s.c}</span></i></div>
      <span class="stsd ${s.good ? "up" : "down"} mono">${s.delta}</span>
    </div>`).join("");

  const prodRows = st.products.map(p => `
    <div class="stprod"><span>${esc(p.name)}</span>
      <div class="kptrack" style="flex:1;max-width:160px"><i style="width:${p.pct}%"></i></div>
      <b class="mono">${p.pct}%</b></div>`).join("");

  const dateStr = new Intl.DateTimeFormat(LANG === "es" ? "es" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);
  return `
  ${topbar("City Zero Store", tr("THE RETAIL LAYER GLOFOX ALREADY SUPPORTS: MERCH, SHAKES AND DAY PASSES, MEASURED", "LA CAPA RETAIL QUE GLOFOX YA SOPORTA: MERCH, SHAKES Y PASES DE DÍA, MEDIDOS"), `<span class="chip amber">PHASE 2 · CONCEPT · SAMPLE DATA</span>`)}
  <div class="crmhead" style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap">
    <div><h2>${tr("Store Overview", "Resumen de tienda")}</h2><p>${esc(dateStr.charAt(0).toUpperCase() + dateStr.slice(1))}</p></div>
    <div class="ccact">
      <select class="select" style="height:32px;width:auto;font-size:12.5px" onchange="toast(tr('Demo range','Rango demo'), tr('The concept covers this month','El concepto cubre este mes')); this.selectedIndex=0"><option selected>${tr("This Month", "Este mes")}</option><option>${tr("Last Month", "Mes pasado")}</option></select>
      <select class="select" style="height:32px;width:auto;font-size:12.5px" onchange="toast(tr('Channels','Canales'), tr('SAMPLE: per-channel split ships with the real store','SAMPLE: el corte por canal llega con la tienda real')); this.selectedIndex=0"><option selected>${tr("All Channels", "Todos los canales")}</option><option>Front desk</option><option>Online</option></select>
    </div>
  </div>
  <div class="stgrid">
    <div class="crmcard stcells" style="margin-bottom:0;padding:0">${cells}</div>
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div class="cctitle" style="font-size:14px">${tr("Sales Overview", "Resumen de ventas")}</div>${CRM_I.arrUR.replace("<svg", "<svg style='width:15px;height:15px;color:var(--muted-foreground)'")}</div>
      <div class="stsales">
        <div class="stbars">${salesBars}</div>
        <svg class="actsvg glow" viewBox="0 0 1000 230" preserveAspectRatio="none" aria-hidden="true">
          <path d="${lpath}" fill="none" stroke="currentColor" stroke-width="1.6" vector-effect="non-scaling-stroke"/>
        </svg>
      </div>
      <div class="cflowx" style="margin-top:8px">${mLabels.map(m => `<span>${m}</span>`).join("")}</div>
    </div>
  </div>
  <div class="acgrid" style="grid-template-columns:1.4fr 1fr;margin-bottom:14px">
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div><div class="cctitle" style="font-size:14px">${tr("Store Traffic", "Tráfico de la tienda")}</div>
        <div class="ccdesc" style="font-size:16px;color:var(--foreground);font-weight:600">12.9K ${tr("visits", "visitas")} <span class="chip gray" style="font-size:9px;padding:1px 6px;vertical-align:2px">SAMPLE</span></div></div>
        <span class="actleg" style="gap:14px"><span class="actleg"><i style="background:var(--destructive)"></i>${tr("Anomalies", "Anomalías")}</span><span class="actleg dim"><i></i>${tr("Visitors", "Visitantes")}</span></span></div>
      <div class="sttraffic">
        <div class="stbars traffic">${tBars}</div>
        <svg class="actsvg red" viewBox="0 0 1000 230" preserveAspectRatio="none" aria-hidden="true">
          <path d="${aPath}" fill="none" stroke="var(--destructive)" stroke-opacity=".8" stroke-width="1.2" vector-effect="non-scaling-stroke"/>
        </svg>
      </div>
      <div class="cflowx" style="margin-top:6px"><span style="text-align:left">${tr("24h ago", "hace 24h")}</span><span style="text-align:right">${tr("now", "ahora")}</span></div>
    </div>
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div><div class="cctitle" style="font-size:14px">${tr("Traffic Sources", "Fuentes de tráfico")}</div>
        <div class="ccdesc" style="font-size:16px;color:var(--foreground);font-weight:600">14.8K ${tr("visits", "visitas")}</div></div>${CRM_I.arrUR.replace("<svg", "<svg style='width:15px;height:15px;color:var(--muted-foreground)'")}</div>
      ${srcRows}
      <p class="ccdesc" style="margin-top:10px">${tr("Channels are the real City Zero surfaces; volumes are SAMPLE.", "Los canales son las superficies reales de City Zero; los volúmenes son SAMPLE.")}</p>
    </div>
  </div>
  <div class="acgrid" style="grid-template-columns:1fr 1fr 1fr;margin-bottom:0">
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div><div class="cctitle" style="font-size:14px">${tr("Top Products", "Top productos")}</div>
        <div class="ccdesc" style="font-size:16px;color:var(--foreground);font-weight:600">73% ${tr("of sales", "de las ventas")}</div></div>${CRM_I.arrUR.replace("<svg", "<svg style='width:15px;height:15px;color:var(--muted-foreground)'")}</div>
      ${prodRows}
    </div>
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div><div class="cctitle" style="font-size:14px">${tr("Inventory", "Inventario")}</div>
        <div class="ccdesc" style="font-size:16px;color:var(--foreground);font-weight:600">61% ${tr("available", "disponible")}</div></div>${CRM_I.arrUR.replace("<svg", "<svg style='width:15px;height:15px;color:var(--muted-foreground)'")}</div>
      <div class="progress" style="height:9px;margin:8px 0 14px"><div class="bar" style="width:61%"></div></div>
      <p class="ccdesc">${tr("Low stock:", "Stock bajo:")} ${st.lowStock.map(x => `<b style="color:var(--amber)">${esc(x)}</b>`).join(" · ")}</p>
      <p class="ccdesc" style="margin-top:8px">${tr("Counts sync from the POS the day the store goes live.", "Los conteos sincronizan del POS el día que la tienda sale en vivo.")}</p>
    </div>
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div><div class="cctitle" style="font-size:14px">${tr("Reviews", "Reseñas")}</div>
        <div class="ccdesc" style="font-size:16px;color:var(--foreground);font-weight:600">${st.reviews.avg} ${tr("average rating", "de calificación")}</div></div>${CRM_I.arrUR.replace("<svg", "<svg style='width:15px;height:15px;color:var(--muted-foreground)'")}</div>
      <div class="strate">${"★".repeat(5)}<span class="mono" style="font-size:12px;color:var(--muted-foreground);margin-left:8px">${st.reviews.count} ${tr("reviews", "reseñas")}</span></div>
      <p class="ccdesc" style="margin-top:10px"><span class="chip green" style="font-size:9px;padding:1px 6px">REAL</span> ${tr("Google rating of the gym; product reviews arrive with the store.", "Calificación de Google del gimnasio; las reseñas de producto llegan con la tienda.")}</p>
    </div>
  </div>
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
  home: vToday, grow: vGrow, keep: vKeep, engine: vEngine, hours: vHours, inbox: vInbox,
  start: vStart,
  overview: vOverview, exceptions: vExceptions, surfaces: vSurfaces, routes: vRoutes,
  reviews: vReviews, report: vReport, settings: vSettings,
  pipeline: vPipeline, leads: vLeads, members: vMembers, profile: vProfile,
  workflows: vWorkflows, triggers: vTriggers, tasks: vTasks,
  analytics: vAnalytics, pulsereport: vPulseReport, paidmedia: vPaidMedia, meta: vMeta, integrations: vIntegrations, audit: vAudit,
  classes: vClassStats, calendar: vCalendar, access: vAccess, campaigns: vCampaigns, landing: vLanding,
  store: vStore,
};

/* banner tematico por seccion (Higgsfield, mismo lenguaje del hero de Today) */
const SEC_HEROES = {
  hours: ["When your gym is full, and when it is empty", "Cuándo está lleno, y cuándo vacío"],
  classes: ["Every class, measured", "Cada clase, medida"],
  calendar: ["The week, class by class", "La semana, clase por clase"],
  grow: ["The road to 500 members", "El camino a 500 miembros"],
  pipeline: ["No lead goes cold", "Ningún lead se enfría"],
  campaigns: ["Follow-up that runs itself", "Seguimiento que corre solo"],
  keep: ["Growth you already paid for", "Crecimiento que ya pagaste"],
  paidmedia: ["Every ad dollar, measured", "Cada dólar de ads, medido"],
  pulsereport: ["What you receive every month", "Lo que recibes cada mes"],
  engine: ["Everything running underneath", "Todo lo que corre debajo"],
};
function heroFor(id) {
  const h = SEC_HEROES[id];
  if (!h) return "";
  const label = SECTIONS.find(s => s.id === id)?.label || "";
  return `
  <div class="hero sec">
    <img src="assets/banners/${typeof THEME !== "undefined" && THEME === "light" ? "light/" : ""}${id === "calendar" ? "classes" : id}.webp" alt="" onerror="this.closest('.hero').remove()">
    <div class="heroshade"></div>
    <div class="herotxt"><span class="mono">CITY ZERO · ${esc(label.toUpperCase())}</span><b>${tr(h[0], h[1])}</b></div>
  </div>`;
}

function render() {
  let [id, arg] = (location.hash.replace(/^#/, "") || (FULL ? "start" : "home")).split("/");
  if (PUBLIC_DEMO && !SECTIONS.some(s => s.id === id)) id = "home";
  const view = VIEWS[id] || (FULL ? vOverview : vToday);
  $("#nav").innerHTML = SECTIONS.map(s => {
    if (s.group) return `<div class="navgroup">${s.group}</div>`;
    const b = s.badge ? s.badge() : null;
    return `<a href="#${s.id}" class="${s.id === id ? "active" : ""}">${NAV_ICONS[s.id] || NAV_ICONS._} <span class="navlbl">${s.label}</span>${b ? `<span class="n ${s.hot ? "hot" : ""}">${b}</span>` : ""}</a>`;
  }).join("");
  const cs = document.getElementById("crumb-sec");
  if (cs) cs.textContent = (LANG === "es" && typeof T !== "undefined" && T[SECTIONS.find(s => s.id === id)?.label]) || SECTIONS.find(s => s.id === id)?.label || "Today";
  $("#content").innerHTML = (id === "home" ? "" : heroFor(id)) + view(arg);
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
