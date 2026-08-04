/**
 * Configuration for src/about.md.
 *
 * It lives here rather than in that file's front matter because Pages CMS rebuilds
 * front matter from the fields declared in .pages.yml and silently drops anything
 * else. When the About page was edited through the editor it lost its layout,
 * permalink and title, and rendered as an unstyled fragment.
 *
 * Keeping it here means about.md can be nothing but prose, and the editor is free
 * to rewrite that file however it likes.
 */
export default {
  layout: "page.njk",
  permalink: "/about/",
  eleventyComputed: {
    title: (data) => data.pages?.about?.nav_title || "About",
    heading: (data) => data.pages?.about?.heading || "About",
    description: (data) => data.pages?.about?.seo || data.site?.description,
  },
};
