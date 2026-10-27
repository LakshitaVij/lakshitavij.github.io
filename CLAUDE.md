# Lakshita Vij's personal website: handoff to Claude Code

You are taking over a finished design. Your job is to **get it deployed and make sure it looks and works perfectly in production**. It is not to redesign it or rewrite its content.

## What you have

```
site/        The complete static website (plain HTML, CSS, a little JS). No build step. This is the deployable output.
source/      The original design-canvas pages (*.dc.html) the site was converted from. Reference only.
tools/       build.mjs (one-time converter), shoot.mjs (Playwright screenshots + broken-link/console check), blob-map.json
reference/   Screenshots of every page: desktop + mobile, light + dark. This is what "correct" looks like.
```

`site/` is now the canonical copy. Edit the HTML there directly. `source/` and `build.mjs` exist so you can see where things came from; do not re-run the build over hand edits.

Pages (clean URLs, every folder is an `index.html`):

| URL | Page |
|---|---|
| `/` | Home (bio) |
| `/work/` | My Work: three columns (Research, Experience, Projects) |
| `/work/neuroscan360/` `/work/nyu-langone/` `/work/lupus-fairness/` `/work/markov-chains/` `/work/curiocity/` `/work/alzheimers-mri/` `/work/job-agent/` `/work/can-i-watch-it-at-night/` | Case studies |
| `/writing/` and `/writing/grandparental-locks/` | Writing list (one essay) and the essay |
| `/creative/` | Creative Quests (theatre, comedy, film credits and film classes) |

Everything uses relative URLs, so it works at a domain root, under a sub-path, or opened straight from disk.

## Design system (do not change)

- Page background light sage `#E5ECDE`; plum highlighters `#E6CBE4` / `#D3AED0`; deep plum `#5B2A5E` / `#8A4F8C`; ink `#111111`. Dark mode: `#141A13` background, `#EEF0EA` ink.
- Fonts: Jost (all text) and Poppins 600 (only the Devanagari ल व inside the heart). Both are **self-hosted** in `site/assets/fonts/`; there are no external font requests.
- Colors live as CSS variables in `site/assets/site.css`. Clicking the name button cycles `data-ci` (0..2) on `<html>`, which swaps the highlighter colors and the name block. The Dark/Light button sets `data-theme`. Both persist in `localStorage` and the first visit follows the system theme. Logic is in `site/assets/site.js` (about 30 lines).
- The header reads "with ♡(ल व), LAKSHITA VIJ". The heart is a plum outline SVG, stroke 2.5. The favicon is the same heart with the glyphs outlined (in `assets/favicon/`, wired in every page's `<head>`).
- Layout is mostly inline styles on purpose (that is how the design was authored). Responsive overrides live in `site.css` under `@media` with `!important`.

## Content rules (important)

The words are Lakshita's own. **Do not rewrite, "improve" or fact-check copy** unless asked. These were decided with her explicitly. Do not "fix" them:

- The first line of the essay contains an intentional italic placeholder-style phrase: *insert very famous, very alive celebrity*. It stays.
- The essay's statistics and sources were checked by her.
- The Hannah Montana meme on the NYU Langone page is intentional.
- LinkedIn is `https://www.linkedin.com/in/llakshitavijj/` (not the one with numbers). GitHub is `https://github.com/lakshitavij`. Email is `llakshitavijj@gmail.com`.
- Infosys is dated "Summer 2025". The Lupus page has no semester. The Langone dataset counts stay.
- **ChartR must stay one short paragraph.** She cannot publish details of that work. Never add detail from anywhere else.
- Her Google Drive and Notion links are fine to be public.
- The notebook sketch and whiteboard photos for Neuroscan360 were deliberately left out. The Writing page has one post on purpose.
- Home has no extra intro line, and neither do Writing or Creative Quests.

## Your tasks, in order

1. **Run it locally**: `cd site && python3 -m http.server 4173` and compare against `reference/`. Then run `PLAYWRIGHT_PATH=<path to playwright module> node tools/shoot.mjs /tmp/after` (needs Playwright) and diff against `reference/`. It also reports horizontal overflow, console errors and 404s; the result must be "no problems".
2. **Deploy.** The user's old site is the repo `lakshitavij/lakshitavij.github.io`.
   - **Before touching it:** confirm with her, back up the current default branch (`git branch old-site && git push origin old-site`), and only then replace the contents with `site/`. Never force-push without her saying so.
   - GitHub Pages: set Source to "GitHub Actions" and use `.github/workflows/pages.yml` (included, deploys the `site/` folder). Site will be `https://lakshitavij.github.io/`.
   - If she prefers Netlify, Vercel or Cloudflare Pages: publish directory `site`, no build command.
   - `sitemap.xml`, `robots.txt`, canonical URLs and Open Graph tags assume the origin `https://lakshitavij.github.io`. If the final domain differs, find and replace it everywhere (`grep -rl lakshitavij.github.io site`).
3. **Production QA on the live URL**: every page loads, every internal link works, the three videos play (Markov GUI, CurioCity walkthrough and demo day), fonts load (DevTools > Network, no Google Fonts requests), light/dark and the name-color click work, nothing overflows horizontally at 390px, and each page shows its own title and description when shared (check the OG image `assets/og-image.png`).
4. **Lighthouse** (mobile): aim for 95+ across Performance, Accessibility, Best Practices and SEO. Fix only what is structural (e.g. add `width`/`height` to images if CLS shows up, or compress the larger PNGs losslessly). Do not alter the look.
5. Tell her the final URL and anything you changed.

## Things to check that automated tools cannot

- External links open for someone not signed in to her accounts: the Drive PDFs and videos on `/creative/`, the Notion test documentation and WIPO patent link on `/work/neuroscan360/`, and the YouTube walkthrough on `/work/can-i-watch-it-at-night/`.
- Her Drive files must be shared as "anyone with the link" for visitors to open them.

## Off limits unless she asks

Adding analytics or cookies; changing copy, colors, fonts or layout; adding pages; swapping the framework; deleting `source/`. If you think something is genuinely wrong, tell her and let her decide.
