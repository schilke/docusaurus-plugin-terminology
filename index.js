// docusaurus-plugin-terminology/index.js
const path = require('path');
const fs = require('fs');
const matter = require('gray-matter');

module.exports = function (context, options = {}) {

    // Provide sensible defaults and read hide flag
    options = Object.assign(
        {
            termsDir: 'terms',
            routeBasePath: '/docs/terms/',
            hideTermsFromSidebar: false,
        },
        options || {}
    );

    const termsDir = options.termsDir || 'terms';
    const routeBasePath = options.routeBasePath || '/docs/terms/';
    const hideTermsFromSidebar = options.hideTermsFromSidebar === true;

    //console.log('[plugin] docusaurus-plugin-terminology loaded');
    return {
        name: 'docusaurus-plugin-terminology',
        
        extendMarkdownOptions(mdOptions) {
            mdOptions.remarkPlugins = mdOptions.remarkPlugins || [];
            mdOptions.remarkPlugins.push([
                require('./remark/term-link-transformer'),
                {
                    termsDir,
                    routeBasePath,
                },
            ]);
            //console.log('[plugin] extendMarkdownOptions: registered termLinkTransformer');
        },
        
        /**
         * Optionally write a _category_.yml into the terms docs directory (and per-locale equivalents)
         * so that the terms directory is represented by a single category entry that can be hidden
         * (className: hidden). This prevents the individual generated term files from showing up
         * in the main docs sidebar.
         */
        async loadContent() {
            if (!hideTermsFromSidebar) return null;

            const CATEGORY_FILENAME = '_category_.yml';
            const makeCategoryYaml = (label = 'Glossar') => `label: ${label}
className: hidden
collapsed: true
link:
  type: doc
  id: glossary
`;

            const writeIfMissing = (docsDir) => {
                try {
                    if (!fs.existsSync(docsDir)) return;
                    const catPath = path.join(docsDir, CATEGORY_FILENAME);
                    if (fs.existsSync(catPath)) {
                        // Respect an existing file; do not overwrite
                        return;
                    }
                    fs.writeFileSync(catPath, makeCategoryYaml(), { encoding: 'utf8' });
                    console.info(`[docusaurus-plugin-terminology] wrote ${CATEGORY_FILENAME} to ${docsDir}`);
                } catch (err) {
                    // Non-fatal: warn and continue
                    console.warn(`[docusaurus-plugin-terminology] failed to write ${CATEGORY_FILENAME} to ${docsDir}: ${err.message}`);
                }
            };

            // default locale docs dir
            const defaultDocsDir = path.resolve(context.siteDir, `docs/${termsDir}`);
            writeIfMissing(defaultDocsDir);

            // localized docs dirs (if i18n present)
            const { i18n } = context || {};
            if (i18n && Array.isArray(i18n.locales)) {
                for (const locale of i18n.locales) {
                    if (locale === i18n.defaultLocale) continue;
                    const localizedDocsDir = path.resolve(
                        context.siteDir,
                        `i18n/${locale}/docusaurus-plugin-content-docs/current/${termsDir}`
                    );
                    writeIfMissing(localizedDocsDir);
                }
            }

            return null;
        },
        
        /**
         * Called when content has been loaded. 
         * Processes glossary terms data for different locales and generates a glossary JSON file.
         * @param {Object} context - The context object containing siteDir, i18n, and actions.
         */
        async contentLoaded({ actions }) {
            const { siteDir, i18n } = context;
            const { defaultLocale, locales } = i18n;
            const { setGlobalData, createData } = actions;
            
            const termsData = {};
            
            for (const locale of locales) {
            const docsDir = locale === defaultLocale
            ? path.resolve(siteDir, `docs/${termsDir}`)
            : path.resolve(
                siteDir,
                `i18n/${locale}/docusaurus-plugin-content-docs/current/${termsDir}`
            );
            
            if (!fs.existsSync(docsDir)) continue;
            
            const termFiles = fs.readdirSync(docsDir).filter((f) => (f.endsWith('.md') || f.endsWith('.mdx')) && f !== 'index.md');
            
            const termsArray = [];
            
            for (const filename of termFiles) {
                const slug = filename.replace(/\.mdx?$/, '');
                const filepath = path.join(docsDir, filename);
                const fileContent = fs.readFileSync(filepath, 'utf-8');
                const { data, content } = matter(fileContent);
                
                termsArray.push({
                slug,
                name: data.title || slug,
                description: data.description || content.trim().split('\n')[0],
                });
            }
            
            // Sort termsArray alphabetically by name
            termsArray.sort((a, b) => a.name.localeCompare(b.name));
            
            // Convert sorted array back to object
            termsData[locale] = termsArray.reduce((acc, term) => {
                acc[term.slug] = {
                name: term.name,
                description: term.description,
                };
                return acc;
            }, {});
            }
            
            // Fallback: fill in missing terms for other locales using default locale
            for (const locale of Object.keys(termsData)) {
                if (locale === defaultLocale) continue;
                for (const [slug, entry] of Object.entries(termsData[defaultLocale] || {})) {
                    if (!termsData[locale]?.[slug]) {
                        if (!termsData[locale]) termsData[locale] = {};
                        termsData[locale][slug] = entry;
                    }
                }
            }

            //console.log('[plugin] termsData:', termsData);
            //console.log('Current locale:', i18n.currentLocale);

            // Write static glossary JSON file (default locale only)
            const outputJson = JSON.stringify(termsData[defaultLocale] || {}, null, 2);
            const glossaryDataPath = await createData('glossary.json', outputJson);
            //console.log('[plugin] glossary.json generated at:', glossaryDataPath);
            //console.log('[plugin] setGlobalData terms:', termsData);

            // Expose for use in components
            setGlobalData({
                terms: termsData,
                glossaryDataPath,
                routeBasePath,
                termsDir,
            });
        },
        
        getThemePath() {
            return path.resolve(__dirname, './theme');
        },
        
        getClientModules() {
            return [path.resolve(__dirname, './theme/tooltip.js')];
        },
    };
};
