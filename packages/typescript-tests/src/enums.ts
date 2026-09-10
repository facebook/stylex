/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as stylex from '@stylexjs/stylex';

export const density = stylex.defineEnum(['compact', 'comfortable'], {
  default: 'comfortable',
  '@media print': { '@supports (display: grid)': 'compact' },
});
stylex.props(density('compact'));
const padding = stylex.match(density, { compact: 8, comfortable: 16 });
stylex.create({ root: { padding } });
export const expanded = stylex.defineEnum([true, false], false);
stylex.props(expanded(true));
stylex.match(expanded, { true: 'block', false: 'none' });
// @ts-expect-error Unknown state.
density('other');
// @ts-expect-error Scalar-only overrides in the initial API.
density({ default: 'compact' });
// @ts-expect-error Missing case.
stylex.match(density, { compact: 8 });
// @ts-expect-error Extra case must not widen the enum.
stylex.match(density, { compact: 8, comfortable: 16, other: 24 });
// @ts-expect-error Initial state must not widen the state union.
stylex.defineEnum(['compact', 'comfortable'], 'other');
// @ts-expect-error Conditional initial values require a top-level default.
stylex.defineEnum(['compact', 'comfortable'], { '@media print': 'compact' });
