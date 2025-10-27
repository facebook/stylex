/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

/**
 * This is a extended version of the path evaluation code from Babel.
 *
 * The original can be found at:
 * https://github.com/babel/babel/blob/main/packages/babel-traverse/src/path/evaluation.ts
 *
 * The following extensions were made:
 * - It can accept a mapping from variable names to functions
 *   which when encountered will be evaluated instead of deopting.
 *   - The functions can be configured to accept the raw path instead of
 *     static values to handle dynamic values.
 * - It can handle object spreads when the spread value itself is statically evaluated.
 */

import type { NodePath, Binding } from '@babel/traverse';

import { parseSync } from '@babel/core';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import StateManager from './state-manager';
import { utils } from '../shared';
import * as errMsgs from './evaluation-errors';

// This file contains Babels metainterpreter that can evaluate static code.
const PROXY_MARKER = '__isProxy__';
const VALID_CALLEES = ['String', 'Number', 'Math', 'Object', 'Array'];
const INVALID_METHODS = [
  'random',
  'assign',
  'defineProperties',
  'defineProperty',
  'freeze',
  'seal',
  'splice',
];

function isValidCallee(val: string): boolean {
  return (VALID_CALLEES as $ReadOnlyArray<string>).includes(val);
}

function isInvalidMethod(val: string): boolean {
  return INVALID_METHODS.includes(val);
}

export type FunctionConfig = {
  identifiers: {
    [fnName: string]: $FlowFixMe,
  },
  memberExpressions: {
    [key: string]: {
      [memberName: string]: {
        fn: (...args: $FlowFixMe[]) => $FlowFixMe,
        takesPath?: boolean,
      },
    },
  },
  disableImports?: boolean,
};

type State = {
  confident: boolean,
  deoptPath: NodePath<> | null,
  deoptReason?: string,
  seen: Map<t.Node, Result>,
  addedImports: Set<string>,
  functions: FunctionConfig,
  traversalState: StateManager,
};

type Result =
  | {
      resolved: true,
      value: any,
    }
  | {
      resolved: false,
      reason: string,
    };
/**
 * Deopts the evaluation
 */
function deopt(path: NodePath<>, state: State, reason: string): void {
  if (!state.confident) return;
  state.deoptPath = path;
  state.confident = false;
  state.deoptReason = reason;
}

function evaluateImportedFile(
  filePath: string,
  namedExport: string,
  state: State,
  bindingPath: NodePath<>,
): any {
  const fs = require('node:fs');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  // It's safe to use `.babelrc` here because we're only
  // interested in the JS runtime, and not the CSS.
  // TODO: in environments where `.babelrc` is not available,
  // we need to find a way to decide whether to use Flow or TS syntax extensions.
  const ast: null | t.File | { +errors: mixed } = parseSync(fileContents, {
    babelrc: true,
  });
  if (!ast || ast.errors || !t.isNode(ast)) {
    deopt(bindingPath, state, errMsgs.IMPORT_FILE_PARSING_ERROR);
    return;
  }

  const astNode: t.Node = ast as $FlowFixMe;

  let result: any;

  traverse(astNode, {
    ExportNamedDeclaration(path: NodePath<t.ExportNamedDeclaration>) {
      const declaration = path.get('declaration');

      if (declaration.isVariableDeclaration()) {
        const decls = declaration.get('declarations');

        const finder = (decl: NodePath<t.Node>) => {
          if (decl.isVariableDeclarator()) {
            const id = decl.get('id');
            const init: ?NodePath<t.Expression> = (
              decl as NodePath<t.VariableDeclarator>
            ).get('init');
            if (
              id.isIdentifier() &&
              id.node.name === namedExport &&
              init != null &&
              init.isExpression()
            ) {
              result = evaluateCached(init, state);
            }
          }
        };
        if (Array.isArray(decls)) {
          decls.forEach(finder);
        } else {
          finder(decls);
        }
      }
    },
  });

  if (state.confident) {
    return result;
  } else {
    deopt(bindingPath, state, errMsgs.IMPORT_FILE_EVAL_ERROR);
    return;
  }
}

