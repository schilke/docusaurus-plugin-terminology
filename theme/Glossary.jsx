import React from 'react';
import Link from '@docusaurus/Link';
import {usePluginData} from '@docusaurus/useGlobalData';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';
import {normalizeRouteBasePath} from './terminology';

/**
 * A–Z glossary listing every term with its short description.
 *
 * Usage in any Markdown/MDX file:
 *
 * ```mdx
 * import Glossary from '@theme/Glossary';
 *
 * <Glossary />
 * ```
 */
export default function Glossary() {
  const {i18n} = useDocusaurusContext();
  const pluginData = usePluginData('docusaurus-plugin-terminology');

  const localeTerms =
    pluginData?.terms?.[i18n.currentLocale] ??
    pluginData?.terms?.[i18n.defaultLocale] ??
    {};

  const routeBasePath = normalizeRouteBasePath(
    pluginData?.routeBasePath ?? '/terms/',
  );

  const termEntries = Object.entries(localeTerms).sort(([, a], [, b]) =>
    a.name.localeCompare(b.name),
  );

  if (termEntries.length === 0) {
    return <p>No glossary terms found.</p>;
  }

  const groupedTerms = termEntries.reduce((acc, [slug, term]) => {
    const firstLetter = (term.name[0] || '#').toUpperCase();
    (acc[firstLetter] ||= []).push({slug, ...term});
    return acc;
  }, {});

  const alphabet = Object.keys(groupedTerms).sort();

  return (
    <div>
      <nav className={styles.alphabetNav} aria-label="Glossary index">
        {alphabet.map((letter) => (
          <a
            key={letter}
            className="button button--sm button--outline button--primary"
            href={`#${letter}`}>
            {letter}
          </a>
        ))}
      </nav>

      {alphabet.map((letter) => (
        <section key={letter} id={letter} className={styles.glossarySection}>
          <h2>{letter}</h2>
          <dl className={styles.glossaryList}>
            {groupedTerms[letter].map(({slug, name, description}) => (
              <div key={slug} className={styles.glossaryEntry}>
                <dt>
                  <strong>
                    <Link to={`${routeBasePath}${slug}`}>{name}</Link>
                  </strong>
                </dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
