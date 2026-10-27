# Lakshita Vij: personal website

A finished static site: plain HTML, CSS and a tiny bit of JavaScript. No framework and no build step. `site/` is the thing you deploy.

## Look at it

```bash
cd site
python3 -m http.server 4173      # then open http://localhost:4173
```

You can also open `site/index.html` straight from disk. Every link and asset is relative.

## Give it to Claude Code

1. Put this whole folder in a new git repo (or the existing `lakshitavij.github.io` repo, see the warning in `CLAUDE.md`), then start Claude Code in it:
   ```bash
   cd lakshita-site && claude
   ```
2. Paste this:

   > Read CLAUDE.md and follow it. The site in `site/` is finished and approved. Your job is to run it locally and check it against `reference/`, then deploy it to GitHub Pages at lakshitavij.github.io (back up the old site on an `old-site` branch first, and ask me before you replace anything). Then run production QA on the live URL and tell me the final link and anything you changed. Do not change my copy, design or colors.

## What is in the folder

| Path | What it is |
|---|---|
| `site/` | The website. 13 pages, a 404, sitemap, robots, favicons, self-hosted fonts, images and videos |
| `CLAUDE.md` | Instructions and rules for Claude Code |
| `reference/` | Screenshots of every page: desktop and mobile, light and dark. This is "correct" |
| `.github/workflows/pages.yml` | Deploys `site/` to GitHub Pages on every push to `main` |
| `source/` | The original design-canvas pages the site was converted from (reference only) |
| `tools/` | `build.mjs` (the one-time converter) and `shoot.mjs` (screenshots plus link, console and overflow checks) |

## Editing later

Edit the HTML in `site/` directly. Colors and themes are CSS variables in `site/assets/site.css`; the theme toggle and the name-color click are in `site/assets/site.js`.
