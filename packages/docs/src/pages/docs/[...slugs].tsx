/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { source } from '@/lib/source';
import { PageProps } from 'waku/router';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from '@/components/layout/page';
import { mdxComponents } from '@/components/mdx';
import * as stylex from '@stylexjs/stylex';
import { vars } from '@/theming/vars.stylex';

export default function DocPage({ slugs }: PageProps<'/docs/[...slugs]'>) {
  const page = source.getPage(slugs);

  if (!page) {
    return (
      <div {...stylex.props(styles.fallbackContainer)}>
        <h1 {...stylex.props(styles.fallbackTitle)}>Page Not Found</h1>
        <p {...stylex.props(styles.fallbackDescription)}>
          The page you are looking for does not exist.
        </p>
      </div>
    );
  }

  const MDX = page.data.body;
  return (
    <DocsPage toc={page.data.toc}>
      <title>{`${page.data.title} | StyleX`}</title>
      <DocsTitle>
        {slugs.length > 1 && slugs[0] === 'api' ? (
          <code {...stylex.props(styles.codeTitle)}>{page.data.title}</code>
        ) : (
          page.data.title
        )}
      </DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...mdxComponents,
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function getConfig() {
  const pages = source
    .generateParams()
    .map((item) => (item.lang ? [item.lang, ...item.slug] : item.slug));

  return {
    render: 'static' as const,
    staticPaths: pages,
  } as const;
}

const styles = stylex.create({
  fallbackContainer: {
    paddingBlock: '3rem',
    paddingInline: '1rem',
    textAlign: 'center',
  },
  fallbackTitle: {
    marginBlockEnd: '1rem',
    fontSize: '1.875rem',
    fontWeight: 700,
    lineHeight: '2.25rem',
    color: `${vars['--color-fd-foreground']}`,
  },
  fallbackDescription: {
    color: `${vars['--color-fd-muted-foreground']}`,
  },
  codeTitle: {
    padding: 3,
    fontFamily: 'var(--default-mono-font-family)',
    fontWeight: 400,
    backgroundColor: `color-mix(in oklab, ${vars['--color-fd-muted']} 95%, currentColor)`,
    borderColor: `${vars['--color-fd-border']}`,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 5,
  },
});
