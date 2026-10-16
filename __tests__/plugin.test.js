'use strict';

const path = require('path');

jest.mock('fs', () => require('memfs').fs);

const {vol} = require('memfs');

const mkdirp = (dir) => vol.mkdirSync(dir, {recursive: true});

const terminologyPlugin = require('../plugin');

const TERM_FILE = (title, description, body = '') => `---
title: ${title}
description: ${description}
---

${body}
`;

function makeContext(siteDir, i18n = {defaultLocale: 'en', locales: ['en']}) {
  return {siteDir, i18n};
}

function makeActions() {
  const globalData = {};
  const dataFiles = {};
  return {
    globalData,
    dataFiles,
    actions: {
      setGlobalData: (data) => {
        Object.assign(globalData, data);
      },
      createData: async (name, content) => {
        dataFiles[name] = content;
        return `/generated/${name}`;
      },
    },
  };
}

describe('terminology plugin', () => {
  beforeEach(() => {
    vol.reset();
  });

  test('exposes a stable plugin name', () => {
    const plugin = terminologyPlugin(makeContext('/site'), {});
    expect(plugin.name).toBe('docusaurus-plugin-terminology');
  });

  describe('loadContent (docs instance mode)', () => {
    test('collects terms from the top-level terms directory', async () => {
      const siteDir = '/site';
      mkdirp(path.join(siteDir, 'terms'));
      vol.writeFileSync(
        path.join(siteDir, 'terms', 'ai.md'),
        TERM_FILE('AI', 'Artificial Intelligence'),
      );
      vol.writeFileSync(
        path.join(siteDir, 'terms', 'css.md'),
        TERM_FILE('CSS', 'Cascading Style Sheets'),
      );
      // Should be ignored.
      vol.writeFileSync(path.join(siteDir, 'terms', 'index.md'), '# Index');
      vol.writeFileSync(path.join(siteDir, 'terms', '_partial.md'), '# Partial');

      const plugin = terminologyPlugin(makeContext(siteDir), {});
      const content = await plugin.loadContent();

      expect(Object.keys(content.termsByLocale.en)).toEqual(['ai', 'css']);
      expect(content.termsByLocale.en.ai).toMatchObject({
        slug: 'ai',
        name: 'AI',
        description: 'Artificial Intelligence',
      });
      expect(content.termsByLocale.en.index).toBeUndefined();
      expect(content.termsByLocale.en._partial).toBeUndefined();
    });

    test('sorts terms alphabetically by name', async () => {
      const siteDir = '/site';
      mkdirp(path.join(siteDir, 'terms'));
      vol.writeFileSync(
        path.join(siteDir, 'terms', 'z.md'),
        TERM_FILE('Zebra', 'A striped animal'),
      );
      vol.writeFileSync(
        path.join(siteDir, 'terms', 'a.md'),
        TERM_FILE('Apple', 'A fruit'),
      );

      const plugin = terminologyPlugin(makeContext(siteDir), {});
      const content = await plugin.loadContent();

      expect(Object.keys(content.termsByLocale.en)).toEqual(['a', 'z']);
    });

    test('derives a description from the first paragraph when frontmatter is missing', async () => {
      const siteDir = '/site';
      mkdirp(path.join(siteDir, 'terms'));
      vol.writeFileSync(
        path.join(siteDir, 'terms', 'ftp.md'),
        '---\ntitle: FTP\n---\n\nThe **File Transfer Protocol** is used to move files.\n\nSecond paragraph.\n',
      );

      const plugin = terminologyPlugin(makeContext(siteDir), {});
      const content = await plugin.loadContent();

      expect(content.termsByLocale.en.ftp.description).toBe(
        'The File Transfer Protocol is used to move files.',
      );
    });

    test('falls back to the default locale for missing localized terms', async () => {
      const siteDir = '/site';
      mkdirp(path.join(siteDir, 'terms'));
      vol.writeFileSync(
        path.join(siteDir, 'terms', 'ai.md'),
        TERM_FILE('AI', 'Artificial Intelligence'),
      );

      const i18n = {defaultLocale: 'en', locales: ['en', 'de']};
      const plugin = terminologyPlugin(makeContext(siteDir, i18n), {});
      const content = await plugin.loadContent();

      expect(content.termsByLocale.de.ai).toMatchObject({
        name: 'AI',
        description: 'Artificial Intelligence',
      });
    });

    test('reads localized terms from the docs instance i18n path', async () => {
      const siteDir = '/site';
      mkdirp(path.join(siteDir, 'terms'));
      vol.writeFileSync(
        path.join(siteDir, 'terms', 'ai.md'),
        TERM_FILE('AI', 'Artificial Intelligence'),
      );

      const deDir = path.join(
        siteDir,
        'i18n',
        'de',
        'docusaurus-plugin-content-docs-terminology',
        'current',
      );
      mkdirp(deDir);
      vol.writeFileSync(
        path.join(deDir, 'ai.md'),
        TERM_FILE('KI', 'Künstliche Intelligenz'),
      );

      const i18n = {defaultLocale: 'en', locales: ['en', 'de']};
      const plugin = terminologyPlugin(makeContext(siteDir, i18n), {});
      const content = await plugin.loadContent();

      expect(content.termsByLocale.de.ai).toMatchObject({
        name: 'KI',
        description: 'Künstliche Intelligenz',
      });
    });
  });

  describe('contentLoaded', () => {
    test('exposes glossary data globally', async () => {
      const siteDir = '/site';
      mkdirp(path.join(siteDir, 'terms'));
      vol.writeFileSync(
        path.join(siteDir, 'terms', 'ai.md'),
        TERM_FILE('AI', 'Artificial Intelligence'),
      );

      const plugin = terminologyPlugin(makeContext(siteDir), {
        routeBasePath: '/terms/',
      });
      const content = await plugin.loadContent();
      const {actions, globalData, dataFiles} = makeActions();

      await plugin.contentLoaded({content, actions});

      expect(globalData.terms.en.ai.name).toBe('AI');
      expect(globalData.routeBasePath).toBe('/terms/');
      expect(JSON.parse(dataFiles['glossary.json']).ai.name).toBe('AI');
    });
  });

  describe('legacy mode (docsInstance: false)', () => {
    test('reads terms from docs/<termsDir>', async () => {
      const siteDir = '/site';
      mkdirp(path.join(siteDir, 'docs', 'terms'));
      vol.writeFileSync(
        path.join(siteDir, 'docs', 'terms', 'ai.md'),
        TERM_FILE('AI', 'Artificial Intelligence'),
      );

      const plugin = terminologyPlugin(makeContext(siteDir), {
        docsInstance: false,
      });
      const content = await plugin.loadContent();

      expect(content.termsByLocale.en.ai.name).toBe('AI');
    });

    test('writes _category_.yml when hideTermsFromSidebar is set', async () => {
      const siteDir = '/site';
      const termsDir = path.join(siteDir, 'docs', 'terms');
      mkdirp(termsDir);

      const plugin = terminologyPlugin(makeContext(siteDir), {
        docsInstance: false,
        hideTermsFromSidebar: true,
        sidebarLabel: 'Glossar',
      });
      await plugin.loadContent();

      const categoryPath = path.join(termsDir, '_category_.yml');
      expect(vol.existsSync(categoryPath)).toBe(true);
      const content = vol.readFileSync(categoryPath, 'utf8');
      expect(content).toMatch(/label: Glossar/);
      expect(content).toMatch(/className: hidden/);
    });

    test('does not overwrite an existing _category_.yml', async () => {
      const siteDir = '/site';
      const termsDir = path.join(siteDir, 'docs', 'terms');
      mkdirp(termsDir);
      const categoryPath = path.join(termsDir, '_category_.yml');
      vol.writeFileSync(categoryPath, 'label: Existing');

      const plugin = terminologyPlugin(makeContext(siteDir), {
        docsInstance: false,
        hideTermsFromSidebar: true,
      });
      await plugin.loadContent();

      expect(vol.readFileSync(categoryPath, 'utf8')).toBe('label: Existing');
    });
  });

  describe('validateOptions', () => {
    test('returns normalized options', () => {
      expect(
        terminologyPlugin.validateOptions({options: {termsDir: 'glossary'}}),
      ).toMatchObject({termsDir: 'glossary', routeBasePath: '/terms/'});
    });

    test('throws on invalid options', () => {
      expect(() =>
        terminologyPlugin.validateOptions({options: {termsDir: '/abs'}}),
      ).toThrow(/relative/);
    });
  });
});
