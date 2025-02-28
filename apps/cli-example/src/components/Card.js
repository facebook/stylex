/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import * as stylex from '@stylexjs/stylex';
import { globalTokens as $, spacing, text } from '../app/globalTokens.stylex';
import { colors } from '../../../../packages/open-props/lib/colors.stylex';
import { tokens } from '../app/CardTokens.stylex';
import '../stylex_bundle.css';
export default function Card({ title, body, href }) {
  return (
    <a
      {...{
        className:
          'x78zum5 x1ymzxv2 x6s0dn4 x1nhvcw1 xdt5ytf x1twfsck x3lg9hb xbff1b3 xmkeg23 x1y0btm7 xvmr4ei xzuwo8y x1heor9g xvcvwp6 x1upiq7d xts7igz xofcydl x2b8uid x1hl2dhg xduv7uo xrxp3nu',
      }}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <h2
        {...{
          className: 'xko2ofl xksefwp x1s688f x1awaucy x1pqs7lx',
        }}
      >
        {title}{' '}
        <span
          {...{
            className: 'x1rg5ohu x11xpdln x1t2g4pk x13dflua x12w9bfk',
          }}
        >
          →
        </span>
      </h2>
      <p
        {...{
          className: 'x1ghz6dp x197sbye xjmy7uj x1w2vvpw x1evy7pa x1u8bs6r',
        }}
      >
        {body}
      </p>
    </a>
  );
}
const MOBILE = '@media (max-width: 700px)';
const REDUCE_MOTION = '@media (prefers-reduced-motion: reduce)';
const bgDefault = `rgba(${$.cardR}, ${$.cardG}, ${$.cardB}, 0)`;
