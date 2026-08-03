/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export function formatSourceSnippet(
  content: string,
  line: number | null,
): string {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  if (lines.length === 0) return '';

  const target =
    typeof line === 'number' && Number.isFinite(line)
      ? Math.min(Math.max(Math.floor(line), 1), lines.length)
      : 1;
  const start = Math.max(target - 3, 1);
  const end = Math.min(target + 6, lines.length);
  const width = String(end).length;
  const output = [];
  for (let current = start; current <= end; current += 1) {
    const marker = current === target ? '>' : ' ';
    output.push(
      `${marker} ${String(current).padStart(width, ' ')} | ${
        lines[current - 1] ?? ''
      }`,
    );
  }
  return output.join('\n');
}
