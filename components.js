/* CITY 0 OPS · shadcn component behaviors (vanilla port of Radix patterns):
   dialog, sheet, toast (sonner), tooltip, command palette (cmdk),
   accordion, switch, checkbox, dropdown close, Esc handling. */

/* ---------- portal roots ---------- */
document.addEventListener("DOMContentLoaded", () => {
  document.body.insertAdjacentHTML("beforeend", `
    <div class="overlay" id="ui-overlay"></div>
    <div class="dialog" id="ui-dialog" role="dialog" aria-modal="true"></div>
    <div class="sheet" id="ui-sheet" role="dialog" aria-modal="true"></div>
    <div class="cmdk" id="ui-cmdk"></div>
    <div class="toaster" id="ui-toaster" role="status" aria-live="polite"></div>
    <div class="tooltip" id="ui-tooltip"><span class="tt-text"></span><span class="arrow"></span></div>`);
  document.getElementById("ui-overlay").addEventListener("click", closeLayers);
  const t = new URLSearchParams(location.search).get("open");
  if (t) document.head.insertAdjacentHTML("beforeend", "<style>*{transition:none!important;animation:none!important}</style>");
  if (t === "cmdk") setTimeout(openCmdk, 400);
  if (t === "dialog") setTimeout(() => window.assignOwnerDialog && assignOwnerDialog("EX-001"), 400);
  if (t === "sheet") setTimeout(() => window.editDraftSheet && editDraftSheet(0), 400);
  if (t && t.startsWith("member")) setTimeout(() => openMember(decodeURIComponent(t.split(":")[1] || "") || DATA.today.feed[0].name), 500);
  if (t && t.startsWith("lead")) setTimeout(() => openLead(decodeURIComponent(t.split(":")[1] || "") || DATA.pipeline.cards[0].name), 500);
  if (t && t.startsWith("class")) setTimeout(() => openClass(decodeURIComponent(t.split(":")[1] || "") || "Pilates Sculpt", 16, 20, 0), 500);
});

function closeLayers() {
  ["ui-dialog", "ui-sheet", "ui-cmdk"].forEach(id => document.getElementById(id)?.classList.remove("open"));
  document.getElementById("ui-overlay")?.classList.remove("open");
}
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeLayers();
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); toggleCmdk(); }
});

/* ---------- dialog & sheet ---------- */
function openDialog(html) {
  const d = document.getElementById("ui-dialog");
  d.innerHTML = `<button class="dclose" onclick="closeLayers()" aria-label="Close">${I.x}</button>` + html;
  d.classList.add("open");
  document.getElementById("ui-overlay").classList.add("open");
  if (typeof applyTranslations === "function") applyTranslations();
  d.querySelector("input,select,textarea,button:not(.dclose)")?.focus();
}
function openSheet(html) {
  const s = document.getElementById("ui-sheet");
  s.innerHTML = html;
  s.classList.add("open");
  document.getElementById("ui-overlay").classList.add("open");
  if (typeof applyTranslations === "function") applyTranslations();
}

/* ---------- member profile (foto + detalles desde la "base de miembros") ----------
   Perfil determinista sembrado por nombre (SAMPLE); cuando el nombre existe en
   las listas conocidas (at-risk, recovery, members) esos datos reales del demo
   pisan lo generado. La foto real llega de Glofox cuando exista acceso. */
