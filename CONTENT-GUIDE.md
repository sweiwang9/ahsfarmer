# How to update the website

You don't need to install anything. Everything is done in the browser.

There are only **six files** you will ever edit, and they all live in one folder:
`src/_data/`.

| To add or change… | Edit this file |
|---|---|
| A law journal or peer-reviewed article | `src/_data/articles.yaml` |
| A research report | `src/_data/reports.yaml` |
| An op-ed or short piece | `src/_data/commentary.yaml` |
| A talk, press mention or affiliation | `src/_data/media.yaml` |
| A book or ongoing project | `src/_data/projects.yaml` |
| Your name, tagline, bio, contact links | `src/_data/site.yaml` |

---

## Adding a publication

1. Go to the repository on github.com and open the file from the table above.
2. Click the **pencil icon** (top right of the file) to edit it.
3. Find the entry at the very top. **Select those lines, copy them, and paste them just above.**
4. Change the values in your new copy.
5. Scroll to the bottom and click the green **Commit changes** button.
6. Wait about a minute, then reload the website. Your entry will be there.

That's it. New entries go at the top of the file; the website sorts everything by year
automatically, so the order inside the file doesn't matter much — but keeping newest at the
top makes it easier to find things.

---

## What an entry looks like

```yaml
- title: "The Discretion Loophole: Executive Power and International Refugee Law"
  year: 2025
  venue: "36 Stanford Law & Policy Review 1"
  url: "https://law.stanford.edu/publications/the-discretion-loophole/"
  pdf: "https://law.stanford.edu/wp-content/uploads/2025/08/farmer.pdf"
  featured: true
  note: "One or two sentences about the piece."
```

Only three things are actually required: `title`, `year`, and either a `url` or a `pdf`.
Everything else is optional — leave a line out entirely if you don't need it.

| Field | What it does |
|---|---|
| `title` | The headline. Always in quotes. |
| `year` | Four digits. Used for sorting and the year headings. |
| `venue` | Journal, publisher or outlet. |
| `authors` | Only for co-authored work, e.g. `"with Katerina Linos"` |
| `date` | A fuller date if you want one shown, e.g. `"20 May 2013"` |
| `url` | Where the piece lives. Makes the title clickable. |
| `pdf` | Adds a small PDF button. |
| `note` | A sentence of context, shown under the entry. |
| `featured` | `true` pins it to the home page. Delete the line to unpin. |
| `lang` | Only for non-English pieces: `"fr"` for French, `"ar"` for Arabic. |
| `image` | The picture shown to the left. A filename from `src/assets/img/`. |
| `kind` | **Media only.** Must be `press`, `talk` or `affiliation` — this decides which section of the Media page it appears in. |

---

## Adding the picture

Each entry shows a small image on the left — a journal cover, a report cover, or a tile
with the publication's name on it.

**To reuse an existing one**, just point at it. Open `src/assets/img/` to see what's there
and copy the filename:

```yaml
image: "hrw.svg"          # the Human Rights Watch tile
image: "fmr.svg"          # the Forced Migration Review tile
```

**To add a new cover**, drag the image file into `src/assets/img/` on GitHub (open the
folder, then **Add file → Upload files**), and reference its filename. A portrait-shaped
image around 240×312 pixels looks best.

If you leave `image` out entirely the entry still works — it just shows a plain grey tile.
The content check will remind you.

---

## The one rule that matters

**Put double quotes around anything that is text.**

```yaml
title: "Turned Away: Summary Returns from Italy to Greece"     ← correct
title: Turned Away: Summary Returns from Italy to Greece       ← breaks the site
```

The reason is that a colon has a special meaning in these files. Since most of your titles
contain a colon, quoting everything is the safe habit. Numbers (`year: 2025`) and
true/false (`featured: true`) are the exceptions — those go **without** quotes.

If your title itself contains a double quote, use single quotes around the whole thing:

```yaml
title: 'A Real Life "Hunger Games"'
```

---

## If something goes wrong

**The website will not break.** If an edit has a mistake in it, the site simply keeps
showing the previous version until it's fixed. Nothing bad becomes visible to the public.

To see what went wrong:

1. Go to the **Actions** tab at the top of the repository.
2. Click the most recent run — it will have a red ✗.
3. Look for the step called **Validate content**. The error is written in plain English,
   for example:
   > `scholarship.yaml: entry 3 has no "year".`
   > `commentary.yaml: could not be read (around line 24). This is almost always an unquoted ":" in a title.`

Then go back, edit the file, fix that line, and commit again.

---

## Changing the tagline or bio

Open `src/_data/site.yaml`. The fields are `tagline`, `intro` (the paragraph on the home
page), and `currently` (the highlighted line at the bottom of the home page). Edit the text
between the quotes and commit.

To hide the email link, leave `email: ""` empty.

---

## Removing something

Delete its lines — from the `- title:` line down to just before the next `- title:` line —
and commit.
