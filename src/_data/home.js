// Eleventy data file. MUST have a default export and nothing else — adding a named
// export makes Eleventy hand the template the whole module namespace instead of
// calling this function, which silently empties the home page.
// The logic lives in scripts/home-latest.js so it can be imported by tests.
import { buildLatest, readCategories, readLabels } from "../../scripts/home-latest.js";

export default function () {
  return { latest: buildLatest(readCategories(), readLabels()) };
}
