// Screenshots every page (light/dark, desktop/mobile) and reports console errors and broken requests.
// Usage: node tools/shoot.mjs [outDir]    (serves ./site on :4173)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright');
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'reference'));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.xml': 'text/xml', '.txt': 'text/plain' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(SITE, p);
  if (!f.startsWith(SITE) || !fs.existsSync(f)) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(4173);
const pages = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else if (e.name === 'index.html') pages.push('/' + path.relative(SITE, f).replace(/index\.html$/, '')); } })(SITE);
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const problems = [];
for (const [vp, w, h] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme, deviceScaleFactor: vp === 'mobile' ? 2 : 1 });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    page.on('response', (r) => { if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`); });
    for (const p of pages) {
      await page.goto(`http://localhost:4173${p}`, { waitUntil: 'load', timeout: 20000 });
      await page.evaluate(async () => {
        await document.fonts.ready;
        for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }  // trigger lazy images
        window.scrollTo(0, 0);
        await Promise.race([Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))), new Promise((r) => setTimeout(r, 4000))]);
      });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 0) problems.push(`horizontal overflow ${overflow}px on ${p} (${vp}/${theme})`);
      const name = (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '_'));
      if (theme === 'light' || p === '/' || p === '/work/') await page.screenshot({ path: path.join(OUT, `${name}.${vp}.${theme}.jpg`), type: 'jpeg', quality: 80, fullPage: true });
    }
    await ctx.close();
  }
}
await browser.close(); server.close();
console.log(problems.length ? [...new Set(problems)].join('\n') : 'no problems');
