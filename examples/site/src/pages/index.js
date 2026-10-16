import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home() {
  return (
    <Layout
      title="Terminology Plugin Demo"
      description="Demo site for docusaurus-plugin-terminology">
      <main className="container margin-vert--lg">
        <h1>docusaurus-plugin-terminology</h1>
        <p>
          Term pages, a generated glossary page and SSR-safe link tooltips for
          Docusaurus 3.
        </p>
        <ul>
          <li>
            <Link to="/docs/intro">Introduction</Link>
          </li>
          <li>
            <Link to="/docs/glossary">Glossary</Link>
          </li>
          <li>
            <Link to="/docs/sample">Sample page (tooltip examples)</Link>
          </li>
          <li>
            <Link to="/terms/ai">Example term page</Link>
          </li>
        </ul>
      </main>
    </Layout>
  );
}
