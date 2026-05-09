# docusaurus-plugin-terminology

## Overview

Terminology/glossary plugin for [Docusaurus](https://github.com/facebook/docusaurus) 3 with:

- glossary generation
- term tooltips
- MDX support
- i18n support
- Tippy.js integration

The idea for this plugin originates from [@grnet/docusaurus-terminology](https://github.com/grnet/docusaurus-terminology). It's based on the same general concept but doesn't rely on webpack and uses a more robust handling of the terms' links.  
It's compatible and tested with Docusaurus 3.7.0.

## Features

- Define terms as Markdown files
- Automatic glossary generation: Automatically generates a glossary page from Markdown files in the `docs/glossary` directory.
- Tooltips on glossary links: Adds tooltips to glossary term links in Markdown files using the `TermTooltip` component.
- Locale-aware glossary support: Supports multiple locales and ensures fallback to the default locale for missing terms.
- Allows customization of term links and tooltips via plugin options.
- Compatible with Docusaurus 3 + React 18
- SSR-safe MDX integration

## Installation

Install the plugin using npm or yarn:

```bash
npm install docusaurus-plugin-terminology
```

or

```bash
yarn add docusaurus-plugin-terminology
```

### Configuration

Add the plugin to `docusaurus.config.js`:

```js
plugins: [
  [
    'docusaurus-plugin-terminology',
    {}
  ]
],
```

---

### Usage

Create a `glossary` directory within `docs` and add Markdown files for your terms in that directory.  
Structure example:

```text
docs/
└── glossary/
    ├── ai.md
    ├── css.md
    ├── ftp.md
    ├── html.md
    ├── …
    ├── …
    └── www.md
```

### Example Term File

Each file should contain metadata in the frontmatter:

```yaml
---
title: AI - »Artificial Intelligence«
description: Intelligence of machines.
---
```
```markdown
The capability of computational systems to perform tasks typically associated with human intelligence, such as learning, reasoning, problem-solving, perception, and decision-making. It is a field of research in engineering, mathematics and computer science that develops and studies methods and software that enable machines to perceive their environment and use learning and intelligence to take actions that maximize their chances of achieving defined goals.  

*From [Artificial intelligence - Wikipedia](https://en.wikipedia.org/wiki/Artificial_intelligence#Techniques)*

```

### Use Term Links in Markdown

Link to terms in your Markdown files using the `/docs/glossary/TERM_SLUG` format.  
Example:

```markdown
[AI](/docs/glossary/ai)
```

The plugin will automatically transform these links into tooltips.

## Components

### Glossary Page

The plugin provides a `Glossary` component that displays all glossary terms grouped alphabetically. You can use this component in your custom pages.

### Term Tooltip

The `TermTooltip` component is used to display tooltips for glossary terms. It is automatically applied to term links in Markdown files.

#### Styling

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

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the plugin.

## Acknowledgments

This plugin is inspired by [@grnet/docusaurus-terminology](https://github.com/grnet/docusaurus-terminology) and aims to provide a more robust and modern implementation.
