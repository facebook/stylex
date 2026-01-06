/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const ansis = require('ansis');

const primary = '#5B45DE';
const secondary = '#D573DD';

const logger = {
  info: (msg) => console.log(ansis.hex(primary)('[stylex]'), msg),
  success: (msg) =>
    console.log(ansis.green('✓'), ansis.hex(primary)('[stylex]'), msg),
  error: (msg) =>
    console.error(
      ansis.red('✗'),
      ansis.hex(primary)('[stylex]'),
      ansis.red(msg),
    ),
  warn: (msg) =>
    console.warn(
      ansis.yellow('⚠'),
      ansis.hex(primary)('[stylex]'),
      ansis.yellow(msg),
    ),
  step: (current, total, msg) => {
    const stepIndicator = ansis.hex(secondary).bold(`[${current}/${total}]`);
    console.log(stepIndicator, ansis.hex(primary)('[stylex]'), msg);
  },

  // Formatters
  code: (text) => ansis.hex(secondary).bold(text),
  path: (text) => ansis.cyan(text),
  command: (text) => ansis.hex(secondary).bold(`$ ${text}`),
};

module.exports = { logger };
