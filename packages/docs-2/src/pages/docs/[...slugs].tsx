import * as stylex from '@stylexjs/stylex';
import { source } from '@/lib/source';
import { PageProps } from 'waku/router';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';

export default function DocPage({ slugs }: PageProps<'/docs/[...slugs]'>) {
  const page = source.getPage(slugs);

  if (!page) {
    return (
      <div {...stylex.props(styles.fallbackContainer)}>
        <h1 {...stylex.props(styles.fallbackTitle)}>
          Page Not Found
        </h1>
        <p {...stylex.props(styles.fallbackDescription)}>
          The page you are looking for does not exist.
        </p>
      </div>
    );
  }

  const MDX = page.data.body;
  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...defaultMdxComponents,
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
    textAlign: 'center',
    paddingBlock: '3rem',
    paddingInline: '1rem',
  },
  fallbackTitle: {
    fontSize: '1.875rem',
    lineHeight: '2.25rem',
    fontWeight: 700,
    marginBlockEnd: '1rem',
    color: 'var(--color-fd-foreground)',
  },
  fallbackDescription: {
    color: 'var(--color-fd-muted-foreground)',
  },
});
