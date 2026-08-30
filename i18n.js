/* CITY 0 OPS · i18n. English is the base language everywhere in the DOM.
   Spanish is applied as a post-render translation pass over known chrome
   strings (exact map + regex list for dynamic strings), plus tr() for
   strings created at runtime (toasts, dialogs). Persisted in localStorage. */

/* Puerta de login del demo: CADA carga del dashboard exige pasar por
   login.html (flag one-shot c0.once que el login siembra y esto consume,
   así el refresh siempre vuelve al login). El hash pendiente se conserva.
   QA/headless: ?auth=1 entra directo. */
(function () {
  const q = new URLSearchParams(location.search);
  if (q.get("auth") === "1") return;
  let ok = false;
  try { ok = sessionStorage.getItem("c0.once") === "1"; sessionStorage.removeItem("c0.once"); } catch (e) { }
  if (!ok) {
    try { sessionStorage.setItem("c0.after", location.hash || ""); } catch (e) { }
    location.replace("login.html");
  }
})();

let LANG = new URLSearchParams(location.search).get("lang") || localStorage.getItem("c0.lang") || "en";

/* tema dual (template next-shadcn-admin-dashboard-v1): dark = default de marca */
let THEME = new URLSearchParams(location.search).get("theme") || localStorage.getItem("c0.theme") || "dark";
if (THEME !== "light") THEME = "dark";
document.documentElement.classList.toggle("dark", THEME === "dark");
document.addEventListener("DOMContentLoaded", () =>
  document.querySelectorAll(".thbtn").forEach(b => b.classList.toggle("on", b.dataset.t === THEME)));
function setTheme(t) {
  THEME = t === "light" ? "light" : "dark";
  localStorage.setItem("c0.theme", THEME);
  document.documentElement.classList.toggle("dark", THEME === "dark");
  document.querySelectorAll(".thbtn").forEach(b => b.classList.toggle("on", b.dataset.t === THEME));
  if (typeof render === "function") render();
}

function tr(en, es) { return LANG === "es" ? es : en; }

function setLang(l) {
  LANG = l;
  localStorage.setItem("c0.lang", l);
  document.documentElement.lang = l;
  render();
  toast(tr("Language: English", "Idioma: Español"), tr("The whole dashboard chrome switches. Evidence quotes stay verbatim.", "Todo el chrome del dashboard cambia. Las citas de evidencia quedan verbatim."));
}