function evaluateThemeRef(
  fileName: string,
  exportName: string,
  state: State,
): { [key: string]: string } {
  const resolveKey = (key: string) => {
    if (key.startsWith('--')) {
      return `var(${key})`;
    }

    const strToHash =
      key === '__varGroupHash__'
        ? utils.genFileBasedIdentifier({ fileName, exportName })
        : utils.genFileBasedIdentifier({
            fileName,
            exportName,
            key,
          });

    const { debug, enableDebugClassNames } = state.traversalState.options;

    const varSafeKey =
      key === '__varGroupHash__'
        ? ''
        : (key[0] >= '0' && key[0] <= '9' ? `_${key}` : key).replace(
            /[^a-zA-Z0-9]/g,
            '_',
          ) + '-';

    const varName =
      debug && enableDebugClassNames
        ? varSafeKey +
          state.traversalState.options.classNamePrefix +
          utils.hash(strToHash)
        : state.traversalState.options.classNamePrefix + utils.hash(strToHash);

    if (key === '__varGroupHash__') {
      return varName;
    }
    return `var(--${varName})`;
  };

  const createNestedProxy = (currentPath: Array<string> = []): any => {
    return new Proxy(
      {},
      {
        get(_, key: string) {
          if (key === PROXY_MARKER) {
            return true;
          }

          if (key === 'valueOf' || key === 'toString') {
            return () => resolveKey(currentPath.join('.'));
          }

          const newPath = [...currentPath, key];
          return createNestedProxy(newPath);
        },
        set(_, key: string, value: string) {
          throw new Error(
            `Cannot set value ${value} to key ${[...currentPath, key].join('.')} in theme ${fileName}`,
          );
        },
      },
    );
  };

  return createNestedProxy();
}

/**
 * We wrap the _evaluate method so we can track `seen` nodes, we push an item
 * to the map before we actually evaluate it so we can deopt on self recursive
 * nodes such as:
 *
 *   var g = a ? 1 : 2,
 *       a = g * this.foo
 */
function evaluateCached(path: NodePath<>, state: State): any {
  const { node } = path;
  const { seen } = state;

  const existing: ?Result = seen.get(node);
  if (existing != null) {
    if (existing.resolved) {
      return existing.value;
    } else {
      deopt(path, state, existing.reason);
      return;
    }
  } else {
    const item: Result = { resolved: false, reason: 'Currently evaluating' };
    seen.set(node, item);

    if (node == null) {
      deopt(path, state, errMsgs.PATH_WITHOUT_NODE);
      return;
    }

    const val = _evaluate(path, state);
    if (state.confident) {
      seen.set(node, {
        resolved: true,
        value: val,
      });
    }

    return val;
  }
}

