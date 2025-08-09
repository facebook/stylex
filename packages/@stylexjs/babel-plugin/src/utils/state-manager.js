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
} from '../shared';
import type { Check } from './validate';
import type { ImportOptions } from '@babel/helper-module-imports';

import * as t from '@babel/types';
import { name } from '@stylexjs/stylex/package.json';
import path from 'path';
import fs from 'fs';
import url from 'url';
import * as z from './validate';
import { addDefault, addNamed } from '@babel/helper-module-imports';
import { moduleResolve } from '@dual-bundle/import-meta-resolve';

type ImportAdditionOptions = Omit<
  Partial<ImportOptions>,
  'ensureLiveReference' | 'ensureNoContext',
>;

export type ImportPathResolution =
  | false
  | ['themeNameRef' | 'filePath', string];

type ModuleResolution =
  | $ReadOnly<{
      type: 'commonJS',
      rootDir?: ?string,
      themeFileExtension?: ?string,
    }>
  | $ReadOnly<{
      type: 'haste',
      themeFileExtension?: ?string,
    }>
  | $ReadOnly<{
      type: 'experimental_crossFileParsing',
      rootDir?: string,
      themeFileExtension?: ?string,
    }>;

// eslint-disable-next-line no-unused-vars
const CheckModuleResolution: Check<ModuleResolution> = z.unionOf3(
  z.object({
    type: z.literal('commonJS'),
    rootDir: z.unionOf(z.nullish(), z.string()),
    themeFileExtension: z.unionOf<null | void, string>(z.nullish(), z.string()),
  }),
  z.object({
    type: z.literal('haste'),
    themeFileExtension: z.unionOf(z.nullish(), z.string()),
  }),
  z.object({
    type: z.literal('experimental_crossFileParsing'),
    rootDir: z.string(),
    themeFileExtension: z.unionOf(z.nullish(), z.string()),
  }),
);

export type StyleXOptions = $ReadOnly<{
  ...RuntimeOptions,
  aliases?: ?$ReadOnly<{ [string]: string | $ReadOnlyArray<string> }>,
  enableDebugClassNames?: boolean,
  enableDebugDataProp?: boolean,
  enableDevClassNames?: boolean,
  enableInlinedConditionalMerge?: boolean,
  enableMediaQueryOrder?: boolean,
  enableLegacyValueFlipping?: boolean,
  enableLogicalStylesPolyfill?: boolean,
  enableMinifiedKeys?: boolean,
  importSources: $ReadOnlyArray<
    string | $ReadOnly<{ from: string, as: string }>,
  >,
  rewriteAliases?: boolean,
  runtimeInjection: boolean | ?string | $ReadOnly<{ from: string, as: string }>,
  treeshakeCompensation?: boolean,
  unstable_moduleResolution?: ?ModuleResolution,
  ...
}>;

type StyleXStateOptions = $ReadOnly<{
  ...StyleXOptions,
  runtimeInjection: ?string | $ReadOnly<{ from: string, as: ?string }>,
  aliases?: ?$ReadOnly<{ [string]: $ReadOnlyArray<string> }>,
  rewriteAliases: boolean,
  ...
}>;

const checkImportSource = z.unionOf(
  z.string(),
  z.object({
    from: z.string(),
    as: z.string(),
  }),
);
const checkImportSources: Check<StyleXOptions['importSources']> =
  z.array(checkImportSource);

const checkRuntimeInjection: Check<StyleXOptions['runtimeInjection']> =
  z.unionOf3(
    z.boolean(),
    z.string(),
    z.object({
      from: z.string(),
      as: z.string(),
    }),
  );

const DEFAULT_INJECT_PATH = '@stylexjs/stylex/lib/stylex-inject';

export default class StateManager {
  +_state: PluginPass;

  // Imports
  +importPaths: Set<string> = new Set();
  +stylexImport: Set<string> = new Set();
  +stylexPropsImport: Set<string> = new Set();
  +stylexAttrsImport: Set<string> = new Set();
  +stylexCreateImport: Set<string> = new Set();
  +stylexIncludeImport: Set<string> = new Set();
  +stylexFirstThatWorksImport: Set<string> = new Set();
  +stylexKeyframesImport: Set<string> = new Set();
  +stylexPositionTryImport: Set<string> = new Set();
  +stylexDefineVarsImport: Set<string> = new Set();
  +stylexDefineConstsImport: Set<string> = new Set();
  +stylexCreateThemeImport: Set<string> = new Set();
  +stylexTypesImport: Set<string> = new Set();
  +stylexViewTransitionClassImport: Set<string> = new Set();

