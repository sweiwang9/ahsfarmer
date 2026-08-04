/**
 * Builds the home page's "Latest" list.
 *
 * Rules:
 *   - The most recent entry in each category appears automatically.
 *   - Ticking "Show on the home page" adds further entries from that category.
 *   - Ticking "Hide from home page" removes an entry, whatever else says.
 *   - Categories are ordered by how recent their newest work is; entries within
 *     a category are ordered newest first.
 *
 * So the page keeps itself current with no intervention, while still allowing
 * anything to be promoted or suppressed by hand.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const DATA_DIR = path.join(import.meta.dirname, "..", "src", "_data");
// Order here is the tie-break when two categories' newest work is equally recent.
const CATEGORIES = ["articles", "commentary", "media", "reports"];

const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

/**
 * A comparable recency score. Uses the full date when there is one, but only if
 * its year agrees with the entry's year field — dates like
 * "December 2008 / January 2009" span two years and would otherwise sort wrongly.
 */
export function recency(entry = {}) {
  const year = Number(entry.year) || 0;
  let month = 0;
  let day = 0;
  if (entry.date) {
    const text = String(entry.date);
    const yearInDate = text.match(/\b(\d{4})\b/);
    if (yearInDate && Number(yearInDate[1]) === year) {
      const monthName = text.toLowerCase().match(new RegExp(`\\b(${Object.keys(MONTHS).join("|")})\\b`));
      if (monthName) month = MONTHS[monthName[1]];
      const dayNumber = text.match(/\b(\d{1,2})\b/);
      if (dayNumber) day = Number(dayNumber[1]);
    }
  }
  return year * 10000 + month * 100 + day;
}

function read(name) {
  const file = path.join(DATA_DIR, `${name}.yaml`);
  if (!fs.existsSync(file)) return [];
  return yaml.load(fs.readFileSync(file, "utf8")) || [];
}

/** A usable "Position on the home page", or null when there isn't one. */
export function position(entry = {}) {
  const raw = entry.position;
  if (raw === undefined || raw === null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function buildLatest(byCategory, labels = {}) {
  const sections = [];
  const placed = [];   // entries with an explicit position, across all categories

  for (const name of CATEGORIES) {
    const entries = (byCategory[name] || []).filter((e) => e && !e.hidden);
    if (!entries.length) continue;

    const label = labels[name] || name[0].toUpperCase() + name.slice(1);
    const ranked = [...entries].sort((a, b) => recency(b) - recency(a));
    const newest = ranked[0];

    // A position moves an entry to a chosen spot rather than adding a second
    // copy, so numbering the newest item does not pull an extra one in behind it.
    for (const entry of ranked) {
      if (position(entry) !== null) placed.push({ ...entry, label });
    }

    const auto = [];
    if (position(newest) === null) auto.push(newest);
    for (const entry of ranked) {
      if (entry !== newest && entry.featured && position(entry) === null) auto.push(entry);
    }
    if (!auto.length) continue;

    auto.sort((a, b) => recency(b) - recency(a));
    sections.push({ name, label, rank: recency(newest), items: auto });
  }

  sections.sort((a, b) =>
    b.rank - a.rank || CATEGORIES.indexOf(a.name) - CATEGORIES.indexOf(b.name)
  );

  // Numbered entries lead, in ascending order; ties fall back to recency.
  placed.sort((a, b) => position(a) - position(b) || recency(b) - recency(a));

  return [
    ...placed,
    ...sections.flatMap((s) => s.items.map((item) => ({ ...item, label: s.label }))),
  ];
}

export function readCategories() {
  return Object.fromEntries(CATEGORIES.map((n) => [n, read(n)]));
}

export function readLabels() {
  const pages = read("pages") || {};
  return Object.fromEntries(CATEGORIES.map((n) => [n, pages[n]?.nav_title]));
}
