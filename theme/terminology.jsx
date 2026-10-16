/**
 * docusaurus-plugin-terminology/theme/terminology.js
 *
 * Client-side helpers shared by the theme components.
 */

/**
 * Canonicalize a route base path to the form `/<segment>/`.
 *
 * @param {string} [routeBasePath]
 * @returns {string}
 */
export function normalizeRouteBasePath(routeBasePath = '/terms/') {
  let route = String(routeBasePath || '').trim();
  if (route === '') {
    return '/';
  }
  if (!route.startsWith('/')) {
    route = `/${route}`;
  }
  if (!route.endsWith('/')) {
    route = `${route}/`;
  }
  return route;
}

/**
 * Extract the term slug from a link href, or `null` when it is not a term link.
 *
 * Handles absolute/relative URLs, the site `baseUrl`, and locale prefixes.
 *
 * @param {string|undefined} href
 * @param {{
 *   routeBasePath?: string,
 *   baseUrl?: string,
 *   locales?: string[],
 *   defaultLocale?: string,
 *   currentLocale?: string,
 * }} [options]
 * @returns {string|null}
 */
export function getTermSlug(href, options = {}) {
  if (!href || typeof href !== 'string') {
    return null;
  }

  let pathname = href;

  // Strip a protocol/origin if present.
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(pathname)) {
    try {
      pathname = new URL(pathname).pathname;
    } catch {
      return null;
    }
  }

  // Drop query string and hash.
  pathname = pathname.split('#')[0].split('?')[0];
  if (!pathname) {
    return null;
  }

  const {baseUrl, routeBasePath, locales = [], defaultLocale} = options;

  // Strip the site baseUrl (e.g. `/my-site/`).
  if (baseUrl && baseUrl !== '/') {
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    if (pathname === baseUrl.replace(/\/$/, '')) {
      pathname = '/';
    } else if (pathname.startsWith(normalizedBase)) {
      pathname = `/${pathname.slice(normalizedBase.length)}`;
    }
  }

  // Strip a locale prefix (e.g. `/de/terms/ai` -> `/terms/ai`).
  const nonDefaultLocales = locales.filter(
    (locale) => locale && locale !== defaultLocale,
  );
  for (const locale of nonDefaultLocales) {
    if (pathname === `/${locale}`) {
      pathname = '/';
      break;
    }
    if (pathname.startsWith(`/${locale}/`)) {
      pathname = pathname.slice(locale.length + 1);
      break;
    }
  }

  const base = normalizeRouteBasePath(routeBasePath);
  if (!pathname.startsWith(base)) {
    return null;
  }

  const rest = pathname.slice(base.length);
  const slug = rest.split('/')[0];
  return slug || null;
}
