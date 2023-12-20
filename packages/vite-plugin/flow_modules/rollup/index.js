/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

// utils
type NullValue = null | void | void;
type MaybePromise<T> = T | Promise<T>;

type PartialNull<T> = {
  [P in keyof T]: T[P] | null,
};

export interface RollupError extends RollupLog {
  name?: string;
  stack?: string;
  watchFiles?: Array<string>;
}

export interface RollupLog {
  binding?: string;
  cause?: mixed;
  code?: string;
  exporter?: string;
  frame?: string;
  hook?: string;
  id?: string;
  ids?: Array<string>;
  loc?: {
    column: number,
    file?: string,
    line: number,
  };
  message: string;
  meta?: any;
  names?: Array<string>;
  plugin?: string;
  pluginCode?: mixed;
  pos?: number;
  reexporter?: string;
  stack?: string;
  url?: string;
}

export type LogLevel = 'warn' | 'info' | 'debug';
export type LogLevelOption = LogLevel | 'silent';

export type SourceMapSegment =
  | [number]
  | [number, number, number, number]
  | [number, number, number, number, number];

export interface ExistingDecodedSourceMap {
  file?: string;
  +mappings: SourceMapSegment[][];
  names: string[];
  sourceRoot?: string;
  sources: string[];
  sourcesContent?: string[];
  version: number;
  x_google_ignoreList?: number[];
}

export type ExistingRawSourceMap = {
  file?: string,
  mappings: string,
  names: string[],
  sourceRoot?: string,
  sources: string[],
  sourcesContent?: string[],
  version: number,
  x_google_ignoreList?: number[],
};

export type DecodedSourceMapOrMissing =
  | $ReadOnly<{
      missing: true,
      plugin: string,
    }>
  | (ExistingDecodedSourceMap & { missing?: false, ... });

export type SourceMap = $ReadOnly<{
  version: number,
  sources: $ReadOnlyArray<string>,
  names: $ReadOnlyArray<string>,
  sourceRoot?: string | void,
  sourcesContent?: Array<string>,
  mappings: string,
  file: string,
  ...
}>;

export type SourceMapInput =
  | ExistingRawSourceMap
  | string
  | null
  | { mappings: '' };

type ModuleOptions = {
  attributes: Record<string, string>,
  meta: CustomPluginOptions,
  moduleSideEffects: boolean | 'no-treeshake',
  syntheticNamedExports: boolean | string,
};

export type SourceDescription = $ReadOnly<{
  ...Partial<PartialNull<ModuleOptions>>,
  ast?: AstNode,
  code: string,
  map?: SourceMap,
}>;

export type TransformModuleJSON = {
  +ast?: AstNode,
  code: string,
  // note if plugins use new this.cache to opt-out auto transform cache
  customTransformCache: boolean,
  originalCode: string,
  originalSourcemap: ExistingDecodedSourceMap | null,
  sourcemapChain: DecodedSourceMapOrMissing[],
  transformDependencies: string[],
};

export type ModuleJSON = {
  ...TransformModuleJSON,
  ...ModuleOptions,
  ast: AstNode,
  dependencies: string[],
  id: string,
  resolvedIds: ResolvedIdMap,
  transformFiles: EmittedFile[] | void,
};

export interface PluginCache {
  delete(id: string): boolean;
  get<T = any>(id: string): T;
  has(id: string): boolean;
  set<T = any>(id: string, value: T): void;
}

export type LoggingFunction = (
  log: RollupLog | string | (() => RollupLog | string),
) => void;

export interface MinimalPluginContext {
  debug: LoggingFunction;
  error: (error: RollupError | string) => empty;
  info: LoggingFunction;
  meta: PluginContextMeta;
  warn: LoggingFunction;
}

export interface EmittedAsset {
  fileName?: string;
  name?: string;
  needsCodeReference?: boolean;
  source?: string | Uint8Array;
  type: 'asset';
}

export interface EmittedChunk {
  fileName?: string;
  id: string;
  implicitlyLoadedAfterOneOf?: string[];
  importer?: string;
  name?: string;
  preserveSignature?: PreserveEntrySignaturesOption;
  type: 'chunk';
}

