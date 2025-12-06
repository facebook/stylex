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
import { Card } from 'fumadocs-ui/components/card';

export default function BlogPage({ slug }: PageProps<'/blog/[slug]'>) {
  const pages = blogSource.getPages();

  const sortedPages = [...pages].sort((a, b) => b.path.localeCompare(a.path));

  return (
    <div {...stylex.props(styles.container)}>
      {sortedPages.map((page) => (
        <Card
          title={page.data.title}
          description={page.data.description ?? ''}
          href={`/blog/${page.data.slug}`}
        />
      ))}
    </div>
  );
}

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
    maxWidth: 800,
    marginInline: 'auto',
    paddingBlock: 58,
  },
});
