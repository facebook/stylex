/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

/* eslint-disable no-unused-vars */
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import StateManager from '../../utils/state-manager';
import { evaluate, type FunctionConfig } from '../../utils/evaluate-path';
import * as pathUtils from '../../babel-path-utils';
import { create, IncludedStyles, utils } from '@stylexjs/shared';
import { messages } from '@stylexjs/shared';
import {
  timeUnits,
  lengthUnits,
  getNumberSuffix,
} from '@stylexjs/shared/lib/transform-value';

// This
export function evaluateStyleXCreateArg(
  path: NodePath<>,
  traversalState: StateManager,
  functions: FunctionConfig = { identifiers: {}, memberExpressions: {} },
): $ReadOnly<{
  confident: boolean,
  value: any,
  deopt?: null | NodePath<>,
  fns?: {
    [string]: [
      Array<t.Identifier>,
      { +[string]: t.Expression | t.PatternLike },
    ],
  },
}> {
  if (!pathUtils.isObjectExpression(path)) {
    return evaluate(path, traversalState, functions);
  }

  const value: { [string]: mixed } = {};
  const fns: {
    [string]: [
      Array<t.Identifier>,
      $ReadOnly<{ [string]: t.Expression | t.PatternLike }>,
    ],
  } = {};

  for (const prop of path.get('properties')) {
    if (!pathUtils.isObjectProperty(prop)) {
      return evaluate(path, traversalState, functions);
    }
    const objPropPath: NodePath<t.ObjectProperty> = prop;
    const keyResult = evaluateObjKey(objPropPath, traversalState, functions);
    if (!keyResult.confident) {
      return { confident: false, deopt: keyResult.deopt, value: null };
    }
    const key = keyResult.value;

    const valPath = prop.get('value');
    if (!pathUtils.isArrowFunctionExpression(valPath)) {
      const val = evaluate(valPath, traversalState, functions);
      if (!val.confident) {
        return val;
      }
      value[key] = val.value;
      continue;
    }
    const fnPath: NodePath<t.ArrowFunctionExpression> = valPath;
    const allParams: Array<
      NodePath<t.Identifier | t.SpreadElement | t.Pattern>,
    > = fnPath.get('params');

    validateDynamicStyleParams(allParams);

    const params: Array<t.Identifier> = allParams
      .filter((param): param is NodePath<t.Identifier> =>
        pathUtils.isIdentifier(param),
      )
      .map((param) => param.node);

    const fnBody = fnPath.get('body');
    if (!pathUtils.isObjectExpression(fnBody)) {
      // We only allow arrow functions without block bodies.
      return evaluate(path, traversalState, functions);
    }
    const fnObjectBody: NodePath<t.ObjectExpression> = fnBody;
    const evalResult = evaluatePartialObjectRecursively(
      fnObjectBody,
      traversalState,
      functions,
    );

    if (!evalResult.confident) {
      const { confident, value: v, deopt } = evalResult;
      return { confident, value: v, deopt };
    }
    const { value: v, inlineStyles } = evalResult;
    value[key] = v;
    fns[key] = [params, inlineStyles ?? {}];
  }

  return { value, confident: true, fns };
}

