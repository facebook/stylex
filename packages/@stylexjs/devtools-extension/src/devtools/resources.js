/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import { getResourceText, getResources, openResource } from './api.js';
import type { Resource } from './api.js';
import { findBestMatchingResource } from '../utils/resourceMatching.js';
import { formatSourceSnippet } from '../utils/sourceSnippet.js';
import type { SourcePreview } from '../types.js';

function normalizeLineToZeroBased(line: ?number | null): number {
  if (typeof line !== 'number') return 0;
  return Math.max(line - 1, 0);
}

export async function findBestResourceForFile(
  file: string,
): Promise<Resource | null> {
  const resources = await getResources();
  return findBestMatchingResource(resources, file);
}

export async function openSourceBestEffort(
  file: string,
  line: number | null,
): Promise<void> {
  const best = await findBestResourceForFile(file);
  if (!best) {
    throw new Error(`Could not find a loaded resource matching: ${file}`);
  }
  openResource(best.url, normalizeLineToZeroBased(line));
}

export async function getSourcePreview(
  file: string,
  line: number | null,
): Promise<SourcePreview> {
  const best = await findBestResourceForFile(file);
  if (!best) {
    return {
      url: '',
      snippet: `Could not find a DevTools resource matching:\n${file}`,
    };
  }

  const content = await getResourceText(best);
  if (typeof content !== 'string' || content.length === 0) {
    return {
      url: best.url,
      snippet:
        'DevTools did not provide file contents for this resource.\nTry opening it in the Sources panel once, then retry.',
    };
  }

  return {
    url: best.url,
    snippet: formatSourceSnippet(content, line),
  };
}
