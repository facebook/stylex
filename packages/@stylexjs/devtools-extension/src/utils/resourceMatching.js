/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

function isProbablySourceMappedUrl(url: string): boolean {
  return (
    url.startsWith('webpack://') ||
    url.startsWith('vite://') ||
    url.startsWith('rollup://') ||
    url.startsWith('parcel://') ||
    url.startsWith('ng://')
  );
}

function normalizeForMatching(text: string): string {
  const noHash = text.split('#')[0];
  const noQuery = noHash.split('?')[0];
  let decoded = noQuery;
  try {
    decoded = decodeURIComponent(noQuery);
  } catch {
    // ignore
  }
  return decoded.replace(/\\\\/g, '/');
}

function buildFileMatchCandidates(file: string): Array<string> {
  const candidates = new Set<string>();
  const raw = normalizeForMatching(file).trim();
  if (!raw) return [];
  candidates.add(raw);

  const colonIndex = raw.indexOf(':');
  const possiblePrefix = colonIndex !== -1 ? raw.slice(0, colonIndex) : '';
  const possiblePath = colonIndex !== -1 ? raw.slice(colonIndex + 1) : '';
  const looksLikePackagePrefix =
    colonIndex !== -1 &&
    possiblePrefix &&
    !possiblePrefix.includes('/') &&
    !/^[a-zA-Z]$/.test(possiblePrefix);

  if (looksLikePackagePrefix) {
    const withoutPrefix = possiblePath.replace(/^\.?\//, '');
    if (withoutPrefix) candidates.add(withoutPrefix);
    candidates.add(`${possiblePrefix}/${withoutPrefix}`);
    candidates.add(
      `packages/${possiblePrefix.replace(/\/+$/, '')}/${withoutPrefix}`,
    );
    candidates.add(
      `node_modules/${possiblePrefix.replace(/\/+$/, '')}/${withoutPrefix}`,
    );
  }

  const parts = raw.split('/').filter(Boolean);
  if (parts.length >= 3) {
    candidates.add(parts.slice(-3).join('/'));
  }
  if (parts.length >= 2) {
    candidates.add(parts.slice(-2).join('/'));
  }
  if (parts.length >= 1) {
    candidates.add(parts.slice(-1)[0]);
  }

  return Array.from(candidates)
    .map((s) => normalizeForMatching(s).replace(/^\/+/, ''))
    .filter(Boolean);
}

export function findBestMatchingResource<T: { url: string, ... }>(
  resources: $ReadOnlyArray<T>,
  file: string,
): T | null {
  const suffixes = buildFileMatchCandidates(file);
  if (suffixes.length === 0) return null;

  function scoreResourceUrl(url: string): number | null {
    const u = normalizeForMatching(url);
    if (!u) return null;

    let matchScore: number | null = null;
    for (const s of suffixes) {
      if (u === s) matchScore = Math.max(matchScore ?? -1, 10_000);
      else if (u.endsWith(`/${s}`))
        matchScore = Math.max(matchScore ?? -1, 9_000);
      else if (u.endsWith(s)) matchScore = Math.max(matchScore ?? -1, 8_000);
      else if (u.includes(`/${s}`))
        matchScore = Math.max(matchScore ?? -1, 7_000);
      else if (u.includes(s)) matchScore = Math.max(matchScore ?? -1, 6_000);
    }
    if (matchScore == null) return null;

    const schemeBonus = isProbablySourceMappedUrl(url) ? 500 : 0;
    const hasQuery = url.split('#')[0].includes('?');
    const queryPenalty = hasQuery ? -250 : 0;
    return matchScore + schemeBonus + queryPenalty;
  }

  let best: T | null = null;
  let bestScore: number | null = null;
  for (const r of resources) {
    const score = scoreResourceUrl(r.url);
    if (score == null) continue;
    if (bestScore == null || score > bestScore) {
      best = r;
      bestScore = score;
    }
  }
  return best;
}
