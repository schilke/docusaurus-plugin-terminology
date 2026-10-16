'use strict';

/**
 * docusaurus-plugin-terminology/plugin.js
 *
 * The content plugin: scans term definitions (Markdown/MDX), builds the
 * locale-aware glossary data exposed to the client via `setGlobalData`, and,
 * in legacy mode, hides the terms from the main docs sidebar.
 *
 * The public entry point of this package is the preset (`index.js`), which
 * wires this plugin together with a dedicated docs instance rendering the
 * terms under a top-level route (default `/terms/`).
 */

const path = require('path');
const fs = require('fs');
const matter = require('gray-matter');
const {normalizeOptions} = require('./src/options');

const PLUGIN_NAME = 'docusaurus-plugin-terminology';
const CONTENT_DOCS_PLUGIN_NAME = 'docusaurus-plugin-content-docs';
const TERMS_DOCS_INSTANCE_ID = 'terminology';
const TERM_EXTENSIONS = new Set(['.md', '.mdx']);

const CATEGORY_FILENAME = '_category_.yml';

/**
 * @param {string} filename
 * @returns {boolean}
 */
function isTermFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (!TERM_EXTENSIONS.has(ext)) {
    return false;
  }
  const basename = path.basename(filename, ext);
  // Skip index files and Docusaurus partials/doc-partials.
  if (basename === 'index' || basename.startsWith('_')) {
    return false;
  }
  return true;
}

function collapseWhitespace(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

/**
 * Strip the most common Markdown inline syntax so a description reads well as
 * a tooltip. This is intentionally conservative (no full Markdown parser).
 */
function stripMarkdown(value) {
  return String(value)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1');
}

function truncate(value, maxLength = 320) {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1).replace(/\s+\S*$/, '')}…`;
}

/**
 * Derive a short, plain-text description for a term.
 */
function deriveDescription(data, content) {
  const explicit = data.description ?? data.summary ?? data.excerpt;
  if (typeof explicit === 'string' && explicit.trim() !== '') {
    return truncate(collapseWhitespace(stripMarkdown(explicit)));
  }

  const paragraphs = String(content)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  for (const paragraph of paragraphs) {
    // Skip block-level constructs that don't make good tooltips.
    if (/^(#{1,6}\s|>|```|---|\+\+\+|\||-\s|\*\s|\d+\.\s|:::)/.test(paragraph)) {
      continue;
    }
    const text = collapseWhitespace(stripMarkdown(paragraph));
    if (text !== '') {
      return truncate(text);
    }
  }

  return truncate(collapseWhitespace(stripMarkdown(content)));
}

/**
 * Read every term file in a directory.
 *
 * @returns {Record<string, {slug: string, name: string, description: string, path: string}>|null}
 *   The terms keyed by slug, or `null` when the directory does not exist.
 */
function readTermsFromDir(dir) {
  let entries;
  try {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
      return null;
    }
    entries = fs.readdirSync(dir);
  } catch {
    return null;
  }

  const terms = {};
  for (const filename of entries.filter(isTermFile).sort()) {
    const filepath = path.join(dir, filename);
    const slug = path.basename(filename, path.extname(filename));

    let data = {};
    let content = '';
    try {
      const raw = fs.readFileSync(filepath, 'utf8');
      const parsed = matter(raw);
      data = parsed.data || {};
      content = parsed.content || '';
    } catch (err) {
      throw new Error(
        `[${PLUGIN_NAME}] Failed to read term file "${filepath}": ${err.message}`,
      );
    }

    terms[slug] = {
      slug,
      name:
        typeof data.title === 'string' && data.title.trim() !== ''
          ? data.title
          : slug,
      description: deriveDescription(data, content),
      path: filepath,
    };
  }

  return terms;
}

/**
 * Candidate directories holding term files for a given locale, ordered by
 * preference. Several i18n layouts are supported so that both the new
 * top-level terms docs instance and legacy `docs/<termsDir>` layouts keep
 * working.
 */
function getTermDirs({siteDir, termsDir, docsInstance, locale, defaultLocale}) {
  const defaultDir = docsInstance
    ? path.join(siteDir, termsDir)
    : path.join(siteDir, 'docs', termsDir);

  if (locale === defaultLocale) {
    return [defaultDir];
  }

  const i18nDir = path.join(siteDir, 'i18n', locale);

  return docsInstance
    ? [
        path.join(i18nDir, termsDir),
        path.join(
          i18nDir,
          `${CONTENT_DOCS_PLUGIN_NAME}-${TERMS_DOCS_INSTANCE_ID}`,
          'current',
        ),
        path.join(
          i18nDir,
          CONTENT_DOCS_PLUGIN_NAME,
          TERMS_DOCS_INSTANCE_ID,
          'current',
        ),
      ]
    : [
        path.join(i18nDir, CONTENT_DOCS_PLUGIN_NAME, 'current', termsDir),
        path.join(i18nDir, termsDir),
      ];
}

