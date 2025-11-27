/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { cardMarker, btnMarker } from './markers.stylex';

export function Card() {
  return (
    <article {...stylex.props(styles.card, cardMarker)}>
      <p>Hovering here makes the button pink and the arrow opaque</p>
      <button {...stylex.props(styles.cta, btnMarker)}>
        Hovering here moves the arrow to the right
        <span {...stylex.props(styles.icon)}>→</span>
      </button>
    </article>
  );
}

const styles = stylex.create({
  card: {
    borderWidth: 1,
    color: 'var(--ifm-font-color-base)',
    borderStyle: 'solid',
    borderColor: 'var(--ifm-link-color)',
    borderRadius: 16,
    padding: 16,
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  cta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    appearance: 'none',
    borderStyle: 'none',
    paddingInline: 16,
    paddingBlock: 8,
    borderRadius: 4,
    backgroundColor: {
      default: 'var(--ifm-navbar-background-color)',
      [stylex.when.ancestor(':hover', cardMarker)]: 'var(--ifm-link-color)',
    },
    color: 'white',
    transitionProperty: 'background-color',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease-in-out',
  },
  icon: {
    transitionProperty: 'opacity, transform',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease-in-out',
    marginInlineStart: 8,
    opacity: {
      default: 0.25,
      [stylex.when.ancestor(':hover', cardMarker)]: 1,
    },
    transform: {
      default: 'translateX(0)',
      [stylex.when.ancestor(':hover', btnMarker)]: 'translateX(8px)',
    },
  },
});
