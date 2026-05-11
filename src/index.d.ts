import { Plugin } from '@docusaurus/types';

export interface TerminologyPluginOptions {
  termsDir?: string;
  routeBasePath?: string;
  hideTermsFromSidebar?: boolean;
}

declare function pluginTerminology(context: any, options?: TerminologyPluginOptions): Plugin;

export default pluginTerminology;