export interface EmittedPrebuiltChunk {
  code: string;
  exports?: string[];
  fileName: string;
  map?: SourceMap;
  sourcemapFileName?: string;
  type: 'prebuilt-chunk';
}

export type EmittedFile = EmittedAsset | EmittedChunk | EmittedPrebuiltChunk;

export type EmitFile = (emittedFile: EmittedFile) => string;

type ModuleInfo = {
  ...ModuleOptions,
  ast: AstNode | null,
  code: string | null,
  dynamicImporters: $ReadOnlyArray<string>,
  dynamicallyImportedIdResolutions: $ReadOnlyArray<ResolvedId>,
  dynamicallyImportedIds: $ReadOnlyArray<string>,
  exportedBindings: Record<string, string[]> | null,
  exports: string[] | null,
  hasDefaultExport: boolean | null,
  id: string,
  implicitlyLoadedAfterOneOf: $ReadOnlyArray<string>,
  implicitlyLoadedBefore: $ReadOnlyArray<string>,
  importedIdResolutions: $ReadOnlyArray<ResolvedId>,
  importedIds: $ReadOnlyArray<string>,
  importers: $ReadOnlyArray<string>,
  isEntry: boolean,
  isExternal: boolean,
  isIncluded: boolean | null,
};

export type GetModuleInfo = (moduleId: string) => ModuleInfo | null;

export type CustomPluginOptions = {
  [string]: any,
};

type LoggingFunctionWithPosition = (
  log: RollupLog | string | (() => RollupLog | string),
  pos?: number | { column: number, line: number },
) => void;

export type ParseAst = (
  input: string,
  options?: { allowReturnOutsideFunction?: boolean },
) => AstNode;

export type ParseAstAsync = (
  input: string,
  options?: { allowReturnOutsideFunction?: boolean, signal?: AbortSignal },
) => Promise<AstNode>;

export interface PluginContext extends MinimalPluginContext {
  addWatchFile: (id: string) => void;
  cache: PluginCache;
  debug: LoggingFunction;
  emitFile: EmitFile;
  error: (error: RollupError | string) => empty;
  getFileName: (fileReferenceId: string) => string;
  getModuleIds: () => Iterator<string> | Iterable<string>;
  getModuleInfo: GetModuleInfo;
  getWatchFiles: () => string[];
  info: LoggingFunction;
  load: (
    options: { id: string, resolveDependencies?: boolean } & Partial<
      PartialNull<ModuleOptions>,
    >,
  ) => Promise<ModuleInfo>;
  parse: ParseAst;
  resolve: (
    source: string,
    importer?: string,
    options?: {
      attributes?: Record<string, string>,
      custom?: CustomPluginOptions,
      isEntry?: boolean,
      skipSelf?: boolean,
    },
  ) => Promise<ResolvedId | null>;
  setAssetSource: (
    assetReferenceId: string,
    source: string | Uint8Array,
  ) => void;
  warn: LoggingFunction;
}

export interface PluginContextMeta {
  rollupVersion: string;
  watchMode: boolean;
}

export type ResolvedId = {
  ...ModuleOptions,
  external: boolean | 'absolute',
  id: string,
  resolvedBy: string,
};

export type ResolvedIdMap = $ReadOnly<{
  [key: string]: ResolvedId,
}>;

type PartialResolvedId = {
  ...Partial<PartialNull<ModuleOptions>>,
  external?: boolean | 'absolute' | 'relative',
  id: string,
  resolvedBy?: string,
};

export type ResolveIdResult = string | NullValue | false | PartialResolvedId;

// export type ResolveIdResultWithoutNullValue =
//   | string
//   | false
//   | PartialResolvedId;

export type ResolveIdHook = (
  this: PluginContext,
  source: string,
  importer: string | void,
  options: {
    attributes: Record<string, string>,
    custom?: CustomPluginOptions,
    isEntry: boolean,
  },
) => ResolveIdResult;

