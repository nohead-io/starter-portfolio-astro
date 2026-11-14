// The site's content: the content collections Nohead's Astro loader fills from
// Nohead (src/content.config.ts), in the order the pages list them, and the
// little that several pages share. A page reads an entry's data, follows
// its references with getEntry(), and renders its body with render().
import type { ImageMetadata } from "astro"
import { getCollection, getEntries, type CollectionEntry } from "astro:content"
import { NOHEAD_API_KEY, PUBLIC_NOHEAD_SEARCH_TOKEN } from "astro:env/server"
import { imageMetadata } from "@nohead/astro"
import { Nohead } from "@nohead/sdk"

export type Person = CollectionEntry<"people">
export type Category = CollectionEntry<"categories">
export type Post = CollectionEntry<"posts">
export type Project = CollectionEntry<"projects">

/**
 * An image for <Image>: the original's image metadata (its URL on Nohead's
 * image CDN), its size and its alt text.
 */
export interface Photo {
  src: ImageMetadata
  width: number
  height: number
  alt: string
}

/**
 * The widths every photo is made in, wherever it shows; each image's
 * `sizes` picks one. Every width is a URL of its own, which Nohead's image
 * CDN makes on the first request and then caches, so one list shared by
 * the cards, lists and pages means a photo shown in several places is made
 * once, and most requests are cache hits. 1280 covers a phone at 3x; 1600
 * is the largest, a little under 2x for a post's cover or a gallery photo
 * on a wide screen, which doesn't show in a photo and is a third lighter.
 */
export const WIDTHS = [400, 640, 960, 1280, 1600]

type Asset = { content_type: string; image_url?: string; width?: number; height?: number; alt?: string }

/**
 * An embedded image asset as a Photo; one not processed yet is none. Its size
 * is the original's, which Astro then knows: no `srcset` width is larger than
 * it, and the image service never makes one larger than the largest of an
 * image's `widths`.
 */
export function photoOf(asset?: Asset): Photo | undefined {
  const src = imageMetadata(asset)
  return src && { src, width: src.width, height: src.height, alt: asset?.alt ?? "" }
}

/** The photos among embedded assets, in order. */
export const photosOf = (assets: Asset[] = []) =>
  assets.map(photoOf).filter((photo): photo is Photo => photo !== undefined)

const byOrder = (a: { data: { order: number } }, b: { data: { order: number } }) =>
  a.data.order - b.data.order

/** The people, in their order on the Team page. */
export const people = (await getCollection("people")).sort(byOrder)

/** The posts, newest first. */
export const posts = (await getCollection("posts")).sort(
  (a, b) => b.data.date.getTime() - a.data.date.getTime()
)

/** The projects, in their order on the homepage. */
export const projects = (await getCollection("projects")).sort(byOrder)

/** The link-preview image for pages without their own: the first project's first photo, as on the homepage. */
export const leadPhoto = photosOf(projects[0]?.data.gallery)[0]

/** The categories with posts, in their order in Nohead. */
export const categories = (await getCollection("categories"))
  .sort(byOrder)
  .filter((category) => posts.some((post) => post.data.category.id === category.id))

export const categoryHref = (category: Category) => `/categories/${category.data.slug}`

/** A post's authors; unpublished people aren't in the collection, so they're left out. */
export const authorsOf = async (post: Post) =>
  (await getEntries(post.data.authors)).filter((author) => author !== undefined)

/** Whether the person wrote, or co-wrote, the post. */
export const byAuthor = (post: Post, person: Person) =>
  post.data.authors.some((author) => author.id === person.id)

/**
 * Public search of the posts: the site's search token and the posts' index.
 * The token is made in Nohead's web app (Search tokens) and is public: it
 * sits in the page. Without one, the site has no search box.
 */
export const search = PUBLIC_NOHEAD_SEARCH_TOKEN
  ? {
      token: PUBLIC_NOHEAD_SEARCH_TOKEN,
      index: await new Nohead({ apiKey: NOHEAD_API_KEY }).collections.searchIndex.get("posts").then(
        (searchIndex) => searchIndex.index,
        (error) => {
          throw new Error(
            "Search needs the posts' search index: give NOHEAD_API_KEY the schema:read scope, or unset PUBLIC_NOHEAD_SEARCH_TOKEN to build without search.",
            { cause: error }
          )
        }
      ),
    }
  : undefined
if (!search) console.warn("PUBLIC_NOHEAD_SEARCH_TOKEN is not set: the site is built without search.")

export const formatDate = (date: Date) =>
  date.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
