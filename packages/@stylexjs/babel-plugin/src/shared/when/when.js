/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { StyleXOptions } from '../common-types';

import { defaultOptions } from '../utils/default-options';

function getDefaultMarkerClassName(
  options: StyleXOptions = defaultOptions,
): string {
  const prefix =
    options.classNamePrefix != null ? `${options.classNamePrefix}-` : '';
  return `${prefix}default-marker`;
}

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
 * active on an ancestor with the "defaultMarker"
 *
 *
 * @param pseudo - The pseudo selector (e.g., ':hover', ':focus')
 * @returns A :where() clause for the ancestor observer
 */
export function ancestor(
  pseudo: string,
  options: string | StyleXOptions = defaultOptions,
): string {
  validatePseudoSelector(pseudo);
  const defaultMarker =
    typeof options === 'string' ? options : getDefaultMarkerClassName(options);
  return `:where(.${defaultMarker}${pseudo} *)`;
}

/**
 * Creates selector that observes if the given pseudo-class is
 * active on a descendant with the "defaultMarker"
 *
 * @param pseudo - The pseudo selector (e.g., ':hover', ':focus')
 * @returns A :has() clause for the descendant observer
 */
export function descendant(
  pseudo: string,
  options: string | StyleXOptions = defaultOptions,
): string {
  validatePseudoSelector(pseudo);
  const defaultMarker =
    typeof options === 'string' ? options : getDefaultMarkerClassName(options);
  return `:has(.${defaultMarker}${pseudo})`;
}

/**
 * Creates selector that observes if the given pseudo-class is
 * active on a previous sibling with the "defaultMarker"
 *
 * @param pseudo - The pseudo selector (e.g., ':hover', ':focus')
 * @returns A :where() clause for the previous sibling observer
 */
export function siblingBefore(
  pseudo: string,
  options: string | StyleXOptions = defaultOptions,
): string {
  validatePseudoSelector(pseudo);
  const defaultMarker =
    typeof options === 'string' ? options : getDefaultMarkerClassName(options);
  return `:where(.${defaultMarker}${pseudo} ~ *)`;
}

/**
 * Creates selector that observes if the given pseudo-class is
 * active on a next sibling with the "defaultMarker"
 *
 * @param pseudo - The pseudo selector (e.g., ':hover', ':focus')
 * @returns A :has() clause for the next sibling observer
 */
export function siblingAfter(
  pseudo: string,
  options: string | StyleXOptions = defaultOptions,
): string {
  validatePseudoSelector(pseudo);
  const defaultMarker =
    typeof options === 'string' ? options : getDefaultMarkerClassName(options);
  return `:has(~ .${defaultMarker}${pseudo})`;
}

/**
 * Creates selector that observes if the given pseudo-class is
 * active on any sibling with the "defaultMarker"
 *
 * @param pseudo - The pseudo selector (e.g., ':hover', ':focus')
 * @returns A :where() clause for the any sibling observer
 */
export function anySibling(
  pseudo: string,
  options: string | StyleXOptions = defaultOptions,
): string {
  validatePseudoSelector(pseudo);
  const defaultMarker =
    typeof options === 'string' ? options : getDefaultMarkerClassName(options);
  return `:where(.${defaultMarker}${pseudo} ~ *, :has(~ .${defaultMarker}${pseudo}))`;
}