export type ShouldTransformCachedModuleHook = (
  this: PluginContext,
  options: {
    ast: AstNode,
    code: string,
    id: string,
    meta: CustomPluginOptions,
    moduleSideEffects: boolean | 'no-treeshake',
    resolvedSources: ResolvedIdMap,
    syntheticNamedExports: boolean | string,
  },
) => boolean | NullValue;

export type IsExternal = (
  source: string,
  importer: string | void,
  isResolved: boolean,
) => boolean;

export type HasModuleSideEffects = (id: string, external: boolean) => boolean;

export type LoadResult = SourceDescription | string | NullValue;

export type LoadHook = (this: PluginContext, id: string) => LoadResult;

export interface TransformPluginContext extends PluginContext {
  debug: LoggingFunctionWithPosition;
  error: (
    error: RollupError | string,
    pos?: number | { column: number, line: number },
  ) => empty;
  getCombinedSourcemap: () => SourceMap;
  info: LoggingFunctionWithPosition;
  warn: LoggingFunctionWithPosition;
}

export type TransformResult = ?string | Partial<SourceDescription>;

export type TransformHook = (
  this: TransformPluginContext,
  code: string,
  id: string,
) => TransformResult;

export type ModuleParsedHook = (this: PluginContext, info: ModuleInfo) => void;

export type RenderChunkHook = (
  this: PluginContext,
  code: string,
  chunk: RenderedChunk,
  options: NormalizedOutputOptions,
  meta: { chunks: Record<string, RenderedChunk> },
) => { code: string, map?: SourceMapInput } | string | NullValue;

export type ResolveDynamicImportHook = (
  this: PluginContext,
  specifier: string | AstNode,
  importer: string,
  options: { attributes: Record<string, string> },
) => ResolveIdResult;

export type ResolveImportMetaHook = (
  this: PluginContext,
  property: string | null,
  options: {
    chunkId: string,
    format: InternalModuleFormat,
    moduleId: string,
  },
) => string | NullValue;

export type ResolveFileUrlHook = (
  this: PluginContext,
  options: {
    chunkId: string,
    fileName: string,
    format: InternalModuleFormat,
    moduleId: string,
    referenceId: string,
    relativePath: string,
  },
) => string | NullValue;

export type AddonHookFunction = (
  this: PluginContext,
  chunk: RenderedChunk,
) => string | Promise<string>;
export type AddonHook = string | AddonHookFunction;

export type ChangeEvent = 'create' | 'update' | 'delete';
export type WatchChangeHook = (
  this: PluginContext,
  id: string,
  change: { event: ChangeEvent },
) => void;

// /**
//  * use this type for plugin annotation
//  * @example
//  * ```ts
//  * interface Options {
//  * ...
//  * }
//  * const myPlugin: PluginImpl<Options> = (options = {}) => { ... }
//  * ```
//  */
// export type PluginImpl<O extends object = object, A = any> = (
//   options?: O,
// ) => Plugin<A>;

export type OutputBundle = {
  [fileName: string]: OutputAsset | OutputChunk,
};

export type FunctionPluginHooks = {
  augmentChunkHash: (
    this: PluginContext,
    chunk: RenderedChunk,
  ) => string | void,
  buildEnd: (this: PluginContext, error?: Error) => void,
  buildStart: (this: PluginContext, options: NormalizedInputOptions) => void,
  closeBundle: (this: PluginContext) => void,
  closeWatcher: (this: PluginContext) => void,
  generateBundle: (
    this: PluginContext,
    options: NormalizedOutputOptions,
    bundle: OutputBundle,
    isWrite: boolean,
  ) => void,
  load: LoadHook,
  moduleParsed: ModuleParsedHook,
  onLog: (
    this: MinimalPluginContext,
    level: LogLevel,
    log: RollupLog,
  ) => boolean | NullValue,
  options: (
    this: MinimalPluginContext,
    options: InputOptions,
  ) => InputOptions | NullValue,
  outputOptions: (
    this: PluginContext,
    options: OutputOptions,
  ) => OutputOptions | NullValue,
  renderChunk: RenderChunkHook,
  renderDynamicImport: (
    this: PluginContext,
    options: {
      customResolution: string | null,
      format: InternalModuleFormat,
      moduleId: string,
      targetModuleId: string | null,
    },
  ) => { left: string, right: string } | NullValue,
  renderError: (this: PluginContext, error?: Error) => void,
  renderStart: (
    this: PluginContext,
    outputOptions: NormalizedOutputOptions,
    inputOptions: NormalizedInputOptions,
  ) => void,
  resolveDynamicImport: ResolveDynamicImportHook,
  resolveFileUrl: ResolveFileUrlHook,
  resolveId: ResolveIdHook,
  resolveImportMeta: ResolveImportMetaHook,
  shouldTransformCachedModule: ShouldTransformCachedModuleHook,
  transform: TransformHook,
  watchChange: WatchChangeHook,
  writeBundle: (
    this: PluginContext,
    options: NormalizedOutputOptions,
    bundle: OutputBundle,
  ) => void,
};

