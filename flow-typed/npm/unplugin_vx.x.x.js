declare module 'unplugin' {
    // import * as _farmfe_core from '@farmfe/core';
    // import { JsPlugin, CompilationContext } from '@farmfe/core';
    // import * as _rspack_core_dist_config_types from '@rspack/core/dist/config/types';
    // import * as webpack from 'webpack';
    // import { Compiler, Compilation, LoaderContext, WebpackPluginInstance } from 'webpack';
    // export { Compiler as WebpackCompiler, WebpackPluginInstance } from 'webpack';
    // import * as rolldown_dist_types_plugin from 'rolldown/dist/types/plugin';
    // import * as vite from 'vite';
    // import { Plugin as Plugin$1 } from 'vite';
    // export { Plugin as VitePlugin } from 'vite';
    // import * as rollup from 'rollup';
    // import { SourceMapInput, EmittedAsset, AstNode, Plugin, PluginContextMeta } from 'rollup';
    // export { Plugin as RollupPlugin } from 'rollup';
    // import { Compiler as Compiler$1, Compilation as Compilation$1, LoaderContext as LoaderContext$1, RspackPluginInstance } from '@rspack/core';
    // export { Compiler as RspackCompiler, RspackPluginInstance } from '@rspack/core';
    // import * as esbuild from 'esbuild';
    // import { PluginBuild, OnLoadResult, Loader, BuildOptions, Plugin as Plugin$3 } from 'esbuild';
    // export { Plugin as EsbuildPlugin } from 'esbuild';
    // import { Plugin as any } from 'rolldown';
    // export { Plugin as RolldownPlugin } from 'rolldown';
    // import VirtualModulesPlugin from 'webpack-virtual-modules';

    type Plugin$1 = any;
    
    interface OnTransformOptions {
        filter: RegExp;
        namespace?: string;
    }
    interface OnTransformArgs {
        getContents: () => Promise<string>;
        path: string;
        namespace: string;
        suffix: string;
        pluginData: any;
        with: Record<string, string>;
    }
    type OnTransformCallback = (args: OnTransformArgs) => (any | null | void | Promise<any>);
    interface EsbuildPluginBuild {
        onTransform: (options: OnTransformOptions, callback: OnTransformCallback) => void;
    }
    
    declare export type Thenable<T> = T | Promise<T>;
    declare export interface SourceMapCompact {
        file?: string;
        mappings: string;
        names: string[];
        sourceRoot?: string;
        sources: string[];
        sourcesContent?: (string | null)[];
        version: number;
    }
    declare export type JsPluginExtended = {
        [key: string]: any;
        ...
    }
    declare export type TransformResult = ?string | {
        code: string;
        map?: any;
    };
    
    declare export interface ExternalIdResult {
        id: string;
        external?: boolean;
    }
    
    declare export type NativeBuildContext = {
        framework: 'webpack';
        compiler: any;
        compilation?: any;
        loaderContext?: any;
    } | {
        framework: 'esbuild';
        build: EsbuildPluginBuild;
    } | {
        framework: 'rspack';
        compiler: any;
        compilation: any;
        loaderContext?: any;
    } | {
        framework: 'farm';
        context: any;
    };
    declare export interface UnpluginBuildContext {
        addWatchFile: (id: string) => void;
        emitFile: (emittedFile: any) => void;
        getWatchFiles: () => string[];
        parse: (input: string, options?: any) => any;
        getNativeBuildContext?: () => NativeBuildContext;
    }
    declare export interface UnpluginOptions {
        name: string;
        enforce?: 'post' | 'pre' | void;
        buildStart?: (this: UnpluginBuildContext) => Promise<void> | void;
        buildEnd?: (this: UnpluginBuildContext) => Promise<void> | void;
        transform?: (this: UnpluginBuildContext & UnpluginContext, code: string, id: string) => Thenable<TransformResult>;
        load?: (this: UnpluginBuildContext & UnpluginContext, id: string) => Thenable<TransformResult>;
        resolveId?: (this: UnpluginBuildContext & UnpluginContext, id: string, importer: string | void, options: {
            isEntry: boolean;
        }) => Thenable<string | ExternalIdResult | null | void>;
        watchChange?: (this: UnpluginBuildContext, id: string, change: {
            event: 'create' | 'update' | 'delete';
        }) => void;
        writeBundle?: (this: void) => Promise<void> | void;
        /**
         * Custom predicate function to filter modules to be loaded.
         * When omitted, all modules will be included (might have potential perf impact on Webpack).
         */
        loadInclude?: (id: string) => ?boolean;
        /**
         * Custom predicate function to filter modules to be transformed.
         * When omitted, all modules will be included (might have potential perf impact on Webpack).
         */
        transformInclude?: (id: string) => ?boolean;
        rollup?: Partial<Plugin>;
        webpack?: (compiler: any) => void;
        rspack?: (compiler: any) => void;
        vite?: Partial<Plugin$1>;
        rolldown?: Partial<any>;
        esbuild?: {
            onResolveFilter?: RegExp;
            onLoadFilter?: RegExp;
            setup?: (build: any) => void | Promise<void>;
            loader?: any | ((code: string, id: string) => any);
            config?: (options: any) => void;
        };
        farm?: Partial<any>;
    }
    declare export interface ResolvedUnpluginOptions extends UnpluginOptions {
        __vfs?:  any;
        __vfsModules?: Set<string>;
        __virtualModulePrefix: string;
    }
    declare export type UnpluginFactory<UserOptions, Nested: boolean = boolean> = (options: UserOptions, meta: any) => Nested extends true ? Array<UnpluginOptions> : UnpluginOptions;
    declare export type UnpluginFactoryOutput<UserOptions, Return> = void extends UserOptions ? (options?: UserOptions) => Return : (options: UserOptions) => Return;
    declare export interface UnpluginInstance<UserOptions, Nested: boolean = boolean> {
        rollup: UnpluginFactoryOutput<UserOptions, Nested extends true ? Array<Plugin> : Plugin>;
        vite: UnpluginFactoryOutput<UserOptions, Nested extends true ? Array<Plugin$1> : Plugin$1>;
        rolldown: UnpluginFactoryOutput<UserOptions, Nested extends true ? Array<any> : any>;
        webpack: UnpluginFactoryOutput<UserOptions, any>;
        rspack: UnpluginFactoryOutput<UserOptions, any>;
        esbuild: UnpluginFactoryOutput<UserOptions, any>;
        farm: UnpluginFactoryOutput<UserOptions, any>;
        raw: UnpluginFactory<UserOptions, Nested>;
    }
    // declare export type UnpluginContextMeta = Partial<PluginContextMeta> & ({
    //     framework: 'rollup' | 'vite' | 'rolldown' | 'farm';
    // } | {
    //     framework: 'webpack';
    //     webpack: {
    //         compiler: Compiler;
    //     };
    // } | {
    //     framework: 'esbuild';
    //     /** @deprecated {getNativeBuildContext} */
    //     build?: EsbuildPluginBuild;
    //     /** Set the host plugin name of esbuild when returning multiple plugins */
    //     esbuildHostName?: string;
    // } | {
    //     framework: 'rspack';
    //     rspack: {
    //         compiler: Compiler$1;
    //     };
    // });
    declare export interface UnpluginMessage {
        name?: string;
        id?: string;
        message: string;
        stack?: string;
        code?: string;
        plugin?: string;
        pluginCode?: mixed;
        loc?: {
            column: number;
            file?: string;
            line: number;
        };
        meta?: any;
    }
    declare export interface UnpluginContext {
        error: (message: string | UnpluginMessage) => void;
        warn: (message: string | UnpluginMessage) => void;
    }
    // declare module 'webpack' {
    //     interface Compiler {
    //         $unpluginContext: Record<string, ResolvedUnpluginOptions>;
    //     }
    // }
    // declare module '@rspack/core' {
    //     interface Compiler {
    //         $unpluginContext: Record<string, ResolvedUnpluginOptions>;
    //     }
    // }
    
    declare export function createUnplugin<UserOptions, Nested: boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginInstance<UserOptions, Nested>;
    // declare export function createEsbuildPlugin<UserOptions, Nested: boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginFactoryOutput<UserOptions, esbuild.Plugin>;
    // declare export function createRollupPlugin<UserOptions, Nested: boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginFactoryOutput<UserOptions, Nested extends true ? rollup.Plugin<any>[] : rollup.Plugin<any>>;
    // declare export function createVitePlugin<UserOptions, Nested: boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginFactoryOutput<UserOptions, Nested extends true ? vite.Plugin<any>[] : vite.Plugin<any>>;
    // /** @experimental do not use it in production */
    // declare export function createRolldownPlugin<UserOptions, Nested: boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginFactoryOutput<UserOptions, Nested extends true ? rolldown_dist_types_plugin.Plugin<any>[] : rolldown_dist_types_plugin.Plugin<any>>;
    // declare export function createWebpackPlugin<UserOptions, Nested: boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginFactoryOutput<UserOptions, webpack.WebpackPluginInstance>;
    // declare export function createRspackPlugin<UserOptions, Nested: boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginFactoryOutput<UserOptions, _rspack_core_dist_config_types.RspackPluginInstance>;
    // declare function createFarmPlugin<UserOptions, Nested extends boolean = boolean>(factory: UnpluginFactory<UserOptions, Nested>): UnpluginFactoryOutput<UserOptions, _farmfe_core.JsPlugin>;
    
}
