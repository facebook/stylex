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

import * as t from '@babel/types';
import StateManager from '../utils/state-manager';
import { props } from '@stylexjs/stylex';
import { convertObjectToAST } from '../utils/js-to-ast';
import { evaluate } from '../utils/evaluate-path';
import stylexDefaultMarker from '../shared/stylex-defaultMarker';
import styleXCreateSet from '../shared/stylex-create';
import { hoistExpression } from '../utils/ast-helpers';
import { injectDevClassNames } from '../utils/dev-classname';

type ClassNameValue = string | null | boolean | NonStringClassNameValue;
type NonStringClassNameValue = [t.Expression, ClassNameValue, ClassNameValue];

type StyleObject = $ReadOnly<{
  [key: string]: string | null,
  $$css?: true | string,
}>;

class ConditionalStyle {
  test: t.Expression;
  primary: ?StyleObject;
  fallback: ?StyleObject;
  constructor(
    test: t.Expression,
    primary: ?StyleObject,
    fallback: ?StyleObject,
  ) {
    this.test = test;
    this.primary = primary;
    this.fallback = fallback;
  }
}

type ResolvedArg = ?StyleObject | ConditionalStyle;
type ResolvedArgs = Array<ResolvedArg>;

export function skipStylexPropsChildren(
  path: NodePath<t.CallExpression>,
  state: StateManager,
) {
  if (
    !isCalleeIdentifier(path, state) &&
    !isCalleeMemberExpression(path, state)
  ) {
    return;
  }
  path.skip();
}

