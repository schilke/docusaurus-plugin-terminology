import type {LoadContext, Plugin, PluginModule, Preset} from '@docusaurus/types';

/**
 * Options accepted by both the preset and the plugin.
 */
export interface TerminologyOptions {
  /**
   * Directory containing the term definition files, relative to the site root.
   *
   * With `docsInstance: true` (default) this is a top-level directory, e.g.
   * `terms` rendered at `/terms/<slug>`.
   *
   * With `docsInstance: false` (legacy) it is relative to your `docs/` folder,
   * e.g. `terms` meaning `docs/terms`.
   *
   * @default 'terms'
   */
  termsDir?: string;

  /**
   * Public URL prefix of the generated term pages. Used both to render the term
   * pages and to detect term links in Markdown.
   *
   * @default '/terms/' (or '/docs/terms/' in legacy mode)
   */
  routeBasePath?: string;

  /**
   * When `true` (default) a dedicated docs instance renders the term pages
   * under `routeBasePath`. When `false`, term files are expected to live inside
   * the main `docs/` folder (legacy behaviour).
   *
   * @default true
   */
  docsInstance?: boolean;

  /**
   * Legacy mode only: write a `_category_.yml` file hiding the term docs from
   * the main docs sidebar, linking to the glossary page instead.
   *
   * @default false
   */
  hideTermsFromSidebar?: boolean;

  /**
   * Legacy mode only: label of the hidden sidebar category.
   *
   * @default 'Glossary'
   */
  sidebarLabel?: string;

  /**
   * Legacy mode only: slug (doc id) of the glossary page the hidden category
   * should link to.
   *
   * @default 'glossary'
   */
  glossarySlug?: string;
}

/**
 * The preset is the package's default export.
 */
export declare function terminologyPreset(
  context: LoadContext,
  options?: TerminologyOptions,
): Preset;

export default terminologyPreset;

/**
 * The underlying content plugin (advanced/legacy usage).
 */
export declare const plugin: PluginModule & {
  validateOptions: (args: {
    options: TerminologyOptions;
    validate: unknown;
  }) => TerminologyOptions;
};

/**
 * The theme-only plugin exposing `theme/` (advanced usage).
 */
export declare const theme: () => Plugin;

/**
 * The id of the docs instance registered by the preset.
 */
export declare const TERMS_DOCS_INSTANCE_ID: 'terminology';
