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

import { parseSync } from '@babel/core';
import traverse from '@babel/traverse';
import type { NodePath, Binding } from '@babel/traverse';
import * as t from '@babel/types';
import StateManager from './state-manager';
import { utils } from '@stylexjs/shared';
import * as pathUtils from '../babel-path-utils';

// This file contains Babels metainterpreter that can evaluate static code.

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
};

type State = {
  confident: boolean,
  deoptPath: NodePath<> | null,
  seen: Map<t.Node, Result>,
  addedImports: Set<string>,
  functions: FunctionConfig,
  traversalState: StateManager,
};

type Result = {
  resolved: boolean,
  value?: any,
};
/**
 * Deopts the evaluation
 */
function deopt(path: NodePath<>, state: State) {
  if (!state.confident) return;
  state.deoptPath = path;
  state.confident = false;
}

function evaluateImportedFile(
  filePath: string,
  namedExport: string,
  state: State,
): any {
  const fs = require('fs');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  // It's safe to use `.babelrc` here because we're only
  // interested in the JS runtime, and not the CSS.
  // TODO: in environments where `.babelrc` is not available,
  // we need to find a way to decide whether to use Flow or TS syntax extensions.
  const ast: null | t.File | { +errors: mixed } = parseSync(fileContents, {
    babelrc: true,
  });
  if (!ast || ast.errors || !t.isNode(ast)) {
    state.confident = false;
    return;
  }

  const astNode: t.Node = ast as $FlowFixMe;

  let result: any;

  traverse(astNode, {
    ExportNamedDeclaration(path: NodePath<t.ExportNamedDeclaration>) {
      const declaration = path.get('declaration');

      if (pathUtils.isVariableDeclaration(declaration)) {
        const decls = declaration.get('declarations');

        const finder = (decl: NodePath<t.Node>) => {
          if (pathUtils.isVariableDeclarator(decl)) {
            const id = decl.get('id');
            const init: ?NodePath<t.Expression> = (
              decl as NodePath<t.VariableDeclarator>
            ).get('init');
            if (
              pathUtils.isIdentifier(id) &&
              id.node.name === namedExport &&
              init != null &&
              pathUtils.isExpression(init)
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
    state.confident = false;
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
      key === '__themeName__'
        ? utils.genFileBasedIdentifier({ fileName, exportName })
        : utils.genFileBasedIdentifier({ fileName, exportName, key });

    const varName =
      state.traversalState.options.classNamePrefix + utils.hash(strToHash);

    if (key === '__themeName__') {
      return varName;
    }
    return `var(--${varName})`;
  };

  // A JS proxy that uses the key to generate a string value using the `resolveKey` function
  const proxy = new Proxy(
    {},
    {
      get(_, key: string) {
        return resolveKey(key);
      },
      set(_, key: string, value: string) {
        throw new Error(
          `Cannot set value ${value} to key ${key} in theme ${fileName}`,
        );
      },
    },
  );

  return proxy;
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
      deopt(path, state);
      return;
    }
  } else {
    const item: Result = { resolved: false };
    seen.set(node, item);

    if (node == null) {
      deopt(path, state);
      return;
    }

    const val = _evaluate(path, state);
    if (state.confident) {
      item.resolved = true;
      item.value = val;
    }
    return val;
  }
}

function _evaluate(path: NodePath<>, state: State): any {
  if (!state.confident) return;

  if (pathUtils.isArrowFunctionExpression(path)) {
    const body = path.get('body');
    const params: $ReadOnlyArray<
      NodePath<t.Identifier | t.Pattern | t.RestElement>,
    > = path.get('params');
    const identParams = params
      .filter(
        (
          param: NodePath<t.Identifier | t.Pattern | t.RestElement>,
        ): param is NodePath<t.Identifier> => pathUtils.isIdentifier(param),
      )
      .map((paramPath) => paramPath.node.name);
    if (pathUtils.isExpression(body) && identParams.length === params.length) {
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

  if (pathUtils.isIdentifier(path)) {
    const name: string = path.node.name;
    if (Object.keys(state.functions?.identifiers ?? {}).includes(name)) {
      return state.functions.identifiers[name];
    }
  }

  if (pathUtils.isTSAsExpression(path)) {
    const expr: NodePath<t.Expression> = path.get('expression');
    return evaluateCached(expr, state);
  }

  if (path.node.type === 'TSSatisfiesExpression') {
    const expr: NodePath<t.Expression> = (path as $FlowFixMe).get('expression');
    return evaluateCached(expr, state);
  }

  if (pathUtils.isSequenceExpression(path)) {
    const exprs = path.get('expressions');
    return evaluateCached(exprs[exprs.length - 1], state);
  }

  if (
    pathUtils.isStringLiteral(path) ||
    pathUtils.isNumericLiteral(path) ||
    pathUtils.isBooleanLiteral(path)
  ) {
    return path.node.value;
  }

  if (pathUtils.isNullLiteral(path)) {
    return null;
  }

  if (pathUtils.isTemplateLiteral(path)) {
    return evaluateQuasis(path, path.node.quasis, state);
  }

  const maybeTag =
    pathUtils.isTaggedTemplateExpression(path) && path.get('tag');
  if (
    pathUtils.isTaggedTemplateExpression(path) &&
    maybeTag &&
    pathUtils.isMemberExpression(maybeTag)
  ) {
    const tag: NodePath<t.MemberExpression> = maybeTag;
    const object: NodePath<t.Expression | t.Super> = tag.get('object');

    if (pathUtils.isIdentifier(object)) {
      const name = object.node.name;
      const property: NodePath<> = tag.get('property');

      if (
        name === 'String' &&
        !path.scope.hasBinding(name) &&
        pathUtils.isIdentifier(property) &&
        property.node.name === 'raw'
      ) {
        return evaluateQuasis(path, path.node.quasi.quasis, state, true);
      }
    }
  }

  if (pathUtils.isConditionalExpression(path)) {
    const testResult = evaluateCached(path.get('test'), state);
    if (!state.confident) return;
    if (testResult) {
      return evaluateCached(path.get('consequent'), state);
    } else {
      return evaluateCached(path.get('alternate'), state);
    }
  }

  if (pathUtils.isExpressionWrapper(path)) {
    // TypeCastExpression, ExpressionStatement etc
    return evaluateCached(path.get('expression'), state);
  }

  // "foo".length
  if (
    pathUtils.isMemberExpression(path) &&
    !pathUtils.isCallExpression(path.parentPath, { callee: path.node })
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
    } else if (pathUtils.isIdentifier(propPath)) {
      property = propPath.node.name;
    } else if (pathUtils.isStringLiteral(propPath)) {
      property = propPath.node.value;
    } else {
      return deopt(propPath, state);
    }

    return object[property];
  }

  if (pathUtils.isReferencedIdentifier(path)) {
    const binding: ?Binding = path.scope?.getBinding(path.node.name);

    const bindingPath = binding?.path;
    if (
      binding &&
      bindingPath &&
      !pathUtils.isImportDefaultSpecifier(bindingPath) &&
      !pathUtils.isImportNamespaceSpecifier(bindingPath) &&
      pathUtils.isImportSpecifier(bindingPath)
    ) {
      const importSpecifierPath: NodePath<t.ImportSpecifier> = bindingPath;
      const importSpecifierNode: t.ImportSpecifier = importSpecifierPath.node;
      // const localName = binding.path.node.local.name;
      const imported: t.Identifier | t.StringLiteral =
        importSpecifierNode.imported;
      const importedName =
        imported.type === 'Identifier' ? imported.name : imported.value;
      const importPath = binding.path.parentPath;
      if (importPath && pathUtils.isImportDeclaration(importPath)) {
        const absPath = state.traversalState.importPathResolver(
          importPath.node.source.value,
        );
        if (!absPath) {
          return deopt(binding.path, state);
        }
        const [type, value] = absPath;

        const returnValue =
          type === 'themeNameRef'
            ? evaluateThemeRef(value, importedName, state)
            : evaluateImportedFile(value, importedName, state);
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
          deopt(binding.path, state);
        }
      }
    }

    if (binding && binding.constantViolations.length > 0) {
      return deopt(binding.path, state);
    }

    if (binding && path.node.start < binding.path.node.end) {
      return deopt(binding.path, state);
    }

    if (binding && binding.hasValue) {
      return binding.value;
    } else {
      if (path.node.name === 'undefined') {
        return binding ? deopt(binding.path, state) : undefined;
      } else if (path.node.name === 'Infinity') {
        return binding ? deopt(binding.path, state) : Infinity;
      } else if (path.node.name === 'NaN') {
        return binding ? deopt(binding.path, state) : NaN;
      }

      const resolved = (path as $FlowFixMe).resolve();
      if (resolved === path) {
        return deopt(path, state);
      } else {
        return evaluateCached(resolved, state);
      }
    }
  }

  if (pathUtils.isUnaryExpression(path, { prefix: true })) {
    if (path.node.operator === 'void') {
      // we don't need to evaluate the argument to know what this will return
      return undefined;
    }

    const argument = path.get('argument');
    if (
      path.node.operator === 'typeof' &&
      (pathUtils.isFunction(argument) || pathUtils.isClass(argument))
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
        return deopt(path, state);
    }
  }

  if (pathUtils.isArrayExpression(path)) {
    const arrPath: NodePath<t.ArrayExpression> = path;
    const arr = [];
    const elems: $ReadOnlyArray<NodePath<>> = arrPath.get('elements');
    for (const elem of elems) {
      const elemValue = evaluate(elem, state.traversalState, state.functions);

      if (elemValue.confident) {
        arr.push(elemValue.value);
      } else {
        elemValue.deopt && deopt(elemValue.deopt, state);
        return;
      }
    }
    return arr;
  }

  if (pathUtils.isObjectExpression(path)) {
    const obj: { [string]: mixed } = {};
    const props: $ReadOnlyArray<
      NodePath<t.ObjectMethod | t.ObjectProperty | t.SpreadElement>,
    > = path.get('properties');
    for (const prop of props) {
      if (pathUtils.isObjectMethod(prop)) {
        return deopt(prop, state);
      }
      if (pathUtils.isSpreadElement(prop)) {
        const spreadExpression = evaluateCached(prop.get('argument'), state);
        if (!state.confident) {
          return deopt(prop, state);
        }
        Object.assign(obj, spreadExpression);
        continue;
      }
      if (pathUtils.isObjectProperty(prop)) {
        const keyPath: NodePath<t.ObjectProperty['key']> = prop.get('key');
        let key: string | number | boolean;
        if ((prop.node as t.ObjectProperty).computed) {
          const {
            confident,
            deopt: resultDeopt,
            value,
          } = evaluate(keyPath, state.traversalState, state.functions);
          if (!confident) {
            resultDeopt && deopt(resultDeopt, state);
            return;
          }
          key = value;
        } else if (pathUtils.isIdentifier(keyPath)) {
          key = keyPath.node.name;
        } else {
          // TODO: This is'nt handling all possible types that `keyPath` could be
          key = (keyPath.node as $FlowFixMe).value;
        }
        // todo(flow->ts): remove typecast
        const valuePath: NodePath<> = prop.get('value');
        let value = evaluate(valuePath, state.traversalState, state.functions);
        if (!value.confident) {
          value.deopt && deopt(value.deopt, state);
          return;
        }
        value = value.value;
        obj[key] = value;
      }
    }
    return obj;
  }

  if (pathUtils.isLogicalExpression(path)) {
    // If we are confident that the left side of an && is false, or the left
    // side of an || is true, we can be confident about the entire expression
    const wasConfident = state.confident;
    const left = evaluateCached(path.get('left'), state);
    const leftConfident = state.confident;
    state.confident = wasConfident;
    const right = evaluateCached(path.get('right'), state);
    const rightConfident = state.confident;

    switch (path.node.operator) {
      case '||':
        // TODO consider having a "truthy type" that doesn't bail on
        // left uncertainty but can still evaluate to truthy.
        state.confident = leftConfident && (!!left || rightConfident);
        if (!state.confident) return;

        return left || right;
      case '&&':
        state.confident = leftConfident && (!left || rightConfident);
        if (!state.confident) return;

        return left && right;
      case '??':
        state.confident = leftConfident && !!(left ?? rightConfident);
        if (!state.confident) return;

        return left ?? right;
      default:
        path.node.operator as empty;
    }
  }

  if (pathUtils.isBinaryExpression(path)) {
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

  if (pathUtils.isCallExpression(path)) {
    const callee = path.get('callee');
    let context;
    let func;

    // Number(1);
    if (
      pathUtils.isIdentifier(callee) &&
      !path.scope.getBinding(callee.node.name) &&
      isValidCallee(callee.node.name)
    ) {
      func = global[callee.node.name];
    } else if (
      pathUtils.isIdentifier(callee) &&
      state.functions.identifiers[callee.node.name]
    ) {
      func = state.functions.identifiers[callee.node.name];
    }

    if (pathUtils.isMemberExpression(callee)) {
      const object = callee.get('object');
      const property = callee.get('property');

      // Math.min(1, 2)
      if (pathUtils.isIdentifier(object) && pathUtils.isIdentifier(property)) {
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
        pathUtils.isIdentifier(object) &&
        pathUtils.isStringLiteral(property) &&
        state.functions.memberExpressions[object.node.name] &&
        state.functions.memberExpressions[object.node.name][property.node.value]
      ) {
        context = state.functions.memberExpressions[object.node.name];
        func = context[property.node.value];
      }

      // "abc".charCodeAt(4)
      if (
        (pathUtils.isStringLiteral(object) ||
          pathUtils.isNumericLiteral(object)) &&
        pathUtils.isIdentifier(property)
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
        if (parsedObj.confident && pathUtils.isIdentifier(property)) {
          func = parsedObj.value[property.node.name];
          context = parsedObj.value;
        }
        if (parsedObj.confident && pathUtils.isStringLiteral(property)) {
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

  deopt(path, state);
}

function evaluateQuasis(
  path: NodePath<t.TaggedTemplateExpression | t.TemplateLiteral>,
  quasis: Array<any>,
  state: State,
  raw: boolean = false,
) {
  let str = '';

  let i = 0;
  const exprs: $ReadOnlyArray<NodePath<>> = pathUtils.isTemplateLiteral(path)
    ? path.get('expressions')
    : pathUtils.isTaggedTemplateExpression(path)
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
  functions: FunctionConfig = { identifiers: {}, memberExpressions: {} },
): $ReadOnly<{
  confident: boolean,
  value: any,
  deopt?: null | NodePath<>,
}> {
  const addedImports = importsForState.get(traversalState) ?? new Set();
  importsForState.set(traversalState, addedImports);

  const state: State = {
    confident: true,
    deoptPath: null,
    seen: new Map(),
    addedImports,
    functions,
    traversalState,
  };
  let value = evaluateCached(path, state);
  if (!state.confident) value = undefined;

  return {
    confident: state.confident,
    deopt: state.deoptPath,
    value: value,
  };
}
