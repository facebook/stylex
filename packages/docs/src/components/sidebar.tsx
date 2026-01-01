/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import { ChevronDown, ExternalLink } from 'lucide-react';
import { usePathname } from 'fumadocs-core/framework';
import {
  type ComponentProps,
  createContext,
  type FC,
  Fragment,
  type ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link, { type LinkProps } from 'fumadocs-core/link';
import { useOnChange } from 'fumadocs-core/utils/use-on-change';
import { ScrollArea, ScrollViewport } from './ui/scroll-area';
import { isActive } from '../lib/is-active';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import type {
  CollapsibleContentProps,
  CollapsibleTriggerProps,
} from '@radix-ui/react-collapsible';
import type * as PageTree from 'fumadocs-core/page-tree';
import { useTreeContext, useTreePath } from 'fumadocs-ui/contexts/tree';
import { useMediaQuery } from 'fumadocs-core/utils/use-media-query';
import { StyleXComponentProps } from './layout/shared';
import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { vars } from '../theming/vars.stylex';

export interface SidebarProps {
  /**
   * Open folders by default if their level is lower or equal to a specific level
   * (Starting from 1)
   *
   * @defaultValue 0
   */
  defaultOpenLevel?: number;

  /**
   * Prefetch links
   *
   * @defaultValue true
   */
  prefetch?: boolean;

  /**
   * Children to render
   */
  Content: ReactNode;

  /**
   * Alternative children for mobile
   */
  Mobile?: ReactNode;
}

interface InternalContext {
  defaultOpenLevel: number;
  prefetch: boolean;
  level: number;
}

const itemVariants = stylex.create({
  base: {
    // text-fd-muted-foreground [overflow-wrap:anywhere] [&_svg]:size-4 [&_svg]:shrink-0
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    gap: 2 * 4,
    alignItems: 'center',
    padding: 2 * 4,
    paddingInlineStart: `calc(${vars['--spacing']} * 2)`,
    color: {
      default: vars['--color-fd-muted-foreground'],
      ':hover': `color-mix(in oklab, ${vars['--color-fd-accent-foreground']} 80%, transparent)`,
    },
    textAlign: 'start',
    overflowWrap: 'anywhere',
    backgroundColor: {
      default: null,
      ':hover': `color-mix(in oklab, ${vars['--color-fd-accent']} 50%, transparent)`,
    },
    borderRadius: 8,
    transitionProperty: {
      default: 'color, background-color, border-color',
      ':hover': 'none',
    },
  },
  active: {
    color: vars['--color-fd-primary'],
    backgroundColor: `color-mix(in oklab, ${vars['--color-fd-primary']} 10%, transparent)`,
  },
});

const Context = createContext<InternalContext | null>(null);
const FolderContext = createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export function Sidebar({
  defaultOpenLevel = 0,
  prefetch = true,
  Mobile,
  Content,
}: SidebarProps) {
  const isMobile = useMediaQuery('(width < 768px)') ?? false;
  const context = useMemo<InternalContext>(() => {
    return {
      defaultOpenLevel,
      prefetch,
      level: 1,
    };
  }, [defaultOpenLevel, prefetch]);

  return (
    <Context.Provider value={context}>
      {isMobile && Mobile != null ? Mobile : Content}
    </Context.Provider>
  );
}

export function SidebarContent({
  xstyle,
  ...props
}: StyleXComponentProps<'aside'>) {
  // const { collapsed } = useSidebar();
  const collapsed = false;
  const [hover, setHover] = useState(false);
  const timerRef = useRef(0);
  const closeTimeRef = useRef(0);

  useOnChange(collapsed, () => {
    setHover(false);
    closeTimeRef.current = Date.now() + 150;
  });

  return (
    <aside
      id="nd-sidebar"
      {...props}
      {...stylex.props(
        contentStyles.base,
        collapsed && contentStyles.collapsed,
        collapsed && hover && contentStyles.collapsedHovered,
        hover && contentStyles.hovered,
        xstyle,
      )}
      data-collapsed={collapsed}
      onPointerEnter={(e) => {
        if (
          !collapsed ||
          e.pointerType === 'touch' ||
          closeTimeRef.current > Date.now()
        )
          return;
        window.clearTimeout(timerRef.current);
        setHover(true);
      }}
      onPointerLeave={(e) => {
        if (!collapsed || e.pointerType === 'touch') return;
        window.clearTimeout(timerRef.current);

        timerRef.current = window.setTimeout(
          () => {
            setHover(false);
            closeTimeRef.current = Date.now() + 150;
          },
          Math.min(e.clientX, document.body.clientWidth - e.clientX) > 100
            ? 0
            : 500,
        );
      }}
    >
      {props.children}
    </aside>
  );
}
const contentStyles = stylex.create({
  base: {
    position: 'fixed',
    top: 0,
    right: {
      default: null,
      ':dir(rtl)': 0,
    },
    bottom: 0,
    left: { default: 0, ':dir(rtl)': 'auto' },
    zIndex: 20,
    display: { default: 'flex', '@media (max-width: 768px)': 'none' },
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: `calc(${vars['--spacing']} + ${vars['--fd-sidebar-width']} + var(--fd-layout-offset))`,
    fontSize: `${14 / 16}rem`,
    lineHeight: 1.42,
    backgroundColor: vars['--color-fd-card'],
    borderInlineEndColor: vars['--color-fd-border'],
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: 1,
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '0.2s',
    transitionProperty: 'top, opacity, translate, width',
    '--fd-sidebar-margin': '0px',
    '--fd-sidebar-offset': 'calc(16px - 100%)',
    '--fd-sidebar-top': `calc(${vars['--fd-banner-height']} + ${vars['--fd-nav-height']} + var(--fd-sidebar-margin))`,
  },
  collapsed: {
    width: vars['--fd-sidebar-width'],
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 12,
    opacity: 0,
    transform: {
      default: 'translateX(var(--fd-sidebar-offset))',
      ':dir(rtl)': 'translateX(calc(var(--fd-sidebar-offset) * -1))',
    },
    '--fd-sidebar-margin': '0.5rem',
  },
  collapsedHovered: {
    zIndex: 50,
    boxShadow:
      '0 10px 15px -3px gb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    opacity: null,
  },
  hovered: {
    '--fd-sidebar-offset': `calc(${vars['--spacing']} * 2)`,
  },
});

export function SidebarContentMobile({
  xstyle,
  children,
  ...props
}: StyleXComponentProps<'aside'>) {
  const open = true;
  const setOpen = (_open: any) => {};
  const state = open ? 'open' : 'closed';

  return (
    <>
      <div
        {...stylex.props(mobContentStyles.top)}
        data-state={state}
        onClick={() => setOpen(false)}
      />
      <aside
        {...props}
        {...stylex.props(
          mobContentStyles.bottom,
          // !present && mobContentStyles.hidden,
          xstyle,
        )}
        data-state={state}
        id="nd-sidebar-mobile"
      >
        {children}
      </aside>
    </>
  );
}
const mobContentStyles = stylex.create({
  top: {
    position: 'fixed',
    inset: 0,
    zIndex: 40,
    backdropFilter: 'blur(4px)',
    animation: {
      default: null,
      ':where([data-state="closed"])': vars['--animate-fd-fade-out'],
      ':where([data-state="open"])': vars['--animate-fd-fade-in'],
    },
  },
  bottom: {
    position: 'fixed',
    insetBlock: 0,
    insetInlineEnd: 0,
    // z-40 bg-fd-background data-[state=open]:animate-fd-sidebar-in data-[state=closed]:animate-fd-sidebar-out
    zIndex: 40,
    display: 'flex',
    flexDirection: 'column',
    width: '85%',
    maxWidth: 380,
    fontSize: `${15 / 16}rem`,
    backgroundColor: vars['--color-fd-background'],
    borderInlineStartColor: vars['--color-fd-accent'],
    borderInlineStartStyle: 'solid',
    borderInlineStartWidth: 1,
    boxShadow:
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    animation: {
      default: null,
      ':where([data-state="closed"])': vars['--animate-fd-sidebar-out'],
      ':where([data-state="open"])': vars['--animate-fd-sidebar-in'],
    },
  },
});

export function SidebarHeader({
  xstyle,
  ...props
}: StyleXComponentProps<'div'>) {
  return (
    <div {...props} {...stylex.props(headerStyles.div, xstyle)}>
      {props.children}
    </div>
  );
}
const headerStyles = stylex.create({
  div: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3 * 4,
    padding: 4 * 4,
    paddingBottom: 2 * 4,
  },
});