  injectImportInserted: ?t.Identifier = null;

  // `stylex.create` calls
  +styleMap: Map<string, CompiledNamespaces> = new Map();
  +styleVars: Map<string, NodePath<>> = new Map();

  // results of `stylex.create` calls that should be kept
  +styleVarsToKeep: Set<[string, true | string, true | Array<string>]> =
    new Set();

  inStyleXCreate: boolean = false;

  +options: StyleXStateOptions;

  constructor(state: PluginPass) {
    this._state = state;
    state.file.metadata.stylex = [];

    this.options = this.setOptions(state.opts ?? {});
  }

  setOptions(options: { +[string]: mixed }): StyleXStateOptions {
    const dev: StyleXStateOptions['dev'] = z.logAndDefault(
      z.boolean(),
      options.dev ?? false,
      false,
      'options.dev',
    );

    const debug: StyleXStateOptions['debug'] = z.logAndDefault(
      z.boolean(),
      options.debug ?? dev,
      false,
      'options.debug',
    );

    const enableDebugClassNames: StyleXStateOptions['enableDebugClassNames'] =
      z.logAndDefault(
        z.boolean(),
        options.enableDebugClassNames ?? true,
        true,
        'options.enableDebugClassNames',
      );

    const enableDebugDataProp: StyleXStateOptions['enableDebugDataProp'] =
      z.logAndDefault(
        z.boolean(),
        options.enableDebugDataProp ?? true,
        true,
        'options.enableDebugDataProp',
      );

    const enableDevClassNames: StyleXStateOptions['enableDevClassNames'] =
      z.logAndDefault(
        z.boolean(),
        options.enableDevClassNames ?? false,
        false,
        'options.enableDevClassNames',
      );

    const enableFontSizePxToRem: StyleXStateOptions['enableFontSizePxToRem'] =
      z.logAndDefault(
        z.boolean(),
        options.enableFontSizePxToRem ?? false,
        false,
        'options.enableFontSizePxToRem',
      );

    const enableInlinedConditionalMerge: StyleXStateOptions['enableInlinedConditionalMerge'] =
      z.logAndDefault(
        z.boolean(),
        options.enableInlinedConditionalMerge ?? true,
        true,
        'options.enableInlinedConditionalMerge',
      );

    const enableMinifiedKeys: StyleXStateOptions['enableMinifiedKeys'] =
      z.logAndDefault(
        z.boolean(),
        options.enableMinifiedKeys ?? true,
        true,
        'options.enableMinifiedKeys',
      );

    const enableMediaQueryOrder: StyleXStateOptions['enableMediaQueryOrder'] =
      z.logAndDefault(
        z.boolean(),
        options.enableMediaQueryOrder ?? false,
        false,
        'options.enableMediaQueryOrder',
      );

    const enableLegacyValueFlipping: StyleXStateOptions['enableLegacyValueFlipping'] =
      z.logAndDefault(
        z.boolean(),
        options.enableLegacyValueFlipping ?? false,
        false,
        'options.enableLegacyValueFlipping',
      );

    const enableLogicalStylesPolyfill: StyleXStateOptions['enableLogicalStylesPolyfill'] =
      z.logAndDefault(
        z.boolean(),
        options.enableLogicalStylesPolyfill ?? false,
        false,
        'options.enableLogicalStylesPolyfill',
      );

    const test: StyleXStateOptions['test'] = z.logAndDefault(
      z.boolean(),
      options.test ?? false,
      false,
      'options.test',
    );

    const configRuntimeInjection: StyleXOptions['runtimeInjection'] =
      z.logAndDefault(
        checkRuntimeInjection,
        options.runtimeInjection ?? false,
        false,
        'options.runtimeInjection',
      );

    // prettier-ignore
    const runtimeInjection: StyleXStateOptions['runtimeInjection']
      = configRuntimeInjection === true ?
        DEFAULT_INJECT_PATH
      : configRuntimeInjection === false ?
        undefined
      :
        configRuntimeInjection
      ;

    const classNamePrefix: StyleXStateOptions['classNamePrefix'] =
      z.logAndDefault(
        z.string(),
        options.classNamePrefix ?? 'x',
        'x',
        'options.classNamePrefix',
      );

    const configuredImportSources: StyleXStateOptions['importSources'] =
      z.logAndDefault(
        checkImportSources,
        options.importSources ?? [],
        [],
        'options.importSources',
      );

    const importSources: StyleXStateOptions['importSources'] = [
      name,
      'stylex',
      ...configuredImportSources,
    ];

    const styleResolution: StyleXStateOptions['styleResolution'] =
      z.logAndDefault(
        z.unionOf3(
          z.literal('application-order'),
          z.literal('property-specificity'),
          z.literal('legacy-expand-shorthands'),
        ),
        options.styleResolution ?? 'property-specificity',
        'property-specificity',
        'options.styleResolution',
      );

    const unstable_moduleResolution: StyleXStateOptions['unstable_moduleResolution'] =
      z.logAndDefault(
        z.unionOf(z.nullish(), CheckModuleResolution),
        options.unstable_moduleResolution,
        null,
        'options.unstable_moduleResolution',
      );

    const treeshakeCompensation: StyleXStateOptions['treeshakeCompensation'] =
      z.logAndDefault(
        z.boolean(),
        options.treeshakeCompensation ?? false,
        false,
        'options.treeshakeCompensation',
      );

    const aliasesOption: StyleXOptions['aliases'] = z.logAndDefault(
      z.unionOf(
        z.nullish(),
        z.objectOf(z.unionOf(z.string(), z.array(z.string()))),
      ),
      options.aliases,
      null,
      'options.aliases',
    );

    const aliases: StyleXStateOptions['aliases'] =
      aliasesOption == null
        ? aliasesOption
        : Object.fromEntries(
            Object.entries(aliasesOption).map(([key, value]) => {
              if (typeof value === 'string') {
                return [key, [value]];
              }
              return [key, value];
            }),
          );

    const opts: StyleXStateOptions = {
      aliases,
      classNamePrefix,
      debug,
      definedStylexCSSVariables: {},
      dev,
      enableDebugClassNames,
      enableDebugDataProp,
      enableDevClassNames,
      enableFontSizePxToRem,
      enableInlinedConditionalMerge,
      enableMinifiedKeys,
      enableMediaQueryOrder,
      enableLegacyValueFlipping,
      enableLogicalStylesPolyfill,
      importSources,
      rewriteAliases:
        typeof options.rewriteAliases === 'boolean'
          ? options.rewriteAliases
          : false,
      runtimeInjection,
      styleResolution,
      test,
      treeshakeCompensation,
      unstable_moduleResolution,
    };
    return opts;
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

  get runtimeInjection(): ?$ReadOnly<{ from: string, as?: ?string }> {
    if (this.options.runtimeInjection == null) {
      return null;
    }
    const runInj = this.options.runtimeInjection;
    return typeof runInj === 'string' ? { from: runInj } : runInj || null;
  }

  addNamedImport(
    statementPath: NodePath<>,
    as: string,
    from: string,
    options: ImportAdditionOptions,
  ): t.Identifier {
    const identifier = addNamed(statementPath, as, from, options);
    const programPath = getProgramPath(statementPath);
    if (programPath == null) {
      return identifier;
    }
    const bodyPath: Array<NodePath<t.Statement>> = programPath.get('body');
    let targetImportIndex = -1;
    for (let i = 0; i < bodyPath.length; i++) {
      const statement = bodyPath[i];
      if (statement.isImportDeclaration()) {
        targetImportIndex = i;
        if (
          statement.node.specifiers.find(
            (s) =>
              s.type === 'ImportSpecifier' &&
              s.local.type === 'Identifier' &&
              s.local.name === identifier.name,
          )
        ) {
          break;
        }
      }
    }
    if (targetImportIndex === -1) {
      return identifier;
    }
    const lastImport = bodyPath[targetImportIndex];
    if (lastImport == null) {
      return identifier;
    }
    const importName = statementPath.scope.generateUidIdentifier(as);

    lastImport.insertAfter(
      t.variableDeclaration('var', [
        t.variableDeclarator(importName, identifier),
      ]),
    );

    return importName;
  }

  addDefaultImport(
    statementPath: NodePath<>,
    from: string,
    options: ImportAdditionOptions,
  ): t.Identifier {
    const identifier = addDefault(statementPath, from, options);
    const programPath = getProgramPath(statementPath);
    if (programPath == null) {
      return identifier;
    }
    const bodyPath: Array<NodePath<t.Statement>> = programPath.get('body');
    let targetImportIndex = -1;
    for (let i = 0; i < bodyPath.length; i++) {
      const statement = bodyPath[i];
      if (statement.isImportDeclaration()) {
        targetImportIndex = i;
        if (
          statement.node.specifiers.find(
            (s) =>
              s.type === 'ImportDefaultSpecifier' &&
              s.local.type === 'Identifier' &&
              s.local.name === identifier.name,
          )
        ) {
          break;
        }
      }
    }
    if (targetImportIndex === -1) {
      return identifier;
    }
    const lastImport = bodyPath[targetImportIndex];
    if (lastImport == null) {
      return identifier;
    }
    const importName = statementPath.scope.generateUidIdentifier('inject');

    lastImport.insertAfter(
      t.variableDeclaration('var', [
        t.variableDeclarator(importName, identifier),
      ]),
    );

    return importName;
  }

  get opts(): StyleXStateOptions {
    return { ...this.options };
  }

  get isDebug(): boolean {
    return !!this.options.debug;
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
      default:
        return this.getCanonicalFilePath(filename);
    }
  }

