/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

/**
 * Returns the first non-null value from the provided arguments.
 *
 * When used with CSS variable references (strings starting with 'var(--'),
 * this function generates a CSS var() with fallback chain for build-time
 * processing. At runtime, it returns the first truthy value.
 *
 * @param {...(string | number | null | void)} values - Values to check
 * @returns {(string | number | null)} First non-null value
 *
 * @example
 * // Runtime usage
 * stylex.firstThatWorks('red', 'blue') // returns 'red'
 *
 * @example
 * // With CSS variables (build-time)
 * stylex.firstThatWorks('var(--primary)', 'var(--fallback)', 'red')
 * // Generates: var(--primary, var(--fallback, red))
 */
export default function firstThatWorks(
  ...values: Array<string | number | null | void>
): string | number | null {
  for (const value of values) {
    if (value != null) {
      return value;
    }
  }
  return null;
}
