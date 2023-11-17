/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { VarGroup } from '@stylexjs/stylex/lib/StyleXTypes';

import { defineVars } from '@stylexjs/stylex';

const elasticOut1 = 'cubic-bezier(.5, .75, .75, 1.25)';
const elasticOut2 = 'cubic-bezier(.5, 1, .75, 1.25)';
const elasticOut3 = 'cubic-bezier(.5, 1.25, .75, 1.25)';
const elasticOut4 = 'cubic-bezier(.5, 1.5, .75, 1.25)';
const elasticOut5 = 'cubic-bezier(.5, 1.75, .75, 1.25)';

const elasticInOut1 = 'cubic-bezier(.5, -.1, .1, 1.5)';
const elasticInOut2 = 'cubic-bezier(.5, -.3, .1, 1.5)';
const elasticInOut3 = 'cubic-bezier(.5, -.5, .1, 1.5)';
const elasticInOut4 = 'cubic-bezier(.5, -.7, .1, 1.5)';
const elasticInOut5 = 'cubic-bezier(.5, -.9, .1, 1.5)';

type TEasings = $ReadOnly<{
  ease1: string,
  ease2: string,
  ease3: string,
  ease4: string,
  ease5: string,

  in1: string,
  in2: string,
  in3: string,
  in4: string,
  in5: string,

  out1: string,
  out2: string,
  out3: string,
  out4: string,
  out5: string,

  inOut1: string,
  inOut2: string,
  inOut3: string,
  inOut4: string,
  inOut5: string,

  elasticOut1: string,
  elasticOut2: string,
  elasticOut3: string,
  elasticOut4: string,
  elasticOut5: string,

  elasticIn1: string,
  elasticIn2: string,
  elasticIn3: string,
  elasticIn4: string,
  elasticIn5: string,

  elasticInOut1: string,
  elasticInOut2: string,
  elasticInOut3: string,
  elasticInOut4: string,
  elasticInOut5: string,

  step1: string,
  step2: string,
  step3: string,
  step4: string,
  step5: string,

  spring1: string,
  spring2: string,
  spring3: string,
  spring4: string,
  spring5: string,

  bounce1: string,
  bounce2: string,
  bounce3: string,
  bounce4: string,
  bounce5: string,
}>;

