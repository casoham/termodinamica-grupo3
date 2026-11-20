/* ============ MOTOR: lienzo 1920×1080, navegación, pasos y ciclo de vida ============ */
window.Q = Object.assign(window.Q || {}, { vida: (window.Q && window.Q.vida) || {}, quieto: matchMedia('(prefers-reduced-motion: reduce)').matches });
(() => {
  const esc = document.getElementById('escenario');
  const dia = [...esc.querySelectorAll(':scope > section')];
  const notas = document.getElementById('notas');
  const cuad = document.getElementById('cuadricula');
  const salto = document.getElementById('salto');
  let actual = -1, buffer = '', tBuf;
  const N = (d) => Number(d.dataset.pasos || 0);

  function ajustar() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    esc.style.transform = `scale(${s}) translate(-50%,-50%)`;
    Q.escala = s;
  }

  function ponerPaso(d, k) {
    d.dataset.paso = k;
    for (let j = 1; j <= N(d); j++) d.classList.toggle('p' + j, j <= k);
    d.querySelectorAll('[data-p]').forEach((e) => e.classList.toggle('on', Number(e.dataset.p) <= k));
    const v = Q.vida[d.id];
    if (v && v.paso) v.paso(k);
  }

  function detener(d) { const v = d && Q.vida[d.id]; if (v && v.stop) v.stop(); }
  function iniciar(d) { const v = d && Q.vida[d.id]; if (v && v.start) v.start(); }

  function ir(i, final) {
    i = Math.max(0, Math.min(dia.length - 1, i));
    if (i === actual) return;
    const vieja = dia[actual], nueva = dia[i];
    if (vieja) { vieja.classList.remove('activa'); detener(vieja); }
    nueva.classList.add('activa');
    ponerPaso(nueva, final ? N(nueva) : 0);
    // reinicia animaciones CSS de entrada
    nueva.querySelectorAll('.ent,.fade,.trazo,.dibuja,.esc').forEach((e) => { e.style.animation = 'none'; void e.offsetWidth; e.style.animation = ''; });
    actual = i;
    iniciar(nueva);
    const a = nueva.querySelector('aside');
    notas.textContent = a ? a.textContent.trim() : '';
    history.replaceState(null, '', '#/' + (i + 1));
    cuad.querySelectorAll('button').forEach((b, j) => b.classList.toggle('cur', j === i));
  }
  const sig = () => {
    const d = dia[actual];
    if (Number(d.dataset.paso) < N(d)) ponerPaso(d, Number(d.dataset.paso) + 1);
    else ir(actual + 1, false);
  };
  const ant = () => {
    const d = dia[actual];
    if (Number(d.dataset.paso) > 0) ponerPaso(d, Number(d.dataset.paso) - 1);
    else ir(actual - 1, true);
  };

  // Cuadrícula (vista de índice)
  dia.forEach((d, i) => {
    const b = document.createElement('button');
    const k = d.querySelector('.k'), t = d.querySelector('.t, .div h2, .cita q, .big');
    b.innerHTML = `<small>${String(i + 1).padStart(2, '0')} · ${k ? k.textContent : ''}</small><span>${t ? t.textContent.trim().slice(0, 70) : '(sin título)'}</span>`;
    b.onclick = () => { document.body.classList.remove('grid'); ir(i, false); };
    cuad.appendChild(b);
  });

  addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key;
    if (/^[0-9]$/.test(k)) { buffer += k; salto.textContent = '→ ' + buffer; salto.classList.add('v'); clearTimeout(tBuf); tBuf = setTimeout(() => { buffer = ''; salto.classList.remove('v'); }, 2500); return; }
    if (k === 'Enter' && buffer) { ir(parseInt(buffer, 10) - 1, false); buffer = ''; salto.classList.remove('v'); e.preventDefault(); return; }
    if (['ArrowRight', ' ', 'PageDown', 'ArrowDown'].includes(k)) { e.preventDefault(); sig(); }
    else if (['ArrowLeft', 'PageUp', 'ArrowUp', 'Backspace'].includes(k)) { e.preventDefault(); ant(); }
    else if (k === 'Home') ir(0, false);
    else if (k === 'End') ir(dia.length - 1, true);
    else if (k === 'f' || k === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }
    else if (k === 'b' || k === 'B' || k === '.') document.body.classList.toggle('negro');
    else if (k === 'n' || k === 'N') notas.classList.toggle('abierta');
    else if (k === 'g' || k === 'G') document.body.classList.toggle('grid');
    else if (k === 'Escape') { document.body.classList.remove('grid', 'negro'); }
  });
  addEventListener('click', (e) => {
    if (notas.contains(e.target) || cuad.contains(e.target) || document.body.classList.contains('grid')) return;
    (e.clientX < innerWidth / 2 ? ant : sig)();
  });
  addEventListener('resize', ajustar);
  addEventListener('hashchange', () => { const n = parseInt(location.hash.replace('#/', ''), 10); if (n && n - 1 !== actual) ir(n - 1, false); });
  // Impresión: todo en estado final
  let guardado = [];
  addEventListener('beforeprint', () => { guardado = dia.map((d) => Number(d.dataset.paso || 0)); dia.forEach((d) => ponerPaso(d, N(d))); });
  addEventListener('afterprint', () => { dia.forEach((d, i) => ponerPaso(d, guardado[i] || 0)); });

  ajustar();
  dia.forEach((d) => { d.dataset.paso = 0; });
  ir((parseInt(location.hash.replace('#/', ''), 10) || 1) - 1, false);
  Q.ir = ir; Q.dia = dia; Q.setPaso = ponerPaso;
})();
