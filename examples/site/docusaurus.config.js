// @ts-check
const {
  REPO_URL,
  NPM_URL,
  socialLinksHtml,
  navbarGithubItem,
} = require('./src/socialLinks');

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
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Terminology Demo',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Docs',
          },
          {to: '/docs/glossary', label: 'Glossary', position: 'left'},
          {to: '/docs/sample', label: 'Tooltips', position: 'left'},
          {to: '/terms/ai', label: 'Example term', position: 'left'},
          // Visible link back to the plugin repository (icon + label).
          {type: 'html', position: 'right', value: navbarGithubItem},
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {label: 'Introduction', to: '/docs/intro'},
              {label: 'Glossary', to: '/docs/glossary'},
              {label: 'Tooltips', to: '/docs/sample'},
              {label: 'Example term', to: '/terms/ai'},
            ],
          },
          {
            title: 'Project',
            items: [
              {label: 'GitHub repository', href: REPO_URL},
              {label: 'npm package', href: NPM_URL},
              {label: 'Report an issue', href: `${REPO_URL}/issues`},
              {label: 'Changelog', href: `${REPO_URL}/blob/main/CHANGELOG.md`},
            ],
          },
          {
            title: 'Connect',
            items: [{html: socialLinksHtml}],
          },
        ],
        copyright: `Built with Docusaurus. © ${new Date().getFullYear()} Jürgen Schilke.`,
      },
    }),
};

module.exports = config;
