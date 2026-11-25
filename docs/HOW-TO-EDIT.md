# How to change the website

Everything on the site comes from plain text files in the `content/` folder.
Change a file, push it to GitHub, and the site republishes itself about two
minutes later. Every version is kept in Git, so any change can be undone.

The easiest way is to ask Claude (Claude Code, opened in this folder), for
example:

> Add a publication: "Title…", authors Huang, Lee, Chen, *Nature Energy* 2026,
> DOI 10.xxxx/xxxxx. Highlight it on the home page.

> Add a new PhD student, Mei-Ling Chen, interested in perovskite LEDs. Photo is
> in my Downloads folder.

> Post a news item dated today: our paper was accepted in Advanced Materials.

Then ask it to commit and push.

## Where things live

| What | File(s) |
| --- | --- |
| Lab name, tagline, footer links | `content/settings/site.yaml` |
| Home page text and numbers | `content/pages/home/` |
| About, Join us | `content/pages/about/`, `content/pages/join/` |
| Contact details | `content/pages/contact.yaml` |
| People | `content/people/<name>/` |
| Publications | `content/publications/<title>.yaml` |
| News | `content/news/<slug>/` |
| Research areas | `content/research/<slug>/` |
| Images | `public/images/<people, news, research, home, gallery>/` |
| Menu and button wording | `dictionaries/en.json`, `dictionaries/zh-Hant.json` |

The fields each file can have are defined in `keystatic.config.ts`.

## English and 中文

Most fields come in pairs, an English one and a Chinese one (`zhHant`). Longer
text has a separate `…ZhHant.mdoc` file next to the English `index.mdoc`.

**Chinese is always optional.** An empty Chinese field shows the English text
instead, so a half-finished translation never leaves a blank on the page.

## Publication tips

- **Authors**: as they appear on the paper, separated by commas. Put two stars
  around a lab member's name to make it bold: `Mosquera-Lois, **Huang**, Ye`.
- **DOI**: just the number, like `10.1038/s41467-022-32669-3`. The site turns it
  into a link.
- **Highlight**: shows the paper on the home page. Three or four looks right.

## Checking before you push

With Node.js installed:

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## If something goes wrong

- **The change has not appeared.** Open the repository's **Actions** tab on
  GitHub. A red ✗ on the latest "Deploy to GitHub Pages" run means the build
  failed; its log says why (usually a typo in a YAML file).
- **You changed the wrong thing.** Revert the commit (or ask Claude to) and push
  again.
