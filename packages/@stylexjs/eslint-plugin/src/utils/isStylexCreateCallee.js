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

export default function isStylexCreateCallee(
  node: Node,
  importTracker: ReturnType<createImportTracker>,
): boolean {
  return (
    (node.type === 'MemberExpression' &&
      node.object.type === 'Identifier' &&
      importTracker.isStylexDefaultImport(node.object.name) &&
      node.property.type === 'Identifier' &&
      node.property.name === 'create') ||
    (node.type === 'Identifier' &&
      importTracker.isStylexNamedImport('create', node.name))
  );
}
