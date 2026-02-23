/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export declare function createUtilityStylesVisitor(state: unknown): {
  MemberExpression(path: unknown): void;
  CallExpression(path: unknown): void;
};

export declare function isUtilityStylesIdentifier(
  ident: unknown,
  state: unknown,
  path: unknown,
): boolean;

export declare function getStaticStyleFromPath(
  path: unknown,
  state: unknown,
): { property: string; value: string | number } | null;

export declare function getDynamicStyleFromPath(
  path: unknown,
  state: unknown,
): { property: string; value: unknown } | null;
