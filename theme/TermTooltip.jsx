import React, {useEffect, useRef} from 'react';
import Link from '@docusaurus/Link';
import {usePluginData} from '@docusaurus/useGlobalData';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import './tooltip.css';
import styles from './styles.module.css';

/**
 * Resolve the glossary entry for a slug, falling back to the default locale.
 */
function resolveEntry(terms, locale, defaultLocale, slug) {
  if (!slug) {
    return undefined;
  }
  return terms?.[locale]?.[slug] ?? terms?.[defaultLocale]?.[slug];
}

/**
 * A term link that renders a tippy.js tooltip with the term definition.
 *
 * SSR-safe: the `<a>` is part of the server-rendered markup (good for SEO and
 * no-JS), while the tooltip itself is attached on mount — as tooltips are
 * inherently an interactive, client-only enhancement.
 */
export default function TermTooltip({slug, href, children, className, ...rest}) {
  const {i18n} = useDocusaurusContext();
  const pluginData = usePluginData('docusaurus-plugin-terminology');

  const entry = resolveEntry(
    pluginData?.terms,
    i18n.currentLocale,
    i18n.defaultLocale,
    slug,
  );
  const content = entry?.description;

  // Attach to a wrapper element rather than the anchor: `@docusaurus/Link` only
  // forwards refs on React 19, and this must also work on React 18.
  const wrapperRef = useRef(null);

  useEffect(() => {
    const target = wrapperRef.current;
    if (!target || !content) {
      return undefined;
    }

    const instance = tippy(target, {
      content,
      allowHTML: false,
      delay: [120, 0],
      duration: [150, 120],
      placement: 'top',
      maxWidth: 360,
      theme: 'terminology',
      // Anchoring to an inline element needs inline positioning.
      inlinePositioning: true,
      // Keep the link usable (and the tooltip visible) while hovering it.
      interactive: false,
      appendTo: () => document.body,
    });

    return () => {
      instance.destroy();
    };
  }, [content]);

  return (
    <span ref={wrapperRef} className={styles.termWrapper}>
      <Link
        {...rest}
        to={href}
        className={[styles.termLink, className].filter(Boolean).join(' ')}>
        {children}
      </Link>
    </span>
  );
}
