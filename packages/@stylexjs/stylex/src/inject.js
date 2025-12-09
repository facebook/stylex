/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import { createSheet } from './stylesheet/createSheet';
import { addSpecificityLevel } from './stylesheet/utils';

const sheet = createSheet();

const constants: { [constKey: string]: string | number } = {};

const dependencies: {
  [constKey: string]: Map<string, { priority: number, resolvedCss: string }>,
} = {};

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Resolve all constant references in a CSS text string
 */
function resolveConstants(cssText: string): string {
  let resolved = cssText;

  const varPattern = /var\(--([a-z0-9]+)\)/gi;
  varPattern.lastIndex = 0;

  const replacements: Array<[string, string]> = [];

  let match = varPattern.exec(cssText);

  while (match != null) {
    const constKey = match[1];

    if (constKey != null && constants[constKey] !== undefined) {
      const constVal = constants[constKey];
      const constValStr = String(constVal);

      replacements.push([`var(--${constKey})`, constValStr]);
    }
    match = varPattern.exec(cssText);
  }

  for (const [search, replace] of replacements) {
    const regex = new RegExp(escapeRegex(search), 'g');
    resolved = resolved.replace(regex, replace);
  }

  return resolved;
}

/**
 * Track dependencies between constants and CSS rules
 */
function trackDependencies(
  originalCssText: string,
  priority: number,
  resolvedCss: string,
): void {
  const varPattern = /var\(--([a-z0-9]+)\)/gi;

  let match = varPattern.exec(originalCssText);
  while (match != null) {
    const constKey = match[1];
    if (constKey != null && constants[constKey] !== undefined) {
      if (!dependencies[constKey]) {
        dependencies[constKey] = new Map();
      }
      dependencies[constKey].set(originalCssText, { priority, resolvedCss });
    }
    match = varPattern.exec(originalCssText);
  }
}

/**
 * Update all CSS rules that depend on a changed constant
 */
function updateDependentRules(constKey: string): void {
  const deps = dependencies[constKey];

  if (!deps || deps.size === 0) {
    return;
  }

  deps.forEach(({ priority, resolvedCss: oldResolvedCss }, cssText) => {
    const newResolvedCss = resolveConstants(cssText);

    const oldText = addSpecificityLevel(
      oldResolvedCss,
      Math.floor(priority / 1000),
    );
    const newText = addSpecificityLevel(
      newResolvedCss,
      Math.floor(priority / 1000),
    );

    deps.set(cssText, { priority, resolvedCss: newResolvedCss });

    sheet.update(oldText, newText, priority);
  });
}

type InjectArgs = $ReadOnly<{
  ltr: string,
  rtl?: ?string,
  priority: number,
  constKey?: string,
  constVal?: string | number,
}>;

export default function inject(args: InjectArgs): string {
  const { ltr: cssText, priority, constKey, constVal } = args;

  if (constKey !== undefined && constVal !== undefined) {
    const hadPreviousValue = constants[constKey] !== undefined;
    const valueChanged = hadPreviousValue && constants[constKey] !== constVal;

    constants[constKey] = constVal;

    if (valueChanged) {
      updateDependentRules(constKey);
    }

    return '';
  }

  const resolved = resolveConstants(cssText);

  const text = addSpecificityLevel(resolved, Math.floor(priority / 1000));

  sheet.insert(text, priority);

  trackDependencies(cssText, priority, resolved);

  return text;
}
