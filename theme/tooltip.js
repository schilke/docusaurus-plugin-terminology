// docusaurus-plugin-terminology/theme/tooltip.js
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
//import 'tippy.js/themes/light-border.css';
import 'tippy.js/themes/material.css';

if (ExecutionEnvironment.canUseDOM) {
  document.addEventListener('DOMContentLoaded', () => {
    const locale = document.documentElement.lang || 'en';
    const allTerms = window.Docusaurus?.__pluginGlobalData?.['docusaurus-plugin-terminology'] || {};
    const terms = allTerms[locale] || {};

    document.querySelectorAll('.term-tooltip').forEach((el) => {
      const slug = el.dataset.term;
      const info = terms[slug];
      if (!info) return;

      tippy(el, {
        content: info.description,
        allowHTML: true,
        //theme: 'light-border',
        theme: 'material',
        placement: 'top-end',
        delay: [100, 50],
        maxWidth: 300,
      });
    });
  });
}
