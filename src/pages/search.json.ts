// The search index: every post's words and a thumbnail, fetched once by the
// search box the first time it opens. With Nohead the box asks the project's
// search instead (a public search token), and this file goes away.
import { getImage } from "astro:assets"
import { getEntry } from "astro:content"
import { authorsOf, formatDate, photoOf, posts } from "../lib/content"

export async function GET() {
  const index = await Promise.all(
    posts.map(async (post) => {
      const { title, summary, slug, date, tags } = post.data
      const category = await getEntry(post.data.category)
      const authors = (await authorsOf(post)).map((author) => author.data.name)
      const cover = photoOf(post.data.cover)
      return {
        slug,
        title,
        summary,
        category: category ? { name: category.data.name, slug: category.data.slug } : null,
        meta: `${formatDate(date)} · ${authors.join(" and ")}`,
        thumb: cover
          ? (await getImage({ ...cover, width: 144, height: 108, fit: "cover", format: "webp" })).src
          : null,
        text: [title, summary, category?.data.name ?? "", ...(tags ?? []), ...authors]
          .join(" ")
          .toLowerCase(),
      }
    })
  )
  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json" },
  })
}
