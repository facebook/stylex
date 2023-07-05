/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
import type * as t from '@babel/types';
import fs from 'fs';
import StateManager from './state-manager';
import { utils } from '@stylexjs/shared';

// This file contains Babels metainterpreter that can evaluate static code.

const VALID_CALLEES = ['String', 'Number', 'Math'] as const;
const INVALID_METHODS = ['random'] as const;

function isValidCallee(val: string): val is typeof VALID_CALLEES[number] {
  return (VALID_CALLEES as ReadonlyArray<string>).includes(val);
}

function isInvalidMethod(val: string): val is typeof INVALID_METHODS[number] {
  return (INVALID_METHODS as ReadonlyArray<string>).includes(val);
}

export type FunctionConfig = {
  identifiers: {
    [fnName: string]: {
      fn: (...args: any[]) => any;
      takesPath?: boolean;
    };
  };
  memberExpressions: {
    [key: string]: {
      [memberName: string]: {
        fn: (...args: any[]) => any;
        takesPath?: boolean;
      };
    };
  };
};

type State = {
  confident: boolean;
  deoptPath: NodePath | null;
  seen: Map<t.Node, Result>;
  functions: FunctionConfig;
  traversalState: StateManager;
};

type Result = {
  resolved: boolean;
  value?: any;
};
/**
 * Deopts the evaluation
 */
function deopt(path: NodePath, state: State) {
  if (!state.confident) return;
  state.deoptPath = path;
  state.confident = false;
}

