/* ============ ANIMACIÓN: el área del ciclo es trabajo neto (P–V y T–S) ============
   Un punto recorre el ciclo 1→2→3→4 trazando cada etapa con su color, el área encerrada se llena
   a medida que el ciclo se cierra y al final aparece «W neto». Pausa real al salir de la diapositiva. */
(() => {
  const NS = 'http://www.w3.org/2000/svg', DUR = 2.6, HOLD = 2.6;
  const COL = ['var(--rojo)', 'var(--grafito)', 'var(--azul)', 'var(--grafito)'];
  ['i5-pv', 'i5-ts'].forEach((id) => {
    const sec = document.getElementById(id); if (!sec) return;
    const fig = sec.querySelector('[data-fig]'), svg = fig.querySelector('svg'), geo = fig.__geo; if (!svg || !geo) return;
    const tr = [0, 1, 2, 3].map((e) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('fill', 'none'); p.setAttribute('stroke', COL[e]); p.setAttribute('stroke-width', '9'); p.setAttribute('stroke-linecap', 'round'); svg.appendChild(p); return p; });
    const mk = document.createElementNS(NS, 'circle'); mk.setAttribute('r', '15'); mk.setAttribute('fill', 'var(--ocre)'); mk.setAttribute('stroke', 'var(--tinta)'); mk.setAttribute('stroke-width', '3'); svg.appendChild(mk);
    const ar = svg.querySelector('.ar'), wl = svg.querySelector('.wl');
    let raf = 0, last = 0, t = 0;
    const pintar = (u) => {
      for (let e = 0; e < 4; e++) {
        const fr = Math.max(0, Math.min(1, u - e));
        if (fr <= 0) { tr[e].setAttribute('d', ''); continue; }
        const n = Math.max(2, Math.ceil(70 * fr)); let d = '';
        for (let i = 0; i <= n; i++) { const [x, y] = geo.pt(e + fr * i / n * 0.9999); d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }
        tr[e].setAttribute('d', d);
      }
      const [mx, my] = geo.pt(Math.min(u, 3.9999)); mk.setAttribute('cx', mx.toFixed(1)); mk.setAttribute('cy', my.toFixed(1));
      if (ar) ar.style.fillOpacity = (0.30 * Math.min(1, u / 4)).toFixed(3);
      if (wl) wl.style.opacity = Math.max(0, Math.min(1, (u - 3.4) * 2.5)).toFixed(2);
    };
    const cuadro = (now) => { const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now; t += dt; pintar(Math.min(4, (t % (4 * DUR + HOLD)) / DUR)); raf = requestAnimationFrame(cuadro); };
    Q.vida[id] = {
      start() { svg.classList.add('animando'); t = 0; last = 0; if (Q.quieto) { svg.classList.remove('animando'); tr.forEach((p) => p.setAttribute('d', '')); mk.style.display = 'none'; return; } raf = requestAnimationFrame(cuadro); },
      stop() { cancelAnimationFrame(raf); },
    };
  });
})();
