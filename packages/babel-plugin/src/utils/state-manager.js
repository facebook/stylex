/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import * as t from '@babel/types';
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

export type StyleXOptions = $ReadOnly<{
  ...RuntimeOptions,
  importSources: $ReadOnlyArray<
    string | $ReadOnly<{ from: string, as: string }>,
  >,
  runtimeInjection: boolean | ?string | $ReadOnly<{ from: string, as: string }>,
  treeshakeCompensation?: boolean,
  genConditionalClasses: boolean,
  unstable_moduleResolution: void | ModuleResolution,
  aliases: $ReadOnly<{ [string]: string }>,
  ...
}>;

type StyleXStateOptions = $ReadOnly<{
  ...StyleXOptions,
  runtimeInjection: ?string | $ReadOnly<{ from: string, as: string }>,
  ...
}>;

function validateAliases(options: StyleXOptions): StyleXOptions {
  const aliases = options.aliases;
  if (aliases == null) {
    return options;
  }

  Object.keys(aliases).forEach((alias) => {
    let value = aliases[alias];
    if (!Array.isArray(value)) {
      throw new Error(
        `Invalid alias value for ${alias}. It should be an array.
        
        Example:
        aliases: {
          "@/*": ["./src/*"]
        }
        `,
      );
    }
    if (value.length > 1) {
      throw new Error(
        `Invalid alias value for ${alias}. It should contain at most one value.

        Example:
        aliases: {
          "@/*": ["./src/*"]
        }
        `,
      );
    }

    value = value[0];

    if (typeof value !== 'string') {
      throw new Error(
        `Invalid alias value for ${alias}. It should be a string.`,
      );
    }
    if (!alias.startsWith('@')) {
      throw new Error(
        `Invalid alias key for ${alias}. It should start with @.`,
      );
    }
    if (alias.split('*').length > 2) {
      throw new Error(
        `Invalid alias key for ${alias}. It should contain at most one * character.`,
      );
    }
    if (value.split('*').length > 2) {
      throw new Error(
        `Invalid alias value for ${alias}. It should contain at most one * character.`,
      );
    }
  });

  return options;
}

const DEFAULT_INJECT_PATH = '@stylexjs/stylex/lib/stylex-inject';

export default class StateManager {
  +_state: PluginPass;

  // Imports
  +importPaths: Set<string> = new Set();
  +stylexImport: Set<string> = new Set();
  +stylexPropsImport: Set<string> = new Set();
  +stylexCreateImport: Set<string> = new Set();
  +stylexIncludeImport: Set<string> = new Set();
  +stylexFirstThatWorksImport: Set<string> = new Set();
  +stylexKeyframesImport: Set<string> = new Set();
  +stylexDefineVarsImport: Set<string> = new Set();
  +stylexCreateThemeImport: Set<string> = new Set();
  +stylexTypesImport: Set<string> = new Set();

  injectImportInserted: ?t.Identifier = null;

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

  get options(): StyleXStateOptions {
    const options: Partial<StyleXOptions> = validateAliases(
      (this._state.opts: $FlowFixMe) || {},
    );
    const opts: StyleXStateOptions = {
      ...options,
      dev: !!(options: $FlowFixMe).dev,
      test: !!(options: $FlowFixMe).test,
      aliases: (options: $FlowFixMe).aliases,
      runtimeInjection:
        options.runtimeInjection === true
          ? DEFAULT_INJECT_PATH
          : options.runtimeInjection
            ? options.runtimeInjection
            : options.dev
              ? DEFAULT_INJECT_PATH
              : undefined,
      classNamePrefix: (options: $FlowFixMe).classNamePrefix ?? 'x',
      importSources: [
        name,
        'stylex',
        ...((options: $FlowFixMe).importSources ?? []),
      ],
      definedStylexCSSVariables:
        (options: $FlowFixMe).definedStylexCSSVariables ?? {},
      genConditionalClasses: !!(options: $FlowFixMe).genConditionalClasses,
      useRemForFontSize: !!(options: $FlowFixMe).useRemForFontSize,
      styleResolution:
        (options: $FlowFixMe).styleResolution ?? 'application-order',
      unstable_moduleResolution:
        (options: $FlowFixMe).unstable_moduleResolution ?? undefined,
      treeshakeCompensation: !!(options: $FlowFixMe).treeshakeCompensation,
    };
    this._state.opts = (opts: $FlowFixMe);
    return this._state.opts;
  }

  get importPathString(): string {
    if (this.importPaths.has('@stylexjs/stylex')) {
      return '@stylexjs/stylex';
    }
    if (this.importPaths.size > 0) {
      // get the first one
      return [...this.importPaths][0];
    }
    return '@stylexjs/stylex';
  }

  get importSources(): $ReadOnlyArray<string> {
    return this.options.importSources.map((source) =>
      typeof source === 'string' ? source : source.from,
    );
  }

  importAs(source: string): null | string {
    for (const importSource of this.options.importSources) {
      if (typeof importSource !== 'string' && importSource.from === source) {
        return importSource.as;
      }
    }
    return null;
  }

