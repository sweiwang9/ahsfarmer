# How to update your website

Everything is done through one page in your browser. You don't need to install anything,
and you don't need a GitHub account.

**Your editor:** [app.pagescms.org](https://app.pagescms.org)

Sign in with the link emailed to you. You'll see your site with a list of sections down the
left-hand side.

---

## What each section does

| Section | What lives there |
|---|---|
| **Articles** | Law journal and peer-reviewed articles |
| **Reports** | Field research reports |
| **Commentary** | Op-eds and shorter pieces |
| **Media** | Talks, press coverage, affiliations |
| **Projects** | Books and longer-running work |
| **About page** | Your full biography |
| **Page text** | The heading and intro paragraph on each page |
| **Site settings** | Your name, tagline, short bio, contact links, menu |
| **Media** (library) | All your images in one place |

---

## Adding a publication

1. Click the section it belongs in — say **Articles**.
2. Click **Add entry**.
3. Fill in the form. Only **Title** and **Year** are required.
4. Click **Save**.

Your site updates about a minute later.

### The fields

| Field | What it's for |
|---|---|
| **Title** | The headline |
| **Year** | Four digits. The site groups the list by year automatically |
| **Journal or publisher** | e.g. *36 Stanford Law & Policy Review 1* |
| **Co-authors** | Only if co-written, e.g. *with Katerina Linos* |
| **Link** | Where it can be read. Makes the title clickable |
| **PDF link** | Optional. Adds a small PDF button |
| **Cover image** | The picture on the left. See below |
| **Image description** | For blind readers. See below |
| **Show on the home page** | Pins it to the "Latest" list |
| **Short description** | A sentence or two shown under the entry |

---

## Images

Click the **Cover image** field and you can either **pick an existing image** from your
library or **drag in a new file**.

To **change** an image, click it and choose or upload a different one. To **remove** it,
clear the field — the entry still works, it just shows a plain tile.

**You don't need to worry about file size.** If you upload a large photo straight from your
phone, the site shrinks it automatically when it publishes. A 4 MB photo becomes about
30 KB without you doing anything.

Portrait-shaped images look best, roughly the proportions of a book cover.

### Image description

This is the text a blind reader's screen reader will announce.

- **Leave it blank** for a journal cover or a publisher's logo — the title next to it
  already says everything, and a blank description tells the screen reader to skip it.
- **Fill it in** for a photograph or anything carrying real information, e.g.
  *"Alice speaking on a panel at Oxford."*

---

## Editing the words on a page

**Page text** holds the heading and the intro paragraph for each page — the wording under
"Articles", "Reports", and so on. Pick the page, change the text, save.

Each page also has a **Search engine summary**. That's what Google shows and what appears
when someone shares the link. It is never visible on the page itself.

**About page** is your full biography, in a normal text editor with bold, italics, links,
headings and lists.

**Site settings** holds your name, tagline, the short biography on the home page, your
contact links, and the menu.

### The menu

Drag menu items to reorder them. You can change the wording of any item, and **Goes to** is
a dropdown of your real pages — so you can't accidentally create a link that goes nowhere.

To hide the email link and the "Get in touch" button, clear the **Email address** field.

---

## Removing something

Open the entry and click **Delete**. It disappears from the site on the next publish.

---

## If something looks wrong

**Your site will not break.** If a change can't be published, the site simply keeps showing
the previous version. Nothing broken becomes visible to the public.

If a change doesn't appear after a couple of minutes, tell whoever set this up — there's an
automatic check that explains what went wrong in plain English.

---

## Appendix: editing the files directly

You will almost certainly never need this. It's here in case the editor is ever
unavailable, because the site works perfectly well without it.

All the content lives as plain text files in the GitHub repository under `src/_data/`. Each
section is one file — `articles.yaml`, `reports.yaml`, `commentary.yaml`, `media.yaml`,
`projects.yaml` — plus `pages.yaml` for page wording, `site.yaml` for settings, and
`about.md` for the biography.

You can edit them on github.com with the pencil icon. One rule matters: **put double quotes
around anything that is text.**

```yaml
title: "Turned Away: Summary Returns from Italy to Greece"     ← correct
title: Turned Away: Summary Returns from Italy to Greece       ← breaks the publish
```

A colon has a special meaning in those files, and most titles contain one. Numbers
(`year: 2026`) and true/false (`featured: true`) go **without** quotes.

Images are written as a full path, e.g. `image: "/assets/img/penn-jil-2026.jpg"`, and the
file itself lives in `src/assets/img/`.
