# Setup and handover

For whoever looks after the site technically. Everything here is done once.

Day-to-day editing is in `HOW-TO-EDIT.md`.

## The one rule of this handover

**Everything must be owned by an account registered to a lab email address, not
a personal one.** If the site lives under a student's personal GitHub account,
it disappears when they graduate. Use a lab-controlled address (an NTU one, or a
free one the professor controls) for the GitHub account that owns the
repository.

## How it is hosted

The site is exported as plain static files (`next build` writes them to `out/`)
and served by **GitHub Pages**. There is no server: no database, no login, no
browser editor. Content is edited as files in `content/` and pushed.

`.github/workflows/deploy-pages.yml` builds and publishes the site on every push
to `main`.

## 1. Turn on GitHub Pages (once)

1. Name the repository **`<owner>.github.io`** (here
   `novelmaterial404.github.io`). That name makes it the account's main site,
   served at `https://novelmaterial404.github.io/` with no sub-path. Under any
   other name it is served at `https://<owner>.github.io/<repository>/`.
2. On GitHub, open the repository → **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Push to `main` (or open **Actions → Deploy to GitHub Pages → Run workflow**).

The workflow reads the address from GitHub, so the code works under either
name without changes.

GitHub Pages on a **private** repository needs a paid GitHub plan (Pro, Team or
Enterprise). On a free account, the repository must be public.

## 2. Custom domain (optional)

To use a domain such as `nimlab.example.edu.tw`:

1. **Settings → Pages → Custom domain**, enter the domain, save.
2. At the domain's DNS provider, add a `CNAME` record pointing to
   `<owner>.github.io`.
3. Tick **Enforce HTTPS** once GitHub has issued the certificate.

The workflow picks up the new address automatically on the next run, so links
drop the `/<repository>` prefix by themselves.

## How languages work

Every page exists twice, under `/en/` and `/zh-Hant/`. The page at `/` checks
the visitor's browser language and sends them to `/zh-Hant/` for Traditional
Chinese (zh-TW, zh-Hant, zh-HK, zh-MO) and `/en/` for everything else. The
language switch in the header keeps the reader on the same page.

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # writes the static site to out/
```
