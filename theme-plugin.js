'use strict';

/**
 * docusaurus-plugin-terminology/theme-plugin.js
 *
 * A tiny theme-only plugin whose sole job is to expose the package's `theme/`
 * directory to Docusaurus.
 *
 * It is registered by the preset under `themes`, i.e. with a higher priority
 * than `@docusaurus/theme-classic`. This is what allows the package to override
 * the MDX `a` component (SSR-safe link tooltips) without requiring users to
 * swizzle or register anything themselves.
 */

const path = require('path');

module.exports = function terminologyTheme() {
  return {
    name: 'docusaurus-plugin-terminology-theme',
    getThemePath() {
      return path.resolve(__dirname, 'theme');
    },
  };
};
