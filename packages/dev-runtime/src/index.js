/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { __monkey_patch__ } from '@stylexjs/stylex';
import { styleSheet } from '@stylexjs/stylex/lib/StyleXSheet';
import type {
  OverridesForTokenType,
  VarGroup,
  TokensFromVarGroup,
  Theme,
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

export default function inject({
  insert = defaultInsert,
  ...config
}: RuntimeOptions): void {
  __monkey_patch__('create', getStyleXCreate({ ...config, insert }));

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
  };
  __monkey_patch__('types', (types: $FlowFixMe));

  const defineVars = <
    DefaultTokens: {
      +[string]: string | { +default: string, +[string]: string },
    },
    ID: string = string,
  >(
    variables: DefaultTokens,
    { themeName }: { themeName: string } = {
      themeName: themeNameUUID(),
    },
  ): VarGroup<DefaultTokens, ID> => {
    const [cssVarsObject, { css }] = shared.defineVars(variables, {
      themeName,
    });
    insert(cssVarsObject.__themeName__, css, 0);
    // $FlowFixMe
    return cssVarsObject;
  };
  __monkey_patch__('defineVars', defineVars);

  const createTheme: $FlowFixMe = <
    BaseTokens: VarGroup<{ +[string]: mixed }>,
    ID: string = string,
  >(
    variablesTheme: BaseTokens,
    variablesOverride: OverridesForTokenType<TokensFromVarGroup<$FlowFixMe>>,
  ): Theme<BaseTokens, ID> => {
    const [js, css] = shared.createTheme(
      (variablesTheme: $FlowFixMe),
      variablesOverride,
    );
    const styleKey = js[String(variablesTheme.__themeName__)];
    insert(styleKey, css[styleKey].ltr, css[styleKey].priority);
    // $FlowFixMe[incompatible-return]
    return js;
  };

  __monkey_patch__('createTheme', createTheme);

  const keyframes = (frames: $ReadOnly<{ [name: string]: mixed, ... }>) => {
    const [animationName, { ltr, priority, rtl }] = shared.keyframes(
      (frames: $FlowFixMe),
      config,
    );
    insert(animationName, ltr, priority, rtl);
    return animationName;
  };
  __monkey_patch__('keyframes', keyframes);

  const firstThatWorks = shared.firstThatWorks;
  __monkey_patch__('firstThatWorks', firstThatWorks);

  const stylexInclude = (includedStyles: $FlowFixMe) => {
    return shared.include({ node: includedStyles });
  };

  __monkey_patch__('include', (stylexInclude: $FlowFixMe));
}
