import { defineConfig, fontProviders } from "astro/config"
import sitemap from "@astrojs/sitemap"

// The deployed address: feeds, canonical links and social images are
// absolute URLs built from it. Set SITE_URL when you deploy.
const site = process.env.SITE_URL || "http://localhost:4322"
if (!process.env.SITE_URL && process.argv.includes("build")) {
  console.warn(
    "SITE_URL is not set: the feed, canonical links and social images will point at http://localhost:4322."
  )
}

export default defineConfig({
  site,
  output: "static",
  trailingSlash: "never",
  // posts/<slug>.html rather than posts/<slug>/index.html, so pages are
  // served at the same slashless addresses the links use.
  build: { format: "file" },
  integrations: [sitemap()],
  // Quotes and dashes as the content has them, as Nohead keeps rich text.
  markdown: { smartypants: false },
  // A page is fetched while the pointer rests on a link to it, so moving
  // between pages is instant.
  prefetch: { prefetchAll: true },
  // Downloaded at build time and served with the site; the layout preloads
  // them, and the fallbacks are adjusted to their size so the text doesn't
  // shift when they arrive.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Inter Tight",
      cssVariable: "--font-inter-tight",
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Source Sans 3",
      cssVariable: "--font-source-sans",
      weights: ["200 900"],
      styles: ["normal", "italic"],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["system-ui", "sans-serif"],
    },
  ],
})
