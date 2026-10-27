// One-time converter: design-canvas pages (source/*.dc.html) -> plain static HTML (site/).
// Run:  node tools/build.mjs
// After the conversion, site/ is the canonical copy. Edit the HTML there directly.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'source');
const OUT = path.join(ROOT, 'site');
const BLOBS = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/blob-map.json'), 'utf8'));
const ORIGIN = process.env.SITE_ORIGIN || 'https://lakshitavij.github.io';

// page key -> output path, title, description
const PAGES = {
  Home: { out: 'index.html', title: 'Lakshita Vij', desc: 'Lakshita Vij is a computer science graduate student at NYU building machine learning for earlier, cheaper and more accessible healthcare.' },
  Projects: { out: 'work/index.html', title: 'My Work', desc: 'Research, internships and projects at the edge of machine learning and medicine, by Lakshita Vij.' },
  Neuroscan360: { out: 'work/neuroscan360/index.html', title: 'Neuroscan360', desc: 'A patented multimodal early detection system for neurodegenerative diseases, built around a 23-game suite.' },
  Langone: { out: 'work/nyu-langone/index.html', title: 'Prostate cancer detection at NYU Langone', desc: 'Multimodal deep learning on MRI and clinical data to reduce unnecessary prostate biopsies.' },
  Lupus: { out: 'work/lupus-fairness/index.html', title: 'Lupus, gene expression and fairness', desc: 'A class project on detecting lupus and estimating severity from gene expression, and whether the models are fair across race and sex.' },
  Markov: { out: 'work/markov-chains/index.html', title: 'Markov chain models of cichlid fish behavior', desc: 'Markov chain models of animal behavior built at the Alvarado-Tajerian Lab, Queens College.' },
  CurioCity: { out: 'work/curiocity/index.html', title: 'CurioCity', desc: 'An app that helps groups of friends decide where to go in Los Angeles.' },
  Alzheimers: { out: 'work/alzheimers-mri/index.html', title: 'Alzheimer’s classification from MRI scans', desc: 'Neural network image classifiers for Alzheimer’s disease, trained on 6,400 MRI scans.' },
  JobAgent: { out: 'work/job-agent/index.html', title: 'Autonomous job application agent', desc: 'An agent built on the Anthropic SDK that finds roles, drafts outreach and fills out applications.' },
  Movie: { out: 'work/can-i-watch-it-at-night/index.html', title: 'Can I Watch It At Night?', desc: 'A movie recommendation app that tells you whether a title suits night-time viewing.' },
  Writing: { out: 'writing/index.html', title: 'Writing', desc: 'Essays by Lakshita Vij.' },
  Grandparents: { out: 'writing/grandparental-locks/index.html', title: 'We have child locks; what about grandparental locks?', desc: 'Why are we not considering grandparental “locks” and elder safe communities online, like we do for kids?', type: 'article' },
  Creative: { out: 'creative/index.html', title: 'Creative Quests', desc: 'Theatre, comedy, film and screenwriting by Lakshita Vij.' },
};
const OUTPATH = Object.fromEntries(Object.entries(PAGES).map(([k, v]) => [`${k}.dc.html`, v.out]));

// ---------- template engine ----------
const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lookup = (expr, scope) => {
  const parts = expr.trim().split('.');
  let cur = scope;
  for (const p of parts) { if (cur == null) return undefined; cur = cur[p]; }
  return cur;
};
const holeExpr = (s) => { const m = /^\s*\{\{([^}]*)\}\}\s*$/.exec(s); return m ? m[1] : null; };

function parse(src) {
  const re = /<(\/?)sc-(for|if)\b([^>]*)>/g;
  const root = { type: 'root', children: [] };
  const stack = [root];
  let last = 0, m;
  while ((m = re.exec(src))) {
    stack.at(-1).children.push({ type: 'text', value: src.slice(last, m.index) });
    last = re.lastIndex;
    if (m[1]) { stack.pop(); continue; }
    const attrs = {};
    for (const a of m[3].matchAll(/([\w-]+)="([^"]*)"/g)) attrs[a[1]] = a[2];
    const node = { type: m[2], attrs, children: [] };
    stack.at(-1).children.push(node);
    stack.push(node);
  }
  root.children.push({ type: 'text', value: src.slice(last) });
  return root;
}

