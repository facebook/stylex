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
import { mdxComponents } from '@/components/mdx';
import nmnImage from '@/static/img/nmn.jpg';
import necolasImage from '@/static/img/necolas.jpg';
import mellyeliuImage from '@/static/img/mellyeliu.jpg';
import vincentriemerImage from '@/static/img/vincentriemer.png';

export default function BlogPage({ slugs }: PageProps<'/blog/[...slugs]'>) {
  const pages = blogSource.getPages();

  const slug = slugs[0];

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
  const authors = page.data.authors.map(
    (author) => AUTHORS[author as keyof typeof AUTHORS],
  );

  return (
    <DocsPage
      {...baseOptions()}
      toc={page.data.toc}
      tableOfContent={{ style: 'clerk' }}
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
      <div {...stylex.props(styles.authors)}>
        {authors.map((author) => (
          <div {...stylex.props(styles.author)}>
            <img {...stylex.props(styles.authorImage)} src={author.image_url} />
            <div {...stylex.props(styles.authorInfo)}>
              <div {...stylex.props(styles.authorName)}>{author.name}</div>
              <div {...stylex.props(styles.authorTitle)}>{author.title}</div>
            </div>
          </div>
        ))}
      </div>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...defaultMdxComponents,
            ...mdxComponents,
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function getConfig() {
  const pages = blogSource.getPages();
  const slugs = pages.map((page) => [page.data.slug]);

  console.log('slugs', slugs);

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
  authors: {
    display: 'flex',
    gap: 32,
  },
  author: {
    display: 'flex',
    gap: 16,
  },
  authorImage: {
    width: 48,
    height: 48,
    borderRadius: '50%',
  },
  authorInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  authorName: {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-fd-primary)',
  },
  authorTitle: {
    fontSize: 14,
    color: 'var(--color-fd-muted-foreground)',
  },
});

const AUTHORS = {
  mellyeliu: {
    name: 'Melissa Liu',
    title: 'StyleX Core',
    url: 'https://github.com/mellyeliu',
    image_url: mellyeliuImage,
  },
  necolas: {
    name: 'Nicolas Gallagher',
    title: 'StyleX Core',
    url: 'https://github.com/necolas',
    image_url: necolasImage,
  },
  nmn: {
    name: 'Naman Goel',
    title: 'StyleX Core',
    url: 'https://github.com/nmn',
    image_url: nmnImage,
  },
  vincentriemer: {
    name: 'Vincent Riemer',
    title: 'StyleX Core',
    url: 'https://github.com/vincentriemer',
    image_url: vincentriemerImage,
  },
};
