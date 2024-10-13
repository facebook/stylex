/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import typeof { types as TStyleXTypes } from '@stylexjs/stylex';

import { props, attrs } from '@stylexjs/stylex';

import { styleSheet } from '@stylexjs/stylex/lib/StyleXSheet';
import type {
  OverridesForTokenType,
  VarGroup,
  TokensFromVarGroup,
  Theme,
  CompiledStyles,
  StyleXArray,
  InlineStyles,
  Stylex$Create,
  StyleX$DefineVars,
  StyleX$CreateTheme,
  Keyframes,
} from '@stylexjs/stylex/lib/StyleXTypes';
import * as shared from '@stylexjs/shared';
import type { RuntimeOptions } from './types';
import getStyleXCreate from './stylex-create';

const injectedVariableObjs = new Set<string>();

type ReturnType = {
  props: (
    this: ?mixed,
    ...styles: $ReadOnlyArray<
      StyleXArray<
        ?CompiledStyles | boolean | $ReadOnly<[CompiledStyles, InlineStyles]>,
      >,
    >
  ) => $ReadOnly<{
    className?: string,
    style?: $ReadOnly<{ [string]: string | number }>,
  }>,
  attrs: (
    ...styles: $ReadOnlyArray<
      StyleXArray<
        ?CompiledStyles | boolean | $ReadOnly<[CompiledStyles, InlineStyles]>,
      >,
    >
  ) => $ReadOnly<{
    class?: string,
    style?: string,
  }>,
  create: Stylex$Create,
  defineVars: StyleX$DefineVars,
  createTheme: StyleX$CreateTheme,
  types: TStyleXTypes,
  firstThatWorks: <T: string | number>(
    ...v: $ReadOnlyArray<T>
  ) => $ReadOnlyArray<T>,
  keyframes: (keyframes: Keyframes) => string,
};

const defaultInsert = (
  key: string,
  ltrRule: string,
  priority: number,
  rtlRule?: ?string,
): void => {
  if (priority === 0) {
    if (injectedVariableObjs.has(key)) {
      throw new Error('A VarGroup with this name already exists: ' + key);
    } else {
      injectedVariableObjs.add(key);
    }
  }
  styleSheet.insert(ltrRule, priority, rtlRule);
};

let themeNameCount = 0;
function themeNameUUID(): string {
  return `theme-${themeNameCount++}`;
}

// TODO: memoize the function to:
// return the same result if the some confirguration is passed in again
export default function inject({
  insert = defaultInsert,
  ...config
}: RuntimeOptions): ReturnType {
  const stylexCreate = getStyleXCreate({ ...config, insert });

  const types = {
    angle: shared.types.angle,
    color: shared.types.color,
    url: shared.types.url,
    image: shared.types.image,
    integer: shared.types.integer,
    lengthPercentage: shared.types.lengthPercentage,
    length: shared.types.length,
    percentage: shared.types.percentage,
    number: shared.types.number,
    resolution: shared.types.resolution,
    time: shared.types.time,
    transformFunction: shared.types.transformFunction,
    transformList: shared.types.transformList,
  } as $FlowFixMe;

  const defineVars: StyleX$DefineVars = (
    variables,
    { themeName = themeNameUUID(), ...overrideConfig } = {},
  ) => {
    const [cssVarsObject, injectedStyles] = shared.defineVars(
      variables as $FlowFixMe,
      {
        ...config,
        ...overrideConfig,
        themeName,
      },
    );

    for (const [key, { ltr, priority }] of Object.entries(injectedStyles)) {
      insert(key, ltr, priority);
    }

    // $FlowFixMe
    return cssVarsObject;
  };

  const createTheme: $FlowFixMe = <
    BaseTokens: VarGroup<{ +[string]: mixed }>,
    ID: string = string,
  >(
    variablesTheme: BaseTokens,
    variablesOverride: OverridesForTokenType<TokensFromVarGroup<$FlowFixMe>>,
  ): Theme<BaseTokens, ID> => {
    const [js, injectedStyles] = shared.createTheme(
      variablesTheme as $FlowFixMe,
      variablesOverride,
    );

    for (const [key, { ltr, priority }] of Object.entries(injectedStyles)) {
      insert(key, ltr, priority);
    }
    // $FlowFixMe[incompatible-return]
    return js;
  };

  const keyframes = (frames: $ReadOnly<{ [name: string]: mixed, ... }>) => {
    const [animationName, { ltr, priority, rtl }] = shared.keyframes(
      frames as $FlowFixMe,
      config,
    );
    insert(animationName, ltr, priority, rtl);
    return animationName;
  };

  const firstThatWorks = shared.firstThatWorks;

  return {
    props,
    attrs,
    create: stylexCreate,
    defineVars: defineVars,
    createTheme: createTheme,
    types: types as $FlowFixMe,
    firstThatWorks: firstThatWorks as $FlowFixMe,
    keyframes: keyframes,
  };
}
