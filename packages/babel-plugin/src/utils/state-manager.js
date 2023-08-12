/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { PluginPass } from '@babel/core';
import type { NodePath } from '@babel/traverse';
import type {
  CompiledNamespaces,
  StyleXOptions as RuntimeOptions,
} from '@stylexjs/shared';
import { name } from '@stylexjs/stylex/package.json';
import path from 'path';

export type ImportPathResolution =
  | false
  | ['themeNameRef' | 'filePath', string];

type ModuleResolution =
  | {
      type: 'commonJS',
      rootDir: string,
      themeFileExtension?: string,
    }
  | {
      type: 'haste',
      themeFileExtension?: string,
    }
  | {
      type: 'experimental_crossFileParsing',
      rootDir: string,
      themeFileExtension?: string,
    };

type StyleXOptions = {
  ...RuntimeOptions,
  importSources: Array<string>,
  genConditionalClasses: boolean,
  unstable_moduleResolution: void | ModuleResolution,
  ...
};

export default class StateManager {
  +_state: PluginPass;

  // Imports
  +stylexImport: Set<string> = new Set();
  +stylexCreateImport: Set<string> = new Set();
  +stylexIncludeImport: Set<string> = new Set();
  +stylexFirstThatWorksImport: Set<string> = new Set();
  +stylexKeyframesImport: Set<string> = new Set();
  +stylexCreateVarsImport: Set<string> = new Set();
  +stylexOverrideVarsImport: Set<string> = new Set();

  // `stylex.create` calls
  +styleMap: Map<string, CompiledNamespaces> = new Map();
  +styleVars: Map<string, NodePath<>> = new Map();

  // resuls of `stylex.create` calls that should be kept
  +styleVarsToKeep: Set<[string, null | string]> = new Set();

  inStyleXCreate: boolean = false;

  constructor(state: PluginPass) {
    this._state = state;
    (state.file.metadata: $FlowFixMe).stylex = [];
  }

  get options(): StyleXOptions {
    const options: Partial<StyleXOptions> =
      (this._state.opts: $FlowFixMe) || {};
    const opts: StyleXOptions = {
      ...options,
      dev: !!(options: $FlowFixMe).dev,
      test: !!(options: $FlowFixMe).test,
      stylexSheetName: (options: $FlowFixMe).stylexSheetName ?? undefined,
      classNamePrefix: (options: $FlowFixMe).classNamePrefix ?? 'x',
      importSources: (options: $FlowFixMe).importSources ?? [name, 'stylex'],
      definedStylexCSSVariables:
        (options: $FlowFixMe).definedStylexCSSVariables ?? {},
      genConditionalClasses: !!(options: $FlowFixMe).genConditionalClasses,
      styleResolution:
        (options: $FlowFixMe).styleResolution ?? 'application-order',
      unstable_moduleResolution:
        (options: $FlowFixMe).unstable_moduleResolution ?? undefined,
    };
    this._state.opts = (opts: $FlowFixMe);
    return this._state.opts;
  }

  get canReferenceTheme(): boolean {
    return !!this.inStyleXCreate;
    // || this.isStyleXCreateVars
  }

  get metadata(): { [key: string]: any } {
    return this._state.file.metadata;
  }

  get stylexSheetName(): string | void {
    return this.options.stylexSheetName ?? undefined;
  }

  get isDev(): boolean {
    return !!this.options.dev;
  }

  get isTest(): boolean {
    return !!this.options.test;
  }

  get filename(): string | void {
    return this._state.filename;
  }

  get cssVars(): any {
    return this.options.definedStylexCSSVariables;
  }

  get fileNameForHashing(): null | string {
    const filename = this.filename;
    const themeFileExtension =
      this.options.unstable_moduleResolution?.themeFileExtension ?? '.stylex';

    if (
      filename == null ||
      !matchesFileSuffix(themeFileExtension)(filename) ||
      this.options.unstable_moduleResolution == null
    ) {
      return null;
    }

    switch (this.options.unstable_moduleResolution.type) {
      case 'haste':
        return path.basename(filename);
      default: {
        const rootDir = this.options.unstable_moduleResolution.rootDir;
        return path.relative(rootDir, filename);
      }
    }
  }

  importPathResolver(importPath: string): ImportPathResolution {
    const sourceFilePath = this.filename;
    if (sourceFilePath == null) {
      return false;
    }
    switch (this.options.unstable_moduleResolution?.type) {
      case 'commonJS': {
        const rootDir = this.options.unstable_moduleResolution.rootDir;
        const themeFileExtension =
          this.options.unstable_moduleResolution.themeFileExtension ??
          '.stylex';
        if (!matchesFileSuffix(themeFileExtension)(importPath)) {
          return false;
        }
        const resolvedFilePath = filePathResolver(importPath, rootDir);
        return resolvedFilePath ? ['themeNameRef', resolvedFilePath] : false;
      }
      case 'haste': {
        const themeFileExtension =
          this.options.unstable_moduleResolution.themeFileExtension ??
          '.stylex';
        if (!matchesFileSuffix(themeFileExtension)(importPath)) {
          return false;
        }
        return ['themeNameRef', addFileExtension(importPath, sourceFilePath)];
      }
      case 'experimental_crossFileParsing': {
        const themeFileExtension =
          this.options.unstable_moduleResolution.themeFileExtension ??
          '.stylex';
        if (!matchesFileSuffix(themeFileExtension)(importPath)) {
          return false;
        }
        const resolvedFilePath = filePathResolver(importPath, sourceFilePath);
        return resolvedFilePath ? ['filePath', resolvedFilePath] : false;
      }
      default:
        return false;
    }
  }

  addStyle(
    style: [string, { ltr: string, rtl?: string | null }, number],
  ): void {
    this.metadata.stylex.push(style);
  }

  markComposedNamespace(memberExpression: [string, null | string]): void {
    this.styleVarsToKeep.add(memberExpression);
  }
}

// a function that resolves the absolute path of a file when given the
// relative path of the file from the source file
const filePathResolver = (
  relativeFilePath: string,
  sourceFilePath: string,
): void | string => {
  const fileToLookFor = addFileExtension(relativeFilePath, sourceFilePath);
  try {
    const resolvedFilePath = require.resolve(fileToLookFor, {
      paths: [path.dirname(sourceFilePath)],
    });
    return resolvedFilePath;
  } catch {}
};

const addFileExtension = (
  importedFilePath: string,
  sourceFile: string,
): string => {
  if (
    importedFilePath.endsWith('.js') ||
    importedFilePath.endsWith('.ts') ||
    importedFilePath.endsWith('.tsx') ||
    importedFilePath.endsWith('.jsx') ||
    importedFilePath.endsWith('.mjs') ||
    importedFilePath.endsWith('.cjs')
  ) {
    return importedFilePath;
  }
  const fileExtension = path.extname(sourceFile);
  return importedFilePath + fileExtension;
};

const matchesFileSuffix = (allowedSuffix: string) => (filename: string) =>
  filename.endsWith(`${allowedSuffix}.js`) ||
  filename.endsWith(`${allowedSuffix}.ts`) ||
  filename.endsWith(`${allowedSuffix}.tsx`) ||
  filename.endsWith(`${allowedSuffix}.jsx`) ||
  filename.endsWith(`${allowedSuffix}.mjs`) ||
  filename.endsWith(`${allowedSuffix}.cjs`) ||
  filename.endsWith(allowedSuffix);
