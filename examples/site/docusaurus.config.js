// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Terminology Plugin Demo',
  tagline: 'Term pages, glossary pages and link tooltips for Docusaurus',
  url: 'https://schilke.github.io',
  baseUrl: '/docusaurus-plugin-terminology/',
  organizationName: 'schilke',
  projectName: 'docusaurus-plugin-terminology',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        docs: {
          path: 'docs',
          routeBasePath: '/docs',
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
    // IMPORTANT: register the terminology preset *after* the classic preset so
    // that its theme (MDX link tooltips) wins theme resolution.
    [
      'docusaurus-plugin-terminology',
      /** @type {import('docusaurus-plugin-terminology').TerminologyOptions} */
      {
        termsDir: 'terms',
        routeBasePath: '/terms/',
      },
    ],
  ],
};

module.exports = config;
