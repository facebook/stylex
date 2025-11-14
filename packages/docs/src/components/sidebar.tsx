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
import { cn } from '../lib/cn';
import { ScrollArea, ScrollViewport } from './ui/scroll-area';
import { isActive } from '../lib/is-active';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { type ScrollAreaProps } from '@radix-ui/react-scroll-area';
import { useSidebar } from 'fumadocs-ui/contexts/sidebar';
import { cva } from 'class-variance-authority';
import type {
  CollapsibleContentProps,
  CollapsibleTriggerProps,
} from '@radix-ui/react-collapsible';
import type * as PageTree from 'fumadocs-core/page-tree';
import { useTreeContext, useTreePath } from 'fumadocs-ui/contexts/tree';
import { useMediaQuery } from 'fumadocs-core/utils/use-media-query';
import { Presence } from '@radix-ui/react-presence';
import { StyleXComponentProps } from './layout/shared';
import * as stylex from '@stylexjs/stylex';

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
    alignItems: 'center',
    gap: 2 * 4,
    borderRadius: 8,
    backgroundColor: {
      default: null,
      ':hover': 'color-mix(in oklab, var(--bg-fd-accent) 50%, transparent)',
    },
    padding: 2 * 4,
    paddingInlineStart: 'calc(var(--spacing) * 2)',
    textAlign: 'start',
    color: {
      default: 'var(--text-fd-muted-foreground)',
      ':hover':
        'color-mix(in oklab, var(--text-fd-accent-foreground) 80%, transparent)',
    },
    overflowWrap: 'anywhere',
    '--svg-size': 4,
    ':not(#foo) svg': {
      width: 4,
      height: 4,
      flexShrink: 0,
    },
    transitionProperty: {
      default: 'color, background-color, border-color',
      ':hover': 'none',
    },
  },
  active: {
    backgroundColor:
      'color-mix(in oklab, var(--bg-fd-primary) 10%, transparent)',
    color: 'var(--text-fd-primary)',
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
  const { collapsed } = useSidebar();
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
    left: { default: 0, ':dir(rtl)': 'auto' },
    right: {
      default: null,
      ':dir(rtl)': 'var(--removed-body-scroll-bar-size, 0)',
    },
    display: { default: 'flex', '@media (max-width: 768px)': 'none' },
    flexDirection: 'column',
    alignItems: 'flex-end',
    top: 'var(--fd-sidebar-top)',
    bottom: 'var(--fd-sidebar-margin)',
    zIndex: 20,
    backgroundColor: 'var(--color-fd-card)',
    fontSize: `${14 / 16}rem`,
    lineHeight: 1.42,
    borderInlineEndWidth: 1,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'var(--color-fd-border)',
    transitionProperty: 'top, opacity, translate, width',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    width:
      'calc(var(--spacing) + var(--fd-sidebar-width) + var(--fd-layout-offset))',
    ':not(#foo) > *': {
      width: 'var(--fd-sidebar-width)',
    },
    '--fd-sidebar-margin': '0px',
    '--fd-sidebar-top': `calc(var(--fd-banner-height) + var(--fd-nav-height) + var(--fd-sidebar-margin))`,
    '--fd-sidebar-offset': 'calc(16px - 100%)',
  },
  collapsed: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-fd-border)',
    transform: {
      default: 'translateX(var(--fd-sidebar-offset))',
      ':dir(rtl)': 'translateX(calc(var(--fd-sidebar-offset) * -1))',
    },
    opacity: 0,
    '--fd-sidebar-margin': '0.5rem',
    width: 'var(--fd-sidebar-width)',
  },
  collapsedHovered: {
    zIndex: 50,
    boxShadow:
      '0 10px 15px -3px gb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    opacity: null,
  },
  hovered: {
    '--fd-sidebar-offset': 'calc(var(--spacing) * 2)',
  },
});

