/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type {
  ComponentProps,
  HTMLAttributes,
  JSX,
  JSXElementConstructor,
  ReactNode,
} from 'react';
import type { NavProviderProps } from 'fumadocs-ui/contexts/layout';
import type { I18nConfig } from 'fumadocs-core/i18n';
import { type StyleXStyles } from '@stylexjs/stylex';

export type StyleXAttributes<T> = Omit<
  HTMLAttributes<T>,
  'className' | 'style'
> & {
  xstyle?: StyleXStyles;
};

export type StyleXComponentProps<
  T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
> = Omit<ComponentProps<T>, 'className' | 'style'> & {
  xstyle?: StyleXStyles;
};

export interface NavOptions extends NavProviderProps {
  enabled: boolean;
  component: ReactNode;

  title?: ReactNode;

  /**
   * Redirect url of title
   * @defaultValue '/'
   */
  url?: string;

  children?: ReactNode;
}

export interface BaseLayoutProps {
  showSidebarToggle?: boolean;

  /**
   * I18n options
   *
   * @defaultValue false
   */
  i18n?: boolean | I18nConfig;

  /**
   * GitHub url
   */
  githubUrl?: string;

  links?: LinkItemType[];
  /**
   * Replace or disable navbar
   */
  nav?: Partial<NavOptions>;

  children?: ReactNode;
}

interface BaseItem {
  /**
   * Restrict where the item is displayed
   *
   * @defaultValue 'all'
   */
  on?: 'menu' | 'nav' | 'all';
}

export interface BaseLinkType extends BaseItem {
  url: string;
  /**
   * When the item is marked as active
   *
   * @defaultValue 'url'
   */
  active?: 'url' | 'nested-url' | 'none';
  external?: boolean;
}

export interface MainItemType extends BaseLinkType {
  type?: 'main';
  icon?: ReactNode;
  text: ReactNode;
  description?: ReactNode;
}

export interface IconItemType extends BaseLinkType {
  type: 'icon';
  /**
   * `aria-label` of icon button
   */
  label?: string;
  icon: ReactNode;
  text: ReactNode;
  /**
   * @defaultValue true
   */
  secondary?: boolean;
}

export interface ButtonItemType extends BaseLinkType {
  type: 'button';
  icon?: ReactNode;
  text: ReactNode;
  /**
   * @defaultValue false
   */
  secondary?: boolean;
}

export interface MenuItemType extends Partial<BaseLinkType> {
  type: 'menu';
  icon?: ReactNode;
  text: ReactNode;

  items: (
    | (MainItemType & {
        /**
         * Options when displayed on navigation menu
         */
        menu?: StyleXAttributes<HTMLElement> & {
          banner?: ReactNode;
        };
      })
    | CustomItemType
  )[];

  /**
   * @defaultValue false
   */
  secondary?: boolean;
}

export interface CustomItemType extends BaseItem {
  type: 'custom';
  /**
   * @defaultValue false
   */
  secondary?: boolean;
  children: ReactNode;
}

export type LinkItemType =
  | MainItemType
  | IconItemType
  | ButtonItemType
  | MenuItemType
  | CustomItemType;

/**
 * Get Links Items with shortcuts
 */
export function getLinks(
  links: LinkItemType[] = [],
  githubUrl?: string,
): LinkItemType[] {
  let result = links ?? [];

  if (githubUrl)
    result = [
      ...result,
      {
        type: 'icon',
        url: githubUrl,
        text: 'Github',
        label: 'GitHub',
        icon: (
          <svg
            fill="none"
            height={16}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width={16}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
        ),
        external: true,
      },
    ];

  return result;
}

export { BaseLinkItem } from './client';