  getPackageNameAndPath(
    filepath: string,
  ): null | [+packageName: string, +packageDir: string] {
    const folder = path.dirname(filepath);

    const hasPackageJSON = fs.existsSync(path.join(folder, 'package.json'));
    if (hasPackageJSON) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(path.join(folder, 'package.json'), 'utf8'),
        );
        const name = packageJson.name;
        return [name, folder];
      } catch (err) {
        console.error(err);
        return null;
      }
    } else {
      if (folder === path.parse(folder).root || folder === '') {
        return null;
      }
      return this.getPackageNameAndPath(folder);
    }
  }

  getCanonicalFilePath(filePath: string): string {
    const pkgNameAndPath = this.getPackageNameAndPath(filePath);
    if (pkgNameAndPath == null) {
      const rootDir = this.options.unstable_moduleResolution?.rootDir;
      if (rootDir != null) {
        return path.relative(rootDir, filePath);
      }
      const fileName = path.relative(path.dirname(filePath), filePath);
      return `_unknown_path_:${fileName}`;
    }
    const [packageName, packageDir] = pkgNameAndPath;
    return `${packageName}:${path.relative(packageDir, filePath)}`;
  }

  importPathResolver(importPath: string): ImportPathResolution {
    const sourceFilePath = this.filename;
    if (sourceFilePath == null) {
      return false;
    }

    switch (this.options.unstable_moduleResolution?.type) {
      case 'commonJS': {
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
        );
        return resolvedFilePath
          ? ['themeNameRef', this.getCanonicalFilePath(resolvedFilePath)]
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
        );
        return resolvedFilePath ? ['filePath', resolvedFilePath] : false;
      }
      default:
        return false;
    }
  }

  addStyle(
    style: [
      string,
      (
        | { ltr: string, rtl?: string | null }
        | {
            constKey: string,
            constVal: string | number,
            rtl?: string | null,
            ltr: string,
          }
      ),
      number,
    ],
  ): void {
    this.metadata.stylex.push(style);
  }

  registerStyles(
    styles: $ReadOnlyArray<
      [
        string,
        (
          | { ltr: string, rtl?: string | null }
          | {
              constKey: string,
              constVal: string | number,
              rtl?: string | null,
              ltr: string,
            }
        ),
        number,
      ],
    >,
    path?: ?NodePath<>,
  ): void {
    if (styles.length === 0) {
      return;
    }

    styles.forEach((style) => this.addStyle(style));

    if (path == null || this.runtimeInjection == null) {
      return;
    }
    const runtimeInjection = this.runtimeInjection;

    const statementPath =
      path.parentPath != null && path.parentPath.isProgram()
        ? path
        : getProgramStatement(path);

    let injectName: t.Identifier;
    if (this.injectImportInserted != null) {
      injectName = this.injectImportInserted;
    } else {
      const { from, as } = runtimeInjection;
      injectName =
        as != null
          ? this.addNamedImport(statementPath, as, from, {
              nameHint: 'inject',
            })
          : this.addDefaultImport(statementPath, from, {
              nameHint: 'inject',
            });

      this.injectImportInserted = injectName;
    }
    for (const [_key, { ltr, rtl }, priority] of styles) {
      statementPath.insertBefore(
        t.expressionStatement(
          t.callExpression(injectName, [
            t.stringLiteral(ltr),
            t.numericLiteral(priority),
            ...(rtl != null ? [t.stringLiteral(rtl)] : []),
          ]),
        ),
      );
    }
  }

  markComposedNamespace(
    memberExpression: [string, true | string, true | Array<string>],
  ): void {
    this.styleVarsToKeep.add(memberExpression);
  }
}

