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
  NavigationMenuViewport,
} from '../../navigation-menu';
import { useNav } from 'fumadocs-ui/contexts/layout';
import {
  buttonVariantStyles,
  buttonSizeVariants,
  buttonStyles,
} from '../../ui/button';
import * as stylex from '@stylexjs/stylex';

export function Navbar({ xstyle, ...props }: StyleXComponentProps<'div'>) {
  const [value, setValue] = useState('');
  const { isTransparent } = useNav();

  return (
    <NavigationMenu value={value} onValueChange={setValue} asChild>
      <header
        id="nd-nav"
        {...props}
        {...stylex.props(
          navbarStyles.header,
          value.length > 0 && navbarStyles.headerWithVals,
          (!isTransparent || value.length > 0) && navbarStyles.headerOpaque,
          xstyle,
        )}
      >
        <NavigationMenuList
          {...stylex.props(navbarStyles.menuList, xstyle)}
          asChild
        >
          <nav>{props.children}</nav>
        </NavigationMenuList>

        <NavigationMenuViewport />
      </header>
    </NavigationMenu>
  );
}

const navbarStyles = stylex.create({
  header: {
    // 'fixed top-(--fd-banner-height) z-40 left-0 right-(--removed-body-scroll-bar-size,0) backdrop-blur-lg border-b transition-colors *:mx-auto *:max-w-fd-container',
    position: 'fixed',
    top: 'var(--fd-banner-height)',
    zIndex: 40,
    insetInlineStart: 0,
    insetInlineEnd: 'var(--removed-body-scroll-bar-size, 0)',
    backdropFilter: 'blur(16px)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-fd-border)',
    transitionProperty: 'color, background-color',
  },
  headerWithVals: {
    // 'max-lg:shadow-lg max-lg:rounded-b-2xl'
    boxShadow: {
      default: null,
      '@media (max-width: 1024px)':
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    },
    borderEndStartRadius: { default: null, '@media (max-width: 1024px)': 16 },
    borderEndEndRadius: { default: null, '@media (max-width: 1024px)': 16 },
  },
  headerOpaque: {
    backgroundColor:
      'color-mix(in oklab, var(--fd-background) 80%, transparent)',
  },
  menuList: {
    marginInline: 'auto',
    maxWidth: 'var(--max-w-fd-container)',
    display: 'flex',
    height: 14 * 4,
    width: '100%',
    alignItems: 'center',
    paddingInline: 4 * 4,
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
        <NavigationMenuLink key={`${j}-${child.url}`} asChild>
          <Link
            href={child.url}
            external={child.external}
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
            <Link href={item.url} external={item.external}>
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
          item={item}
          aria-label={item.type === 'icon' ? item.label : undefined}
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
    ['--svg-size' as any]: '4px',
  },
  default: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1 * 4,
    padding: 2 * 4,
    color: {
      default: 'var(--text-fd-muted-foreground)',
      ':hover': 'var(--text-fd-accent-foreground)',
      ':where([data-active=true])': 'var(--text-fd-primary)',
    },
    transitionProperty: 'color, background-color, border-color',
  },
  button: { gap: 1.5 * 4 },
});
const navItemStyles = stylex.create({
  iconContainer: {
    // w-fit rounded-md border bg-fd-muted p-1 [&_svg]:size-4
    width: 'fit-content',
    borderRadius: '8px',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-fd-border)',
    backgroundColor: 'var(--bg-fd-muted)',
    padding: 4,
    ['--svg-size' as any]: '4px',
  },
  menuLink: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2 * 4,
    borderRadius: '8px',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-fd-border)',
    backgroundColor: {
      default: 'var(--bg-fd-card)',
      ':hover': 'color-mix(in oklab, var(--bg-fd-accent) 80%, transparent)',
    },
    color: { default: null, ':hover': 'var(--text-fd-accent-foreground)' },
    padding: 3 * 4,
    transitionProperty: 'background-color, color',
  },
  menuLinkTitle: {
    // 'text-[15px] font-medium'
    fontSize: `${15 / 16}rem`,
    fontWeight: 500,
  },
  menuLinkDescription: {
    // 'text-sm text-fd-muted-foreground empty:hidden'
    fontSize: `${12 / 16}rem`,
    color: 'var(--text-fd-muted-foreground)',
    display: { default: null, ':empty': 'none' },
  },

  menuTrigger: {
    borderRadius: '8px',
  },
  menuContent: {
    // "grid grid-cols-1 gap-2 p-4 md:grid-cols-2 lg:grid-cols-3"
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr',
      '@media (min-width: 768px) and (max-width: 1024px)': 'repeat(2, 1fr)',
      '@media (min-width: 1024px)': 'repeat(3, 1fr)',
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
              <Link href={item.url} external={item.external}>
                {header}
              </Link>
            </NavigationMenuLink>
          ) : (
            header
          )}
        </p>
        {item.items.map((child, i) => (
          <MenuLinkItem key={i} item={child} />
        ))}
      </div>
    );
  }

  return (
    <NavigationMenuLink asChild>
      <BaseLinkItem
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
        aria-label={item.type === 'icon' ? item.label : undefined}
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
    // mb-4 flex flex-col
    marginBottom: 4 * 4,
    display: 'flex',
    flexDirection: 'column',
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
    alignItems: 'center',
    gap: 2 * 4,
    padding: 1.5 * 4,
    transitionProperty: 'color, background-color, border-color',
    color: {
      default: null,
      ':hover':
        'color-mix(in oklab, var(--text-fd-popover-foreground) 50%, transparent)',
      ':where([data-active=true])': 'var(--text-fd-primary)',
    },
    fontWeight: {
      default: null,
      ':where([data-active=true])': 500,
    },
    ['--svg-size' as any]: '4px',
  },
  button: {
    // gap-1.5 [&_svg]:size-4
    gap: 1.5 * 4,
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
