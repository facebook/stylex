/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { NodePath } from '@babel/traverse';
import type * as t from '@babel/types';
import type { StyleXOptions } from '@stylexjs/shared';

export interface StateManager {
  options: StyleXOptions;
  inlineCSSImports?: Map<string, string>;
  registerStyles: (
    styles: Array<[string, object, number]>,
    path: NodePath<t.Node>,
  ) => void;
}

export interface ASTHelpers {
  convertObjectToAST: (obj: object) => t.Expression;
}

export interface UtilityStylesVisitor {
  MemberExpression: (path: NodePath<t.MemberExpression>) => void;
  CallExpression: (path: NodePath<t.CallExpression>) => void;
}

/**
 * Creates a visitor that transforms utility style expressions like:
 * - x.display.flex -> { display: 'className', $$css: true }
 * - x.color(myVar) -> [{ color: 'className', $$css: true }, { style: { '--x-color': myVar } }]
 *
 * This visitor should run BEFORE the stylex.props visitor.
 */
export function createUtilityStylesVisitor(
  state: StateManager,
  helpers: ASTHelpers,
): UtilityStylesVisitor;

export function isUtilityStylesIdentifier(
  ident: t.Identifier,
  state: StateManager,
  path: NodePath<t.Node>,
): boolean;

export function getStaticStyleFromPath(
  path: NodePath<t.MemberExpression>,
  state: StateManager,
): { property: string; value: string | number } | null;

export function getDynamicStyleFromPath(
  path: NodePath<t.CallExpression>,
  state: StateManager,
): { property: string; value: t.Expression } | null;
