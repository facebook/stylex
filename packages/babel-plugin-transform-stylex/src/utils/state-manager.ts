/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow strict
 */

import type { PluginPass } from '@babel/core';
import type { NodePath } from '@babel/traverse';
import type { StyleRule } from '@stylexjs/shared';
import type { CompiledNamespaces } from '@stylexjs/shared';

export default class StateManager {
  readonly _state: PluginPass;

  // Imports
  readonly stylexImport: Set<string> = new Set(['stylex']);
  readonly stylexCreateImport: Set<string> = new Set();
  readonly stylexKeyframesImport: Set<string> = new Set();

  // `stylex.create` calls
  readonly styleMap: Map<string, CompiledNamespaces> = new Map();
  readonly styleVars: Map<string, NodePath> = new Map();

  // resuls of `stylex.create` calls that should be kept
  readonly styleVarsToKeep: Set<[string, null | string]> = new Set();

  constructor(state: PluginPass) {
    this._state = state;
    (state.file.metadata as any).stylex = [];
  }

  get options(): { [key: string]: any } {
    this._state.opts = this._state.opts || {};
    return this._state.opts;
  }

  get metadata(): { [key: string]: any } {
    return this._state.file.metadata;
  }

  get stylexSheetName(): string | undefined {
    return this.options.stylexSheetName ?? undefined;
  }

  get isDev(): boolean {
    return !!this.options.dev;
  }

  get isTest(): boolean {
    return !!this.options.test;
  }

  get filename(): string | undefined {
    return this._state.filename;
  }

  get cssVars(): any {
    return this.options.definedStylexCSSVariables;
  }

  addStyle(style: [string, { ltr: string; rtl?: string }, number]): void {
    this.metadata.stylex.push(style);
  }

  markComposedNamespace(memberExpression: [string, null | string]): void {
    this.styleVarsToKeep.add(memberExpression);
  }
}