export type OutputPluginHooks =
  | 'augmentChunkHash'
  | 'generateBundle'
  | 'outputOptions'
  | 'renderChunk'
  | 'renderDynamicImport'
  | 'renderError'
  | 'renderStart'
  | 'resolveFileUrl'
  | 'resolveImportMeta'
  | 'writeBundle';

// export type InputPluginHooks = Exclude<
//   keyof FunctionPluginHooks,
//   OutputPluginHooks,
// >;

export type SyncPluginHooks =
  | 'augmentChunkHash'
  | 'onLog'
  | 'outputOptions'
  | 'renderDynamicImport'
  | 'resolveFileUrl'
  | 'resolveImportMeta';

export type AsyncPluginHooks = Exclude<
  $Keys<FunctionPluginHooks>,
  SyncPluginHooks,
>;

export type FirstPluginHooks =
  | 'load'
  | 'renderDynamicImport'
  | 'resolveDynamicImport'
  | 'resolveFileUrl'
  | 'resolveId'
  | 'resolveImportMeta'
  | 'shouldTransformCachedModule';

export type SequentialPluginHooks =
  | 'augmentChunkHash'
  | 'generateBundle'
  | 'onLog'
  | 'options'
  | 'outputOptions'
  | 'renderChunk'
  | 'transform';

export type ParallelPluginHooks = Exclude<
  $Keys<FunctionPluginHooks> | $Keys<AddonHooks>,
  FirstPluginHooks | SequentialPluginHooks,
>;

export type AddonHooks = 'banner' | 'footer' | 'intro' | 'outro';

type MakeAsync<Function_> = Function_ extends (
  this: infer This,
  ...parameters: infer Arguments
) => infer Return
  ? (this: This, ...parameters: Arguments) => Return | Promise<Return>
  : empty;

type ObjectHook<T, O = { ... }> =
  | T
  | ({ handler: T, order?: 'pre' | 'post' | null } & O);

export type PluginHooks = {
  [K in keyof FunctionPluginHooks]: ObjectHook<
    K extends AsyncPluginHooks
      ? MakeAsync<FunctionPluginHooks[K]>
      : FunctionPluginHooks[K],
    K extends ParallelPluginHooks ? { sequential?: boolean } : {},
  >,
};

export type OutputPlugin = {
  // eslint-disable-next-line no-redeclare
  ...Partial<{ [K in OutputPluginHooks]: PluginHooks[K] }>,
  // eslint-disable-next-line no-redeclare
  ...Partial<{ [K in AddonHooks]: ObjectHook<AddonHook> }>,
  cacheKey?: string,
  name: string,
  version?: string,
};

export type Plugin<A = any> = {
  ...OutputPlugin,
  ...Partial<PluginHooks>,
  // for inter-plugin communication
  api?: A,
};

export type TreeshakingPreset = 'smallest' | 'safest' | 'recommended';

export type NormalizedTreeshakingOptions = {
  annotations: boolean,
  correctVarValueBeforeDeclaration: boolean,
  manualPureFunctions: $ReadOnlyArray<string>,
  moduleSideEffects: HasModuleSideEffects,
  propertyReadSideEffects: boolean | 'always',
  tryCatchDeoptimization: boolean,
  unknownGlobalSideEffects: boolean,
};

