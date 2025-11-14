'use client';
import type * as PageTree from 'fumadocs-core/page-tree';
import { type ComponentProps, type ReactNode, useMemo } from 'react';
import { TreeContextProvider, useTreeContext } from 'fumadocs-ui/contexts/tree';
import Link from 'fumadocs-core/link';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { useSidebar } from 'fumadocs-ui/contexts/sidebar';
import { usePathname } from 'fumadocs-core/framework';
import * as stylex from '@stylexjs/stylex';
import { BaseLayoutProps, StyleXComponentProps } from './shared';
import { activeLinkMarker } from '../../theming/vars.stylex';

export interface DocsLayoutProps extends BaseLayoutProps {
  tree: PageTree.Root;
  children: ReactNode;
}

export function DocsLayout({ tree, children, ...props }: DocsLayoutProps) {
  return (
    <TreeContextProvider tree={tree}>
      <header {...stylex.props(layoutStyles.header)}>
        <nav {...stylex.props(layoutStyles.nav)}>
          <NavbarSidebarTrigger
            {...stylex.props(layoutStyles.sidebarTrigger)}
          />
          <Link href="/" {...stylex.props(layoutStyles.title)}>
            {props.nav?.title ?? 'My Docs'}
          </Link>

          <div {...stylex.props(layoutStyles.gap)} />
          <SearchToggle />
        </nav>
      </header>
      <main id="nd-docs-layout" {...stylex.props(layoutStyles.main)}>
        <Sidebar />
        {children}
      </main>
    </TreeContextProvider>
  );
}
const layoutStyles = stylex.create({
  header: {
    // sticky top-0 bg-fd-background h-14 z-20
    position: 'sticky',
    display: 'flex',
    top: 0,
    backgroundColor: 'var(--bg-fd-background)',
    height: '56px',
    zIndex: 20,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-fd-border)',
  },
  nav: {
    // flex flex-row items-center gap-2 size-full px-4
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2 * 4,
    width: '100%',
    paddingInline: 4 * 4,
  },
  title: {},
  gap: {
    flexGrow: 1,
  },
  sidebarTrigger: {
    // md:hidden
    // display: { default: 'none', '@media (min-width: 768px)': 'block' },
  },
  main: {
    // flex flex-1 flex-row [--fd-nav-height:56px]
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'row',
    ['--fd-nav-height' as any]: '56px',
  },
});

function SearchToggle({ xstyle, ...props }: StyleXComponentProps<'button'>) {
  const { enabled, setOpenSearch } = useSearchContext();
  if (!enabled) return;

  return (
    <button
      {...props}
      {...stylex.props(commonStyles.base, xstyle)}
      onClick={() => setOpenSearch(true)}
    >
      Search
    </button>
  );
}

function NavbarSidebarTrigger({
  xstyle,
  ...props
}: StyleXComponentProps<'button'>) {
  const { open, setOpen } = useSidebar();

  return (
    <button
      {...props}
      {...stylex.props(commonStyles.base, xstyle)}
      onClick={() => setOpen(!open)}
    >
      {props.children ?? 'Sidebar'}
    </button>
  );
}
const commonStyles = stylex.create({
  base: { fontSize: `${12 / 16}rem` },
});

