/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import * as t from '@babel/types';
import type { NodePath } from '@babel/traverse';
import { addDefault, addNamed } from '@babel/helper-module-imports';
import StateManager from '../utils/state-manager';
import {
  defineVars as stylexDefineVars,
  messages,
  utils,
  keyframes as stylexKeyframes,
  type InjectableStyle
} from '@stylexjs/shared';
import { convertObjectToAST } from '../utils/js-to-ast';
import { evaluate, type FunctionConfig } from '../utils/evaluate-path';
import * as pathUtils from '../babel-path-utils';

/// This function looks for `stylex.defineVars` calls and transforms them.
//. 1. It finds the first argument to `stylex.defineVars` and validates it.
/// 2. It envalues the style object to get a JS object. This also handles local constants automatically.
/// 4. It uses the `stylexDefineVars` from `@stylexjs/shared` to transform the JS
///    object and to get a list of injected styles.
/// 5. It converts the resulting Object back into an AST and replaces the call with it.
/// 6. It also inserts `stylex.inject` calls above the current statement as needed.
export default function transformStyleXDefineVars(
  callExpressionPath: NodePath<t.CallExpression>,
  state: StateManager,
) {
  const callExpressionNode = callExpressionPath.node;

  if (callExpressionNode.type !== 'CallExpression') {
    return;
  }

  if (
    (callExpressionNode.callee.type === 'Identifier' &&
      state.stylexDefineVarsImport.has(callExpressionNode.callee.name)) ||
    (callExpressionNode.callee.type === 'MemberExpression' &&
      callExpressionNode.callee.property.name === 'defineVars' &&
      callExpressionNode.callee.object.type === 'Identifier' &&
      callExpressionNode.callee.property.type === 'Identifier' &&
      state.stylexImport.has(callExpressionNode.callee.object.name))
  ) {
    validateStyleXDefineVars(callExpressionPath);

    // We know that parent is a variable declaration
    const variableDeclaratorPath = callExpressionPath.parentPath;
    if (!pathUtils.isVariableDeclarator(variableDeclaratorPath)) {
      return;
    }

    const variableDeclaratorNode = variableDeclaratorPath.node;

    if (variableDeclaratorNode.id.type !== 'Identifier') {
      return;
    }
    const varId: t.Identifier = variableDeclaratorNode.id;

    const args: $ReadOnlyArray<
      NodePath<
        | t.Expression
        | t.SpreadElement
        | t.JSXNamespacedName
        | t.ArgumentPlaceholder,
      >,
    > = callExpressionPath.get('arguments');
    const firstArg = args[0];
 
    const injectedKeyframes: { [animationName: string]: InjectableStyle } = {};

    // eslint-disable-next-line no-inner-declarations
    function keyframes<
      Obj: {
        +[key: string]: { +[k: string]: string | number },
      },
    >(animation: Obj): string {
      const [animationName, injectedStyle] = stylexKeyframes(
        animation,
        state.options,
      );
      injectedKeyframes[animationName] = injectedStyle;
      return animationName;
    }

    const identifiers: FunctionConfig['identifiers'] = {};
    const memberExpressions: FunctionConfig['memberExpressions'] = {};
    state.stylexKeyframesImport.forEach((name) => {
      identifiers[name] = { fn: keyframes }
    })
    state.stylexImport.forEach((name) => {
      if (memberExpressions[name] === undefined) {
        memberExpressions[name] = {}
      }

      memberExpressions[name].keyframes = { fn: keyframes }
    })

    const { confident, value } = evaluate(firstArg, state, {
      identifiers,
      memberExpressions,
    });
    if (!confident) {
      throw new Error(messages.NON_STATIC_VALUE);
    }
    if (typeof value !== 'object' || value == null) {
      throw new Error(messages.NON_OBJECT_FOR_STYLEX_CALL);
    }

    const fileName = state.fileNameForHashing;
    if (fileName == null) {
      throw new Error('No filename found for generating theme name.');
    }

    const exportName = varId.name;

    const [variablesObj, injectedStylesSansKeyframes] = stylexDefineVars(value, {
      ...state.options,
      themeName: utils.genFileBasedIdentifier({ fileName, exportName }),
    });

    const injectedStyles = {
      ...injectedKeyframes,
      ...injectedStylesSansKeyframes
    }

    // This should be a transformed variables object
    callExpressionPath.replaceWith(convertObjectToAST(variablesObj));
    const statementPath: ?NodePath<> =
      variableDeclaratorPath.parentPath.parentPath;

    if (Object.keys(injectedStyles).length === 0) {
      return;
    }

    if (state.runtimeInjection != null && statementPath != null) {
      let injectName: t.Identifier;
      if (state.injectImportInserted != null) {
        injectName = state.injectImportInserted;
      } else {
        const { from, as } = state.runtimeInjection;
        injectName =
          as != null
            ? addNamed(statementPath, as, from, { nameHint: 'inject' })
            : addDefault(statementPath, from, { nameHint: 'inject' });

        state.injectImportInserted = injectName;
      }

      for (const [_k, { ltr, priority }] of Object.entries(injectedStyles)) {
        statementPath.insertBefore(
          t.expressionStatement(
            t.callExpression(injectName, [
              t.stringLiteral(ltr),
              t.numericLiteral(priority),
            ]),
          ),
        );
      }
    }
    for (const [key, { priority, ltr }] of Object.entries(injectedStyles)) {
      state.addStyle([key, { ltr }, priority]);
    }
  }
}

// Validates the call of `stylex.defineVars`.
function validateStyleXDefineVars(
  callExpressionPath: NodePath<t.CallExpression>,
) {
  const variableDeclaratorPath: any = callExpressionPath.parentPath;
  const exportNamedDeclarationPath =
    variableDeclaratorPath.parentPath?.parentPath;

  if (
    variableDeclaratorPath == null ||
    variableDeclaratorPath.isExpressionStatement() ||
    !variableDeclaratorPath.isVariableDeclarator() ||
    variableDeclaratorPath.node.id.type !== 'Identifier'
  ) {
    throw new Error(messages.UNBOUND_STYLEX_CALL_VALUE);
  }

  if (
    exportNamedDeclarationPath == null ||
    !exportNamedDeclarationPath.isExportNamedDeclaration()
  ) {
    throw new Error(messages.NON_EXPORT_NAMED_DECLARATION);
  }

  if (callExpressionPath.node.arguments.length !== 1) {
    throw new Error(messages.ILLEGAL_ARGUMENT_LENGTH);
  }
}
