/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { keyframes, defineVars } from '@stylexjs/stylex';

const DARK = '@media (prefers-color-scheme: dark)';

const fadeIn = keyframes({
  to: { opacity: 1 },
});

const fadeInBloom = keyframes({
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

const fadeInBloomDark = keyframes({
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

const fadeOut = keyframes({
  to: { opacity: 0 },
});

const fadeOutBloom = keyframes({
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

const fadeOutBloomDark = keyframes({
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

const scaleUp = keyframes({
  to: { transform: 'scale(1.25)' },
});

const scaleDown = keyframes({
  to: { transform: 'scale(.75)' },
});

const slideOutUp = keyframes({
  to: { transform: 'translateY(-100%)' },
});

const slideOutDown = keyframes({
  to: { transform: 'translateY(-100%)' },
});

const slideOutRight = keyframes({
  to: { transform: 'translateX(100%)' },
});

const slideOutLeft = keyframes({
  to: { transform: 'translateX(-100%)' },
});

const slideInUp = keyframes({
  from: { transform: 'translateY(100%)' },
});

const slideInDown = keyframes({
  from: { transform: 'translateY(-100%)' },
});

const slideInRight = keyframes({
  from: { transform: 'translateX(-100%)' },
});

const slideInLeft = keyframes({
  from: { transform: 'translateX(100%)' },
});

const shakeX = keyframes({
  '0%, 100%': { transform: 'translateX(0%)' },
  '20%': { transform: 'translateX(-5%)' },
  '40%': { transform: 'translateX(5%)' },
  '60%': { transform: 'translateX(-5%)' },
  '80%': { transform: 'translateX(5%)' },
});

const shakeY = keyframes({
  '0%, 100%': { transform: 'translateY(0%)' },
  '20%': { transform: 'translateY(-5%)' },
  '40%': { transform: 'translateY(5%)' },
  '60%': { transform: 'translateY(-5%)' },
  '80%': { transform: 'translateY(5%)' },
});

const spin = keyframes({
  to: { transform: 'rotate(1turn)' },
});

const ping = keyframes({
  '90%, 100%': {
    transform: 'scale(2)',
    opacity: 0,
  },
});

const blink = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
});

const float = keyframes({
  '50%': { transform: 'translateY(-25%)' },
});

const bounce = keyframes({
  '25%': { transform: 'translateY(-20%)' },
  '40%': { transform: 'translateY(-3%)' },
  '0%, 60%, 100%': { transform: 'translateY(0)' },
});

const pulse = keyframes({
  '50%': { transform: 'scale(.9,.9)' },
});

export const animationNames = defineVars({
  fadeIn,
  fadeInBloom: {
    default: fadeInBloom,
    [DARK]: fadeInBloomDark,
  },
  fadeOut,
  fadeOutBloom: {
    default: fadeOutBloom,
    [DARK]: fadeOutBloomDark,
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
