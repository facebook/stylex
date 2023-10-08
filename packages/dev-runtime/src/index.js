/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import stylex, { types } from '@stylexjs/stylex';
import { styleSheet } from '@stylexjs/stylex/lib/StyleXSheet';
import type {
  MapNamespace,
  OverridesForTokenType,
  Theme,
  TokensFromTheme,
  Variant,
} from '@stylexjs/stylex/lib/StyleXTypes';
import * as shared from '@stylexjs/shared';
import type { RuntimeOptions } from './types';
import getStyleXCreate from './stylex-create';

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
  stylex.create = getStyleXCreate({ ...config, insert });

  (types: $FlowFixMe).angle = shared.types.angle;
  (types: $FlowFixMe).color = shared.types.color;
  (types: $FlowFixMe).url = shared.types.url;
  (types: $FlowFixMe).image = shared.types.image;
  (types: $FlowFixMe).integer = shared.types.integer;
  (types: $FlowFixMe).lengthPercentage = shared.types.lengthPercentage;
  (types: $FlowFixMe).length = shared.types.length;
  (types: $FlowFixMe).percentage = shared.types.percentage;
  (types: $FlowFixMe).number = shared.types.number;
  (types: $FlowFixMe).resolution = shared.types.resolution;
  (types: $FlowFixMe).time = shared.types.time;
  (types: $FlowFixMe).transformFunction = shared.types.transformFunction;
  (types: $FlowFixMe).transformList = shared.types.transformList;

  stylex.unstable_createVars = <
    DefaultTokens: {
      +[string]: string | { +default: string, +[string]: string },
    },
    ID: string = string,
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
    const [js, css] = shared.overrideVars(
      (variablesTheme: $FlowFixMe),
      variablesOverride,
    );
    const styleKey = js[String(variablesTheme.__themeName__)];
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
