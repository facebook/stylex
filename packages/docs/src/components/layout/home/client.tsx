/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';
import { type ComponentProps, Fragment, useState } from 'react';
import Link from 'fumadocs-core/link';
import {
  BaseLinkItem,
  LinkItemType,
  StyleXComponentProps,
} from '../shared/index';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../../navigation-menu';
import {
  buttonVariantStyles,
  buttonSizeVariants,
  buttonStyles,
} from '../../ui/button';
import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { vars } from '../../../theming/vars.stylex';

export function Navbar({
  xstyle,
  disableShadowBlur,
  ...props
}: StyleXComponentProps<'div'> & { disableShadowBlur?: boolean }) {
  const [value, setValue] = useState('');
  return (
    <NavigationMenu asChild onValueChange={setValue} value={value}>
      <>
        <div {...stylex.props(navbarStyles.gap)} />
        <header
          id="nd-nav"
          {...props}
          {...stylex.props(navbarStyles.header, xstyle)}
        >
          <div
            {...stylex.props(
              navbarStyles.gradientBlur,
              disableShadowBlur && navbarStyles.disableShadowBlur,
            )}
          />
          <div
            {...stylex.props(
              navbarStyles.gradientFade,
              disableShadowBlur && navbarStyles.disableShadowBlur,
            )}
          />
          <div {...stylex.props(navbarStyles.backdrop)}>
            <div {...stylex.props(navbarStyles.blur)} />
          </div>

          <NavigationMenuList
            {...stylex.props(navbarStyles.menuList, xstyle)}
            asChild
          >
            <nav {...stylex.props(navbarStyles.nav)}>{props.children}</nav>
          </NavigationMenuList>
          <div {...stylex.props(navbarStyles.overlayBlur)} />
        </header>
      </>
    </NavigationMenu>
  );
}

const navbarStyles = stylex.create({
  gap: {
    height: 56,
  },
  nav: {
    display: 'flex',
    flexDirection: 'row',
    gap: 4 * 4,
    alignItems: 'center',
    paddingInline: 4 * 4,
  },
  header: {
    position: 'fixed',
    insetInline: 0,
    top: 0,
    zIndex: 10,
    height: 56 + 16,
    padding: 8,
  },
  backdrop: {
    position: 'absolute',
    inset: 8,
    overflow: 'hidden',
    pointerEvents: 'none',
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 20,
    cornerShape: 'squircle',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
  },
  blur: {
    position: 'absolute',
    inset: -8,
    bottom: -32,
    pointerEvents: 'none',
    backdropFilter: 'blur(16px) saturate(600%)',
  },
  gradientBlur: {
    position: 'absolute',
    inset: -8,
    bottom: -32,
    pointerEvents: 'none',
    backdropFilter: 'blur(32px)',
    maskImage: 'linear-gradient(to bottom, white 30%, transparent)',
  },
  gradientFade: {
    position: 'absolute',
    inset: -8,
    bottom: -32,
    pointerEvents: 'none',
    backgroundColor: vars['--color-fd-background'],
    maskImage:
      'linear-gradient(to bottom, rgba(255, 255, 255, 0.8) 50%, transparent)',
  },
  disableShadowBlur: {
    bottom: -8,
  },
  overlayBlur: {
    position: 'absolute',
    inset: 9,
    zIndex: 10,
    overflow: 'hidden',
    pointerEvents: 'none',
    backgroundColor: 'transparent',
    borderRadius: 19,
    cornerShape: 'squircle',
    backdropFilter: 'blur(20px) saturate(1000%)',
    maskImage:
      'linear-gradient(to bottom, white, transparent 16%, transparent 84%, white)',
  },
  menuList: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: 'var(--max-w-fd-container)',
    height: 14 * 4,
    paddingInline: 4 * 4,
    marginInline: 'auto',
  },
});