export type TreeshakingOptions = {
  ...Partial<NormalizedTreeshakingOptions>,
  moduleSideEffects?: ModuleSideEffectsOption,
  preset?: TreeshakingPreset,
};

type ManualChunkMeta = {
  getModuleIds: () => Iterable<string> | Iterator<string>,
  getModuleInfo: GetModuleInfo,
};
export type GetManualChunk = (
  id: string,
  meta: ManualChunkMeta,
) => string | NullValue;

export type ExternalOption =
  | Array<string | RegExp>
  | string
  | RegExp
  | ((
      source: string,
      importer: string | void,
      isResolved: boolean,
    ) => boolean | NullValue);

export type GlobalsOption =
  | { [name: string]: string }
  | ((name: string) => string);

export type InputOption = string | string[] | { [entryAlias: string]: string };

export type ManualChunksOption =
  | { [chunkAlias: string]: string[] }
  | GetManualChunk;

export type LogHandlerWithDefault = (
  level: LogLevel,
  log: RollupLog,
  defaultHandler: LogOrStringHandler,
) => void;

export type LogOrStringHandler = (
  level: LogLevel | 'error',
  log: RollupLog | string,
) => void;

export type LogHandler = (level: LogLevel, log: RollupLog) => void;

export type ModuleSideEffectsOption =
  | boolean
  | 'no-external'
  | Array<string>
  | HasModuleSideEffects;

export type PreserveEntrySignaturesOption =
  | false
  | 'strict'
  | 'allow-extension'
  | 'exports-only';

export type SourcemapPathTransformOption = (
  relativeSourcePath: string,
  sourcemapPath: string,
) => string;

export type SourcemapIgnoreListOption = (
  relativeSourcePath: string,
  sourcemapPath: string,
) => boolean;

export type InputPluginOption = MaybePromise<
  Plugin<> | NullValue | false | InputPluginOption[],
>;

export type InputOptions = {
  cache?: boolean | RollupCache,
  context?: string,
  experimentalCacheExpiry?: number,
  experimentalLogSideEffects?: boolean,
  external?: ExternalOption,
  input?: InputOption,
  logLevel?: LogLevelOption,
  makeAbsoluteExternalsRelative?: boolean | 'ifRelativeSource',
  maxParallelFileOps?: number,
  moduleContext?:
    | ((id: string) => string | NullValue)
    | { [id: string]: string },
  onLog?: LogHandlerWithDefault,
  onwarn?: WarningHandlerWithDefault,
  perf?: boolean,
  plugins?: InputPluginOption,
  preserveEntrySignatures?: PreserveEntrySignaturesOption,
  preserveSymlinks?: boolean,
  shimMissingExports?: boolean,
  strictDeprecations?: boolean,
  treeshake?: boolean | TreeshakingPreset | TreeshakingOptions,
  watch?: WatcherOptions | false,
};

// export interface InputOptionsWithPlugins extends InputOptions {
//   plugins: Plugin[];
// }

export type NormalizedInputOptions = {
  cache: false | void | RollupCache,
  context: string,
  experimentalCacheExpiry: number,
  experimentalLogSideEffects: boolean,
  external: IsExternal,
  input: string[] | { [entryAlias: string]: string },
  logLevel: LogLevelOption,
  makeAbsoluteExternalsRelative: boolean | 'ifRelativeSource',
  maxParallelFileOps: number,
  moduleContext: (id: string) => string,
  onLog: LogHandler,
  perf: boolean,
  plugins: Array<Plugin<>>,
  preserveEntrySignatures: PreserveEntrySignaturesOption,
  preserveSymlinks: boolean,
  shimMissingExports: boolean,
  strictDeprecations: boolean,
  treeshake: false | NormalizedTreeshakingOptions,
};

export type InternalModuleFormat =
  | 'amd'
  | 'cjs'
  | 'es'
  | 'iife'
  | 'system'
  | 'umd';

