/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { VarGroup } from '@stylexjs/stylex/lib/StyleXTypes';

import { defineVars } from '@stylexjs/stylex';

const shadowStrength = '1%';
const shadowColor = '220 3% 15%';

const shadowStrengthDark = '25%';
const shadowColorDark = '220 40% 2%';

const innerShadowHighlight = 'inset 0 -.5px 0 0 #fff2, inset 0 .5px 0 0 #0007';

const DARK = '@media (prefers-color-scheme: dark)';

type TShadows = $ReadOnly<{
  shadow1: string,
  shadow2: string,
  shadow3: string,
  shadow4: string,
  shadow5: string,
  shadow6: string,

  innerShadow0: string,
  innerShadow1: string,
  innerShadow2: string,
  innerShadow3: string,
  innerShadow4: string,
}>;

export const shadows: VarGroup<TShadows> = defineVars({
  shadow1: {
    default: `0 1px 2px -1px hsl(${shadowColor} / calc(${shadowStrength} + 9%))`,
    [DARK]: `0 1px 2px -1px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 9%))`,
  },
  shadow2: {
    default: `
    0 3px 5px -2px hsl(${shadowColor} / calc(${shadowStrength} + 3%)),
    0 7px 14px -5px hsl(${shadowColor} / calc(${shadowStrength} + 5%))`,
    [DARK]: `
    0 3px 5px -2px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 3%)),
    0 7px 14px -5px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 5%))`,
  },
  shadow3: {
    default: `
      0 -1px 3px 0 hsl(${shadowColor} / calc(${shadowStrength} + 2%)),
      0 1px 2px -5px hsl(${shadowColor} / calc(${shadowStrength} + 2%)),
      0 2px 5px -5px hsl(${shadowColor} / calc(${shadowStrength} + 4%)),
      0 4px 12px -5px hsl(${shadowColor} / calc(${shadowStrength} + 5%)),
      0 12px 15px -5px hsl(${shadowColor} / calc(${shadowStrength} + 7%))`,
    [DARK]: `
    0 -1px 3px 0 hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 2%)),
    0 1px 2px -5px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 2%)),
    0 2px 5px -5px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 4%)),
    0 4px 12px -5px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 5%)),
    0 12px 15px -5px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 7%))`,
  },
  shadow4: {
    default: `
      0 -2px 5px 0 hsl(${shadowColor} / calc(${shadowStrength} + 2%)),
      0 1px 1px -2px hsl(${shadowColor} / calc(${shadowStrength} + 3%)),
      0 2px 2px -2px hsl(${shadowColor} / calc(${shadowStrength} + 3%)),
      0 5px 5px -2px hsl(${shadowColor} / calc(${shadowStrength} + 4%)),
      0 9px 9px -2px hsl(${shadowColor} / calc(${shadowStrength} + 5%)),
      0 16px 16px -2px hsl(${shadowColor} / calc(${shadowStrength} + 6%))`,
    [DARK]: `
    0 -2px 5px 0 hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 2%)),
    0 1px 1px -2px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 3%)),
    0 2px 2px -2px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 3%)),
    0 5px 5px -2px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 4%)),
    0 9px 9px -2px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 5%)),
    0 16px 16px -2px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 6%))`,
  },
  shadow5: {
    default: `
      0 -1px 2px 0 hsl(${shadowColor} / calc(${shadowStrength} + 2%)),
      0 2px 1px -2px hsl(${shadowColor} / calc(${shadowStrength} + 3%)),
      0 5px 5px -2px hsl(${shadowColor} / calc(${shadowStrength} + 3%)),
      0 10px 10px -2px hsl(${shadowColor} / calc(${shadowStrength} + 4%)),
      0 20px 20px -2px hsl(${shadowColor} / calc(${shadowStrength} + 5%)),
      0 40px 40px -2px hsl(${shadowColor} / calc(${shadowStrength} + 7%))`,
    [DARK]: `
    0 -1px 2px 0 hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 2%)),
    0 2px 1px -2px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 3%)),
    0 5px 5px -2px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 3%)),
    0 10px 10px -2px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 4%)),
    0 20px 20px -2px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 5%)),
    0 40px 40px -2px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 7%))`,
  },
  shadow6: {
    default: `
      0 -1px 2px 0 hsl(${shadowColor} / calc(${shadowStrength} + 2%)),
      0 3px 2px -2px hsl(${shadowColor} / calc(${shadowStrength} + 3%)),
      0 7px 5px -2px hsl(${shadowColor} / calc(${shadowStrength} + 3%)),
      0 12px 10px -2px hsl(${shadowColor} / calc(${shadowStrength} + 4%)),
      0 22px 18px -2px hsl(${shadowColor} / calc(${shadowStrength} + 5%)),
      0 41px 33px -2px hsl(${shadowColor} / calc(${shadowStrength} + 6%)),
      0 100px 80px -2px hsl(${shadowColor} / calc(${shadowStrength} + 7%))`,
    [DARK]: `
      0 -1px 2px 0 hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 2%)),
      0 3px 2px -2px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 3%)),
      0 7px 5px -2px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 3%)),
      0 12px 10px -2px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 4%)),
      0 22px 18px -2px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 5%)),
      0 41px 33px -2px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 6%)),
      0 100px 80px -2px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 7%))`,
  },

  innerShadow0: {
    default: `inset 0 0 0 1px hsl(${shadowColor} / calc(${shadowStrength} + 9%))`,
    [DARK]: `inset 0 0 0 1px hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 9%))`,
  },
  innerShadow1: {
    default: `inset 0 1px 2px 0 hsl(${shadowColor} / calc(${shadowStrength} + 9%)), ${innerShadowHighlight}`,
    [DARK]: `inset 0 1px 2px 0 hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 9%)), ${innerShadowHighlight}`,
  },
  innerShadow2: {
    default: `inset 0 1px 4px 0 hsl(${shadowColor} / calc(${shadowStrength} + 9%)), ${innerShadowHighlight}`,
    [DARK]: `inset 0 1px 4px 0 hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 9%)), ${innerShadowHighlight}`,
  },
  innerShadow3: {
    default: `inset 0 2px 8px 0 hsl(${shadowColor} / calc(${shadowStrength} + 9%)), ${innerShadowHighlight}`,
    [DARK]: `inset 0 2px 8px 0 hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 9%)), ${innerShadowHighlight}`,
  },
  innerShadow4: {
    default: `inset 0 2px 14px 0 hsl(${shadowColor} / calc(${shadowStrength} + 9%)), ${innerShadowHighlight}`,
    [DARK]: `inset 0 2px 14px 0 hsl(${shadowColorDark} / calc(${shadowStrengthDark} + 9%)), ${innerShadowHighlight}`,
  },
});
