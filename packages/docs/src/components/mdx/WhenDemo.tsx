/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as stylex from '@stylexjs/stylex';
import { cardMarker, btnMarker } from './markers.stylex';
import { vars } from '@/theming/vars.stylex';

export function Card() {
  return (
    <article {...stylex.props(styles.card, cardMarker)}>
      <p>Hovering here makes highlights the button</p>
      <button {...stylex.props(styles.cta, btnMarker)}>
        Hovering here animates the arrow to the right
        <span {...stylex.props(styles.icon)}>→</span>
      </button>
    </article>
  );
}

const styles = stylex.create({
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 16,
    marginBottom: '1rem',
    backgroundColor: vars['--color-fd-card'],
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 16,
  },
  cta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: 8,
    paddingInline: 16,
    color: {
      default: 'inherit',
      [stylex.when.ancestor(':hover', cardMarker)]:
        vars['--color-fd-background'],
    },
    appearance: 'none',
    backgroundColor: {
      default: vars['--color-fd-accent'],
      [stylex.when.ancestor(':hover', cardMarker)]: vars['--color-fd-primary'],
    },
    borderStyle: 'none',
    borderRadius: 4,
    transitionTimingFunction: 'ease-in-out',
    transitionDuration: '0.2s',
    transitionProperty: 'background-color',
  },
  icon: {
    marginInlineStart: 8,
    opacity: {
      default: 0.25,
      [stylex.when.ancestor(':hover', cardMarker)]: 1,
    },
    transform: {
      default: 'translateX(0)',
      [stylex.when.ancestor(':hover', btnMarker)]: 'translateX(8px)',
    },
    transitionTimingFunction: 'ease-in-out',
    transitionDuration: '0.2s',
    transitionProperty: 'opacity, transform',
  },
});
