# Novel Inorganic Materials Lab — website

The website of the [Novel Inorganic Materials Lab](https://gipo.ntu.edu.tw/en/research/labs/Novel-Inorganic-Materials-Lab-63542093)
(R404, EE Building II), Graduate Institute of Photonics and Optoelectronics,
National Taiwan University. Led by Prof. Yi-Teng Huang.

Bilingual (English / 繁體中文), fully static, and editable through a browser-based
CMS so the lab can maintain it without touching code.

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

- Site: <http://localhost:3000> (redirects to `/en` or `/zh-Hant`)
- CMS: <http://localhost:3000/keystatic>

In development the CMS runs in local mode — no login, and edits write directly
to `content/` on disk.

## How it works

Content lives in the repository as Markdoc and YAML under `content/`. Keystatic
provides a GUI over exactly those files, so the two ways of editing never drift
apart:

```
Professor / students  →  /keystatic  →  commit  →  Vercel rebuild  →  live
Maintainer            →  edit content/ directly  ──────↑  (same files)
```

Every public page is prerendered as static HTML at build time. There is no
database and no server-side rendering — the only dynamic routes are the CMS
itself.

### Access control

There is no custom authentication. Editing requires a GitHub login, and
Keystatic grants access based on **write permission to this repository**, so
GitHub handles passwords, 2FA and revocation, and access is removed with one
click when someone leaves.

Everyone with access can edit any page, and saves publish immediately. That is a
deliberate trade: the lab is chemists and physicists, and a review step would
mean teaching pull requests and merging to people who should only ever need
*open, type, Save*. Git history makes every change reversible, which is the
safety net that makes the trade reasonable. Review can be switched on later
through GitHub branch protection without touching the code — see
[docs/SETUP.md](docs/SETUP.md).

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · Keystatic ·
Markdoc · deployed on Vercel.

### Layout

| Path | Contents |
| --- | --- |
| `app/(site)/[lang]/` | Public pages, one tree per locale |
| `app/(admin)/keystatic/` | The CMS UI (separate root layout, no site chrome) |
| `app/components/` | Shared UI |
| `content/` | All editable content |
| `dictionaries/` | Interface strings (nav, buttons) |
| `keystatic.config.ts` | What fields the CMS shows |
| `lib/content.ts` | Reads content and resolves the bilingual fallback |
| `lib/i18n.ts` | Locales and dictionary loading |
| `proxy.ts` | Locale negotiation and the `/` redirect |

### Notes for future work

- **Bilingual fallback.** An empty Chinese field falls back to English rather
  than rendering blank, so an unfinished translation can never break a page.
  `pick()` in `lib/content.ts` is where that happens.
- **Interface text is not in the CMS.** Nav labels and button text live in
  `dictionaries/*.json` and need a code change.
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
- This is Next.js 16: `proxy.ts` replaces `middleware.ts`, and `next/image` uses
  `preload` rather than the deprecated `priority`. See `AGENTS.md`.
