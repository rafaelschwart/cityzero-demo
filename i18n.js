/* CITY 0 OPS · i18n. English is the base language everywhere in the DOM.
   Spanish is applied as a post-render translation pass over known chrome
   strings (exact map + regex list for dynamic strings), plus tr() for
   strings created at runtime (toasts, dialogs). Persisted in localStorage. */

/* Puerta de login del demo: sin sesión (c0.auth) el dashboard redirige a
   login.html (cualquier credencial entra; el hash pendiente se conserva).
   QA/deep-links: ?auth=1 abre sesión directo, ?auth=0 la cierra. */
(function () {
  const q = new URLSearchParams(location.search);
  if (q.get("auth") === "0") localStorage.removeItem("c0.auth");
  if (q.get("auth") === "1") localStorage.setItem("c0.auth", "1");
  if (!localStorage.getItem("c0.auth")) {
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