function _mhash(s) { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
function memberProfile(name) {
  const h = _mhash(name);
  const plans = DATA.members.planMix;
  const plan = plans[h % plans.length].plan;
  const classes = DATA.classes.list.map(c => c.name);
  const floors = ["Floor 1 · Main", "Floor 2 · Studio", "Floor 3 · Weights", "Floor 4 · Rooftop"];
  const freq = 1 + (h % 4);
  const weeks = Array.from({ length: 8 }, (_, i) => Math.max(0, freq + ((h >> (i * 3)) % 3) - 1));
  const p = {
    name, plan, status: "active", payment: "ok",
    sinceMonths: 3 + (h % 28),
    perWeek: freq, last: `${(h % 3) + 1} days ago`,
    fav: classes[h % classes.length], floor: floors[(h >> 4) % 4],
    weeks, note: null,
  };
  const risk = (DATA.keep.saveList || []).find(r => r.name === name) ||
               (DATA.access.atRisk || []).find(r => r.name === name);
  if (risk) { p.status = "at risk"; p.last = `${risk.days || parseInt(risk.last) || 14} days ago`; p.plan = risk.plan || p.plan; p.weeks = [3, 3, 2, 2, 1, 1, 0, 0]; p.note = tr("Win-back sequence armed: day-14 email fired.", "Secuencia de rescate armada: email día-14 disparado."); }
  const rec = (DATA.keep.recovery || []).find(r => r.name === name);
  if (rec) { p.payment = "failed"; p.note = tr(`Autopay of $${rec.amount} failed; still training. Expired card, not churn.`, `Autopago de $${rec.amount} falló; sigue entrenando. Tarjeta vencida, no baja.`); }
  const row = (DATA.members.rows || []).find(r => r.name === name);
  if (row) { p.plan = row.plan; p.status = row.status; if (row.since) p.sinceLabel = row.since; }
  return p;
}
function openMember(name) {
  const p = memberProfile(name);
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const maxW = Math.max(...p.weeks, 1);
  const bars = p.weeks.map((v, i) => `<div class="wb" data-tip="${tr("week", "semana")} -${8 - i} · ${v} ${tr("visits", "visitas")}"><i style="height:${Math.max(8, v / maxW * 100)}%"></i></div>`).join("");
  const statusChip = p.status === "at risk" ? `<span class="chip red">${tr("AT RISK", "EN RIESGO")}</span>`
    : p.status === "frozen" ? `<span class="chip amber">FROZEN</span>`
    : `<span class="chip green">${tr("ACTIVE", "ACTIVO")}</span>`;
  const payChip = p.payment === "failed" ? `<span class="chip amber">${tr("PAYMENT FAILED", "PAGO FALLIDO")}</span>` : "";
  openDialog(`
    <div class="mprof">
      <div class="mphead">
        <div class="mphoto"><span>${esc(initials)}</span><img src="assets/members/p${_mhash(name) % 10}.webp" alt="" onerror="this.remove()"></div>
        <div class="mpid">
          <h2>${esc(p.name)}</h2>
          <div class="mpchips">${statusChip}${payChip}<span class="chip gray">SAMPLE</span></div>
          <div class="mpplan">${esc(p.plan)}</div>
        </div>
      </div>
      <div class="mpgrid">
        <div class="mpf"><b>${tr("Member since", "Miembro desde")}</b><span>${p.sinceLabel ? esc(p.sinceLabel) : p.sinceMonths + " " + tr("months", "meses")}</span></div>
        <div class="mpf"><b>${tr("Visits / week", "Visitas / semana")}</b><span>${p.perWeek}</span></div>
        <div class="mpf"><b>${tr("Last visit", "Última visita")}</b><span>${esc(p.last)}</span></div>
        <div class="mpf"><b>${tr("Favorite class", "Clase favorita")}</b><span>${esc(p.fav)}</span></div>
        <div class="mpf"><b>${tr("Usual floor", "Piso habitual")}</b><span>${esc(p.floor)}</span></div>
        <div class="mpf"><b>${tr("Payment", "Pago")}</b><span>${p.payment === "ok" ? tr("Up to date", "Al día") : tr("Failed, retrying", "Fallido, reintentando")}</span></div>
      </div>
      <div class="mpweeks"><div class="mpwl">${tr("Last 8 weeks", "Últimas 8 semanas")}</div><div class="wbrow">${bars}</div></div>
      ${p.note ? `<div class="mpnote">${p.note}</div>` : ""}
      <div class="mpactions">
        <button class="btn" onclick="toast(tr('Message queued', 'Mensaje en cola'), tr('Sent from City Zero\\'s own account.', 'Sale de la cuenta propia de City Zero.'))">${tr("Send message", "Enviar mensaje")}</button>
        ${p.payment === "failed" ? `<button class="btn" onclick="toast(tr('Payment link sent', 'Link de pago enviado'), '')">${tr("Send payment link", "Enviar link de pago")}</button>` : ""}
        ${p.status === "at risk" ? `<button class="btn ghost" onclick="toast(tr('Win-back call logged', 'Llamada de rescate registrada'), '')">${tr("Log win-back call", "Registrar llamada")}</button>` : ""}
      </div>
      <div class="mpfoot">${tr("Sample photo: an AI-generated stand-in, not a real person. Real photos and full history sync from their Glofox member record the day credentials exist.", "Foto de muestra: generada con AI, no es una persona real. Las fotos reales y el historial completo se sincronizan del registro Glofox el día que existan credenciales.")}</div>
    </div>`);
}

/* ---------- ficha de clase: instructor + agenda ---------- */
function openClass(name, booked, cap, wait) {
  const info = (DATA.classes.info || {})[name] || {};
  const photo = (DATA.classes.photos || {})[name];
  const agenda = (info.agenda || []).map(a => `
    <div class="agrow"><span class="mono">${esc(a[0])} min</span><span>${esc(a[1])}</span></div>`).join("");
  const instIni = (info.inst || "T C").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  openDialog(`
    <div class="clprof">
      ${photo ? `<div class="clphoto"><img src="${photo}" alt="" onerror="this.closest('.clphoto').remove()"></div>` : ""}
      <div class="cltitle">
        <h2>${esc(name)}</h2>
        <div class="mpchips">
          ${info.dur ? `<span class="chip gray">${info.dur} min</span>` : ""}
          ${booked != null ? `<span class="chip ${booked >= cap ? "green" : "gray"}">${booked}/${cap} ${tr("booked", "reservados")}</span>` : ""}
          ${wait ? `<span class="chip amber">+${wait} ${tr("waitlist", "en espera")}</span>` : ""}
        </div>
      </div>
      <div class="clinst">
        <span class="favatar" style="width:44px;height:44px"><i>${esc(instIni)}</i>${info.instPhoto ? `<img src="${info.instPhoto}" alt="" onerror="this.remove()">` : ""}</span>
        <div><b>${esc(info.inst || "Team coach")}</b>
          <span>${info.real ? tr("Instructor · from City Zero's own public team page", "Instructor · de la página pública del equipo de City Zero") : tr("Coach assignment shown as SAMPLE until Glofox connects", "Asignación de coach SAMPLE hasta conectar Glofox")}</span></div>
        ${info.real ? '<span class="chip green">REAL</span>' : '<span class="chip gray">SAMPLE</span>'}
      </div>
      ${info.desc ? `<p class="cldesc">${esc(info.desc)}</p>` : ""}
      ${agenda ? `<div class="lsec">${tr("Class agenda", "Agenda de la clase")}</div><div class="agenda">${agenda}</div>` : ""}
      <div class="mpfoot">${tr("Booking, roster and instructor live in Glofox; this card just reads them.", "Reserva, roster e instructor viven en Glofox; esta ficha solo los lee.")}</div>
    </div>`);
}

/* ---------- lead card (kanban): seguimiento, notas, status, automatizacion ---------- */
function openLead(name) {
  const c = DATA.pipeline.cards.find(x => x.name === name);
  if (!c) return;
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const notes = (STATE.leadNotes[name] || []);
  const auto = STATE.leadCampaigns[name] || {};
  const baseTl = [
    { t: `${c.days}d`, e: tr("Lead created", "Lead creado") + " · " + c.source },
    { t: `${Math.max(0, c.days - 1)}d`, e: tr("Assigned to", "Asignado a") + " " + c.owner },
  ];
  const tl = [...baseTl.map(x => `<div class="tlrow"><span class="tlt mono">${esc(x.t)}</span><span>${esc(x.e)}</span></div>`),
              ...notes.map(n => `<div class="tlrow note"><span class="tlt mono">${esc(n.ts)}</span><span>${esc(n.txt)}</span></div>`)].join("");
  const stageOpts = DATA.pipeline.stages.map(s =>
    `<option value="${s.key}" ${s.key === c.stage ? "selected" : ""}>${esc(s.label)}</option>`).join("");
  const seqs = DATA.campaigns.map(cp => `
    <div class="seqrow">
      <div><b>${esc(cp.name)}</b><span>${esc(cp.trigger)}</span></div>
      <button class="switch" role="switch" aria-checked="${auto[cp.id] ? "true" : "false"}"
        onclick="toggleLeadCampaign('${name.replace(/'/g, "\\'")}', '${cp.id}', this)"><span class="thumb"></span></button>
    </div>`).join("");
  openSheet(`
    <div class="shead">
      <div class="kname" style="font-size:15px"><span class="avatar">${esc(initials)}</span>${esc(c.name)}</div>
      <button class="dclose" onclick="closeLayers()" aria-label="Close">${I.x}</button>
    </div>
    <div class="sbody leadsheet">
      <div class="mpchips" style="margin-bottom:14px">
        <span class="chip gray">${esc(c.source)}</span>
        ${c.landing ? '<span class="chip green">LIVE</span>' : ""}${c.paid ? '<span class="chip green">PULSE</span>' : ""}
        ${c.breach ? `<span class="chip red">SLA BREACH</span>` : ""}
      </div>
      <div class="lsrow">
        <label>${tr("Stage", "Etapa")}</label>
        <select class="input" onchange="setLeadStage('${name.replace(/'/g, "\\'")}', this.value)">${stageOpts}</select>
      </div>
      <div class="lsrow"><label>${tr("Owner", "Dueño")}</label><div class="lsval">${esc(c.owner)}</div></div>
      <div class="lsrow"><label>${tr("Next step", "Próximo paso")}</label><div class="lsval">${esc(c.next)}</div></div>
      <div class="lsec">${tr("Follow-up timeline", "Línea de seguimiento")}</div>
      <div class="tl">${tl}</div>
      <div class="lsec">${tr("Log a note", "Registrar nota")}</div>
      <textarea class="input" id="lead-note" rows="2" placeholder="${tr("Called, prefers evening tours...", "Llamé, prefiere tours de tarde...")}"></textarea>
      <button class="btn" style="margin-top:8px" onclick="addLeadNote('${name.replace(/'/g, "\\'")}')">${tr("Save note", "Guardar nota")}</button>
      <div class="lsec">${tr("Automated sequences", "Secuencias automáticas")}</div>
      <div class="seqs">${seqs}</div>
      <div class="mpfoot" style="margin-top:14px">${tr("Everything here persists in the demo. In production it reads and writes Glofox's own lead states and interactions.", "Todo esto persiste en el demo. En producción lee y escribe los estados e interacciones nativos de leads de Glofox.")}</div>
    </div>`);
}
function setLeadStage(name, key) {
  STATE.stages[name] = key;
  const c = DATA.pipeline.cards.find(x => x.name === name);
  if (c) c.stage = key;
  persist();
  toast(tr("Stage updated", "Etapa actualizada"), tr("The board reflects it now.", "El tablero ya lo refleja."));
  openLead(name);
  if ((location.hash || "").includes("pipeline")) render();
}
function addLeadNote(name) {
  const el = document.getElementById("lead-note");
  const txt = (el?.value || "").trim();
  if (!txt) return;
  (STATE.leadNotes[name] = STATE.leadNotes[name] || []).push({ ts: tr("now", "ahora"), txt });
  persist();
  toast(tr("Note saved", "Nota guardada"), "");
  openLead(name);
}
function toggleLeadCampaign(name, cid, el) {
  const on = toggleSwitch(el);
  (STATE.leadCampaigns[name] = STATE.leadCampaigns[name] || {})[cid] = on;
  persist();
  const cp = DATA.campaigns.find(x => x.id === cid);
  toast(on ? tr("Enrolled in sequence", "Inscrito en secuencia") : tr("Sequence paused", "Secuencia pausada"),
        on ? `${cp.name} · ${tr("first touch queued", "primer toque en cola")}` : cp.name);
}

/* ---------- toast (sonner) ---------- */
function toast(title, desc) {
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `${I.checkmsg}<div><b>${title}</b>${desc ? `<p>${desc}</p>` : ""}</div>`;
  document.getElementById("ui-toaster").appendChild(t);
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 3800);
}

