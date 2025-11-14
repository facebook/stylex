import { useMemo } from 'react';
import {
  type BaseLayoutProps,
  getLinks,
  type LinkItemType,
  type NavOptions,
  StyleXAttributes,
} from '../shared/index';
import { NavProvider } from 'fumadocs-ui/contexts/layout';
import { LargeSearchToggle, SearchToggle } from '../../search-toggle';
import { ThemeToggle } from '../../theme-toggle';
import { LanguageToggle, LanguageToggleText } from '../../language-toggle';
import { ChevronDown, Languages } from 'lucide-react';
import Link from 'fumadocs-core/link';
import {
  Navbar,
  NavbarLinkItem,
  Menu,
  MenuContent,
  MenuLinkItem,
  MenuTrigger,
} from './client';
import {
  buttonStyles,
  buttonSizeVariants,
  buttonVariantStyles,
} from '../../ui/button';
import * as stylex from '@stylexjs/stylex';

export interface HomeLayoutProps extends BaseLayoutProps {
  nav?: Partial<
    NavOptions & {
      /**
       * Open mobile menu when hovering the trigger
       */
      enableHoverToOpen?: boolean;
    }
  >;
}

export function HomeLayout(
  props: HomeLayoutProps & StyleXAttributes<HTMLElement>,
) {
  const {
    nav = {},
    links,
    githubUrl,
    i18n,
    themeSwitch = {},
    searchToggle,
    xstyle,
    ...rest
  } = props;

  return (
    <NavProvider transparentMode={nav?.transparentMode}>
      <main
        id="nd-home-layout"
        {...rest}
        {...stylex.props(styles.main, xstyle)}
      >
        {nav.enabled !== false &&
          (nav.component ?? (
            <Header
              links={links}
              nav={nav}
              themeSwitch={themeSwitch}
              searchToggle={searchToggle}
              i18n={i18n}
              githubUrl={githubUrl}
            />
          ))}
        {props.children}
      </main>
    </NavProvider>
  );
}

export function Header({
  nav = {},
  i18n = false,
  links,
  githubUrl,
  themeSwitch = {},
  searchToggle = {},
}: HomeLayoutProps) {
  const finalLinks = useMemo(
    () => getLinks(links, githubUrl),
    [links, githubUrl],
  );

  const navItems = finalLinks.filter((item) =>
    ['nav', 'all'].includes(item.on ?? 'all'),
  );
  const menuItems = finalLinks.filter((item) =>
    ['menu', 'all'].includes(item.on ?? 'all'),
  );

  return (
    <Navbar>
      <Link {...stylex.props(styles.navTitleLink)} href={nav.url ?? '/'}>
        {nav.title}
      </Link>
      {nav.children}
      <ul {...stylex.props(styles.navLinkList)}>
        {navItems
          .filter((item) => !isSecondary(item))
          .map((item, i) => (
            <NavbarLinkItem
              key={i}
              item={item}
              xstyle={styles.navbarLinkItem}
            />
          ))}
      </ul>
      <div {...stylex.props(styles.searchContainer)}>
        {searchToggle.enabled !== false &&
          (searchToggle.components?.lg ?? (
            <LargeSearchToggle
              xstyle={styles.largeSearchToggle}
              hideIfDisabled
            />
          ))}
        {themeSwitch.enabled !== false &&
          (themeSwitch.component ?? <ThemeToggle mode={themeSwitch?.mode} />)}
        {i18n && (
          <LanguageToggle>
            <Languages {...stylex.props(styles.languageToggle)} />
          </LanguageToggle>
        )}
        <ul {...stylex.props(styles.endLinkList)}>
          {navItems.filter(isSecondary).map((item, i) => (
            <NavbarLinkItem
              key={i}
              item={item}
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
      </div>
      <ul {...stylex.props(styles.mobileSearchContainer)}>
        {searchToggle.enabled !== false &&
          (searchToggle.components?.sm ?? (
            <SearchToggle xstyle={styles.mobileSearchToggle} hideIfDisabled />
          ))}
        <Menu>
          <MenuTrigger
            {...stylex.props(
              buttonStyles.base,
              buttonSizeVariants.icon,
              buttonVariantStyles.ghost,
              stylex.defaultMarker(),
            )}
            aria-label="Toggle Menu"
            enableHover={nav.enableHoverToOpen}
          >
            <ChevronDown {...stylex.props(styles.menuTriggerIcon)} />
          </MenuTrigger>
          <MenuContent xstyle={styles.mobileMenuContent}>
            {menuItems
              .filter((item) => !isSecondary(item))
              .map((item, i) => (
                <MenuLinkItem
                  key={i}
                  item={item}
                  xstyle={styles.primaryMenuLink}
                />
              ))}
            <div {...stylex.props(styles.themeSwitchContainer)}>
              {menuItems.filter(isSecondary).map((item, i) => (
                <MenuLinkItem
                  key={i}
                  item={item}
                  xstyle={styles.secondaryMenuLink}
                />
              ))}
              <div role="separator" {...stylex.props(styles.separator)} />
              {i18n ? (
                <LanguageToggle>
                  <Languages {...stylex.props(styles.mobileLanguageToggle)} />
                  <LanguageToggleText />
                  <ChevronDown {...stylex.props(styles.languageChevron)} />
                </LanguageToggle>
              ) : null}
              {themeSwitch.enabled !== false &&
                (themeSwitch.component ?? (
                  <ThemeToggle mode={themeSwitch?.mode} />
                ))}
            </div>
          </MenuContent>
        </Menu>
      </ul>
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
    paddingTop: 14 * 4,
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
    paddingInline: 6 * 4,
  },
  navbarLinkItem: {
    // "text-sm"
    fontSize: `${12 / 16}rem`,
    lineHeight: 1.4,
  },
  searchContainer: {
    // flex flex-row items-center justify-end gap-1.5 flex-1 max-lg:hidden
    display: { default: 'flex', '@media (max-width: 1024px)': 'none' },
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'end',
    gap: 1.5 * 4,
    flexGrow: 1,
  },
  largeSearchToggle: {
    // "w-full rounded-full ps-2.5 max-w-[240px]"
    width: '100%',
    borderRadius: '9999px',
    paddingInlineStart: 2.5 * 4,
    maxWidth: 240 * 4,
  },
  languageToggle: {
    height: 20,
    width: 20,
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
      default: 'var(--display)',
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
