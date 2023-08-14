/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import stylex from '@stylexjs/stylex';
import { styleSheet } from '@stylexjs/stylex/lib/StyleXSheet';
import type {
  MapNamespace,
  Theme,
  TokensFromTheme,
  Variant,
  OverridesForTokenType,
} from '@stylexjs/stylex/lib/StyleXTypes';
import * as shared from '@stylexjs/shared';
import type { StyleXOptions } from '@stylexjs/shared/lib/common-types';
import type { FlatCompiledStyles } from '../../shared/src/common-types';
import type {
  MapNamespaces,
  Stylex$Create,
} from '../../stylex/src/StyleXTypes';

type RuntimeOptions = {
  ...$Exact<StyleXOptions>,
  // This is mostly needed for just testing
  insert?: (
    key: string,
    ltrRule: string,
    priority: number,
    rtlRule?: ?string,
  ) => void,
  ...
};

const injectedVariableObjs = new Set<string>();

const defaultInsert = (
  key: string,
  ltrRule: string,
  priority: number,
  rtlRule?: ?string,
): void => {
  if (priority === 0) {
    if (injectedVariableObjs.has(key)) {
      throw new Error('A Theme with this name already exists: ' + key);
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

export default function inject({
  insert = defaultInsert,
  ...config
}: RuntimeOptions): void {
  const stylexCreate: Stylex$Create = <S: { ... }>(
    styles: S,
  ): $ReadOnly<$ObjMap<S, MapNamespaces>> => {
    const [compiledStyles, injectedStyles] = shared.create(
      (styles: $FlowFixMe),
      config,
    );
    for (const key in injectedStyles) {
      const { ltr, priority, rtl } = injectedStyles[key];
      insert(key, ltr, priority, rtl);
    }
    for (const key in compiledStyles) {
      const styleObj = compiledStyles[key];
      const replacement: { ...FlatCompiledStyles } = { $$css: true };
      let useReplacement = false;
      for (const prop in styleObj) {
        const value = styleObj[prop];
        if (value instanceof shared.IncludedStyles) {
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
  };

  stylex.create = stylexCreate;

  stylex.unstable_createVars = <
    +DefaultTokens: {
      +[string]: string | { default: string, +[string]: string },
    },
    +ID: string = string,
  >(
    variables: DefaultTokens,
    { themeName }: { themeName: string } = {
      themeName: themeNameUUID(),
    },
  ): Theme<DefaultTokens, ID> => {
    const [cssVarsObject, { css }] = shared.createVars(variables, {
      themeName,
    });
    insert(cssVarsObject.__themeName__, css, 0);
    // $FlowFixMe
    return cssVarsObject;
  };

  const overrideVars: $FlowFixMe = <
    BaseTokens: Theme<{ +[string]: mixed }>,
    ID: string = string,
  >(
    variablesTheme: BaseTokens,
    variablesOverride: OverridesForTokenType<TokensFromTheme<$FlowFixMe>>,
  ): Variant<BaseTokens, ID> => {
    const [js, css] = shared.overrideVars(variablesTheme, variablesOverride);
    const styleKey = js[variablesTheme.__themeName__];
    insert(styleKey, css[styleKey].ltr, css[styleKey].priority);
    // $FlowFixMe[incompatible-return]
    return js;
  };

  stylex.unstable_overrideVars = overrideVars;

  stylex.keyframes = (frames) => {
    const [animationName, { ltr, priority, rtl }] = shared.keyframes(
      (frames: $FlowFixMe),
      config,
    );
    insert(animationName, ltr, priority, rtl);
    return animationName;
  };

  stylex.firstThatWorks = shared.firstThatWorks;

  const stylexInclude = <TStyles: { +[string]: string | number }>(
    includedStyles: MapNamespace<TStyles>,
  ): TStyles => {
    return (shared.include({ node: includedStyles }): $FlowFixMe);
  };

  stylex.include = stylexInclude;
}