/* ---------- tooltip (data-tip) ---------- */
document.addEventListener("mouseover", e => {
  const el = e.target.closest("[data-tip]");
  const tip = document.getElementById("ui-tooltip");
  if (!tip) return;
  if (!el) { tip.classList.remove("show"); return; }
  tip.querySelector(".tt-text").textContent = el.dataset.tip;
  tip.classList.add("show");
  const r = el.getBoundingClientRect();
  tip.style.left = Math.max(8, Math.min(r.left + r.width / 2 - tip.offsetWidth / 2, innerWidth - tip.offsetWidth - 8)) + "px";
  tip.style.top = (r.top - tip.offsetHeight - 8) + "px";
});

/* ---------- command palette (cmdk · look de ui.shadcn.com) ---------- */
let cmdkSel = 0;
const CMDK_SEARCH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>`;
const CMDK_ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>`;
function cmdkItems() {
  const nav = SECTIONS.filter(s => s.id).map(s => ({
    group: tr("Pages", "Páginas"), kind: "page",
    label: LANG === "es" && typeof T !== "undefined" && T[s.label] ? T[s.label] : s.label, icon: CMDK_ARROW,
    run: () => { location.hash = s.id; },
  }));
  const modeToggle = (typeof PUBLIC_DEMO !== "undefined" && PUBLIC_DEMO) ? [] : [
    { group: tr("Actions", "Acciones"), label: FULL
        ? tr("Pitch mode: simple nav (screen / report / engine)", "Modo pitch: nav simple (pantalla / reporte / motor)")
        : tr("Internal mode: full dashboard (all 20 sections)", "Modo interno: dashboard completo (las 20 secciones)"),
      icon: I.chevR,
      run: () => { if (FULL) localStorage.removeItem("c0.full"); else localStorage.setItem("c0.full", "1");
                   location.href = location.pathname; } },
  ];
  const actions = [
    ...modeToggle,
    { group: tr("Actions", "Acciones"), label: tr("Run sweep now", "Correr barrido"), icon: I.sweep, run: () => runSweepDemo() },
    { group: tr("Actions", "Acciones"), label: tr("Toggle language (EN/ES)", "Cambiar idioma (EN/ES)"), icon: I.chevR, run: () => setLang(LANG === "en" ? "es" : "en") },
    { group: tr("Actions", "Acciones"), label: THEME === "dark" ? tr("Light mode", "Modo claro") : tr("Dark mode", "Modo oscuro"), icon: I.chevR, run: () => setTheme(THEME === "dark" ? "light" : "dark") },
    { group: tr("Actions", "Acciones"), label: tr("Export morning report", "Exportar reporte matutino"), icon: I.download, run: () => exportReport() },
    { group: tr("Actions", "Acciones"), label: tr("Assign owner to EX-001", "Asignar dueño a EX-001"), icon: I.userplus, run: () => assignOwnerDialog("EX-001") },
  ];
  return [...nav, ...actions];
}
function toggleCmdk() {
  const c = document.getElementById("ui-cmdk");
  c.classList.contains("open") ? closeLayers() : openCmdk();
}
function openCmdk(seed = "") {
  const c = document.getElementById("ui-cmdk");
  cmdkSel = 0;
  c.innerHTML = `
    <div class="cin">${CMDK_SEARCH}<input id="cmdk-in" placeholder="${tr("Search the dashboard...", "Busca en el dashboard...")}" autocomplete="off"></div>
    <div class="clist" id="cmdk-list"></div>
    <div class="cfoot"><span class="fkbd">&crarr;</span><span id="cmdk-footlabel">${tr("Go to Page", "Ir a la página")}</span></div>`;
  c.classList.add("open");
  document.getElementById("ui-overlay").classList.add("open");
  const input = c.querySelector("#cmdk-in");
  input.value = seed;
  input.addEventListener("input", () => { cmdkSel = 0; renderCmdkList(input.value); });
  input.addEventListener("keydown", e => {
    const items = [...c.querySelectorAll(".citem")];
    if (e.key === "ArrowDown") { e.preventDefault(); cmdkSel = Math.min(cmdkSel + 1, items.length - 1); paintSel(items); }
    if (e.key === "ArrowUp") { e.preventDefault(); cmdkSel = Math.max(cmdkSel - 1, 0); paintSel(items); }
    if (e.key === "Enter") { e.preventDefault(); items[cmdkSel]?.click(); }
  });
  renderCmdkList(seed);
  input.focus();
}
function paintSel(items) {
  items.forEach((it, i) => it.classList.toggle("sel", i === cmdkSel));
  items[cmdkSel]?.scrollIntoView({ block: "nearest" });
  const fl = document.getElementById("cmdk-footlabel");
  if (fl && items[cmdkSel]) {
    fl.textContent = items[cmdkSel].dataset.kind === "page"
      ? tr("Go to Page", "Ir a la página") : tr("Run Command", "Ejecutar comando");
  }
}
function renderCmdkList(q) {
  const list = document.getElementById("cmdk-list");
  const items = cmdkItems().filter(i => i.label.toLowerCase().includes(q.toLowerCase()));
  if (!items.length) { list.innerHTML = `<div class="cempty">${tr("No results found.", "Sin resultados.")}</div>`; return; }
  let html = "", lastGroup = null, idx = 0;
  for (const it of items) {
    if (it.group !== lastGroup) { html += `<div class="cgroup">${it.group}</div>`; lastGroup = it.group; }
    html += `<div class="citem ${idx === cmdkSel ? "sel" : ""}" data-idx="${idx}" data-kind="${it.kind || "action"}">${it.icon}<span>${it.label}</span></div>`;
    idx++;
  }
  list.innerHTML = html;
  const flat = items;
  list.querySelectorAll(".citem").forEach(el => {
    el.addEventListener("click", () => { closeLayers(); flat[Number(el.dataset.idx)].run(); });
    el.addEventListener("mousemove", () => { cmdkSel = Number(el.dataset.idx); paintSel([...list.querySelectorAll(".citem")]); });
  });
  paintSel([...list.querySelectorAll(".citem")]);
}

