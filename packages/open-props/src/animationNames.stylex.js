/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { VarGroup } from '@stylexjs/stylex/lib/StyleXTypes';

import { keyframes, defineVars } from '@stylexjs/stylex';

const fadeIn: string = keyframes({
  to: { opacity: 1 },
});

const fadeInBloom: string = keyframes({
  '0%': {
    opacity: 0,
    filter: 'brightness(1) blur(20px)',
  },
  '10%': {
    opacity: 1,
    filter: 'brightness(2) blur(10px)',
  },
  '100%': {
    opacity: 1,
    filter: 'brightness(1) blur(0)',
  },
});

const fadeInBloomDark: string = keyframes({
  '0%': {
    opacity: 0,
    filter: 'brightness(1) blur(20px)',
  },
  '10%': {
    opacity: 1,
    filter: 'brightness(0.5) blur(10px)',
  },
  '100%': {
    opacity: 1,
    filter: 'brightness(1) blur(0)',
  },
});

const fadeOut: string = keyframes({
  to: { opacity: 0 },
});

const fadeOutBloom: string = keyframes({
  '100%': {
    opacity: 0,
    filter: 'brightness(1) blur(20px)',
  },
  '10%': {
    opacity: 1,
    filter: 'brightness(2) blur(10px)',
  },
  '0%': {
    opacity: 1,
    filter: 'brightness(1) blur(0)',
  },
});

const fadeOutBloomDark: string = keyframes({
  '100%': {
    opacity: 0,
    filter: 'brightness(1) blur(20px)',
  },
  '10%': {
    opacity: 1,
    filter: 'brightness(0.5) blur(10px)',
  },
  '0%': {
    opacity: 1,
    filter: 'brightness(1) blur(0)',
  },
});

const scaleUp: string = keyframes({
  to: { transform: 'scale(1.25)' },
});

const scaleDown: string = keyframes({
  to: { transform: 'scale(.75)' },
});

const slideOutUp: string = keyframes({
  to: { transform: 'translateY(-100%)' },
});

const slideOutDown: string = keyframes({
  to: { transform: 'translateY(-100%)' },
});

const slideOutRight: string = keyframes({
  to: { transform: 'translateX(100%)' },
});

const slideOutLeft: string = keyframes({
  to: { transform: 'translateX(-100%)' },
});

const slideInUp: string = keyframes({
  from: { transform: 'translateY(100%)' },
});

const slideInDown: string = keyframes({
  from: { transform: 'translateY(-100%)' },
});

const slideInRight: string = keyframes({
  from: { transform: 'translateX(-100%)' },
});

const slideInLeft: string = keyframes({
  from: { transform: 'translateX(100%)' },
});

const shakeX: string = keyframes({
  '0%, 100%': { transform: 'translateX(0%)' },
  '20%': { transform: 'translateX(-5%)' },
  '40%': { transform: 'translateX(5%)' },
  '60%': { transform: 'translateX(-5%)' },
  '80%': { transform: 'translateX(5%)' },
});

const shakeY: string = keyframes({
  '0%, 100%': { transform: 'translateY(0%)' },
  '20%': { transform: 'translateY(-5%)' },
  '40%': { transform: 'translateY(5%)' },
  '60%': { transform: 'translateY(-5%)' },
  '80%': { transform: 'translateY(5%)' },
});

const spin: string = keyframes({
  to: { transform: 'rotate(1turn)' },
});

const ping: string = keyframes({
  '90%, 100%': {
    transform: 'scale(2)',
    opacity: 0,
  },
});

const blink: string = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
});

const float: string = keyframes({
  '50%': { transform: 'translateY(-25%)' },
});

const bounce: string = keyframes({
  '25%': { transform: 'translateY(-20%)' },
  '40%': { transform: 'translateY(-3%)' },
  '0%, 60%, 100%': { transform: 'translateY(0)' },
});

const pulse: string = keyframes({
  '50%': { transform: 'scale(.9,.9)' },
});

type TAnimationNames = $ReadOnly<{
  fadeIn: string,
  fadeInBloom: string,
  fadeOut: string,
  fadeOutBloom: string,
  scaleUp: string,
  scaleDown: string,
  slideOutUp: string,
  slideOutDown: string,
  slideOutRight: string,
  slideOutLeft: string,
  slideInUp: string,
  slideInDown: string,
  slideInRight: string,
  slideInLeft: string,
  shakeX: string,
  shakeY: string,
  spin: string,
  ping: string,
  blink: string,
  float: string,
  bounce: string,
  pulse: string,
}>;

export const animationNames: VarGroup<TAnimationNames> = defineVars({
  fadeIn,
  fadeInBloom: {
    default: fadeInBloom,
    '@media (prefers-color-scheme: dark)': fadeInBloomDark,
  },
  fadeOut,
  fadeOutBloom: {
    default: fadeOutBloom,
    '@media (prefers-color-scheme: dark)': fadeOutBloomDark,
  },
  scaleUp,
  scaleDown,
  slideOutUp,
  slideOutDown,
  slideOutRight,
  slideOutLeft,
  slideInUp,
  slideInDown,
  slideInRight,
  slideInLeft,
  shakeX,
  shakeY,
  spin,
  ping,
  blink,
  float,
  bounce,
  pulse,
});
