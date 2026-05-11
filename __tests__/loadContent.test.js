const path = require('path');
const fs = require('fs');
const { vol } = require('memfs');

// We'll stub fs methods used by the plugin to point to memfs
jest.mock('fs', () => require('memfs').fs);

describe('docusaurus-plugin-terminology loadContent', () => {
  beforeEach(() => {
    vol.reset();
  });

  test('writes _category_.yml when hideTermsFromSidebar true and file missing', async () => {
    const siteDir = '/site';
    const docsTerms = path.posix.join(siteDir, 'docs', 'terms');
    vol.mkdirpSync(docsTerms);

    const context = { siteDir, i18n: { defaultLocale: 'en', locales: ['en'] } };
    const plugin = require('../index.js');
    const pluginObj = plugin(context, { hideTermsFromSidebar: true });

    expect(typeof pluginObj.loadContent).toBe('function');
    await pluginObj.loadContent.call(pluginObj);

    const catPath = path.posix.join(docsTerms, '_category_.yml');
    const exists = vol.existsSync(catPath);
    expect(exists).toBe(true);

    const content = vol.readFileSync(catPath, 'utf8');
    expect(content).toMatch(/label: Glossar/);
    expect(content).toMatch(/className: hidden/);
  });

  test('does not overwrite existing _category_.yml', async () => {
    const siteDir = '/site';
    const docsTerms = path.posix.join(siteDir, 'docs', 'terms');
    vol.mkdirpSync(docsTerms);
    const catPath = path.posix.join(docsTerms, '_category_.yml');
    vol.writeFileSync(catPath, 'label: Existing');

    const context = { siteDir, i18n: { defaultLocale: 'en', locales: ['en'] } };
    const plugin = require('../index.js');
    const pluginObj = plugin(context, { hideTermsFromSidebar: true });

    await pluginObj.loadContent.call(pluginObj);

    const content = vol.readFileSync(catPath, 'utf8');
    expect(content).toBe('label: Existing');
  });
});
