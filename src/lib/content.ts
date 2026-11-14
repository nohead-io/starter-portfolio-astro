// The site's content: the content collections loaded from seed/
// (src/content.config.ts), in the order the pages list them, and the little
// that several pages share. A page reads an entry's data, follows
// its references with getEntry(), and renders its body with render().
import type { ImageMetadata } from "astro"
import { getCollection, getEntries, type CollectionEntry } from "astro:content"

export type Person = CollectionEntry<"people">
export type Category = CollectionEntry<"categories">
export type Post = CollectionEntry<"posts">
export type Project = CollectionEntry<"projects">

/** An image for <Image>: its URL, its size and its alt text. */
export interface Photo {
  src: ImageMetadata
  width: number
  height: number
  alt: string
}

/**
 * The widths every photo is made in, wherever it shows; each image's
 * `sizes` picks one. One list shared by the cards, lists and pages means a
 * photo shown in several places is made once. 1280 covers a phone at 3x;
 * 1600 is the largest, a little under 2x for a post's cover or a gallery
 * photo on a wide screen, which doesn't show in a photo and is a third
 * lighter.
 */
export const WIDTHS = [400, 640, 960, 1280, 1600]

type Asset = { image: ImageMetadata; alt?: string }

/** An image from the seed files as a Photo. Its size is the original's. */
export function photoOf(asset?: Asset): Photo | undefined {
  if (!asset) return undefined
  return { src: asset.image, width: asset.image.width, height: asset.image.height, alt: asset.alt ?? "" }
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

export const formatDate = (date: Date) =>
  date.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