function possibleAliasedPaths(
  importPath: string,
  aliases: StyleXStateOptions['aliases'],
): $ReadOnlyArray<string> {
  const result = [importPath];
  if (aliases == null || Object.keys(aliases).length === 0) {
    return result;
  }

  for (const [alias, value] of Object.entries(aliases)) {
    if (alias.includes('*')) {
      const [before, after] = alias.split('*');
      if (importPath.startsWith(before) && importPath.endsWith(after)) {
        const replacementString = importPath.slice(
          before.length,
          after.length > 0 ? -after.length : undefined,
        );
        value.forEach((v) => {
          result.push(v.split('*').join(replacementString));
        });
      }
    } else if (alias === importPath) {
      value.forEach((v) => {
        result.push(v);
      });
    }
  }

  return result;
}

// Try importing without adding any extension
// and then every supported extension
const getPossibleFilePaths = (filePath: string) => {
  const extension = path.extname(filePath);
  const filePathHasCodeExtension = EXTENSIONS.includes(extension);
  const filePathNoCodeExtension = filePathHasCodeExtension
    ? filePath.slice(0, -extension.length)
    : filePath;

  return [filePath, ...EXTENSIONS.map((ext) => filePathNoCodeExtension + ext)];
};

// a function that resolves the absolute path of a file when given the
// relative path of the file from the source file
export const filePathResolver = (
  relativeFilePath: string,
  sourceFilePath: string,
  aliases: StyleXStateOptions['aliases'],
): ?string => {
  for (const importPathStr of getPossibleFilePaths(relativeFilePath)) {
    // Try to resolve relative paths as is
    if (importPathStr.startsWith('.')) {
      try {
        return url.fileURLToPath(
          moduleResolve(importPathStr, url.pathToFileURL(sourceFilePath)),
        );
      } catch {
        continue;
      }
    }

    // Otherwise, try to resolve the path with aliases
    const allAliases = possibleAliasedPaths(importPathStr, aliases);
    for (const possiblePath of allAliases) {
      try {
        return url.fileURLToPath(
          moduleResolve(possiblePath, url.pathToFileURL(sourceFilePath)),
        );
      } catch {
        continue;
      }
    }
  }
  // Failed to resolve the file path
  return null;
};

