// The site's content as Astro content collections, loaded by Nohead's Astro
// loader (`@nohead/astro`) when the site builds (and when `astro dev`
// starts). Each collection's schema and types come from its fields in
// nohead.schema.yaml, so Astro checks every entry against them, and
// `astro check` needs no key. Published records only: drafts never reach a
// build, whatever the key.
import { defineCollection } from "astro:content"
import { NOHEAD_API_KEY } from "astro:env/server"
import { noheadLoader } from "@nohead/astro"

// What every collection's loader takes: the key, and the file the fields come from.
const nohead = { apiKey: NOHEAD_API_KEY, schemaFile: "nohead.schema.yaml" }

export const collections = {
  people: defineCollection({
    loader: noheadLoader({ ...nohead, collection: "people", expand: ["portrait"] }),
  }),
  categories: defineCollection({
    loader: noheadLoader({ ...nohead, collection: "categories" }),
  }),
  // A rich text body is the entry's rendered content, for render().
  posts: defineCollection({
    loader: noheadLoader({ ...nohead, collection: "posts", expand: ["cover"], body: "body" }),
  }),
  projects: defineCollection({
    loader: noheadLoader({ ...nohead, collection: "projects", expand: ["gallery"], body: "case_study" }),
  }),
  pages: defineCollection({
    loader: noheadLoader({ ...nohead, collection: "pages", expand: ["photo"], body: "body" }),
  }),
}
