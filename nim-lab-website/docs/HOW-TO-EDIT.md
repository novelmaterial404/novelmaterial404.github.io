# How to change the website

For everyone in the lab. No programming knowledge needed, and nothing here can
break the site permanently — every version is saved, so any change can be undone.

Changing something takes three steps:

> **1.** Open the editor  →  **2.** Change what you want  →  **3.** Click **Save**

Your change is on the live website about a minute later. That is the whole
process. There is no approval step and nothing to send to anyone.

---

## First time only: getting access

You need this once. Ask the professor to do steps 2 and 3 for you.

1. **Make a free GitHub account** at [github.com/signup](https://github.com/signup),
   if you do not already have one. GitHub is the service that stores the
   website's files and checks who is allowed to edit them. It is free, and this
   is the only account you need.
2. **Send the professor your GitHub username.**
3. **The professor adds you** (see *For the professor* at the bottom).
4. **Check your email** and click **Accept** on the invitation GitHub sends you.

That is it. You never need to visit GitHub again.

## Signing in

1. Go to **`https://YOUR-SITE/keystatic`**
2. Click **Sign in with GitHub**

There is no separate password to remember — GitHub handles it. Anyone who has
not been added by the professor just sees the sign-in screen and cannot change
anything.

## Finding your way around

After signing in you see everything you can change, in four groups:

| Group | What is in it |
| --- | --- |
| **Lab pages** | Home page, About, Research areas, Join us, Contact |
| **People** | Everyone in the lab, past and present |
| **Output** | Publications, News, Gallery |
| **Settings** | Lab name, tagline, footer links |

Click anything to open it, change what you like, then click **Save** at the top
right. If you forget to click Save, nothing happens — so there is no way to
change the site by accident.

## English and 中文

Most boxes come in pairs: an **English** box and a **中文** box.

Fill in English first. **Chinese is always optional.** If you leave a 中文 box
empty, the website simply shows the English text in its place, so a
half-finished translation never leaves a blank space on the page. You can come
back and add Chinese any time.

---

## The things you will actually do

### Add yourself to the People page

**People → Add**

Only two things are required: your **name** and your **position in the lab**.
Everything else is optional. Worth filling in:

| Box | Notes |
| --- | --- |
| **Full name (中文)** | Your name in Chinese, if you want it shown |
| **Photo** | A square, head-and-shoulders photo. Skip it and the site shows your initials in a coloured circle instead — that looks perfectly good, so do not worry about it |
| **Subtitle** | One line: your thesis topic or speciality |
| **Research interests** | A few keywords, added one at a time with the **Add** button |
| **Email** | Only if you are happy for it to be public |
| **Links** | Google Scholar, ORCID, GitHub, personal site |
| **About you** | A short paragraph. Bold, links and lists all work |

Ignore the **Web address** box — it fills itself in from your name.

Click **Save**. You are on the site a minute later.

To change your profile later: **People**, click your own name, edit, **Save**.

### Add a publication

**Output → Publications → Add**

Title, authors, journal and year are the important ones.

- **Authors** — type them as they appear on the paper, separated by commas. To
  make a lab member stand out in bold, put two stars around the name:
  `Mosquera-Lois, **Huang**, Lohan, Ye`
- **DOI** — just the number, like `10.1038/s41467-022-32669-3`. The website
  turns it into a working link by itself.
- **Highlight this paper** — ticking this puts the paper on the home page.
  Three or four highlighted papers looks about right.

### Post some news

**Output → News → Add**

A headline, a date and a short summary is enough. The longer post underneath is
optional — short items like "our paper was accepted" work fine with just a
summary.

### Update who you are recruiting

**Lab pages → Join us**

Each position has a **Currently recruiting** tick box. Untick it and the
position shows as closed instead of disappearing, so you can switch it back on
next year without retyping anything.

### Change the home page

**Lab pages → Home page**

The big heading, the sentence under it, and the three numbers near the top are
all here.

---

## If something goes wrong

**You changed the wrong thing, or the text looks broken.**
Nothing is lost. Every version of every page is saved forever, and any change
can be put back exactly as it was. Tell whoever looks after the site — it takes
about a minute to reverse.

**You signed in but it says something about a repository not being found.**
You have not been added yet, or you have not accepted the emailed invitation.
Check your email, then ask the professor.

**Your change has not appeared on the site.**
Wait two minutes and refresh the page. The site rebuilds itself after each save,
which takes about 40 seconds. If it still has not appeared, check you actually
clicked **Save**.

**The site looks different in dark or light colours.**
That is deliberate. Visitors switch it themselves with the sun/moon button, and
otherwise it matches whatever their own computer or phone is set to. There is
nothing to configure and nothing you can get wrong.

## What cannot be changed here

Page layout, colours, and the wording of the menu and buttons are part of the
website's code rather than its content. Those need someone comfortable editing
code — see `SETUP.md`.

---

## For the professor

### Adding someone

1. Go to the lab's repository page on GitHub.
2. **Settings → Collaborators → Add people**.
3. Type their GitHub username, choose the **Write** role, and send it.

They accept the emailed invitation, and they can edit immediately.

### Removing someone

Same screen — remove them from the list. Their access to the editor stops
straight away. Do this when a student leaves the lab.

### Who can change what

Everyone you add can edit any page. This is deliberate: it keeps the process to
three steps for everybody and avoids anyone waiting on approval for a typo. It
relies on the fact that a small lab is a group of people who know each other,
and that every change is reversible.

If you would rather have changes reviewed before they go live, that can be
turned on — it is a settings change, not a rebuild. Ask whoever looks after the
site.