export const easings: VarGroup<TEasings> = defineVars({
  ease1: 'cubic-bezier(.25, 0, .5, 1)',
  ease2: 'cubic-bezier(.25, 0, .4, 1)',
  ease3: 'cubic-bezier(.25, 0, .3, 1)',
  ease4: 'cubic-bezier(.25, 0, .2, 1)',
  ease5: 'cubic-bezier(.25, 0, .1, 1)',

  in1: 'cubic-bezier(.25, 0, 1, 1)',
  in2: 'cubic-bezier(.50, 0, 1, 1)',
  in3: 'cubic-bezier(.70, 0, 1, 1)',
  in4: 'cubic-bezier(.90, 0, 1, 1)',
  in5: 'cubic-bezier(1, 0, 1, 1)',

  out1: 'cubic-bezier(0, 0, .75, 1)',
  out2: 'cubic-bezier(0, 0, .50, 1)',
  out3: 'cubic-bezier(0, 0, .3, 1)',
  out4: 'cubic-bezier(0, 0, .1, 1)',
  out5: 'cubic-bezier(0, 0, 0, 1)',

  inOut1: 'cubic-bezier(.1, 0, .9, 1)',
  inOut2: 'cubic-bezier(.3, 0, .7, 1)',
  inOut3: 'cubic-bezier(.5, 0, .5, 1)',
  inOut4: 'cubic-bezier(.7, 0, .3, 1)',
  inOut5: 'cubic-bezier(.9, 0, .1, 1)',

  elasticOut1: elasticOut1,
  elasticOut2: elasticOut2,
  elasticOut3: elasticOut3,
  elasticOut4: elasticOut4,
  elasticOut5: elasticOut5,

  elasticIn1: 'cubic-bezier(.5, -0.25, .75, 1)',
  elasticIn2: 'cubic-bezier(.5, -0.50, .75, 1)',
  elasticIn3: 'cubic-bezier(.5, -0.75, .75, 1)',
  elasticIn4: 'cubic-bezier(.5, -1.00, .75, 1)',
  elasticIn5: 'cubic-bezier(.5, -1.25, .75, 1)',

  elasticInOut1: elasticInOut1,
  elasticInOut2: elasticInOut2,
  elasticInOut3: elasticInOut3,
  elasticInOut4: elasticInOut4,
  elasticInOut5: elasticInOut5,

  step1: 'steps(2)',
  step2: 'steps(3)',
  step3: 'steps(4)',
  step4: 'steps(7)',
  step5: 'steps(10)',

  spring1: `linear(
      0, 0.006, 0.025 2.8%, 0.101 6.1%, 0.539 18.9%, 0.721 25.3%, 0.849 31.5%,
      0.937 38.1%, 0.968 41.8%, 0.991 45.7%, 1.006 50.1%, 1.015 55%, 1.017 63.9%,
      1.001
    )`,
  spring2: `linear(
      0, 0.007, 0.029 2.2%, 0.118 4.7%, 0.625 14.4%, 0.826 19%, 0.902, 0.962,
      1.008 26.1%, 1.041 28.7%, 1.064 32.1%, 1.07 36%, 1.061 40.5%, 1.015 53.4%,
      0.999 61.6%, 0.995 71.2%, 1
    )`,
  spring3: `linear(
      0, 0.009, 0.035 2.1%, 0.141 4.4%, 0.723 12.9%, 0.938 16.7%, 1.017, 1.077,
      1.121, 1.149 24.3%, 1.159, 1.163, 1.161, 1.154 29.9%, 1.129 32.8%,
      1.051 39.6%, 1.017 43.1%, 0.991, 0.977 51%, 0.974 53.8%, 0.975 57.1%,
      0.997 69.8%, 1.003 76.9%, 1
    )`,
  spring4: `linear(
      0, 0.009, 0.037 1.7%, 0.153 3.6%, 0.776 10.3%, 1.001, 1.142 16%, 1.185,
      1.209 19%, 1.215 19.9% 20.8%, 1.199, 1.165 25%, 1.056 30.3%, 1.008 33%, 0.973,
      0.955 39.2%, 0.953 41.1%, 0.957 43.3%, 0.998 53.3%, 1.009 59.1% 63.7%,
      0.998 78.9%, 1
    )`,
  spring5: `linear(
      0, 0.01, 0.04 1.6%, 0.161 3.3%, 0.816 9.4%, 1.046, 1.189 14.4%, 1.231,
      1.254 17%, 1.259, 1.257 18.6%, 1.236, 1.194 22.3%, 1.057 27%, 0.999 29.4%,
      0.955 32.1%, 0.942, 0.935 34.9%, 0.933, 0.939 38.4%, 1 47.3%, 1.011,
      1.017 52.6%, 1.016 56.4%, 1 65.2%, 0.996 70.2%, 1.001 87.2%, 1
    )`,

  bounce1: `linear(
      0, 0.004, 0.016, 0.035, 0.063, 0.098, 0.141, 0.191, 0.25, 0.316, 0.391 36.8%,
      0.563, 0.766, 1 58.8%, 0.946, 0.908 69.1%, 0.895, 0.885, 0.879, 0.878, 0.879,
      0.885, 0.895, 0.908 89.7%, 0.946, 1
    )`,
  bounce2: `linear(
      0, 0.004, 0.016, 0.035, 0.063, 0.098, 0.141 15.1%, 0.25, 0.391, 0.562, 0.765,
      1, 0.892 45.2%, 0.849, 0.815, 0.788, 0.769, 0.757, 0.753, 0.757, 0.769, 0.788,
      0.815, 0.85, 0.892 75.2%, 1 80.2%, 0.973, 0.954, 0.943, 0.939, 0.943, 0.954,
      0.973, 1
    )`,
  bounce3: `linear(
      0, 0.004, 0.016, 0.035, 0.062, 0.098, 0.141 11.4%, 0.25, 0.39, 0.562, 0.764,
      1 30.3%, 0.847 34.8%, 0.787, 0.737, 0.699, 0.672, 0.655, 0.65, 0.656, 0.672,
      0.699, 0.738, 0.787, 0.847 61.7%, 1 66.2%, 0.946, 0.908, 0.885 74.2%, 0.879,
      0.878, 0.879, 0.885 79.5%, 0.908, 0.946, 1 87.4%, 0.981, 0.968, 0.96, 0.957,
      0.96, 0.968, 0.981, 1
    )`,
  bounce4: `linear(
      0, 0.004, 0.016 3%, 0.062, 0.141, 0.25, 0.391, 0.562 18.2%, 1 24.3%, 0.81,
      0.676 32.3%, 0.629, 0.595, 0.575, 0.568, 0.575, 0.595, 0.629, 0.676 48.2%,
      0.811, 1 56.2%, 0.918, 0.86, 0.825, 0.814, 0.825, 0.86, 0.918, 1 77.2%,
      0.94 80.6%, 0.925, 0.92, 0.925, 0.94 87.5%, 1 90.9%, 0.974, 0.965, 0.974, 1
    )`,
  bounce5: `linear(
      0, 0.004, 0.016 2.5%, 0.063, 0.141, 0.25 10.1%, 0.562, 1 20.2%, 0.783, 0.627,
      0.534 30.9%, 0.511, 0.503, 0.511, 0.534 38%, 0.627, 0.782, 1 48.7%, 0.892,
      0.815, 0.769 56.3%, 0.757, 0.753, 0.757, 0.769 61.3%, 0.815, 0.892, 1 68.8%,
      0.908 72.4%, 0.885, 0.878, 0.885, 0.908 79.4%, 1 83%, 0.954 85.5%, 0.943,
      0.939, 0.943, 0.954 90.5%, 1 93%, 0.977, 0.97, 0.977, 1
    )`,
});