// If a `stylex()` call uses styles that are all locally defined,
// This function is able to pre-compute that into a single string or
// a single expression of strings and ternary expressions.
export default function transformStylexProps(
  path: NodePath<t.CallExpression>,
  state: StateManager,
) {
  if (
    !isCalleeIdentifier(path, state) &&
    !isCalleeMemberExpression(path, state)
  ) {
    return;
  }

  let bailOut = false;
  let conditional = 0;

  const argsPath = path
    .get('arguments')
    .flatMap((argPath: NodePath<>) =>
      argPath.isArrayExpression() ? argPath.get('elements') : [argPath],
    );

  let currentIndex = -1;
  let bailOutIndex: ?number = null;

  const identifiers: FunctionConfig['identifiers'] = {};
  const memberExpressions: FunctionConfig['memberExpressions'] = {};

  state.stylexDefaultMarkerImport.forEach((name) => {
    identifiers[name] = () => stylexDefaultMarker(state.options);
  });

  state.stylexImport.forEach((name) => {
    memberExpressions[name] = {
      defaultMarker: {
        fn: () => stylexDefaultMarker(state.options),
      },
    };
  });

  const evaluatePathFnConfig: FunctionConfig = {
    identifiers,
    memberExpressions,
    disableImports: true,
  };

  // Pre-process: compile any raw style objects (from utility-styles) before the main loop
  // This transforms { property: 'value' } into { propKey: 'className', $$css: true }
  for (const argPath of argsPath) {
    compileRawStyleObjects(argPath, state, evaluatePathFnConfig);
  }

  const resolvedArgs: ResolvedArgs = [];
  for (const argPath of argsPath) {
    currentIndex++;

    if (
      argPath.isObjectExpression() ||
      argPath.isIdentifier() ||
      argPath.isMemberExpression() ||
      argPath.isCallExpression()
    ) {
      const resolved = parseNullableStyle(argPath, state, evaluatePathFnConfig);
      if (resolved === 'other') {
        if (bailOutIndex == null) {
          bailOutIndex = currentIndex;
        }
        bailOut = true;
      } else {
        resolvedArgs.push(resolved);
      }
    } else if (argPath.isConditionalExpression()) {
      const arg = argPath.node;
      const { test } = arg;
      const consequentPath = argPath.get('consequent');
      const alternatePath = argPath.get('alternate');

      const primary = parseNullableStyle(
        consequentPath,
        state,
        evaluatePathFnConfig,
      );
      const fallback = parseNullableStyle(
        alternatePath,
        state,
        evaluatePathFnConfig,
      );
      if (primary === 'other' || fallback === 'other') {
        if (bailOutIndex == null) {
          bailOutIndex = currentIndex;
        }
        bailOut = true;
      } else {
        resolvedArgs.push(new ConditionalStyle(test, primary, fallback));
        conditional++;
      }
    } else if (argPath.isLogicalExpression()) {
      const arg = argPath.node;
      if (arg.operator !== '&&') {
        bailOutIndex = currentIndex;
        bailOut = true;
        break;
      }
      const leftPath = argPath.get('left');
      const rightPath = argPath.get('right');

      const leftResolved = parseNullableStyle(
        leftPath,
        state,
        evaluatePathFnConfig,
      );
      const rightResolved = parseNullableStyle(
        rightPath,
        state,
        evaluatePathFnConfig,
      );
      if (leftResolved !== 'other' || rightResolved === 'other') {
        if (bailOutIndex == null) {
          bailOutIndex = currentIndex;
        }
        bailOut = true;
      } else {
        resolvedArgs.push(
          new ConditionalStyle(leftPath.node, rightResolved, null),
        );
        conditional++;
      }
    } else {
      if (bailOutIndex == null) {
        bailOutIndex = currentIndex;
      }
      bailOut = true;
    }
    if (conditional > 4) {
      bailOut = true;
    }
    if (bailOut) {
      continue;
    }
  }
  if (!state.options.enableInlinedConditionalMerge && conditional) {
    bailOut = true;
  }
  if (bailOut) {
    const argumentPaths = path.get('arguments');

    let nonNullProps: Array<string> | true = [];

    let index = -1;
    for (const argPath of argumentPaths) {
      index++;
      // eslint-disable-next-line no-loop-func, no-inner-declarations
      function MemberExpression(path: NodePath<t.MemberExpression>) {
        const object = path.get('object').node;
        const property = path.get('property').node;
        const computed = path.node.computed;
        let objName: string | null = null;
        let propName: number | string | null = null;
        if (object.type === 'Identifier' && state.styleMap.has(object.name)) {
          objName = object.name;

          if (property.type === 'Identifier' && !computed) {
            propName = property.name;
          }
          if (
            (property.type === 'StringLiteral' ||
              property.type === 'NumericLiteral') &&
            computed
          ) {
            propName = property.value;
          }
        }
        let styleNonNullProps: true | Array<string> = [];
        if (bailOutIndex != null && index > bailOutIndex) {
          nonNullProps = true;
          styleNonNullProps = true;
        }
        if (nonNullProps === true) {
          styleNonNullProps = true;
        } else {
          const { confident, value: styleValue } = evaluate(
            path,
            state,
            evaluatePathFnConfig,
          );
          if (
            !confident ||
            styleValue == null ||
            styleValue.__IS_PROXY === true
          ) {
            nonNullProps = true;
            styleNonNullProps = true;
          } else {
            styleNonNullProps =
              nonNullProps === true ? true : [...nonNullProps];
            if (nonNullProps !== true) {
              nonNullProps = [
                ...nonNullProps,
                ...Object.keys(styleValue).filter(
                  (key) => styleValue[key] !== null,
                ),
              ];
            }
          }
        }

        if (objName != null) {
          state.styleVarsToKeep.add([
            objName,
            propName != null ? String(propName) : true,
            styleNonNullProps,
          ]);
        }
      }

      if (argPath.isMemberExpression()) {
        MemberExpression(argPath);
      } else {
        argPath.traverse({
          MemberExpression,
        });
      }

      // Hoist inline CSS objects (from utility-styles) to module level
      // Raw objects are pre-compiled in compileRawStyleObjects, so this only hoists compiled objects
      // eslint-disable-next-line no-inner-declarations
      function ObjectExpression(objPath: NodePath<t.ObjectExpression>) {
        // Check if this object has $$css: true (compiled utility style object)
        const hasCssMarker = objPath.node.properties.some(
          (prop) =>
            t.isObjectProperty(prop) &&
            ((t.isIdentifier(prop.key) && prop.key.name === '$$css') ||
              (t.isStringLiteral(prop.key) && prop.key.value === '$$css')) &&
            t.isBooleanLiteral(prop.value, { value: true }),
        );
        if (hasCssMarker) {
          const hoisted = hoistExpression(objPath, objPath.node);
          objPath.replaceWith(hoisted);
        }
      }

      if (argPath.isObjectExpression()) {
        ObjectExpression(argPath);
      } else {
        argPath.traverse({
          ObjectExpression,
        });
      }
    }
  } else {
    path.skip();
    // convert resolvedStyles to a string + ternary expressions
    // We no longer need the keys, so we can just use the values.
    const stringExpression = makeStringExpression(resolvedArgs);

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

  // Local dynamic style functions (e.g., styles.opacity(1)) should bail out
  // so runtime props merging keeps the conditional class/inline var semantics.
  if (path.isCallExpression()) {
    const callee = path.get('callee');
    if (callee.isMemberExpression()) {
      const obj = callee.get('object');
      if (obj.isIdentifier() && state.styleMap.has(obj.node.name)) {
        return 'other';
      }
    }
    return 'other';
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
        const memberVal = style[String(propName)];
        // Dynamic style functions (arrow/function expressions) should bail out
        // so runtime props handling remains intact.
        if (typeof memberVal === 'function') {
          return 'other';
        }
        // $FlowFixMe[incompatible-type]
        return memberVal;
      }
    }
  }

  const parsedObj = evaluate(path, state, evaluatePathFnConfig);

  if (
    parsedObj.confident &&
    parsedObj.value != null &&
    typeof parsedObj.value === 'object'
  ) {
    if (parsedObj.value.__IS_PROXY === true) {
      return 'other';
    }
    return parsedObj.value;
  }

  return 'other';
}

