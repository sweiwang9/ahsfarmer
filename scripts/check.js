#!/usr/bin/env node
/**
 * Content validator. Runs before every build, locally and in CI.
 * Reports problems in plain English so a non-developer can fix them.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const DATA_DIR = "src/_data";
const LISTS = ["articles", "reports", "commentary", "media", "projects"];
const IMG_DIR = "src/assets/img";
const problems = [];
const warnings = [];

function fail(file, msg) { problems.push(`${file}: ${msg}`); }
function warn(file, msg) { warnings.push(`${file}: ${msg}`); }

for (const name of LISTS) {
  const file = `${name}.yaml`;
  const full = path.join(DATA_DIR, file);

  if (!fs.existsSync(full)) { fail(file, "file is missing."); continue; }

  const raw = fs.readFileSync(full, "utf8");
  let data;
  try {
    data = yaml.load(raw);
  } catch (err) {
    const line = err.mark ? ` (around line ${err.mark.line + 1})` : "";
    fail(file, `could not be read${line}. This is almost always an unquoted ":" in a title, or a stray indent.\n    Original error: ${err.reason || err.message}`);
    continue;
  }

  if (!Array.isArray(data)) { fail(file, "should be a list of entries, each starting with '- '."); continue; }

  data.forEach((entry, i) => {
    const n = `entry ${i + 1}`;
    const label = entry?.title ? `${n} ("${String(entry.title).slice(0, 45)}…")` : n;

    if (!entry || typeof entry !== "object") { fail(file, `${n} is not a valid entry.`); return; }
    if (!entry.title) fail(file, `${n} has no "title".`);
    if (!entry.year) fail(file, `${label} has no "year".`);
    else if (!/^\d{4}$/.test(String(entry.year))) fail(file, `${label} has year "${entry.year}" — should be four digits, e.g. 2025.`);

    if (!entry.url && !entry.pdf) warn(file, `${label} has no "url" or "pdf", so it will render as plain unclickable text.`);

    for (const key of ["url", "pdf"]) {
      if (entry[key] && !/^https?:\/\//.test(entry[key]))
        fail(file, `${label} has a "${key}" that doesn't start with http:// or https://.`);
    }
    if (entry.featured !== undefined && typeof entry.featured !== "boolean")
      fail(file, `${label} has "featured: ${entry.featured}" — it must be true or false, with no quotes.`);
    if (name === "media" && !["press", "talk", "affiliation"].includes(entry.kind))
      fail(file, `${label} has kind "${entry.kind}" — must be press, talk, or affiliation.`);
    if (entry.image && !fs.existsSync(path.join(IMG_DIR, entry.image)))
      fail(file, `${label} points at image "${entry.image}", which isn't in ${IMG_DIR}/.`);
    if (!entry.image) warn(file, `${label} has no "image", so it will show an empty grey tile.`);
  });
}

// site.yaml
try {
  const site = yaml.load(fs.readFileSync(path.join(DATA_DIR, "site.yaml"), "utf8"));
  if (!site.name) fail("site.yaml", 'missing "name".');
  if (!Array.isArray(site.nav)) fail("site.yaml", '"nav" should be a list.');
} catch (err) {
  fail("site.yaml", `could not be read. ${err.reason || err.message}`);
}

if (warnings.length) {
  console.log("\nWarnings (the site will still build):\n");
  warnings.forEach((w) => console.log("  - " + w));
}

if (problems.length) {
  console.error("\nThe site cannot be built until these are fixed:\n");
  problems.forEach((p) => console.error("  ✗ " + p));
  console.error(`\n${problems.length} problem(s) found.`);
  console.error("Tip: every title, venue and url should be wrapped in \"double quotes\".\n");
  process.exit(1);
}

console.log("Content check passed.");
