import React from 'react';
import OriginalA from '@theme-init/MDXComponents/A';
import {usePluginData} from '@docusaurus/useGlobalData';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import TermTooltip from '@theme/TermTooltip';
import {getTermSlug} from '@theme/terminology';

/**
 * Override of the MDX `a` component.
 *
 * Plain Markdown links to term pages (e.g. `[AI](/terms/ai)`) are rendered as
 * `<TermTooltip>`; every other link is delegated to the original Docusaurus
 * implementation.
 *
 * This is what makes the plugin zero-config: no remark plugin, no MDX
 * components swizzle, and no client-side DOM scanning. The term link is part of
 * the server-rendered HTML, and the tooltip is attached on mount.
 *
 * @param {object} props
 * @returns {React.ReactNode}
 */
export default function A(props) {
  const pluginData = usePluginData('docusaurus-plugin-terminology');
  const {siteConfig, i18n} = useDocusaurusContext();

  if (pluginData) {
    const slug = getTermSlug(props.href, {
      routeBasePath: pluginData.routeBasePath,
      baseUrl: siteConfig.baseUrl,
      locales: i18n.locales,
      defaultLocale: i18n.defaultLocale,
      currentLocale: i18n.currentLocale,
    });

    const hasEntry =
      slug &&
      (pluginData.terms?.[i18n.currentLocale]?.[slug] ||
        pluginData.terms?.[i18n.defaultLocale]?.[slug]);

    if (hasEntry) {
      return <TermTooltip slug={slug} {...props} />;
    }
  }

  return <OriginalA {...props} />;
}
