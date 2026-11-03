# sawungrana.github.io

Source for [sawungrana.github.io](https://sawungrana.github.io) — the
professional site: who I am, what I have done, and the CV.

Sibling to [lantip.space](https://lantip.space), which is the workshop. Same
design language, different job.

## Stack

- [Astro](https://astro.build) static output + Tailwind CSS v4
- Fonts self-hosted via Fontsource: EB Garamond Variable, Fragment Mono
- The only JavaScript is whatever Astro emits for the dev toolbar, which is
  stripped from the build

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Preview the build locally |

## Structure

```
src/
  components/   Header, Footer, Mark, Rule, Stamp
  layouts/      Base.astro (head, fonts, skip link)
  ornaments/    divider, header-band, rosette (SVG, inlined via ?raw)
  pages/        index, and later cv, work, colophon
  styles/       global.css — design tokens and shared utilities
_archive/       the old Jekyll resume and the W3.CSS template, kept for history
assets-src/     full-size source images (git-ignored); optimised copies in public/
```

## Deploy

Push to `master`. `.github/workflows/deploy.yml` builds and publishes to GitHub
Pages.

**One-time setup:** Settings → Pages → Source must be **GitHub Actions**. If it
is still set to "deploy from a branch", the build will succeed and nothing will
appear.

## Licence

Site content and design: © Azzadiva Sawungrana. Ornament SVGs are derived from
the lantip.space generator (`tools/guilloche.mjs` in that repo). Site code: MIT.
