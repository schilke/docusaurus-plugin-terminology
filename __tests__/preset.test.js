'use strict';

const terminologyPreset = require('../index');

const context = {siteDir: '/site', i18n: {defaultLocale: 'en', locales: ['en']}};

describe('terminology preset', () => {
  test('registers the terms docs instance, the plugin, and the theme', () => {
    const preset = terminologyPreset(context, {});

    expect(Array.isArray(preset.plugins)).toBe(true);
    expect(preset.plugins).toHaveLength(2);
    expect(preset.plugins[0][0]).toBe('@docusaurus/plugin-content-docs');
    expect(preset.plugins[0][1]).toMatchObject({
      id: 'terminology',
      path: 'terms',
      routeBasePath: 'terms',
      sidebarPath: false,
    });
    expect(typeof preset.plugins[1][0]).toBe('function');
    const pluginInstance = preset.plugins[1][0](context, {});
    expect(pluginInstance.name).toBe('docusaurus-plugin-terminology');

    expect(preset.themes).toHaveLength(1);
    expect(typeof preset.themes[0]).toBe('function');
  });

  test('respects routeBasePath and termsDir options', () => {
    const preset = terminologyPreset(context, {
      termsDir: 'glossary',
      routeBasePath: '/glossary/',
    });

    expect(preset.plugins[0][1]).toMatchObject({
      path: 'glossary',
      routeBasePath: 'glossary',
    });
  });

  test('omits the docs instance in legacy mode', () => {
    const preset = terminologyPreset(context, {docsInstance: false});

    expect(preset.plugins).toHaveLength(1);
    expect(preset.plugins[0][0](context, {}).name).toBe(
      'docusaurus-plugin-terminology',
    );
  });

  test('exposes the theme path', () => {
    const theme = terminologyPreset.theme();
    expect(theme.name).toBe('docusaurus-plugin-terminology-theme');
    expect(theme.getThemePath()).toMatch(/theme$/);
  });
});
