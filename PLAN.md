# PLAN.md — sawungrana.github.io

The working plan for this repo. Mirrors the conventions in `lantip.space`
(`website-3`), which is the sibling site: same design system, different job.

---

## 1. What this is

The professional site: who Azza is, what he has done, and the CV you can
download. It answers "should we hire him". `lantip.space` answers "does he
still build".

Everything here is static. No database, no analytics, no cookies, no
newsletter.

## 2. Decisions (locked)

| Decision | Choice |
|---|---|
| Stack | Astro static output + Tailwind v4, versions pinned to lantip |
| Fonts | EB Garamond Variable + Fragment Mono, self-hosted via Fontsource |
| Hosting | GitHub Pages via Actions, repo `sawungrana/sawungrana.github.io` |
| Domain | **none by choice.** Served at `sawungrana.github.io`. `sawungrana.pw` retired. Adding a domain later = one CNAME file |
| Relationship to lantip.space | Siblings. Shared design language, cross-linked, separate repos, no shared package |
| Analytics | none |
| Portrait | cameo (circular, double hairline) on screen and on the designed PDF; never on the ATS PDF |
| CV output | two PDFs from one source: `cv.pdf` (designed) and `cv-plain.pdf` (ATS-safe) |

## 3. Routes

| Route | Status | Job |
|---|---|---|
| `/` | built | Name, positioning, portrait, elsewhere links |
| `/cv` | phase 1 | Full CV, screen layout |
| `/cv/print` | phase 2 | Hidden route; the PDF source |
| `/work` | phase 3 | Three deep plates with architecture detail |
| `/colophon` | phase 3 | How the site is made |

The nav grows as routes land. No link points at a page that does not exist.

## 4. Design system

Ported from `website-3`: the `@theme` token block, the paper noise texture,
`.plate-frame`, `.stamp-text`, `.scrim-fade`, the header-band and rosette
ornaments. New here: `.cameo` (portrait medallion) and a replacement
`divider.svg` — the lantip wave is 1200 units wide and renders sub-pixel at the
128 px rule width, so this site uses a 48 × 16 lozenge instead.

Two deliberate differences from lantip:

- **The accent colour has one job: dates and links.** On lantip terracotta is
  decorative. On a CV, anything coloured is a signal, so spend it once.
- **A scan band at the top of `/cv`.** Name, role, location, four numbers. HR
  reads a CV in about six seconds before deciding to read it properly.

## 5. CV pipeline

```
src/data/cv.yaml ──┬──> /cv            web CV
                   ├──> cv.pdf         designed, paper, cameo
                   ├──> cv-plain.pdf   A4, white, single column, no photo
                   └──> cv.json        anything else later
```

- One YAML file, validated by a Zod schema at build time. A malformed date or a
  missing field fails the build rather than shipping a broken CV.
- `npm run cv` renders `/cv/print` and writes both PDFs.
- The PDFs are committed, because HR links should not depend on a build.

Content rules:

- Cut at 2017. Nine years, seven blocks. Older roles go in an "earlier" section
  on the web CV only.
- The plain PDF carries no colour, no photo, no rules, and real selectable text.

## 6. Phases

- [x] **Phase 0** — archive the Jekyll site and the W3 template, scaffold Astro,
      port tokens and ornaments, build the home page, add the Pages workflow
- [ ] **Phase 1** — `cv.yaml`, Zod schema, `/cv`
- [ ] **Phase 2** — `/cv/print`, both PDFs, `npm run cv`
- [ ] **Phase 3** — `/work` (three deep plates), `/colophon`, nav
- [ ] **Phase 4** — OG images, JSON-LD `Person`, cross-links, sitemap

## 7. Open items

- Confirm `azzadv@outlook.com` is still the address that should be public.
- `/work` plates: Bank Tanah (one platform, three clients, third phase), RIUH
  (dasymetric framework plus the meso traffic relocation), and the serving
  migration (GEE → COG/PMTiles/Parquet, $23 per national dataset, bus factor
  2 → 5).
- Decide whether the designed PDF keeps the paper tint when printed on paper,
  or flips to white. Previewing one print on an office printer will settle it.
