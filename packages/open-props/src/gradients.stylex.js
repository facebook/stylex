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

type TGradients = $ReadOnly<{
  gradient1: string,
  gradient2: string,
  gradient3: string,
  gradient4: string,
  gradient5: string,
  gradient6: string,
  gradient7: string,
  gradient8: string,
  gradient9: string,
  gradient10: string,
  gradient11: string,
  gradient12: string,
  gradient13: string,
  gradient14: string,
  gradient15: string,
  gradient16: string,
  gradient17: string,
  gradient18: string,
  gradient19: string,
  gradient20: string,
  gradient21: string,
  gradient22: string,
  gradient23: string,
  gradient24: string,
  gradient25: string,
  gradient26: string,
  gradient27: string,
  gradient28: string,
  gradient29: string,
  gradient30: string,

  noise1: string,
  noise2: string,
  noise3: string,
  noise4: string,
  noise5: string,

  noiseFilter1: string,
  noiseFilter2: string,
  noiseFilter3: string,
  noiseFilter4: string,
  noiseFilter5: string,
}>;

export const gradients: VarGroup<TGradients> = defineVars({
  gradient1:
    'linear-gradient(to bottom right,#1f005c, #5b0060, #870160, #ac255e, #ca485c, #e16b5c, #f39060, #ffb56b)',
  gradient2: 'linear-gradient(to bottom right,#48005c, #8300e2, #a269ff)',
  gradient3: `
      radial-gradient(
        circle at top right,
        hsl(180 100% 50%), hsl(180 100% 50% / 0%)
      ),
      radial-gradient(
        circle at bottom left,
        hsl(328 100% 54%), hsl(328 100% 54% / 0%)
      )`,
  gradient4: 'linear-gradient(to bottom right,#00F5A0,#00D9F5)',
  gradient5: 'conic-gradient(from -270deg at 75% 110%, fuchsia, floralwhite)',
  gradient6: 'conic-gradient(from -90deg at top left, black, white)',
  gradient7: 'linear-gradient(to bottom right,#72C6EF,#004E8F)',
  gradient8: 'conic-gradient(from 90deg at 50% 0%, #111, 50%, #222, #111)',
  gradient9: 'conic-gradient(from .5turn at bottom center, lightblue, white)',
  gradient10:
    'conic-gradient(from 90deg at 40% -25%, #ffd700, #f79d03, #ee6907, #e6390a, #de0d0d, #d61039, #cf1261, #c71585, #cf1261, #d61039, #de0d0d, #ee6907, #f79d03, #ffd700, #ffd700, #ffd700)',
  gradient11: 'conic-gradient(at bottom left, deeppink, cyan)',
  gradient12:
    'conic-gradient(from 90deg at 25% -10%, #ff4500, #d3f340, #7bee85, #afeeee, #7bee85)',
  gradient13:
    'radial-gradient(circle at 50% 200%, #000142, #3b0083, #b300c3, #ff059f, #ff4661, #ffad86, #fff3c7)',
  gradient14: 'conic-gradient(at top right, lime, cyan)',
  gradient15: 'linear-gradient(to bottom right, #c7d2fe, #fecaca, #fef3c7)',
  gradient16: 'radial-gradient(circle at 50% -250%, #374151, #111827, #000)',
  gradient17: 'conic-gradient(from -90deg at 50% -25%, blue, blueviolet)',
  gradient18: `
      linear-gradient(0deg,   hsla(0   100% 50% / 80%), hsla(0   100% 50% / 0) 75%),
      linear-gradient(60deg,  hsla(60  100% 50% / 80%), hsla(60  100% 50% / 0) 75%),
      linear-gradient(120deg, hsla(120 100% 50% / 80%), hsla(120 100% 50% / 0) 75%),
      linear-gradient(180deg, hsla(180 100% 50% / 80%), hsla(180 100% 50% / 0) 75%),
      linear-gradient(240deg, hsla(240 100% 50% / 80%), hsla(240 100% 50% / 0) 75%),
      linear-gradient(300deg, hsla(300 100% 50% / 80%), hsla(300 100% 50% / 0) 75%)
    `,
  gradient19: 'linear-gradient(to bottom right,#ffe259,#ffa751)',
  gradient20:
    'conic-gradient(from -135deg at -10% center, #ffa500, #ff7715, #ff522a, #ff3f47, #ff5482, #ff69b4)',
  gradient21:
    'conic-gradient(from -90deg at 25% 115%, #ff0000, #ff0066, #ff00cc, #cc00ff, #6600ff, #0000ff, #0000ff, #0000ff, #0000ff)',
  gradient22: 'linear-gradient(to bottom right,#acb6e5,#86fde8)',
  gradient23: 'linear-gradient(to bottom right,#536976,#292E49)',
  gradient24:
    'conic-gradient(from .5turn at 0% 0%, #00c476, 10%, #82b0ff, 90%, #00c476)',
  gradient25:
    'conic-gradient(at 125% 50%, #b78cf7, #ff7c94, #ffcf0d, #ff7c94, #b78cf7)',
  gradient26: 'linear-gradient(to bottom right,#9796f0,#fbc7d4)',
  gradient27:
    'conic-gradient(from .5turn at bottom left, deeppink, rebeccapurple)',
  gradient28: 'conic-gradient(from -90deg at 50% 105%, white, orchid)',
  gradient29: `
      radial-gradient(
        circle at top right,
        hsl(250 100% 85%), hsl(250 100% 85% / 0%)
      ),
      radial-gradient(
        circle at bottom left,
        hsl(220 90% 75%), hsl(220 90% 75% / 0%)
      )`,
  gradient30: `radial-gradient(
        circle at top right,
        hsl(150 100% 50%), hsl(150 100% 50% / 0%)
      ),
      radial-gradient(
        circle at bottom left,
        hsl(150 100% 84%), hsl(150 100% 84% / 0%)
      )`,

  noise1:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.005' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
  noise2:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
  noise3:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.25' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
  noise4:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 2056 2056' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
  noise5:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 2056 2056' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",

  noiseFilter1: 'contrast(300%) brightness(100%)',
  noiseFilter2: 'contrast(200%) brightness(150%)',
  noiseFilter3: 'contrast(200%) brightness(250%)',
  noiseFilter4: 'contrast(200%) brightness(500%)',
  noiseFilter5: 'contrast(200%) brightness(1000%)',
});