function render(node, scope) {
  if (node.type === 'text') {
    return node.value.replace(/\{\{([^}]*)\}\}/g, (_, e) => {
      const v = lookup(e, scope);
      return v === undefined || typeof v === 'function' ? '' : esc(v);
    });
  }
  if (node.type === 'for') {
    const list = lookup(holeExpr(node.attrs.list), scope) || [];
    return list.map((item) => node.children.map((c) => render(c, { ...scope, [node.attrs.as]: item })).join('')).join('');
  }
  if (node.type === 'if') {
    return lookup(holeExpr(node.attrs.value), scope) ? node.children.map((c) => render(c, scope)).join('') : '';
  }
  return node.children.map((c) => render(c, scope)).join('');
}

// ---------- evaluate the page's own renderVals() ----------
function evaluate(scriptText) {
  class DCLogic { constructor(props) { this.props = props || {}; this.state = {}; } setState() {} }
  const ctx = vm.createContext({ DCLogic, console });
  vm.runInContext(scriptText + '\nthis.Component = Component;', ctx);
  const inst = new ctx.Component({});
  return inst.renderVals();
}

const L = ['a', 'b', 'c', 'd', 'e'];
function toCssVars(vals) {
  const v = { ...vals };
  v.t = { bg: 'var(--bg)', ink: 'var(--ink)', muted: 'var(--muted)', line: 'var(--line)', soft: 'var(--soft)' };
  v.heart = { line: 'var(--heart)' };
  v.name = { bg: 'var(--name-bg)', ink: 'var(--name-ink)' };
  v.modeLabel = 'Dark';
  v.u = Object.fromEntries(L.map((k, i) => [k, `var(--u${i % 2})`]));
  v.l = Object.fromEntries(L.map((k, i) => [k, { color: `var(--lc${i % 2})`, shadow: `var(--ls${i % 2})`, tag: `var(--p${i % 2})` }]));
  const swap = (x) => {
    if (typeof x === 'string') return x === '#E6CBE4' ? 'var(--p0)' : x === '#D3AED0' ? 'var(--p1)' : x;
    if (Array.isArray(x)) return x.map(swap);
    if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k, y]) => [k, typeof y === 'function' ? y : swap(y)]));
    return x;
  };
  for (const k of Object.keys(v)) if (!['t', 'heart', 'name', 'u', 'l', 'modeLabel'].includes(k) && typeof v[k] !== 'function') v[k] = swap(v[k]);
  return v;
}

// ---------- page assembly ----------
const rel = (fromOut, toOut) => {
  const from = path.posix.dirname(fromOut);
  let r = path.posix.relative(from, toOut);
  if (toOut.endsWith('/index.html')) r = path.posix.relative(from, toOut.replace(/index\.html$/, '')) || '.';
  if (r === '') r = '.';
  return r.endsWith('/') || r === '.' ? r : r;
};
const pathTo = (fromOut, toOut) => {
  const from = path.posix.dirname(fromOut);
  const toDir = toOut.replace(/index\.html$/, '');
  let r = path.posix.relative(from, toDir || '.');
  return r === '' ? './' : r + '/';
};
const assetUrl = (fromOut, assetPath) => path.posix.relative(path.posix.dirname(fromOut), assetPath);

