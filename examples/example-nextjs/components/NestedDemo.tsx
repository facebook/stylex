/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Demo component that consumes nested tokens.
 * Same-file styles come from NestedTokensDemo.stylex.ts;
 * cross-file consumption is demonstrated by CrossFileNestedDemo.tsx.
 */

import * as stylex from '@stylexjs/stylex';
import { styles, warmTheme } from './NestedTokensDemo.stylex';
import CrossFileNestedDemo from './CrossFileNestedDemo';

type Props = Readonly<{
  useWarmTheme?: boolean;
}>;

export default function NestedDemo({ useWarmTheme = false }: Props) {
  return (
    <div {...stylex.props(styles.container, useWarmTheme ? warmTheme : null)}>
      <h2 {...stylex.props(styles.heading)}>Nested Tokens Demo</h2>
      <p {...stylex.props(styles.description)}>
        These badges use{' '}
        <code {...stylex.props(styles.code)}>unstable_defineVarsNested</code>{' '}
        for themeable colors,{' '}
        <code {...stylex.props(styles.code)}>unstable_defineConstsNested</code>{' '}
        for compile-time sizing, and{' '}
        <code {...stylex.props(styles.code)}>unstable_createThemeNested</code>{' '}
        for the warm theme override.
      </p>
      <div {...stylex.props(styles.badgeRow)}>
        <span {...stylex.props(styles.badgeBase, styles.badgeInfo)}>Info</span>
        <span {...stylex.props(styles.badgeBase, styles.badgeSuccess)}>
          Success
        </span>
        <span {...stylex.props(styles.badgeBase, styles.badgeWarning)}>
          Warning
        </span>
      </div>
      <div {...stylex.props(styles.card)}>
        <p {...stylex.props(styles.cardText)}>
          This card uses{' '}
          <code {...stylex.props(styles.code)}>nestedTokens.surface.*</code> for
          background, shadow, and hover — all defined as nested objects.
        </p>
        <p {...stylex.props(styles.cardText, styles.sourceHint)}>
          Source:{' '}
          <code {...stylex.props(styles.code)}>
            components/NestedTokensDemo.stylex.ts
          </code>
        </p>
      </div>
      <CrossFileNestedDemo />
    </div>
  );
}
