# Novel Inorganic Materials Lab — website

The website of the [Novel Inorganic Materials Lab](https://gipo.ntu.edu.tw/en/research/labs/Novel-Inorganic-Materials-Lab-63542093)
(R404, EE Building II), Graduate Institute of Photonics and Optoelectronics,
National Taiwan University. Led by Prof. Yi-Teng Huang.

Bilingual (English / 繁體中文), fully static, and hosted on GitHub Pages.

## Documentation

| If you are… | Read |
| --- | --- |
| The professor or a student, changing the site | [docs/HOW-TO-EDIT.md](docs/HOW-TO-EDIT.md) |
| Setting it up, or handing it over | [docs/SETUP.md](docs/SETUP.md) |

## Running locally

```bash
npm install
npm run dev
```

- Site: <http://localhost:3000> (picks `/en` or `/zh-Hant` from the browser language)
- `npm run build` writes the static site to `out/`

## How it works

Content lives in the repository as Markdoc and YAML under `content/`. Every page
is prerendered to static HTML at build time, once per language. There is no
database and no server.

```
edit content/  →  push to main  →  GitHub Actions builds  →  GitHub Pages
```

The fields each content file has are defined in `keystatic.config.ts`, and
`lib/content.ts` reads the files with Keystatic's reader at build time. The
Keystatic browser editor is not used, because GitHub Pages cannot run it.

## Stack

Next.js 16 (App Router, static export) · React 19 · Tailwind CSS v4 · Keystatic
reader · Markdoc · deployed on GitHub Pages.

### Layout

| Path | Contents |
| --- | --- |
| `app/(site)/[lang]/` | Public pages, one tree per locale |
| `app/(root)/` | The `/` page that picks a language in the browser |
| `app/components/` | Shared UI |
| `content/` | All editable content |
| `dictionaries/` | Interface strings (nav, buttons) |
| `keystatic.config.ts` | The fields each content file has |
| `lib/content.ts` | Reads content and resolves the bilingual fallback |
| `lib/i18n.ts` | Locales and dictionary loading |
| `lib/image-loader.ts` | Adds the base path to image URLs (there is no image server) |
| `.github/workflows/deploy-pages.yml` | Builds and publishes on every push to `main` |

### Notes for future work

- **Bilingual fallback.** An empty Chinese field falls back to English rather
  than rendering blank, so an unfinished translation can never break a page.
  `pick()` in `lib/content.ts` is where that happens.
- **Interface text** (nav labels, buttons) lives in `dictionaries/*.json`.
- **Base path.** The site is meant to live at the root of
  `https://<owner>.github.io/` (repository named `<owner>.github.io`) or a
  custom domain, where there is no prefix. Under any other repository name
  GitHub serves it from `/<repository>`; the workflow passes that as
  `NEXT_PUBLIC_BASE_PATH`.
  `next/link` adds it automatically and `lib/image-loader.ts` adds it to
  `next/image`; a plain `<a href>` or `<img src>` with a root-relative path would
  need it added by hand.
- **Chinese type uses system fonts** (PingFang TC, Microsoft JhengHei, Noto Sans
  CJK). A webfont with full CJK coverage would add several megabytes for no real
  gain.
- **Motion is decorative.** The interference hero, scroll reveals and page
  crossfade all no-op under `prefers-reduced-motion`, and the content renders
  fine with JavaScript disabled.
- **Theming.** Light and dark are defined once, per token, with `light-dark()`
  in `app/globals.css` — there is no separate dark block to keep in sync.
  Switching the whole site is one `color-scheme` change on `<html>`. Visitors
  get a toggle in the header; with no choice made the site follows their device
  and keeps tracking it. To force a single theme instead, drop the toggle and
  hard-set `color-scheme` on `:root`.
- **The pre-paint theme script is production-only**, on purpose. React's
  development build logs *"Encountered a script tag while rendering React
  component"* for any `<script>` in the component tree, which surfaces as a red
  error overlay on every dev page load; the production build is silent and the
  script works normally there. `next/script` with `beforeInteractive` is not a
  substitute — for inline code it queues on `self.__next_s` and runs after
  paint, which is exactly the flash we are preventing. In development
  `ThemeToggle` reapplies the saved choice on mount instead, so the only
  difference is one frame, and only locally.
- This is Next.js 16: `next/image` uses `preload` rather than the deprecated
  `priority`. See `AGENTS.md`.
