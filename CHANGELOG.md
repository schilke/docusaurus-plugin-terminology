# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2026-10-17

### Changed

- Docs only (no code changes): README badges (npm, CI, license, SLSA
  provenance) and a "▶️ See it in action" link to the demo. Republished so the
  [npm page](https://www.npmjs.com/package/docusaurus-plugin-terminology) picks
  up the updated README.

## [0.2.0] - 2026-10-16

### Added

- Zero-configuration, SSR-safe term link tooltips: the theme overrides the MDX
  `a` component and renders term links as `<TermTooltip>`.
- The public entry point is now a **preset** that registers a dedicated
  `@docusaurus/plugin-content-docs` instance (id `terminology`) rendering term
  pages at a top-level route (`/terms/` by default).
- Option validation with descriptive error messages.
- `docsInstance`, `sidebarLabel` and `glossarySlug` options.
- i18n support for the new top-level layout.
- `examples/site`: a Docusaurus demo used as an integration test, plus a GitHub
  Pages deployment workflow.
- CI matrix (Docusaurus `3.7`/`3.10` × React `18`/`19`).
- TypeScript definitions for the preset and options.

### Changed

- Term definitions now live in a **top-level** directory (`terms/`) instead of
  `docs/terms/`.
- Tooltip rendering moved from a client-side DOM-manipulation module to a
  React component rendered during SSR.
- Package metadata: `exports`, `files`, `engines` (`node >= 18`), `sideEffects`.
- `<Glossary />` groups by localized terms with default-locale fallback and uses
  `@docusaurus/Link`.

### Removed

- The client-side `theme/tooltip.js` module (CDN tippy, `MutationObserver`,
  polling, debug badge, history patching).
- The `remark/term-link-transformer.js` remark plugin (replaced by the MDX `a`
  component override).
- Unused dependencies (`@tippyjs/react`, `unist-util-visit`).

### Fixed

- Tooltips no longer depend on a non-existent `extendMarkdownOptions` plugin
  hook, which is why they previously appeared in dev but not in production.
- Term pages no longer require `_category_.yml` hacks to stay out of the docs
  sidebar.

### Migration

See the “Migrating from 0.1.x” section in the [README](./README.md#migrating-from-01x).

## [0.1.0] - 2026-05-11

### Added

- Initial release: glossary data from `docs/terms`, tippy.js tooltips via a
  client module, `<Glossary />` component, `hideTermsFromSidebar` option.
