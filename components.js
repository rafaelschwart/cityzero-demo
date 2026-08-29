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
};
function persist() {
  localStorage.setItem("c0.state", JSON.stringify({
    tasksDone: [...STATE.tasksDone], owners: STATE.owners, surfaceOwners: STATE.surfaceOwners,
    armed: STATE.armed, drafts: STATE.drafts, approved: STATE.approved,
    dismissed: STATE.dismissed, stages: STATE.stages, thresholds: STATE.thresholds,
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
