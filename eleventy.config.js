import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import sharp from "sharp";

// Thumbnails display at 84 CSS px, so 320 comfortably covers 2x screens.
const MAX_IMAGE_WIDTH = 320;
const JPEG_QUALITY = 78;

/**
 * The `dir.output` handed to eleventy.after is the *configured* output directory and
 * ignores a `--output` override on the command line, so trusting it means silently
 * processing the wrong folder. Derive the real root from a written file instead.
 */
function resolveOutputDir(dir, results) {
  const first = results?.[0];
  if (!first?.outputPath || typeof first.url !== "string") return dir.output;
  let rel = first.url.replace(/^\//, "");
  if (rel === "" || rel.endsWith("/")) rel += "index.html";
  return first.outputPath.endsWith(rel)
    ? first.outputPath.slice(0, -rel.length)
    : dir.output;
}

export default function (eleventyConfig) {
  // Let _data/*.yaml be read as data files (Eleventy handles JSON/JS natively, not YAML).
  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Downsize images in the built output so that a large file uploaded through the CMS
  // cannot degrade the site. Runs on the copied output rather than as an <img> transform,
  // because the transform plugin resolves src against the input dir and so breaks under
  // pathPrefix (it rewrote /ahsfarmer/assets/... to src/ahsfarmer/assets/...).
  // SVGs are left alone — they are already tiny and scale perfectly.
  eleventyConfig.on("eleventy.after", async ({ dir, results }) => {
    const imgDir = path.join(resolveOutputDir(dir, results), "assets", "img");
    if (!fs.existsSync(imgDir)) return;

    let processed = 0;
    let saved = 0;
    for (const name of fs.readdirSync(imgDir)) {
      if (!/\.(jpe?g|png)$/i.test(name)) continue;
      const file = path.join(imgDir, name);
      try {
        const before = fs.statSync(file).size;
        const image = sharp(file, { failOn: "none" });
        const { width } = await image.metadata();
        if (!width || width <= MAX_IMAGE_WIDTH) continue;

        const isPng = /\.png$/i.test(name);
        const buffer = await image
          .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
          .toFormat(isPng ? "png" : "jpeg",
            isPng ? { compressionLevel: 9 } : { quality: JPEG_QUALITY, mozjpeg: true })
          .toBuffer();

        if (buffer.length < before) {
          fs.writeFileSync(file, buffer);
          processed++;
          saved += before - buffer.length;
        }
      } catch (err) {
        // A corrupt upload should never break the build — leave the file as-is.
        console.warn(`[images] could not process ${name}: ${err.message}`);
      }
    }
    if (processed) {
      console.log(`[images] resized ${processed} file(s), saved ${(saved / 1024).toFixed(0)} KB`);
    }
  });

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

  // The local dev server always serves from the root, so it must always build with a "/"
  // prefix — otherwise a previous production build (which uses "/ahsfarmer/") leaves
  // stale, wrongly-prefixed HTML in _site and every asset 404s on localhost.
  const isLocal = ["serve", "watch"].includes(process.env.ELEVENTY_RUN_MODE);

  return {
    // "/" locally and on a custom domain; "/ahsfarmer/" on the GitHub project page,
    // set by the deploy workflow. This is the only thing that changes at domain cutover.
    pathPrefix: isLocal ? "/" : process.env.PATH_PREFIX || "/",
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
