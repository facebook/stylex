/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

const PRIORITIES = {
  // These should never exist at runtime:
  border: 1,
  'border-block-end': 2,
  'border-block-start': 2,
  'border-top': 2.1,
  'border-bottom': 2.1,
  'border-inline-end': 2,
  'border-inline-start': 2,
  'border-left': 2,
  'border-right': 2,
  // End of never-exist-at-runtime properties.

  // These are shorthands of shorthands:
  grid: 2,
  'grid-area': 2,

  // These are shorthands of final properties:
  'border-color': 3,
  'border-style': 3,
  'border-width': 3,

  'border-image': 3,
  'border-radius': 3,

  animation: 3,
  background: 3,
  'column-rule': 3,
  columns: 3,
  flex: 3,
  'flex-flow': 3,
  font: 3,
  gap: 3,

  'grid-column': 3,
  'grid-row': 3,
  'grid-template': 3,
  'list-style': 3,
  margin: 3,
  mask: 3,
  offset: 3,
  outline: 3,
  overflow: 3,
  padding: 3,
  'place-content': 3,
  'place-items': 3,
  'place-self': 3,
  'scroll-margin': 3,
  'scroll-padding': 3,
  'text-decoration': 3,
  'text-emphasis': 3,
  transition: 3,

  ':has': 4.5,
  ':dir': 5,
  ':lang': 5.1,
  ':first-child': 5.2,
  ':last-child': 5.3,
  ':only-child': 5.4,

  ':nth-child': 6,
  ':nth-of-type': 6.1,
  ':only-of-type': 6.2,
  ':empty': 7,

  ':link': 8,
  ':any-link': 8.1,
  ':target': 8.2,
  ':visited': 8.3,

  ':enabled': 9.1,
  ':disabled': 9.2,
  ':required': 9.3,
  ':optional': 9.4,
  ':read-only': 9.5,
  ':read-write': 9.6,
  ':placeholder-shown': 9.7,

  ':default': 10,
  ':checked': 10.1,
  ':indeterminate': 10.1,
  ':blank': 10.2,
  ':valid': 10.3,
  ':invalid': 10.4,

  ':autofill': 11,

  ':picture-in-picture': 12,
  ':fullscreen': 12.1,
  ':paused': 12.2,
  ':playing': 12.3,

  ':hover': 13,
  ':focusWithin': 14,
  ':focusVisible': 15,
  ':focus': 16,
  ':active': 17,
};

export default function getPriority(key: string): number {
  if (key.startsWith('@supports')) {
    return 20;
  }
  if (key.startsWith('@media')) {
    return 21;
  }

  const prop =
    key.startsWith(':') && key.includes('(')
      ? key.slice(0, key.indexOf('('))
      : key;

  let priority = PRIORITIES[prop] ?? 4;
  if (
    key.toLowerCase().includes('left') ||
    key.toLowerCase().includes('right')
  ) {
    // Bump priority for physical left/right values.
    priority += 0.1;
  }
  return priority;
}
