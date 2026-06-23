/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Derive a plain-text excerpt from markdown, for use as a meta/social
// description when a page has no explicit `description`. Accumulates the leading
// content paragraphs (skipping headings and code blocks) until the length limit,
// strips common markdown syntax, and truncates on a word boundary.
export function getExcerpt(markdown: string, maxLength = 200): string {
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(
      (block) =>
        block.length > 0 && !block.startsWith('#') && !block.startsWith('```'),
    );

  let collected = '';
  for (const paragraph of paragraphs) {
    collected = collected ? `${collected} ${paragraph}` : paragraph;
    if (collected.length >= maxLength) break;
  }

  const plain = collected
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> link text
    .replace(/[*_~>#]/g, '') // emphasis / blockquote / heading markers
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= maxLength) return plain;
  return (
    plain
      .slice(0, maxLength)
      .replace(/\s+\S*$/, '')
      .trimEnd() + '…'
  );
}