/* ---------- accordion ---------- */
function toggleAcc(trig) {
  const item = trig.closest(".accitem");
  item.classList.toggle("open");
}

/* ---------- switch & checkbox ---------- */
function toggleSwitch(el) {
  const on = el.getAttribute("aria-checked") === "true";
  el.setAttribute("aria-checked", String(!on));
  return !on;
}

/* ---------- demo state & flows (persisted in localStorage) ---------- */
const _SAVED = JSON.parse(localStorage.getItem("c0.state") || "{}");
const STATE = {
  tasksDone: new Set(_SAVED.tasksDone || []),
  reviewTab: "queue", routePage: 1, sweeping: false,
  owners: _SAVED.owners || {},          // EX-id -> owner string
  surfaceOwners: _SAVED.surfaceOwners || {}, // owners table index -> owner
  armed: _SAVED.armed || {},            // trigger index -> bool
  drafts: _SAVED.drafts || {},          // review index -> draft text
  approved: _SAVED.approved || [],      // review indexes with approved reply
  dismissed: _SAVED.dismissed || [],    // intelligence card titles
  stages: _SAVED.stages || {},          // lead name -> stage key
  thresholds: _SAVED.thresholds || {},  // threshold index -> value
  leadNotes: _SAVED.leadNotes || {},    // lead name -> [{ts, txt}]
  leadCampaigns: _SAVED.leadCampaigns || {}, // lead name -> {campaignId: bool}
  aiRecs: _SAVED.aiRecs || {},          // rec title -> "accepted" | "dismissed"
};
function persist() {
  localStorage.setItem("c0.state", JSON.stringify({
    tasksDone: [...STATE.tasksDone], owners: STATE.owners, surfaceOwners: STATE.surfaceOwners,
    armed: STATE.armed, drafts: STATE.drafts, approved: STATE.approved,
    dismissed: STATE.dismissed, stages: STATE.stages, thresholds: STATE.thresholds,
    leadNotes: STATE.leadNotes, leadCampaigns: STATE.leadCampaigns, aiRecs: STATE.aiRecs,
  }));
}
/* apply persisted state onto DATA at boot */
(function bootState() {
  Object.entries(STATE.owners).forEach(([id, o]) => { const x = DATA.exceptions.find(e => e.id === id); if (x) x.owner = o; });
  Object.entries(STATE.surfaceOwners).forEach(([i, o]) => { if (DATA.owners[i]) DATA.owners[i].owner = o; });
  Object.entries(STATE.armed).forEach(([i, v]) => { if (DATA.triggers[i] && DATA.triggers[i].phase === 1) DATA.triggers[i].armed = v; });
  Object.entries(STATE.drafts).forEach(([i, d]) => { if (DATA.reviews[i]) DATA.reviews[i].draft = d; });
  STATE.approved.forEach(i => { if (DATA.reviews[i]) DATA.reviews[i].reply = DATA.reviews[i].draft; });
  Object.entries(STATE.stages).forEach(([name, st]) => { const c = DATA.pipeline.cards.find(k => k.name === name); if (c) c.stage = st; });
  Object.entries(STATE.thresholds).forEach(([i, v]) => { if (DATA.thresholds[i]) DATA.thresholds[i].value = v; });
})();

