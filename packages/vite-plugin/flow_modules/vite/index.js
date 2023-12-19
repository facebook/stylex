/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as http from 'http';
import type { Http2SecureServer } from 'http2';
import type {
  Plugin as RollupPlugin,
  ObjectHook,
  TransformPluginContext,
  TransformResult,
  LoadResult,
  CustomPluginOptions,
  ResolveIdResult,
} from 'rollup';

import { Server } from 'connect';

type PluginOption =
  | Plugin
  | false
  | null
  | undefined
  | PluginOption[]
  | Promise<Plugin | false | null | undefined | PluginOption[]>;

type AppType = 'spa' | 'mpa' | 'custom';

interface ModuleNode {
  url: string;
  id: string | null;
  file: string | null;
  type: 'js' | 'css';
  info?: ModuleInfo;
  meta?: Record<string, any>;
  importers: Set<ModuleNode>;
  clientImportedModules: Set<ModuleNode>;
  ssrImportedModules: Set<ModuleNode>;
  acceptedHmrDeps: Set<ModuleNode>;
  acceptedHmrExports: Set<string> | null;
  importedBindings: Map<string, Set<string>> | null;
  isSelfAccepting?: boolean;
  transformResult: TransformResult | null;
  ssrTransformResult: TransformResult | null;
  ssrModule: Record<string, any> | null;
  ssrError: Error | null;
  lastHMRTimestamp: number;
  lastInvalidationTimestamp: number;
}

interface ModuleGraph {
  getModuleByUrl(
    rawUrl: string,
    ssr?: boolean,
  ): Promise<ModuleNode | undefined>;
  getModuleById(id: string): ModuleNode | undefined;
  getModulesByFile(file: string): Set<ModuleNode> | undefined;
  onFileChange(file: string): void;
  invalidateModule(
    mod: ModuleNode,
    seen?: Set<ModuleNode>,
    timestamp?: number,
    isHmr?: boolean,
  ): void;
  invalidateAll(): void;
  updateModuleInfo(
    mod: ModuleNode,
    importedModules: Set<string | ModuleNode>,
    importedBindings: Map<string, Set<string>> | null,
    acceptedModules: Set<string | ModuleNode>,
    acceptedExports: Set<string> | null,
    isSelfAccepting: boolean,
    ssr?: boolean,
  ): Promise<Set<ModuleNode> | undefined>;
  ensureEntryFromUrl(
    rawUrl: string,
    ssr?: boolean,
    setIsSelfAccepting?: boolean,
  ): Promise<ModuleNode>;
  createFileOnlyEntry(file: string): ModuleNode;
  resolveUrl(url: string, ssr?: boolean): Promise<ResolvedUrl>;
}

type ResolvedConfig = $ReadOnly<{
  root: string,
  base: string,
  publicDir: string,
  cacheDir: string,
  command: 'build' | 'serve',
  mode: string,
  isWorker: boolean,
  isProduction: boolean,
  envDir: string,
  plugins: $ReadOnly<Plugin[]>,
  appType: AppType,
}>;

type HttpServer = http.Server | Http2SecureServer;

export interface ViteDevServer {
  config: ResolvedConfig;
  middlewares: Server;
  httpServer: HttpServer | null;
  moduleGraph: ModuleGraph;
}

type ServerHook = (
  this: void,
  server: ViteDevServer,
) => (() => void) | void | Promise<(() => void) | void>;

export type Plugin<A = any> = {
  ...RollupPlugin<A>,
  enforce?: 'pre' | 'post',
  configResolved?: ObjectHook<
    (this: void, config: ResolvedConfig) => void | Promise<void>,
  >,
  configureServer?: ObjectHook<ServerHook>,
  resolveId?: ObjectHook<
    (
      this: PluginContext,
      source: string,
      importer: string | undefined,
      options: {
        attributes: Record<string, string>,
        custom?: CustomPluginOptions,
        ssr?: boolean,
        isEntry: boolean,
      },
    ) => Promise<ResolveIdResult> | ResolveIdResult,
  >,
  load?: ObjectHook<
    (
      this: PluginContext,
      id: string,
      options?: {
        ssr?: boolean,
      },
    ) => Promise<LoadResult> | LoadResult,
  >,
  transform?: ObjectHook<
    (
      this: TransformPluginContext,
      code: string,
      id: string,
      options?: { ssr?: boolean },
    ) => Promise<TransformResult> | TransformResult,
  >,
};

declare export function createFilter(
  include?: string | RegExp | $ReadOnlyArray<string | RegExp>,
  exclude?: string | RegExp | $ReadOnlyArray<string | RegExp>,
  options?: { resolve?: string | false | null },
): (id: string | unknown) => boolean;
