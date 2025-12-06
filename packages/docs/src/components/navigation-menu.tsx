'use client';

import * as Primitive from '@radix-ui/react-navigation-menu';
import { StyleXComponentProps } from './layout/shared';
import * as stylex from '@stylexjs/stylex';

const NavigationMenu = Primitive.Root;

const NavigationMenuList = Primitive.List;

const commonStyles = stylex.create({
  listNone: {
    listStyleType: 'none',
  },
  accent50: {
    backgroundColor: {
      default: null,
      ':where([data-state=open])':
        'color-mix(in oklab, var(--bg-fd-accent) 50%, transparent)',
    },
  },
  menuContent: {
    position: 'absolute',
    insetInline: 0,
    top: 0,
    overflow: 'auto',
    maxHeight: '80svh',
    '::-webkit-scrollbar': { width: 5, height: 5 },
    '::-webkit-scrollbar-thumb': {
      borderRadius: 5,
      backgroundColor: 'var(--color-fd-border)',
    },
    '::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
    '::-webkit-scrollbar-corner': { display: 'none' },
    // animation: {
    //   default: null,
    //   ':where([data-motion=from-end])': 'var(--animate-fd-enterFromRight)',
    //   ':where([data-motion=from-start])': 'var(--animate-fd-enterFromLeft)',
    //   ':where([data-motion=to-end])': 'var(--animate-fd-exitToRight)',
    //   ':where([data-motion=to-start])': 'var(--animate-fd-exitToLeft)',
    // },
  },
  menuViewport: {
    // 'origin-[top_center] overflow-hidden transition-[width,height] duration-300 data-[state=closed]:animate-fd-nav-menu-out data-[state=open]:animate-fd-nav-menu-in'
    position: 'relative',
    height: 'var(--radix-navigation-menu-viewport-height)',
    width: '100%',
    transformOrigin: 'top center',
    overflow: 'hidden',
    transitionProperty: 'width, height',
    transitionDuration: '300ms',
    // animation: {
    //   default: null,
    //   ':where([data-state=closed])': 'var(--animate-fd-nav-menu-out)',
    //   ':where([data-state=open])': 'var(--animate-fd-nav-menu-in)',
    // },
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