export function NavbarLinkItem({
  item,
  xstyle,
}: {
  item: LinkItemType;
  xstyle?: stylex.StyleXStyles;
}) {
  if (item.type === 'custom')
    return <div {...stylex.props(xstyle)}>{item.children}</div>;

  if (item.type === 'menu') {
    const children = item.items.map((child, j) => {
      if (child.type === 'custom') {
        return <Fragment key={j}>{child.children}</Fragment>;
      }

      const {
        banner = child.icon ? (
          <div {...stylex.props(navItemStyles.iconContainer)}>{child.icon}</div>
        ) : null,
        xstyle: menuLinkXstyle,
        ...rest
      } = child.menu ?? {};

      return (
        <NavigationMenuLink asChild key={`${j}-${child.url}`}>
          <Link
            external={child.external}
            href={child.url}
            {...rest}
            {...stylex.props(navItemStyles.menuLink, menuLinkXstyle)}
          >
            {rest.children ?? (
              <>
                {banner}
                <p {...stylex.props(navItemStyles.menuLinkTitle)}>
                  {child.text}
                </p>
                <p {...stylex.props(navItemStyles.menuLinkDescription)}>
                  {child.description}
                </p>
              </>
            )}
          </Link>
        </NavigationMenuLink>
      );
    });

    return (
      <NavigationMenuItem>
        <NavigationMenuTrigger
          {...stylex.props(
            navItemVariants.base,
            navItemVariants.default,
            navItemStyles.menuTrigger,
            xstyle,
          )}
        >
          {item.url ? (
            <Link external={item.external} href={item.url}>
              {item.text}
            </Link>
          ) : (
            item.text
          )}
        </NavigationMenuTrigger>
        <NavigationMenuContent xstyle={navItemStyles.menuContent}>
          {children}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        <BaseLinkItem
          aria-label={item.type === 'icon' ? item.label : undefined}
          item={item}
          xstyle={[
            navItemVariants.base,
            item.type === 'main' && navItemVariants.default,
            item.type === 'button' && [
              buttonStyles.base,
              buttonVariantStyles.secondary,
              navItemVariants.button,
            ],
            item.type === 'icon' && [
              buttonStyles.base,
              buttonSizeVariants.icon,
              buttonVariantStyles.ghost,
            ],
            xstyle,
          ]}
        >
          {item.type === 'icon' ? item.icon : item.text}
        </BaseLinkItem>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

const navItemVariants = stylex.create({
  base: {
    // eslint-disable-next-line @stylexjs/valid-styles
    ['--svg-size' as any]: '4px',
  },
  default: {
    display: 'inline-flex',
    gap: 1 * 4,
    alignItems: 'center',
    padding: 2 * 4,
    color: {
      default: vars['--color-fd-secondary-foreground'],
      ':where([data-active=true])': vars['--color-fd-primary'],
      ':hover': vars['--color-fd-primary'],
    },
    borderRadius: 8,
    cornerShape: 'squircle',
  },
  button: { gap: 1.5 * 4 },
});
const navItemStyles = stylex.create({
  iconContainer: {
    // w-fit rounded-md border bg-fd-muted p-1 [&_svg]:size-4
    width: 'fit-content',
    padding: 4,
    backgroundColor: vars['--color-fd-muted'],
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: '8px',
    // eslint-disable-next-line @stylexjs/valid-styles
    ['--svg-size' as any]: '4px',
  },
  menuLink: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2 * 4,
    padding: 3 * 4,
    color: { default: null, ':hover': 'var(--text-fd-primary)' },
    backgroundColor: {
      default: 'var(--bg-fd-card)',
      ':hover': `color-mix(in oklab, ${vars['--color-fd-accent']} 80%, transparent)`,
    },
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: '8px',
    transitionProperty: 'background-color, color',
  },
  menuLinkTitle: {
    // 'text-[15px] font-medium'
    fontSize: `${15 / 16}rem`,
    fontWeight: 500,
  },
  menuLinkDescription: {
    display: { default: null, ':empty': 'none' },
    // 'text-sm text-fd-muted-foreground empty:hidden'
    fontSize: `${12 / 16}rem`,
    color: 'var(--text-fd-muted-foreground)',
  },

  menuTrigger: {
    borderRadius: '8px',
  },
  menuContent: {
    // "grid grid-cols-1 gap-2 p-4 md:grid-cols-2 lg:grid-cols-3"
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 1024px)': 'repeat(3, 1fr)',
      '@media (min-width: 768px) and (max-width: 1024px)': 'repeat(2, 1fr)',
    },
    gap: 2 * 4,
    padding: 4 * 4,
  },
});