function _evaluate(path: NodePath<>, state: State): any {
  if (!state.confident) return;

  if (path.isArrowFunctionExpression()) {
    const body = path.get('body');
    const params: $ReadOnlyArray<
      NodePath<t.Identifier | t.Pattern | t.RestElement>,
    > = path.get('params');
    const identParams = params
      .filter(
        (
          param: NodePath<t.Identifier | t.Pattern | t.RestElement>,
        ): param is NodePath<t.Identifier> => param.isIdentifier(),
      )
      .map((paramPath) => paramPath.node.name);
    if (body.isExpression() && identParams.length === params.length) {
      const expr: NodePath<t.Expression> = body;
      return (...args) => {
        const identifierEntries = identParams.map(
          (ident, index): [string, any] => [ident, args[index]],
        );
        const identifiersObj = Object.fromEntries(identifierEntries);
        const result = evaluate(expr, state.traversalState, {
          ...state.functions,
          identifiers: { ...state.functions.identifiers, ...identifiersObj },
        });
        return result.value;
      };
    }
  }

  if (path.isIdentifier()) {
    const name: string = path.node.name;
    if (Object.keys(state.functions?.identifiers ?? {}).includes(name)) {
      return state.functions.identifiers[name];
    }
  }

  if (path.isTSAsExpression()) {
    const expr: NodePath<t.Expression> = path.get('expression');
    return evaluateCached(expr, state);
  }

  if (path.node.type === 'TSSatisfiesExpression') {
    const expr: NodePath<t.Expression> = (path as $FlowFixMe).get('expression');
    return evaluateCached(expr, state);
  }

  if (path.isSequenceExpression()) {
    const exprs = path.get('expressions');
    return evaluateCached(exprs[exprs.length - 1], state);
  }

  if (
    path.isStringLiteral() ||
    path.isNumericLiteral() ||
    path.isBooleanLiteral()
  ) {
    return path.node.value;
  }

  if (path.isNullLiteral()) {
    return null;
  }

  if (path.isTemplateLiteral()) {
    return evaluateQuasis(path, path.node.quasis, state);
  }

  const maybeTag = path.isTaggedTemplateExpression() && path.get('tag');
  if (
    path.isTaggedTemplateExpression() &&
    maybeTag &&
    maybeTag.isMemberExpression()
  ) {
    const tag: NodePath<t.MemberExpression> = maybeTag;
    const object: NodePath<t.Expression | t.Super> = tag.get('object');

    if (object.isIdentifier()) {
      const name = object.node.name;
      const property: NodePath<> = tag.get('property');

      if (
        name === 'String' &&
        !path.scope.hasBinding(name) &&
        property.isIdentifier() &&
        property.node.name === 'raw'
      ) {
        return evaluateQuasis(path, path.node.quasi.quasis, state, true);
      }
    }
  }

  if (path.isConditionalExpression()) {
    const testResult = evaluateCached(path.get('test'), state);
    if (!state.confident) return;
    if (testResult) {
      return evaluateCached(path.get('consequent'), state);
    } else {
      return evaluateCached(path.get('alternate'), state);
    }
  }

  if (path.isExpressionWrapper()) {
    // TypeCastExpression, ExpressionStatement etc
    return evaluateCached(path.get('expression'), state);
  }

  // "foo".length
  if (
    path.isMemberExpression() &&
    !path.parentPath.isCallExpression({ callee: path.node })
  ) {
    const object = evaluateCached(path.get('object'), state);
    if (!state.confident) {
      return;
    }

    const propPath = path.get('property');

    let property;
    if (path.node.computed) {
      property = evaluateCached(propPath, state);
      if (!state.confident) {
        return;
      }
    } else if (propPath.isIdentifier()) {
      property = propPath.node.name;
    } else if (propPath.isStringLiteral()) {
      property = propPath.node.value;
    } else {
      return deopt(propPath, state, errMsgs.UNEXPECTED_MEMBER_LOOKUP);
    }

    const result = object[property];

    // handle nested member expression
    const parent = path.parentPath;

    const isChainedAccess =
      parent != null &&
      parent.isMemberExpression() &&
      parent.get('object').node === path.node;

    if (result?.[PROXY_MARKER] && !isChainedAccess) {
      return result.valueOf();
    }

    return result;
  }

  if (path.isReferencedIdentifier()) {
    const binding: ?Binding = path.scope?.getBinding(path.node.name);

    const bindingPath = binding?.path;
    if (
      binding &&
      bindingPath &&
      !bindingPath.isImportDefaultSpecifier() &&
      !bindingPath.isImportNamespaceSpecifier() &&
      bindingPath.isImportSpecifier()
    ) {
      const importSpecifierPath: NodePath<t.ImportSpecifier> = bindingPath;
      const importSpecifierNode: t.ImportSpecifier = importSpecifierPath.node;
      // const localName = binding.path.node.local.name;
      const imported: t.Identifier | t.StringLiteral =
        importSpecifierNode.imported;
      const importedName =
        imported.type === 'Identifier' ? imported.name : imported.value;
      const importPath = binding.path.parentPath;
      if (
        importPath &&
        importPath.isImportDeclaration() &&
        !state.functions.disableImports
      ) {
        const absPath = state.traversalState.importPathResolver(
          importPath.node.source.value,
        );
        if (!absPath) {
          return deopt(
            binding.path,
            state,
            errMsgs.IMPORT_PATH_RESOLUTION_ERROR,
          );
        }
        const [type, value] = absPath;

        const returnValue =
          type === 'themeNameRef'
            ? evaluateThemeRef(value, importedName, state)
            : evaluateImportedFile(value, importedName, state, bindingPath);
        if (state.confident) {
          if (
            !state.addedImports.has(importPath.node.source.value) &&
            state.traversalState.treeshakeCompensation
          ) {
            importPath.insertBefore(
              t.importDeclaration([], importPath.node.source),
            );
            state.addedImports.add(importPath.node.source.value);
          }
          return returnValue;
        } else {
          deopt(binding.path, state, errMsgs.IMPORT_FILE_EVAL_ERROR);
        }
      }
    }

    if (binding && bindingPath && bindingPath.isImportDefaultSpecifier()) {
      deopt(binding.path, state, errMsgs.IMPORT_FILE_EVAL_ERROR);
    }

    if (binding && binding.constantViolations.length > 0) {
      return deopt(binding.path, state, errMsgs.NON_CONSTANT);
    }

    if (binding && path.node.start < binding.path.node.end) {
      return deopt(binding.path, state, errMsgs.USED_BEFORE_DECLARATION);
    }

    if (binding && binding.hasValue) {
      return binding.value;
    } else {
      if (path.node.name === 'undefined') {
        return binding
          ? deopt(binding.path, state, errMsgs.UNINITIALIZED_CONST)
          : undefined;
      } else if (path.node.name === 'Infinity') {
        return binding
          ? deopt(binding.path, state, errMsgs.UNINITIALIZED_CONST)
          : Infinity;
      } else if (path.node.name === 'NaN') {
        return binding
          ? deopt(binding.path, state, errMsgs.UNINITIALIZED_CONST)
          : NaN;
      }

      const resolved = (path as $FlowFixMe).resolve();
      if (resolved === path) {
        return deopt(path, state, errMsgs.UNDEFINED_CONST);
      } else {
        return evaluateCached(resolved, state);
      }
    }
  }

  if (path.isUnaryExpression({ prefix: true })) {
    if (path.node.operator === 'void') {
      // we don't need to evaluate the argument to know what this will return
      return undefined;
    }

    const argument = path.get('argument');
    if (
      path.node.operator === 'typeof' &&
      (argument.isFunction() || argument.isClass())
    ) {
      return 'function';
    }

    const arg = evaluateCached(argument, state);
    if (!state.confident) return;
    switch (path.node.operator) {
      case '!':
        return !arg;
      case '+':
        return +arg;
      case '-':
        return -arg;
      case '~':
        return ~arg;
      case 'typeof':
        return typeof arg;
      case 'void':
        return undefined;
      default:
        return deopt(
          path,
          state,
          errMsgs.UNSUPPORTED_OPERATOR(path.node.operator),
        );
    }
  }

  if (path.isArrayExpression()) {
    const arrPath: NodePath<t.ArrayExpression> = path;
    const arr = [];
    const elems: $ReadOnlyArray<NodePath<>> = arrPath.get('elements');
    for (const elem of elems) {
      const elemValue = evaluate(elem, state.traversalState, state.functions);

      if (elemValue.confident) {
        arr.push(elemValue.value);
      } else {
        elemValue.deopt &&
          deopt(elemValue.deopt, state, elemValue.reason ?? 'unknown error');
        return;
      }
    }
    return arr;
  }

  if (path.isObjectExpression()) {
    const obj: { [string]: mixed } = {};
    const props: $ReadOnlyArray<
      NodePath<t.ObjectMethod | t.ObjectProperty | t.SpreadElement>,
    > = path.get('properties');
    for (const prop of props) {
      if (prop.isObjectMethod()) {
        return deopt(prop, state, errMsgs.OBJECT_METHOD);
      }
      if (prop.isSpreadElement()) {
        const spreadExpression = evaluateCached(prop.get('argument'), state);
        if (!state.confident) {
          return deopt(prop, state, state.deoptReason ?? 'unknown error');
        }
        // $FlowFixMe[unsafe-object-assign]
        Object.assign(obj, spreadExpression);
        continue;
      }
      if (prop.isObjectProperty()) {
        const keyPath: NodePath<t.ObjectProperty['key']> = prop.get('key');
        let key: string | number | boolean;
        if (prop.node.computed) {
          const {
            confident,
            deopt: resultDeopt,
            reason: deoptReason,
            value,
          } = evaluate(
            keyPath,
            state.traversalState,
            state.functions,
            state.seen,
          );

          if (!confident) {
            resultDeopt &&
              deopt(resultDeopt, state, deoptReason ?? 'unknown error');
            return;
          }
          key = value;
        } else if (keyPath.isIdentifier()) {
          key = keyPath.node.name;
        } else {
          // TODO: This isn't handling all possible types that `keyPath` could be
          key = (keyPath.node as $FlowFixMe).value;
        }

        const valuePath: NodePath<> = prop.get('value');
        let value = evaluate(
          valuePath,
          state.traversalState,
          state.functions,
          state.seen,
        );
        if (!value.confident) {
          value.deopt &&
            deopt(value.deopt, state, value.reason ?? 'unknown error');
          return;
        }
        value = value.value;
        obj[key] = value;
      }
    }
    return obj;
  }

  if (path.isLogicalExpression()) {
    // If we are confident that the left side of an && is false, or the left
    // side of an || is true, we can be confident about the entire expression
    const stateForLeft = {
      ...state,
      deoptPath: null,
      confident: true,
    } as const;
    const leftPath = path.get('left');
    const left = evaluateCached(leftPath, stateForLeft as $FlowFixMe);
    const leftConfident: boolean = stateForLeft.confident as $FlowFixMe;

    const stateForRight = { ...state, deoptPath: null, confident: true };
    const rightPath = path.get('right');
    const right = evaluateCached(rightPath, stateForRight as $FlowFixMe);
    const rightConfident: boolean = stateForRight.confident as $FlowFixMe;

    switch (path.node.operator) {
      case '||': {
        // TODO consider having a "truthy type" that doesn't bail on
        // left uncertainty but can still evaluate to truthy.
        if (leftConfident && (!!left || rightConfident)) {
          return left || right;
        }
        if (!leftConfident) {
          deopt(leftPath, state, stateForLeft.deoptReason ?? 'unknown error');
          return;
        }
        if (!rightConfident) {
          deopt(rightPath, state, stateForRight.deoptReason ?? 'unknown error');
          return;
        }

        deopt(path, state, 'unknown error');
        return;
      }
      case '&&': {
        if (leftConfident && (!left || rightConfident)) {
          return left && right;
        }
        if (!leftConfident) {
          deopt(leftPath, state, stateForLeft.deoptReason ?? 'unknown error');
          return;
        }
        if (!rightConfident) {
          deopt(rightPath, state, stateForRight.deoptReason ?? 'unknown error');
          return;
        }

        deopt(path, state, 'unknown error');
        return;
      }
      case '??': {
        if (leftConfident && !!(left ?? rightConfident)) {
          return left ?? right;
        }
        if (!leftConfident) {
          deopt(leftPath, state, stateForLeft.deoptReason ?? 'unknown error');
          return;
        }
        if (!rightConfident) {
          deopt(rightPath, state, stateForRight.deoptReason ?? 'unknown error');
          return;
        }

        deopt(path, state, 'unknown error');
        return;
      }
      default:
        path.node.operator as empty;
    }
  }

  if (path.isBinaryExpression()) {
    const left = evaluateCached(path.get('left'), state);
    if (!state.confident) return;
    const right = evaluateCached(path.get('right'), state);
    if (!state.confident) return;

    switch (path.node.operator) {
      case '-':
        return left - right;
      case '+':
        return left + right;
      case '/':
        return left / right;
      case '*':
        return left * right;
      case '%':
        return left % right;
      case '**':
        return left ** right;
      case '<':
        return left < right;
      case '>':
        return left > right;
      case '<=':
        return left <= right;
      case '>=':
        return left >= right;
      case '==':
        return left == right; // eslint-disable-line eqeqeq
      case '!=':
        return left !== right;
      case '===':
        return left === right;
      case '!==':
        return left !== right;
      case '|':
        return left | right;
      case '&':
        return left & right;
      case '^':
        return left ^ right;
      case '<<':
        return left << right;
      case '>>':
        return left >> right;
      case '>>>':
        return left >>> right;
      case 'in':
        return left in right;
      case 'instanceof':
        return left instanceof right;
      default:
        return;
    }
  }

  if (path.isCallExpression()) {
    const callee = path.get('callee');
    let context;
    let func;

    // Number(1);
    if (
      callee.isIdentifier() &&
      !path.scope.getBinding(callee.node.name) &&
      isValidCallee(callee.node.name)
    ) {
      func = global[callee.node.name];
    } else if (
      callee.isIdentifier() &&
      state.functions.identifiers[callee.node.name]
    ) {
      func = state.functions.identifiers[callee.node.name];
    } else if (callee.isIdentifier()) {
      const maybeFunction = evaluateCached(callee, state);
      if (state.confident) {
        func = maybeFunction;
      } else {
        deopt(callee, state, errMsgs.NON_CONSTANT);
      }
    }

    if (callee.isMemberExpression()) {
      const object = callee.get('object');
      const property = callee.get('property');

      // Math.min(1, 2)
      if (object.isIdentifier() && property.isIdentifier()) {
        if (
          isValidCallee(object.node.name) &&
          !isInvalidMethod(property.node.name)
        ) {
          context = global[object.node.name];
          // @ts-expect-error property may not exist in context object
          func = context[property.node.name];
        } else if (
          state.functions.memberExpressions[object.node.name] &&
          state.functions.memberExpressions[object.node.name][
            property.node.name
          ]
        ) {
          context = state.functions.memberExpressions[object.node.name];
          func = context[property.node.name];
        }
      }

      if (
        object.isIdentifier() &&
        property.isStringLiteral() &&
        state.functions.memberExpressions[object.node.name] &&
        state.functions.memberExpressions[object.node.name][property.node.value]
      ) {
        context = state.functions.memberExpressions[object.node.name];
        func = context[property.node.value];
      }

      // "abc".charCodeAt(4)
      if (
        (object.isStringLiteral() || object.isNumericLiteral()) &&
        property.isIdentifier()
      ) {
        const val: number | string = object.node.value;
        func = (val as $FlowFixMe)[property.node.name];
        if (typeof val === 'string') {
          context = object.node.value;
        }
      }

      if (func == null) {
        const parsedObj = evaluate(
          object,
          state.traversalState,
          state.functions,
        );
        if (parsedObj.confident && property.isIdentifier()) {
          func = parsedObj.value[property.node.name];
          context = parsedObj.value;
        }
        if (parsedObj.confident && property.isStringLiteral()) {
          func = parsedObj.value[property.node.value];
          context = parsedObj.value;
        }
      }
    }

    if (func) {
      if (func.takesPath) {
        const args = path.get('arguments');
        return func.fn(...args);
      } else {
        const args = path
          .get('arguments')
          .map((arg: NodePath<t.CallExpression['arguments'][number]>) =>
            evaluateCached(arg, state),
          );
        if (!state.confident) return;

        if (func.fn) {
          return func.fn.apply(context, args);
        } else {
          return func.apply(context, args);
        }
      }
    }
  }

  deopt(path, state, errMsgs.UNSUPPORTED_EXPRESSION(path.node.type));
}

