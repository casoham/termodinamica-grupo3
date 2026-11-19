/* ============ ANIMACIONES: cascada, noria, máquina térmica y ciclo de Carnot (canvas) ============ */
(() => {
  const TAU = Math.PI * 2;
  const cs = getComputedStyle(document.documentElement), tv = (n, d) => cs.getPropertyValue(n).trim() || d;
  const C = { tinta: tv('--tinta', '#1C1C1A'), graf: tv('--grafito', '#5E5D58'), filete: tv('--filete', '#D8D2C4'), rojo: tv('--rojo', '#B3261E'), azul: tv('--azul', '#1F4A78'), ocre: tv('--ocre', '#A8873A'), papel: tv('--papel', '#F4F1EA') };
  const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const rnd = (i) => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };
  const mix = (a, b, u) => a.map((v, i) => Math.round(v + (b[i] - v) * u));
  const RGB_AZ = hx(C.azul), RGB_RO = hx(C.rojo);

  // ---- Ciclo de vida de una escena en canvas (start/stop con pausa real) ----
  function escena(id, cvId, dibuja, o = {}) {
    const cv = document.getElementById(cvId);
    const W = Number(cv.dataset.w), H = Number(cv.dataset.h), R = 2;
    cv.style.width = W + 'px'; cv.style.height = H + 'px'; cv.width = W * R; cv.height = H * R;
    const g = cv.getContext('2d'); g.setTransform(R, 0, 0, R, 0, 0);
    const S = o.estado ? o.estado() : {};
    let raf = 0, last = 0, t = 0;
    const cuadro = (now) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now; t += dt;
      g.clearRect(0, 0, W, H); dibuja(g, t, dt, S, W, H);
      raf = requestAnimationFrame(cuadro);
    };
    Q.vida[id] = {
      start() {
        if (document.fonts) { document.fonts.load('italic 36px Newsreader'); document.fonts.load('500 26px "IBM Plex Sans"'); }
        if (!o.reanuda) { t = 0; if (o.estado) Object.assign(S, o.estado()); }
        last = 0;
        if (o.inicio) o.inicio(S);
        if (Q.quieto) { g.clearRect(0, 0, W, H); dibuja(g, o.tEstatico ?? 3, 0.016, S, W, H); return; }
        raf = requestAnimationFrame(cuadro);
      },
      stop() { cancelAnimationFrame(raf); if (o.fin) o.fin(S); },
      paso: o.paso,
    };
  }

  // ---- Cascada y noria (coordenadas locales 800 × 680) ----
  const L = { W: 800, H: 680, cx: 250, top: 120, fw: 96, suelo: 660 };
  function cascada(g, t, dt, S) {
    const { cx, top, fw, suelo } = L; const W = S.W || L.W;
    const pool = S.pool, h0 = 350, k = Math.max(0.06, (pool - top) / h0);
    const ang = (S.ang = (S.ang || 0) + (S.omega ?? 1.5) * dt);
    // río de arriba
    g.fillStyle = 'rgba(31,74,120,.16)'; g.fillRect(0, top - 16, cx, 16);
    g.strokeStyle = C.azul; g.lineWidth = 1.6; g.beginPath();
    for (let x = 0; x <= cx; x += 8) { const y = top - 16 + Math.sin(x * 0.06 + t * 1.6) * 2; x ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
    // roca
    g.fillStyle = C.papel; g.strokeStyle = C.tinta; g.lineWidth = 3; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(0, top); g.lineTo(cx - 6, top); g.lineTo(cx, top + 10); g.lineTo(cx, suelo); g.lineTo(0, suelo); g.closePath(); g.fill(); g.stroke();
    g.lineWidth = 1.6; g.strokeStyle = C.graf; g.beginPath();
    for (let i = 0; i < 16; i++) { const y = top + 30 + i * 32, x = 20 + rnd(i) * 40; g.moveTo(x, y); g.lineTo(x + 60 + rnd(i + 3) * 80, y + 6); }
    g.stroke();
    // noria detrás de la cortina
    if (S.noria) noria(g, S, ang, pool);
    // cortina de agua
    g.fillStyle = 'rgba(31,74,120,.10)'; g.fillRect(cx, top, fw, pool - top);
    const N = 42;
    for (let i = 0; i < N; i++) {
      const bx = cx + (i + 0.5) / N * fw, w = 1.2 + rnd(i) * 2.4;
      g.strokeStyle = `rgba(31,74,120,${0.45 + rnd(i + 7) * 0.4})`; g.lineWidth = w;
      g.setLineDash([16 + rnd(i + 9) * 34, 10 + rnd(i + 3) * 22]); g.lineDashOffset = -t * (230 + rnd(i + 5) * 140);
      g.beginPath();
      for (let y = top; y <= pool; y += 20) { const x = bx + Math.sin(y * 0.025 + t * 2 + i) * 1.6; y === top ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.stroke();
    }
    g.setLineDash([]);
    // piscina
    g.fillStyle = 'rgba(31,74,120,.13)'; g.fillRect(cx, pool, W - cx, suelo - pool);
    g.strokeStyle = C.azul; g.lineWidth = 2.2; g.beginPath();
    for (let x = cx; x <= W; x += 6) { const y = pool + Math.sin(x * 0.05 + t * 1.5) * 2.2; x === cx ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
    g.strokeStyle = C.tinta; g.lineWidth = 3; g.beginPath(); g.moveTo(0, suelo); g.lineTo(W, suelo); g.stroke();
    // ondas
    for (let j = 0; j < 4; j++) {
      const u = (t * 0.32 + j / 4) % 1, rx = 30 + u * 190;
      g.strokeStyle = `rgba(31,74,120,${(1 - u) * 0.55 * Math.min(1, k + 0.3)})`; g.lineWidth = 1.5;
      g.beginPath(); g.ellipse(cx + fw * 0.5 + 40, pool + 3, rx, rx * 0.09, 0, 0, TAU); g.stroke();
    }
    // espuma
    g.lineWidth = 1.8; g.strokeStyle = C.azul; g.fillStyle = C.papel;
    for (let i = 0; i < 14; i++) {
      const a = t * (1 + rnd(i)) + i, px = cx + fw * 0.5 + (rnd(i) - 0.5) * fw * 1.5, py = pool + Math.sin(a) * 3 - 2, r = (3 + rnd(i + 5) * 7) * (0.5 + k * 0.5);
      g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill(); g.stroke();
    }
    // rocío
    for (let i = 0; i < 18; i++) {
      const u = (t * (0.22 + rnd(i) * 0.2) + rnd(i + 30)) % 1;
      const px = cx + fw * 0.5 + (rnd(i) - 0.5) * fw * 2 + Math.sin(u * 6 + i) * 10, py = pool - u * (60 * k + 24);
      g.fillStyle = `rgba(31,74,120,${(1 - u) * 0.35 * Math.min(1, k + 0.2)})`; g.beginPath(); g.arc(px, py, 2 + u * 5, 0, TAU); g.fill();
    }
  }
  function noria(g, S, ang, pool) {
    const R = 104, cx = 412, cy = 372;
    g.save(); g.translate(cx, cy);
    g.strokeStyle = C.tinta; g.lineWidth = 3; g.fillStyle = C.papel;
    g.beginPath(); g.moveTo(-34, L.suelo - cy); g.lineTo(0, 0); g.lineTo(34, L.suelo - cy); g.stroke();
    g.rotate(ang);
    g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill(); g.lineWidth = 4; g.stroke();
    g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R - 16, 0, TAU); g.stroke();
    g.beginPath(); for (let i = 0; i < 8; i++) { g.moveTo(0, 0); g.lineTo(Math.cos(i * TAU / 8) * (R - 16), Math.sin(i * TAU / 8) * (R - 16)); } g.stroke();
    g.fillStyle = 'rgba(168,135,58,.35)'; g.strokeStyle = C.ocre; g.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
      const b = i * TAU / 12, p = (r, a) => [Math.cos(a) * r, Math.sin(a) * r];
      const a1 = p(R - 14, b), a2 = p(R + 12, b + 0.05), a3 = p(R + 12, b + 0.26), a4 = p(R - 14, b + 0.2);
      g.beginPath(); g.moveTo(...a1); g.lineTo(...a2); g.lineTo(...a3); g.lineTo(...a4); g.closePath(); g.fill(); g.stroke();
    }
    g.fillStyle = C.tinta; g.beginPath(); g.arc(0, 0, 10, 0, TAU); g.fill();
    g.restore();
  }

  // ---- Máquina térmica (coordenadas locales 800 × 680) ----
  function maquina(g, t, dt, S) {
    const th = t * 1.5, hot = [230, 201, 192], cold = [203, 213, 224];
    g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = C.tinta;
    // bloques
    g.fillStyle = 'rgb(' + hot + ')'; g.fillRect(100, 10, 340, 80); g.strokeRect(100, 10, 340, 80);
    g.fillStyle = 'rgb(' + cold + ')'; g.fillRect(470, 570, 290, 80); g.strokeRect(470, 570, 290, 80);
    // volante y biela
    const wx = 260, wy = 570, r = 48, Lr = 170;
    const px = wx + r * Math.cos(th), py = wy + r * Math.sin(th);
    const hy = py - Math.sqrt(Lr * Lr - (px - wx) ** 2);
    // gas
    const gy0 = 154, gh = Math.max(10, hy - gy0 - 2);
    g.save(); g.beginPath(); g.rect(164, gy0, 192, gh); g.clip();
    const col = mix(RGB_AZ, RGB_RO, 0.55 + 0.3 * Math.sin(th));
    g.fillStyle = `rgba(${col},.10)`; g.fillRect(164, gy0, 192, gh);
    g.fillStyle = `rgb(${col})`;
    for (let i = 0; i < 44; i++) {
      const vx = (rnd(i) - 0.5) * 2, vy = (rnd(i + 9) - 0.5) * 2, sp = 90;
      const x = 170 + ((rnd(i + 3) * 180 + vx * sp * t * 1.4) % 360 + 360) % 360, y = gy0 + 6 + (((rnd(i + 5) * 260 + vy * sp * t * 1.4) % (2 * gh) + 2 * gh) % (2 * gh));
      const xx = x > 270 ? 540 - x + 0 : x - 0, yy = y > gh + gy0 ? 2 * (gh + gy0) - y : y;
      g.beginPath(); g.arc(Math.min(352, Math.max(170, x > 350 ? 700 - x : x)), Math.min(gy0 + gh - 4, Math.max(gy0 + 4, yy)), 3.2, 0, TAU); g.fill();
    }
    g.restore();
    // cilindro
    g.strokeStyle = C.tinta; g.lineWidth = 4; g.beginPath(); g.moveTo(160, 150); g.lineTo(160, 470); g.moveTo(360, 150); g.lineTo(360, 470); g.moveTo(160, 150); g.lineTo(360, 150); g.stroke();
    g.fillStyle = C.papel; g.lineWidth = 3; g.fillRect(162, hy, 196, 16); g.strokeRect(162, hy, 196, 16);
    g.beginPath(); g.moveTo(260, hy + 16); g.lineTo(px, py); g.lineWidth = 6; g.stroke();
    g.beginPath(); g.arc(wx, wy, r + 10, 0, TAU); g.fillStyle = C.papel; g.lineWidth = 4; g.fill(); g.stroke();
    g.strokeStyle = C.ocre; g.lineWidth = 3;
    g.beginPath(); for (let i = 0; i < 4; i++) { g.moveTo(wx, wy); g.lineTo(wx + Math.cos(th + i * TAU / 4) * (r + 6), wy + Math.sin(th + i * TAU / 4) * (r + 6)); } g.stroke();
    g.fillStyle = C.ocre; g.beginPath(); g.arc(px, py, 7, 0, TAU); g.fill(); g.beginPath(); g.arc(wx, wy, 8, 0, TAU); g.fillStyle = C.tinta; g.fill();
    // flechas de calor: Q_c entra (gruesa), Q_f sale (algo más delgada)
    const flecha = (x0, y0, x1, y1, w, col) => {
      g.strokeStyle = col; g.fillStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      const a = Math.atan2(y1 - y0, x1 - x0); g.beginPath(); g.moveTo(x1 + Math.cos(a) * 14, y1 + Math.sin(a) * 14); g.lineTo(x1 + Math.cos(a + 2.5) * 16, y1 + Math.sin(a + 2.5) * 16); g.lineTo(x1 + Math.cos(a - 2.5) * 16, y1 + Math.sin(a - 2.5) * 16); g.closePath(); g.fill();
    };
    flecha(260, 94, 260, 142, 12, C.rojo);
    g.strokeStyle = C.azul; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(364, 330); g.lineTo(520, 330); g.stroke(); flecha(520, 330, 520, 556, 8, C.azul);
    // puntos que viajan
    const u = (t * 0.5) % 1;
    g.fillStyle = C.rojo; g.beginPath(); g.arc(260, 94 + u * 48, 5, 0, TAU); g.fill();
    g.fillStyle = C.azul; g.beginPath(); g.arc(364 + u * 156, 330, 5, 0, TAU); g.fill();
    g.lineCap = 'butt';
  }

  // ===== Diapositiva 3: cascada sola =====
  escena('i4-cascada', 'i4-cv1', (g, t, dt, S, W, H) => {
    g.save(); g.translate(0, 0); g.scale(1.1, 1.1); S.W = 1527; S.pool = 500; S.noria = false; cascada(g, t, dt, S); g.restore();
  }, { estado: () => ({}) });

  // ===== Diapositiva 4: cascada y noria + máquina térmica; etiquetas una a una (clic o cada ~2 s) =====
  let tAuto = 0, ultimo = 0;
  const sec2 = () => document.getElementById('i4-noria');
  function programa(k) {
    clearTimeout(tAuto);
    if (k < 3 && k >= ultimo) tAuto = setTimeout(() => Q.setPaso(sec2(), Number(sec2().dataset.paso) + 1), 2200);
    ultimo = k;
  }
  escena('i4-noria', 'i4-cv2', (g, t, dt, S) => {
    g.save(); g.translate(10, 40); S.pool = 470; S.noria = true; S.omega = 1.6; cascada(g, t, dt, S); g.restore();
    g.save(); g.translate(880, 40); maquina(g, t, dt, S); g.restore();
  }, { estado: () => ({}), inicio: () => { ultimo = Number(sec2().dataset.paso || 0); programa(ultimo); }, fin: () => clearTimeout(tAuto), paso: programa, reanuda: true });

  // ===== Diapositiva 5: ciclo de Carnot, diagrama P-V + pistón sincronizados =====
  const ETAPAS = [
    ['1 → 2 · Expansión isotérmica · entra Q<sub>c</sub>', 'r'],
    ['2 → 3 · Expansión adiabática · Q = 0', 'n'],
    ['3 → 4 · Compresión isotérmica · sale Q<sub>f</sub>', 'a'],
    ['4 → 1 · Compresión adiabática · Q = 0', 'n'],
  ];
  escena('i4-pv', 'i4-cv3', (g, t, dt, S, W, H) => {
    const dur = 4, u = (t / dur) % 4, p = Q.carnotPunto(u), { V, P, TR, G } = Q.carnot;
    // --- Diagrama (izquierda)
    const x0 = 110, x1 = 780, y0 = 600, y1 = 120;
    const X = (v) => x0 + (v - 0.5) / (7 - 0.5) * (x1 - x0), Y = (pp) => y0 - pp / 1.85 * (y0 - y1);
    g.lineWidth = 3; g.strokeStyle = C.tinta; g.lineCap = 'round'; g.fillStyle = C.tinta;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1 + 20, y0); g.moveTo(x0, y0); g.lineTo(x0, y1 - 20); g.stroke();
    const ah = (x, y, a) => { g.beginPath(); g.moveTo(x, y); g.lineTo(x - 14 * Math.cos(a - 0.4), y - 14 * Math.sin(a - 0.4)); g.lineTo(x - 14 * Math.cos(a + 0.4), y - 14 * Math.sin(a + 0.4)); g.fill(); };
    ah(x1 + 20, y0, 0); ah(x0, y1 - 20, -Math.PI / 2);
    g.font = 'italic 40px Newsreader, Georgia, serif'; g.fillText('P', x0 - 40, y1 - 4); g.fillText('V', x1 + 14, y0 + 48);
    g.font = '600 34px Newsreader, Georgia, serif'; g.textAlign = 'center'; g.fillText('Presión y volumen', (x0 + x1) / 2, 70); g.textAlign = 'left';
    const curva = (e, hasta) => { g.beginPath(); const n = 90; for (let i = 0; i <= n * hasta; i++) { const q = Q.carnotPunto(e + i / n * 0.9999); const xx = X(q.v), yy = Y(q.p); i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); };
    // área
    g.beginPath(); for (let e = 0; e < 4; e++) for (let i = 0; i <= 60; i++) { const q = Q.carnotPunto(e + i / 60 * 0.9999); (e || i) ? g.lineTo(X(q.v), Y(q.p)) : g.moveTo(X(q.v), Y(q.p)); } g.closePath();
    g.fillStyle = 'rgba(168,135,58,.22)'; g.fill();
    const colores = [C.rojo, C.graf, C.azul, C.graf];
    for (let e = 0; e < 4; e++) { g.lineWidth = 4; g.strokeStyle = C.filete; curva(e, 1); }
    for (let e = 0; e < 4; e++) { g.lineWidth = 6; g.strokeStyle = colores[e]; if (e < p.e) curva(e, 1); else if (e === p.e) curva(e, p.s); }
    // puntos 1–4
    g.font = '600 38px Newsreader, Georgia, serif'; g.fillStyle = C.tinta;
    const off = [[-34, -10], [10, -16], [16, 34], [-36, 34]];
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(X(V[i]), Y(P[i]), 8, 0, TAU); g.fill(); g.fillText(String(i + 1), X(V[i]) + off[i][0], Y(P[i]) + off[i][1]); }
    g.font = '500 28px "IBM Plex Sans", system-ui, sans-serif'; g.fillStyle = C.graf; g.fillText('Recorrido horario', x0 + 420, y1 + 70);
    g.strokeStyle = C.graf; g.lineWidth = 2.5; g.beginPath(); g.arc(x0 + 384, y1 + 60, 22, -2.4, 0.9); g.stroke();
    ah(x0 + 384 + 22 * Math.cos(0.9), y1 + 60 + 22 * Math.sin(0.9), 0.9 + Math.PI / 2); g.fillStyle = C.graf;
    // marcador
    g.fillStyle = C.ocre; g.strokeStyle = C.tinta; g.lineWidth = 3; g.beginPath(); g.arc(X(p.v), Y(p.p), 13, 0, TAU); g.fill(); g.stroke();
    // --- Cilindro (derecha)
    const cxL = 1120, cw = 230, base = 560, top = 130, vmax = V[2];
    const frac = (p.v - V[0]) / (vmax - V[0]);
    const hy = base - 40 - frac * (base - 40 - top - 80);
    const col = mix(RGB_AZ, RGB_RO, Math.min(1, Math.max(0, (p.t - 1) / (TR - 1))));
    // losa deslizante: caliente | aislante | frío
    const pos = [[0, 0], [1, 1], [2, 2], [1, 1]]; // etapa → casilla
    const target = [0, 1, 2, 1][p.e];
    S.s = S.s === undefined ? target : S.s + (target - S.s) * Math.min(1, dt * 5);
    const tw = 250, y = base + 4;
    g.save(); g.beginPath(); g.rect(cxL - 240, y, cw + 480, 90); g.clip();
    const sx = cxL + cw / 2 - tw / 2 - S.s * tw;
    const bl = [['rgb(230,201,192)', 'fuente caliente'], ['#DDD9CF', 'aislante'], ['rgb(203,213,224)', 'foco frío']];
    bl.forEach((b, i) => { g.fillStyle = b[0]; g.fillRect(sx + i * tw, y, tw - 6, 84); g.strokeStyle = C.tinta; g.lineWidth = 3; g.strokeRect(sx + i * tw, y, tw - 6, 84); g.fillStyle = C.tinta; g.font = '500 26px "IBM Plex Sans", sans-serif'; g.textAlign = 'center'; g.fillText(b[1], sx + i * tw + (tw - 6) / 2, y + 70); if (i === 1) { g.strokeStyle = C.graf; g.lineWidth = 1.5; for (let q = 8; q < tw - 6; q += 16) { g.beginPath(); g.moveTo(sx + i * tw + q, y + 3); g.lineTo(sx + i * tw + q - 12, y + 81); g.stroke(); } } });
    g.restore(); g.textAlign = 'left';
    // gas
    g.save(); g.beginPath(); g.rect(cxL + 4, hy + 18, cw - 8, base - hy - 20); g.clip();
    g.fillStyle = `rgba(${col},.12)`; g.fillRect(cxL, hy, cw, base - hy);
    g.fillStyle = `rgb(${col})`; const sp = 70 * Math.sqrt(p.t);
    for (let i = 0; i < 64; i++) {
      const wH = cw - 14, hh = Math.max(20, base - hy - 26);
      const fx = (rnd(i) * wH + (rnd(i + 3) - 0.5) * 2 * sp * t) , fy = (rnd(i + 5) * hh + (rnd(i + 9) - 0.5) * 2 * sp * t);
      const tri = (v, m) => { const q = ((v % (2 * m)) + 2 * m) % (2 * m); return q > m ? 2 * m - q : q; };
      g.beginPath(); g.arc(cxL + 7 + tri(fx, wH), hy + 22 + tri(fy, hh), 3.6, 0, TAU); g.fill();
    }
    g.restore();
    g.strokeStyle = C.tinta; g.lineWidth = 5; g.beginPath(); g.moveTo(cxL, top); g.lineTo(cxL, base); g.lineTo(cxL + cw, base); g.lineTo(cxL + cw, top); g.stroke();
    g.fillStyle = C.papel; g.lineWidth = 3; g.fillRect(cxL - 2, hy, cw + 4, 18); g.strokeRect(cxL - 2, hy, cw + 4, 18);
    g.lineWidth = 8; g.beginPath(); g.moveTo(cxL + cw / 2, hy); g.lineTo(cxL + cw / 2, top - 50); g.stroke(); g.lineWidth = 8; g.beginPath(); g.moveTo(cxL + cw / 2 - 50, top - 50); g.lineTo(cxL + cw / 2 + 50, top - 50); g.stroke();
    // flechas de calor
    const fl = (x0f, y0f, x1f, y1f, c, w) => { g.strokeStyle = c; g.fillStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0f, y0f); g.lineTo(x1f, y1f); g.stroke(); const a = Math.atan2(y1f - y0f, x1f - x0f); g.beginPath(); g.moveTo(x1f + Math.cos(a) * 14, y1f + Math.sin(a) * 14); g.lineTo(x1f + Math.cos(a + 2.5) * 16, y1f + Math.sin(a + 2.5) * 16); g.lineTo(x1f + Math.cos(a - 2.5) * 16, y1f + Math.sin(a - 2.5) * 16); g.closePath(); g.fill(); g.lineCap = 'butt'; };
    const fade = Math.sin(Math.min(1, p.s * 8)) * Math.sin(Math.min(1, (1 - p.s) * 8 + 0.0));
    g.globalAlpha = Math.max(0.15, Math.min(1, fade + 0.3));
    if (p.e === 0) fl(cxL + cw / 2, base + 50, cxL + cw / 2, base + 12, C.rojo, 10);
    if (p.e === 2) fl(cxL + cw / 2, base + 12, cxL + cw / 2, base + 50, C.azul, 8);
    g.globalAlpha = 1;
    // etapa en curso
    if (S.e !== p.e) { S.e = p.e; const el = document.getElementById('i4-etapa'); el.innerHTML = ETAPAS[p.e][0]; el.className = 'etapa ' + ETAPAS[p.e][1]; }
  }, { estado: () => ({}), reanuda: true, tEstatico: 1.2 });

  // ===== Diapositiva 6: ¿qué pasa si el río de abajo sube? =====
  escena('i4-rio', 'i4-cv4', (g, t, dt, S) => {
    const h0 = 470 - L.top;
    let pool = 470;
    if (t > 4) { const u = Math.min(1, (t - 4) / 12); const e = u * u * (3 - 2 * u); pool = 470 + (L.top + 34 - 470) * e; }
    S.pool = pool; S.noria = true; S.omega = 1.6 * Math.max(0.04, (pool - L.top) / h0);
    g.save(); g.translate(430, 20); g.scale(1.05, 1.05); cascada(g, t, dt, S); g.restore();
  }, { estado: () => ({ pool: 470, ang: 0 }), tEstatico: 17 });

  // ===== Diapositiva (integrante 5): cascada con la misma escena =====
  escena('i5-cascada', 'i5-cv', (g, t, dt, S) => { g.save(); g.translate(40, 0); g.scale(0.88, 0.88); S.pool = 470; S.noria = true; S.omega = 1.6; cascada(g, t, dt, S); g.restore(); }, { estado: () => ({}) });

  // ===== Apertura animada: zoom al observador y fundido al retrato (pasos de la diapositiva) =====
  // (el movimiento lo hace el CSS; aquí solo se pausa/reanuda el bucle de la escena con la propia sección)
  Q.vida['i4-loco'] = { start() {}, stop() {} };
})();
