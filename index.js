'use strict';

/**
 * docusaurus-plugin-terminology (preset)
 *
 * Public entry point. Registers:
 *
 *   1. a dedicated `@docusaurus/plugin-content-docs` instance rendering the
 *      term definitions under a top-level route (default `/terms/`);
 *   2. the terminology content plugin (glossary data + legacy sidebar hiding);
 *   3. the terminology theme (MDX link tooltips + `<Glossary />`).
 *
 * Usage (order matters — keep it *after* the classic preset so that the
 * terminology theme wins the theme resolution):
 *
 * ```js
 * presets: [
 *   ['classic', { ... }],
 *   ['docusaurus-plugin-terminology', { termsDir: 'terms', routeBasePath: '/terms/' }],
 * ],
 * ```
 */

const path = require('path');
const terminologyPlugin = require('./plugin');
const terminologyTheme = require('./theme-plugin');
const {normalizeOptions} = require('./src/options');

const TERMS_DOCS_INSTANCE_ID = 'terminology';
const CONTENT_DOCS_PLUGIN = '@docusaurus/plugin-content-docs';

function toDocsRouteBasePath(routeBasePath) {
  return String(routeBasePath).replace(/^\/+|\/+$/g, '');
}

/**
 * @param {import('@docusaurus/types').LoadContext} context
 * @param {object} [options]
 * @returns {import('@docusaurus/types').Preset}
 */
function terminologyPreset(context, options = {}) {
  const normalized = normalizeOptions(options);

  const plugins = [];

  if (normalized.docsInstance) {
    plugins.push([
      CONTENT_DOCS_PLUGIN,
      {
        id: TERMS_DOCS_INSTANCE_ID,
        path: normalized.termsDir,
        routeBasePath: toDocsRouteBasePath(normalized.routeBasePath),
        // The term pages are standalone: no sidebar at all for this instance.
        sidebarPath: false,
        breadcrumbs: false,
        editUrl: undefined,
      },
    ]);
  }

  plugins.push([terminologyPlugin, normalized]);

  return {
    plugins,
    // Declared as a preset *theme* on purpose: it is evaluated after the
    // classic theme, which is what lets us override `@theme/MDXComponents/A`.
    themes: [terminologyTheme],
  };
}

module.exports = terminologyPreset;
module.exports.default = terminologyPreset;
module.exports.terminologyPreset = terminologyPreset;

// Named exports for advanced/legacy use.
module.exports.plugin = terminologyPlugin;
module.exports.theme = terminologyTheme;

// Handy for tooling/tests.
module.exports.TERMS_DOCS_INSTANCE_ID = TERMS_DOCS_INSTANCE_ID;
module.exports.resolveThemePath = () => path.resolve(__dirname, 'theme');
