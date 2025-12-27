import * as stylex from '@stylexjs/stylex';
import { blogSource } from '@/lib/source';
import BlogRoute from './[...slugs]';

export default function BlogPage() {
  const pages = blogSource.getPages();

  const sortedPages = [...pages].sort((a, b) => b.path.localeCompare(a.path));
  const latestPage = sortedPages[0];
  if (!latestPage) {
    return <div {...stylex.props(styles.container)}>No blog posts yet.</div>;
  }

  return (
    <BlogRoute
      slugs={[latestPage.data.slug]}
      path={`/blog/${latestPage.data.slug}`}
      query={''}
    />
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
