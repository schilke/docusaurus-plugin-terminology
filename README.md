# docusaurus-plugin-terminology

[![npm version](https://img.shields.io/npm/v/docusaurus-plugin-terminology?style=flat-square&logo=npm)](https://www.npmjs.com/package/docusaurus-plugin-terminology)
[![npm downloads](https://img.shields.io/npm/dm/docusaurus-plugin-terminology?style=flat-square)](https://www.npmjs.com/package/docusaurus-plugin-terminology)
[![CI](https://github.com/schilke/docusaurus-plugin-terminology/actions/workflows/ci.yml/badge.svg)](https://github.com/schilke/docusaurus-plugin-terminology/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/docusaurus-plugin-terminology?style=flat-square)](./LICENSE)
[![SLSA provenance](https://img.shields.io/badge/SLSA%20provenance-signed-blue?style=flat-square)](https://www.npmjs.com/package/docusaurus-plugin-terminology)

**▶️ [See it in action](https://schilke.github.io/docusaurus-plugin-terminology/)** — a live demo built from [`examples/site`](./examples/site) and deployed to GitHub Pages.

Terminology & glossary support for [Docusaurus 3](https://docusaurus.io):

- 📄 **Term pages** — each term is a Markdown/MDX file rendered as its own page.
- 💬 **Link tooltips** — links to terms are automatically enhanced with a
  definition tooltip. **Zero configuration**, SSR-safe (the link is in the HTML).
- 🔤 **Glossary page** — an A–Z glossary generated from your term files.
- 🌍 **i18n** — locale-aware terms with fallback to the default locale.
- ⚛️ **React 18 & 19**, Docusaurus 3.7 → 3.10.

```md
Check out [AI](/terms/ai) for more details.
```

renders a normal link that also shows the term's description on hover:

> Check out <ins>AI</ins><sup>*</sup> *— Artificial Intelligence: the simulation
> of human intelligence processes by machines.*

## Compatibility

| Package | Supported |
| --- | --- |
| Docusaurus | `3.7` – `3.10` (tested against `3.10.2`) |
| React | `18` and `19` |
| Node.js | `18+` (Docusaurus `3.10` itself requires `20+`) |

Both `.md` and `.mdx` term files are supported.

## Installation

```bash
npm install docusaurus-plugin-terminology
```

## Quick start

The package's default export is a **preset**. Register it **after** the classic
preset so its theme wins theme resolution (this is what makes tooltips work
without any extra configuration):

```js title="docusaurus.config.js"
module.exports = {
  presets: [
    ['classic', { /* ... your options ... */ }],
    [
      'docusaurus-plugin-terminology',
      {
        termsDir: 'terms',        // top-level directory, default: 'terms'
        routeBasePath: '/terms/', // public URL, default: '/terms/'
      },
    ],
  ],
};
```

Then create a `terms/` directory at the root of your site:

```text
.
├── docs/
│   └── glossary.md   # a page rendering <Glossary />
├── terms/
│   ├── ai.md
│   ├── css.md
│   └── ftp.md
└── docusaurus.config.js
```

```md title="terms/ai.md"
---
title: AI
description: Artificial Intelligence — the simulation of human intelligence processes by machines.
---

Artificial intelligence (AI) is the simulation of human intelligence processes
by computer systems.
```

Term pages are now available at `/terms/ai`, `/terms/css`, … and linking to
them from anywhere in your Markdown shows a tooltip:

```md
See [AI](/terms/ai) and [CSS](/terms/css).
```

## Glossary page

Add a docs page (anywhere in your `docs/`) that renders the glossary component:

```mdx title="docs/glossary.md"
---
id: glossary
title: Glossary
---

import Glossary from '@theme/Glossary';

<Glossary />
```

`<Glossary />` displays every term (grouped A–Z) with its description and a link
to its term page.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `termsDir` | `string` | `'terms'` | Directory containing the term files, relative to the site root. |
| `routeBasePath` | `string` | `'/terms/'` | Public URL prefix of the generated term pages, also used to detect term links. |
| `docsInstance` | `boolean` | `true` | Register a dedicated docs instance for the term pages. Set to `false` for [legacy mode](#legacy-mode). |
| `hideTermsFromSidebar` | `boolean` | `false` | Legacy mode only: write a `_category_.yml` hiding the term docs from the main sidebar. |
| `sidebarLabel` | `string` | `'Glossary'` | Legacy mode only: label of the hidden sidebar category. |
| `glossarySlug` | `string` | `'glossary'` | Legacy mode only: doc id of the glossary page the hidden category links to. |

Invalid options throw a descriptive error at build time.

## How it works

1. A dedicated `@docusaurus/plugin-content-docs` instance (id `terminology`)
   renders the files in `termsDir` at `routeBasePath` — no sidebar, no docs
   ordering surprises.
2. The terminology plugin reads the same files and exposes a locale-aware
   glossary (name + short description) as global plugin data.
3. The terminology theme overrides the MDX `a` component. A normal Markdown link
   is delegated to Docusaurus, while a link pointing at `routeBasePath` is
   rendered as `<TermTooltip>` with the glossary description. Because this
   happens at render time, the link is part of the server-rendered HTML and no
   remark plugin, `MDXComponents` swizzle, or DOM scanning is required.

> **Why register the preset after `classic`?** Docusaurus resolves
> `@theme/MDXComponents/A` by theme priority. Listing the terminology preset
> last makes its theme the highest-priority provider, which is what lets it
> override the link component.

## Descriptions

The tooltip text is taken from `description` in the frontmatter when present,
otherwise from the first paragraph of the term body (Markdown is stripped and
the result is truncated). `summary` and `excerpt` are also accepted as
frontmatter aliases.

## i18n

Localized term files are picked up automatically. Supported locations:

```text
i18n/<locale>/<termsDir>/                                   # e.g. i18n/de/terms/ai.md
i18n/<locale>/docusaurus-plugin-content-docs-terminology/current/
```

Missing localized terms fall back to the default locale, so you only translate
what you need.

## Styling

Term links use a dotted underline and a tippy.js tooltip. Override the look with
plain CSS:

```css
.tippy-box[data-theme~='terminology'] {
  /* your styles */
}
```

## Legacy mode (`0.1.x` layout)

If your terms live **inside** `docs/` (e.g. `docs/terms/ai.md`) you can keep that
layout:

```js
presets: [
  ['classic', { /* ... */ }],
  [
    'docusaurus-plugin-terminology',
    {
      docsInstance: false,
      termsDir: 'terms',          // -> docs/terms
      routeBasePath: '/docs/terms/',
      hideTermsFromSidebar: true, // hide the term docs in the sidebar
    },
  ],
],
```

## Migrating from `0.1.x`

`0.2.0` is a breaking release:

1. **Registration changed**: the package is now a preset (registered in
   `presets`) instead of a plugin (in `plugins`).
2. **Terms moved to the top level**: move `docs/terms/` to `terms/` and set
   `routeBasePath: '/terms/'`. (Or keep the old layout with `docsInstance: false`.)
3. **Links changed**: update links from `/docs/terms/<slug>` to `/terms/<slug>`.
4. **Tooltips are zero-config**: the fragile client-side `theme/tooltip.js`
   module was removed — nothing to configure.

## Development

```bash
npm install          # install dev dependencies
npm test             # unit tests (Jest)

cd examples/site
npm install
npm start            # http://localhost:3000/docusaurus-plugin-terminology/
npm run build        # production build (regression check)
```

The demo site in [`examples/site`](./examples/site) is the integration test: it
builds on every CI run against a Docusaurus × React matrix.

## Contributing

Issues and pull requests are welcome.

## License

MIT — see [LICENSE](./LICENSE).

## Acknowledgments

Inspired by [@grnet/docusaurus-terminology](https://github.com/grnet/docusaurus-terminology).