export const Menu = NavigationMenuItem;

export function MenuLinkItem({
  item,
  xstyle,
}: {
  item: LinkItemType;
  xstyle?: stylex.StyleXStyles;
}) {
  if (item.type === 'custom')
    return (
      <div {...stylex.props(menuLinkStyles.grid, xstyle)}>{item.children}</div>
    );

  if (item.type === 'menu') {
    const header = (
      <>
        {item.icon}
        {item.text}
      </>
    );

    return (
      <div {...stylex.props(menuLinkStyles.menuContainer, xstyle)}>
        <p {...stylex.props(menuLinkStyles.para)}>
          {item.url ? (
            <NavigationMenuLink asChild>
              <Link external={item.external} href={item.url}>
                {header}
              </Link>
            </NavigationMenuLink>
          ) : (
            header
          )}
        </p>
        {item.items.map((child, i) => (
          <MenuLinkItem item={child} key={i} />
        ))}
      </div>
    );
  }

  return (
    <NavigationMenuLink asChild>
      <BaseLinkItem
        aria-label={item.type === 'icon' ? item.label : undefined}
        item={item}
        xstyle={[
          (item.type == null || item.type === 'main') &&
            menuLinkStyles.baseLinkItem,
          item.type === 'icon' && [
            buttonStyles.base,
            buttonSizeVariants.icon,
            buttonVariantStyles.ghost,
          ],
          item.type === 'button' && [
            buttonStyles.base,
            buttonVariantStyles.secondary,
            menuLinkStyles.button,
          ],
          xstyle,
        ]}
      >
        {item.icon}
        {item.type === 'icon' ? undefined : item.text}
      </BaseLinkItem>
    </NavigationMenuLink>
  );
}

const menuLinkStyles = stylex.create({
  grid: { display: 'grid' },
  menuContainer: {
    display: 'flex',
    flexDirection: 'column',
    // mb-4 flex flex-col
    marginBottom: 4 * 4,
  },
  para: {
    // "mb-1 text-sm text-fd-muted-foreground"
    marginBottom: 1 * 4,
    fontSize: `${12 / 16}rem`,
    color: 'var(--text-fd-muted-foreground)',
  },
  baseLinkItem: {
    // 'inline-flex items-center gap-2 py-1.5 transition-colors hover:text-fd-popover-foreground/50 data-[active=true]:font-medium data-[active=true]:text-fd-primary [&_svg]:size-4'
    display: 'inline-flex' as any,
    gap: 2 * 4,
    alignItems: 'center',
    padding: 1.5 * 4,
    fontWeight: {
      default: null,
      ':where([data-active=true])': 500,
    },
    color: {
      default: null,
      ':where([data-active=true])': 'var(--text-fd-primary)',
      ':hover':
        'color-mix(in oklab, var(--text-fd-popover-foreground) 50%, transparent)',
    },
    transitionProperty: 'color, background-color, border-color',
    // eslint-disable-next-line @stylexjs/valid-styles
    ['--svg-size' as any]: '4px',
  },
  button: {
    // gap-1.5 [&_svg]:size-4
    gap: 1.5 * 4,
    // eslint-disable-next-line @stylexjs/valid-styles
    ['--svg-size' as any]: '4px',
  },
});

export function MenuTrigger({
  enableHover = false,
  ...props
}: ComponentProps<typeof NavigationMenuTrigger> & {
  /**
   * Enable hover to trigger
   */
  enableHover?: boolean;
}) {
  return (
    <NavigationMenuTrigger
      {...props}
      onPointerMove={enableHover ? undefined : (e) => e.preventDefault()}
    >
      {props.children}
    </NavigationMenuTrigger>
  );
}

export function MenuContent({
  xstyle,
  ...props
}: StyleXComponentProps<typeof NavigationMenuContent>) {
  return (
    <NavigationMenuContent
      {...props}
      {...stylex.props(menuContentStyles.base, xstyle)}
    >
      {props.children}
    </NavigationMenuContent>
  );
}

const menuContentStyles = stylex.create({
  base: {
    // "flex flex-col p-4"
    display: 'flex',
    flexDirection: 'column',
    padding: 4 * 4,
  },
});
