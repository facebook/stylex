/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export const canUseDOM: boolean = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

/**
 * Adds :not(#\#) to selectors to increase their specificity.
 * This is used to polyfill @layer
 */
export function addSpecificityLevel(cssText: string, index: number): string {
  if (cssText.startsWith('@keyframes')) {
    return cssText;
  }

  const pseudoSelector = Array.from({ length: index })
    .map(() => ':not(#\\#)')
    .join('');

  const lastOpenCurly = cssText.includes('::')
    ? cssText.indexOf('::')
    : cssText.lastIndexOf('{');
  const beforeCurly = cssText.slice(0, lastOpenCurly);
  const afterCurly = cssText.slice(lastOpenCurly);

  return `${beforeCurly}${pseudoSelector}${afterCurly}`;
}
