/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
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
      path={`/blog/${latestPage.data.slug}`}
      query={''}
      slugs={[latestPage.data.slug]}
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
    paddingBlock: 58,
    marginInline: 'auto',
  },
});