export type ModuleFormat =
  | InternalModuleFormat
  | 'commonjs'
  | 'esm'
  | 'module'
  | 'systemjs';

type GeneratedCodePreset = 'es5' | 'es2015';

type NormalizedGeneratedCodeOptions = {
  arrowFunctions: boolean,
  constBindings: boolean,
  objectShorthand: boolean,
  reservedNamesAsProps: boolean,
  symbols: boolean,
};

type GeneratedCodeOptions = {
  ...Partial<NormalizedGeneratedCodeOptions>,
  preset?: GeneratedCodePreset,
};

export type OptionsPaths = Record<string, string> | ((id: string) => string);

export type InteropType =
  | 'compat'
  | 'auto'
  | 'esModule'
  | 'default'
  | 'defaultOnly';

export type GetInterop = (id: string | null) => InteropType;

// export type AmdOptions = (
//   | {
//       autoId?: false,
//       id: string,
//     }
//   | {
//       autoId: true,
//       basePath?: string,
//       id?: void,
//     }
//   | {
//       autoId?: false,
//       id?: void,
//     }
// ) & {
//   define?: string,
//   forceJsExtensionForImports?: boolean,
// };

export type NormalizedAmdOptions =
  | {
      define: string,
      forceJsExtensionForImports: boolean,
      autoId: false,
      id?: string,
    }
  | {
      define: string,
      forceJsExtensionForImports: boolean,
      autoId: true,
      basePath: string,
    };

type AddonFunction = (chunk: RenderedChunk) => string | Promise<string>;

type OutputPluginOption = MaybePromise<
  OutputPlugin | NullValue | false | Array<OutputPluginOption>,
>;

export type OutputOptions = {
  // amd?: AmdOptions;
  assetFileNames?: string | ((chunkInfo: PreRenderedAsset) => string),
  // banner?: string | AddonFunction;
  chunkFileNames?: string | ((chunkInfo: PreRenderedChunk) => string),
  compact?: boolean,
  // only required for bundle.write
  dir?: string,
  dynamicImportInCjs?: boolean,
  entryFileNames?: string | ((chunkInfo: PreRenderedChunk) => string),
  esModule?: boolean | 'if-default-prop',
  experimentalMinChunkSize?: number,
  exports?: 'default' | 'named' | 'none' | 'auto',
  extend?: boolean,
  /** @deprecated Use "externalImportAttributes" instead. */
  externalImportAssertions?: boolean,
  externalImportAttributes?: boolean,
  externalLiveBindings?: boolean,
  // only required for bundle.write
  file?: string,
  footer?: string | AddonFunction,
  format?: ModuleFormat,
  freeze?: boolean,
  generatedCode?: GeneratedCodePreset | GeneratedCodeOptions,
  globals?: GlobalsOption,
  hoistTransitiveImports?: boolean,
  indent?: string | boolean,
  inlineDynamicImports?: boolean,
  interop?: InteropType | GetInterop,
  intro?: string | AddonFunction,
  manualChunks?: ManualChunksOption,
  minifyInternalExports?: boolean,
  name?: string,
  noConflict?: boolean,
  outro?: string | AddonFunction,
  paths?: OptionsPaths,
  plugins?: OutputPluginOption,
  preserveModules?: boolean,
  preserveModulesRoot?: string,
  sanitizeFileName?: boolean | ((fileName: string) => string),
  sourcemap?: boolean | 'inline' | 'hidden',
  sourcemapBaseUrl?: string,
  sourcemapExcludeSources?: boolean,
  sourcemapFile?: string,
  sourcemapFileNames?: string | ((chunkInfo: PreRenderedChunk) => string),
  sourcemapIgnoreList?: boolean | SourcemapIgnoreListOption,
  sourcemapPathTransform?: SourcemapPathTransformOption,
  strict?: boolean,
  systemNullSetters?: boolean,
  validate?: boolean,
};

