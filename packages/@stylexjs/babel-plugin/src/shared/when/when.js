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

type PseudoToSuffix = {
  ':hover': StringSuffix<':hover'>,
  ':focus': StringSuffix<':focus'>,
  ':active': StringSuffix<':active'>,
  ':visited': StringSuffix<':visited'>,
  ':focus-visible': StringSuffix<':focus-visible'>,
  ':focus-within': StringSuffix<':focus-within'>,
  ':target': StringSuffix<':target'>,
  ':target-within': StringSuffix<':target-within'>,
  ':first-child': StringSuffix<':first-child'>,
  ':last-child': StringSuffix<':last-child'>,
  ':only-child': StringSuffix<':only-child'>,
  ':empty': StringSuffix<':empty'>,
  ':link': StringSuffix<':link'>,
  ':any-link': StringSuffix<':any-link'>,
  ':enabled': StringSuffix<':enabled'>,
  ':disabled': StringSuffix<':disabled'>,
  ':required': StringSuffix<':required'>,
  ':optional': StringSuffix<':optional'>,
  ':read-only': StringSuffix<':read-only'>,
  ':read-write': StringSuffix<':read-write'>,
  ':placeholder-shown': StringSuffix<':placeholder-shown'>,
  ':in-range': StringSuffix<':in-range'>,
  ':out-of-range': StringSuffix<':out-of-range'>,
  ':default': StringSuffix<':default'>,
  ':checked': StringSuffix<':checked'>,
  ':indeterminate': StringSuffix<':indeterminate'>,
  ':blank': StringSuffix<':blank'>,
  ':valid': StringSuffix<':valid'>,
  ':invalid': StringSuffix<':invalid'>,
  ':user-invalid': StringSuffix<':user-invalid'>,
  ':autofill': StringSuffix<':autofill'>,
  ':picture-in-picture': StringSuffix<':picture-in-picture'>,
  ':modal': StringSuffix<':modal'>,
  ':fullscreen': StringSuffix<':fullscreen'>,
  ':paused': StringSuffix<':paused'>,
  ':playing': StringSuffix<':playing'>,
  ':current': StringSuffix<':current'>,
  ':past': StringSuffix<':past'>,
  ':future': StringSuffix<':future'>,
};

/**
 * Creates selector that observes if the given pseudo-class is
 * active on an ancestor with the "defaultMarker"
 *
 *
 * @param pseudo - The pseudo selector (e.g., ':hover', ':focus')
 * @returns A :where() clause for the ancestor observer
 */
export function ancestor<P: $Keys<PseudoToSuffix>>(
  pseudo: P,
  options: string | StyleXOptions = defaultOptions,
): StringPrefix<':where-ancestor'> {
  validatePseudoSelector(pseudo);
  const defaultMarker =
    typeof options === 'string' ? options : getDefaultMarkerClassName(options);
  // $FlowFixMe[incompatible-cast]
  return `:where(.${defaultMarker}${pseudo} *)` as StringPrefix<':where-ancestor'>;
}

/**
 * Creates selector that observes if the given pseudo-class is
 * active on a descendant with the "defaultMarker"
 *
 * @param pseudo - The pseudo selector (e.g., ':hover', ':focus')
 * @returns A :has() clause for the descendant observer
 */
export function descendant<P: $Keys<PseudoToSuffix>>(
  pseudo: P,
  options: string | StyleXOptions = defaultOptions,
): StringPrefix<':where-descendant'> {
  validatePseudoSelector(pseudo);
  const defaultMarker =
    typeof options === 'string' ? options : getDefaultMarkerClassName(options);

  // $FlowFixMe[incompatible-cast]
  return `:where(:has(.${defaultMarker}${pseudo}))` as StringPrefix<':where-descendant'>;
}

/**
 * Creates selector that observes if the given pseudo-class is
 * active on a previous sibling with the "defaultMarker"
 *
 * @param pseudo - The pseudo selector (e.g., ':hover', ':focus')
 * @returns A :where() clause for the previous sibling observer
 */
export function siblingBefore<P: $Keys<PseudoToSuffix>>(
  pseudo: P,
  options: string | StyleXOptions = defaultOptions,
): StringPrefix<':where-sibling-before'> {
  validatePseudoSelector(pseudo);
  const defaultMarker =
    typeof options === 'string' ? options : getDefaultMarkerClassName(options);
  // $FlowFixMe[incompatible-cast]
  return `:where(.${defaultMarker}${pseudo} ~ *)` as StringPrefix<':where-sibling-before'>;
}

/**
 * Creates selector that observes if the given pseudo-class is
 * active on a next sibling with the "defaultMarker"
 *
 * @param pseudo - The pseudo selector (e.g., ':hover', ':focus')
 * @returns A :has() clause for the next sibling observer
 */
export function siblingAfter<P: $Keys<PseudoToSuffix>>(
  pseudo: P,
  options: string | StyleXOptions = defaultOptions,
): StringPrefix<':where-sibling-after'> {
  validatePseudoSelector(pseudo);
  const defaultMarker =
    typeof options === 'string' ? options : getDefaultMarkerClassName(options);
  // $FlowFixMe[incompatible-cast]
  return `:where(:has(~ .${defaultMarker}${pseudo}))` as StringPrefix<':where-sibling-after'>;
}

/**
 * Creates selector that observes if the given pseudo-class is
 * active on any sibling with the "defaultMarker"
 *
 * @param pseudo - The pseudo selector (e.g., ':hover', ':focus')
 * @returns A :where() clause for the any sibling observer
 */
export function anySibling<P: $Keys<PseudoToSuffix>>(
  pseudo: P,
  options: string | StyleXOptions = defaultOptions,
): StringPrefix<':where-any-sibling'> {
  validatePseudoSelector(pseudo);
  const defaultMarker =
    typeof options === 'string' ? options : getDefaultMarkerClassName(options);
  // $FlowFixMe[incompatible-cast]
  return `:where(.${defaultMarker}${pseudo} ~ *, :has(~ .${defaultMarker}${pseudo}))` as StringPrefix<':where-any-sibling'>;
}
