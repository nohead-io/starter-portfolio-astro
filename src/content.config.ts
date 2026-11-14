// The site's content as Astro content collections, loaded from the files in
// seed/ when the site builds (and when `astro dev` starts). Each collection's
// schema says what its entries hold, so Astro checks every file against it.
import { defineCollection, reference, z } from "astro:content"
import { file, glob } from "astro/loaders"
import { parse } from "yaml"

/** A YAML list, each entry's ID its slug and its order its place in the list. */
const listed = (path: string) =>
  file(path, {
    parser: (text) =>
      (parse(text) as { slug: string }[]).map((entry, i) => ({ id: entry.slug, order: i + 1, ...entry })),
  })

export const collections = {
  people: defineCollection({
    loader: listed("seed/people.yaml"),
    schema: ({ image }) =>
      z.object({
        name: z.string(),
        slug: z.string(),
        role: z.string(),
        studio: z.string(),
        bio: z.string(),
        portrait: z.object({ image: image() }),
        website: z.string().url().optional(),
        order: z.number(),
      }),
  }),
  categories: defineCollection({
    loader: listed("seed/categories.yaml"),
    schema: z.object({
      name: z.string(),
      slug: z.string(),
      description: z.string().optional(),
      order: z.number(),
    }),
  }),
  // A Markdown body is the entry's rendered content, for render().
  posts: defineCollection({
    loader: glob({ pattern: "*.md", base: "seed/posts" }),
    schema: ({ image }) =>
      z.object({
        title: z.string(),
        slug: z.string(),
        date: z.coerce.date(),
        category: reference("categories"),
        authors: z.array(reference("people")),
        summary: z.string(),
        cover: z.object({ image: image(), alt: z.string() }).optional(),
        tags: z.array(z.string()).default([]),
      }),
  }),
  projects: defineCollection({
    loader: glob({ pattern: "*.md", base: "seed/projects" }),
    schema: ({ image }) =>
      z.object({
        title: z.string(),
        slug: z.string(),
        client: z.string(),
        year: z.number(),
        location: z.string(),
        order: z.number(),
        services: z.array(z.string()),
        summary: z.string(),
        gallery: z.array(z.object({ image: image(), alt: z.string() })),
        testimonial_quote: z.string().optional(),
        testimonial_name: z.string().optional(),
        testimonial_role: z.string().optional(),
      }),
  }),
  pages: defineCollection({
    loader: glob({ pattern: "*.md", base: "seed/pages" }),
    schema: ({ image }) =>
      z.object({
        title: z.string(),
        slug: z.string(),
        description: z.string(),
        photo: z.object({ image: image(), alt: z.string() }).optional(),
      }),
  }),
}