export type NormalizedOutputOptions = {
  amd: NormalizedAmdOptions,
  assetFileNames: string | ((chunkInfo: PreRenderedAsset) => string),
  banner: AddonFunction,
  chunkFileNames: string | ((chunkInfo: PreRenderedChunk) => string),
  compact: boolean,
  dir: string | void,
  dynamicImportInCjs: boolean,
  entryFileNames: string | ((chunkInfo: PreRenderedChunk) => string),
  esModule: boolean | 'if-default-prop',
  experimentalMinChunkSize: number,
  exports: 'default' | 'named' | 'none' | 'auto',
  extend: boolean,
  /** @deprecated Use "externalImportAttributes" instead. */
  externalImportAssertions: boolean,
  externalImportAttributes: boolean,
  externalLiveBindings: boolean,
  file: string | void,
  footer: AddonFunction,
  format: InternalModuleFormat,
  freeze: boolean,
  generatedCode: NormalizedGeneratedCodeOptions,
  globals: GlobalsOption,
  hoistTransitiveImports: boolean,
  indent: true | string,
  inlineDynamicImports: boolean,
  interop: GetInterop,
  intro: AddonFunction,
  manualChunks: ManualChunksOption,
  minifyInternalExports: boolean,
  name: string | void,
  noConflict: boolean,
  outro: AddonFunction,
  paths: OptionsPaths,
  plugins: OutputPlugin[],
  preserveModules: boolean,
  preserveModulesRoot: string | void,
  sanitizeFileName: (fileName: string) => string,
  sourcemap: boolean | 'inline' | 'hidden',
  sourcemapBaseUrl: string | void,
  sourcemapExcludeSources: boolean,
  sourcemapFile: string | void,
  sourcemapFileNames: string | ((chunkInfo: PreRenderedChunk) => string) | void,
  sourcemapIgnoreList: SourcemapIgnoreListOption,
  sourcemapPathTransform: SourcemapPathTransformOption | void,
  strict: boolean,
  systemNullSetters: boolean,
  validate: boolean,
};

export type WarningHandlerWithDefault = (
  warning: RollupLog,
  defaultHandler: LoggingFunction,
) => void;

// export interface SerializedTimings {
//   [label: string]: [number, number, number];
// }

export interface PreRenderedAsset {
  name: string | void;
  source: string | Uint8Array;
  type: 'asset';
}

export interface OutputAsset extends PreRenderedAsset {
  fileName: string;
  needsCodeReference: boolean;
}

export interface RenderedModule {
  +code: string | null;
  originalLength: number;
  removedExports: Array<string>;
  renderedExports: Array<string>;
  renderedLength: number;
}

export interface PreRenderedChunk {
  exports: Array<string>;
  facadeModuleId: string | null;
  isDynamicEntry: boolean;
  isEntry: boolean;
  isImplicitEntry: boolean;
  moduleIds: Array<string>;
  name: string;
  type: 'chunk';
}

export interface RenderedChunk extends PreRenderedChunk {
  dynamicImports: Array<string>;
  fileName: string;
  implicitlyLoadedBefore: Array<string>;
  importedBindings: {
    [imported: string]: string[],
  };
  imports: Array<string>;
  modules: {
    [id: string]: RenderedModule,
  };
  referencedFiles: Array<string>;
}

export interface OutputChunk extends RenderedChunk {
  code: string;
  map: SourceMap | null;
  sourcemapFileName: string | null;
  preliminaryFileName: string;
}

export type SerializablePluginCache = {
  [key: string]: [number, any],
};

export type RollupCache = {
  modules: ModuleJSON[],
  plugins?: Record<string, SerializablePluginCache>,
};

// export interface RollupOutput {
//   output: [OutputChunk, ...(OutputChunk | OutputAsset)[]];
// }

// export interface RollupBuild {
//   cache: RollupCache | void;
//   close: () => Promise<void>;
//   closed: boolean;
//   generate: (outputOptions: OutputOptions) => Promise<RollupOutput>;
//   getTimings?: () => SerializedTimings;
//   watchFiles: string[];
//   write: (options: OutputOptions) => Promise<RollupOutput>;
// }

