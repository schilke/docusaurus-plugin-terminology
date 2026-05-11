# docusaurus-plugin-terminology


## Overview

Terminology/glossary plugin for [Docusaurus](https://github.com/facebook/docusaurus) 3 with:

- glossary generation
- term tooltips
- MDX support (Built on MDX AST transformations instead of raw HTML replacement for improved Docusaurus 3 compatibility)
- i18n support
- Tippy.js integration

This plugin is inspired by [@grnet/docusaurus-terminology](https://github.com/grnet/docusaurus-terminology). It's based on the same general concept but uses MDX remark transformations instead of webpack loader injection and uses a more robust handling of the terms' links.  
Compatible with Docusaurus 3.x and React 18.  
Tested with Docusaurus 3.7.0.


## Features

- Define terms as Markdown files.
- Glossary component: Automatic glossary data aggregation from Markdown term files in `docs/glossary`.
- Tooltips on glossary links: Automatically transforms glossary links into interactive tooltip components.
- Locale-aware glossary support: Supports multiple locales and ensures fallback to the default locale for missing terms.
- Compatible with Docusaurus 3 + React 18
- SSR-safe MDX integration


## Compatibility

| Package | Version |
|---|---|
| Docusaurus | 3.7.0+ |
| React | 18+ |
| Node.js | 18+ recommended |

The plugin supports `.md` and `.mdx` files.


## Installation

Install the plugin using npm or yarn:

```bash
npm install docusaurus-plugin-terminology
```

or

```bash
yarn add docusaurus-plugin-terminology
```


## Configuration

Add the plugin to `docusaurus.config.js`:

```js
plugins: [
  [
    'docusaurus-plugin-terminology',
    {
      // options
      termsDir: 'terms', // default: 'terms'
      routeBasePath: '/docs/terms/', // default: '/docs/terms/'
      hideTermsFromSidebar: true, // when true, plugin will create _category_.yml to hide individual term pages
    }
  ]
],
```

---

## Usage

### Defining terms

Create a `terms` directory within `docs` (the plugin default).

Add Markdown files for your terms in that directory.  
Structure example:

```text
docs/
├── terms/           # terms definitions
│   ├── ai.md
│   ├── css.md
│   ├── ftp.md
│   ├── html.md
│   └── ...
└── terms.md         # glossary page (id: glossary)
```


#### Example Term File

Each file should contain metadata in the frontmatter:

```yaml
---
title: AI - »Artificial Intelligence«
description: Intelligence of machines.
---
```
```markdown
The capability of computational systems to perform tasks typically associated with human 
intelligence, such as learning, reasoning, problem-solving, perception, and decision-making. 
It is a field of research in engineering, mathematics and computer science that develops and 
studies methods and software that enable machines to perceive their environment and use 
learning and intelligence to take actions that maximize their chances of achieving defined goals.  

*From [Artificial intelligence - Wikipedia](https://en.wikipedia.org/wiki/Artificial_intelligence#Techniques)*

```

### Linking terms

Link to terms in your Markdown files using the `/docs/terms/TERM_SLUG` format (or adjust to your `termsDir`).  
Example:

```markdown
[AI](/docs/terms/ai)
```

The plugin will automatically transform these links into tooltips.


### Glossary Page

The plugin provides a `Glossary` component that displays all glossary terms grouped alphabetically. You can use this component in your custom pages.

#### Create a glossary page

E.g. `glossary.md` (the file name doesn't matter)

```markdown
---
id: glossary
title: Glossary
---

import Glossary from '@theme/Glossary';

<Glossary />
```

### i18n

Localized term definitions can be placed in:

```text
i18n/de/docusaurus-plugin-content-docs/current/terms/
```


## How it works

1. The plugin scans `docs/terms` (or the directory configured via `termsDir`)
2. Term metadata is extracted from frontmatter
3. Markdown links matching `/docs/terms/*` (or matching your `routeBasePath`) are transformed into MDX tooltip components
4. Generates a static glossary JSON data source for tooltip rendering
5. Glossary data is exposed globally to Docusaurus theme components


### Internal Architecture
Markdown links
↓
remark plugin transformation
↓
<TermTooltip />
↓
MDX component mapping
↓
Tippy.js tooltip rendering


### Styling

Override tooltip styles via CSS.


## File Structure

The plugin's file structure is as follows:

```
docusaurus-plugin-terminology
    ├── remark
    │   └── term-link-transformer.js
    ├── theme
    │   ├── Glossary.jsx
    │   └── tooltip.js
    ├── index.js
    ├── LICENSE
    └── README.md
```

- `remark/term-link-transformer.js`: Transforms glossary term links in Markdown files into `TermTooltip` components.
- `theme/Glossary.jsx`: Renders the glossary page.
- `theme/tooltip.js`: Handles tooltips for glossary terms.
- `index.js`: Main plugin entry point.


## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the plugin.


## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.


## Acknowledgments

This plugin is inspired by [@grnet/docusaurus-terminology](https://github.com/grnet/docusaurus-terminology) and aims to provide a more robust and modern implementation.
