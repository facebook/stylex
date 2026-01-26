/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { NodePath } from '@babel/traverse';
import type { FunctionConfig } from '../utils/evaluate-path';
import type { StyleObject } from '../utils/stylex-merge-utils';

import * as t from '@babel/types';
import StateManager from '../utils/state-manager';
import {
  collectStyleVarsToKeep,
  makeConditionalExpression,
  resolveStylexArguments,
} from '../utils/stylex-merge-utils';
import { evaluate } from '../utils/evaluate-path';
import stylexDefaultMarker from '../shared/stylex-defaultMarker';

const STYLEX_DEFAULT_MARKER_NAME = 'defaultMarker';
const ALLOWED_EXPRESSION_TYPES = new Set([
  'ObjectExpression',
  'Identifier',
  'MemberExpression',
]);

const STYLEX_PROXY_FLAG = '__IS_PROXY';

type StylexPropsLikeConfig = {
  importSet: $ReadOnlySet<string>,
  memberName: string,
  buildResult: (values: $ReadOnlyArray<?StyleObject>) => t.Expression,
};

type StylexPropsLikeCalleeConfig = $ReadOnly<{
  importSet: $ReadOnlySet<string>,
  memberName: string,
  ...
}>;

export function skipStylexPropsLikeChildren(
  path: NodePath<t.CallExpression>,
  state: StateManager,
  config: StylexPropsLikeCalleeConfig,
) {
  if (
    !isCalleeIdentifier(path, config) &&
    !isCalleeMemberExpression(path, state, config)
  ) {
    return;
  }
  path.skip();
}

export function transformStylexPropsLike(
  path: NodePath<t.CallExpression>,
  state: StateManager,
  config: StylexPropsLikeConfig,
) {
  if (
    !isCalleeIdentifier(path, config) &&
    !isCalleeMemberExpression(path, state, config)
  ) {
    return;
  }

  const argsPath = path
    .get('arguments')
    .flatMap((argPath: NodePath<>) =>
      argPath.isArrayExpression() ? argPath.get('elements') : [argPath],
    );

  const identifiers: FunctionConfig['identifiers'] = {};
  const memberExpressions: FunctionConfig['memberExpressions'] = {};

  state.stylexDefaultMarkerImport.forEach((name) => {
    identifiers[name] = () => stylexDefaultMarker(state.options);
  });

  state.stylexImport.forEach((name) => {
    memberExpressions[name] = {
      [STYLEX_DEFAULT_MARKER_NAME]: {
        fn: () => stylexDefaultMarker(state.options),
      },
    };
  });

  const evaluatePathFnConfig: FunctionConfig = {
    identifiers,
    memberExpressions,
    disableImports: true,
  };

  const { resolvedArgs, bailOut, bailOutIndex, conditionalCount } =
    resolveStylexArguments(
      argsPath,
      (argPath) => parseNullableStyle(argPath, state, evaluatePathFnConfig),
      {
        allowStylePath: (argPath) =>
          ALLOWED_EXPRESSION_TYPES.has(argPath.node.type),
      },
    );

  if (!state.options.enableInlinedConditionalMerge && conditionalCount) {
    collectStyleVarsToKeep(path.get('arguments'), state, {
      bailOutIndex,
      evaluateMemberExpression: (memberPath) =>
        evaluate(memberPath, state, evaluatePathFnConfig),
      isProxyStyle: (value) =>
        value != null && value[STYLEX_PROXY_FLAG] === true,
    });
    return;
  }
  if (bailOut) {
    collectStyleVarsToKeep(path.get('arguments'), state, {
      bailOutIndex,
      evaluateMemberExpression: (memberPath) =>
        evaluate(memberPath, state, evaluatePathFnConfig),
      isProxyStyle: (value) =>
        value != null && value[STYLEX_PROXY_FLAG] === true,
    });
    return;
  }

  path.skip();
  // convert resolvedStyles to a string + ternary expressions
  // We no longer need the keys, so we can just use the values.
  const stringExpression = makeConditionalExpression(
    resolvedArgs,
    config.buildResult,
  );

  // Check if this is used as a JSX spread attribute and optimize
  // the output to avoid object creation and Babel helper
  if (path.parentPath.node.type === 'JSXSpreadAttribute') {
    if (
      t.isObjectExpression(stringExpression) &&
      stringExpression.properties.length > 0 &&
      stringExpression.properties.every(
        (prop) =>
          t.isObjectProperty(prop) &&
          (t.isIdentifier(prop.key) || t.isStringLiteral(prop.key)) &&
          !prop.computed,
      )
    ) {
      // Convert each property to a JSX attribute
      const jsxAttributes = stringExpression.properties
        .filter((prop) => t.isObjectProperty(prop))
        .map((prop) => {
          const objectProp = prop;
          const key = objectProp.key;
          let attrName = '';
          if (t.isIdentifier(key)) {
            attrName = key.name;
          } else if (t.isStringLiteral(key)) {
            attrName = key.value;
          }
          // Handle JSX attribute value based on its type
          let attributeValue;
          if (t.isStringLiteral(objectProp.value)) {
            attributeValue = objectProp.value;
          } else {
            attributeValue = t.stringLiteral(String(objectProp.value));
          }
          return t.jsxAttribute(t.jsxIdentifier(attrName), attributeValue);
        });

      // Replace the spread element with multiple JSX attributes
      path.parentPath.replaceWithMultiple(jsxAttributes);
      return;
    }
  }

  path.replaceWith(stringExpression);
}