function makeStringExpression(values: ResolvedArgs): t.Expression {
  const conditions = values
    .filter(
      (v: ResolvedArg): v is ConditionalStyle => v instanceof ConditionalStyle,
    )
    .map((v: ConditionalStyle) => v.test);

  if (conditions.length === 0) {
    const result = props(values as any);
    return convertObjectToAST(result);
  }

  const conditionPermutations = genConditionPermutations(conditions.length);
  const objEntries = conditionPermutations.map((permutation) => {
    let i = 0;
    const args = values.map((v) => {
      if (v instanceof ConditionalStyle) {
        const { primary, fallback } = v;
        return permutation[i++] ? primary : fallback;
      } else {
        return v;
      }
    });
    const key = permutation.reduce(
      (soFar, bool) => (soFar << 1) | (bool ? 1 : 0),
      0,
    );
    return t.objectProperty(
      t.numericLiteral(key),
      convertObjectToAST(props(args as any)),
    );
  });
  const objExpressions = t.objectExpression(objEntries);
  const conditionsToKey = genBitwiseOrOfConditions(conditions);
  return t.memberExpression(objExpressions, conditionsToKey, true);
}

// A function to generate a list of all possible permutations of true and false for a given count of conditional expressions.
// For example, if there are 2 conditional expressions, this function will return:
// [[true, true], [true, false], [false, true], [false, false]]
function genConditionPermutations(count: number): Array<Array<boolean>> {
  const result = [];
  for (let i = 0; i < 2 ** count; i++) {
    const combination = [];
    for (let j = 0; j < count; j++) {
      combination.push(Boolean(i & (1 << j)));
    }
    result.push(combination);
  }
  return result;
}

