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
import type {
  CompiledNamespaces,
  StyleXOptions as RuntimeOptions,
} from '@stylexjs/shared';
import { name } from '@stylexjs/stylex/package.json';

type StyleXOptions = RuntimeOptions & {
  importSources: Array<string>;
  genConditionalClasses: boolean;
};

export default class StateManager {
  readonly _state: PluginPass;

  // Imports
  readonly stylexImport: Set<string> = new Set();
  readonly stylexCreateImport: Set<string> = new Set();
  readonly stylexIncludeImport: Set<string> = new Set();
  readonly stylexFirstThatWorksImport: Set<string> = new Set();
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

  get options(): StyleXOptions {
    const options = this._state.opts || {};
    this._state.opts = {
      ...options,
      dev: !!(options as any).dev,
      test: !!(options as any).test,
      stylexSheetName: (options as any).stylexSheetName ?? undefined,
      classNamePrefix: (options as any).classNamePrefix ?? 'x',
      importSources: (options as any).importSources ?? [name, 'stylex'],
      definedStylexCSSVariables:
        (options as any).definedStylexCSSVariables ?? {},
      genConditionalClasses: !!(options as any).genConditionalClasses,
      skipShorthandExpansion: !!(options as any).skipShorthandExpansion,
    } as StyleXOptions;
    return this._state.opts as any;
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
