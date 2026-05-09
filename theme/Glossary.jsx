// docusaurus-plugin-terminology/theme/Glossary.jsx
import React from 'react';
import { usePluginData } from '@docusaurus/useGlobalData';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function Glossary() {
  const { i18n } = useDocusaurusContext();
  const { terms } = usePluginData('docusaurus-plugin-terminology');
  const localeTerms = terms[i18n.currentLocale] || {};
  const termEntries = Object.entries(localeTerms);

  if (termEntries.length === 0) {
    return <p>No glossary terms found.</p>;
  }

  // Group terms by their starting letter
  const groupedTerms = termEntries.reduce((acc, [key, { name, description }]) => {
    const firstLetter = name[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push({ key, name, description });
    return acc;
  }, {});

  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  // Filter out letters with no terms
  const filteredAlphabet = alphabet.filter((letter) => groupedTerms[letter]);

  return (
    <div className="container">
      {/* A-Z Index */}
      <div className="container margin-bottom--lg">
        {filteredAlphabet.map((letter) => (
          <a
            className="button button--sm button--outline button--primary col col--1 margin--xs"
            key={letter}
            href={`#${letter}`}
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Terms List */}
      <div>
        {filteredAlphabet.map((letter) => (
          <div key={letter} id={letter} className="container margin-vert--xs padding-vert--lg shadow--md">
            <h2>{letter}</h2>
            <ul>
              {groupedTerms[letter].map(({ key, name, description }) => (
                <li 
                    key={key}
                    style={{ listStyleType: 'none' }}
                >
                  <strong>
                    <a href={`/docs/glossary/${key}`}>{name}</a>:
                  </strong>{' '}
                  {description}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