export function SidebarFooter({
  xstyle,
  ...props
}: StyleXComponentProps<'div'>) {
  return (
    <div {...props} {...stylex.props(footerStyles.div, xstyle)}>
      {props.children}
    </div>
  );
}
const footerStyles = stylex.create({
  div: {
    display: 'flex',
    flexDirection: 'column',
    padding: 4 * 4,
    paddingTop: 2 * 4,
    borderTopColor: vars['--color-fd-accent'],
    borderTopStyle: 'solid',
    borderTopWidth: 1,
  },
});

export function SidebarViewport({
  xstyle,
  ...props
}: StyleXComponentProps<typeof ScrollArea>) {
  return (
    <ScrollArea {...props} xstyle={[sidebarStyles.area, xstyle]}>
      <ScrollViewport xstyle={sidebarStyles.viewport}>
        {props.children}
      </ScrollViewport>
    </ScrollArea>
  );
}
const sidebarStyles = stylex.create({
  area: { height: '100%' },
  viewport: {
    padding: 4 * 4,
    overscrollBehavior: 'contain',
    // eslint-disable-next-line @stylexjs/valid-styles
    ['--sidebar-item-offset' as any]: 'calc(var(--spacing) * 2)',
    maskImage:
      'linear-gradient(to bottom, transparent, white 12px, white calc(100% - 12px), transparent)',
  },
});

