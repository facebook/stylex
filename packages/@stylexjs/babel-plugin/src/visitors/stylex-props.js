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
import { convertStyleToClassName } from '../shared/utils/convert-to-className';
import {
  injectDevClassNames,
  convertToTestStyles,
} from '../utils/dev-classname';

const INLINE_CSS_SOURCE = '@stylexjs/inline-css';

type ClassNameValue = string | null | boolean | NonStringClassNameValue;
type NonStringClassNameValue = [t.Expression, ClassNameValue, ClassNameValue];

type StyleObject = {
  [key: string]: string | null | boolean,
};

type InlineCSSTuple = [
  StyleObject,
  $ReadOnly<{
    [string]: mixed,
  }>,
];

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

type ResolvedArg =
  | ?(StyleObject | InlineCSSTuple | InlineCSSDynamic)
  | ConditionalStyle;
type ResolvedArgs = Array<ResolvedArg>;

type InlineCSS = $ReadOnly<{
  property: string,
  value: string | number,
}>;

type InlineCSSDynamic = $ReadOnly<{
  className: string,
  classKey: string,
  varName: string,
  value: t.Expression,
}>;

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
        bailOutIndex = currentIndex;
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
        bailOutIndex = currentIndex;
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
        bailOutIndex = currentIndex;
        bailOut = true;
      } else {
        resolvedArgs.push(
          new ConditionalStyle(leftPath.node, rightResolved, null),
        );
        conditional++;
      }
    } else {
      bailOutIndex = currentIndex;
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
): null | StyleObject | InlineCSSTuple | InlineCSSDynamic | 'other' {
  const node = path.node;
  if (
    t.isNullLiteral(node) ||
    (t.isIdentifier(node) && node.name === 'undefined')
  ) {
    return null;
  }

  const inlineCSS = resolveInlineCSS(path, state);
  if (inlineCSS != null) {
    if (!Array.isArray(inlineCSS) && path.isCallExpression()) {
      const { className, classKey, varName, value } = inlineCSS;
      const compiledObj = t.objectExpression([
        t.objectProperty(
          t.stringLiteral(classKey),
          t.conditionalExpression(
            t.binaryExpression('!=', value, t.nullLiteral()),
            t.stringLiteral(className),
            value,
          ),
        ),
        t.objectProperty(t.stringLiteral('$$css'), t.booleanLiteral(true)),
      ]);
      const inlineObj = t.objectExpression([
        t.objectProperty(
          t.stringLiteral(varName),
          t.conditionalExpression(
            t.binaryExpression('!=', value, t.nullLiteral()),
            value,
            t.identifier('undefined'),
          ),
        ),
      ]);
      path.replaceWith(t.arrayExpression([compiledObj, inlineObj]));
      return 'other';
    }
    if (!Array.isArray(inlineCSS) && !path.isCallExpression()) {
      // Inline static CSS should be inlined immediately so it survives later bailouts.
      path.replaceWith(convertObjectToAST(inlineCSS));
      return inlineCSS;
    }
    if (Array.isArray(inlineCSS) && path.isCallExpression()) {
      // Dynamic inline-css cannot be reduced to plain objects for the build-time
      // props optimization. Replace the argument with the compiled tuple so
      // runtime stylex.props receives the correct value, then bail out.
      const [compiled, inlineVars] = inlineCSS;
      path.replaceWith(
        t.arrayExpression([
          convertObjectToAST(compiled),
          convertObjectToAST(inlineVars),
        ]),
      );
      return 'other';
    }
    // Static inline-css: inline it immediately so it survives any later bailouts.
    if (!Array.isArray(inlineCSS)) {
      path.replaceWith(convertObjectToAST(inlineCSS));
      return inlineCSS;
    }
    return inlineCSS;
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
    if (parsedObj.value.__IS_PROXY === true) {
      return 'other';
    }
    return parsedObj.value;
  }

  return 'other';
}

function resolveInlineCSS(
  path: NodePath<t.Expression>,
  state: StateManager,
): null | StyleObject | InlineCSSTuple | InlineCSSDynamic {
  if (path.isCallExpression()) {
    const dynamic = getInlineDynamicStyle(path, state);
    if (dynamic != null) {
      return compileInlineDynamicStyle(dynamic, state, path);
    }
  }

  const inlineStyle = getInlineStaticCSS(path, state);
  if (inlineStyle != null) {
    return compileInlineStaticCSS(inlineStyle, state, path);
  }

  return null;
}

function getInlineStaticCSS(
  path: NodePath<t.Expression>,
  state: StateManager,
): null | InlineCSS {
  const node = path.node;
  if (!t.isMemberExpression(node)) {
    return null;
  }

  const valueKey = getPropKey(node.property, node.computed);
  if (valueKey == null) {
    return null;
  }

  const parent = node.object;

  if (t.isIdentifier(parent) && isInlineCSSIdentifier(parent, state, path)) {
    return { property: valueKey, value: normalizeInlineValue(valueKey) };
  }

  if (t.isMemberExpression(parent)) {
    const propName = getPropKey(parent.property, parent.computed);
    const base = parent.object;
    if (
      propName != null &&
      t.isIdentifier(base) &&
      isInlineCSSIdentifier(base, state, path)
    ) {
      return { property: propName, value: normalizeInlineValue(valueKey) };
    }
  }

  return null;
}

