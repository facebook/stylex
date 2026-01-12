/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Feed } from 'feed';
import { blogSource } from '@/lib/source';
import { marked } from 'marked';
import type { InferPageType } from 'fumadocs-core/source';

const baseUrl = 'https://stylexjs.com';

const AUTHORS: Record<string, { name: string; link: string }> = {
  mellyeliu: {
    name: 'Melissa Liu',
    link: 'https://github.com/mellyeliu',
  },
  necolas: {
    name: 'Nicolas Gallagher',
    link: 'https://github.com/necolas',
  },
  nmn: {
    name: 'Naman Goel',
    link: 'https://github.com/nmn',
  },
  vincentriemer: {
    name: 'Vincent Riemer',
    link: 'https://github.com/vincentriemer',
  },
};

async function getBlogContent(
  page: InferPageType<typeof blogSource>,
): Promise<string> {
  const text = await page.data.getText('processed');
  return marked.parse(text);
}

async function createFeed(): Promise<Feed> {
  const feed = new Feed({
    title: 'StyleX Blog',
    description: 'The latest news and updates about StyleX.',
    id: `https://stylexjs.com/blog`,
    link: `https://stylexjs.com/blog`,
    language: 'en',
    image: `${baseUrl}/img/stylex-logo-small-light.svg`,
    favicon: `${baseUrl}/img/favicon.svg`,
    copyright: `Copyright © ${new Date().getFullYear()} Meta Platforms, Inc.`,
    feedLinks: {
      rss: `${baseUrl}/blog/rss.xml`,
      atom: `${baseUrl}/blog/atom.xml`,
    },
  });

  const pages = blogSource.getPages();

  // Sort by path (which contains date) in descending order
  const sortedPages = [...pages].sort((a, b) => b.path.localeCompare(a.path));

  for (const page of sortedPages) {
    const url = `${baseUrl}/blog/${page.data.slug}`;

    // Parse date from the path (format: YYYY-MM-DD-title)
    const pathMatch = page.path.match(/\/(\d{4}-\d{2}-\d{2})/);
    const dateStr = pathMatch?.[1];
    const date = dateStr ? new Date(dateStr) : new Date();

    const authors = (page.data.authors ?? [])
      .map((authorId: string) => AUTHORS[authorId])
      .filter((author): author is { name: string; link: string } => !!author);

    // Get the full content of the blog post
    const content = await getBlogContent(page);

    feed.addItem({
      id: url,
      title: page.data.title,
      description: page.data.description ?? '',
      content,
      link: url,
      date,
      author: authors,
    });
  }

  return feed;
}

let feedPromise: Promise<Feed> | null = null;
async function getFeed(): Promise<Feed> {
  if (!feedPromise) {
    feedPromise = createFeed();
  }
  return feedPromise;
}

export async function getRSS(): Promise<string> {
  const feed = await getFeed();
  return feed.rss2();
}

export async function getAtom(): Promise<string> {
  const feed = await getFeed();
  return feed.atom1();
}