export function SidebarSeparator({
  xstyle,
  ...props
}: StyleXComponentProps<'p'>) {
  return (
    <p {...props} {...stylex.props(separatorStyles.p, xstyle)}>
      {props.children}
    </p>
  );
}
const separatorStyles = stylex.create({
  p: {
    display: 'inline-flex',
    gap: 8,
    alignItems: 'center',
    paddingInline: 8,
    paddingInlineStart: 'var(--sidebar-item-offset)',
    marginBottom: { default: 1.5 * 4, ':empty': 0 },
  },
});

export function SidebarItem({
  icon,
  xstyle,
  ...props
}: Omit<LinkProps, 'className' | 'style'> & {
  icon?: ReactNode;
  xstyle?: stylex.StyleXStyles;
}) {
  const pathname = usePathname();
  const active =
    props.href !== undefined && isActive(props.href, pathname, false);
  const { prefetch } = useInternalContext();

  return (
    <Link
      {...props}
      data-active={active}
      prefetch={prefetch}
      {...stylex.props(
        itemVariants.base,
        active && itemVariants.active,
        xstyle,
      )}
    >
      {icon ?? (props.external ? <ExternalLink /> : null)}
      {props.children}
    </Link>
  );
}

export function SidebarFolder({
  defaultOpen = false,
  ...props
}: ComponentProps<'div'> & {
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useOnChange(defaultOpen, (v) => {
    if (v) setOpen(v);
  });

  return (
    <Collapsible onOpenChange={setOpen} open={open} {...props}>
      <FolderContext.Provider
        value={useMemo(() => ({ open, setOpen }), [open])}
      >
        {props.children}
      </FolderContext.Provider>
    </Collapsible>
  );
}

export function SidebarFolderTrigger({
  xstyle,
  ...props
}: Omit<CollapsibleTriggerProps, 'className' | 'style'> & {
  xstyle?: stylex.StyleXStyles;
}) {
  const { open } = useFolderContext();

  return (
    <CollapsibleTrigger
      {...props}
      {...stylex.props(
        itemVariants.base,
        folderTriggerStyles.fullWidth,
        xstyle,
      )}
    >
      {props.children}
      <ChevronDown
        data-icon
        {...stylex.props(
          folderTriggerStyles.chevron,
          !open && folderTriggerStyles.closed,
        )}
      />
    </CollapsibleTrigger>
  );
}
const folderTriggerStyles = stylex.create({
  fullWidth: { width: '100%' },
  chevron: {
    width: 'var(--svg-size)',
    height: 'var(--svg-size)',
    marginInlineStart: 'auto',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '0.15',
    transitionProperty: 'transform',
  },
  closed: {
    rotate: '-90deg',
  },
});

export function SidebarFolderLink({
  xstyle,
  ...props
}: Omit<LinkProps, 'className' | 'style'> & { xstyle?: stylex.StyleXStyles }) {
  const { open, setOpen } = useFolderContext();
  const { prefetch } = useInternalContext();

  const pathname = usePathname();
  const active =
    props.href !== undefined && isActive(props.href, pathname, false);

  return (
    <Link
      {...props}
      {...stylex.props(
        itemVariants.base,
        active && itemVariants.active,
        folderLinkStyles.fullWidth,
        xstyle,
      )}
      data-active={active}
      onClick={(e) => {
        if (
          e.target instanceof Element &&
          e.target.matches('[data-icon], [data-icon] *')
        ) {
          setOpen(!open);
          e.preventDefault();
        } else {
          setOpen(active ? !open : true);
        }
      }}
      prefetch={prefetch}
    >
      {props.children}
      <ChevronDown
        {...stylex.props(
          folderLinkStyles.chevron,
          !open && folderLinkStyles.closed,
        )}
        data-icon
      />
    </Link>
  );
}
const folderLinkStyles = stylex.create({
  fullWidth: { width: '100%' },
  chevron: {
    width: 'var(--svg-size)',
    height: 'var(--svg-size)',
    marginInlineStart: 'auto',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '0.15s',
    transitionProperty: 'transform',
  },
  closed: {
    rotate: '-90deg',
  },
});

export function SidebarFolderContent(
  props: Omit<CollapsibleContentProps, 'className' | 'style'> & {
    xstyle?: stylex.StyleXStyles;
  },
) {
  const { level, ...ctx } = useInternalContext();

  return (
    <CollapsibleContent {...props} {...stylex.props(folderStyles.base(level))}>
      <Context.Provider
        value={useMemo(
          () => ({
            ...ctx,
            level: level + 1,
          }),
          [ctx, level],
        )}
      >
        {props.children}
      </Context.Provider>
    </CollapsibleContent>
  );
}
const folderStyles = stylex.create({
  base: (level: number) => ({
    position: 'relative',
    '--sidebar-item-offset': `calc(var(--spacing) * ${(level + 1) * 3})`,
  }),
});

export function SidebarTrigger({
  children,
  xstyle,
  ...props
}: StyleXComponentProps<'button'>) {
  // const { setOpen } = useSidebar();
  const setOpen = (_open: any) => {};

  return (
    <button
      {...props}
      {...stylex.props(xstyle)}
      aria-label="Open Sidebar"
      onClick={() => setOpen((prev: any) => !prev)}
    >
      {children}
    </button>
  );
}

export function SidebarCollapseTrigger({
  xstyle,
  ...props
}: StyleXComponentProps<'button'>) {
  return (
    <button
      aria-label="Collapse Sidebar"
      data-collapsed={false}
      type="button"
      {...props}
      {...stylex.props(xstyle)}
    >
      {props.children}
    </button>
  );
}

function useFolderContext() {
  const ctx = useContext(FolderContext);
  if (!ctx) throw new Error('Missing sidebar folder');

  return ctx;
}

function useInternalContext() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('<Sidebar /> component required.');

  return ctx;
}