function getInlineDynamicStyle(
  path: NodePath<t.CallExpression>,
  state: StateManager,
): null | { property: string, value: t.Expression } {
  const callee = path.get('callee');
  if (!callee.isMemberExpression()) {
    return null;
  }
  const valueKey = getPropKey(callee.node.property, callee.node.computed);
  if (valueKey == null) {
    return null;
  }
  const parent = callee.node.object;

  if (
    t.isIdentifier(parent) &&
    path.node.arguments.length === 1 &&
    isInlineCSSIdentifier(parent, state, path)
  ) {
    return {
      property: valueKey,
      value: path.get('arguments')[0].node,
    };
  }

  if (t.isMemberExpression(parent)) {
    const propName = getPropKey(parent.property, parent.computed);
    const base = parent.object;
    if (
      propName != null &&
      t.isIdentifier(base) &&
      isInlineCSSIdentifier(base, state, path) &&
      path.node.arguments.length === 1
    ) {
      return {
        property: propName,
        value: path.get('arguments')[0].node,
      };
    }
  }

  return null;
}

function normalizeInlineValue(value: string | number): string | number {
  if (typeof value === 'string' && value.startsWith('_')) {
    return value.slice(1);
  }
  return value;
}

function getPropKey(
  prop: t.Expression | t.PrivateName | t.Identifier,
  computed: boolean,
): null | string | number {
  if (!computed && t.isIdentifier(prop)) {
    return prop.name;
  }
  if (computed && t.isStringLiteral(prop)) {
    return prop.value;
  }
  if (computed && t.isNumericLiteral(prop)) {
    return prop.value;
  }
  return null;
}

function isInlineCSSIdentifier(
  ident: t.Identifier,
  state: StateManager,
  path: NodePath<>,
): boolean {
  if (
    state.inlineCSSNamedImports.has(ident.name) ||
    state.inlineCSSNamespaceImports.has(ident.name)
  ) {
    return true;
  }
  const binding = path.scope?.getBinding(ident.name);
  if (
    binding &&
    binding.path.isImportSpecifier() &&
    binding.path.parent.type === 'ImportDeclaration' &&
    binding.path.parent.source.value === INLINE_CSS_SOURCE
  ) {
    return true;
  }
  if (
    binding &&
    binding.path.isImportNamespaceSpecifier() &&
    binding.path.parent.type === 'ImportDeclaration' &&
    binding.path.parent.source.value === INLINE_CSS_SOURCE
  ) {
    return true;
  }
  if (
    binding &&
    binding.path.isImportDefaultSpecifier() &&
    binding.path.parent.type === 'ImportDeclaration' &&
    binding.path.parent.source.value === INLINE_CSS_SOURCE
  ) {
    return true;
  }
  return false;
}

function compileInlineStaticCSS(
  inlineStyle: InlineCSS,
  state: StateManager,
  path: NodePath<t.Expression>,
): StyleObject {
  const { property, value } = inlineStyle;
  const cacheKey = `${property}|${typeof value}:${String(value)}`;
  const cached = state.inlineStylesCache.get(cacheKey);
  if (cached != null) {
    return cached;
  }

  const [compiledNamespaces, injectedStyles] = styleXCreateSet(
    {
      __inline__: {
        [property]: value,
      },
    },
    state.options,
  );

  const compiled = applyDevTest(compiledNamespaces.__inline__, state);

  const listOfStyles = Object.entries(injectedStyles).map(
    ([key, { priority, ...rest }]) => [key, rest, priority],
  );
  state.registerStyles(listOfStyles, path);

  state.inlineStylesCache.set(cacheKey, compiled);
  return compiled;
}

function compileInlineDynamicStyle(
  inlineStyle: { property: string, value: t.Expression },
  state: StateManager,
  path: NodePath<t.Expression>,
): InlineCSSDynamic {
  const { property, value } = inlineStyle;
  const cacheKey = property;
  let cached = state.inlineDynamicCache.get(cacheKey);

  if (cached == null) {
    const varName = `--x-${property}`;
    const [classKey, className, styleObj] = convertStyleToClassName(
      [property, `var(${varName})`],
      [],
      [],
      [],
      state.options,
    );
    const { priority, ...rest } = styleObj;

    const propertyInjection = {
      priority: 0,
      ltr: `@property ${varName} { syntax: "*"; inherits: false;}`,
      rtl: null,
    };

    state.registerStyles(
      [
        [classKey, rest, priority],
        [`${classKey}-var`, propertyInjection, 0],
      ],
      path,
    );

    cached = { className, varName, classKey };
    state.inlineDynamicCache.set(cacheKey, cached);
  }

  const { className, varName, classKey } = cached;

  return {
    className,
    classKey,
    varName,
    value,
  };
}

function applyDevTest(
  compiled: { [string]: string | null, $$css: true },
  state: StateManager,
): { [string]: string | null, $$css: true } {
  let result = compiled;
  if (state.isDev && state.options.enableDevClassNames) {
    result = injectDevClassNames(
      { __inline__: result },
      null,
      state,
    ).__inline__;
  }
  if (state.isTest) {
    result = convertToTestStyles(
      { __inline__: result },
      null,
      state,
    ).__inline__;
  }
  return result;
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
