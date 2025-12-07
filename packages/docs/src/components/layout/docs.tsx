'use client';
import type * as PageTree from 'fumadocs-core/page-tree';
import {
  type ReactNode,
  TouchEventHandler,
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
        themeSwitch={props.themeSwitch}
        searchToggle={props.searchToggle}
        i18n={props.i18n}
        githubUrl={props.githubUrl}
      />

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

function Sidebar() {
  const { root } = useTreeContext();

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

  const sidebarRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const isPointerEnabledRef = useRef(false);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.scrollLeft = 9999;
    }
  }, []);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    const base = baseRef.current;
    if (!sidebar || !base) {
      return;
    }
    let initialScrollLeft = sidebar.scrollLeft;
    let initialPageY: number | null = null;
    let initialPageX: number | null = null;
    let lastPageX: number | null = null;
    let lastDeltaX: number | null = null;
    let translate: number | null = null;
    const handleTouchEnd = () => {
      if (lastDeltaX == null || lastPageX == null || translate == null) {
        return;
      }

      const ddx = lastDeltaX;
      const lastTranslate = translate;

      const frames = [
        { transform: `translateX(${lastTranslate}px)` },
        { transform: `translateX(${ddx > 0 ? 300 : 0}px)` },
      ];
      const animation = base.animate(frames, {
        duration: 200,
        easing: 'ease-in-out',
      });
      animation.onfinish = () => {
        setTimeout(() => {
          base.style.transform = `translateX(0)`;
          if (ddx > 0) {
            sidebar.scrollTo({ left: 0, behavior: 'instant' });
          } else {
            sidebar.scrollTo({ left: 9999, behavior: 'instant' });
          }
        }, 300);
      };

      reset();
    };
    const reset = () => {
      translate = null;
      initialPageX = null;
      initialPageY = null;
      lastPageX = null;
      document.body.removeEventListener('touchend', handleTouchEnd);
    };
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // if in a scrollable container
      if (
        target.matches(
          'pre, pre *, [data-sidebar="sidebar"], [data-sidebar="sidebar"] *',
        )
      ) {
        return;
      }
      const touch = e.touches[0];
      if (
        !touch ||
        sidebar.scrollLeft < 20 ||
        window.matchMedia('(min-width: 768px)').matches
      ) {
        return;
      }
      initialPageX = touch.pageX;
      initialPageY = touch.pageY;
      lastPageX = touch.pageX;
      document.body.addEventListener('touchend', handleTouchEnd);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (
        isPointerEnabledRef.current ||
        !touch ||
        initialPageX == null ||
        lastPageX == null ||
        initialPageY == null
      ) {
        return;
      }

      lastDeltaX = touch.pageX - lastPageX;
      lastPageX = touch.pageX;

      translate = touch.pageX - initialPageX;
      base.style.transform = `translateX(${translate}px)`;

      if (Math.abs(touch.pageY - initialPageY) > 20) {
        lastDeltaX = -1;
        handleTouchEnd();
      }
    };

    document.body.addEventListener('touchstart', handleTouchStart);
    document.body.addEventListener('touchmove', handleTouchMove);
    return () => {
      document.body.removeEventListener('touchstart', handleTouchStart);
      document.body.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div
      {...stylex.props(sidebarStyles.container)}
      data-sidebar="sidebar"
      ref={sidebarRef}
      onScroll={() => {
        const sidebar = sidebarRef.current;
        if (sidebar) {
          if (sidebar.scrollLeft > 20) {
            sidebar.style.pointerEvents = 'none';
            isPointerEnabledRef.current = false;
          } else {
            sidebar.style.pointerEvents = 'auto';
            isPointerEnabledRef.current = true;
          }
        }
      }}
    >
      <aside {...stylex.props(sidebarStyles.base)} ref={baseRef}>
        {children}
      </aside>
      <div {...stylex.props(sidebarStyles.overlay)}>
        {/* <div {...stylex.props(sidebarStyles.edge)} /> */}
      </div>
    </div>
  );
}
const fadeInOut = stylex.keyframes({
  from: { opacity: 1, backdropFilter: 'blur(4px)' },
  to: { opacity: 0, backdropFilter: 'none' },
});
const sidebarStyles = stylex.create({
  container: {
    position: 'fixed',
    top: 14 * 4,
    left: 0,
    display: 'flex',
    flexDirection: 'row',
    height: 'calc(120dvh)',
    width: {
      default: '100vw',
      '@media (min-width: 768px)': 300,
    },
    zIndex: 20,
    pointerEvents: 'none',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    overscrollBehavior: 'contain',
  },
  base: {
    scrollSnapAlign: 'start',
    display: 'flex',
    pointerEvents: 'auto',
    flexDirection: 'column',
    flexShrink: 0,
    padding: 4 * 4,
    zIndex: 20,
    fontSize: `${12 / 16}rem`,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    height: 'calc(100dvh - 56px)',
    width: '100vw',
    maxWidth: 300,

    insetInlineStart: {
      default: null,
      '@media (max-width: 767px)': 0,
    },
    bottom: 0,
    backgroundColor: 'black',
  },
  overlay: {
    scrollSnapAlign: 'start',
    position: 'relative',
    pointerEvents: 'none',
    flexShrink: 0,
    height: '100%',
    width: '100%',
    display: {
      default: 'none',
      '@media (max-width: 767px)': 'block',
    },
    backdropFilter: 'blur(4px)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    animationName: fadeInOut,
    animationTimingFunction: 'linear',
    animationFillMode: 'forwards',
    animationTimeline: 'scroll(nearest inline)',
  },
  edge: {
    pointerEvents: 'auto',
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 48,
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