function Sidebar() {
  const { root } = useTreeContext();
  const { open } = useSidebar();

  const children = useMemo(() => {
    function renderItems(items: PageTree.Node[]) {
      return items.map((item) => (
        <SidebarItem key={item.$id} item={item}>
          {item.type === 'folder' ? renderItems(item.children) : null}
        </SidebarItem>
      ));
    }

    return renderItems(root.children);
  }, [root]);

  return (
    <aside
      {...stylex.props(sidebarStyles.base, !open && sidebarStyles.notOpen)}
    >
      {children}
    </aside>
  );
}
const sidebarStyles = stylex.create({
  base: {
    // 'fixed flex flex-col shrink-0 p-4 top-14 z-20 text-sm overflow-auto md:sticky md:h-[calc(100dvh-56px)] md:w-[300px]',
    position: {
      default: 'fixed',
      '@media (min-width: 768px)': 'sticky',
    },
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    padding: 4 * 4,
    top: 14 * 4,
    zIndex: 20,
    fontSize: `${12 / 16}rem`,
    overflow: 'auto',
    height: {
      default: null,
      '@media (min-width: 768px)': 'calc(100dvh - 56px)',
    },
    width: {
      default: null,
      '@media (min-width: 768px)': '300px',
    },

    // 'max-md:inset-x-0 max-md:bottom-0 max-md:bg-fd-background',
    insetInlineStart: {
      default: null,
      '@media (max-width: 767px)': 0,
    },
    bottom: {
      default: null,
      '@media (max-width: 767px)': 0,
    },
    backgroundColor: {
      default: null,
      '@media (max-width: 767px)': 'var(--bg-fd-background)',
    },
  },
  notOpen: {
    display: 'none',
  },
});

function SidebarItem({
  item,
  children,
}: {
  item: PageTree.Node;
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (item.type === 'page') {
    return (
      <Link
        href={item.url}
        {...stylex.props(
          linkVariants.base,
          pathname === item.url ? linkVariants.active : linkVariants.inactive,
          pathname === item.url && activeLinkMarker,
        )}
      >
        {item.icon}
        {item.name}
      </Link>
    );
  }

  if (item.type === 'separator') {
    return (
      <p {...stylex.props(sidebarItemStyles.separator)}>
        {item.icon}
        {item.name}
      </p>
    );
  }

  // type "folder"
  return (
    <details {...stylex.props(sidebarItemStyles.details)}>
      <summary>
        {item.index ? (
          <Link
            {...stylex.props(
              linkVariants.base,
              sidebarItemStyles.summaryLink,
              pathname === item.index.url
                ? linkVariants.active
                : linkVariants.inactive,
            )}
            href={item.index.url}
          >
            {item.index.icon}
            {item.index.name}
          </Link>
        ) : (
          <p
            {...stylex.props(
              linkVariants.base,
              sidebarItemStyles.summaryLink,
              sidebarItemStyles.textStart,
            )}
          >
            {item.icon}
            {item.name}
          </p>
        )}
      </summary>
      <div {...stylex.props(sidebarItemStyles.childContainer)}>{children}</div>
    </details>
  );
}
const sidebarItemStyles = stylex.create({
  separator: {
    // text-fd-muted-foreground mt-6 mb-2 first:mt-0
    color: 'var(--text-fd-muted-foreground)',
    marginTop: { default: 6 * 4, ':first-child': 0 },
    marginBottom: 2 * 4,
  },
  details: {
    ['--summary-color' as any]: {
      default: null,
      [stylex.when.descendant(':is(*)', activeLinkMarker)]: 'hotpink',
    },
  },
  summaryLink: {
    color:
      'var(--summary-color, color-mix(in oklab, var(--text-fd-foreground) 80%, transparent))',
  },
  textStart: { textAlign: 'start' },
  childContainer: {
    paddingInlineStart: 4 * 4,
    borderInlineStartWidth: 1,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: 'var(--color-fd-border)',
    display: 'flex',
    flexDirection: 'column',
    ['--summary-color' as any]: 'initial',
  },
});

const linkVariants = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2 * 4,
    // width: '100%',
    padding: 1.5 * 4,
    borderRadius: '8px',
    color: 'color-mix(in oklab, var(--text-fd-foreground) 80%, transparent)',
  },
  active: {
    fontWeight: 500,
    color: 'hotpink',
  },
  inactive: {
    color: {
      default:
        'color-mix(in oklab, var(--text-fd-foreground) 80%, transparent)',
      ':hover': 'var(--text-fd-accent-foreground)',
    },
  },
});
