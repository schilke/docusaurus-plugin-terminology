// docusaurus-plugin-terminology/index.js
const path = require('path');
const fs = require('fs');
const matter = require('gray-matter');

module.exports = function (context, options) {
    //console.log('[plugin] docusaurus-plugin-terminology loaded');
    return {
        name: 'docusaurus-plugin-terminology',
        
        extendMarkdownOptions(mdOptions) {
            mdOptions.remarkPlugins = mdOptions.remarkPlugins || [];
            mdOptions.remarkPlugins.push([
                require('./remark/term-link-transformer'),
                options || {},
            ]);
            //console.log('[plugin] extendMarkdownOptions: registered termLinkTransformer');
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
            ? path.resolve(siteDir, 'docs/glossary')
            : path.resolve(siteDir, `i18n/${locale}/docusaurus-plugin-content-docs/current/glossary`);
            
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
                glossaryDataPath, // now properly defined
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
