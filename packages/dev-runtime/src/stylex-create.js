/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {
  MapNamespaces,
  Stylex$Create,
} from '@stylexjs/stylex/lib/StyleXTypes';
import type { FlatCompiledStyles } from '@stylexjs/shared/lib/common-types';

import { create, IncludedStyles, utils } from '@stylexjs/shared';

import type { RuntimeOptions } from './types';
import type { RawStyles } from '@stylexjs/shared/lib/common-types';
import transformValue from '@stylexjs/shared/lib/transform-value';

type RuntimeOptionsWithInsert = {
  ...$Exact<RuntimeOptions>,
  insert: $NonMaybeType<RuntimeOptions['insert']>,
  ...
};

type NestedObj = { +[string]: string | NestedObj };

function compareObjs<Obj: NestedObj>(
  a: Obj,
  b: Obj,
  vars: { [string]: Array<string> },
  path: $ReadOnlyArray<string> = [],
): Obj {
  const result: Partial<Obj> = ({}: $FlowFixMe);
  for (const origKey in a) {
    let key = origKey;
    if (origKey.startsWith('var(') && origKey.endsWith(')')) {
      key = origKey.slice(4, -1);
    }
    const val1 = a[origKey];
    const val2 = b[origKey];
    const keyPath = [...path, key];
    if (typeof val1 === 'object' && !Array.isArray(val1)) {
      result[key] = compareObjs(val1, (val2: $FlowFixMe), vars, keyPath);
    } else if (val1 === val2) {
      result[key] = val1;
    } else {
      const varName =
        '--' +
        (keyPath.length > 1 ? utils.hash(keyPath.join('_')) : keyPath[0]);
      vars[varName] = keyPath;
      // Falling back to `revert` so that if the variable is not defined,
      // the browser will fall back to the original value. The same result as
      // setting it to `null`.
      result[key] = `var(${varName}, revert)`;
    }
  }
  return result;
}

const objGet = (obj: $FlowFixMe, path: Array<string>): $FlowFixMe => {
  if (path.length === 1) {
    return obj[path[0]];
  }
  return objGet(obj[path[0]], path.slice(1));
};

function splitStaticObj<
  Args: $ReadOnlyArray<number>,
  Obj: { +[string]: mixed },
>(
  fn: (...args: Args) => Obj,
  options: RuntimeOptions,
): [Obj, (...args: Args) => { [string]: string | number }] {
  const args1 = Array.from({ length: fn.length }, () => 0);
  const args2 = Array.from({ length: fn.length }, () => 1);
  // $FlowExpectedError[incompatible-call]
  const a = fn(...args1);
  // $FlowExpectedError[incompatible-call]
  const b = fn(...args2);

  const varPaths: { [string]: Array<string> } = {};
  const staticObj = compareObjs((a: $FlowFixMe), (b: $FlowFixMe), varPaths);

  const inlineStylesFn = (...args: Args): { [string]: string | number } => {
    const obj = fn(...args);
    const styles: { [string]: string | number } = {};
    for (const origKey in varPaths) {
      let key = origKey;
      if (origKey.startsWith('var(') && origKey.endsWith(')')) {
        key = origKey.slice(4, -1);
      }
      const path = varPaths[origKey];
      const value = objGet(obj, path);
      const styleProp =
        path.find((prop) => !prop.startsWith(':') && !prop.startsWith('@')) ??
        path[0];
      styles[key] =
        value != null ? transformValue(styleProp, value, options) : 'initial';
    }
    return styles;
  };
  return [staticObj, inlineStylesFn];
}

type CompiledNamespaces<S: { ... }> = {
  +[Key in keyof S]: S[Key] extends { +[string]: mixed }
    ? FlatCompiledStyles
    : (...args: any) => [FlatCompiledStyles, { +[string]: string | number }],
};

function createWithFns<S: { ... }>(
  styles: S,
  { insert, ...config }: RuntimeOptionsWithInsert,
): CompiledNamespaces<S> {
  const stylesWithoutFns: { [string]: RawStyles } = {};
  const stylesWithFns: {
    [string]: (...args: any) => { +[string]: string | number },
  } = {};
  for (const origKey in styles) {
    let key = origKey;
    if (origKey.startsWith('var(') && origKey.endsWith(')')) {
      key = origKey.slice(4, -1);
    }
    const value = styles[origKey];
    if (typeof value === 'function') {
      const [staticObj, inlineStylesFn] = splitStaticObj(value, config);
      stylesWithoutFns[key] = staticObj;
      stylesWithFns[key] = inlineStylesFn;
    } else {
      stylesWithoutFns[key] = value;
    }
  }

  const [compiledStyles, injectedStyles] = create(stylesWithoutFns, config);
  for (const key in injectedStyles) {
    const { ltr, priority, rtl } = injectedStyles[key];
    insert(key, ltr, priority, rtl);
  }
  spreadStyles(compiledStyles);

  const temp: {
    +[string]:
      | FlatCompiledStyles
      | ((
          ...args: any
        ) => [FlatCompiledStyles, { +[string]: string | number }]),
  } = compiledStyles;

  const finalStyles: {
    [string]:
      | FlatCompiledStyles
      | ((
          ...args: any
        ) => [FlatCompiledStyles, { +[string]: string | number }]),
  } = { ...temp };
  // Now we put the functions back in.
  for (const key in stylesWithFns) {
    // $FlowFixMe
    finalStyles[key] = (...args) => [temp[key], stylesWithFns[key](...args)];
  }
  return (finalStyles: $FlowFixMe);
}

function spreadStyles<S: { [string]: FlatCompiledStyles }>(
  compiledStyles: S,
): S {
  for (const key in compiledStyles) {
    const styleObj = compiledStyles[key];
    const replacement: { ...FlatCompiledStyles } = { $$css: true };
    let useReplacement = false;
    for (const prop in styleObj) {
      const value = styleObj[prop];
      if (value instanceof IncludedStyles) {
        useReplacement = true;
        Object.assign(replacement, value.astNode);
      } else {
        replacement[prop] = value;
      }
    }
    if (useReplacement) {
      compiledStyles[key] = replacement;
    }
  }
  return compiledStyles;
}

export default function getStyleXCreate(
  config: RuntimeOptionsWithInsert,
): Stylex$Create {
  const stylexCreate: Stylex$Create = <S: { ... }>(
    styles: S,
  ): MapNamespaces<S> => {
    return createWithFns(styles, config);
  };

  return stylexCreate;
}