export interface SidebarComponents {
  Item: FC<{ item: PageTree.Item }>;
  Folder: FC<{ item: PageTree.Folder; level: number; children: ReactNode }>;
  Separator: FC<{ item: PageTree.Separator }>;
}

/**
 * Render sidebar items from page tree
 */
export function SidebarPageTree(props: {
  components?: Partial<SidebarComponents>;
}) {
  const { root } = useTreeContext();

  return useMemo(() => {
    const { Separator, Item, Folder } = props.components ?? {};

    function renderSidebarList(
      items: PageTree.Node[],
      level: number,
    ): ReactNode[] {
      return items.map((item, i) => {
        if (item.type === 'separator') {
          if (Separator) return <Separator item={item} key={i} />;
          return (
            <SidebarSeparator
              key={i}
              {...stylex.props(i !== 0 && treeStyles.mt6)}
            >
              {item.icon}
              {item.name}
            </SidebarSeparator>
          );
        }

        if (item.type === 'folder') {
          const children = renderSidebarList(item.children, level + 1);

          if (Folder)
            return (
              <Folder item={item} key={i} level={level}>
                {children}
              </Folder>
            );
          return (
            <PageTreeFolder item={item} key={i}>
              {children}
            </PageTreeFolder>
          );
        }

        if (Item) return <Item item={item} key={item.url} />;
        return (
          <SidebarItem
            external={item.external}
            href={item.url}
            icon={item.icon}
            key={item.url}
          >
            {item.name}
          </SidebarItem>
        );
      });
    }

    return (
      <Fragment key={root.$id}>{renderSidebarList(root.children, 1)}</Fragment>
    );
  }, [props.components, root]);
}
const treeStyles = stylex.create({
  mt6: { marginTop: 6 * 4 },
});

function PageTreeFolder({
  item,
  ...props
}: {
  item: PageTree.Folder;
  children: ReactNode;
}) {
  const { defaultOpenLevel, level } = useInternalContext();
  const path = useTreePath();

  return (
    <SidebarFolder
      defaultOpen={
        (item.defaultOpen ?? defaultOpenLevel >= level) || path.includes(item)
      }
    >
      {item.index ? (
        <SidebarFolderLink
          external={item.index.external}
          href={item.index.url}
          {...props}
        >
          {item.icon}
          {item.name}
        </SidebarFolderLink>
      ) : (
        <SidebarFolderTrigger {...props}>
          {item.icon}
          {item.name}
        </SidebarFolderTrigger>
      )}
      <SidebarFolderContent>{props.children}</SidebarFolderContent>
    </SidebarFolder>
  );
}
