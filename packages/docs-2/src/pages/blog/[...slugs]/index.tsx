import * as stylex from '@stylexjs/stylex';
import { blogSource } from '@/lib/source';
import { PageProps } from 'waku/router';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';
import { baseOptions } from '@/lib/layout.shared';

export default function BlogPage({ slugs }: PageProps<'/blog/[...slugs]'>) {
  const pages = blogSource.getPages();

  const slug = slugs[0];
  console.log('slug', slug);

  const page = pages.find((page) => page.data.slug === slug);

  if (!page) {
    return (
      <div {...stylex.props(styles.fallbackContainer)}>
        <h1 {...stylex.props(styles.fallbackTitle)}>Page Not Found {slug}</h1>
        <p {...stylex.props(styles.fallbackDescription)}>
          The page you are looking for does not exist.
        </p>
      </div>
    );
  }

  const MDX = page.data.body;
  return (
    <DocsPage
      toc={page.data.toc}
      {...baseOptions()}
      breadcrumb={{ enabled: true }}
    >
      <title>{`${page.data.title} | StyleX`}</title>
      <DocsTitle>
        {page.data.title}{' '}
        {/* <code>
          '{slugs.join('/')}' vs '{page.data.slug}' is{' '}
          {slugs.length === 1 && slugs[0] === page.data.slug ? 'true' : 'false'}
        </code> */}
      </DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...defaultMdxComponents,
            a: defaultMdxComponents.a as (
              props: JSX.IntrinsicElements['a'],
            ) => JSX.Element,
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function getConfig() {
  const pages = blogSource.getPages();
  const slugs = pages.map((page) => [page.data.slug]);

  return {
    render: 'dynamic' as const,
    // staticPaths: slugs,
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
  codeTitle: {
    fontFamily: 'var(--default-mono-font-family)',
    padding: 3,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-fd-border)',
    borderRadius: 5,
    fontWeight: 400,
    backgroundColor: 'var(--color-fd-muted)',
  },
});
