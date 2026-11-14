# Nohead portfolio starter

![The starter's homepage: “We design buildings, old and new.” above two black-and-white photos of buildings, The Accordion and Støb](.github/preview.webp)

A portfolio with a journal, built with [Astro](https://astro.build) for content kept in [Nohead](https://nohead.io): a studio's projects, each with a photo gallery, a case study and a client's quote, and a journal of posts with authors, categories, search and an RSS feed. Copy it, connect it to your own Nohead project, and replace the story with your own.

The demo is Long Section, an invented architecture studio, with its people, clients, projects and journal.

## What it shows

- **The content model as code**, in [`nohead.schema.yaml`](nohead.schema.yaml).
- **Projects** with a gallery (a field holding a list of images, each with alt text) and a client's quote.
- **Posts** with one or two authors, a category, tags and a cover; **people** with their own pages; **pages** like About and the Colophon.
- **Images** in every size and crop the design needs, from one uploaded original.
- **Search** across the journal, opened with ⌘K, Ctrl+K or `/`.
- **An RSS feed**, a sitemap, link previews (Open Graph), and pages prerendered at build time and prefetched as you point at a link.

At this step the site reads its content from [`seed/`](seed), as Astro content collections ([`src/content.config.ts`](src/content.config.ts)).

## Step by step

This repository's history builds the site one step at a time. It starts with a plain Astro site reading its content from [`seed/`](seed) (Markdown, YAML and the images) as content collections, and each commit after it moves one thing onto Nohead:

1. A portfolio reading seed files as content collections
2. The content model as code
3. A seed script for the demo content
4. Swapping in Nohead's Astro loader, with no page changing
5. Images from Nohead's image CDN
6. Search with Nohead's public search
7. Deploying to Cloudflare or Vercel
8. Rebuilding when content is published

Every step builds the same site; `git log --reverse` lists them.

## Keys and tokens

Sign up at [nohead.io](https://nohead.io) and create a project, then make these in its web app. You can change a key's scopes later, on the **API keys** page, but not **Published records only**, which is set when the key is created:

- **A setup key**, from the **API keys** page, for you: it pushes the schema. Give it `schema:read` and `schema:write`, with **Published records only** off. It can change your project, so keep it out of the site and the repository.

## Push the schema

Work in a clone of this repository, with Node 22.23.4 or newer and [pnpm](https://pnpm.io). [`nohead.schema.yaml`](nohead.schema.yaml) is the content model: people, categories, posts, projects and pages. Push it with the [Nohead CLI](https://github.com/nohead-io/nohead-cli), a dev dependency here (anywhere else, `npx nohead`). The CLI reads the [setup key](#keys-and-tokens) from `NOHEAD_API_KEY` in your terminal:

```bash
pnpm install
export NOHEAD_API_KEY=nohead_sk_...
pnpm nohead schema push --yes   # creates the collections and fields
```

The collections start empty. Add your own people, categories, posts, projects and pages in Nohead and publish them. The header and footer link to two pages by slug, `about` and `colophon`.

## Development

Work in the same clone ([above](#push-the-schema)):

```bash
pnpm install
pnpm dev        # http://localhost:4322
pnpm build      # the static site, in dist/
pnpm check      # types, in .astro files too
pnpm format     # Prettier, .astro files included
```

The same checks and a build run on every push and pull request ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

Set `SITE_URL` to the deployed address when you build for production (`SITE_URL=https://example.com pnpm build`): the feed, canonical links and link-preview images are absolute URLs built from it. Without it the build warns and uses `http://localhost:4322`.

## Credits

The typefaces are [Inter Tight](https://fonts.google.com/specimen/Inter+Tight) and [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3), under the SIL Open Font License. The photographs come from [Unsplash](https://unsplash.com) and the people's portraits from [UI Faces](https://uifaces.co); [`seed/images/README.md`](seed/images/README.md) credits each one.

## License

[MIT](LICENSE). The photographs and portraits keep their own licenses, listed in the credits.
