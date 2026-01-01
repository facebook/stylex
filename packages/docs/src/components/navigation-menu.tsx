/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import * as Primitive from '@radix-ui/react-navigation-menu';
import { StyleXComponentProps } from './layout/shared';
import * as stylex from '@stylexjs/stylex';
import { vars } from '@/theming/vars.stylex';

const NavigationMenu = Primitive.Root;

const NavigationMenuList = Primitive.List;

const commonStyles = stylex.create({
  listNone: {
    listStyleType: 'none',
  },
  accent50: {
    backgroundColor: {
      default: null,
      ':where([data-state=open])': `color-mix(in oklab, ${vars['--color-fd-accent']} 50%, transparent)`,
    },
  },
  menuContent: {
    position: 'absolute',
    insetInline: 0,
    top: 0,
    maxHeight: '80svh',
    overflow: 'auto',
    '::-webkit-scrollbar': { width: 5, height: 5 },
    '::-webkit-scrollbar-corner': { display: 'none' },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: vars['--color-fd-border'],
      borderRadius: 5,
    },
    '::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
  },
  menuViewport: {
    position: 'relative',
    width: '100%',
    height: 'var(--radix-navigation-menu-viewport-height)',
    overflow: 'hidden',
    transformOrigin: 'top center',
    transitionDuration: '300ms',
    transitionProperty: 'width, height',
  },
  menuViewportContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
});

const NavigationMenuItem = ({
  xstyle,
  children,
  ref,
  ...props
}: StyleXComponentProps<typeof Primitive.NavigationMenuItem>) => (
  <Primitive.NavigationMenuItem
    ref={ref}
    {...props}
    {...stylex.props(commonStyles.listNone, xstyle)}
  >
    {children}
  </Primitive.NavigationMenuItem>
);

const NavigationMenuTrigger = ({
  xstyle,
  children,
  ref,
  ...props
}: StyleXComponentProps<typeof Primitive.Trigger>) => (
  <Primitive.Trigger
    ref={ref}
    {...stylex.props(commonStyles.accent50, xstyle)}
    {...props}
  >
    {children}
  </Primitive.Trigger>
);

const NavigationMenuContent = ({
  xstyle,
  ref,
  ...props
}: StyleXComponentProps<typeof Primitive.Content>) => (
  <Primitive.Content
    ref={ref}
    {...props}
    {...stylex.props(commonStyles.menuContent, xstyle)}
  />
);
NavigationMenuContent.displayName = Primitive.Content.displayName;

const NavigationMenuLink = Primitive.Link;

const NavigationMenuViewport = ({
  xstyle,
  ref,
  ...props
}: StyleXComponentProps<typeof Primitive.Viewport>) => (
  <div ref={ref} {...stylex.props(commonStyles.menuViewportContainer)}>
    <Primitive.Viewport
      {...props}
      {...stylex.props(commonStyles.menuViewport, xstyle)}
    />
  </div>
);
NavigationMenuViewport.displayName = Primitive.Viewport.displayName;

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuViewport,
};
