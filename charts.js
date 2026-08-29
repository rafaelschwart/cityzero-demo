/* CITY 0 OPS · hand-rolled interactive charts, no dependencies.
   Ported from the shadcn/Recharts reference: area+line with crosshair,
   tooltip, active ticks and timeframe dropdown; two-ring donut with
   hover-linked legend and center readout. Brand tokens only. */

const NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}

/* ---------------- area + line ----------------
   opts: { data: [{ label, tip, a, b }], aName, bName, height } */
function areaLineChart(mount, opts) {
  mount.innerHTML = "";
  mount.classList.add("chartbox");
  const W = Math.max(mount.clientWidth || 720, 320);
  const H = opts.height || 288;
  const PAD = { l: 6, r: 6, t: 14, b: 30 };
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  const data = opts.data;
  const n = data.length;
  const maxV = Math.max(1, ...data.map(d => Math.max(d.a, d.b)));
  const x = i => PAD.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = v => PAD.t + ih - (v / maxV) * ih;

  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, style: "display:block;overflow:visible" });
  const uid = "g" + Math.random().toString(36).slice(2, 8);
  const defs = svgEl("defs", {});
  const grad = svgEl("linearGradient", { id: uid, x1: 0, y1: 0, x2: 0, y2: 1 });
  grad.appendChild(svgEl("stop", { offset: "5%", "stop-color": "#FFFFFF", "stop-opacity": .16 }));
  grad.appendChild(svgEl("stop", { offset: "95%", "stop-color": "#FFFFFF", "stop-opacity": .02 }));
  defs.appendChild(grad);
  svg.appendChild(defs);

  // vertical grid at ticks, dashed midlines between them (reference pattern)
  for (let i = 0; i < n; i++) {
    svg.appendChild(svgEl("line", { x1: x(i), x2: x(i), y1: PAD.t, y2: PAD.t + ih, stroke: "var(--line)", "stroke-width": 1 }));
    if (i < n - 1) svg.appendChild(svgEl("line", { x1: (x(i) + x(i + 1)) / 2, x2: (x(i) + x(i + 1)) / 2, y1: PAD.t, y2: PAD.t + ih, stroke: "var(--line)", "stroke-dasharray": "6 6", "stroke-width": 1 }));
  }

  const pts = k => data.map((d, i) => `${x(i)},${y(d[k])}`).join(" ");
  const area = svgEl("polygon", { points: `${PAD.l},${PAD.t + ih} ${pts("a")} ${x(n - 1)},${PAD.t + ih}`, fill: `url(#${uid})` });
  svg.appendChild(area);
  svg.appendChild(svgEl("polyline", { points: pts("a"), fill: "none", stroke: "#FFFFFF", "stroke-width": 1.75 }));
  svg.appendChild(svgEl("polyline", { points: pts("b"), fill: "none", stroke: "var(--meta)", "stroke-width": 1.5 }));

  // crosshair + active dots
  const cross = svgEl("line", { y1: PAD.t, y2: PAD.t + ih, stroke: "#FFFFFF", "stroke-width": 1.25, visibility: "hidden" });
  svg.appendChild(cross);
  const dotA = svgEl("circle", { r: 4, fill: "var(--canvas)", stroke: "#FFFFFF", "stroke-width": 2, visibility: "hidden" });
  const dotB = svgEl("circle", { r: 4, fill: "var(--canvas)", stroke: "var(--meta)", "stroke-width": 2, visibility: "hidden" });
  svg.appendChild(dotA); svg.appendChild(dotB);

  // x tick labels
  const ticks = [];
  data.forEach((d, i) => {
    const t = svgEl("text", { x: x(i), y: H - 8, "text-anchor": "middle", "font-size": 12, fill: "var(--meta)", "font-family": "Roboto Mono, monospace" });
    t.textContent = d.label;
    svg.appendChild(t); ticks.push(t);
  });

  const tip = document.createElement("div");
  tip.className = "ctip";
  tip.style.display = "none";
  mount.appendChild(svg);
  mount.appendChild(tip);

  function setActive(i, clientX) {
    if (i == null) {
      cross.setAttribute("visibility", "hidden");
      dotA.setAttribute("visibility", "hidden");
      dotB.setAttribute("visibility", "hidden");
      tip.style.display = "none";
      ticks.forEach(t => t.setAttribute("fill", "var(--meta)"));
      return;
    }
    const d = data[i];
    cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i));
    cross.setAttribute("visibility", "visible");
    dotA.setAttribute("cx", x(i)); dotA.setAttribute("cy", y(d.a)); dotA.setAttribute("visibility", "visible");
    dotB.setAttribute("cx", x(i)); dotB.setAttribute("cy", y(d.b)); dotB.setAttribute("visibility", "visible");
    ticks.forEach((t, j) => t.setAttribute("fill", j === i ? "#FFFFFF" : "var(--meta)"));
    tip.innerHTML = `
      <div class="ctip-date">${d.tip}</div>
      ${d.empty
        ? `<div class="ctip-row ctip-empty">No reviews captured in this period</div>`
        : `<div class="ctip-row"><span><i class="sw" style="background:#FFFFFF"></i>${opts.aName}</span><b>${d.a.toLocaleString("en-US")}</b></div>
           <div class="ctip-row"><span><i class="sw" style="background:var(--meta)"></i>${opts.bName}</span><b>${d.b.toLocaleString("en-US")}</b></div>`}`;
    tip.style.display = "block";
    const r = mount.getBoundingClientRect();
    const px = (x(i) / W) * r.width;
    const left = Math.min(Math.max(px - tip.offsetWidth / 2, 4), r.width - tip.offsetWidth - 4);
    tip.style.left = left + "px";
    tip.style.top = Math.max((y(Math.max(d.a, d.b)) / H) * r.height - tip.offsetHeight - 12, 2) + "px";
  }

  svg.addEventListener("mousemove", e => {
    const r = svg.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * W;
    let best = 0, bd = Infinity;
    for (let i = 0; i < n; i++) { const d2 = Math.abs(x(i) - mx); if (d2 < bd) { bd = d2; best = i; } }
    setActive(best, e.clientX);
  });
  svg.addEventListener("mouseleave", () => setActive(null));
}

