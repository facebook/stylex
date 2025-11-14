'use client';

import { type ComponentProps, type ReactNode, useMemo } from 'react';
import {
  AnchorProvider,
  type TOCItemType,
  useActiveAnchors,
} from 'fumadocs-core/toc';
import { useTreeContext } from 'fumadocs-ui/contexts/tree';
import { Link, usePathname } from 'fumadocs-core/framework';
import type * as PageTree from 'fumadocs-core/page-tree';
import * as stylex from '@stylexjs/stylex';
import { StyleXComponentProps } from './shared';

export interface DocsPageProps {
  toc?: TOCItemType[];

  children: ReactNode;
}

export function DocsPage({ toc = [], ...props }: DocsPageProps) {
  return (
    <AnchorProvider toc={toc}>
      <main {...stylex.props(pageStyles.flexCol, pageStyles.main)}>
        <article {...stylex.props(pageStyles.flexCol, pageStyles.article)}>
          {props.children}
          <Footer />
        </article>
      </main>
      {toc.length > 0 && (
        <div {...stylex.props(pageStyles.sticky)}>
          <p {...stylex.props(pageStyles.tocPara)}>On this page</p>
          <div {...stylex.props(pageStyles.flexCol)}>
            {toc.map((item) => (
              <TocItem key={item.url} item={item} />
            ))}
          </div>
        </div>
      )}
    </AnchorProvider>
  );
}
const pageStyles = stylex.create({
  flexCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    width: '100%',
    minWidth: 0,
  },
  article: {
    flex: 1,
    width: '100%',
    maxWidth: 860,
    gap: 24,
    paddingInline: { default: 16, '@media (min-width: 768px)': 24 },
    paddingBlock: 32,
    marginInline: {
      default: null,
      '@media (min-width: 768px)': 'auto',
    },
  },
  sticky: {
    display: {
      default: null,
      '@media (max-width: 1280px)': 'none',
    },
    position: 'sticky',
    top: 'var(--fd-nav-height)',
    width: 286,
    flexShrink: 0,
    height: 'calc(100dvh - var(--fd-nav-height))',
    padding: 4 * 4,
    overflow: 'auto',
  },
  tocPara: {
    fontSize: `${14 / 16}rem`,
    lineHeight: 1.42,
    color: 'var(--color-fd-muted-foreground)',
    marginBottom: 8,
  },
});

export function DocsBody({ xstyle, ...props }: StyleXComponentProps<'div'>) {
  const { className, style } = stylex.props(xstyle);
  return (
    // TODO: Move `prose` to stylex as a component.
    <div {...props} className={['prose', className].join(' ')} style={style}>
      {props.children}
    </div>
  );
}

export function DocsDescription({
  xstyle,
  ...props
}: StyleXComponentProps<'p'>) {
  // don't render if no description provided
  if (props.children === undefined) return null;

  return (
    <p {...props} {...stylex.props(descStyles.p, xstyle)}>
      {props.children}
    </p>
  );
}
const descStyles = stylex.create({
  p: {
    marginBottom: 8 * 4,
    fontSize: `${18 / 16}rem`,
    lineHeight: 1.555,
    color: 'var(--color-fd-muted-background)',
  },
});

export function DocsTitle({ xstyle, ...props }: StyleXComponentProps<'h1'>) {
  return (
    <h1 {...props} {...stylex.props(titleStyles.h1, xstyle)}>
      {props.children}
    </h1>
  );
}
const titleStyles = stylex.create({
  h1: {
    fontSize: `${30 / 16}rem`,
    lineHeight: 1.2,
    fontWeight: 600,
  },
});

function TocItem({ item }: { item: TOCItemType }) {
  const isActive = useActiveAnchors().includes(item.url.slice(1));

  return (
    <a
      href={item.url}
      {...stylex.props(
        itemStyles.link(Math.max(0, item.depth - 2) * 16),
        isActive && itemStyles.active,
      )}
    >
      {item.title}
    </a>
  );
}
const itemStyles = stylex.create({
  link: (paddingInlineStart: number) => ({
    fontSize: `${14 / 16}rem`,
    lineHeight: 1.42,
    color: 'color-mix(in oklab, var(--color-fd-foreground) 80%, transparent)',
    paddingBlock: 4,
    paddingInlineStart,
  }),
  active: {
    color: 'var(--color-fd-primary)',
  },
});

function Footer() {
  const { root } = useTreeContext();
  const pathname = usePathname();
  const flatten = useMemo(() => {
    const result: PageTree.Item[] = [];

    function scan(items: PageTree.Node[]) {
      for (const item of items) {
        if (item.type === 'page') result.push(item);
        else if (item.type === 'folder') {
          if (item.index) result.push(item.index);
          scan(item.children);
        }
      }
    }

    scan(root.children);
    return result;
  }, [root]);

  const { previous, next } = useMemo(() => {
    const idx = flatten.findIndex((item) => item.url === pathname);

    if (idx === -1) return {};
    return {
      previous: flatten[idx - 1],
      next: flatten[idx + 1],
    };
  }, [flatten, pathname]);

  return (
    <div {...stylex.props(footerStyles.div)}>
      {previous ? <Link href={previous.url}>{previous.name}</Link> : null}
      {next ? <Link href={next.url}>{next.name}</Link> : null}
    </div>
  );
}
const footerStyles = stylex.create({
  div: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 2 * 4,
    alignItems: 'center',
    fontWeight: 500,
  },
});
