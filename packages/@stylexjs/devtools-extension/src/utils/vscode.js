/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

function openExternalUrl(url: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noreferrer';
  a.click();
}

function ensureLeadingSlash(path: string): string {
  if (!path) return '/';
  if (path.startsWith('/')) return path;
  return `/${path}`;
}

function joinPaths(root: string, rel: string): string {
  const left = root.replace(/\\\\/g, '/').replace(/\/+$/, '');
  const right = rel.replace(/\\\\/g, '/').replace(/^\/+/, '');
  return `${left}/${right}`;
}

function stylexFileToEditorRelativePath(file: string): string {
  const normalized = file.replace(/\\\\/g, '/').replace(/^\.?\//, '');

  const nmIndex = normalized.indexOf('node_modules/');
  if (nmIndex !== -1) {
    return normalized.slice(nmIndex);
  }

  const colonIndex = normalized.indexOf(':');
  if (colonIndex !== -1 && colonIndex !== 1) {
    const prefix = normalized.slice(0, colonIndex);
    const rest = normalized.slice(colonIndex + 1).replace(/^\/+/, '');
    if (prefix && rest) {
      return `packages/${prefix.replace(/\/+$/, '')}/${rest}`;
    }
  }

  return normalized;
}

function getOrPromptForVsCodeRoot(): string | null {
  const key = 'stylex_vscode_root';
  const existing = (localStorage.getItem(key) ?? '').trim();
  if (existing) return existing;

  // eslint-disable-next-line no-alert
  const next = window.prompt(
    'VS Code root path (absolute). Example: /Users/you/project',
    '',
  );
  if (!next) return null;
  const value = next.trim();
  if (!value) return null;
  localStorage.setItem(key, value);
  return value;
}

function resolveStylexSourceToAbsolutePath(file: string): string | null {
  const normalized = file.replace(/\\\\/g, '/').trim();
  if (!normalized) return null;

  if (normalized.startsWith('/') || /^[a-zA-Z]:\//.test(normalized)) {
    return normalized;
  }

  const root = getOrPromptForVsCodeRoot();
  if (!root) return null;

  const rel = stylexFileToEditorRelativePath(normalized);
  return joinPaths(root, rel);
}

export function openInVsCodeFromStylexSource(
  file: string,
  line: number | null,
): void {
  const absPath = resolveStylexSourceToAbsolutePath(file);
  if (!absPath) {
    return;
  }

  const normalizedPath = absPath.replace(/\\\\/g, '/');
  const lineSuffix = typeof line === 'number' ? `:${line}:1` : '';
  const url = encodeURI(
    `vscode://file${ensureLeadingSlash(normalizedPath)}${lineSuffix}`,
  );
  openExternalUrl(url);
}
