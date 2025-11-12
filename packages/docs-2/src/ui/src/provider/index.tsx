'use client';

console.warn(
  '`fumadocs-ui/provider` export will be removed on v17, you can import from `fumadocs-ui/provider/next` instead.',
);

export {
  /**
   * @deprecated Import from `fumadocs-ui/provider/next` instead.
   */
  RootProvider,
} from './next';

export { useI18n, I18nLabel } from '@/ui/src/contexts/i18n';
export {
  SearchProvider,
  SearchOnly,
  useSearchContext,
  type SearchProviderProps,
} from '@/ui/src/contexts/search';
export { SidebarProvider, useSidebar } from '@/ui/src/contexts/sidebar';
export {
  useTreePath,
  useTreeContext,
  TreeContextProvider,
} from '@/ui/src/contexts/tree';
export {
  useNav,
  NavProvider,
  type NavProviderProps,
  type PageStyles,
  StylesProvider,
  usePageStyles,
} from '@/ui/src/contexts/layout';