/* ---------------- exact-string dictionary (EN -> ES) ---------------- */
const T = {
  // nav groups
  "Guide": "Guía", "Monitor · live": "Monitor · en vivo", "CRM · phase 2": "CRM · fase 2",
  "Automation · phase 2": "Automatización · fase 2", "Analytics": "Analítica",
  "Pulse Metrics · marketing data": "Pulse Metrics · datos de marketing", "System": "Sistema",
  // nav items + titles
  "Start Here": "Inicio", "Overview": "Resumen", "Exceptions": "Excepciones", "Surfaces": "Superficies",
  "Routes & Links": "Rutas y Links", "Review Signal": "Señal de Reseñas", "Morning Report": "Reporte Matutino",
  "Pipeline": "Pipeline", "Lead Channels": "Canales de Leads", "Members": "Miembros",
  "Workflows": "Workflows", "Triggers": "Triggers", "Tasks": "Tareas",
  "Pulse Report": "Reporte Pulse", "Paid Media": "Paid Media", "Meta Health": "Salud Meta",
  "Integrations": "Integraciones", "Audit Log": "Bitácora", "Owners & Thresholds": "Dueños y Umbrales",
  // sidebar
  "Search & commands": "Buscar y comandos", "Read-only monitor": "Monitor de solo lectura",
  "No write access to any": "Sin acceso de escritura a", "City Zero system.": "ningún sistema de City Zero.",
  "Arqentia · Phase 1 demo": "Arqentia · demo Fase 1",
  "Now": "Ahora", "open": "abiertas", "route failing": "ruta fallando", "to answer": "por responder",
  "Language": "Idioma",
  "Classes": "Clases", "Access Control": "Control de Acceso", "Campaigns": "Campañas", "Landing Page": "Landing Page",
  "Gym OS · Glofox + BioStar": "Gym OS · Glofox + BioStar", "Growth": "Crecimiento",
  // pantalla / reporte / motor (memo 26.08) + pantallas de ops manager
  "Today": "Hoy", "Monthly Report": "Reporte Mensual", "Morning Email": "Correo Matutino", "The Engine": "El Motor",
  "Grow": "Crecer", "Keep": "Retener", "Hours": "Horas", "Ads Report": "Reporte de Ads", "Inbox": "Bandeja",
  "Overview": "Resumen", "Profile": "Perfil", "Account": "Cuenta", "Monitor": "Monitor", "Calendar": "Calendario", "Store": "Tienda",
  "Your gym · live": "Tu gimnasio · en vivo", "More members": "Más miembros", "Marketing": "Marketing",
  "Reports": "Reportes", "Under the hood": "Bajo el capó", "Pitch · ops manager": "Pitch · ops manager",
  "The screen · live": "La pantalla · en vivo", "The report · monthly": "El reporte · mensual",
  "The engine · silent": "El motor · en silencio", "Pitch · the screen": "Pitch · la pantalla",
  "THE PATH FROM 200 TO 500, MEASURED. THE GOAL IS THEIRS; THE INSTRUMENT IS THIS.":
    "EL CAMINO DE 200 A 500, MEDIDO. LA META ES DE ELLOS; EL INSTRUMENTO ES ESTE.",
  "Real cost per member": "Costo real por miembro", "Recoverable money": "Dinero rescatable",
  "Tours this week": "Tours esta semana",
  "Decide this week": "Decidir esta semana",
  "The four wounds, answered": "Las cuatro heridas, respondidas",
  "from their own surfaces and their own hiring post": "de sus propias superficies y su propio post de contratación",
  "Everything on this screen answers a decision this week. The depth lives in the monthly report; the engine runs silent underneath.":
    "Todo en esta pantalla responde a una decisión de esta semana. La profundidad vive en el reporte mensual; el motor corre en silencio debajo.",
  "EVERYTHING ELSE RUNS HERE, IN SILENCE. DEPTH IS INVENTORY, NOT NOISE.":
    "TODO LO DEMÁS CORRE AQUÍ, EN SILENCIO. LA PROFUNDIDAD ES INVENTARIO, NO RUIDO.",
  "The rule that decides what you see": "La regla que decide qué ves",
  "product principle, applied to every pixel": "principio de producto, aplicado a cada pixel",
  "Every element on the screen answers a decision the owner takes this week. If there is no decision, it goes to the monthly report. If not even there, it stays running here.":
    "Cada elemento en pantalla responde a una decisión que el dueño toma esta semana. Si no hay decisión, va al reporte mensual. Si tampoco, se queda corriendo aquí.",
  "The crosses no single platform can see": "Los cruces que ninguna plataforma ve sola",
  "Meta, Glofox and BioStar each hold a third of the answer": "Meta, Glofox y BioStar tienen un tercio de la respuesta cada uno",
  "In reserve": "En reserva", "revealed as the relationship advances": "se revela conforme avanza la relación",
  "The size of the engine": "El tamaño del motor", "from the official specs": "de los specs oficiales",
  "Ghost member": "Miembro fantasma", "Recoverable charge": "Cobro rescatable",
  "Real tour show-rate": "Show-rate real de tours", "LTV per channel": "LTV por canal",
  "They already pay Glofox's top plan and use a fraction of it. BioStar's API is free on every tier. The engine turns on what they already own.":
    "Ya pagan el plan máximo de Glofox y usan una fracción. El API de BioStar es gratis en todos los tiers. El motor enciende lo que ya pagaron.",
  "Open landing": "Abrir landing", "Weekly occupancy grid": "Grilla semanal de ocupación",
  "Today by hour": "Hoy por hora", "Door events": "Eventos de puerta", "Why it converts": "Por qué convierte",
  "Tour requests captured": "Solicitudes de tour capturadas", "Average fill": "Ocupación promedio",
  "On waitlists": "En waitlist", "Underfilled slots": "Slots con baja ocupación",
  "In the gym now": "En el gym ahora", "Check-ins today": "Check-ins hoy", "Peak hour": "Hora pico",
  "Glofox + BioStar feasibility": "Factibilidad Glofox + BioStar",
  "The whole wedge needs 15 of 316 endpoints": "La cuña completa necesita 15 de 316 endpoints",
  "simplicity is the architecture: we answer questions, we do not integrate platforms":
    "la simplicidad es la arquitectura: respondemos preguntas, no integramos plataformas",
  "endpoints documented across Glofox (65 operations + 10 webhook domains) and BioStar 2 (251). Full inventories live in the case file, extracted from the official specs.":
    "endpoints documentados entre Glofox (65 operaciones + 10 dominios de webhooks) y BioStar 2 (251). Los inventarios completos viven en el caso, extraídos de los specs oficiales.",
  "calls the wedge actually uses: 8 Glofox reads + 4 webhook domains, and 7 BioStar reads. Everything else stays documented and deliberately out of scope.":
    "llamadas que la cuña usa de verdad: 8 lecturas Glofox + 4 dominios de webhooks, y 7 lecturas BioStar. Todo lo demás queda documentado y deliberadamente fuera de alcance.",
  "surfaces the gym ever sees: a morning email, this dashboard, and one exception list. Nobody at City Zero operates a new system.":
    "superficies que el gimnasio ve: un correo matutino, este dashboard y una lista de excepciones. Nadie en City Zero opera un sistema nuevo.",
  "real pipeline, simulated data": "pipeline real, datos simulados",
  "The weekly timetable with live fill and waitlists per class, straight from their Glofox booking system.":
    "La grilla semanal con ocupación y waitlists por clase, directo de su sistema de reservas Glofox.",
  "Oldest open": "Más antigua", "Routes failing": "Rutas fallando", "Reviews to answer": "Reseñas por responder",
  "Open exceptions": "Excepciones abiertas", "open exceptions": "excepciones abiertas",
  "Quarterly": "Trimestral", "Monthly": "Mensual", "Yearly": "Anual",
  "quarterly": "trimestral", "monthly": "mensual", "yearly": "anual",
  "Positive (4-5 stars)": "Positivas (4-5 estrellas)", "Critical (1-2 stars)": "Críticas (1-2 estrellas)",
  "Red · member-facing": "Rojo · afecta miembros", "Amber · watch": "Ámbar · vigilar",
  // common buttons / labels
  "Export": "Exportar", "Run sweep now": "Correr barrido", "Assign owner": "Asignar dueño",
  "Assign": "Asignar", "Cancel": "Cancelar", "Save draft": "Guardar borrador", "Save": "Guardar",
  "View captured evidence": "Ver evidencia capturada", "Edit draft": "Editar borrador",
  "Copy for Google": "Copiar para Google", "Approve reply": "Aprobar respuesta", "Approved": "Aprobada",
  "View": "Ver", "Open": "Abrir", "Advance": "Avanzar", "See all": "Ver todo",
  "Export morning report": "Exportar reporte", "Go to dashboard": "Ir al dashboard",
  "Previous": "Anterior", "Next": "Siguiente", "Queue": "Cola", "All": "Todas", "Praise": "Elogios",
  "Role": "Rol", "Name": "Nombre", "Owner": "Dueño", "Detected": "Detectada", "Age": "Edad",
  "Timeline": "Línea de tiempo", "Insights": "Insights", "Completed": "Completado",
  "In progress": "En curso", "Recommendations": "Recomendaciones", "Diagnosis": "Diagnóstico",
  "Demo data policy": "Política de datos del demo",
  // table headers
  "Task": "Tarea", "Assignee": "Responsable", "Due": "Vence", "Origin": "Origen",
  "Exception": "Excepción", "Surface": "Superficie", "State": "Estado", "Status": "Estado",
  "Route": "Ruta", "Linked from": "Linkeada desde", "Note": "Nota", "Checked": "Verificada",
  "Channel": "Canal", "Public evidence": "Evidencia pública", "Section": "Sección",
  "What it shows": "Qué muestra", "Workflow": "Workflow", "Runs 30d": "Corridas 30d",
  "Last run": "Última corrida", "When": "Cuándo", "Then": "Entonces", "Fires 30d": "Disparos 30d",
  "Last fired": "Último disparo", "Member": "Miembro", "Plan": "Plan", "Since": "Desde",
  "Risk flag": "Riesgo", "Leak": "Fuga", "Why this order": "Por qué este orden",
  "File": "Archivo", "What it controls": "Qué controla", "Example change": "Ejemplo de cambio",
  "Field": "Campo", "What it holds": "Qué contiene", "Rule": "Regla", "Value": "Valor",
  "What it does": "Qué hace", "Likely today": "Probable hoy",
  // topbar subs / hints (static ones)
  "click a row for evidence": "clic en una fila para ver evidencia",
  "from the audit log · all real": "de la bitácora · todo real",
  "Top metrics": "Métricas principales", "Quick actions": "Acciones rápidas",
  "Recent activity": "Actividad reciente", "Ops intelligence": "Inteligencia operativa",
  "Review signal over time": "Señal de reseñas en el tiempo", "Open exceptions": "Excepciones abiertas",
  "This morning": "Esta mañana", "What changed": "Qué cambió", "What broke": "Qué se rompió",
  "Past threshold": "Sobre umbral", "Review queue": "Cola de reseñas",
  "The story in four sentences": "La historia en cuatro frases",
  "How to read the labels": "Cómo leer las etiquetas",
  "The complete map, section by section": "El mapa completo, sección por sección",
  "Glossary": "Glosario", "How to make changes": "Cómo hacer cambios",
  "the terms the dashboard uses": "los términos que usa el dashboard",
  "What you are looking at, and how to change it": "Qué estás viendo, y cómo cambiarlo",
  "INTERNAL · this section is not shown to the prospect": "INTERNO · esta sección no se muestra al prospecto",
  // Ads Report: bloque inferior (contenido data-driven de DATA.paidmedia)
  "The service: media buying with instruments": "El servicio: media buying con instrumentos",
  "Arqentia runs the campaigns · Pulse crosses every dollar against real outcomes": "Arqentia corre las campañas · Pulse cruza cada dólar contra resultados reales",
  "Spend to members, one funnel": "De inversión a miembros, un solo funnel",
  "SAMPLE scenario · leads land in the CRM Pipeline with their campaign attached": "Escenario SAMPLE · los leads caen al Pipeline del CRM con su campaña adjunta",
  "Step 0: the plumbing": "Paso 0: la plomería",
  "real, from their own hiring post": "real, de su propio post de contratación",
  "Where the money leaks, and how this setup catches it": "Dónde se fuga el dinero, y cómo este setup lo atrapa",
  "the anomalies cross, adapted to a gym": "el cruce de anomalías, adaptado a un gimnasio",
  "Leak": "Fuga", "How Pulse catches it": "Cómo lo atrapa Pulse", "Why City Zero specifically": "Por qué City Zero específicamente",
  "The moat, in one line:": "El moat, en una línea:",
  "Real cost per member = total ad spend ÷ new members in Glofox. Meta will not give you that number, Google will not either, and both together will claim more members than actually joined. Pulse exists to compute the real one, on City Zero's side.": "Costo real por miembro = inversión total ÷ miembros nuevos en Glofox. Meta no te da ese número, Google tampoco, y juntos claman más miembros de los que realmente entraron. Pulse existe para calcular el real, del lado de City Zero.",
  "Both platforms claim credit for the same person. Combined they over-report by +32% in this sample scenario. The deterministic cross against Glofox joins is the Pulse moat: attribution decided by the merchant's data, not the platforms'.": "Ambas plataformas claman crédito por la misma persona. Combinadas sobre-reportan +32% en este escenario sample. El cruce determinístico contra las altas de Glofox es el moat de Pulse: la atribución la deciden los datos del comercio, no las plataformas.",
  "Campaign map per goal: guided tours, trials, event tickets. Budget split across Meta and Google with one owner: Arqentia as media buyer.": "Mapa de campañas por meta: tours guiados, trials, tickets de eventos. Presupuesto repartido entre Meta y Google con un solo dueño: Arqentia como media buyer.",
  "Campaigns live on clean plumbing: reconnected Business Suite, one official page, pixel + conversions wired to real bookings.": "Campañas sobre plomería limpia: Business Suite reconectado, una sola página oficial, pixel + conversiones cableadas a reservas reales.",
  "Pulse crosses spend against Glofox outcomes. Junk clicks cut, budgets moved to what produces members, not what platforms score well.": "Pulse cruza la inversión contra resultados de Glofox. Clicks basura cortados, presupuestos movidos a lo que produce miembros, no a lo que las plataformas puntúan bien.",
  "One Pulse report: spend, real cost per member, platform claims vs real joins, waste found, next month's plan. Numbers, not reels.": "Un reporte Pulse: inversión, costo real por miembro, claims vs altas reales, desperdicio encontrado, plan del mes siguiente. Números, no reels.",
  "Ad spend": "Inversión en ads", "Leads into Pipeline": "Leads al Pipeline", "New members": "Miembros nuevos",
  "· sample monthly budget": "· presupuesto mensual sample", "· forms, DMs, tour requests": "· forms, DMs y pedidos de tour",
  "· booked in Glofox": "· agendados en Glofox", "· the only number that matters": "· el único número que importa",
  "Meta Ads claims": "Claims de Meta Ads", "Google Ads claims": "Claims de Google Ads",
  "Platforms combined": "Plataformas combinadas", "Real new members (Glofox)": "Miembros nuevos reales (Glofox)",
  "Junk and accidental clicks": "Clicks basura y accidentales",
  "Click-quality anomalies: bounce-in-seconds traffic that still bills. Cut at the placement level.": "Anomalías de calidad de click: tráfico que rebota en segundos y aun así factura. Se corta a nivel de placement.",
  "The founder's original pain: years of spend with junk clicks nobody caught.": "El dolor original del founder: años de inversión con clicks basura que nadie atrapó.",
  "Ads delivering while the gym is closed": "Ads entregándose con el gimnasio cerrado",
  "Delivery schedule crossed against real staffed hours, so tour requests land when someone can answer.": "El calendario de entrega cruzado contra las horas reales con staff, para que los pedidos de tour lleguen cuando alguien puede responder.",
  "Ties to EX-001: the monitor knows the real hours; the ads inherit them.": "Conecta con EX-001: el monitor conoce los horarios reales; los ads los heredan.",
  "Event promos without visible terms": "Promos de eventos sin términos visibles",
  "Every boosted event links a page where refund terms are visible before payment.": "Cada evento promocionado linkea una página donde los términos de reembolso se ven antes del pago.",
  "Ties to EX-004: the Jordana ZIN one-star was an ads-to-policy handoff failure.": "Conecta con EX-004: la 1 estrella de Jordana ZIN fue una falla del handoff ads→política.",
  "Reconnect FB and Instagram, one official page,": "Reconectar FB e Instagram, una sola página oficial,",
  "Pixel + conversion events wired to real bookings,": "Pixel + eventos de conversión cableados a reservas reales,",
  "Ad account access and history,": "Acceso e historial de la cuenta de ads,",
  "EX-005 and EX-006, the cleanup in Meta Health. You cannot buy media on broken plumbing.": "EX-005 y EX-006, la limpieza en Meta Health. No se puede comprar media sobre plomería rota.",
  "Needs Glofox edition and site access: Discovery.": "Requiere edición de Glofox y acceso al sitio: Discovery.",
  "Discovery. Past spend, if any, becomes the baseline Pulse audits first.": "Discovery. La inversión pasada, si existe, se vuelve la línea base que Pulse audita primero.",
  "by Arqentia · they asked for a media buyer; this is the buyer with instruments": "by Arqentia · pidieron un media buyer; este es el buyer con instrumentos",
  // Store + Profile
  "City Zero Store": "Tienda City Zero",
  "Search the dashboard...": "Busca en el dashboard...",
  "Made by": "Hecho por",
  "Protein shakes · front bar": "Batidos de proteína · barra", "CZ tee + hoodie drop": "Drop de camiseta + hoodie CZ",
  "Day passes": "Pases de día", "Gloves, straps, shakers": "Guantes, straps, shakers",
  "Front desk": "Recepción",
  "The retail layer Glofox already supports, as a concept: merch, shakes and day passes with sales, traffic and inventory in one screen. All volumes SAMPLE.": "La capa retail que Glofox ya soporta, como concepto: merch, shakes y pases de día con ventas, tráfico e inventario en una pantalla. Todos los volúmenes SAMPLE.",
  "The demo account behind this dashboard: read-only access, what it watches, and who sponsors it on the client side.": "La cuenta demo detrás de este dashboard: acceso de solo lectura, qué observa y quién la patrocina del lado del cliente.",
};

