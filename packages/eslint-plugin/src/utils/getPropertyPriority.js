/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

const PSEUDO_CLASS_PRIORITIES = {
  ':is': 40,
  ':where': 40,
  ':not': 40,
  ':has': 45,
  ':dir': 50,
  ':lang': 51,
  ':first-child': 52,
  ':first-of-type': 53,
  ':last-child': 54,
  ':last-of-type': 55,
  ':only-child': 56,
  ':only-of-type': 57,

  ':nth-child': 60,
  ':nth-last-child': 61,
  ':nth-of-type': 62,
  ':nth-last-of-type': 63, // 'nth-last-of-type' is the same priority as 'nth-of-type
  ':empty': 70,

  ':link': 80,
  ':any-link': 81,
  ':local-link': 82,
  ':target-within': 83,
  ':target': 84,
  ':visited': 85,

  ':enabled': 91,
  ':disabled': 92,
  ':required': 93,
  ':optional': 94,
  ':read-only': 95,
  ':read-write': 96,
  ':placeholder-shown': 97,
  ':in-range': 98,
  ':out-of-range': 99,

  ':default': 100,
  ':checked': 101,
  ':indeterminate': 101,
  ':blank': 102,
  ':valid': 103,
  ':invalid': 104,
  ':user-invalid': 105,

  ':autofill': 110,

  ':picture-in-picture': 120,
  ':modal': 121,
  ':fullscreen': 122,
  ':paused': 123,
  ':playing': 124,
  ':current': 125,
  ':past': 126,
  ':future': 127,

  ':hover': 130,
  ':focusWithin': 140,
  ':focus': 150,
  ':focusVisible': 160,
  ':active': 170,
};

const AT_RULES_PRIORITIES = {
  '@supports': 30,
  '@media': 31,
  '@container': 32,
};

export default function getPropertyPriority(key: string): number {
  if (key.startsWith('@')) {
    return AT_RULES_PRIORITIES[key] ?? 30;
  }

  if (key.startsWith('::')) {
    return 5000;
  }

  if (key.startsWith(':')) {
    const prop =
      key.startsWith(':') && key.includes('(')
        ? key.slice(0, key.indexOf('('))
        : key;

    return PSEUDO_CLASS_PRIORITIES[prop] ?? 40;
  }

  return 1;
}
