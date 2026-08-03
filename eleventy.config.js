import yaml from "js-yaml";

export default function (eleventyConfig) {
  // Let _data/*.yaml be read as data files (Eleventy handles JSON/JS natively, not YAML).
  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Join several lists into one. Nunjucks' "+" coerces arrays to strings, so this
  // filter exists to make concatenation explicit and safe.
  eleventyConfig.addFilter("concat", (...lists) =>
    [].concat(...lists.filter(Array.isArray))
  );

  // Group a list of entries into [{ year, items }], newest year first.
  eleventyConfig.addFilter("byYear", (entries = []) => {
    if (!Array.isArray(entries)) {
      throw new Error(
        `byYear expected a list but got ${typeof entries}. ` +
          `If you combined lists with "+", use the "concat" filter instead.`
      );
    }
    const groups = new Map();
    for (const entry of entries) {
      const year = String(entry.year ?? "Undated");
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year).push(entry);
    }
    return [...groups.entries()]
      .sort((a, b) => {
        if (a[0] === "Undated") return 1;
        if (b[0] === "Undated") return -1;
        return Number(b[0]) - Number(a[0]);
      })
      .map(([year, items]) => ({ year, items }));
  });

  eleventyConfig.addFilter("where", (entries = [], key, value) =>
    entries.filter((entry) => entry[key] === value)
  );

  eleventyConfig.addFilter("featured", (entries = []) =>
    entries.filter((entry) => entry.featured)
  );

  // Tag each entry with the section it came from, for the "Latest" list on the home page.
  eleventyConfig.addFilter("withLabel", (entries = [], label) =>
    entries.map((entry) => ({ ...entry, label }))
  );

  return {
    // "/" locally and on a custom domain; "/ahsfarmer/" on the GitHub project page.
    // Set by the deploy workflow. This is the only thing that changes at domain cutover.
    pathPrefix: process.env.PATH_PREFIX || "/",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
}