// Looks for Null or locally defined style namespaces.
// Otherwise it returns the string "other"
// Which is used as an indicator to bail out of this optimization.
function parseNullableStyle(
  path: NodePath<t.Expression>,
  state: StateManager,
  evaluatePathFnConfig: FunctionConfig,
): null | StyleObject | 'other' {
  const node = path.node;
  if (
    t.isNullLiteral(node) ||
    (t.isIdentifier(node) && node.name === 'undefined')
  ) {
    return null;
  }

  if (t.isMemberExpression(node)) {
    const { object, property, computed: computed } = node;
    let objName = null;
    let propName: null | number | string = null;
    if (
      object.type === 'Identifier' &&
      state.styleMap.has(object.name) &&
      property.type === 'Identifier' &&
      !computed
    ) {
      objName = object.name;
      propName = property.name;
    }
    if (
      object.type === 'Identifier' &&
      state.styleMap.has(object.name) &&
      (property.type === 'StringLiteral' ||
        property.type === 'NumericLiteral') &&
      computed
    ) {
      objName = object.name;
      propName = property.value;
    }

    if (objName != null && propName != null) {
      const style = state.styleMap.get(objName);
      if (style != null && style[String(propName)] != null) {
        // $FlowFixMe[incompatible-type]
        return style[String(propName)];
      }
    }
  }

  const parsedObj = evaluate(path, state, evaluatePathFnConfig);

  if (
    parsedObj.confident &&
    parsedObj.value != null &&
    typeof parsedObj.value === 'object'
  ) {
    if (parsedObj.value[STYLEX_PROXY_FLAG] === true) {
      return 'other';
    }
    return parsedObj.value;
  }

  return 'other';
}

function isCalleeIdentifier(
  path: NodePath<t.CallExpression>,
  config: StylexPropsLikeCalleeConfig,
): boolean {
  const { node } = path;
  return (
    node != null &&
    node.callee != null &&
    node.callee.type === 'Identifier' &&
    config.importSet.has(node.callee.name)
  );
}

function isCalleeMemberExpression(
  path: NodePath<t.CallExpression>,
  state: StateManager,
  config: StylexPropsLikeCalleeConfig,
): boolean {
  const { node } = path;
  return (
    node != null &&
    node.callee != null &&
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === config.memberName &&
    state.stylexImport.has(node.callee.object.name)
  );
}
