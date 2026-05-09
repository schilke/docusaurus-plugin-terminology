# @schilke/docusaurus-plugin-terminology

## Overview

This [Docusaurus](https://github.com/facebook/docusaurus) plugin is a complete rewrite of [@grnet/docusaurus-terminology](https://github.com/grnet/docusaurus-terminology). It's based on the same ideas but doesn't rely on webpack and uses a more robust handling of the terms' links.  
It's compatible and tested with Docusaurus 3.7.0.

## Features

- **Glossary Support**: Automatically generates a glossary page from Markdown files in the `docs/glossary` directory.
- **Localized Glossary**: Supports multiple locales and ensures fallback to the default locale for missing terms.
- **Term Tooltip**: Adds tooltips to glossary term links in Markdown files using the `TermTooltip` component.
- **Customizable**: Allows customization of term links and tooltips via plugin options.

## Installation

Install the plugin using npm or yarn:

```bash
npm install @schilke/docusaurus-plugin-terminology
```

or

```bash
yarn add @schilke/docusaurus-plugin-terminology
```

## Usage

### Add the Plugin to Your Docusaurus Config

Update your `docusaurus.config.js` file to include the plugin:

```javascript
module.exports = {
  plugins: [
    [
      '@schilke/docusaurus-plugin-terminology',
      {
        // Optional configuration options
      },
    ],
  ],
};
```

### Create Glossary Files

Add Markdown files for glossary terms in the `docs/glossary` directory. Each file should contain metadata in the frontmatter:

```yaml
---
title: Term Name
description: A brief description of the term.
---

Additional content about the term.
```

### Use Term Links in Markdown

Link to glossary terms in your Markdown files using the `/docs/glossary/TERM_SLUG` format:

```markdown
[Term Name](/docs/glossary/term-name)
```

The plugin will automatically transform these links into tooltips.

## Components

### Glossary Page

The plugin provides a `Glossary` component that displays all glossary terms grouped alphabetically. You can use this component in your custom pages.

### Term Tooltip

The `TermTooltip` component is used to display tooltips for glossary terms. It is automatically applied to term links in Markdown files.

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