function runSweepDemo() {
  if (STATE.sweeping) return;
  STATE.sweeping = true;
  toast(tr("Sweep queued", "Barrido en cola"), tr(`Reading ${DATA.surfaces.length} public surfaces. Read-only, as always.`, `Leyendo ${DATA.surfaces.length} superficies públicas. Solo lectura, como siempre.`));
  const el = document.getElementById("sweep-skeleton");
  if (el) el.style.display = "grid";
  setTimeout(() => {
    STATE.sweeping = false;
    if (el) el.style.display = "none";
    toast(tr("Sweep finished", "Barrido terminado"), tr(`Nothing changed since 06:00. ${DATA.exceptions.filter(x => x.status === "OPEN").length} exceptions open, 1 route failing.`, `Nada cambió desde las 06:00. ${DATA.exceptions.filter(x => x.status === "OPEN").length} excepciones abiertas, 1 ruta fallando.`));
  }, 2600);
}

function assignOwnerDialog(exId) {
  const x = DATA.exceptions.find(e => e.id === exId);
  if (!x) return;
  openDialog(`
    <div><h3>Assign owner</h3>
      <p class="ddesc">${x.id} · ${x.title}. One owner per surface type, set once at kickoff.</p></div>
    <div>
      <div class="field"><label class="label" for="ao-role">Role</label>
        <select class="select" id="ao-role">
          <option>Site content owner</option><option>Site admin</option>
          <option>GBP owner</option><option>Events manager</option>
          <option>Ops manager</option><option>Front desk</option>
        </select></div>
      <div class="field"><label class="label" for="ao-name">Name</label>
        <input class="input" id="ao-name" placeholder="Who owns this surface today?">
        <p class="helper">Left blank in the demo on purpose: it is the kickoff question.</p></div>
    </div>
    <div class="dfoot">
      <button class="btn outline" onclick="closeLayers()">Cancel</button>
      <button class="btn" onclick="saveOwner('${x.id}')">Assign owner</button>
    </div>`);
}
function saveOwner(exId) {
  const x = DATA.exceptions.find(e => e.id === exId);
  const role = document.getElementById("ao-role").value;
  const name = document.getElementById("ao-name").value.trim();
  x.owner = name ? `${name} · ${role}` : role;
  STATE.owners[exId] = x.owner; persist();
  closeLayers();
  toast(tr("Owner assigned", "Dueño asignado"), tr(`${exId} now belongs to ${x.owner}. In production this notifies them.`, `${exId} ahora es de ${x.owner}. En producción esto le notifica.`));
  render();
}

