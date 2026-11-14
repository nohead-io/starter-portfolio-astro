import rss from "@astrojs/rss"
import type { APIContext } from "astro"
import { getEntry } from "astro:content"
import { authorsOf, posts } from "../lib/content"

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export async function GET(context: APIContext) {
  const items = await Promise.all(
    posts.map(async (post) => {
      const category = await getEntry(post.data.category)
      return {
        title: post.data.title,
        link: `/posts/${post.data.slug}`,
        pubDate: post.data.date,
        description: post.data.summary,
        categories: [...(category ? [category.data.name] : []), ...(post.data.tags ?? [])],
        customData: (await authorsOf(post))
          .map((author) => `<dc:creator>${escape(author.data.name)}</dc:creator>`)
          .join(""),
      }
    })
  )
  return rss({
    title: "Long Section Journal",
    description:
      "Notes from Long Section, an architecture studio. Long Section is fictional: this is a demo of a Nohead portfolio starter.",
    site: context.site!,
    // The site's addresses have no trailing slash (astro.config.mjs).
    trailingSlash: false,
    // RSS's own <author> takes an email address; names go in dc:creator.
    xmlns: { dc: "http://purl.org/dc/elements/1.1/" },
    items,
    customData: "<language>en</language>",
  })
}
