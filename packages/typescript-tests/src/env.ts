/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as stylex from '@stylexjs/stylex';

declare module '@stylexjs/stylex/lib/types/StyleXTypes' {
  // eslint-disable-next-line no-unused-vars
  interface Register {
    env: {
      utilities: {
        // eslint-disable-next-line no-unused-vars
        opacity: (color: string, value: number) => string;
      };
      tokens: {
        colors: {
          primary: string;
        };
      };
    };
  }
}

stylex.env.utilities.opacity('#f00', 0.15) satisfies string;
// @ts-expect-error
stylex.env.utilities.opacity({}, 0.15);

stylex.env.tokens.colors.primary satisfies string;
// @ts-expect-error
stylex.env.tokens.colors.secondary;