export const EXTENSIONS = ['.js', '.ts', '.tsx', '.jsx', '.mjs', '.cjs'];

const addFileExtension = (
  importedFilePath: string,
  sourceFile: string,
): string => {
  if (EXTENSIONS.some((ext) => importedFilePath.endsWith(ext))) {
    return importedFilePath;
  }
  const fileExtension = path.extname(sourceFile);
  // NOTE: This is unsafe. We are assuming the all files in your project
  // use the same file extension.
  // However, in a haste module system we have no way to resolve the
  // *actual* file to get the actual file extension used.
  return importedFilePath + fileExtension;
};

export const matchesFileSuffix: (string) => (string) => boolean =
  (allowedSuffix) => (filename) =>
    ['', ...EXTENSIONS].some((extension) =>
      filename.endsWith(`${allowedSuffix}${extension}`),
    );

const getProgramPath = (path: NodePath<>): null | NodePath<t.Program> => {
  let programPath = path;
  while (programPath != null && !programPath.isProgram()) {
    if (programPath.parentPath) {
      programPath = programPath.parentPath;
    } else {
      return null;
    }
  }
  return programPath;
};

const getProgramStatement = (path: NodePath<>): NodePath<> => {
  let programPath = path;
  while (
    programPath.parentPath != null &&
    !programPath.parentPath.isProgram() &&
    programPath.parentPath != null
  ) {
    programPath = programPath.parentPath;
  }
  return programPath;
};

export function getRelativePath(from: string, to: string): string {
  const relativePath = path.relative(path.parse(from).dir, to);
  return formatRelativePath(toPosixPath(relativePath));
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join(path.posix.sep);
}

function formatRelativePath(filePath: string) {
  return filePath.startsWith('.') ? filePath : './' + filePath;
}
