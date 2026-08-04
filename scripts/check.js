#!/usr/bin/env node
/**
 * Content validator. Runs before every build, locally and in CI.
 * Reports problems in plain English so a non-developer can fix them.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const DATA_DIR = "src/_data";
const SITE_ROOT = "src";
const LISTS = ["articles", "reports", "commentary", "media", "projects"];
const BIG_IMAGE_KB = 400;   // above this we nudge, though the build resizes it anyway
const problems = [];
const warnings = [];

const fail = (file, msg) => problems.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

function load(file) {
  const full = path.join(DATA_DIR, file);
  if (!fs.existsSync(full)) {
    fail(file, "file is missing.");
    return null;
  }
  try {
    return yaml.load(fs.readFileSync(full, "utf8"));
  } catch (err) {
    const line = err.mark ? ` (around line ${err.mark.line + 1})` : "";
    fail(file, `could not be read${line}. This is almost always an unquoted ":" in a title, ` +
      `or a stray indent.\n    Original error: ${err.reason || err.message}`);
    return null;
  }
}

/* ---------- publication lists ---------- */

for (const name of LISTS) {
  const file = `${name}.yaml`;
  const data = load(file);
  if (data === null) continue;
  if (!Array.isArray(data)) {
    fail(file, "should be a list of entries, each starting with '- '.");
    continue;
  }

  data.forEach((entry, i) => {
    const n = `entry ${i + 1}`;
    if (!entry || typeof entry !== "object") return fail(file, `${n} is not a valid entry.`);
    const label = entry.title ? `${n} ("${String(entry.title).slice(0, 45)}…")` : n;

    if (!entry.title) fail(file, `${n} has no "title".`);
    if (!entry.year) fail(file, `${label} has no "year".`);
    else if (!/^\d{4}$/.test(String(entry.year)))
      fail(file, `${label} has year "${entry.year}" — should be four digits, e.g. 2025.`);

    if (!entry.url && !entry.pdf)
      warn(file, `${label} has no "url" or "pdf", so it will render as plain unclickable text.`);

    for (const key of ["url", "pdf"]) {
      if (entry[key] && !/^https?:\/\//.test(entry[key]))
        fail(file, `${label} has a "${key}" that doesn't start with http:// or https://.`);
    }
    for (const flag of ["featured", "hidden"]) {
      if (entry[flag] !== undefined && typeof entry[flag] !== "boolean")
        fail(file, `${label} has "${flag}: ${entry[flag]}" — must be true or false, unquoted.`);
    }
    if (entry.featured && entry.hidden)
      warn(file, `${label} is both shown and hidden on the home page. Hidden wins.`);
    if (name === "media" && !["press", "talk", "affiliation"].includes(entry.kind))
      fail(file, `${label} has kind "${entry.kind}" — must be press, talk, or affiliation.`);

    if (!entry.image) {
      warn(file, `${label} has no image, so it will show an empty tile.`);
    } else if (!String(entry.image).startsWith("/")) {
      fail(file, `${label} has image "${entry.image}" — it must start with "/", ` +
        `e.g. "/assets/img/name.jpg".`);
    } else if (!fs.existsSync(path.join(SITE_ROOT, entry.image))) {
      fail(file, `${label} points at image "${entry.image}", which does not exist.`);
    } else {
      const kb = fs.statSync(path.join(SITE_ROOT, entry.image)).size / 1024;
      if (kb > BIG_IMAGE_KB)
        warn(file, `${label} has a large image (${Math.round(kb)} KB). The site will shrink it ` +
          `automatically, but a smaller original keeps the repository light.`);
    }
  });
}

/* ---------- routes ---------- */

const routes = load("routes.yaml") || {};
if (!routes.about) fail("routes.yaml", 'missing the "about" route, which the home page links to.');

/* ---------- site settings ---------- */

const site = load("site.yaml");
if (site) {
  for (const key of ["name", "tagline", "description"])
    if (!site[key]) fail("site.yaml", `missing "${key}".`);
  if (!Array.isArray(site.about) || !site.about.length)
    fail("site.yaml", '"about" should be a list of one or more paragraphs.');
  if (!Array.isArray(site.nav)) {
    fail("site.yaml", '"nav" should be a list.');
  } else {
    site.nav.forEach((item, i) => {
      if (!item.label) fail("site.yaml", `menu item ${i + 1} has no "label".`);
      if (!item.page) fail("site.yaml", `menu item ${i + 1} has no "page".`);
      else if (!routes[item.page])
        fail("site.yaml", `menu item "${item.label}" points at page "${item.page}", which is not ` +
          `a real page. Valid options: ${Object.keys(routes).join(", ")}.`);
    });
  }
  if (site.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(site.email))
    fail("site.yaml", `"${site.email}" does not look like an email address. ` +
      `Leave it empty to hide the link.`);
}

/* ---------- page text ---------- */

// Only what a page genuinely cannot do without. Section headings, intro paragraphs
// and button labels are all optional: clearing one removes that element rather than
// leaving a blank heading, because deleting a section is a legitimate edit.
const REQUIRED_PAGE_TEXT = {
  articles: ["nav_title", "heading", "seo"],
  reports: ["nav_title", "heading", "seo"],
  commentary: ["nav_title", "heading", "seo"],
  projects: ["nav_title", "heading", "seo"],
  media: ["nav_title", "heading", "seo"],
  about: ["nav_title", "heading", "seo"],
};

// These groups must exist even if every value inside them is blank, because the
// templates read through them.
const REQUIRED_PAGE_GROUPS = ["home", "ui"];

const pages = load("pages.yaml");
if (pages) {
  for (const group of REQUIRED_PAGE_GROUPS)
    if (!pages[group]) fail("pages.yaml", `the "${group}" section is missing entirely.`);

  for (const [group, keys] of Object.entries(REQUIRED_PAGE_TEXT)) {
    if (!pages[group]) {
      fail("pages.yaml", `the "${group}" section is missing entirely.`);
      continue;
    }
    for (const key of keys) {
      const value = pages[group][key];
      if (value === undefined || value === null || String(value).trim() === "")
        fail("pages.yaml", `"${group}.${key}" is empty, and the page needs it.`);
    }
  }
}

/* ---------- about page ---------- */

const ABOUT = "src/about.md";
if (!fs.existsSync(ABOUT)) {
  fail("about.md", "file is missing.");
} else {
  const body = fs.readFileSync(ABOUT, "utf8").split(/^---$/m).slice(2).join("---").trim();
  if (body.length < 100) fail("about.md", "the biography looks empty.");
}

/* ---------- report ---------- */

if (warnings.length) {
  console.log("\nWarnings (the site will still build):\n");
  warnings.forEach((w) => console.log("  - " + w));
}

if (problems.length) {
  console.error("\nThe site cannot be built until these are fixed:\n");
  problems.forEach((p) => console.error("  ✗ " + p));
  console.error(`\n${problems.length} problem(s) found.`);
  console.error('Tip: every piece of text should be wrapped in "double quotes".\n');
  process.exit(1);
}

console.log("Content check passed.");