export function SidebarContentMobile({
  xstyle,
  children,
  ...props
}: StyleXComponentProps<'aside'>) {
  const { open, setOpen } = useSidebar();
  const state = open ? 'open' : 'closed';

  return (
    <>
      <Presence present={open}>
        <div
          {...stylex.props(mobContentStyles.top)}
          data-state={state}
          onClick={() => setOpen(false)}
        />
      </Presence>
      <Presence present={open}>
        {({ present }) => (
          <aside
            {...props}
            {...stylex.props(
              mobContentStyles.bottom,
              !present && mobContentStyles.hidden,
              xstyle,
            )}
            id="nd-sidebar-mobile"
            data-state={state}
          >
            {children}
          </aside>
        )}
      </Presence>
    </>
  );
}
const mobContentStyles = stylex.create({
  top: {
    position: 'fixed',
    zIndex: 40,
    inset: 0,
    backdropFilter: 'blur(4px)',
    animation: {
      default: null,
      ':where([data-state="open"])': 'var(--animate-fd-fade-in)',
      ':where([data-state="closed"])': 'var(--animate-fd-fade-out)',
    },
  },
  bottom: {
    position: 'fixed',
    fontSize: `${15 / 16}rem`,
    display: 'flex',
    flexDirection: 'column',
    boxShadow:
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    borderInlineStartWidth: 1,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: 'var(--color-fd-accent)',
    insetInlineEnd: 0,
    insetBlock: 0,
    width: '85%',
    maxWidth: 380,
    // z-40 bg-fd-background data-[state=open]:animate-fd-sidebar-in data-[state=closed]:animate-fd-sidebar-out
    zIndex: 40,
    backgroundColor: 'var(--color-fd-background)',
    animation: {
      default: null,
      ':where([data-state="open"])': 'var(--animate-fd-sidebar-in)',
      ':where([data-state="closed"])': 'var(--animate-fd-sidebar-out)',
    },
  },
  hidden: {
    display: 'none',
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
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: 'var(--color-fd-accent)',
    padding: 4 * 4,
    paddingTop: 2 * 4,
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
    alignItems: 'center',
    gap: 8,
    marginBottom: { default: 1.5 * 4, ':empty': 0 },
    paddingInline: 8,
    paddingInlineStart: 'var(--sidebar-item-offset)',
    ':not(#foo) svg': {
      width: 4 * 4,
      height: 4 * 4,
      flexShrink: 0,
    },
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
    <Collapsible open={open} onOpenChange={setOpen} {...props}>
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
    transitionProperty: 'transform',
    transitionDuration: '0.15',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
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
    marginInlineStart: 'auto',
    transitionProperty: 'transform',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    width: 'var(--svg-size)',
    height: 'var(--svg-size)',
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
    <CollapsibleContent
      {...props}
      {...stylex.props(
        folderStyles.base(level),
        level === 1 && folderStyles.level1,
      )}
    >
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
  level1: {
    '::before': {
      content: '',
      position: 'absolute',
      width: 1,
      backgroundColor: 'var(--color-fd-border)',
      insetInlineStart: 2.5 * 4,
    },
    // HACK ALERT!
    ':not(#foo) [data-active="true"]::before': {
      content: '',
      backgroundColor: 'var(--color-fd-primary)',
      position: 'absolute',
      width: 1,
      insetBlock: 2.5 * 4,
      insetInlineStart: 2.5 * 4,
    },
  },
});

export function SidebarTrigger({
  children,
  xstyle,
  ...props
}: StyleXComponentProps<'button'>) {
  const { setOpen } = useSidebar();

  return (
    <button
      {...props}
      {...stylex.props(xstyle)}
      aria-label="Open Sidebar"
      onClick={() => setOpen((prev) => !prev)}
    >
      {children}
    </button>
  );
}

export function SidebarCollapseTrigger({
  xstyle,
  ...props
}: StyleXComponentProps<'button'>) {
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <button
      type="button"
      aria-label="Collapse Sidebar"
      data-collapsed={collapsed}
      {...props}
      {...stylex.props(xstyle)}
      onClick={() => {
        setCollapsed((prev) => !prev);
      }}
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
          if (Separator) return <Separator key={i} item={item} />;
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
              <Folder key={i} item={item} level={level}>
                {children}
              </Folder>
            );
          return (
            <PageTreeFolder key={i} item={item}>
              {children}
            </PageTreeFolder>
          );
        }

        if (Item) return <Item key={item.url} item={item} />;
        return (
          <SidebarItem
            key={item.url}
            href={item.url}
            external={item.external}
            icon={item.icon}
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
          href={item.index.url}
          external={item.index.external}
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
