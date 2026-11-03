# sawungrana.github.io

Source for [sawungrana.github.io](https://sawungrana.github.io) — the
professional site: who I am, what I have done, and the CV.

Sibling to [lantip.space](https://lantip.space), which is the workshop. Same
design language, different job.

## Stack

- [Astro](https://astro.build) static output + Tailwind CSS v4
- Fonts self-hosted via Fontsource: EB Garamond Variable, Fragment Mono
- No JavaScript shipped to the browser

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Preview the build locally |
| `npm run render` | Build, then regenerate `cv.pdf`, `cv-plain.pdf` and `og.png` |
| `npm run cv` | Alias for `render` |
| `python3 tools/plates.py` | Regenerate the map plates from `assets-src/plates/` |

`render` needs a Chromium-based browser. It looks for Chrome, Edge and Brave in
the usual macOS and Linux locations; override with `CHROME_BIN=/path/to/browser`.

## Structure

```
src/
  components/
    cv/          CvScreen (web + designed PDF), CvPlain (ATS PDF)
    Header, Footer, Mark, Rule, Stamp
  data/cv.yaml   the single source of truth for the CV
  layouts/       Base.astro (site), Bare.astro (print and OG routes)
  lib/cv.ts      Zod schema and loader
  ornaments/     divider, header-band, rosette (SVG, inlined via ?raw)
  pages/         index, cv/, work/, colophon, og, sitemap.xml
  styles/        global.css — tokens, shared utilities, ATS and print rules
scripts/
  render.mjs     headless Chromium → PDFs and the OG card
tools/plates.py  map scans -> navy duotone plates (provenance in SOURCES.md)
_archive/        the old Jekyll resume and the W3.CSS template, kept for history
assets-src/      full-size source images (git-ignored); optimised copies in public/
```

## Editing the CV

Everything comes from `src/data/cv.yaml`. Change it, run `npm run render`, and
the web page and both PDFs update together. The schema in `src/lib/cv.ts` fails
the build if a field is missing.

Quote any YAML string that contains a colon, a leading dash, or a bare year.

## Deploy

Push to `master`. `.github/workflows/deploy.yml` builds and publishes to GitHub
Pages.

**One-time setup:** Settings → Pages → Source must be **GitHub Actions**. If it
is still set to "deploy from a branch", the build will succeed and nothing will
appear.

## Licence

Site content and design: © Azza Sawungrana. Ornament SVGs are derived from
the lantip.space generator (`tools/guilloche.mjs` in that repo). Site code: MIT.
