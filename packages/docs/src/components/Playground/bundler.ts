/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as esbuild from 'esbuild-wasm';
// @ts-ignore - CJS module
import path from 'path-browserify';
// @ts-ignore - CJS module
import { transform } from '@babel/standalone';
// @ts-ignore - CJS module
import reactRefreshBabelPlugin from 'react-refresh/babel';
import { BOOTSTRAP_HTML } from './demoConstants';

declare const STYLEX_SOURCE: string;
declare const ESBUILD_WASM_VERSION: string;

let esbuildReady = false;

export type BundlerClient = {
  bundle: (_transformedFiles: Record<string, string>, _css: string) => void;
  destroy: () => void;
};

export async function initBundler(
  iframe: HTMLIFrameElement,
  transformedFiles: Record<string, string>,
  css: string,
  onError: (_error: Error) => void,
): Promise<BundlerClient> {
  let currentBundleId = 0;

  iframe.srcdoc = BOOTSTRAP_HTML;

  const iframeReady = withResolvers<void>();

  const messageListener = (e: MessageEvent) => {
    if (e.data?.type === 'preview-ready') {
      iframeReady.resolve();
    } else if (e.data?.type === 'preview-error') {
      onError(new Error(e.data.message));
    }
  };

  window.addEventListener('message', messageListener);

  if (!esbuildReady) {
    await Promise.all([
      esbuild.initialize({
        wasmURL: `https://cdn.jsdelivr.net/npm/esbuild-wasm@${ESBUILD_WASM_VERSION}/esbuild.wasm`,
      }),
      iframeReady.promise,
    ]);
    esbuildReady = true;
  } else {
    await iframeReady.promise;
  }

  async function bundleAndSend(
    files: Record<string, string>,
    cssStr: string,
  ): Promise<void> {
    const id = ++currentBundleId;

    let js: string;
    try {
      js = await bundleFiles(files);
    } catch (e) {
      onError(e instanceof Error ? e : new Error(String(e)));
      return;
    }

    if (currentBundleId === id) {
      iframe.contentWindow?.postMessage(
        { type: 'preview-update', js, css: cssStr },
        '*',
      );
    }
  }

  await bundleAndSend(transformedFiles, css);

  return {
    bundle(files, cssStr) {
      bundleAndSend(files, cssStr);
    },
    destroy() {
      window.removeEventListener('message', messageListener);
    },
  };
}

async function bundleFiles(
  transformedFiles: Record<string, string>,
): Promise<string> {
  const virtualFS: Record<string, string> = {};

  for (const [filename, code] of Object.entries(transformedFiles)) {
    const jsName = `/${filename.replace(/\.tsx?$/, '.js')}`;
    virtualFS[jsName] = code;
  }

  const result = await esbuild.build({
    entryPoints: ['./App.js'],
    bundle: true,
    write: false,
    format: 'esm',
    jsx: 'automatic',
    plugins: [
      {
        name: 'stylex-playground',
        setup(build) {
          build.onResolve(
            { filter: /^react(-dom)?(\/.*)?$|^react\/jsx-runtime$/ },
            (args) => ({
              path: args.path,
              external: true,
            }),
          );

          build.onResolve({ filter: /^@stylexjs\/stylex$/ }, () => ({
            path: '@stylexjs/stylex',
            namespace: 'vendor',
          }));

          build.onLoad({ filter: /.*/, namespace: 'vendor' }, () => ({
            contents: STYLEX_SOURCE,
            loader: 'js',
          }));

          build.onResolve({ filter: /^\./ }, (args) => {
            let resolved = path.resolve(
              path.dirname(args.importer || '/'),
              args.path,
            );
            if (!virtualFS[resolved] && virtualFS[resolved + '.js']) {
              resolved += '.js';
            }
            if (!virtualFS[resolved]) {
              return {
                errors: [{ text: `Could not resolve "${args.path}"` }],
              };
            }
            return { path: resolved, namespace: 'virtual' };
          });

          build.onResolve({ filter: /.*/ }, (args) => ({
            errors: [
              {
                text: `Could not resolve "${args.path}". Only relative imports, @stylexjs/stylex, and react are supported.`,
              },
            ],
          }));

          // Transform separately so React Refresh instrumentation doesn't show in the "JS output" tab
          build.onLoad({ filter: /.*/, namespace: 'virtual' }, (args) => {
            const source = virtualFS[args.path] ?? '';
            const result = transform(source, {
              filename: args.path,
              plugins: [
                'syntax-jsx',
                [
                  reactRefreshBabelPlugin,
                  { skipEnvCheck: true, emitFullSignatures: true },
                ],
              ],
            });
            const contents = result.code as string;
            return { contents, loader: 'jsx' };
          });
        },
      },
    ],
  });

  return result.outputFiles[0]?.text ?? '';
}

// TODO replace with https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers when available
function withResolvers<T>() {
  let resolve!: (_value: T) => void;
  let reject!: (_reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve,
    reject,
  };
}
