/**
 * Transforms links to terms in Docusaurus MDX files
 * to use a custom TermTooltip component.
 * /docusaurus-plugin-terminology/remark/term-link-transformer.js
 */

const { visit } = require('unist-util-visit');

/**
 * Transforms links to glossary terms in the tree to MDX JSX elements.
 * @returns {Function} A function that transforms links in the tree to MDX JSX elements.
 */
function termLinkTransformer(options = {}) {

  const routeBasePath =
    options.routeBasePath || '/docs/terms/';
  return (tree, file) => {
    visit(tree, 'link', (node, index, parent) => {
      const href = node.url || '';

      // Match links like [TERM](/docs/glossary/TERM)
      const escapedRoute = routeBasePath.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      const termRegex = new RegExp(
        `^${escapedRoute}[\\w-]+$`
      );

      if (termRegex.test(href)) {
        const termSlug = href.replace(routeBasePath, '');
        const termName = node.children.map((n) => n.value || '').join('');

        // Replace with a valid MDX JSX element instead of raw HTML
        const jsxNode = {
          type: 'mdxJsxTextElement',
          name: 'TermTooltip',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'term',
              value: termSlug,
            },
            {
              type: 'mdxJsxAttribute',
              name: 'href',
              value: href,
            },
          ],
          children: [
            {
              type: 'text',
              value: termName,
            },
          ],
        };

        parent.children[index] = jsxNode;
      }
    });
  };
}
module.exports = termLinkTransformer;
