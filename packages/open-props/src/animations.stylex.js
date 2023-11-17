/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { create } from '@stylexjs/stylex';
import { animationNames } from './animationNames.stylex';
import { easings } from './easings.stylex';
import type {
  MapNamespaces,
  StyleXVar,
} from '@stylexjs/stylex/lib/StyleXTypes';

type Style = $ReadOnly<{
  animationName: string | StyleXVar<string>,
  animationDuration: string,
  animationTimingFunction: string | StyleXVar<string>,
  animationIterationCount?: string,
}>;

type TAnimations = MapNamespaces<
  $ReadOnly<{
    fadeIn: Style,
    fadeInBloom: Style,
    fadeOut: Style,
    fadeOutBloom: Style,
    scaleUp: Style,
    scaleDown: Style,
    slideOutUp: Style,
    slideOutDown: Style,
    slideOutRight: Style,
    slideOutLeft: Style,
    slideInUp: Style,
    slideInDown: Style,
    slideInRight: Style,
    slideInLeft: Style,
    shakeX: Style,
    shakeY: Style,
    spin: Style,
    ping: Style,
    blink: Style,
    float: Style,
    bounce: Style,
    pulse: Style,
  }>,
>;

export const animations: TAnimations = create({
  fadeIn: {
    animationName: animationNames.fadeIn,
    animationDuration: '.5s',
    animationTimingFunction: easings.ease3,
  },
  fadeInBloom: {
    animationName: animationNames.fadeInBloom,
    animationDuration: '2s',
    animationTimingFunction: easings.ease3,
  },
  fadeOut: {
    animationName: animationNames.fadeOut,
    animationDuration: '.5s',
    animationTimingFunction: easings.ease3,
  },
  fadeOutBloom: {
    animationName: animationNames.fadeOutBloom,
    animationDuration: '2s',
    animationTimingFunction: easings.ease3,
  },
  scaleUp: {
    animationName: animationNames.scaleUp,
    animationDuration: '.5s',
    animationTimingFunction: easings.ease3,
  },
  scaleDown: {
    animationName: animationNames.scaleDown,
    animationDuration: '.5s',
    animationTimingFunction: easings.ease3,
  },
  slideOutUp: {
    animationName: animationNames.slideOutUp,
    animationDuration: '.5s',
    animationTimingFunction: easings.ease3,
  },
  slideOutDown: {
    animationName: animationNames.slideOutDown,
    animationDuration: '.5s',
    animationTimingFunction: easings.ease3,
  },
  slideOutRight: {
    animationName: animationNames.slideOutRight,
    animationDuration: '.5s',
    animationTimingFunction: easings.ease3,
  },
  slideOutLeft: {
    animationName: animationNames.slideOutLeft,
    animationDuration: '.5s',
    animationTimingFunction: easings.ease3,
  },
  slideInUp: {
    animationName: animationNames.slideInUp,
    animationDuration: '.5s',
    animationTimingFunction: easings.ease3,
  },
  slideInDown: {
    animationName: animationNames.slideInDown,
    animationDuration: '.5s',
    animationTimingFunction: easings.ease3,
  },
  slideInRight: {
    animationName: animationNames.slideInRight,
    animationDuration: '.5s',
    animationTimingFunction: easings.ease3,
  },
  slideInLeft: {
    animationName: animationNames.slideInLeft,
    animationDuration: '.5s',
    animationTimingFunction: easings.ease3,
  },
  shakeX: {
    animationName: animationNames.shakeX,
    animationDuration: '.75s',
    animationTimingFunction: easings.out5,
  },
  shakeY: {
    animationName: animationNames.shakeY,
    animationDuration: '.75s',
    animationTimingFunction: easings.out5,
  },
  spin: {
    animationName: animationNames.spin,
    animationDuration: '2s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  ping: {
    animationName: animationNames.ping,
    animationDuration: '5s',
    animationTimingFunction: easings.out3,
    animationIterationCount: 'infinite',
  },
  blink: {
    animationName: animationNames.blink,
    animationDuration: '1s',
    animationTimingFunction: easings.out3,
    animationIterationCount: 'infinite',
  },
  float: {
    animationName: animationNames.float,
    animationDuration: '3s',
    animationTimingFunction: easings.inOut3,
    animationIterationCount: 'infinite',
  },
  bounce: {
    animationName: animationNames.bounce,
    animationDuration: '2s',
    animationTimingFunction: easings.elasticInOut2,
    animationIterationCount: 'infinite',
  },
  pulse: {
    animationName: animationNames.pulse,
    animationDuration: '2s',
    animationTimingFunction: easings.out3,
    animationIterationCount: 'infinite',
  },
});
