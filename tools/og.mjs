// Renders site/assets/og-image.png (1200x630) with the site's own fonts and colors.
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${ROOT}/site/assets/fonts.css"><style>
html,body{margin:0}body{width:1200px;height:630px;background:#E5ECDE;font-family:Jost,sans-serif;color:#111;display:flex;flex-direction:column;justify-content:center;padding:0 90px;box-sizing:border-box;gap:34px}
.row{display:flex;align-items:center;gap:10px}.with{font-size:64px;font-weight:500;color:#5B2A5E}
.heart{position:relative;width:200px;height:185px}.heart svg{position:absolute;inset:0}
.heart span{position:absolute;left:0;right:0;top:30px;height:100px;display:flex;align-items:center;justify-content:center;font-family:Poppins,sans-serif;font-weight:600;font-size:68px;color:#5B2A5E}
.comma{font-size:110px;color:#5B2A5E;align-self:flex-end;padding-bottom:20px;line-height:1}
.name{background:#5B2A5E;color:#fff;font-size:84px;font-weight:500;letter-spacing:.01em;text-transform:uppercase;padding:8px 28px;margin-left:14px}
.tag{font-size:40px;line-height:1.35;max-width:880px}.tag b{font-weight:500;box-shadow:inset 0 -.45em 0 #E6CBE4;padding:0 4px}
</style></head><body>
<div class="row"><span class="with">with</span><div class="heart"><svg width="200" height="185" viewBox="-1 -1 26 24"><path d="M12 21.2C12 21.2 1 14.4 1 7.4A5.4 5.4 0 0 1 12 4.6A5.4 5.4 0 0 1 23 7.4C23 14.4 12 21.2 12 21.2Z" fill="none" stroke="#5B2A5E" stroke-width="2.5" stroke-linejoin="round" vector-effect="non-scaling-stroke" style="stroke-width:7px"/></svg><span>लव</span></div><span class="comma">,</span><span class="name">Lakshita Vij</span></div>
<div class="tag">Machine learning for <b>earlier, cheaper</b> and more accessible healthcare.</div>
</body></html>`;
const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: 1200, height: 630 } });
await pg.setContent(html); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(300);
await pg.screenshot({ path: path.join(ROOT, 'site/assets/og-image.png') });
await b.close(); console.log('og-image.png written');