/* ---------------- two-ring donut ----------------
   opts: { data: [{ name, value, fill }], total, label, size }
   returns { setActive } so the caller can wire a legend. */
function donutChart(mount, opts) {
  mount.innerHTML = "";
  const size = opts.size || 180;
  const c = size / 2;
  const deepOuter = c - 1, deepInner = deepOuter - 8;
  const lightOuter = deepInner, lightInner = deepOuter - 31;
  const padDeg = 2.5;
  const total = opts.total || opts.data.reduce((s, d) => s + d.value, 0);

  mount.classList.add("donutbox");
  mount.style.width = size + "px"; mount.style.height = size + "px";
  const svg = svgEl("svg", { viewBox: `0 0 ${size} ${size}`, width: size, height: size, style: "display:block" });

  function arcPath(r0, r1, t0, t1) {
    const rad = t => ((t - 90) * Math.PI) / 180;
    const px = (r, t) => c + r * Math.cos(rad(t));
    const py = (r, t) => c + r * Math.sin(rad(t));
    const big = t1 - t0 > 180 ? 1 : 0;
    return `M ${px(r1, t0)} ${py(r1, t0)} A ${r1} ${r1} 0 ${big} 1 ${px(r1, t1)} ${py(r1, t1)}
            L ${px(r0, t1)} ${py(r0, t1)} A ${r0} ${r0} 0 ${big} 0 ${px(r0, t0)} ${py(r0, t0)} Z`;
  }

  const cellsLight = [], cellsDeep = [];
  let acc = 0;
  opts.data.forEach((d, i) => {
    const t0 = (acc / total) * 360 + padDeg / 2;
    const t1 = ((acc + d.value) / total) * 360 - padDeg / 2;
    acc += d.value;
    if (t1 <= t0) return;
    const light = svgEl("path", { d: arcPath(lightInner, lightOuter, t0, t1), fill: d.fill, "fill-opacity": .45, style: "transition:opacity .2s ease-in-out;cursor:pointer" });
    const deep = svgEl("path", { d: arcPath(deepInner, deepOuter, t0, t1), fill: d.fill, style: "transition:opacity .2s ease-in-out;pointer-events:none" });
    light.addEventListener("mouseenter", () => api.setActive(i, true));
    light.addEventListener("mouseleave", () => api.setActive(null, true));
    svg.appendChild(light); svg.appendChild(deep);
    cellsLight[i] = light; cellsDeep[i] = deep;
  });
  mount.appendChild(svg);

  const center = document.createElement("div");
  center.className = "donut-center";
  const inset = c - lightInner;
  center.style.inset = `${inset}px`;
  mount.appendChild(center);

  const api = {
    onActive: null,
    setActive(i, fromChart) {
      opts.data.forEach((_, j) => {
        const op = i == null || i === j ? 1 : .4;
        if (cellsLight[j]) cellsLight[j].style.opacity = op;
        if (cellsDeep[j]) cellsDeep[j].style.opacity = op;
      });
      const d = i != null ? opts.data[i] : null;
      center.innerHTML = `<span class="dv">${(d ? d.value : total).toLocaleString("en-US")}</span><span class="dl">${d ? d.name : opts.label}</span>`;
      if (fromChart && api.onActive) api.onActive(i);
    },
  };
  api.setActive(null);
  return api;
}
