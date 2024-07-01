/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

type Rule = [string, { ltr: string, rtl?: string | null }, number];

export function ruleToCSSDataURI([_, { ltr, rtl }, priority]: Rule): string {
  const ltrLayer = `@layer __stylex__ltr { ${ltr} }`;
  const rtlLayer = rtl != null ? `@layer __stylex__rtl { ${rtl} }` : '';
  const css = `@layer __stylex__${priority} {  ${ltrLayer} ${rtlLayer} }`;

  return `data:text/css;charset=utf-8,${encodeURIComponent(css)}`;
}