function evaluateQuasis(
  path: NodePath<t.TaggedTemplateExpression | t.TemplateLiteral>,
  quasis: Array<any>,
  state: State,
  raw: boolean = false,
) {
  let str = '';

  let i = 0;
  const exprs: $ReadOnlyArray<NodePath<>> = path.isTemplateLiteral()
    ? path.get('expressions')
    : path.isTaggedTemplateExpression()
      ? path.get('quasi').get('expressions')
      : [];

  // const exprs: Array<NodePath<t.Node>> = path.isTemplateLiteral()
  //   ? path.get('expressions')
  //   : (path as NodePath<t.TaggedTemplateExpression>)
  //       .get('quasi')
  //       .get('expressions');

  for (const elem of quasis) {
    // not confident, evaluated an expression we don't like
    if (!state.confident) break;

    // add on element
    str += raw ? elem.value.raw : elem.value.cooked;

    // add on interpolated expression if it's present
    const expr = exprs[i++];
    if (expr) str += String(evaluateCached(expr, state));
  }

  if (!state.confident) return;
  return str;
}

/**
 * Walk the input `node` and statically evaluate it.
 *
 * Returns an object in the form `{ confident, value, deopt }`. `confident`
 * indicates whether or not we had to drop out of evaluating the expression
 * because of hitting an unknown node that we couldn't confidently find the
 * value of, in which case `deopt` is the path of said node.
 *
 * Example:
 *
 *   evaluate(parse("5 + 5")) // { confident: true, value: 10 }
 *   evaluate(parse("!true")) // { confident: true, value: false }
 *   evaluate(parse("foo + foo")) // { confident: false, value: undefined, deopt: NodePath }
 *
 */

// Track all the imports added to the file, so we don't add them multiple times
// Instead of polluting StateManager with this, we use a WeakMap
// so the logic can be localized this file.
const importsForState = new WeakMap<StateManager, Set<string>>();

export function evaluate(
  path: NodePath<>,
  traversalState: StateManager,
  functions: FunctionConfig = {
    identifiers: {},
    memberExpressions: {},
    disableImports: false,
  },
  seen: Map<t.Node, Result> = new Map(),
): $ReadOnly<{
  confident: boolean,
  value: any,
  deopt?: null | NodePath<>,
  reason?: string,
}> {
  const addedImports = importsForState.get(traversalState) ?? new Set();
  importsForState.set(traversalState, addedImports);

  const state: State = {
    confident: true,
    deoptPath: null,
    seen,
    addedImports,
    functions,
    traversalState,
  };
  let value = evaluateCached(path, state);
  if (!state.confident) value = undefined;

  return {
    confident: state.confident,
    deopt: state.deoptPath,
    reason: state.deoptReason,
    value: value,
  };
}
