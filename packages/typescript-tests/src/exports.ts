/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as stylex from '@stylexjs/stylex';

export const vars = stylex.defineVars({
  bar: '100%',
  baz: stylex.types.lengthPercentage(100),
});

export const consts = stylex.defineConsts({
  bar: '100%',
  baz: 100,
});

export const theme = stylex.createTheme(vars, {
  bar: '100%',
  baz: stylex.types.lengthPercentage(100),
});

export const types = stylex.defineVars({
  angle: stylex.types.angle('90deg'),
  color: stylex.types.color('blue'),
  image: stylex.types.image('url(foo.jpeg)'),
  integer: stylex.types.integer(50),
  length: stylex.types.length(50),
  lengthPercentage: stylex.types.lengthPercentage('100%'),
  number: stylex.types.number(50.5),
  percentage: stylex.types.percentage('100%'),
  resolution: stylex.types.resolution('96dpi'),
  time: stylex.types.time('12s'),
  transformFunction: stylex.types.transformFunction('scale(2)'),
  transformList: stylex.types.transformList('scale(2) rotate(90deg)'),
});

export const keyframes = stylex.keyframes({
  '0%': { opacity: 1 },
  '100%': { opacity: 0 },
});

export const positionTry = stylex.positionTry({
  positionAnchor: '--anchor',
  top: '0',
  left: '0',
  width: '100px',
  height: '100px',
});

export const viewTransitionClass = stylex.viewTransitionClass({
  new: {
    animationDuration: '1s',
  },
  old: {
    animationDuration: '2s',
  },
});

export const basic = stylex.create({
  foo: {
    width: '100%',
  },
});

export const dynamic = stylex.create({
  foo: () => ({
    width: '100%',
  }),
});

export const withVars = stylex.create({
  foo: {
    width: vars.bar,
  },
});

export const withTemplateLiteralVars = stylex.create({
  foo: {
    width: `${vars.bar}`,
  },
});

export const withTypedVars = stylex.create({
  foo: {
    width: vars.baz,
  },
});

export const withTemplateLiteralTypedVars = stylex.create({
  foo: {
    width: `${vars.baz}`,
  },
});

export const withConsts = stylex.create({
  foo: {
    width: consts.bar,
  },
});

export const withTemplateLiteralConsts = stylex.create({
  foo: {
    width: `${consts.bar}`,
  },
});

export const withTypedConsts = stylex.create({
  foo: {
    width: consts.baz,
  },
});

export const withTemplateLiteralTypedConsts = stylex.create({
  foo: {
    width: `${consts.baz}`,
  },
});

export const withKeyframes = stylex.create({
  foo: {
    animationName: keyframes,
  },
});

export const withPositionTry = stylex.create({
  foo: {
    positionTryFallbacks: positionTry,
  },
});

export const withFirstThatWorks = stylex.create({
  foo: {
    width: stylex.firstThatWorks('50%', '100%'),
  },
});

export const customMarker = stylex.defineMarker();
