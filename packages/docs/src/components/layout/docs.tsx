'use client';
import type * as PageTree from 'fumadocs-core/page-tree';
import {
  type ReactNode,
  TouchEventHandler,
  use,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { TreeContextProvider, useTreeContext } from 'fumadocs-ui/contexts/tree';
import Link from 'fumadocs-core/link';
import { usePathname } from 'fumadocs-core/framework';
import * as stylex from '@stylexjs/stylex';
import { BaseLayoutProps } from './shared';
import { activeLinkMarker } from '../../theming/vars.stylex';
import { Header } from './home';
import { ChevronDown } from 'lucide-react';
import { SidebarContext } from '@/contexts/SidebarContext';
import Footer from '@/components/Footer';

export interface DocsLayoutProps extends BaseLayoutProps {
  tree: PageTree.Root;
  children: ReactNode;
}

export function DocsLayout({ tree, children, ...props }: DocsLayoutProps) {
  return (
    <TreeContextProvider tree={tree}>
      <Header
        links={props.links}
        nav={props.nav}
        i18n={props.i18n}
        githubUrl={props.githubUrl}
      />

      <div {...stylex.props(layoutStyles.wrapper)}>
        <main id="nd-docs-layout" {...stylex.props(layoutStyles.main)}>
          <Sidebar />
          <div {...stylex.props(layoutStyles.content)}>{children}</div>
          <Footer />
        </main>
      </div>
    </TreeContextProvider>
  );
}
const layoutStyles = stylex.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100dvh - 56px)',
  },
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
    flexDirection: 'column',
    flexGrow: 1,
    // flexDirection: 'row',
    ['--fd-nav-height' as any]: '64px',
    paddingInlineStart: {
      default: 292,
      '@media (max-width: 767.9px)': 0,
    },
  },
  content: {
    // flexGrow: 1,
    // minWidth: 0,
  },
});

function Sidebar() {
  const { root } = useTreeContext();
  const [open] = use(SidebarContext);

  console.log('open', open);

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

  const sidebarRef = useRef<HTMLElement>(null);

  return (
    <div
      {...stylex.props(
        sidebarStyles.container,
        open === true && sidebarStyles.open,
        open === false && sidebarStyles.closed,
      )}
    >
      <div {...stylex.props(sidebarStyles.blurContainer)}>
        <div {...stylex.props(sidebarStyles.blur)} />
      </div>

      <aside {...stylex.props(sidebarStyles.base)} ref={sidebarRef}>
        {children}
      </aside>
    </div>
  );
}
const sidebarStyles = stylex.create({
  container: {
    position: 'fixed',
    top: 64,
    left: 0,
    display: {
      default: 'flex',
      '@media (max-width: 767.9px)': 'none',
    },
    alignSelf: 'flex-start',
    flexShrink: 0,
    padding: 8,
    height: 'calc(100dvh - 64px)',
    transform: {
      default: 'translateX(0px)',
      '@media (max-width: 767.9px)': 'translateX(-100%)',
    },
    transitionProperty: 'transform',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 10,
  },
  open: {
    transform: 'translateX(0)',
  },
  closed: {
    transform: 'translateX(-100%)',
  },
  blurContainer: {
    position: 'absolute',
    inset: 8,
    overflow: 'hidden',
    borderRadius: 20,
    cornerShape: 'squircle',
    zIndex: 1,
  },
  blur: {
    position: 'absolute',
    inset: -64,
    insetInlineStart: -8,
    backdropFilter: 'blur(32px) saturate(800%)',
  },
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: 4 * 4,
    fontSize: `1rem`,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    width: 280,
    height: '100%',
    borderRadius: 20,
    cornerShape: 'squircle',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-fd-border)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
    zIndex: 10,
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
  return <SidebarItemFolder item={item}>{children}</SidebarItemFolder>;
}

function SidebarItemFolder({
  item,
  children,
}: {
  item: PageTree.Folder;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isDescendantActive = useMemo(() => {
    const check = (item: PageTree.Node) => {
      if (item.type === 'page') {
        return pathname === item.url;
      }
      if (item.type === 'folder') {
        if (item.index && pathname.startsWith(item.index.url)) {
          return true;
        }
        return item.children.some(check);
      }
      return false;
    };
    return check(item);
  }, [pathname, item]);
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (isDescendantActive) {
      if (ref.current) {
        ref.current.open = true;
      }
    }
  }, [isDescendantActive]);

  // type "folder"
  return (
    <details {...stylex.props(sidebarItemStyles.details)} ref={ref}>
      <summary {...stylex.props(sidebarItemStyles.summary)}>
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
        <ChevronDown {...stylex.props(sidebarItemStyles.chevron)} />
      </summary>
      <div {...stylex.props(sidebarItemStyles.childContainer)}>{children}</div>
    </details>
  );
}

const sidebarItemStyles = stylex.create({
  separator: {
    // text-fd-muted-foreground mt-6 mb-2 first:mt-0
    fontSize: `${14 / 16}rem`,
    color: 'var(--text-fd-muted-foreground)',
    marginTop: { default: 5 * 4, ':first-child': 0 },
    marginBottom: 1.5 * 4,
  },
  details: {
    '--rotation': {
      default: '-90deg',
      ':is([open])': '0deg',
    },
    ['--summary-color']: {
      default: null,
      [stylex.when.descendant(':is(*)', activeLinkMarker)]:
        'color-mix(in oklab, var(--color-fd-primary) 50%, var(--color-fd-foreground))',
    },
    // '--details-child-height': {
    //   default: '0px',
    //   ':is([open])': 'auto',
    // },
  },
  summary: {
    listStyle: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevron: {
    width: 14,
    height: 14,
    flexShrink: 0,
    transform: 'rotate(var(--rotation))',
    transitionProperty: 'transform',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  summaryLink: {
    color:
      'var(--summary-color, color-mix(in oklab, var(--text-fd-foreground) 80%, transparent))',
  },
  textStart: { textAlign: 'start' },
  childContainer: {
    marginInlineStart: 1,
    paddingInlineStart: 15,
    borderInlineStartWidth: 1,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: 'var(--color-fd-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    ['--summary-color' as any]: 'initial',
  },
});

const linkVariants = stylex.create({
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: `1rem`,
    lineHeight: 1.42,
    gap: 2 * 4,
    paddingBlock: 1.5 * 4,
    borderRadius: '8px',
    color:
      'var(--summary-color, color-mix(in oklab, var(--text-fd-foreground) 80%, transparent))',
  },
  active: {
    fontWeight: 500,
    color: 'var(--color-fd-primary)',
  },
  inactive: {
    color: {
      default:
        'var(--summary-color, color-mix(in oklab, var(--text-fd-foreground) 80%, transparent))',
      ':hover': 'var(--text-fd-accent-foreground)',
    },
  },
});
