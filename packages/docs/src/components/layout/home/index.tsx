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
    flexGrow: 1,
    flexDirection: 'column',
  },
  navTitleLink: {
    display: 'inline-flex',
    gap: 2.5 * 4,
    alignItems: 'center',
    fontWeight: 600,
  },
  navLinkList: {
    // "flex flex-row items-center gap-2 px-6 max-sm:hidden"
    display: { default: 'flex', '@media (max-width: 640px)': 'none' },
    flexDirection: 'row',
    gap: 2 * 4,
    alignItems: 'center',
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
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'row',
    gap: 1.5 * 4,
    alignItems: 'center',
    justifyContent: 'end',
  },
  largeSearchToggle: {
    // "w-full rounded-full ps-2.5 max-w-[240px]"
    width: '100%',
    minWidth: 180,
    maxWidth: 240,
    paddingInlineStart: 2.5 * 4,
    backgroundColor: {
      default: 'transparent',
      ':focus-visible': `color-mix(in oklab, ${vars['--color-fd-primary']} 5%, transparent)`,
      ':hover': `color-mix(in oklab, ${vars['--color-fd-primary']} 5%, transparent)`,
    },
    borderRadius: '9999px',
  },
  grow: {
    flexGrow: 1,
  },
  endLinkList: {
    display: { default: 'flex', ':empty': 'none' },
    flexDirection: 'row',
    gap: 2 * 4,
    alignItems: 'center',
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
});
