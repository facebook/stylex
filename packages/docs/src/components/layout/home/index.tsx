/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useMemo } from 'react';
import {
  type BaseLayoutProps,
  getLinks,
  type LinkItemType,
  type NavOptions,
  StyleXAttributes,
} from '../shared/index';
import { LargeSearchToggle } from '../../search-toggle';
import { ThemeToggle } from '../../theme-toggle';
import Link from 'fumadocs-core/link';
import { Navbar, NavbarLinkItem } from './client';
import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import SidebarToggle from './SidebarToggle';
import { vars } from '../../../theming/vars.stylex';

export interface HomeLayoutProps extends BaseLayoutProps {
  nav?: Partial<
    NavOptions & {
      /**
       * Open mobile menu when hovering the trigger
       */
      enableHoverToOpen?: boolean;
    }
  >;
  disableShadowBlur?: true;
}

export function HomeLayout({
  nav = {},
  links,
  githubUrl,
  i18n,
  showSidebarToggle = true,
  xstyle,
  children,
  disableShadowBlur,
  ...rest
}: HomeLayoutProps & StyleXAttributes<HTMLElement>) {
  return (
    <main id="nd-home-layout" {...rest} {...stylex.props(styles.main, xstyle)}>
      {nav.enabled !== false &&
        (nav.component ?? (
          <Header
            disableShadowBlur={disableShadowBlur}
            githubUrl={githubUrl}
            i18n={i18n}
            links={links}
            nav={nav}
            showSidebarToggle={showSidebarToggle}
          />
        ))}
      {children}
    </main>
  );
}

export function Header({
  nav = {},
  links,
  githubUrl,
  showSidebarToggle = true,
  disableShadowBlur,
}: HomeLayoutProps) {
  const finalLinks = useMemo(
    () => getLinks(links, githubUrl),
    [links, githubUrl],
  );

  const navItems = finalLinks.filter((item) =>
    ['nav', 'all'].includes(item.on ?? 'all'),
  );

  return (
    <Navbar disableShadowBlur={disableShadowBlur}>
      {showSidebarToggle && <SidebarToggle />}
      <Link {...stylex.props(styles.navTitleLink)} href={nav.url ?? '/'}>
        {nav.title}
      </Link>
      {nav.children}
      <ul {...stylex.props(styles.navLinkList)}>
        {navItems
          .filter((item) => !isSecondary(item))
          .map((item, i) => (
            <NavbarLinkItem
              item={item}
              key={i}
              xstyle={styles.navbarLinkItem}
            />
          ))}
      </ul>
      <div {...stylex.props(styles.grow)} />
      <div {...stylex.props(styles.searchContainer)}>
        <LargeSearchToggle hideIfDisabled xstyle={styles.largeSearchToggle} />
      </div>
      <ul {...stylex.props(styles.endLinkList)}>
        {navItems.filter(isSecondary).map((item, i) => (
          <NavbarLinkItem
            item={item}
            key={i}
            xstyle={
              item.type === 'icon'
                ? [
                    styles.endIconLink,
                    i === 0 && styles.firstEndIconLink,
                    i === navItems.length - 1 && styles.lastEndIconLink,
                  ]
                : []
            }
          />
        ))}
      </ul>
      <ThemeToggle />
    </Navbar>
  );
}

function isSecondary(item: LinkItemType): boolean {
  if ('secondary' in item && item.secondary != null) return item.secondary;

  return item.type === 'icon';
}

const styles = stylex.create({
  main: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  navTitleLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2.5 * 4,
    fontWeight: 600,
  },
  navLinkList: {
    // "flex flex-row items-center gap-2 px-6 max-sm:hidden"
    display: { default: 'flex', '@media (max-width: 640px)': 'none' },
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2 * 4,
  },
  navbarLinkItem: {
    // "text-sm"
    fontSize: '1rem',
    lineHeight: 1.4,
    outline: 'none',
    boxShadow: {
      default: 'none',
      ':focus-visible': `0 0 0 2px ${vars['--color-fd-primary']}`,
    },
  },
  searchContainer: {
    // flex flex-row items-center justify-end gap-1.5 flex-1 max-lg:hidden
    display: { default: 'flex', '@media (max-width: 1024px)': 'none' },
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'end',
    gap: 1.5 * 4,
    flexGrow: 0,
    flexShrink: 0,
  },
  largeSearchToggle: {
    // "w-full rounded-full ps-2.5 max-w-[240px]"
    width: '100%',
    borderRadius: '9999px',
    paddingInlineStart: 2.5 * 4,
    maxWidth: 240,
    minWidth: 180,
    backgroundColor: {
      default: 'transparent',
      ':hover': `color-mix(in oklab, ${vars['--color-fd-primary']} 5%, transparent)`,
      ':focus-visible': `color-mix(in oklab, ${vars['--color-fd-primary']} 5%, transparent)`,
    },
  },
  languageToggle: {
    height: 20,
    width: 20,
  },
  grow: {
    flexGrow: 1,
  },
  endLinkList: {
    display: { default: 'flex', ':empty': 'none' },
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2 * 4,
  },
  endIconLink: {
    marginInline: -4,
  },
  firstEndIconLink: {
    marginInlineStart: 0,
  },
  lastEndIconLink: {
    marginInlineEnd: 0,
  },
  mobileSearchContainer: {
    display: { default: 'flex', '@media (max-width: 1024px)': 'none' },
    flexDirection: 'row',
    alignItems: 'center',
    marginInlineStart: 'auto',
    marginInlineEnd: -1.5 * 4,
  },
  mobileSearchToggle: {
    // "p-2"
    padding: 2 * 4,
  },
  mobileMenuContent: {
    display: 'flex',
    flexDirection: { default: 'column', '@media (min-width: 640px)': 'row' },
    padding: 4 * 4,
    justifyContent: { default: null, '@media (min-width: 640px)': 'center' },
  },
  primaryMenuLink: {
    display: {
      // eslint-disable-next-line @stylexjs/valid-styles
      default: 'var(--display)' as any,
      '@media (min-width: 640px)': 'none',
    },
  },
  themeSwitchContainer: {
    // -ms-1.5 flex flex-row items-center gap-1.5 max-sm:mt-2
    marginInlineStart: -1.5 * 4,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1.5 * 4,
    marginTop: { default: null, '@media (max-width: 640px)': 2 * 4 },
  },
  secondaryMenuLink: {
    marginInlineEnd: -1.5 * 4,
  },
  separator: {
    flexGrow: 1,
  },
  mobileLanguageToggle: {
    width: 5 * 4,
    height: 5 * 4,
  },
  languageChevron: {
    // size-3 text-fd-muted-foreground
    width: 3 * 4,
    height: 3 * 4,
    color: 'var(--text-fd-muted-foreground)',
  },
  menuTriggerIcon: {
    transitionProperty: 'transform',
    transitionDuration: '0.3s',
    transform: {
      default: null,
      [stylex.when.ancestor(':where([data-state=open])')]: 'rotate(180deg)',
    },
    width: 'var(--svg-size)',
    height: 'var(--svg-size)',
  },
});
