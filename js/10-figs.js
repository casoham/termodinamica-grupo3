/* ============ FIGURAS COMPARTIDAS: ciclo de Carnot en P–V y T–S ============ */
(() => {
  const G = 1.4, TR = 1.6;                       // γ y T_c/T_f
  const r = Math.pow(TR, 1 / (G - 1));            // V3/V2 = V4/V1
  const V = [1, 2, 2 * r, r];                     // V1..V4
  const P = [TR / 1, TR / 2, 1 / (2 * r), 1 / r]; // P1..P4 (nR = 1, T_f = 1)
  Q.carnot = { G, TR, r, V, P };
  // Punto del ciclo en el parámetro u ∈ [0,4): etapa = floor(u), s = fracción de etapa
  Q.carnotPunto = (u) => {
    u = ((u % 4) + 4) % 4; const e = Math.floor(u), s = u - e;
    let v, p, t;
    if (e === 0) { v = V[0] + (V[1] - V[0]) * s; p = TR / v; t = TR; }
    else if (e === 1) { v = V[1] + (V[2] - V[1]) * s; p = P[1] * Math.pow(V[1] / v, G); t = p * v; }
    else if (e === 2) { v = V[2] + (V[3] - V[2]) * s; p = 1 / v; t = 1; }
    else { v = V[3] + (V[0] - V[3]) * s; p = P[3] * Math.pow(V[3] / v, G); t = p * v; }
    return { e, s, v, p, t };
  };
  const f = (n) => n.toFixed(1);

  function pv(w, h, o = {}) {
    const x0 = 80, x1 = w - 30, y0 = h - 70, y1 = 36;
    const X = (v) => x0 + (v - 0.5) / (7 - 0.5) * (x1 - x0);
    const Y = (p) => y0 - p / 1.85 * (y0 - y1);
    const seg = (e, n = 70) => { let d = ''; for (let i = 0; i <= n; i++) { const q = Q.carnotPunto(e + i / n * 0.9999); d += (i ? 'L' : 'M') + f(X(q.v)) + ' ' + f(Y(q.p)); } return d; };
    const area = seg(0) + seg(1).replace('M', 'L') + seg(2).replace('M', 'L') + seg(3).replace('M', 'L') + 'Z';
    const pt = [0, 1, 2, 3].map((i) => [X(V[i]), Y(P[i])]);
    const lab = [[-26, -10], [10, -14], [14, 26], [-30, 28]];
    Q._geo = { pt: (u) => { const q = Q.carnotPunto(u); return [X(q.v), Y(q.p)]; } };
    let s = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Ciclo de Carnot en el diagrama presión–volumen">`;
    s += `<path class="fig-ax" d="M${x0} ${y0} H${x1}" marker-end="url(#pf-tinta)"/><path class="fig-ax" d="M${x0} ${y0} V${y1}" marker-end="url(#pf-tinta)"/>`;
    s += `<text x="${x1 - 6}" y="${y0 + 44}" class="tx" text-anchor="end" style="font-style:italic;font-family:var(--serif);font-size:34px">V</text><text x="${x0 - 30}" y="${y1 + 8}" class="tx" style="font-style:italic;font-family:var(--serif);font-size:34px">P</text>`;
    s += `<path class="ar" d="${area}" fill="var(--ocre)" fill-opacity=".28" stroke="none"/>`;
    s += `<path class="fig-c" style="stroke:var(--rojo)" d="${seg(0)}"/><path class="fig-c ad" d="${seg(1)}"/><path class="fig-c" style="stroke:var(--azul)" d="${seg(2)}"/><path class="fig-c ad" d="${seg(3)}"/>`;
    pt.forEach((p, i) => { s += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="7" fill="var(--tinta)"/><text x="${f(p[0] + lab[i][0])}" y="${f(p[1] + lab[i][1])}" style="font:600 32px var(--serif)">${i + 1}</text>`; });
    s += `<text x="${f(X(2.7))}" y="${f(Y(P[0] * .62) - 24)}" class="tx wl" style="fill:var(--ocre);font-size:32px">${o.wl || 'W neto'}</text>`;
    s += `<text x="${f(X(1.1) + 20)}" y="${f(Y(1.62) - 16)}" class="tx" style="fill:var(--rojo);font-size:26px">T caliente</text>`;
    s += `<text x="${f(X(4.6))}" y="${f(Y(.46))}" class="tx" style="fill:var(--azul);font-size:26px">T fría</text>`;
    return s + '</svg>';
  }
  function ts(w, h, o = {}) {
    const x0 = 80, x1 = w - 30, y0 = h - 70, y1 = 36;
    const xa = x0 + (x1 - x0) * .2, xb = x0 + (x1 - x0) * .82, yc = y1 + (y0 - y1) * .16, yf = y1 + (y0 - y1) * .62;
    Q._geo = { pt: (u) => { u = ((u % 4) + 4) % 4; const e = Math.floor(u), k = u - e, A = [[xa, yc], [xb, yc], [xb, yf], [xa, yf], [xa, yc]]; return [A[e][0] + (A[e + 1][0] - A[e][0]) * k, A[e][1] + (A[e + 1][1] - A[e][1]) * k]; } };
    let s = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Ciclo de Carnot en el diagrama temperatura–entropía">`;
    s += `<path class="fig-ax" d="M${x0} ${y0} H${x1}" marker-end="url(#pf-tinta)"/><path class="fig-ax" d="M${x0} ${y0} V${y1}" marker-end="url(#pf-tinta)"/>`;
    s += `<text x="${x1 - 6}" y="${y0 + 44}" class="tx" text-anchor="end" style="font-style:italic;font-family:var(--serif);font-size:34px">S</text><text x="${x0 - 30}" y="${y1 + 8}" class="tx" style="font-style:italic;font-family:var(--serif);font-size:34px">T</text>`;
    s += `<rect class="ar" x="${f(xa)}" y="${f(yc)}" width="${f(xb - xa)}" height="${f(yf - yc)}" fill="var(--ocre)" fill-opacity=".28"/>`;
    if (o.q) s += `<rect x="${f(xa)}" y="${f(yf)}" width="${f(xb - xa)}" height="${f(y0 - yf)}" fill="var(--azul)" fill-opacity=".16"/><text x="${f((xa + xb) / 2)}" y="${f((yf + y0) / 2 + 10)}" class="tx" text-anchor="middle" style="fill:var(--azul);font-size:28px">Q cedido</text>`;
    s += `<path class="fig-c" style="stroke:var(--rojo)" d="M${f(xa)} ${f(yc)} H${f(xb)}"/><path class="fig-c" style="stroke:var(--azul)" d="M${f(xb)} ${f(yf)} H${f(xa)}"/><path class="fig-c ad" d="M${f(xb)} ${f(yc)} V${f(yf)}"/><path class="fig-c ad" d="M${f(xa)} ${f(yf)} V${f(yc)}"/>`;
    [[xa, yc, -26, -10], [xb, yc, 10, -14], [xb, yf, 14, 30], [xa, yf, -30, 30]].forEach((p, i) => { s += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="7" fill="var(--tinta)"/><text x="${f(p[0] + p[2])}" y="${f(p[1] + p[3])}" style="font:600 32px var(--serif)">${i + 1}</text>`; });
    s += `<text x="${f((xa + xb) / 2)}" y="${f((yc + yf) / 2 + 10)}" class="tx" text-anchor="middle" class="wl" style="fill:var(--ocre);font-size:32px">${o.wl || 'W neto'}</text>`;
    s += `<text x="${f((xa + xb) / 2)}" y="${f(yc - 14)}" class="tx" text-anchor="middle" style="fill:var(--rojo);font-size:26px">T caliente</text>`;
    s += `<text x="${f((xa + xb) / 2)}" y="${f(yf + 36)}" class="tx" text-anchor="middle" style="fill:var(--azul);font-size:26px;${o.q ? 'display:none' : ''}">T fría</text>`;
    return s + '</svg>';
  }
  document.querySelectorAll('[data-fig]').forEach((el) => {
    const w = Number(el.dataset.w || 720), h = Number(el.dataset.h || 520);
    const o = { q: el.hasAttribute('data-q') };
    el.innerHTML = el.dataset.fig === 'pv' ? pv(w, h, o) : ts(w, h, o);
    el.__geo = Q._geo;
  });
})();
