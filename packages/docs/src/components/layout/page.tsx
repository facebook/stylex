/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import { type ReactNode, useMemo } from 'react';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { vars } from '@/theming/vars.stylex';

export interface DocsPageProps {
  toc?: TOCItemType[];

  children: ReactNode;
}

export function DocsPage({ toc = [], ...props }: DocsPageProps) {
  return (
    <AnchorProvider toc={toc}>
      <div {...stylex.props(pageStyles.wrapper)}>
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
                <TocItem item={item} key={item.url} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AnchorProvider>
  );
}
const pageStyles = stylex.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  flexCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flexGrow: 1,
    minWidth: 0,
  },
  article: {
    flexGrow: 1,
    gap: 24,
    width: '100%',
    maxWidth: 860,
    paddingBlock: 32,
    paddingInline: 16,
    marginInline: {
      default: null,
      '@media (min-width: 768px)': 'auto',
    },
  },
  sticky: {
    position: 'sticky',
    top: 80,
    zIndex: 1,
    display: {
      default: null,
      '@media (max-width: 1280px)': 'none',
    },
    flexShrink: 0,
    width: 360,
    maxHeight: 'calc(100dvh - 96px)',
    padding: 4 * 4,
    marginBottom: 16,
    overflow: 'auto',
    borderInlineStartColor: vars['--color-fd-border'],
    borderInlineStartStyle: 'solid',
    borderInlineStartWidth: 1,
  },
  tocPara: {
    marginBottom: 8,
    fontSize: `${14 / 16}rem`,
    lineHeight: 1.42,
    color: vars['--color-fd-muted-foreground'],
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
    fontSize: `${18 / 16}rem`,
    lineHeight: 1.555,
    color: vars['--color-fd-muted-foreground'],
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
    fontWeight: 600,
    lineHeight: 1.2,
    color: vars['--color-fd-primary'],
    wordBreak: 'break-word',
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
    paddingBlock: 4,
    paddingInlineStart,
    fontSize: `${14 / 16}rem`,
    lineHeight: 1.42,
    color: `color-mix(in oklab, ${vars['--color-fd-foreground']} 80%, transparent)`,
  }),
  active: {
    color: vars['--color-fd-primary'],
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
      {previous ? (
        <Link
          {...stylex.props(footerStyles.link, footerStyles.prev)}
          href={previous.url}
        >
          <ChevronLeft {...stylex.props(footerStyles.chevron)} />
          {previous.name}
        </Link>
      ) : null}
      {next ? (
        <Link
          {...stylex.props(footerStyles.link, footerStyles.next)}
          href={next.url}
        >
          {next.name}
          <ChevronRight {...stylex.props(footerStyles.chevron)} />
        </Link>
      ) : null}
    </div>
  );
}
const footerStyles = stylex.create({
  div: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2 * 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  link: {
    display: 'flex',
    flexGrow: 1,
    flexBasis: '45%',
    flexDirection: 'row',
    gap: 8,
    minWidth: 'fit-content',
    padding: 16,
    color: vars['--color-fd-primary'],
    backgroundColor: {
      default: 'transparent',
      ':hover': vars['--color-fd-muted'],
    },
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 20,
    cornerShape: 'squircle',
  },
  prev: {
    justifyContent: 'flex-start',
    textAlign: 'left',
  },
  next: {
    justifyContent: 'flex-end',
    textAlign: 'right',
  },
  chevron: {
    width: '1em',
    height: '1em',
    marginTop: 5,
  },
});
