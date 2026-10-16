'use strict';

/**
 * Shared option normalization for `docusaurus-plugin-terminology`.
 *
 * This module is intentionally dependency-free (no Joi) so that it can be used
 * both by the preset and by the plugin, and by unit tests with plain Node.
 */

const DEFAULT_TERMS_DIR = 'terms';

const DEFAULT_ROUTE_BASE_PATH_WITH_DOCS_INSTANCE = '/terms/';
const DEFAULT_ROUTE_BASE_PATH_LEGACY = '/docs/terms/';

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fail(message) {
  throw new Error(`[docusaurus-plugin-terminology] ${message}`);
}

/**
 * Normalize a public route base path into the canonical form `/<segment>/`.
 */
function normalizeRouteBasePath(value, {docsInstance = true} = {}) {
  const fallback = docsInstance
    ? DEFAULT_ROUTE_BASE_PATH_WITH_DOCS_INSTANCE
    : DEFAULT_ROUTE_BASE_PATH_LEGACY;

  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value !== 'string') {
    fail(`"routeBasePath" must be a string, received ${typeof value}.`);
  }

  let route = value.trim();
  if (route === '') {
    return fallback;
  }
  if (!route.startsWith('/')) {
    route = `/${route}`;
  }
  if (!route.endsWith('/')) {
    route = `${route}/`;
  }
  return route;
}

/**
 * Normalize the terms directory into a POSIX-ish path relative to the site root.
 */
function normalizeTermsDir(value) {
  if (value === undefined || value === null || value === '') {
    return DEFAULT_TERMS_DIR;
  }
  if (typeof value !== 'string') {
    fail(`"termsDir" must be a string, received ${typeof value}.`);
  }

  const dir = value.trim().replace(/\\/g, '/').replace(/\/+$/, '');
  if (dir === '') {
    return DEFAULT_TERMS_DIR;
  }
  if (dir.startsWith('/')) {
    fail('"termsDir" must be relative to the site root, e.g. "terms".');
  }
  const segments = dir.split('/');
  if (segments.includes('..')) {
    fail('"termsDir" must not contain ".." segments.');
  }
  return dir;
}

/**
 * Validate and normalize all plugin/preset options.
 *
 * @param {object} [options]
 * @returns {{
 *   termsDir: string,
 *   routeBasePath: string,
 *   docsInstance: boolean,
 *   hideTermsFromSidebar: boolean,
 *   sidebarLabel: string,
 *   glossarySlug: string,
 * }}
 */
function normalizeOptions(options) {
  if (options === undefined || options === null) {
    options = {};
  }
  if (!isPlainObject(options)) {
    fail(`options must be an object, received ${typeof options}.`);
  }

  const docsInstance = options.docsInstance !== false;

  const sidebarLabel =
    typeof options.sidebarLabel === 'string' && options.sidebarLabel.trim() !== ''
      ? options.sidebarLabel
      : 'Glossary';

  const glossarySlug =
    typeof options.glossarySlug === 'string' && options.glossarySlug.trim() !== ''
      ? options.glossarySlug
      : 'glossary';

  return {
    termsDir: normalizeTermsDir(options.termsDir),
    routeBasePath: normalizeRouteBasePath(options.routeBasePath, {docsInstance}),
    docsInstance,
    hideTermsFromSidebar: options.hideTermsFromSidebar === true,
    sidebarLabel,
    glossarySlug,
  };
}

module.exports = {
  DEFAULT_TERMS_DIR,
  normalizeOptions,
  normalizeRouteBasePath,
  normalizeTermsDir,
};
