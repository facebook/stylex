/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

/**
 * Validates that a pseudo selector starts with ':' but not '::'
 */
function validatePseudoSelector(pseudo: string): void {
  if (!pseudo.startsWith(':')) {
    throw new Error('Pseudo selector must start with ":"');
  }
  if (pseudo.startsWith('::')) {
    throw new Error(
      'Pseudo selector cannot start with "::" (pseudo-elements are not supported)',
    );
  }
}

/**
 * Creates selector that observes if the given pseudo-class is
 * active on an ancestor with the "defaultTargetId"
 *
 *
 * @param pseudo - The pseudo selector (e.g., ':hover', ':focus')
 * @returns A :where() clause for the ancestor observer
 */
export function ancestor(pseudo: string): string {
  validatePseudoSelector(pseudo);
  return `:where(.stylex-target${pseudo} *)`;
}

/**
 * Creates selector that observes if the given pseudo-class is
 * active on a descendant with the "defaultTargetId"
 *
 * @param pseudo - The pseudo selector (e.g., ':hover', ':focus')
 * @returns A :has() clause for the descendant observer
 */
export function descendant(pseudo: string): string {
  validatePseudoSelector(pseudo);
  return `:has(.stylex-target${pseudo})`;
}

/**
 * Creates selector that observes if the given pseudo-class is
 * active on a previous sibling with the "defaultTargetId"
 *
 * @param pseudo - The pseudo selector (e.g., ':hover', ':focus')
 * @returns A :where() clause for the previous sibling observer
 */
export function prevSibling(pseudo: string): string {
  validatePseudoSelector(pseudo);
  return `:where(.stylex-target${pseudo} ~ *)`;
}

/**
 * Creates selector that observes if the given pseudo-class is
 * active on a next sibling with the "defaultTargetId"
 *
 * @param pseudo - The pseudo selector (e.g., ':hover', ':focus')
 * @returns A :has() clause for the next sibling observer
 */
export function nextSibling(pseudo: string): string {
  validatePseudoSelector(pseudo);
  return `:has(~ .stylex-target${pseudo})`;
}

export function anySibling(pseudo: string): string {
  validatePseudoSelector(pseudo);
  return `:where(.stylex-target${pseudo} ~ *, :has(~ .stylex-target${pseudo}))`;
}
