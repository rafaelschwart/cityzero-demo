/* CITY 0 OPS · Daily Sheet. The paper/Excel daily sheet the front desk fills
   twice a day (Operations Management/DAILY SHEET), digitized from the real
   workbook (242 days, Jan 2 to Sep 1 2026) and shown as it would look when
   Glofox, BioStar and Stripe fill it automatically. Read-only. */

let DS_DAY = null;
const DS_SRC = {
  glofox: ["Glofox", "green"], biostar: ["BioStar", "green"], stripe: ["Stripe", "green"],
  schedule: ["Staff schedule", "green"], sensor: ["Sensor · optional", "amber"], manual: ["Manual · 1 tap", "gray"],
};
function dsSrc(k) { const s = DS_SRC[k]; return `<span class="chip ${s[1]} dssrc">${s[0]}</span>`; }
function dsPick(v) { DS_DAY = v; render(); }
function dsFmt(d, opt) {
  return new Date(d + "T12:00:00").toLocaleDateString(LANG === "es" ? "es" : "en-US", opt || { weekday: "short", month: "short", day: "numeric" });
}
function dsSum(a, f) { return a.reduce((x, y) => x + (f ? f(y) : y), 0); }
function dsMoney(n) { return "$" + Math.round(n).toLocaleString("en-US"); }

