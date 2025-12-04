/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { NodePath } from '@babel/traverse';

import * as t from '@babel/types';
import StateManager from '../utils/state-manager';
import * as messages from '../shared/messages';
import { utils } from '../shared';
import { convertObjectToAST } from '../utils/js-to-ast';
import { isVariableNamedExported } from '../utils/ast-helpers';

/**
 * Transforms calls to `stylex.defineMarker()` (or imported `defineMarker()`)
 * into an object: { $$css: true, [hash]: hash } where `hash` is generated from
 * the file path and the export name.
 */
export default function transformStyleXDefineMarker(
  path: NodePath<t.CallExpression>,
  state: StateManager,
): void {
  const { node } = path;

  if (node.type !== 'CallExpression') {
    return;
  }

  const isDefineMarkerCall =
    (node.callee.type === 'Identifier' &&
      state.stylexDefineMarkerImport.has(node.callee.name)) ||
    (node.callee.type === 'MemberExpression' &&
      node.callee.object.type === 'Identifier' &&
      node.callee.property.type === 'Identifier' &&
      node.callee.property.name === 'defineMarker' &&
      state.stylexImport.has(node.callee.object.name));

  if (!isDefineMarkerCall) {
    return;
  }

  // Validate call shape and location: must be bound to an exported const
  validateStyleXDefineMarker(path);

  // We know the parent is a VariableDeclarator
  const variableDeclaratorPath = path.parentPath;
  if (!variableDeclaratorPath.isVariableDeclarator()) {
    return;
  }
  const variableDeclaratorNode = variableDeclaratorPath.node;
  if (variableDeclaratorNode.id.type !== 'Identifier') {
    return;
  }

  // No arguments allowed
  if (node.arguments.length !== 0) {
    throw path.buildCodeFrameError(
      messages.illegalArgumentLength('defineMarker', 0),
      SyntaxError,
    );
  }

  const fileName = state.fileNameForHashing;
  if (fileName == null) {
    throw new Error(messages.cannotGenerateHash('defineMarker'));
  }

  const exportName = variableDeclaratorNode.id.name;
  const exportId = utils.genFileBasedIdentifier({ fileName, exportName });
  const id = state.options.classNamePrefix + utils.hash(exportId);

  const markerObj = {
    [id]: id,
    $$css: true,
  };

  path.replaceWith(convertObjectToAST(markerObj));
}

function validateStyleXDefineMarker(path: NodePath<t.CallExpression>) {
  const variableDeclaratorPath: any = path.parentPath;

  if (
    variableDeclaratorPath == null ||
    variableDeclaratorPath.isExpressionStatement() ||
    !variableDeclaratorPath.isVariableDeclarator() ||
    variableDeclaratorPath.node.id.type !== 'Identifier'
  ) {
    throw path.buildCodeFrameError(
      messages.unboundCallValue('defineMarker'),
      SyntaxError,
    );
  }

  if (!isVariableNamedExported(variableDeclaratorPath)) {
    throw path.buildCodeFrameError(
      messages.nonExportNamedDeclaration('defineMarker'),
      SyntaxError,
    );
  }
}
