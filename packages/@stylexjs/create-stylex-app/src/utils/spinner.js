/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const ora = require('ora').default || require('ora');
const ansis = require('ansis');

const primary = '#5B45DE';

class StylexSpinner {
  constructor() {
    this.spinner = null;
  }

  start(text) {
    this.spinner = ora({
      text: ansis.hex(primary)(`[stylex] ${text}`),
      color: 'magenta',
      spinner: 'dots',
    }).start();
    return this;
  }

  succeed(text) {
    if (this.spinner) {
      this.spinner.succeed(
        ansis.hex(primary)(`[stylex] ${text || this.spinner.text}`),
      );
      this.spinner = null;
    }
  }

  fail(text) {
    if (this.spinner) {
      this.spinner.fail(ansis.red(`[stylex] ${text || this.spinner.text}`));
      this.spinner = null;
    }
  }

  update(text) {
    if (this.spinner) {
      this.spinner.text = ansis.hex(primary)(`[stylex] ${text}`);
    }
  }
}

module.exports = { StylexSpinner };