function assignSurfaceOwnerDialog(i) {
  const o = DATA.owners[i];
  if (!o) return;
  openDialog(`
    <div><h3>${tr("Assign owner", "Asignar dueño")}</h3>
      <p class="ddesc">${esc(o.surface)} · ${tr("hint:", "pista:")} ${esc(o.hint)}</p></div>
    <div class="field"><label class="label" for="so-name">${tr("Name or role", "Nombre o rol")}</label>
      <input class="input" id="so-name" value="${o.owner ? esc(o.owner) : ""}" placeholder="${tr("Who owns this surface today?", "¿Quién es dueño de esta superficie hoy?")}"></div>
    <div class="dfoot">
      <button class="btn outline" onclick="closeLayers()">${tr("Cancel", "Cancelar")}</button>
      <button class="btn" onclick="saveSurfaceOwner(${i})">${tr("Assign", "Asignar")}</button>
    </div>`);
}
function saveSurfaceOwner(i) {
  const v = document.getElementById("so-name").value.trim();
  DATA.owners[i].owner = v || null;
  STATE.surfaceOwners[i] = DATA.owners[i].owner; persist();
  closeLayers();
  toast(tr("Owner saved", "Dueño guardado"), DATA.owners[i].surface);
  render();
}

function approveReply(i) {
  const r = DATA.reviews[i];
  if (!r || !r.draft) return;
  r.reply = r.draft;
  if (!STATE.approved.includes(i)) STATE.approved.push(i);
  persist();
  toast(tr("Reply approved", "Respuesta aprobada"), tr("Ready to publish from City Zero's own Google account.", "Lista para publicarse desde la cuenta de Google de City Zero."));
  render();
}

