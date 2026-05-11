module.exports = {
  title: 'Terminology Plugin Example',
  url: 'http://localhost',
  baseUrl: '/',
  i18n: { defaultLocale: 'en', locales: ['en'] },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: '/docs',
        },
      },
    ],
  ],
  plugins: [
    [
      require.resolve('../../index.js'),
      { termsDir: 'terms', routeBasePath: '/docs/terms/', hideTermsFromSidebar: true },
    ],
  ],
};