function vDailySheet() {
  const DS = window.DAILYSHEET || { days: [] };
  const days = DS.days;
  if (!days.length) return topbar("Daily Sheet", "") + `<div class="crmcard">${tr("No daily sheet data loaded.", "No hay datos de la hoja diaria.")}</div>`;
  const last = days[days.length - 1];
  if (!DS_DAY || !days.some(d => d.d === DS_DAY)) DS_DAY = last.d;
  const day = days.find(d => d.d === DS_DAY);
  const idx = days.indexOf(day);
  const V = d => d.visits || {};
  const withTotal = days.filter(d => V(d).total);
  const last30 = days.slice(-30), last90 = days.slice(-90);
  const avg = (arr, f) => arr.length ? dsSum(arr, f) / arr.length : 0;

  /* ---- KPIs from the real sheet (last 30 days) ---- */
  const v30 = last30.filter(d => V(d).total);
  const visitsAvg = Math.round(avg(v30, d => V(d).total));
  const classesAvg = avg(last30, d => (d.classes || []).length);
  const attAll = last30.flatMap(d => d.classes || []).filter(c => c.n);
  const attAvg = attAll.length ? dsSum(attAll, c => c.n) / attAll.length : 0;
  const salesRow = r => (r.annual || 0) + (r.classpack || 0) + (r.daypass || 0) + (r.mtm || 0) + (r.weekpass || 0) + (r.pack3 || 0) + (r.influ || 0);
  const sales30 = dsSum(last30, d => dsSum(d.sales || [], salesRow));
  const salesBy = { annual: 0, mtm: 0, classpack: 0, daypass: 0, weekpass: 0, pack3: 0, influ: 0 };
  last30.forEach(d => (d.sales || []).forEach(r => Object.keys(salesBy).forEach(k => salesBy[k] += r[k] || 0)));
  const shop30 = dsSum(last30, d => dsSum(d.shop || [], s => s.total || 0));
  const tours30 = dsSum(last30, d => (d.tours || []).length);
  const staffHrs = avg(last30, d => dsSum(d.staff || [], s => s.h || 0) + dsSum(d.hk || [], s => s.h || 0));

  /* ---- data quality: the sales argument, in the client's own numbers ---- */
  const noTotal = days.length - withTotal.length;
  const noCount = days.flatMap(d => d.classes || []).filter(c => !c.n).length;
  const classesAll = days.flatMap(d => d.classes || []).length;
  const oddTabs = days.filter(d => d.tab.length !== 8).length;
  const noTemp = days.filter(d => !d.temp || !Object.keys(d.temp).length).length;

  const infoIco = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;color:var(--muted-foreground)"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
  const kpi = (t, big, ctx, src) => `
    <div class="kpicard ackpi">
      <div class="ach"><span>${t}</span>${infoIco}</div>
      <div class="kpirow"><span class="kpiv">${big}</span>${src ? dsSrc(src) : ""}</div>
      <div class="acctx">${ctx}</div>
    </div>`;

  /* ---- visits trend (last 90 days with a total) ---- */
  const trend = last90.filter(d => V(d).total);
  const tmax = Math.max.apply(null, trend.map(d => V(d).total).concat([1]));
  const W = 900, H = 150, P = 6;
  const pts = trend.map((d, i) => [P + i * (W - 2 * P) / Math.max(1, trend.length - 1), H - P - (V(d).total / tmax) * (H - 2 * P)]);
  const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = path + ` L${pts[pts.length - 1][0].toFixed(1)} ${H - P} L${pts[0][0].toFixed(1)} ${H - P} Z`;
  const peak = trend.reduce((a, d) => V(d).total > V(a).total ? d : a, trend[0]);
  const trendSvg = pts.length > 1 ? `
    <svg class="dstrend" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <defs><linearGradient id="dsg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--green)" stop-opacity=".32"/><stop offset="1" stop-color="var(--green)" stop-opacity=".03"/></linearGradient></defs>
      <path d="${area}" fill="url(#dsg)"/>
      <path d="${path}" fill="none" stroke="var(--green)" stroke-width="2" vector-effect="non-scaling-stroke"/>
    </svg>` : "";

  /* ---- weekday pattern (all days with total) ---- */
  const dowN = [0, 0, 0, 0, 0, 0, 0], dowC = [0, 0, 0, 0, 0, 0, 0];
  withTotal.forEach(d => { const w = new Date(d.d + "T12:00:00").getDay(); dowN[w] += V(d).total; dowC[w]++; });
  const dowAvg = dowN.map((n, i) => dowC[i] ? n / dowC[i] : 0);
  const dowMax = Math.max.apply(null, dowAvg.concat([1]));
  const dowLbl = LANG === "es" ? ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dowBars = [1, 2, 3, 4, 5, 6, 0].map(i => `
    <div class="dsdow"><b style="height:${Math.max(4, Math.round(dowAvg[i] / dowMax * 100))}%"><span>${Math.round(dowAvg[i])}</span></b><i>${dowLbl[i]}</i></div>`).join("");

  /* ---- leaderboards (whole workbook) ---- */
  const inst = {};
  days.forEach(d => (d.classes || []).forEach(c => { if (!c.i) return; const k = inst[c.i] = inst[c.i] || { n: 0, att: 0, cnt: 0 }; k.n++; if (c.n) { k.att += c.n; k.cnt++; } }));
  const topInst = Object.entries(inst).map(([n, k]) => ({ n, classes: k.n, avg: k.cnt ? k.att / k.cnt : 0 })).sort((a, b) => b.classes - a.classes).slice(0, 6);
  const fmt = {};
  days.forEach(d => (d.classes || []).forEach(c => { const k = fmt[c.c] = fmt[c.c] || { att: 0, cnt: 0 }; if (c.n) { k.att += c.n; k.cnt++; } }));
  const topFmt = Object.entries(fmt).map(([n, k]) => ({ n, att: k.att, avg: k.cnt ? k.att / k.cnt : 0, cnt: k.cnt })).sort((a, b) => b.att - a.att).slice(0, 6);
  const fmax = topFmt[0] ? topFmt[0].att : 1;
  const reps = {};
  days.forEach(d => (d.sales || []).forEach(r => { if (!r.rep) return; reps[r.rep] = (reps[r.rep] || 0) + salesRow(r); }));
  const topReps = Object.entries(reps).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const rmax = topReps[0] ? topReps[0][1] : 1;
  const bar = (label, val, txt, max, cls) => `
    <div class="dsrow"><span class="dsl">${esc(label)}</span><div class="dsbar"><i class="${cls || ""}" style="width:${Math.max(2, Math.round(val / max * 100))}%"></i></div><b class="mono">${txt}</b></div>`;

  /* ---- the sheet for one day ---- */
  const opts = days.slice().reverse().map(d => `<option value="${d.d}" ${d.d === DS_DAY ? "selected" : ""}>${dsFmt(d.d, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</option>`).join("");
  const vd = V(day);
  const visitRows = [
    [tr("Members", "Miembros"), vd.members], [tr("Free day pass", "Pase gratis"), vd.freepass], [tr("Drop in (1 class)", "Drop in (1 clase)"), vd.dropin],
    [tr("Day pass", "Pase de día"), vd.daypass], ["Wellhub", vd.wellhub],
  ];
  const vmax = Math.max.apply(null, visitRows.map(r => r[1] || 0).concat([1]));
  const table = (heads, rows, empty) => rows.length ? `
    <div class="tablewrap"><table class="crmtable dstbl"><thead><tr>${heads.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
    : `<p class="ccdesc dsempty">${empty || tr("Nothing logged that day.", "Nada registrado ese día.")}</p>`;
  const block = (title, src, body, note) => `
    <div class="crmcard dsblock">
      <div class="cchead"><div><div class="cctitle" style="font-size:14px">${title}</div>${note ? `<div class="ccdesc">${note}</div>` : ""}</div>${dsSrc(src)}</div>
      ${body}
    </div>`;
  const tempFloors = Object.entries(day.temp || {});
  const tempRows = tempFloors.map(([f, v]) => [esc(f), v[0] ? v[0] + "°" : "·", v[1] ? v[1] + "°" : "·", v[2] ? v[2] + "°" : "·"]);
  const salesRows = (day.sales || []).map(r => [esc(r.rep || "·"), r.annual || "·", r.mtm || "·", r.classpack || "·", r.daypass || "·", r.weekpass || "·", r.pack3 || "·", esc(r.note || "")]);
  const dayShop = dsSum(day.shop || [], s => s.total || 0);
  const dayStaffH = dsSum(day.staff || [], s => s.h || 0);

  const sheet = `
  <div class="dsgrid">
    ${block(tr("Gym visits", "Visitas al gym"), "biostar", `
      ${visitRows.map(r => bar(r[0], r[1] || 0, r[1] || 0, vmax)).join("")}
      <div class="dstot"><span>${tr("Total", "Total")}</span><b class="mono">${vd.total || (LANG === "es" ? "sin total" : "no total")}</b>
        <span class="ccdesc">AM ${vd.am || 0} · PM ${vd.pm || 0} · ClassPass ${(vd.cpam || 0) + (vd.cppm || 0)}</span></div>`,
      tr("Door events by membership type, split at 1:30 PM like the sheet.", "Eventos de puerta por tipo de membresía, partidos a la 1:30 PM como la hoja."))}
    ${block(tr("Classes", "Clases"), "glofox", table(
      [tr("Instructor", "Instructor"), tr("Class", "Clase"), tr("Time", "Hora"), tr("Count", "Asist."), "ClassPass", tr("Notes", "Notas")],
      (day.classes || []).map(c => [esc(c.i || "·"), `<b>${esc(c.c)}</b>`, `<span class="mono">${esc(c.s || "")}${c.e ? "–" + esc(c.e) : ""}</span>`, `<b class="mono">${c.n || "·"}</b>`, c.cp || "·", esc(c.note || "")])),
      tr("Booked and checked-in from Glofox; instructor from the schedule.", "Reservas y check-ins desde Glofox; instructor desde el horario."))}
    ${block(tr("Staff shift", "Turnos del staff"), "schedule", table(
      [tr("Agent", "Agente"), tr("Start", "Inicio"), tr("End", "Fin"), tr("Hours", "Horas"), tr("Note", "Nota")],
      (day.staff || []).map(s => [esc(s.n), `<span class="mono">${esc(s.s || "")}</span>`, `<span class="mono">${esc(s.e || "")}</span>`, `<b class="mono">${s.h || "·"}</b>`, esc(s.note || "")])
        .concat((day.hk || []).map(s => [esc(s.n) + ` <span class="chip gray" style="font-size:10px">${tr("housekeeping", "limpieza")}</span>`, `<span class="mono">${esc(s.s || "")}</span>`, `<span class="mono">${esc(s.e || "")}</span>`, `<b class="mono">${s.h || "·"}</b>`, ""]))),
      `${dayStaffH ? dayStaffH + " " + tr("staff hours that day", "horas de staff ese día") : ""}`)}
    ${block(tr("Membership sales", "Ventas de membresías"), "glofox", table(
      [tr("Sales rep", "Vendedor"), "Annual", "MTM", tr("Class pack", "Pack"), tr("Day pass", "Pase día"), tr("Week", "Semana"), "3 pack", tr("Notes", "Notas")], salesRows),
      tr("Each sale as it lands in Glofox and Stripe, credited to the rep who closed it.", "Cada venta al caer en Glofox y Stripe, acreditada al vendedor que cerró."))}
    ${block(tr("Temperature by floor", "Temperatura por piso"), "sensor", table([tr("Floor", "Piso"), tr("Opening", "Apertura"), tr("Transfer", "Cambio"), tr("Closing", "Cierre")], tempRows),
      tr("Today typed by hand three times a day. A $30 sensor per floor makes it automatic.", "Hoy se escribe a mano tres veces al día. Un sensor de $30 por piso lo vuelve automático."))}
    ${block(tr("Tours", "Tours"), "glofox", table([tr("Agent", "Agente"), tr("Prospect", "Prospecto"), tr("Hour", "Hora"), tr("Notes", "Notas")],
      (day.tours || []).map(t => [esc(t.agent || "·"), `<b>${esc(t.cust || "·")}</b>`, `<span class="mono">${esc(t.hour || "")}</span>`, esc(t.note || "")])),
      tr("From the Pipeline: every tour booked, shown or missed.", "Desde el Pipeline: cada tour agendado, asistido o perdido."))}
    ${block(tr("Shop sales", "Ventas de tienda"), "stripe", table([tr("Agent", "Agente"), "Total", tr("Note", "Nota")],
      (day.shop || []).map(s => [esc(s.agent || "·"), `<b class="mono">${dsMoney(s.total || 0)}</b>`, esc(s.note || "")])),
      dayShop ? dsMoney(dayShop) + " " + tr("that day", "ese día") : "")}
    ${block(tr("InBody, vendors, lost & found, extra tasks", "InBody, proveedores, objetos perdidos, tareas extra"), "manual", `
      ${table([tr("Type", "Tipo"), tr("Who", "Quién"), tr("Detail", "Detalle")],
        (day.inbody || []).map(x => ["InBody", esc(x.agent || x.ins || "·"), esc([x.client, x.in, x.out, x.pay].filter(Boolean).join(" · "))])
          .concat((day.vendors || []).map(x => [tr("Vendor", "Proveedor"), esc(x.co), esc([x.n, x.s, x.e, x.note].filter(Boolean).join(" · "))]))
          .concat((day.lost || []).map(x => [tr("Lost & found", "Perdido"), esc(x.agent || "·"), esc([x.item, x.place, x.follow].filter(Boolean).join(" · "))]))
          .concat((day.extra || []).map(x => [tr("Extra task", "Tarea extra"), esc(x.agent || "·"), esc(x.note || "")])))}`,
      tr("The human part stays human: one tap on the phone, no spreadsheet.", "La parte humana sigue humana: un toque en el teléfono, sin hoja de cálculo."))}
  </div>`;

  /* ---- automation map ---- */
  const autoRows = [
    [tr("Gym visits by type, AM/PM, ClassPass", "Visitas por tipo, AM/PM, ClassPass"), "biostar", tr("Door events crossed with the Glofox membership type", "Eventos de puerta cruzados con el tipo de membresía en Glofox"), tr("Automatic", "Automático")],
    [tr("Classes: instructor, time, count, ClassPass", "Clases: instructor, hora, asistencia, ClassPass"), "glofox", tr("Bookings and check-ins per class, ClassPass flagged by origin", "Reservas y check-ins por clase, ClassPass marcado por origen"), tr("Automatic", "Automático")],
    [tr("Membership sales by rep and type", "Ventas por vendedor y tipo"), "glofox", tr("Every membership created, with the seller and the plan", "Cada membresía creada, con vendedor y plan"), tr("Automatic", "Automático")],
    [tr("Shop sales", "Ventas de tienda"), "stripe", tr("POS charges of the day, by cashier", "Cobros del POS del día, por cajero"), tr("Automatic", "Automático")],
    [tr("Tours", "Tours"), "glofox", tr("Trial leads with a tour time, marked shown or no-show", "Leads en trial con hora de tour, marcados asistió o no"), tr("Automatic", "Automático")],
    [tr("Staff and housekeeping shifts", "Turnos de staff y limpieza"), "schedule", tr("From the roster; hours computed, no formulas to break", "Desde el roster; horas calculadas, sin fórmulas que se rompan"), tr("Automatic", "Automático")],
    [tr("Temperature by floor", "Temperatura por piso"), "sensor", tr("Optional Wi-Fi sensors, read at opening, transfer and closing", "Sensores Wi-Fi opcionales, leídos en apertura, cambio y cierre"), tr("Optional", "Opcional")],
    [tr("InBody, vendors, lost & found, extra tasks", "InBody, proveedores, perdidos, tareas extra"), "manual", tr("A phone form with three fields, saved to the same sheet", "Un formulario en el teléfono con tres campos, guardado en la misma hoja"), tr("1 tap", "1 toque")],
  ];
  const autoTbl = `
    <div class="tablewrap"><table class="crmtable dstbl"><thead><tr><th>${tr("Block of the sheet", "Bloque de la hoja")}</th><th>${tr("Source", "Fuente")}</th><th>${tr("How", "Cómo")}</th><th>${tr("Status", "Estado")}</th></tr></thead>
    <tbody>${autoRows.map(r => `<tr><td><b>${r[0]}</b></td><td>${dsSrc(r[1])}</td><td class="ccdesc" style="margin:0">${r[2]}</td><td><b>${r[3]}</b></td></tr>`).join("")}</tbody></table></div>`;

  const nav = `
    <div class="dsnav">
      <button class="btn outline sm" ${idx <= 0 ? "disabled" : ""} onclick="dsPick('${idx > 0 ? days[idx - 1].d : DS_DAY}')">‹</button>
      <select class="select" style="height:32px;width:auto;font-size:12.5px" onchange="dsPick(this.value)">${opts}</select>
      <button class="btn outline sm" ${idx >= days.length - 1 ? "disabled" : ""} onclick="dsPick('${idx < days.length - 1 ? days[idx + 1].d : DS_DAY}')">›</button>
      <button class="btn outline sm" onclick="dsPick('${last.d}')">${tr("Latest", "Último")}</button>
      <span class="chip green">${tr("REAL · from the workbook", "REAL · del Excel")}</span>
    </div>`;

  return `
  ${topbar("Daily Sheet", tr("THE FRONT DESK SHEET, FILLED BY THE SYSTEMS", "LA HOJA DEL FRONT DESK, LLENADA POR LOS SISTEMAS"), modeChip())}
  <div class="dsintro crmcard">
    <div>
      <div class="cctitle">${tr("Your daily sheet, filled before the shift ends.", "Tu hoja diaria, llena antes de que termine el turno.")}</div>
      <p class="ccdesc" style="max-width:760px">${tr(
        `The front desk fills the DAILY SHEET tab twice a day: visits, classes, sales, tours, shop, temperature. We read the real workbook: ${days.length} days, ${dsFmt(days[0].d, { month: "short", day: "numeric" })} to ${dsFmt(last.d, { month: "short", day: "numeric" })}. Below, the same sheet as the systems would fill it, and what it already shows.`,
        `El front desk llena la pestaña DAILY SHEET dos veces al día: visitas, clases, ventas, tours, tienda, temperatura. Leímos el Excel real: ${days.length} días, del ${dsFmt(days[0].d, { day: "numeric", month: "short" })} al ${dsFmt(last.d, { day: "numeric", month: "short" })}. Abajo, la misma hoja como la llenarían los sistemas, y lo que ya muestra.`)}</p>
    </div>
    <div class="dsfacts">
      <div><b class="mono">${noTotal}</b><span>${tr("of " + days.length + " days have no visit total", "de " + days.length + " días sin total de visitas")}</span></div>
      <div><b class="mono">${noCount}</b><span>${tr("of " + classesAll + " classes logged without a count", "de " + classesAll + " clases sin asistencia anotada")}</span></div>
      <div><b class="mono">${noTemp}</b><span>${tr("days with no temperature log", "días sin registro de temperatura")}</span></div>
      <div><b class="mono">${oddTabs}</b><span>${tr("tabs named off-pattern (hard to find, hard to sum)", "pestañas fuera del patrón (difíciles de hallar y sumar)")}</span></div>
    </div>
  </div>
  <div class="kpigrid">
    ${kpi(tr("Visits per day", "Visitas por día"), visitsAvg, tr("last 30 days · peak " + (peak ? V(peak).total + " on " + dsFmt(peak.d) : ""), "últimos 30 días · pico " + (peak ? V(peak).total + " el " + dsFmt(peak.d) : "")), "biostar")}
    ${kpi(tr("Classes per day", "Clases por día"), classesAvg.toFixed(1), tr("avg " + attAvg.toFixed(1) + " people per class", "prom. " + attAvg.toFixed(1) + " personas por clase"), "glofox")}
    ${kpi(tr("Memberships sold", "Membresías vendidas"), sales30, `${salesBy.annual} annual · ${salesBy.mtm} MTM · ${salesBy.classpack} packs · ${salesBy.daypass} ${tr("day passes", "pases")}`, "glofox")}
    ${kpi(tr("Shop + tours", "Tienda + tours"), dsMoney(shop30), tr(tours30 + " tours logged · " + staffHrs.toFixed(0) + " staff hours/day", tours30 + " tours anotados · " + staffHrs.toFixed(0) + " horas de staff/día"), "stripe")}
  </div>
  <div class="acgrid">
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div><div class="cctitle" style="font-size:14px">${tr("Visits, last 90 days", "Visitas, últimos 90 días")}</div><div class="ccdesc">${tr("Every day with a total in the sheet. Gaps are the blank days.", "Cada día con total en la hoja. Los huecos son los días en blanco.")}</div></div><span class="chip gray">${trend.length} ${tr("days", "días")}</span></div>
      ${trendSvg}
    </div>
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div><div class="cctitle" style="font-size:14px">${tr("Average visits by weekday", "Visitas promedio por día")}</div><div class="ccdesc">${tr("All " + withTotal.length + " days with a total", "Los " + withTotal.length + " días con total")}</div></div></div>
      <div class="dsdows">${dowBars}</div>
    </div>
  </div>
  <div class="acgrid2" style="margin-top:14px">
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div class="cctitle" style="font-size:14px">${tr("Formats by total attendance", "Formatos por asistencia total")}</div><span class="chip gray">${tr("whole workbook", "todo el Excel")}</span></div>
      ${topFmt.map(f => bar(f.n, f.att, `${f.att} · ${f.avg.toFixed(1)}/${tr("class", "clase")}`, fmax)).join("")}
    </div>
    <div class="crmcard" style="margin-bottom:0">
      <div class="cchead"><div class="cctitle" style="font-size:14px">${tr("Instructors", "Instructores")}</div></div>
      ${topInst.map(i => bar(i.n, i.classes, `${i.classes} ${tr("classes", "clases")} · ${i.avg.toFixed(1)}`, topInst[0].classes)).join("")}
      ${topReps.length ? `<div class="cctitle" style="font-size:13px;margin-top:14px">${tr("Sales reps, memberships closed", "Vendedores, membresías cerradas")}</div>${topReps.map(r => bar(r[0], r[1], r[1], rmax, "b2")).join("")}` : ""}
    </div>
  </div>
  <div class="crmcard" style="margin-top:14px">
    <div class="cchead"><div><div class="cctitle">${tr("The sheet, one day at a time", "La hoja, un día a la vez")}</div><div class="ccdesc">${tr("Exactly what the front desk typed that day, block by block, with the system that would fill each block.", "Exactamente lo que el front desk escribió ese día, bloque por bloque, con el sistema que llenaría cada bloque.")}</div></div>${nav}</div>
    <div class="dsday"><b>${dsFmt(day.d, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</b><span class="ccdesc">${tr("tab", "pestaña")} <span class="mono">${esc(day.tab)}</span></span></div>
    ${sheet}
  </div>
  <div class="crmcard" style="margin-top:14px">
    <div class="cchead"><div><div class="cctitle">${tr("What fills itself", "Qué se llena solo")}</div><div class="ccdesc">${tr("Block by block. The team stops typing, the sheet stops having blanks, and every day adds up the same way.", "Bloque por bloque. El equipo deja de tipear, la hoja deja de tener huecos y cada día suma igual.")}</div></div><span class="chip amber">${tr("PHASE 1 · AFTER DISCOVERY", "FASE 1 · TRAS DISCOVERY")}</span></div>
    ${autoTbl}
    <p class="ccdesc" style="margin-top:12px">${tr("Read-only: nothing is written into Glofox, BioStar or Stripe. The sheet lives here and exports to Excel with the same tab names, so the template does not change.", "Solo lectura: no se escribe nada en Glofox, BioStar ni Stripe. La hoja vive aquí y exporta a Excel con los mismos nombres de pestaña, así la plantilla no cambia.")}</p>
    <div class="acthdr" style="margin-top:10px">
      <button class="btn solid sm" onclick="dsExport()">${tr("Export this day (CSV)", "Exportar este día (CSV)")}</button>
      <button class="btn outline sm" onclick="location.hash='#hours'">${tr("See the hour map", "Ver el mapa de horas")}</button>
      <button class="btn outline sm" onclick="location.hash='#classes'">${tr("Classes", "Clases")}</button>
    </div>
  </div>
  ${typeof demoNote === "function" ? demoNote() : ""}`;
}

function dsExport() {
  const DS = window.DAILYSHEET; if (!DS) return;
  const day = DS.days.find(d => d.d === DS_DAY) || DS.days[DS.days.length - 1];
  const rows = [["block", "a", "b", "c", "d", "e", "f"]];
  (day.staff || []).forEach(s => rows.push(["staff", s.n, s.s, s.e, s.h, s.note || ""]));
  (day.hk || []).forEach(s => rows.push(["housekeeping", s.n, s.s, s.e, s.h]));
  (day.classes || []).forEach(c => rows.push(["class", c.i, c.c, c.s, c.e, c.n || 0, c.cp || 0]));
  const v = day.visits || {};
  rows.push(["visits", "members", v.members || 0, "freepass", v.freepass || 0, "dropin", v.dropin || 0]);
  rows.push(["visits", "daypass", v.daypass || 0, "wellhub", v.wellhub || 0, "total", v.total || 0]);
  Object.entries(day.temp || {}).forEach(([f, t]) => rows.push(["temperature", f, t[0], t[1], t[2]]));
  (day.sales || []).forEach(r => rows.push(["sales", r.rep, r.annual || 0, r.mtm || 0, r.classpack || 0, r.daypass || 0, r.note || ""]));
  (day.tours || []).forEach(t => rows.push(["tour", t.agent, t.cust, t.hour, t.note || ""]));
  (day.shop || []).forEach(s => rows.push(["shop", s.agent, s.total, s.note || ""]));
  const csv = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `cityzero-daily-sheet-${day.d}.csv`; a.click();
  if (typeof toast === "function") toast(tr("Exported", "Exportado"), `cityzero-daily-sheet-${day.d}.csv`);
}
