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
import { evaluate } from '../utils/evaluate-path';
import { convertObjectToAST } from '../utils/js-to-ast';
import { isVariableNamedExported } from '../utils/ast-helpers';
import { utils } from '../shared';
import {
  defineEnum,
  enumRef,
  getEnumRef,
  compileEnumAssignment,
} from '../shared/stylex-enum';

export default function transformStyleXEnum(
  path: NodePath<t.CallExpression>,
  state: StateManager,
): void {
  const callee = path.get('callee');
  const isDefinition =
    (callee.isIdentifier() &&
      state.stylexDefineEnumImport.has(callee.node.name)) ||
    (callee.isMemberExpression() &&
      t.isIdentifier(callee.node.object) &&
      state.stylexImport.has(callee.node.object.name) &&
      t.isIdentifier(callee.node.property, { name: 'defineEnum' }));

  if (isDefinition) {
    const declaration = path.parentPath;
    if (
      !declaration.isVariableDeclarator() ||
      !t.isIdentifier(declaration.node.id) ||
      !isVariableNamedExported(declaration)
    ) {
      throw path.buildCodeFrameError<Error>(
        'defineEnum must initialize a named exported variable.',
      );
    }
    if (path.node.arguments.length !== 2) {
      throw path.buildCodeFrameError<Error>(
        'defineEnum requires states and an initial value.',
      );
    }
    const identifier = declaration.node.id;
    if (identifier.type !== 'Identifier') return;
    const [statesPath, initialPath] = path.get('arguments');
    const states = evaluate(statesPath, state);
    const initial = evaluate(initialPath, state);
    if (!states.confident || !initial.confident) {
      throw path.buildCodeFrameError<Error>(
        'defineEnum arguments must be statically evaluable.',
      );
    }
    const fileName = state.fileNameForHashing;
    if (fileName == null)
      throw path.buildCodeFrameError<Error>(
        'Cannot determine enum module identity.',
      );
    const id =
      state.options.classNamePrefix +
      utils.hash(
        utils.genFileBasedIdentifier({
          fileName,
          exportName: identifier.name,
        }),
      );
    const [variables, css] = defineEnum(states.value, initial.value, id);
    state.enumDefinitions.set(identifier, enumRef(id, states.value));
    path.replaceWith(convertObjectToAST(variables));
    state.registerStyles(
      Object.entries(css).map(([key, { priority, ...rule }]) => [
        key,
        rule,
        priority,
      ]),
      declaration,
    );
    return;
  }

  if (!callee.isIdentifier()) return;
  const binding = callee.scope.getBinding(callee.node.name);
  if (
    binding == null ||
    (!binding.path.isImportSpecifier() &&
      !state.enumDefinitions.has(binding.identifier))
  )
    return;
  const reference = evaluate(callee, state);
  const ref = reference.confident ? getEnumRef(reference.value) : null;
  if (ref == null) return;
  if (path.node.arguments.length !== 1)
    throw path.buildCodeFrameError<Error>('An enum call requires one state.');
  const value = evaluate(path.get('arguments')[0], state);
  if (!value.confident)
    throw path.buildCodeFrameError<Error>(
      'Enum assignments must be statically evaluable.',
    );
  const [assignment, css] = compileEnumAssignment(
    ref,
    value.value,
    state.options,
  );
  state.registerStyles(
    Object.entries(css).map(([key, { priority, ...rule }]) => [
      key,
      rule,
      priority,
    ]),
    path,
  );
  path.replaceWith(convertObjectToAST(assignment));
}
