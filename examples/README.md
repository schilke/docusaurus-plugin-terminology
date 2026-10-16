# Examples

- [`site/`](./site) — a full Docusaurus 3 demo used as the plugin's integration
  test. It defines terms in a top-level `terms/` directory, renders a generated
  glossary page and links to terms with tooltips.

```bash
cd site
npm install
npm start        # http://localhost:3000/docusaurus-plugin-terminology/
npm run build    # production build (regression check)
```

The demo is deployed to GitHub Pages by
[`.github/workflows/deploy-demo.yml`](../.github/workflows/deploy-demo.yml).
