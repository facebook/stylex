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
import type { MapNamespace } from '@stylexjs/stylex/lib/StyleXTypes';
import * as shared from '@stylexjs/shared';
import type { StyleXOptions } from '@stylexjs/shared/lib/common-types';

// function insert(
//   ltrRule: string,
//   priority: number,
//   rtlRule: ?string = null
// ): void {
//   insert(ltrRule, priority, rtlRule);
// }

type RuntimeOptions = {
  ...$Exact<StyleXOptions>,
  // This is mostly needed for just testing
  insert?: (
    key: string,
    ltrRule: string,
    priority: number,
    rtlRule?: ?string
  ) => void,
  ...
};

const defaultInsert = (
  key: string,
  ltrRule: string,
  priority: number,
  rtlRule?: ?string
): void => {
  styleSheet.insert(ltrRule, priority, rtlRule);
};

export default function inject({
  insert = defaultInsert,
  ...config
}: RuntimeOptions): void {
  const stylexCreate = <S: { ... }>(styles: S) => {
    const [compiledStyles, injectedStyles] = shared.create(
      (styles: $FlowFixMe),
      config
    );
    for (const key in injectedStyles) {
      const { ltr, priority, rtl } = injectedStyles[key];
      insert(key, ltr, priority, rtl);
    }
    for (const key in compiledStyles) {
      const styleObj = compiledStyles[key];
      const replacement = {};
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

  stylex.keyframes = (frames) => {
    const [animationName, { ltr, priority, rtl }] = shared.keyframes(
      (frames: $FlowFixMe),
      config
    );
    insert(animationName, ltr, priority, rtl);
    return animationName;
  };

  stylex.firstThatWorks = shared.firstThatWorks;

  const stylexInclude = <TStyles: { +[string]: string | number }>(
    includedStyles: MapNamespace<TStyles>
  ): TStyles => {
    return (shared.include({ node: includedStyles }): $FlowFixMe);
  };

  stylex.include = stylexInclude;
}