function evaluatePartialObjectRecursively(
  path: NodePath<t.ObjectExpression>,
  traversalState: StateManager,
  functions: FunctionConfig = { identifiers: {}, memberExpressions: {} },
  keyPath: $ReadOnlyArray<string> = [],
): $ReadOnly<{
  confident: boolean,
  value: any,
  deopt?: null | NodePath<>,
  inlineStyles?: $ReadOnly<{ [string]: t.Expression | t.PatternLike }>,
}> {
  const obj: { [string]: mixed } = {};
  const inlineStyles: { [string]: t.Expression | t.PatternLike } = {};
  const props: $ReadOnlyArray<
    NodePath<t.ObjectMethod | t.ObjectProperty | t.SpreadElement>,
  > = path.get('properties');
  for (const prop of props) {
    if (pathUtils.isObjectMethod(prop)) {
      return { value: null, confident: false };
    }
    if (pathUtils.isSpreadElement(prop)) {
      const result = evaluate(prop.get('argument'), traversalState, functions);
      if (!result.confident) {
        return result;
      }
      Object.assign(obj, result.value);
      continue;
    }
    if (pathUtils.isObjectProperty(prop)) {
      const keyResult = evaluateObjKey(prop, traversalState, functions);
      if (!keyResult.confident) {
        return { confident: false, deopt: keyResult.deopt, value: null };
      }
      const key = keyResult.value;

      const valuePath: NodePath<t.Expression | t.PatternLike> =
        prop.get('value');

      if (pathUtils.isObjectExpression(valuePath)) {
        const result = evaluatePartialObjectRecursively(
          valuePath,
          traversalState,
          functions,
          [...keyPath, key],
        );
        if (!result.confident) {
          return { confident: false, deopt: result.deopt, value: null };
        }
        obj[key] = result.value;
        Object.assign(inlineStyles, result.inlineStyles);
      } else {
        const result = evaluate(valuePath, traversalState, functions);
        if (!result.confident) {
          const varName =
            '--' +
            (keyPath.length > 0
              ? utils.hash([...keyPath, key].join('_'))
              : key);
          obj[key] = `var(${varName}, revert)`;
          const node = valuePath.node;
          if (!t.isExpression(node)) {
            throw new Error('Expected expression as style value');
          }
          const expression: t.Expression = (node: $FlowFixMe);

          const unit =
            timeUnits.has(key) || lengthUnits.has(key)
              ? getNumberSuffix(key)
              : '';

          inlineStyles[varName] =
            unit !== ''
              ? t.callExpression(
                  t.arrowFunctionExpression(
                    [t.identifier('val')],
                    t.conditionalExpression(
                      t.binaryExpression(
                        '===',
                        t.unaryExpression('typeof', t.identifier('val')),
                        t.stringLiteral('number'),
                      ),
                      t.binaryExpression(
                        '+',
                        t.identifier('val'),
                        t.stringLiteral(unit),
                      ),
                      t.conditionalExpression(
                        t.binaryExpression(
                          '!=',
                          t.identifier('val'),
                          t.nullLiteral(),
                        ),
                        t.identifier('val'),
                        t.stringLiteral('initial'),
                      ),
                    ),
                  ),
                  [(expression: t.Expression)],
                )
              : t.conditionalExpression(
                  t.binaryExpression('!=', expression, t.nullLiteral()),
                  expression,
                  t.stringLiteral('initial'),
                );
        } else {
          obj[key] = result.value;
        }
      }
    }
  }
  return { value: obj, confident: true, inlineStyles };
}

type KeyResult =
  | { confident: true, value: string }
  | { confident: false, deopt?: null | NodePath<> };

function evaluateObjKey(
  prop: NodePath<t.ObjectProperty>,
  traversalState: StateManager,
  functions: FunctionConfig,
): KeyResult {
  const keyPath: NodePath<t.ObjectProperty['key']> = prop.get('key');
  let key: string;
  if ((prop.node: t.ObjectProperty).computed) {
    const result = evaluate(keyPath, traversalState, functions);
    if (!result.confident) {
      return { confident: false, deopt: result.deopt };
    }
    key = result.value;
  } else if (pathUtils.isIdentifier(keyPath)) {
    key = keyPath.node.name;
  } else {
    // TODO: This is'nt handling all possible types that `keyPath` could be
    key = (keyPath.node: $FlowFixMe).value;
  }
  return {
    confident: true,
    value: String(key),
  };
}

function validateDynamicStyleParams(
  params: Array<NodePath<t.Identifier | t.SpreadElement | t.Pattern>>,
) {
  if (
    params.some(
      (param) =>
        pathUtils.isObjectPattern(param) || pathUtils.isRestElement(param),
    )
  ) {
    throw new Error(messages.ONLY_NAMED_PARAMETERS_IN_DYNAMIC_STYLE_FUNCTIONS);
  }

  if (params.some((param) => pathUtils.isAssignmentPattern(param))) {
    throw new Error(messages.NO_DYNAMIC_STYLE_DEFAULT_PARAMETERS);
  }
}
