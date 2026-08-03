/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { SourcePreview } from '../types';

import { findBestMatchingResource } from '../utils/resourceMatching';
import { formatSourceSnippet } from '../utils/sourceSnippet';
import { devtools, usesPromiseApi } from './browserApi';

type Resource = {
  url: string,
  getContent: Function,
};

let resourcesPromise: ?Promise<Array<Resource>> = null;

export const supportsSourcePreview: boolean =
  !usesPromiseApi &&
  typeof devtools.inspectedWindow?.getResources === 'function';

export const supportsOpenResource: boolean =
  !usesPromiseApi && typeof devtools.panels?.openResource === 'function';

export function invalidateSourceCache(): void {
  resourcesPromise = null;
}

function loadResources(): Promise<Array<Resource>> {
  if (!supportsSourcePreview) {
    return Promise.reject(
      new Error('This browser does not expose inspected-page resources.'),
    );
  }
  return new Promise((resolve) => {
    devtools.inspectedWindow.getResources(resolve);
  });
}

function getResources(): Promise<Array<Resource>> {
  if (resourcesPromise == null) {
    resourcesPromise = loadResources().catch((error) => {
      resourcesPromise = null;
      throw error;
    });
  }
  return resourcesPromise;
}

async function findResource(file: string): Promise<?Resource> {
  return findBestMatchingResource(await getResources(), file);
}

function getResourceText(resource: Resource): Promise<?string> {
  return new Promise((resolve) => {
    resource.getContent((content, encoding) => {
      resolve(decodeContent(content, encoding));
    });
  });
}

function decodeContent(content: mixed, encoding: mixed): ?string {
  if (typeof content !== 'string') {
    return null;
  }
  if (encoding !== 'base64') {
    return content;
  }
  try {
    return atob(content);
  } catch {
    return null;
  }
}

function toZeroBasedLine(line: ?number): number {
  return typeof line === 'number' ? Math.max(line - 1, 0) : 0;
}

export async function openSource(
  file: string,
  line: number | null,
): Promise<void> {
  if (!supportsOpenResource || !supportsSourcePreview) {
    throw new Error('Opening source files is not supported by this browser.');
  }
  const resource = await findResource(file);
  if (resource == null) {
    throw new Error(`Could not find a loaded resource matching: ${file}`);
  }
  devtools.panels.openResource(resource.url, toZeroBasedLine(line));
}

export async function getSourcePreview(
  file: string,
  line: number | null,
): Promise<SourcePreview> {
  const resource = await findResource(file);
  if (resource == null) {
    return {
      url: '',
      snippet: `Could not find a DevTools resource matching:\n${file}`,
    };
  }
  const content = await getResourceText(resource);
  if (content == null || content === '') {
    return {
      url: resource.url,
      snippet: 'DevTools did not provide contents for this resource.',
    };
  }
  return {
    url: resource.url,
    snippet: formatSourceSnippet(content, line),
  };
}
