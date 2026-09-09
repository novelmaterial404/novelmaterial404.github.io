# Setup and handover

For whoever looks after the site technically. Everything here is done once.
Budget about 30 minutes.

Day-to-day editing needs none of this — that is `HOW-TO-EDIT.md`.

---

## The one rule of this handover

**Everything must be owned by an account registered to a lab email address, not
to a personal one.**

If the website lives under a student's personal GitHub or Vercel account, it
disappears when they graduate and stop reading that inbox. Nobody can log in,
nobody can fix a typo, and the only way back is to rebuild it. Putting it under
a lab-owned account from the start costs nothing and avoids that entirely.

The code has never been pushed anywhere yet, so this is easy: create the lab
account first and push straight to it. There is no transfer step.

## 1. Create the lab's accounts

1. **Get a lab email address** — either an NTU one, or a free address like
   `nimlab.ntu@gmail.com`. What matters is that the professor controls it and it
   outlives any one student.
2. **Create a GitHub account with that email** at
   [github.com/signup](https://github.com/signup). This account owns the
   website. The professor keeps the password.
3. **Create a Vercel account** at [vercel.com/signup](https://vercel.com/signup)
   by choosing **Continue with GitHub** and signing in as the lab account. Vercel
   is what puts the site online. Its free tier covers a site like this, and no
   card is required.

> Do not sign up for Vercel with a personal GitHub account "just to test". That
> is how ownership ends up in the wrong place.

## 2. Create the repository and push

Signed in as the lab account, create a **new private repository** on GitHub —
for example `nim-lab-website`. Do not add a README or any other file; it must be
empty.

Then, from this project folder:

```bash
git remote add origin https://github.com/LAB-ACCOUNT/nim-lab-website.git
git push -u origin main
```

Push `main` specifically, not `--all`. This working copy also carries an
unrelated `archive/govservices-portal` branch from before the folder was reused
for the lab site; it has nothing to do with the website and should not end up in
the lab's account. Pushing `main` on its own leaves it behind.

Private is the right choice: the website itself is public either way, and a
private repository keeps drafts and half-finished content out of view.

## 3. Put it online

1. Go to [vercel.com/new](https://vercel.com/new) as the lab account and import
   the repository.
2. Vercel detects Next.js on its own. Accept the defaults and deploy.
3. Add this under **Settings → Environment Variables**, then redeploy:

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | the real site URL, e.g. `https://nim-lab.vercel.app` |

The public site is now live. From here on, every save republishes it
automatically.

## 4. Turn on the editor

This is what puts a login in front of `/keystatic` so the lab can edit the site
in a browser.

1. Add this environment variable in Vercel and redeploy:

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO` | `LAB-ACCOUNT/nim-lab-website` |

2. Visit `https://YOUR-SITE/keystatic`. It will walk you through creating a
   **GitHub App** for the lab and show you the credentials it generates.

   To do it by hand instead: **GitHub → Settings → Developer settings → GitHub
   Apps → New GitHub App**, with

   - **Homepage URL**: `https://YOUR-SITE`
   - **Callback URL**: `https://YOUR-SITE/api/keystatic/github/oauth/callback`
   - **Request user authorization (OAuth) during installation**: on
   - **Webhook**: off
   - **Repository permissions**: `Contents: Read & write`, `Metadata: Read-only`
   - Install it on the website's repository.

3. Add the resulting values in Vercel and redeploy:

   | Name | Secret? | From |
   | --- | --- | --- |
   | `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | no | the app's URL slug |
   | `KEYSTATIC_GITHUB_CLIENT_ID` | no | the app's settings page |
   | `KEYSTATIC_GITHUB_CLIENT_SECRET` | **yes** | generate on the app's page |
   | `KEYSTATIC_SECRET` | **yes** | run `openssl rand -base64 32` |

Never commit the secrets. `.gitignore` already excludes `.env*`.

## 5. Add the professor and students

Repository → **Settings → Collaborators → Add people**.

- **Professor**: the **Admin** role.
- **Students**: the **Write** role.

Everyone with write access can edit any page, and their saves publish
immediately. That is a deliberate choice in favour of a three-step process for
non-technical people. Every version is retained, so any change can be reversed.

**To require review instead** — if the lab later decides it wants it —
repository **Settings → Rules → Rulesets → New branch ruleset**, target `main`,
enable *Require a pull request before merging* with 1 approval, and put the
professor on the bypass list. Students' saves then become pull requests with a
Vercel preview link for the professor to approve. Nothing in the code changes,
but `HOW-TO-EDIT.md` would need updating to describe the extra step.

## 6. Write down where everything is

Put the following somewhere the professor will still find it in three years — a
pinned email to the lab address, or a document in the lab's shared drive:

- The lab GitHub account's email and password
- The Vercel account (same GitHub login)
- The site URL and the editor URL (`/keystatic`)
- A link to `HOW-TO-EDIT.md`

This is the step people skip, and it is the one that actually determines whether
the site is still maintainable after everyone who built it has left.

---

## Running it on your own machine

```bash
npm install
npm run dev
```

- Site: <http://localhost:3000>
- Editor: <http://localhost:3000/keystatic>

In development the editor needs no login and writes straight to the `content/`
folder on disk.

## Where things live

| What | Where |
| --- | --- |
| Content the editor changes | `content/` |
| Uploaded images | `public/images/` |
| Which boxes the editor shows | `keystatic.config.ts` |
| Page layout and styling | `app/` |
| Menu and button wording | `dictionaries/en.json`, `dictionaries/zh-Hant.json` |
| Colours and fonts | `app/globals.css` |

Menu and button wording is the one thing the editor cannot change — it lives in
the dictionary files and needs a code change.

## Troubleshooting

**The deployed `/keystatic` does not ask for a login.**
`NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO` is unset, or the deployment predates it.
Set it and redeploy — `NEXT_PUBLIC_` values are baked in when the site is built,
so a redeploy is required.

**Someone signs in but sees "repo not found".**
They have not been added as a collaborator, or have not accepted the invitation.

**Someone's change has not appeared.**
Check the Vercel dashboard for a failed deployment. Each save triggers a rebuild
that takes roughly 40 seconds.

**Chinese text is missing on a page.**
Working as intended — an empty Chinese box falls back to the English text.
