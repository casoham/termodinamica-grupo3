// Arma index.html autocontenido: fuentes en base64, CSS, motor, animaciones y diapositivas.
// Uso: node build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = path.dirname(fileURLToPath(import.meta.url));
const TEMA = process.argv.includes('--tema=rediseno') ? 'rediseno' : '';
const R = (...p) => path.join(raiz, ...p);
const leer = (f) => fs.readFileSync(R(f), 'utf8');
const b64 = (f) => fs.readFileSync(R(f)).toString('base64');

// ---- Fuentes (woff2 latino, embebidas) ----
const fuentes = [
  ['Newsreader', 400, 'normal', 'newsreader_latin-400-normal', ''],
  ['Newsreader', 400, 'italic', 'newsreader_latin-400-italic', ''],
  ['Newsreader', 500, 'italic', 'newsreader_latin-500-italic', ''],
  ['Newsreader', 600, 'normal', 'newsreader_latin-600-normal', ''],
  ['IBM Plex Sans', 400, 'normal', 'ibm-plex-sans_latin-400-normal', ''],
  ['IBM Plex Sans', 500, 'normal', 'ibm-plex-sans_latin-500-normal', ''],
  ['IBM Plex Sans', 600, 'normal', 'ibm-plex-sans_latin-600-normal', ''],
  ['IBM Plex Sans', 400, 'normal', 'ibm-plex-sans_greek-400-normal', 'U+0370-03FF'],
  ['IBM Plex Sans', 500, 'normal', 'ibm-plex-sans_greek-400-normal', 'U+0370-03FF'],
  ['IBM Plex Mono', 400, 'normal', 'ibm-plex-mono_latin-400-normal', ''],
  ['IBM Plex Mono', 500, 'normal', 'ibm-plex-mono_latin-500-normal', ''],
  ['STIX Two Math', 400, 'normal', 'stix-two-math_latin-400-normal', ''],
  ...(TEMA ? [['Instrument Serif', 400, 'normal', 'instrument-serif_latin-400-normal', ''], ['Instrument Serif', 400, 'italic', 'instrument-serif_latin-400-italic', '']] : []),
  ['STIX Two Text', 400, 'italic', 'stix-two-text_latin-400-italic', ''],
  ['STIX Two Text', 400, 'italic', 'stix-two-text_greek-400-italic', 'U+0370-03FF'],
];
const faces = fuentes.map(([fam, w, st, f, ur]) =>
  `@font-face{font-family:'${fam}';font-weight:${w};font-style:${st};font-display:block;src:url(data:font/woff2;base64,${b64('fuentes/' + f + '.woff2')}) format('woff2');${ur ? 'unicode-range:' + ur + ';' : ''}}`).join('\n');

// ---- Recursos en línea ----
const logo = 'data:image/svg+xml;base64,' + b64('recursos/logo-key-tinta.svg');
const carnot = 'data:image/jpeg;base64,' + b64('recursos/carnot.jpg');
const entropia = 'data:image/jpeg;base64,' + b64('recursos/entropia.jpg');

// ---- Macros ----
const dims = { cerrada: [300, 520], abierta: [410, 520], corte: [480, 560] };
function refri(tipo, ancho, extra = '') {
  const [w, h] = dims[tipo];
  const vb = tipo === 'abierta' ? '-110 0 410 520' : `0 0 ${w} ${h}`;
  return `<svg class="refri ${extra}" viewBox="${vb}" width="${ancho}" height="${Math.round(ancho * h / w)}" role="img" aria-label="Refrigeradora"><use href="#refri-${tipo}"/></svg>`;
}
function macros(s) {
  s = s.replace(/\{\{R:(\w+):(\d+)(?::([^}]*))?\}\}/g, (_, t, w, e) => refri(t, Number(w), e || ''));
  s = s.replace(/\{\{v:(\w+?)(?:_(\w+))?\}\}/g, (_, a, b) => `<i class="v">${a}${b ? '<sub>' + b + '</sub>' : ''}</i>`);
  s = s.replace(/\{\{carnot\}\}/g, carnot).replace(/\{\{entropia\}\}/g, entropia);
  s = s.replace(/\{\{incluir:([^}]+)\}\}/g, (_, f) => leer(f.trim()));
  return s;
}

// ---- Diapositivas ----
const orden = fs.readdirSync(R('slides')).filter((f) => /^\d\d-.*\.html$/.test(f)).sort();
let secciones = '';
for (const f of orden) secciones += macros(TEMA && fs.existsSync(R('slides-r', f)) ? leer('slides-r/' + f) : leer('slides/' + f)) + '\n';
// Marca institucional discreta en cada diapositiva
secciones = secciones.replace(/(<section[^>]*>)/g, `$1<div class="ins"><img src="${logo}" alt="Instituto Kriete"></div>`);

const animaciones = fs.readdirSync(R('js')).filter((f) => /^\d\d-.*\.js$/.test(f)).sort().map((f) => leer('js/' + f)).join('\n');
const pagina = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Q · Leyes de la termodinámica y ciclos de Carnot</title>
<meta name="description" content="Grupo 3 · Comunicación Efectiva · Instituto Kriete de Ingeniería y Ciencias">
<style>
${faces}
${leer('css/base.css')}
${leer('css/slides.css')}
${TEMA ? leer('css/rediseno.css') : ''}
</style>
</head>
<body>
${leer('slides/defs.svg')}
${TEMA ? leer('slides-r/defs-r.svg') : ''}
<main id="escenario">
${secciones}</main>
<div id="negro"></div><div id="notas" role="note"></div><div id="cuadricula"></div><div id="salto"></div>
<script>
window.Q = { vida: {}, quieto: matchMedia('(prefers-reduced-motion: reduce)').matches };
${animaciones}
</script>
<script>
${leer('js/engine.js')}
</script>
</body>
</html>
`;
fs.writeFileSync(TEMA ? R('rediseno', 'index.html') : R('index.html'), pagina);
console.log(`ok · ${(pagina.match(/<section /g) || []).length} diapositivas · ${(pagina.length / 1e6).toFixed(2)} MB`);