function sortTerms(terms) {
  const sorted = {};
  for (const slug of Object.keys(terms || {}).sort((a, b) =>
    terms[a].name.localeCompare(terms[b].name),
  )) {
    sorted[slug] = terms[slug];
  }
  return sorted;
}

function makeCategoryYaml({sidebarLabel, glossarySlug}) {
  return `label: ${sidebarLabel}
className: hidden
collapsed: true
link:
  type: doc
  id: ${glossarySlug}
`;
}

function writeCategoryFileIfMissing(dir, options) {
  try {
    if (!fs.existsSync(dir)) {
      return;
    }
    const categoryPath = path.join(dir, CATEGORY_FILENAME);
    if (fs.existsSync(categoryPath)) {
      return;
    }
    fs.writeFileSync(categoryPath, makeCategoryYaml(options), {encoding: 'utf8'});
  } catch (err) {
    console.warn(
      `[${PLUGIN_NAME}] failed to write ${CATEGORY_FILENAME} to ${dir}: ${err.message}`,
    );
  }
}

/**
 * @param {import('@docusaurus/types').LoadContext} context
 * @param {object} options
 * @returns {import('@docusaurus/types').Plugin}
 */
function terminologyPlugin(context, options) {
  const normalized = normalizeOptions(options);
  const {siteDir, i18n} = context;
  const {defaultLocale, locales} = i18n;

  return {
    name: PLUGIN_NAME,

    getPathsToWatch() {
      const watchPaths = [];
      for (const locale of locales) {
        for (const dir of getTermDirs({
          siteDir,
          termsDir: normalized.termsDir,
          docsInstance: normalized.docsInstance,
          locale,
          defaultLocale,
        })) {
          if (fs.existsSync(dir)) {
            watchPaths.push(path.join(dir, '**/*.{md,mdx}'));
          }
        }
      }
      return watchPaths;
    },

    async loadContent() {
      // Legacy mode: hide the term docs from the main docs sidebar.
      if (!normalized.docsInstance && normalized.hideTermsFromSidebar) {
        for (const locale of locales) {
          for (const dir of getTermDirs({
            siteDir,
            termsDir: normalized.termsDir,
            docsInstance: false,
            locale,
            defaultLocale,
          })) {
            writeCategoryFileIfMissing(dir, normalized);
          }
        }
      }

      const termsByLocale = {};

      for (const locale of locales) {
        let merged = null;
        for (const dir of getTermDirs({
          siteDir,
          termsDir: normalized.termsDir,
          docsInstance: normalized.docsInstance,
          locale,
          defaultLocale,
        })) {
          const found = readTermsFromDir(dir);
          if (found) {
            merged = {...(merged || {}), ...found};
          }
        }
        termsByLocale[locale] = merged;
      }

      const defaultTerms = termsByLocale[defaultLocale] || {};

      // Fall back to the default locale for missing localized terms.
      for (const locale of locales) {
        if (locale === defaultLocale) {
          continue;
        }
        termsByLocale[locale] = {
          ...defaultTerms,
          ...(termsByLocale[locale] || {}),
        };
      }

      for (const locale of locales) {
        termsByLocale[locale] = sortTerms(termsByLocale[locale]);
      }

      return {termsByLocale};
    },

    async contentLoaded({content, actions}) {
      const {setGlobalData, createData} = actions;
      const terms = content?.termsByLocale || {};

      // Static glossary JSON (handy for custom tooling / debugging).
      const glossaryDataPath = await createData(
        'glossary.json',
        JSON.stringify(terms[defaultLocale] || {}, null, 2),
      );

      setGlobalData({
        terms,
        glossaryDataPath,
        routeBasePath: normalized.routeBasePath,
        termsDir: normalized.termsDir,
        docsInstance: normalized.docsInstance,
        defaultLocale,
      });
    },
  };
}

terminologyPlugin.validateOptions = ({options}) => ({
  ...normalizeOptions(options),
  // Docusaurus only injects a default `id` when options go through its Joi
  // schema; custom validators must provide it themselves (see
  // @docusaurus/core `doValidatePluginOptions`).
  id: (options && options.id) || 'default',
});

module.exports = terminologyPlugin;
module.exports.default = terminologyPlugin;
module.exports.validateOptions = terminologyPlugin.validateOptions;
module.exports.PLUGIN_NAME = PLUGIN_NAME;
