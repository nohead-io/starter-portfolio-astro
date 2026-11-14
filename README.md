# Nohead portfolio starter

![The starter's homepage: “We design buildings, old and new.” above two black-and-white photos of buildings, The Accordion and Støb](.github/preview.webp)

A portfolio with a journal, built with [Astro](https://astro.build) on [Nohead](https://nohead.io). It's a showcase of what Nohead does in a real site and a reference for building one with it: deploy it as it is, with the demo content or your own, or clone it and modify it into your own site.

The demo is Long Section, an invented architecture studio, with its people, clients, projects and journal.

## What it shows

- **The content model as code**, in [`nohead.schema.yaml`](nohead.schema.yaml).
- **Content collections** loaded from Nohead when the site builds, by Nohead's Astro loader, [`@nohead/astro`](https://github.com/nohead-io/nohead-astro) ([`src/content.config.ts`](src/content.config.ts)), and shaped for the pages in [`src/lib/content.ts`](src/lib/content.ts): every page asks that module for what it shows.
- **Projects** with a gallery (a field holding a list of images, each with alt text) and a client's quote.
- **Posts** with one or two authors, a category, tags and a cover; **people** with their own pages; **pages** like About and the Colophon.
- **Images** in every size and crop the design needs, from one uploaded original, straight from Nohead's image CDN through `@nohead/astro`'s image service, so the build never downloads one.
- **Search** across the journal as you type, straight against Nohead's public search, opened with ⌘K, Ctrl+K or `/`. Each result shows its cover and authors from the search hit itself, as the posts' search options in [`nohead.schema.yaml`](nohead.schema.yaml) set.
- **Rebuilds on publish**, an RSS feed, a sitemap, link previews (Open Graph), and pages prerendered at build time and prefetched as you point at a link.

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

- **A setup key**, from the **API keys** page, for you: it pushes the schema, seeds the demo content and creates the rebuild webhook. Give it `schema:read`, `schema:write`, `records:read`, `records:write`, `assets:write` and `webhooks:write`, with **Published records only** off. It can change your project, so keep it out of the site and the repository.
- **A site key**, from the **API keys** page, for builds: set it as `NOHEAD_API_KEY` wherever the site builds. Turn **Published records only** on and give it `records:read` and `assets:read`, plus `schema:read` for search: the build reads the posts' search index name. The site asks for published records only either way, so drafts never reach a build.
- **A search token**, from the **Search tokens** page, optional, as `PUBLIC_NOHEAD_SEARCH_TOKEN`: it finds only published posts, and is public by design, since it goes in the page. Without it the site has no search, and its pages load no search code.

## Push the schema

Work in a clone of this repository, with Node 22.23.4 or newer and [pnpm](https://pnpm.io). [`nohead.schema.yaml`](nohead.schema.yaml) is the content model: people, categories, posts, projects and pages. Push it with the [Nohead CLI](https://github.com/nohead-io/nohead-cli), a dev dependency here (anywhere else, `npx nohead`). The CLI and the seed read the [setup key](#keys-and-tokens) from `NOHEAD_API_KEY` in your terminal:

```bash
pnpm install
export NOHEAD_API_KEY=nohead_sk_...
pnpm nohead schema push --yes   # creates the collections and fields
```

The collections start empty. Add your own people, categories, posts, projects and pages in Nohead and publish them, and the site shows them from its next build. The header and footer link to two pages by slug, `about` and `colophon`.

## Add the demo content (optional)

To start from the demo instead (the Long Section studio's people, posts, projects and photographs), run the seed once with the setup key:

```bash
pnpm seed   # uploads seed/ and publishes it
```

The seed creates what the project doesn't have yet, matched by slug, and never changes what is already there, so it is safe to run again. Edit or delete the demo's records in Nohead as you replace them with your own.

## Deploy

Push the schema first ([above](#push-the-schema)). Builds read these variables:

- `NOHEAD_API_KEY`: the [site key](#keys-and-tokens).
- `SITE_URL`: the site's address, which the feed, canonical links and link previews are built from.
- `PUBLIC_NOHEAD_SEARCH_TOKEN`, for search: the [search token](#keys-and-tokens).

### Deploy to Cloudflare

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/nohead-io/starter-portfolio-astro)

Cloudflare copies the repository and creates the Worker ([`wrangler.jsonc`](wrangler.jsonc)), but its button can't ask for build variables, so the first build fails. Add the variables above in the Worker's **Settings → Build → Build variables and secrets** (`SITE_URL` is its `workers.dev` address or your domain), and retry the build.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnohead-io%2Fstarter-portfolio-astro&env=NOHEAD_API_KEY&envDescription=A%20published-only%20Nohead%20API%20key%20with%20records%3Aread%20and%20assets%3Aread%2C%20plus%20schema%3Aread%20for%20search&envLink=https%3A%2F%2Fgithub.com%2Fnohead-io%2Fstarter-portfolio-astro%23keys-and-tokens)

Vercel asks for the key when you deploy, and `SITE_URL` defaults to the project's production address. For search, add `PUBLIC_NOHEAD_SEARCH_TOKEN` in the project's **Settings → Environment Variables** and redeploy.

### Rebuild when you publish

Pages are built ahead of time, so a change published in Nohead reaches the site with the next build. Create a deploy hook for the site:

- **Cloudflare**: the Worker's **Settings → Build → Deploy Hooks**.
- **Vercel**: the project's **Settings → Git → Deploy Hooks**.

Then add a webhook in Nohead that calls the hook whenever published content changes:

- **In the web app**: **Webhooks → New webhook**, with the hook's URL, **Published content only** on and the record and asset events.
- **With the CLI** and the setup key:

  ```bash
  pnpm nohead webhooks create --url "$DEPLOY_HOOK_URL" --events "record.*,asset.*" --published-only --description "Rebuild the site"
  ```

With **Published content only**, edits to drafts and unpublished records don't start a build. The deploy hook's URL is its own secret: anyone with it can start a build, so keep it out of the repository.

## Development

In the same clone ([above](#push-the-schema)), put the [site key](#keys-and-tokens) in `.env`, plus the search token if you want search:

```bash
printf "NOHEAD_API_KEY=nohead_pk_...\n" > .env   # and PUBLIC_NOHEAD_SEARCH_TOKEN=... for search
pnpm install
pnpm dev        # http://localhost:4322
pnpm build      # the static site, in dist/
pnpm check      # types, in .astro files too (no key needed)
pnpm format     # Prettier, .astro files included
```

The same checks and a build run on every push and pull request ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

Content loads when the dev server starts; to see edits made in Nohead, press `s` and Enter in its terminal.

The entries' types come from [`nohead.schema.yaml`](nohead.schema.yaml), not from the project, so `pnpm check` runs without a key, in CI too. After changing fields in Nohead's web app, pull the file and commit it (`pnpm nohead schema pull`, then restart `pnpm dev`); `pnpm nohead schema diff --exit-code` fails while the file and the project differ.

Without `SITE_URL` the build uses `http://localhost:4322` and warns; set it when you build for production (`SITE_URL=https://example.com pnpm build`).

## Credits

The typefaces are [Inter Tight](https://fonts.google.com/specimen/Inter+Tight) and [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3), under the SIL Open Font License. The photographs come from [Unsplash](https://unsplash.com) and the people's portraits from [UI Faces](https://uifaces.co); [`seed/images/README.md`](seed/images/README.md) credits each one.

## License

[MIT](LICENSE). The photographs and portraits keep their own licenses, listed in the credits.
