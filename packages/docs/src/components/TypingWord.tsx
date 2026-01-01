/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import { vars } from '@/theming/vars.stylex';
import * as stylex from '@stylexjs/stylex';

const WORDS = [
  'expressive',
  'type-safe',
  'composable',
  'predictable',
  'themeable',
];

export default function TypingWord() {
  return (
    <span {...stylex.props(styles.container)}>
      {WORDS.map((word, index) => (
        <span key={index} {...stylex.props(styles.word)}>
          {word}
        </span>
      ))}
    </span>
  );
}

const typingAnim = stylex.keyframes({
  '37%': {
    gridTemplateColumns: '1fr',
    borderInlineEndColor: 'transparent',
  },
  '40%': {
    gridTemplateColumns: '1fr',
    borderInlineEndColor: vars['--color-fd-accent-foreground'],
  },
  '49%': {
    gridTemplateColumns: '0fr',
    borderInlineEndColor: vars['--color-fd-accent-foreground'],
  },
  '51%': {
    gridTemplateColumns: '0fr',
    borderInlineEndColor: vars['--color-fd-accent-foreground'],
  },
  '60%': {
    gridTemplateColumns: '1fr',
    borderInlineEndColor: vars['--color-fd-accent-foreground'],
  },
  '63%': {
    gridTemplateColumns: '1fr',
    borderInlineEndColor: 'transparent',
  },
});

const hidden = stylex.keyframes({
  '0%': { display: 'inline' },
  '20%': { display: 'inline' },
  '20.001%': { display: 'none' },
  '100%': { display: 'none' },
});

const TIME = 8;
const styles = stylex.create({
  container: {
    display: 'inline-grid',
    color: vars['--color-fd-primary'],
    fontWeight: 600,
    gridTemplateColumns: '1fr',
    animationName: typingAnim,
    animationDuration: TIME + 's',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-out',
    animationDelay: TIME / 2 + 's',
    overflow: 'hidden',
    borderInlineEndWidth: 1,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'transparent',
  },
  word: {
    gridArea: '1 / 1',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    animationName: hidden,
    animationDuration: TIME * 5 + 's',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'steps(5)',
    animationDelay: Object.fromEntries(
      [0, 1, 2, 3, 4].map((i) => [
        `:nth-child(${i + 1})`,
        TIME * (i - 5) + 's',
      ]),
    ),
  },
});