// A function to generate a bitwise or of all the conditions.
// For example, if there are 2 conditional expressions, this function will return:
// `!!test1 << 2 | !!test2 << 1
function genBitwiseOrOfConditions(
  conditions: Array<t.Expression>,
): t.Expression {
  const binaryExpressions = conditions.map((condition, i) => {
    const shift = conditions.length - i - 1;
    return t.binaryExpression(
      '<<',
      t.unaryExpression('!', t.unaryExpression('!', condition)),
      t.numericLiteral(shift),
    );
  });
  return binaryExpressions.reduce((acc, expr) => {
    return t.binaryExpression('|', acc, expr);
  });
}

function isCalleeIdentifier(
  path: NodePath<t.CallExpression>,
  state: StateManager,
): boolean {
  const { node } = path;
  return (
    node != null &&
    node.callee != null &&
    node.callee.type === 'Identifier' &&
    state.stylexPropsImport.has(node.callee.name)
  );
}

function isCalleeMemberExpression(
  path: NodePath<t.CallExpression>,
  state: StateManager,
): boolean {
  const { node } = path;
  return (
    node != null &&
    node.callee != null &&
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'props' &&
    state.stylexImport.has(node.callee.object.name)
  );
}

/**
 * Pre-compile raw style objects from utility-styles.
 * This transforms { property: 'value' } into { propKey: 'className', $$css: true }
 * and registers the CSS injection.
 */
function compileRawStyleObjects(
  argPath: NodePath<>,
  state: StateManager,
  evaluatePathFnConfig: FunctionConfig,
): void {
  function processObjectExpression(objPath: NodePath<t.ObjectExpression>) {
    // Check if this object already has $$css marker (already compiled)
    const hasCssMarker = objPath.node.properties.some(
      (prop) =>
        t.isObjectProperty(prop) &&
        ((t.isIdentifier(prop.key) && prop.key.name === '$$css') ||
          (t.isStringLiteral(prop.key) && prop.key.value === '$$css')),
    );
    if (hasCssMarker) {
      return;
    }

    // Empty objects don't need processing
    const properties = objPath.node.properties;
    if (properties.length === 0) {
      return;
    }

    // Try to evaluate the object
    const evalResult = evaluate(objPath, state, evaluatePathFnConfig);

    // Check if the object has dynamic values (non-evaluatable)
    if (!evalResult.confident) {
      // Check if this is a simple {property: dynamicValue} pattern
      if (properties.length === 1 && t.isObjectProperty(properties[0])) {
        const prop = properties[0];
        const key = t.isIdentifier(prop.key) && !prop.computed
          ? prop.key.name
          : t.isStringLiteral(prop.key)
            ? prop.key.value
            : null;

        if (key != null && t.isExpression(prop.value) && !t.isLiteral(prop.value)) {
          // This is a dynamic style: { property: dynamicValue }
          compileDynamicStyle(objPath, key, prop.value, state);
          return;
        }
      }
      return;
    }

    if (evalResult.value == null) {
      return;
    }

    // Skip proxies
    if (evalResult.value.__IS_PROXY === true) {
      return;
    }

    // This is a raw style object - compile it
    const rawStyle = evalResult.value;

    // Create a namespace wrapper for styleXCreateSet: { __inline__: rawStyle }
    const styleInput = { __inline__: rawStyle };

    // eslint-disable-next-line prefer-const
    let [compiledStyles, injectedStyles] = styleXCreateSet(
      styleInput,
      state.options,
    );

    // Inject dev class names if enabled
    if (state.isDev && state.opts.enableDevClassNames) {
      compiledStyles = {
        ...injectDevClassNames(compiledStyles, null, state),
      };
    }

    // Register the CSS
    const listOfStyles = Object.entries(injectedStyles).map(
      ([key, { priority, ...rest }]) => [key, rest, priority],
    );
    state.registerStyles(listOfStyles, objPath);

    // Get the compiled style for __inline__ namespace
    const compiledStyle = compiledStyles.__inline__;
    if (compiledStyle == null) {
      return;
    }

    // Convert to AST and replace
    const compiledAst = convertObjectToAST(compiledStyle);
    objPath.replaceWith(compiledAst);
  }

  if (argPath.isObjectExpression()) {
    processObjectExpression(argPath);
  } else if (argPath.isConditionalExpression()) {
    const consequentPath = argPath.get('consequent');
    const alternatePath = argPath.get('alternate');
    if (consequentPath.isObjectExpression()) {
      processObjectExpression(consequentPath);
    }
    if (alternatePath.isObjectExpression()) {
      processObjectExpression(alternatePath);
    }
  } else if (argPath.isLogicalExpression()) {
    const rightPath = argPath.get('right');
    if (rightPath.isObjectExpression()) {
      processObjectExpression(rightPath);
    }
  }
}

