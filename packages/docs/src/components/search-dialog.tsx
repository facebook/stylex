/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as stylex from '@stylexjs/stylex';
import scrollIntoView from 'scroll-into-view-if-needed';
import { ChevronRight, Hash, Search } from 'lucide-react';
import { useRouter } from 'fumadocs-core/framework';
import { useDocsSearch } from 'fumadocs-core/search/client';
import type { HighlightedText, ReactSortedResult } from 'fumadocs-core/search';
import { I18nLabel, useI18n } from 'fumadocs-ui/contexts/i18n';
import type {
  SearchLink,
  SharedProps,
  TagItem,
} from 'fumadocs-ui/contexts/search';
import { ANIMATION_DURATIONS, EASINGS, vars } from '@/theming/vars.stylex';

type SearchItem =
  | (ReactSortedResult & { external?: boolean })
  | {
      id: string;
      type: 'action';
      node: React.ReactNode;
      onSelect: () => void;
    };

export type SearchDialogProps = SharedProps & {
  links?: SearchLink[];
  type?: 'fetch' | 'static';
  defaultTag?: string;
  tags?: TagItem[];
  api?: string;
  delayMs?: number;
  footer?: React.ReactNode;
  allowClear?: boolean;
};

export function SearchDialog({
  open,
  onOpenChange,
  type = 'fetch',
  defaultTag,
  tags = [],
  api = '/api/search',
  delayMs,
  allowClear = false,
  links = [],
  footer,
}: SearchDialogProps) {
  const { locale, text } = useI18n();
  const router = useRouter();
  const [tag, setTag] = React.useState(defaultTag);
  const { search, setSearch, query } = useDocsSearch(
    type === 'fetch'
      ? {
          type: 'fetch',
          api,
          locale,
          tag,
          delayMs,
        }
      : {
          type: 'static',
          from: api,
          locale,
          tag,
          delayMs,
        },
  );

  React.useEffect(() => {
    setTag(defaultTag);
  }, [defaultTag]);

  const defaultItems = React.useMemo<SearchItem[] | null>(() => {
    if (links.length === 0) {
      return null;
    }
    return links.map(([name, href]) => ({
      type: 'page',
      id: name,
      content: name,
      url: href,
    }));
  }, [links]);

  const items = React.useMemo(() => {
    if (query.data === 'empty') {
      return defaultItems;
    }
    if (!query.data) {
      return null;
    }
    return query.data as SearchItem[];
  }, [defaultItems, query.data]);

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const itemsRef = React.useRef<SearchItem[] | null>(null);
  const activeIdRef = React.useRef<string | null>(null);
  const listContainerRef = React.useRef<HTMLDivElement | null>(null);
  const listViewportRef = React.useRef<HTMLDivElement | null>(null);

  const onOpenItem = React.useCallback(
    (item: SearchItem) => {
      if (item.type === 'action') {
        item.onSelect();
        onOpenChange(false);
        return;
      }
      if (item.external) {
        window.open(item.url, '_blank', 'noopener,noreferrer');
        onOpenChange(false);
        return;
      }
      router.push(item.url);
      onOpenChange(false);
    },
    [onOpenChange, router],
  );

  React.useEffect(() => {
    itemsRef.current = items;
    if (items && items.length > 0) {
      setActiveId(items[0]?.id ?? null);
    } else {
      setActiveId(null);
    }
  }, [items]);

  React.useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      const currentItems = itemsRef.current;
      if (!currentItems || currentItems.length === 0 || e.isComposing) {
        return;
      }
      const active = activeIdRef.current;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        let index = currentItems.findIndex((item) => item.id === active);
        if (index === -1) {
          index = 0;
        }
        index =
          e.key === 'ArrowDown'
            ? (index + 1) % currentItems.length
            : (index - 1 + currentItems.length) % currentItems.length;
        setActiveId(currentItems[index]?.id ?? null);
        e.preventDefault();
      }
      if (e.key === 'Enter') {
        const selected = currentItems.find((item) => item.id === active);
        if (selected) {
          onOpenItem(selected);
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onOpenItem]);

  React.useEffect(() => {
    const container = listContainerRef.current;
    const viewport = listViewportRef.current;
    if (!container || !viewport) {
      return;
    }
    const updateHeight = () => {
      container.style.setProperty(
        '--fd-animated-height',
        `${viewport.clientHeight}px`,
      );
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [items]);

  React.useEffect(() => {
    if (!listViewportRef.current || !activeId) {
      return;
    }
    const element = listViewportRef.current.querySelector<HTMLElement>(
      `[data-search-item="${activeId}"]`,
    );
    if (element) {
      scrollIntoView(element, {
        scrollMode: 'if-needed',
        block: 'nearest',
        boundary: listViewportRef.current,
      });
    }
  }, [activeId]);

  const showFooter = tags.length > 0 || footer != null;

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay {...stylex.props(styles.overlay)} />
        <Dialog.Content {...stylex.props(styles.content)}>
          <div {...stylex.props(styles.bgBlurContainer)}>
            <div {...stylex.props(styles.bgBlur)} />
          </div>
          <Dialog.Title {...stylex.props(styles.visuallyHidden)}>
            {text.search}
          </Dialog.Title>
          <div {...stylex.props(styles.header)}>
            <Search
              {...stylex.props(
                styles.searchIcon,
                query.isLoading && styles.searchIconLoading,
              )}
            />
            <input
              {...stylex.props(styles.input)}
              autoFocus
              onChange={(event) => setSearch(event.target.value)}
              placeholder={text.search}
              value={search}
            />
            <button
              onClick={() => onOpenChange(false)}
              type="button"
              {...stylex.props(styles.closeButton)}
            >
              ESC
            </button>
          </div>
          <div
            data-empty={items == null}
            ref={listContainerRef}
            {...stylex.props(styles.listContainer)}
          >
            <div
              ref={listViewportRef}
              {...stylex.props(
                styles.listViewport,
                items == null && styles.listViewportHidden,
              )}
            >
              {items && items.length === 0 && (
                <div {...stylex.props(styles.emptyState)}>
                  <I18nLabel label="searchNoResult" />
                </div>
              )}
              {items?.map((item) => {
                const active = item.id === activeId;
                if (item.type === 'action') {
                  return (
                    <button
                      aria-selected={active}
                      data-search-item={item.id}
                      key={item.id}
                      onClick={() => onOpenItem(item)}
                      onPointerMove={() => setActiveId(item.id)}
                      type="button"
                      {...stylex.props(
                        styles.itemButton,
                        active && styles.itemButtonActive,
                      )}
                    >
                      {item.node}
                    </button>
                  );
                }

                const content = item.contentWithHighlights
                  ? renderHighlights(item.contentWithHighlights)
                  : item.content;

                return (
                  <button
                    aria-selected={active}
                    data-search-item={item.id}
                    key={item.id}
                    onClick={() => onOpenItem(item)}
                    onPointerMove={() => setActiveId(item.id)}
                    type="button"
                    {...stylex.props(
                      styles.itemButton,
                      active && styles.itemButtonActive,
                    )}
                  >
                    {item.breadcrumbs?.length ? (
                      <div {...stylex.props(styles.breadcrumbs)}>
                        {item.breadcrumbs.map((crumb, index) => (
                          <React.Fragment key={index}>
                            {index > 0 && (
                              <ChevronRight
                                {...stylex.props(styles.breadcrumbIcon)}
                              />
                            )}
                            {crumb}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : null}
                    {item.type !== 'page' && (
                      <span {...stylex.props(styles.itemRail)} />
                    )}
                    <p
                      {...stylex.props(
                        styles.itemContent,
                        item.type !== 'page' && styles.itemContentIndented,
                        item.type === 'page' || item.type === 'heading'
                          ? styles.itemContentStrong
                          : styles.itemContentMuted,
                      )}
                    >
                      {item.type === 'heading' && (
                        <Hash {...stylex.props(styles.hashIcon)} />
                      )}
                      {content}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
          {showFooter && (
            <div {...stylex.props(styles.footer)}>
              {tags.length > 0 && (
                <div {...stylex.props(styles.tagList)}>
                  {tags.map((tagItem) => {
                    const isActive = tagItem.value === tag;
                    return (
                      <button
                        key={tagItem.value}
                        onClick={() =>
                          setTag(
                            isActive && allowClear ? undefined : tagItem.value,
                          )
                        }
                        type="button"
                        {...stylex.props(
                          styles.tagButton,
                          isActive && styles.tagButtonActive,
                        )}
                      >
                        {tagItem.name}
                      </button>
                    );
                  })}
                </div>
              )}
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function renderHighlights(highlights: HighlightedText<React.ReactNode>[]) {
  return highlights.map((node, index) => {
    if (node.styles?.highlight) {
      return (
        <span key={index} {...stylex.props(styles.highlight)}>
          {node.content}
        </span>
      );
    }
    return <React.Fragment key={index}>{node.content}</React.Fragment>;
  });
}

const styles = stylex.create({
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    backgroundColor: vars['--color-fd-overlay'],
    backdropFilter: 'blur(4px)',
    // animation: {
    //   default: null,
    //   ':where([data-state="open"])': 'var(--animate-fd-fade-in)',
    //   ':where([data-state="closed"])': 'var(--animate-fd-fade-out)',
    // },
  },
  content: {
    position: 'fixed',
    top: {
      default: 4 * 4,
      '@media (min-width: 768px)': 'calc(50% - 250px)',
    },
    left: '50%',
    zIndex: 51,
    width: 'calc(100% - 16px)',
    maxWidth: 640,
    overflow: 'hidden',
    color: vars['--color-fd-popover-foreground'],
    backgroundColor: `color-mix(in oklab, ${vars['--color-fd-popover']} 35%, transparent)`,
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 12,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    transform: 'translateX(-50%)',
    animationName: {
      default: null,
      ':where([data-state="closed"])': vars['--animate-fd-dialog-out'],
      ':where([data-state="open"])': vars['--animate-fd-dialog-in'],
    },
    animationDuration: '300ms',
    animationTimingFunction: EASINGS.dialog,
  },
  bgBlurContainer: {
    position: 'absolute',
    inset: 0,
    overflow: 'clip',
  },
  bgBlur: {
    position: 'absolute',
    inset: -64,
    backdropFilter: 'blur(48px) saturate(400%)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    borderWidth: 0,
    clip: 'rect(0, 0, 0, 0)',
  },
  header: {
    position: 'relative',
    display: 'flex',
    gap: 2 * 4,
    alignItems: 'center',
    padding: 3 * 4,
    borderBottomColor: vars['--color-fd-border'],
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
  },
  searchIcon: {
    width: 20,
    height: 20,
    color: vars['--color-fd-muted-foreground'],
  },
  searchIconLoading: {
    animationName: vars['--animate-pulse'],
    animationDuration: ANIMATION_DURATIONS.pulse,
    animationTimingFunction: EASINGS.pulse,
    animationIterationCount: 'infinite',
  },
  input: {
    flexGrow: 1,
    minWidth: 0,
    fontSize: `${18 / 16}rem`,
    color: {
      default: vars['--color-fd-popover-foreground'],
      '::placeholder': vars['--color-fd-muted-foreground'],
    },
    outline: 'none',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  closeButton: {
    paddingBlock: 0.5 * 4,
    paddingInline: 1.5 * 4,
    fontFamily: 'var(--font-mono)',
    fontSize: `${12 / 16}rem`,
    color: {
      default: vars['--color-fd-muted-foreground'],
      ':hover': vars['--color-fd-accent-foreground'],
    },
    outline: 'none',
    backgroundColor: {
      default: vars['--color-fd-background'],
      ':hover': 'color-mix(in oklab, var(--color-fd-accent) 80%, transparent)',
    },
    borderColor: {
      default: vars['--color-fd-border'],
      ':focus-visible': vars['--color-fd-primary'],
      ':hover': vars['--color-fd-primary'],
    },
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 6,
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
    transitionProperty: 'color, background-color, border-color',
  },
  listContainer: {
    position: 'relative',
    // eslint-disable-next-line @stylexjs/valid-styles
    ['--fd-animated-height' as any]: '0px',
    height: 'var(--fd-animated-height)',
    overflow: 'hidden',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
    transitionProperty: 'height',
  },
  listViewport: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 460,
    padding: 1 * 4,
    overflowY: 'auto',
  },
  listViewportHidden: {
    display: 'none',
  },
  emptyState: {
    paddingBlock: 12 * 4,
    fontSize: `${14 / 16}rem`,
    color: vars['--color-fd-muted-foreground'],
    textAlign: 'center',
  },
  itemButton: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5 * 4,
    alignItems: 'flex-start',
    width: '100%',
    paddingBlock: 2 * 4,
    paddingInline: 2.5 * 4,
    fontSize: `${14 / 16}rem`,
    color: vars['--color-fd-popover-foreground'],
    textAlign: 'start',
    backgroundColor: {
      default: 'transparent',
      ':hover': `color-mix(in oklab, ${vars['--color-fd-accent']} 45%, transparent)`,
    },
    borderRadius: 8,
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
    transitionProperty: 'background-color, color',
  },
  itemButtonActive: {
    color: vars['--color-fd-accent-foreground'],
    backgroundColor: `color-mix(in oklab, ${vars['--color-fd-accent']} 45%, transparent)`,
  },
  breadcrumbs: {
    display: 'inline-flex',
    gap: 1 * 4,
    alignItems: 'center',
    fontSize: `${12 / 16}rem`,
    color: vars['--color-fd-muted-foreground'],
  },
  breadcrumbIcon: {
    width: 16,
    height: 16,
    color: vars['--color-fd-muted-foreground'],
  },
  itemRail: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 3 * 4,
    width: 1,
    backgroundColor: vars['--color-fd-border'],
  },
  itemContent: {
    display: 'block',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemContentIndented: {
    paddingInlineStart: 4 * 4,
  },
  itemContentStrong: {
    fontWeight: 500,
  },
  itemContentMuted: {
    color: `color-mix(in oklab, ${vars['--color-fd-popover-foreground']} 80%, transparent)`,
  },
  hashIcon: {
    width: 16,
    height: 16,
    marginInlineEnd: 1 * 4,
    color: vars['--color-fd-muted-foreground'],
  },
  highlight: {
    color: vars['--color-fd-primary'],
    textDecorationLine: 'underline',
  },
  footer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 2 * 4,
    padding: 3 * 4,
    backgroundColor: `color-mix(in oklab, ${vars['--color-fd-secondary']} 50%, transparent)`,
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1 * 4,
    alignItems: 'center',
  },
  tagButton: {
    paddingBlock: 0.5 * 4,
    paddingInline: 2 * 4,
    fontSize: `${12 / 16}rem`,
    fontWeight: 500,
    color: vars['--color-fd-muted-foreground'],
    backgroundColor: {
      default: 'transparent',
      ':hover': vars['--color-fd-accent'],
    },
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 6,
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
    transitionProperty: 'color, background-color, border-color',
  },
  tagButtonActive: {
    color: vars['--color-fd-accent-foreground'],
    backgroundColor: vars['--color-fd-accent'],
  },
});
