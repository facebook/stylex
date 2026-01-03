/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

'use strict';

import type { Node } from 'estree';

import typeof createImportTracker from './createImportTracker';
import isStylexCreateCallee from './isStylexCreateCallee';

export default function isStylexCreateDeclaration(
  node: Node,
  importTracker: ReturnType<createImportTracker>,
): boolean {
  return (
    node != null &&
    node.type === 'CallExpression' &&
    isStylexCreateCallee(node.callee, importTracker) &&
    node.arguments.length === 1
  );
}
