/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

type Errors = $ReadOnly<{
  dirNotFound: Error,
  inputOutputMismatch: Error,
}>;

const errors: Errors = {
  dirNotFound: new Error('Invalid Directory: Not Found'),
  inputOutputMismatch: new Error(
    'Every input directory must have a corresponding output.',
  ),
};

export default errors;
