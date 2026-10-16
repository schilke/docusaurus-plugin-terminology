'use strict';

const {
  normalizeOptions,
  normalizeRouteBasePath,
  normalizeTermsDir,
} = require('../src/options');

describe('normalizeRouteBasePath', () => {
  test('defaults to /terms/ with a docs instance', () => {
    expect(normalizeRouteBasePath(undefined, {docsInstance: true})).toBe('/terms/');
  });

  test('defaults to the legacy route without a docs instance', () => {
    expect(normalizeRouteBasePath(undefined, {docsInstance: false})).toBe(
      '/docs/terms/',
    );
  });

  test.each([
    ['terms', '/terms/'],
    ['/terms', '/terms/'],
    ['terms/', '/terms/'],
    ['/glossary/', '/glossary/'],
    ['nested/path', '/nested/path/'],
  ])('normalizes "%s" to "%s"', (input, expected) => {
    expect(normalizeRouteBasePath(input, {docsInstance: true})).toBe(expected);
  });

  test('rejects non-string values', () => {
    expect(() => normalizeRouteBasePath(42, {docsInstance: true})).toThrow(
      /routeBasePath/,
    );
  });
});

describe('normalizeTermsDir', () => {
  test('defaults to terms', () => {
    expect(normalizeTermsDir()).toBe('terms');
  });

  test('trims trailing slashes and backslashes', () => {
    expect(normalizeTermsDir('glossary/')).toBe('glossary');
    expect(normalizeTermsDir('nested\\terms\\')).toBe('nested/terms');
  });

  test('rejects absolute paths', () => {
    expect(() => normalizeTermsDir('/etc/terms')).toThrow(/relative/);
  });

  test('rejects parent traversal', () => {
    expect(() => normalizeTermsDir('../terms')).toThrow(/\.\./);
  });
});

describe('normalizeOptions', () => {
  test('provides safe defaults', () => {
    expect(normalizeOptions()).toEqual({
      termsDir: 'terms',
      routeBasePath: '/terms/',
      docsInstance: true,
      hideTermsFromSidebar: false,
      sidebarLabel: 'Glossary',
      glossarySlug: 'glossary',
    });
  });

  test('normalizes a partial options object', () => {
    expect(
      normalizeOptions({
        termsDir: 'glossary',
        routeBasePath: '/glossary',
        hideTermsFromSidebar: true,
      }),
    ).toEqual({
      termsDir: 'glossary',
      routeBasePath: '/glossary/',
      docsInstance: true,
      hideTermsFromSidebar: true,
      sidebarLabel: 'Glossary',
      glossarySlug: 'glossary',
    });
  });

  test('docsInstance: false switches the default route', () => {
    const options = normalizeOptions({docsInstance: false});
    expect(options.docsInstance).toBe(false);
    expect(options.routeBasePath).toBe('/docs/terms/');
  });

  test('rejects non-object options', () => {
    expect(() => normalizeOptions('nope')).toThrow(/options must be an object/);
  });
});
