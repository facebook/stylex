/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use client';

import * as stylex from '@stylexjs/stylex';
import { spacing, text, globalTokens as $ } from './globalTokens.stylex';
import { colors } from '../../../../packages/open-props/lib/colors.stylex';
import { useState } from 'react';
import '../stylex_bundle.css';
export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div
      {...{
        className:
          'x78zum5 x6s0dn4 xl56j7k x1q0g3np x1y9o70y xmkeg23 x1y0btm7 xd1nvyh xgnk7ji xvcvwp6 xqdd6sc',
      }}
    >
      <button
        {...{
          className:
            'x78zum5 x6s0dn4 xl56j7k x17frcva x1plog1 x1tcxl6e xiy85n xktz6yv x1umsj2k xbznm0z xc342km xng3xce x1twfsck x1oo1pgz x1e1a5qx x1ypdohk x1g7rwp6 x1u4xmye xglsxx3',
        }}
        onClick={() => setCount((c) => c - 1)}
      >
        -
      </button>
      <div
        {...stylex.props(
          styles.count,
          Math.abs(count) > 99 && styles.largeNumber,
        )}
      >
        {count}
      </div>
      <button
        {...{
          className:
            'x78zum5 x6s0dn4 xl56j7k x17frcva x1plog1 x1tcxl6e xiy85n xktz6yv x1umsj2k xbznm0z xc342km xng3xce x1twfsck x1oo1pgz x1e1a5qx x1ypdohk x1g7rwp6 x1u4xmye xglsxx3',
        }}
        onClick={() => setCount((c) => c + 1)}
      >
        +
      </button>
    </div>
  );
}
const DARK = '@media (prefers-color-scheme: dark)';
const styles = {
  count: {
    fontSize: 'x1g7rwp6',
    fontWeight: 'x3stwaq',
    color: 'xxhslpl',
    minWidth: 'x1843ork',
    textAlign: 'x2b8uid',
    fontFamily: 'xtpfoyb',
    $$css: true,
  },
  largeNumber: {
    fontSize: 'x13rggl4',
    $$css: true,
  },
};