// export interface RollupOptions extends InputOptions {
//   // This is included for compatibility with config files but ignored by rollup.rollup
//   output?: OutputOptions | OutputOptions[];
// }

// export interface MergedRollupOptions extends InputOptionsWithPlugins {
//   output: OutputOptions[];
// }

export type ChokidarOptions = {
  alwaysStat?: boolean,
  atomic?: boolean | number,
  awaitWriteFinish?:
    | {
        pollInterval?: number,
        stabilityThreshold?: number,
      }
    | boolean,
  binaryInterval?: number,
  cwd?: string,
  depth?: number,
  disableGlobbing?: boolean,
  followSymlinks?: boolean,
  ignoreInitial?: boolean,
  ignorePermissionErrors?: boolean,
  ignored?: any,
  interval?: number,
  persistent?: boolean,
  useFsEvents?: boolean,
  usePolling?: boolean,
};

// export type RollupWatchHooks =
//   | 'onError'
//   | 'onStart'
//   | 'onBundleStart'
//   | 'onBundleEnd'
//   | 'onEnd';

export type WatcherOptions = {
  buildDelay?: number,
  chokidar?: ChokidarOptions,
  clearScreen?: boolean,
  exclude?: string | RegExp | (string | RegExp)[],
  include?: string | RegExp | (string | RegExp)[],
  skipWrite?: boolean,
};

// export interface RollupWatchOptions extends InputOptions {
//   output?: OutputOptions | OutputOptions[];
//   watch?: WatcherOptions | false;
// }

// export type AwaitedEventListener<
//   T extends { [event: string]: (...parameters: any) => any },
//   K extends keyof T,
// > = (...parameters: Parameters<T[K]>) => void | Promise<void>;

// export interface AwaitingEventEmitter<
//   T extends { [event: string]: (...parameters: any) => any },
// > {
//   close(): Promise<void>;
//   emit<K extends keyof T>(
//     event: K,
//     ...parameters: Parameters<T[K]>
//   ): Promise<unknown>;
//   /**
//    * Removes an event listener.
//    */
//   off<K extends keyof T>(event: K, listener: AwaitedEventListener<T, K>): this;
//   /**
//    * Registers an event listener that will be awaited before Rollup continues.
//    * All listeners will be awaited in parallel while rejections are tracked via
//    * Promise.all.
//    */
//   on<K extends keyof T>(event: K, listener: AwaitedEventListener<T, K>): this;
//   /**
//    * Registers an event listener that will be awaited before Rollup continues.
//    * All listeners will be awaited in parallel while rejections are tracked via
//    * Promise.all.
//    * Listeners are removed automatically when removeListenersForCurrentRun is
//    * called, which happens automatically after each run.
//    */
//   onCurrentRun<K extends keyof T>(
//     event: K,
//     listener: (...parameters: Parameters<T[K]>) => Promise<ReturnType<T[K]>>,
//   ): this;
//   removeAllListeners(): this;
//   removeListenersForCurrentRun(): this;
// }

// export type RollupWatcherEvent =
//   | { code: 'START' }
//   | {
//       code: 'BUNDLE_START',
//       input?: InputOption,
//       output: $ReadOnlyArray<string>,
//     }
//   | {
//       code: 'BUNDLE_END',
//       duration: number,
//       input?: InputOption,
//       output: $ReadOnlyArray<string>,
//       result: RollupBuild,
//     }
//   | { code: 'END' }
//   | { code: 'ERROR', error: RollupError, result: RollupBuild | null };

// export type RollupWatcher = AwaitingEventEmitter<{
//   change: (id: string, change: { event: ChangeEvent }) => void,
//   close: () => void,
//   event: (event: RollupWatcherEvent) => void,
//   restart: () => void,
// }>;

// export const watch = (config: RollupWatchOptions | RollupWatchOptions[]) =>
//   RollupWatcher;

type AstNode = $ReadOnly<{
  end: number,
  start: number,
  type: string,
}>;

// export type RollupOptionsFunction = (
//   commandLineArguments: Record<string, any>,
// ) => MaybePromise<RollupOptions | RollupOptions[]>;