function evaluateImportedFile(
  filePath: string,
  namedExport: string,
  state: State
): any {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  // It's safe to use `.babelrc` here because we're only
  // interested in the JS runtime, and not the CSS.
  // TODO: in environments where `.babelrc` is not available,
  // we need to find a way to decide whether to use Flow or TS syntax extensions.
  const ast = parseSync(fileContents, { babelrc: true });
  if (!ast) {
    state.confident = false;
    return;
  }
  let result: any;
  traverse(ast, {
    ExportNamedDeclaration(path) {
      const declaration = path.get('declaration');

      if (declaration.isVariableDeclaration()) {
        const decls = declaration.get('declarations');

        const finder = (decl: NodePath<t.Node>) => {
          if (decl.isVariableDeclarator()) {
            const id = decl.get('id');
            const init = decl.get('init');
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
    state.confident = false;
    return;
  }
}

function evaluateThemeRef(
  fileName: string,
  exportName: string,
  state: State
): { [key: string]: string } {
  const resolveKey = (key: string) => {
    let strToHash =
      key === '__themeName__'
        ? utils.genFileBasedIdentifier({ fileName, exportName })
        : utils.genFileBasedIdentifier({ fileName, exportName, key });

    const varName =
      state.traversalState.options.classNamePrefix + utils.hash(strToHash);
    return `var(--${varName})`;
  };

  // A JS proxy that uses the key to generate a string value using the `resolveKey` function
  const proxy = new Proxy(
    {},
    {
      get(_, key: string) {
        return resolveKey(key as string);
      },
      set(_, key: string, value: unknown) {
        throw new Error(
          `Cannot set value ${value} to key ${key} in theme ${fileName}`
        );
      },
    }
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
function evaluateCached(path: NodePath, state: State): any {
  const { node } = path;
  const { seen } = state;

  if (seen.has(node)) {
    const existing: Result = seen.get(node) as any;
    if (existing.resolved) {
      return existing.value;
    } else {
      deopt(path, state);
      return;
    }
  } else {
    const item: Result = { resolved: false };
    seen.set(node, item);

    const val = _evaluate(path, state);
    if (state.confident) {
      item.resolved = true;
      item.value = val;
    }
    return val;
  }
}

function _evaluate(path: NodePath, state: State): any {
  if (!state.confident) return;

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

  if (
    path.isTaggedTemplateExpression() &&
    path.get('tag').isMemberExpression()
  ) {
    const object = path.get('tag.object') as NodePath;
    const {
      // @ts-expect-error todo(flow->ts): possible bug, object is can be any expression and so name might be undefined
      node: { name },
    } = object;
    const property = path.get('tag.property') as NodePath;

    if (
      object.isIdentifier() &&
      name === 'String' &&
      // todo(flow->ts): was changed from getBinding(name, true)
      //  should this be hasBinding(name, true) as the binding is never used later?
      !path.scope.getBinding(name) &&
      property.isIdentifier() &&
      property.node.name === 'raw'
    ) {
      return evaluateQuasis(path, path.node.quasi.quasis, state, true);
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
      return deopt(propPath, state);
    }

    return object[property];
  }

  if (path.isReferencedIdentifier()) {
    const binding: Binding = path.scope.getBinding(path.node.name) as any;

    if (
      binding &&
      binding.path.isImportSpecifier() &&
      !binding.path.isImportDefaultSpecifier()
    ) {
      // const localName = binding.path.node.local.name;
      const imported: t.Identifier | t.StringLiteral =
        binding.path.node.imported;
      const importedName =
        imported.type === 'Identifier' ? imported.name : imported.value;
      const importPath = binding.path.parentPath;
      if (importPath.isImportDeclaration()) {
        const absPath = state.traversalState.importPathResolver(
          importPath.node.source.value
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
          return returnValue;
        } else {
          deopt(binding.path, state);
        }
      }
    }

    if (binding && binding.constantViolations.length > 0) {
      return deopt(binding.path, state);
    }

    if (binding && (path.node as any).start < (binding.path.node as any).end) {
      return deopt(binding.path, state);
    }

    if ((binding as any)?.hasValue) {
      return (binding as any).value;
    } else {
      if (path.node.name === 'undefined') {
        return binding ? deopt(binding.path, state) : undefined;
      } else if (path.node.name === 'Infinity') {
        return binding ? deopt(binding.path, state) : Infinity;
      } else if (path.node.name === 'NaN') {
        return binding ? deopt(binding.path, state) : NaN;
      }

      const resolved = (path as any).resolve();
      if (resolved === path) {
        return deopt(path, state);
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
    }
  }

  if (path.isArrayExpression()) {
    const arr = [];
    const elems: Array<NodePath> = path.get('elements') as any;
    for (const elem of elems) {
      const elemValue = evaluate(elem, state.traversalState, state.functions);

      if (elemValue.confident) {
        arr.push(elemValue.value);
      } else {
        return deopt((elemValue as any).deopt, state);
      }
    }
    return arr;
  }

  if (path.isObjectExpression()) {
    const obj = {};
    const props = path.get('properties');
    for (const prop of props) {
      if (prop.isObjectMethod()) {
        return deopt(prop, state);
      }
      if (prop.isSpreadElement()) {
        const spreadExpression = evaluateCached(prop.get('argument'), state);
        if (!state.confident) {
          return deopt(prop, state);
        }
        Object.assign(obj, spreadExpression);
        continue;
      }
      const keyPath: any = prop.get('key');
      let key = keyPath;
      if ((prop.node as any).computed) {
        key = evaluate(key, state.traversalState, state.functions);
        if (!key.confident) {
          return deopt(key.deopt, state);
        }
        key = key.value;
      } else if (key.isIdentifier()) {
        key = key.node.name;
      } else {
        key = key.node.value;
      }
      // todo(flow->ts): remove typecast
      const valuePath = prop.get('value') as NodePath;
      let value = evaluate(valuePath, state.traversalState, state.functions);
      if (!value.confident) {
        return deopt((value as any).deopt, state);
      }
      value = value.value;
      // @ts-expect-error
      obj[key] = value;
    }
    return obj;
  }

  if (path.isLogicalExpression()) {
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
        return left != right;
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
      if (object.isLiteral() && property.isIdentifier()) {
        // @ts-expect-error todo(flow->ts): consider checking ast node type instead of value type (StringLiteral and NumberLiteral)
        const type = typeof object.node.value;
        if (type === 'string' || type === 'number') {
          // @ts-expect-error todo(flow->ts): consider checking ast node type instead of value type
          context = object.node.value;
          func = context[property.node.name];
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
          .map((arg) => evaluateCached(arg, state));
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
  raw = false
) {
  let str = '';

  let i = 0;
  const exprs: Array<NodePath<t.Node>> = path.get('expressions') as any;

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

export function evaluate(
  path: NodePath,
  traversalState: StateManager,
  functions: FunctionConfig = { identifiers: {}, memberExpressions: {} }
): {
  confident: boolean;
  value: any;
  deopt?: null | NodePath;
} {
  const state: State = {
    confident: true,
    deoptPath: null,
    seen: new Map(),
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
