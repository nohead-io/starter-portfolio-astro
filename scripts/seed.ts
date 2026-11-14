// Uploads the demo content in seed/ to a Nohead project and publishes it:
// people, categories, posts, projects and pages, with their images and alt
// text.
//
// Push the schema first, then run it once with a key that can write records
// and assets (records:read, records:write, assets:write):
//
//   pnpm nohead schema push --yes
//   NOHEAD_API_KEY=... pnpm seed
//
// It creates what is missing and leaves records that already exist alone,
// matched by slug, so running it again is safe and never overwrites edits.
import { openAsBlob } from "node:fs"
import { readdir, readFile } from "node:fs/promises"
import { basename, join } from "node:path"
import { Nohead } from "@nohead/sdk"
import { parse } from "yaml"

// The SDK reads NOHEAD_API_KEY itself.
const nohead = new Nohead()
const seed = join(import.meta.dirname, "..", "seed")

/** A Markdown file's YAML front matter and its body. */
async function markdown(path: string) {
  const text = await readFile(path, "utf8")
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text)
  if (!match) throw new Error(`${path} has no front matter`)
  return { data: parse(match[1]!), body: match[2]!.trim() }
}

/** The Markdown files of a seed folder, in file order. */
async function markdownIn(folder: string) {
  const files = (await readdir(join(seed, folder))).filter((file) => file.endsWith(".md")).sort()
  return Promise.all(files.map((file) => markdown(join(seed, folder, file))))
}

/** The record being built's uploads, removed again if it isn't created. */
let uploads: string[] = []

/** Uploads an image a seed file names (its path relative to the file's folder), with its alt text. */
async function upload(folder: string, { image, alt = "" }: { image: string; alt?: string }) {
  const path = join(seed, folder, image)
  const asset = await nohead.assets.upload(await openAsBlob(path), { filename: basename(path), alt })
  uploads.push(asset.id)
  return asset.id
}

/**
 * Creates each record the collection doesn't have yet (by slug), published.
 * Returns every slug's record ID, new and old.
 */
async function sync<T>(
  collection: string,
  items: T[],
  slugOf: (item: T) => string,
  dataOf: (item: T, index: number) => Promise<Record<string, unknown>>
) {
  const ids = new Map<string, string>()
  for await (const record of nohead.records.list(collection)) {
    ids.set(String(record.data.slug), record.id)
  }
  let created = 0
  for (const [index, item] of items.entries()) {
    const slug = slugOf(item)
    if (ids.has(slug)) continue
    uploads = []
    let record
    try {
      record = await nohead.records.create(collection, { data: await dataOf(item, index), publish: true })
    } catch (error) {
      // Don't leave its images behind; the next run uploads them again.
      await Promise.all(uploads.map((id) => nohead.assets.delete(id).catch(() => {})))
      throw error
    }
    ids.set(slug, record.id)
    created++
    console.log(`  + ${collection}/${slug}`)
  }
  console.log(`${collection}: ${created} created, ${items.length - created} already there`)
  return ids
}

interface Person {
  slug: string
  name: string
  role: string
  studio: string
  bio: string
  portrait: { image: string }
  website?: string
}

const people = await sync(
  "people",
  parse(await readFile(join(seed, "people.yaml"), "utf8")) as Person[],
  (person) => person.slug,
  async (person, i) => ({
    name: person.name,
    slug: person.slug,
    role: person.role,
    studio: person.studio,
    bio: person.bio,
    // Decorative: the name is always beside it.
    portrait: await upload(".", person.portrait),
    website: person.website,
    order: i + 1,
  })
)

interface Category {
  name: string
  slug: string
  description?: string
}

const categoryList = parse(await readFile(join(seed, "categories.yaml"), "utf8")) as Category[]
const categories = await sync(
  "categories",
  categoryList,
  (category) => category.slug,
  async (category, i) => ({ ...category, order: i + 1 })
)

/** The record ID of the entry a seed file names by slug. */
function idOf(ids: Map<string, string>, slug: string, what: string) {
  const id = ids.get(slug)
  if (!id) throw new Error(`${what} "${slug}" isn't in seed/.`)
  return id
}

await sync(
  "posts",
  await markdownIn("posts"),
  ({ data }) => data.slug,
  async ({ data, body }) => ({
    title: data.title,
    slug: data.slug,
    date: data.date,
    category: idOf(categories, data.category, `Post ${data.slug}'s category`),
    authors: (data.authors as string[]).map((slug) => idOf(people, slug, `Post ${data.slug}'s author`)),
    summary: data.summary,
    cover: data.cover && (await upload("posts", data.cover)),
    body,
    tags: data.tags ?? [],
  })
)

await sync(
  "projects",
  await markdownIn("projects"),
  ({ data }) => data.slug,
  async ({ data, body }) => {
    const gallery: string[] = []
    for (const item of data.gallery as { image: string; alt: string }[]) {
      gallery.push(await upload("projects", item))
    }
    return {
      title: data.title,
      slug: data.slug,
      client: data.client,
      year: data.year,
      location: data.location,
      order: data.order,
      services: data.services,
      summary: data.summary,
      gallery,
      case_study: body,
      testimonial_quote: data.testimonial_quote,
      testimonial_name: data.testimonial_name,
      testimonial_role: data.testimonial_role,
    }
  }
)

await sync(
  "pages",
  await markdownIn("pages"),
  ({ data }) => data.slug,
  async ({ data, body }) => ({
    title: data.title,
    slug: data.slug,
    description: data.description,
    photo: data.photo && (await upload("pages", data.photo)),
    body,
  })
)
