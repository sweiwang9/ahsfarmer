# ahsfarmer

Website for **Alice Hamilton Farmer**, international refugee lawyer.

**Editing the site?** → [CONTENT-GUIDE.md](CONTENT-GUIDE.md). You don't need to install anything.

---

## Status

This is a **mockup**, deployed to the temporary GitHub Pages address while the design is
reviewed. It will move to Alice's own domain later — see [Domain cutover](#domain-cutover).

- Live: https://sweiwang9.github.io/ahsfarmer/

## Stack

Eleventy v3 → static HTML → GitHub Actions → GitHub Pages. No framework, no CMS, no
database, no tracking. Ocean palette throughout — her current research concerns coastal and small-scale fishing communities facing climate displacement. System fonts only, so there are zero font downloads.

| | |
|---|---|
| Home page | ~11 KB uncompressed, ~3.2 KB gzipped |
| CSS | 9.7 KB, one file |
| JS | 1.2 KB — mobile nav toggle and list filter, nothing else |
| Images | 340 KB total, lazy-loaded (12 real covers rendered from PDFs, 22 generated SVG tiles, 1 video thumbnail) |
| Third-party requests | none |
| Hosting cost | £0 |

## Local development

```bash
npm install
npm run serve      # http://localhost:8080
npm run check      # validate content without building
npm run build      # production build into _site/
```

## Structure

```
src/_data/      ← the only files that need editing (see CONTENT-GUIDE.md)
src/_includes/  templates
src/*.njk       one file per page
src/assets/     style.css, site.js
scripts/check.js  content validator, runs before every build
```

## Content

46 items, all verified against primary sources. Authorship of each Human Rights Watch
report was confirmed by reading the acknowledgements page of the report itself — which is
how "Left to Survive" (2008), widely mis-attributed to her online, was correctly excluded.

Links point at publishers rather than local copies, since those sources are stable. The
exception worth knowing: much of the commentary was originally published in outlets that
have since closed (*European Voice*, *Public Service Europe*, *New Europe Online*), so
those links point at the versions Human Rights Watch republished. Mirroring them locally is
a pending task.

## Domain cutover

Two changes when the real domain is ready:

1. In `.github/workflows/deploy.yml`, set `PATH_PREFIX: /` (currently `/ahsfarmer/`, which
   a GitHub project page requires).
2. Add a `CNAME` file at the repo root containing the domain, then set it under
   Settings → Pages and tick **Enforce HTTPS**.

The GitHub Pages apex records are four `A` records to `185.199.108–111.153`, four `AAAA`
records to `2606:50c0:8000–8003::153`, and a `CNAME` for `www`. Check whether the domain
serves email before changing anything — the `MX` records must be left alone.

## Known gaps

- Her UNHCR years (2017–Jan 2024) are thinly represented. UN lawyers are quoted
  institutionally rather than by name, so that period is nearly invisible to search. The
  list of cases she filed amicus briefs in would fill it.
- Three publications are paywalled and listed without full text (Georgetown 2008, the
  Edward Elgar chapter, the ASIL remarks).
- Several event dates need confirming — they're marked in `src/_data/media.yaml`.