/**
 * Compile a dynamic style { property: dynamicValue } into a hoisted function pattern.
 * This creates: const _styles = { property: _v => [compiledStyle, inlineVars] }
 * And replaces the original with: _styles.property(dynamicValue)
 */
function compileDynamicStyle(
  objPath: NodePath<t.ObjectExpression>,
  property: string,
  valueExpr: t.Expression,
  state: StateManager,
): void {
  // Use a CSS variable for the dynamic value
  const varName = `--x-${property}`;
  const rawStyle = { [property]: `var(${varName})` };

  // Create a namespace wrapper for styleXCreateSet
  const styleInput = { __inline__: rawStyle };

  // eslint-disable-next-line prefer-const
  let [compiledStyles, injectedStyles] = styleXCreateSet(
    styleInput,
    state.options,
  );

  // Inject dev class names if enabled
  if (state.isDev && state.opts.enableDevClassNames) {
    compiledStyles = {
      ...injectDevClassNames(compiledStyles, null, state),
    };
  }

  // Add @property rule for the CSS variable
  injectedStyles[varName] = {
    priority: 0,
    ltr: `@property ${varName} { syntax: "*"; inherits: false;}`,
    rtl: null,
  };

  // Register the CSS
  const listOfStyles = Object.entries(injectedStyles).map(
    ([key, { priority, ...rest }]) => [key, rest, priority],
  );
  state.registerStyles(listOfStyles, objPath);

  // Get the compiled style
  const compiledStyle = compiledStyles.__inline__;
  if (compiledStyle == null) {
    return;
  }

  // Get the class name for the property
  const propKey = Object.keys(compiledStyle).find((k) => k !== '$$css');
  const className = propKey != null ? compiledStyle[propKey] : null;
  if (className == null || propKey == null) {
    return;
  }

  // Create the function pattern:
  // _v => [{ propKey: _v != null ? className : _v, $$css: true }, { varName: _v != null ? _v : undefined }]
  const param = t.identifier('_v');
  const nullCheck = t.binaryExpression('!=', param, t.nullLiteral());

  const compiledObj = t.objectExpression([
    t.objectProperty(
      t.stringLiteral(propKey),
      t.conditionalExpression(nullCheck, t.stringLiteral(className), param),
    ),
    t.objectProperty(t.stringLiteral('$$css'), t.booleanLiteral(true)),
  ]);

  const inlineVarsObj = t.objectExpression([
    t.objectProperty(
      t.stringLiteral(varName),
      t.conditionalExpression(
        t.binaryExpression('!=', param, t.nullLiteral()),
        param,
        t.identifier('undefined'),
      ),
    ),
  ]);

  const fnBody = t.arrayExpression([compiledObj, inlineVarsObj]);
  const arrowFn = t.arrowFunctionExpression([param], fnBody);

  // Create the hoisted styles object: const _styles = { property: arrowFn }
  const stylesObj = t.objectExpression([
    t.objectProperty(t.identifier(property), arrowFn),
  ]);

  // Hoist the function
  const hoistedId = hoistExpression(objPath, stylesObj);

  // Replace the original with: _hoistedId.property(valueExpr)
  const callExpr = t.callExpression(
    t.memberExpression(hoistedId, t.identifier(property)),
    [valueExpr],
  );
  objPath.replaceWith(callExpr);
}
