import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from 'fumadocs-mdx/config';
import z from 'zod';

export const docs = defineDocs({
  dir: 'content/docs',
});

export const blog = defineDocs({
  dir: 'content/blog',
  docs: {
    schema: frontmatterSchema.extend({
      slug: z.string(),
      authors: z.array(z.string()),
      tags: z.array(z.string()).optional(),
    }),
  },
});

export default defineConfig();