function dismissIntel(title) {
  if (!STATE.dismissed.includes(title)) STATE.dismissed.push(title);
  persist();
  render();
}

function advanceLead(name) {
  const order = DATA.pipeline.stages.map(st => st.key);
  const c = DATA.pipeline.cards.find(k => k.name === name);
  if (!c) return;
  const idx = order.indexOf(c.stage);
  if (idx < 0 || idx >= order.length - 1) return;
  c.stage = order[idx + 1];
  STATE.stages[name] = c.stage; persist();
  toast(tr("Lead advanced", "Lead avanzado"), `${name} → ${DATA.pipeline.stages[idx + 1].label}`);
  render();
}

function saveThreshold(i, v) {
  DATA.thresholds[i].value = v;
  STATE.thresholds[i] = v; persist();
  toast(tr("Threshold saved", "Umbral guardado"), `${DATA.thresholds[i].name}: ${v}`);
}

function exportReport() {
  const open = DATA.exceptions.filter(x => x.status === "OPEN");
  const today = fmtDate(DATA.meta.sweepDate);
  const rows = open.map(x => `<tr><td>${x.id}</td><td>${x.title}</td><td>${daysSince(x.firstEvidence)} days</td><td>${x.owner || "Unassigned"}</td></tr>`).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>CITY 0 OPS · Morning report · ${today}</title>
<style>body{font-family:system-ui;margin:40px;color:#111}h1{font-size:20px}table{border-collapse:collapse;width:100%;margin-top:16px}td,th{border:1px solid #ccc;padding:8px;font-size:13px;text-align:left}p{font-size:13px}</style></head>
<body><h1>CITY 0 OPS · Morning report · ${today} 06:30 ET</h1>
<p>${open.length} open exceptions · 1 route failing (GET /classes-schedule/ → 404) · ${DATA.surfaces.length} surfaces read.</p>
<table><tr><th>ID</th><th>Exception</th><th>Age</th><th>Owner</th></tr>${rows}</table>
<p>Read-only monitor · demo export · every value is captured public evidence.</p></body></html>`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  a.download = `city0-ops-morning-report-${DATA.meta.sweepDate}.html`;
  document.body.appendChild(a); a.click(); a.remove();
  toast(tr("Report exported", "Reporte exportado"), tr("Downloaded as HTML. Open or print it.", "Descargado como HTML. Ábrelo o imprímelo."));
}

function editDraftSheet(reviewIdx) {
  const r = DATA.reviews[reviewIdx];
  if (!r || !r.draft) return;
  openSheet(`
    <div class="shead"><h3>Edit draft reply</h3>
      <p>${r.stars}-star review by ${r.author} · ${r.date}. You edit, your team publishes from Google.</p></div>
    <div class="sbody">
      <div class="field"><label class="label">Review</label>
        <div class="draft" style="margin-top:0;max-width:none"><p>${r.text}</p></div></div>
      <div class="field"><label class="label" for="dr-text">Draft reply</label>
        <textarea class="textarea" id="dr-text" rows="7">${r.draft}</textarea>
        <p class="helper">The monitor drafted this. It never publishes anything itself.</p></div>
    </div>
    <div class="sfoot">
      <button class="btn outline" onclick="closeLayers()">Cancel</button>
      <button class="btn" onclick="saveDraft(${reviewIdx})">Save draft</button>
    </div>`);
}
function saveDraft(reviewIdx) {
  DATA.reviews[reviewIdx].draft = document.getElementById("dr-text").value;
  STATE.drafts[reviewIdx] = DATA.reviews[reviewIdx].draft; persist();
  closeLayers();
  toast(tr("Draft saved", "Borrador guardado"), tr("Ready for a person to copy into Google.", "Listo para que una persona lo copie a Google."));
  render();
}

function toggleTask(i, btn) {
  STATE.tasksDone.has(i) ? STATE.tasksDone.delete(i) : STATE.tasksDone.add(i);
  persist();
  render();
  if (STATE.tasksDone.has(i)) toast(tr("Task completed", "Tarea completada"), DATA.tasks[i].title);
}

function toggleTrigger(i, el) {
  const t = DATA.triggers[i];
  if (t.phase !== 1) return;
  t.armed = toggleSwitch(el);
  STATE.armed[i] = t.armed; persist();
  toast(t.armed ? tr("Trigger armed", "Trigger armado") : tr("Trigger paused", "Trigger pausado"),
    t.armed ? tr("Watching again from the next sweep.", "Vigilando de nuevo desde el próximo barrido.") : tr("It will not fire until re-armed.", "No disparará hasta re-armarse."));
  render();
}
