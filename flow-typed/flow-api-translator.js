/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable ft-flow/no-types-missing-file-annotation */
/* eslint-disable no-unused-vars */

declare module 'flow-api-translator' {
  declare export function translateFlowToFlowDef(
    code: string,
    prettierOptions?: { ... },
  ): Promise<string>;

  declare export function translateFlowToTSDef(
    code: string,
    prettierOptions?: { ... },
  ): Promise<string>;

  declare export function translateFlowDefToTSDef(
    code: string,
    prettierOptions?: { ... },
  ): Promise<string>;

  declare export function translateFlowToJS(
    code: string,
    prettierOptions?: { ... },
  ): Promise<string>;

  declare type MapperOptions = $ReadOnly<{
    sourceMapper: ({ module: string }) => string,
  }>;

  declare export function translateFlowImportsTo(
    code: string,
    options: ?{ ... },
    opts: MapperOptions,
  ): Promise<string>;
}