/* ---------------- regex dictionary for dynamic strings ---------------- */
const TRX = [
  [/^(\d+) OPEN · (\d+) RESOLVED$/, "$1 ABIERTAS · $2 RESUELTAS"],
  [/^LAST SWEEP (.+)$/, "ÚLTIMO BARRIDO $1"],
  [/^(\d+) past 80 days · 0 new since Aug 20$/, "$1 con más de 80 días · 0 nuevas desde el 20 ago"],
  [/^(\d+)\/(\d+) done$/, "$1/$2 hechas"],
  [/^(\d+) REAL FROM THE MONITOR · (\d+) SAMPLE FROM CRM$/, "$1 REALES DEL MONITOR · $2 SAMPLE DEL CRM"],
  [/^(\d+) LINKED ROUTES · (\d+) FAILING$/, "$1 RUTAS LINKEADAS · $2 FALLANDO"],
  [/^EVERY LEAD, ONE BOARD, AN OWNER AND A CLOCK ON EACH$/, "CADA LEAD, UN TABLERO, UN DUEÑO Y UN RELOJ"],
  [/^WHEN THIS HAPPENS, DO THAT\. NOTHING FIRES SILENTLY\.$/, "CUANDO PASE X, HAZ Y. NADA DISPARA EN SILENCIO."],
  [/^ONE EMAIL, EVERY DAY AT 06:30 ET, TO A LIST YOU CHOOSE$/, "UN CORREO DIARIO A LAS 06:30 ET, A LA LISTA QUE ELIJAS"],
  [/^EVERY PUBLIC SURFACE CITY ZERO OWNS, READ DAILY$/, "CADA SUPERFICIE PÚBLICA DE CITY ZERO, LEÍDA A DIARIO"],
  [/^A FINDING WITH NO OWNER AND NO AGE IS A NOTE\. WITH BOTH, IT IS A TASK\.$/, "UN HALLAZGO SIN DUEÑO NI EDAD ES UNA NOTA. CON AMBOS, ES UNA TAREA."],
  [/^READ-ONLY IS THE ARCHITECTURE, NOT A SETTING$/, "READ-ONLY ES LA ARQUITECTURA, NO UNA OPCIÓN"],
  [/^EVERYTHING THE MONITOR DID, IN ORDER, FOREVER$/, "TODO LO QUE HIZO EL MONITOR, EN ORDEN, PARA SIEMPRE"],
  [/^(\d+) DAYS$/, "$1 DÍAS"], [/^(\d+) days$/, "$1 días"],
  [/^OPEN (\d+) DAYS$/, "ABIERTA $1 DÍAS"],
  [/^Good morning, Rafa$/, "Buenos días, Rafa"], [/^Good evening, Rafa$/, "Buenas noches, Rafa"],
  [/^SWEEP 06:00 ET$/, "BARRIDO 06:00 ET"],
  [/^Assign owners \((\d+)\)$/, "Asignar dueños ($1)"],
  [/^Approve replies \((\d+)\)$/, "Aprobar respuestas ($1)"],
  [/^(\d+) past 80 days(.*)$/, "$1 con 80+ días$2"],
  [/^REAL · sample of 20 captured Aug 20$/, "REAL · muestra de 20 capturada el 20 ago"],
  [/^from the audit log · all real$/, "de la bitácora · todo real"],
  [/^STEP 0\.(\d+)$/, "PASO 0.$1"],
  [/^monthly client report · (.+)$/, "reporte mensual al cliente · $1"],
];

/* ---------------- post-render DOM pass ---------------- */
function applyTranslations() {
  document.documentElement.lang = LANG;
  if (LANG !== "es") return;
  const root = document.body;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => {
      const p = n.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (["SCRIPT", "STYLE", "TEXTAREA"].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
      return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    const raw = n.nodeValue;
    const key = raw.trim();
    if (T[key]) { n.nodeValue = raw.replace(key, T[key]); continue; }
    for (const [rx, rep] of TRX) {
      if (rx.test(key)) { n.nodeValue = raw.replace(key, key.replace(rx, rep)); break; }
    }
  }
  document.querySelectorAll("input[placeholder]").forEach(inp => {
    const k = inp.getAttribute("placeholder");
    if (T[k]) inp.setAttribute("placeholder", T[k]);
  });
}

/* register extra entries from other files */
function i18nAdd(map) { Object.assign(T, map); }