function convert(key) {
  const meta = PAGES[key];
  const file = fs.readFileSync(path.join(SRC, `${key}.dc.html`), 'utf8');
  const tpl = /<x-dc>([\s\S]*?)<\/x-dc>/.exec(file)[1].replace(/<helmet>[\s\S]*?<\/helmet>/, '');
  const script = /<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/.exec(file)[1];
  const vals = toCssVars(evaluate(script));
  let html = render(parse(tpl), vals);

  html = html
    .replace(/\shint-placeholder-[\w-]+="[^"]*"/g, '')
    .replace(/onClick="[^"]*"/g, (m) => m) // handled below
    .replace(/<button type="button" onClick="" aria-label="Change color"/, '<button type="button" data-cycle aria-label="Change color"')
    .replace(/<button type="button" onClick="" style="min-height: 44px; display: flex/, '<button type="button" data-theme-toggle style="min-height: 44px; display: flex')
    .replace(/<span>Dark<\/span>/, '<span data-mode-label>Dark</span>')
    .replace(/^(\s*<div style=")min-height: \d+px; /m, '$1min-height: 100vh; ')
    .replace(/<header /, '<header class="site-header" ')
    .replace(/<main /, '<main id="main" class="site-main" ')
    .replace(/<footer /, '<footer class="site-footer" ')
    .replace(/<nav /, '<nav class="site-nav" aria-label="Primary" ')
    .replace(/<h1 /, '<h1 class="page-title" ');

  // internal links and assets
  html = html.replace(/href="([A-Za-z0-9]+\.dc\.html)"/g, (m, f) => {
    if (!OUTPATH[f]) throw new Error(`${key}: unknown link ${f}`);
    return `href="${pathTo(meta.out, OUTPATH[f])}"`;
  });
  html = html.replace(/(src|href)="(\/_blob\/[0-9a-f]{32})"/g, (m, a, b) => {
    if (!BLOBS[b]) throw new Error(`${key}: unknown asset ${b}`);
    return `${a}="${assetUrl(meta.out, BLOBS[b])}"`;
  });
  if (key === 'Projects') html = html.replace(/(<footer class="site-footer" style="max-width: )1040px/, '$11360px');
  html = html.replace(/<img /g, '<img loading="lazy" decoding="async" ');
  if (/\{\{|\}\}/.test(html)) throw new Error(`${key}: unresolved hole: ${html.match(/.{40}\{\{.{40}/)}`);
  if (/\.dc\.html|_blob/.test(html)) throw new Error(`${key}: leftover source reference`);

  const root = assetUrl(meta.out, 'assets');
  const url = `${ORIGIN}/${meta.out.replace(/index\.html$/, '')}`;
  const fullTitle = key === 'Home' ? 'Lakshita Vij' : `${meta.title} · Lakshita Vij`;
  const head = `<!doctype html>
<html lang="en" data-theme="light" data-ci="0">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(meta.desc)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#E5ECDE" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#141A13" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="${meta.type === 'article' ? 'article' : 'website'}">
<meta property="og:site_name" content="Lakshita Vij">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(meta.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ORIGIN}/assets/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${root}/favicon/favicon.svg" type="image/svg+xml">
<link rel="icon" href="${root}/favicon/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${root}/favicon/apple-touch-icon.png">
<link rel="preload" href="${root}/fonts/jost-400-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${root}/fonts.css">
<link rel="stylesheet" href="${root}/site.css">
<script>try{var d=document.documentElement,s=localStorage,t=s.getItem('theme'),c=s.getItem('ci');d.dataset.theme=t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(c)d.dataset.ci=c}catch(e){}</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
`;
  const tail = `
<script src="${root}/site.js" defer></script>
</body>
</html>
`;
  const outFile = path.join(OUT, meta.out);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, head + html.trim() + '\n' + tail);
  return meta.out;
}

const outs = Object.keys(PAGES).map(convert);
// sitemap + robots
const urls = outs.map((o) => `  <url><loc>${ORIGIN}/${o.replace(/index\.html$/, '')}</loc></url>`).join('\n');
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`);
// 404 page (root-absolute URLs, since it can be served from any path)
{
  let h = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
  h = h.replace(/<title>[^<]*<\/title>/, '<title>Page not found · Lakshita Vij</title>')
    .replace(/<link rel="canonical"[^>]*>\n/, '')
    .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Page not found.">')
    .replace('<meta name="viewport"', '<meta name="robots" content="noindex">\n<meta name="viewport"')
    .replace(/(href|src)="assets\//g, '$1="/assets/')
    .replace(/href="work\/"/g, 'href="/work/"').replace(/href="writing\/"/g, 'href="/writing/"').replace(/href="creative\/"/g, 'href="/creative/"').replace(/href="\.\/"/g, 'href="/"')
    .replace(/<main [\s\S]*?<\/main>/, `<main id="main" class="site-main" style="max-width: 1040px; margin: 0 auto; box-sizing: border-box; padding: 56px 40px 96px; display: flex; flex-direction: column; gap: 20px">
<h1 class="page-title" style="margin: 0; font-size: 56px; line-height: 1.1; font-weight: 500">Page not found</h1>
<p style="margin: 0; font-size: 21px; line-height: 1.75">That page does not exist. Try <a href="/" style="color: var(--lc0); box-shadow: var(--ls0); padding: 0 2px">home</a> or <a href="/work/" style="color: var(--lc1); box-shadow: var(--ls1); padding: 0 2px">my work</a>.</p>
</main>`);
  fs.writeFileSync(path.join(OUT, '404.html'), h);
}
console.log('built', outs.length, 'pages + 404');
