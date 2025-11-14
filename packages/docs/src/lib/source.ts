import { loader } from 'fumadocs-core/source';
import { create, docs, blog } from '@/.source';

export const source = loader({
  source: await create.sourceAsync(docs.doc, docs.meta),
  baseUrl: '/docs',
});

export const blogSource = loader({
  source: await create.sourceAsync(blog.doc, blog.meta),
  baseUrl: '/blog',
});