  get canReferenceTheme(): boolean {
    return !!this.inStyleXCreate;
    // || this.isStyleXDefineVars
  }

  get metadata(): { [key: string]: any } {
    return this._state.file.metadata;
  }

  get runtimeInjection(): ?$ReadOnly<{ from: string, as?: string }> {
    return typeof this.options.runtimeInjection === 'string'
      ? { from: this.options.runtimeInjection }
      : this.options.runtimeInjection || null;
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

  get treeshakeCompensation(): boolean {
    return !!this.options.treeshakeCompensation;
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
        const aliases = this.options.aliases;
        const themeFileExtension =
          this.options.unstable_moduleResolution?.themeFileExtension ??
          '.stylex';
        if (!matchesFileSuffix(themeFileExtension)(importPath)) {
          return false;
        }
        const resolvedFilePath = filePathResolver(
          importPath,
          sourceFilePath,
          aliases,
          rootDir,
        );
        return resolvedFilePath
          ? ['themeNameRef', path.relative(rootDir, resolvedFilePath)]
          : false;
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
        const rootDir = this.options.unstable_moduleResolution.rootDir;
        const aliases = this.options.aliases;
        const themeFileExtension =
          this.options.unstable_moduleResolution.themeFileExtension ??
          '.stylex';
        if (!matchesFileSuffix(themeFileExtension)(importPath)) {
          return false;
        }
        const resolvedFilePath = filePathResolver(
          importPath,
          sourceFilePath,
          aliases,
          rootDir,
        );
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
// a function generate Regex to match the path of files with aliases
function generateAliasRegex(alias: string): RegExp {
  const regex = new RegExp('^' + alias + '/(.*)');
  return regex;
}

function aliasPathResolver(
  importPath: string,
  aliases: $ReadOnly<{ [string]: string }>,
): [string, boolean] {
  let isAliasResolved = false;
  for (const [alias, value] of Object.entries(aliases)) {
    if (alias.includes('*')) {
      const [before, after] = alias.split('*');
      if (importPath.startsWith(before) && importPath.endsWith(after)) {
        const replacementString = importPath.slice(
          before.length,
          after.length > 0 ? -after.length : undefined,
        );
        isAliasResolved = true;
        return [value[0].split('*').join(replacementString), isAliasResolved];
      }
    } else if (alias === importPath) {
      isAliasResolved = true;
      return [value[0], isAliasResolved];
    }
  }
  return [importPath, isAliasResolved];
}

// a function that resolves the path of files with aliases
function aliasPathResolverOld(importPath: string = '', aliases: any) {
  let output = importPath;
  Object.keys(aliases ?? {}).forEach((alias) => {
    const replacementToken = alias.split('*')[0];
    const aliasedImportPathStr = importPath;
    const value = aliases[alias][0] ?? '';

    if (alias.endsWith('*')) {
      if (importPath.startsWith(alias.replace('*', ''))) {
        // If it does, replace the alias with the replacement at the beginning of the string
        output = importPath.replace(
          alias.replace('*', ''),
          value.replace('*', ''),
        );
      }
    } else {
      if (importPath === value) {
        return value;
      }
    }
  });
  return output;
}
// a function that resolves the absolute path of a file when given the
// relative path of the file from the source file
const filePathResolver = (
  relativeFilePath: string,
  sourceFilePath: string,
  aliases?: $ReadOnly<{ [string]: string }>,
  rootDir: string,
): void | string => {
  const fileToLookFor = relativeFilePath; //addFileExtension(relativeFilePath, sourceFilePath);
  if (EXTENSIONS.some((ext) => fileToLookFor.endsWith(ext))) {
    try {
      const resolvedFilePath = require.resolve(fileToLookFor, {
        paths: [path.dirname(sourceFilePath)],
      });
      return resolvedFilePath;
    } catch {}
  }
  for (const ext of EXTENSIONS) {
    try {
      const importPathStr = fileToLookFor.startsWith('.')
        ? fileToLookFor + ext
        : fileToLookFor;
      let aliasedImportPathStr = importPathStr;
      let isAliasResolved = false;
      if (aliases) {
        [aliasedImportPathStr, isAliasResolved] = aliasPathResolver(
          aliasedImportPathStr,
          aliases,
        );
      }
      if (isAliasResolved && aliasedImportPathStr.startsWith('.')) {
        aliasedImportPathStr += ext; // attach extenstion to the resolved alias import path.
      }

      const resolvedFilePath = isAliasResolved //Check if the alias is resolved and the path is valid
        ? require.resolve(path.resolve(aliasedImportPathStr), {
            paths: [path.dirname(sourceFilePath)],
          })
        : require.resolve(aliasedImportPathStr, {
            paths: [path.dirname(sourceFilePath)],
          });

      return resolvedFilePath;
    } catch {}
  }
};

const EXTENSIONS = ['.js', '.ts', '.tsx', '.jsx', '.mjs', '.cjs'];

const addFileExtension = (
  importedFilePath: string,
  sourceFile: string,
): string => {
  if (EXTENSIONS.some((ext) => importedFilePath.endsWith(ext))) {
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
