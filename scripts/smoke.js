#!/usr/bin/env node
/**
 * Post-build smoke test. Checks the built HTML, not the source.
 *
 * Exists because a layout whose front matter was not at byte 0 silently produced a
 * page with no <html>, no stylesheet and the literal "---" text in the body — and it
 * still returned HTTP 200, so nothing else caught it.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = "_site";
const problems = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : full.endsWith(".html") ? [full] : [];
  });
}

if (!fs.existsSync(OUT)) {
  console.error(`No ${OUT}/ directory — run the build first.`);
  process.exit(1);
}

// Minimum entries each page must render. Guards against a page going silently
// empty while still being valid HTML — which has happened twice, once from a
// data file exporting the wrong shape.
const MIN_ENTRIES = {
  "index.html": 3,
  "articles/index.html": 1,
  "reports/index.html": 1,
  "commentary/index.html": 1,
  "media/index.html": 1,
  "projects/index.html": 1,
};

const files = walk(OUT);
if (!files.length) problems.push("no HTML files were built at all.");

for (const [rel, min] of Object.entries(MIN_ENTRIES)) {
  const file = path.join(OUT, rel);
  if (!fs.existsSync(file)) {
    problems.push(`${rel}: was not built at all.`);
    continue;
  }
  const count = (fs.readFileSync(file, "utf8").match(/class="entry"/g) || []).length;
  if (count < min)
    problems.push(`${rel}: renders ${count} entries, expected at least ${min}. ` +
      `A data file is probably returning the wrong shape.`);
}

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const name = path.relative(OUT, file);

  if (!/<html[\s>]/i.test(html))
    problems.push(`${name}: no <html> element — the layout did not wrap this page.`);
  if (!/<\/body>/i.test(html))
    problems.push(`${name}: no closing </body> — the layout is incomplete.`);
  if (!/assets\/style\.css/.test(html))
    problems.push(`${name}: does not link the stylesheet, so it will render unstyled.`);
  if (/^\s*---\s*$/m.test(html))
    problems.push(`${name}: contains a literal "---" line — unparsed front matter leaked ` +
      `into the output. Front matter must be the very first thing in the file.`);
  if (/\{[{%#]/.test(html))
    problems.push(`${name}: contains an unrendered template tag.`);
  if (html.length < 500)
    problems.push(`${name}: suspiciously small (${html.length} bytes).`);
}

if (problems.length) {
  console.error("\nBuilt pages failed the smoke test:\n");
  problems.forEach((p) => console.error("  ✗ " + p));
  console.error(`\n${problems.length} problem(s).\n`);
  process.exit(1);
}

console.log(`Smoke test passed (${files.length} pages).`);
