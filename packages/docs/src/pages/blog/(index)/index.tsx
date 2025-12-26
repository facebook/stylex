import * as stylex from '@stylexjs/stylex';
import { blogSource } from '@/lib/source';
import { Card } from '@/components/mdx/Cards';

export default function BlogPage() {
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
