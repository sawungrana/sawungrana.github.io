# PLAN.md — sawungrana.github.io

The working plan for this repo. Mirrors the conventions in `lantip.space`
(`website-3`), which is the sibling site: same design system, different job.

---

## 1. What this is

The professional site: who Azza is, what he has done, and the CV you can
download. It answers "should we hire him". `lantip.space` answers "does he
still build".

Everything here is static. No database, no analytics, no cookies, no
newsletter, no JavaScript.

## 2. Decisions (locked)

| Decision | Choice |
|---|---|
| Stack | Astro static output + Tailwind v4, versions pinned to lantip |
| Fonts | EB Garamond Variable + Fragment Mono, self-hosted via Fontsource |
| Hosting | GitHub Pages via Actions, repo `sawungrana/sawungrana.github.io` |
| Domain | **none by choice.** Served at `sawungrana.github.io`. `sawungrana.pw` retired. Adding a domain later = one CNAME file |
| Relationship to lantip.space | Siblings. Shared design language, cross-linked, separate repos, no shared package |
| Analytics | none |
| Portrait | cameo (circular, double hairline) on screen, the designed PDF and the OG card; never on the ATS PDF |
| CV output | two PDFs from one source: `cv.pdf` (designed) and `cv-plain.pdf` (ATS-safe) |

## 3. Routes

| Route | Job |
|---|---|
| `/` | Name, positioning, portrait, elsewhere links |
| `/cv` | Full CV, screen layout |
| `/cv/print` | Print source for the designed PDF. `noindex` |
| `/cv/plain` | Print source for the ATS PDF. `noindex` |
| `/work` | Three deep plates with numbers and a pipeline diagram |
| `/colophon` | How the site is made |
| `/sitemap.xml` | Generated from a route list, excludes the print routes |
| `/og` | The 1200×630 social card source, screenshotted to `public/og.png`. `noindex` |

## 4. Design system

Ported from `website-3`: the `@theme` token block, the paper noise texture,
`.plate-frame`, `.stamp-text`, `.scrim-fade`, the header-band and rosette
ornaments. New here: `.cameo` (portrait medallion), a replacement
`divider.svg`, and `.ats` for the plain CV.

Three deliberate differences from lantip:

- **The accent colour has one job: dates, links and list markers.** On lantip
  terracotta is decorative. On a CV, anything coloured is a signal, so spend it
  once.
- **A scan band at the top of `/cv`.** Name, role, location, four numbers. HR
  reads a CV in about six seconds before deciding to read it properly.
- **A new divider.** The lantip wave is 1200 units wide with a 0.7 unit stroke;
  scaled into a 128 px rule it lands at 0.075 CSS px and disappears. This site
  uses a 48 × 16 lozenge drawn at the size it is displayed.

## 4b. Plates

Every page carries one public-domain map plate, plus a strip in the footer,
provenance in `SOURCES.md`. `tools/plates.py` crops, duotones and fades them.

Maps are not engravings. Engravings are paper with dark lines; maps are large
mid-tone fields. At the lantip settings the plates read as grey slabs, so the
script raises the black point, drops gamma below 1, and blends toward paper per
plate. The `fade` value is the knob.

The designed CV uses `batavia-print.webp`, a 900 px band at fade 0.8. Embedding
the full plate tripled the PDF to 2.2 MB and pushed it to four pages; the
narrow one keeps it at three pages and 1.1 MB. The plain CV has no plate at all.

## 5. CV pipeline

```
src/data/cv.yaml ──┬──> /cv            web CV
                   ├──> cv.pdf         designed, paper, cameo
                   └──> cv-plain.pdf   A4, white, single column, no photo
```

- One YAML file, validated by a Zod schema in `src/lib/cv.ts` at build time. A
  malformed date or a missing field fails the build with the field path.
- Quote any YAML string containing a colon, a leading dash, or a bare year.
  Unquoted, `Lead the data function: platform` becomes a mapping.
- `npm run render` builds the site, serves `dist/`, and drives a headless
  Chromium to print both PDFs and the OG card. No PDF library is involved, so
  the PDFs cannot drift from the pages.
- The generated files are committed to `public/`, because an HR link should not
  depend on a build.

Pagination notes: A4 is 762 CSS px, which is below Tailwind's 768 px `md`
breakpoint, so the CV grids use `sm:` and the print route sets its own root
font size. Without both, the date rail collapses in the PDF and the CV grows a
fourth page.

## 6. Phases

- [x] **Phase 0** — archive the Jekyll site and the W3 template, scaffold Astro,
      port tokens and ornaments, build the home page, add the Pages workflow
- [x] **Phase 1** — `cv.yaml`, Zod schema, `/cv`
- [x] **Phase 2** — `/cv/print`, `/cv/plain`, both PDFs, `npm run render`
- [x] **Phase 3** — `/work` (three deep plates), `/colophon`, nav
- [x] **Phase 4** — OG card, JSON-LD `Person`, sitemap, robots, cross-links

## 7. Open items

- Confirm `azzadv@outlook.com` is still the address that should be public.
- Preview one printed sheet on a real printer: decide whether the designed PDF
  keeps the paper tint or flips to white for physical printing.
- `cv.pdf` is ~1.1 MB because the paper texture and the plate rasterise on each
  page. Fine for email; worth revisiting if it ever needs to be smaller.
- Consider a `cv.json` output for reuse beyond the site.
