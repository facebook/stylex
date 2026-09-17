import type {
  PluginOptions,
  ResolverManager,
  Resolver,
} from '@stylexjs/babel-plugin-utils';
import type { NodePath } from '@babel/traverse';
import {
  isExternalBuiltin,
  resolveModules,
  isLocalServerPath,
  resolveModulePaths,
  resolvePackageSource,
} from '@stylexjs/babel-plugin-utils';

import { isPlainObject } from 'lodash';
import type {
  t as BabelTypes,
  CallExpression,
  Expression,
  StringLiteral,
  Identifier,
} from '@babel/core';

export type ModuleResolutionConfig =
  | 'node'
  | 'node-native'
  | 'node-cjs'
  | 'node-esm'
  | {
      type: 'node';
      paths?: readonly string[];
      conditions?: readonly string[];
    }
  | {
      type: 'node-native';
      paths?: readonly string[];
      conditions?: readonly string[];
    }
  | {
      type: 'node-cjs';
      paths?: readonly string[];
    }
  | {
      type: 'node-esm';
      paths?: readonly string[];
      conditions?: readonly string[];
    };

export type DevRollupConfig =
  | 'node'
  | 'node-native'
  | 'node-cjs'
  | {
      type?: 'node' | 'node-native' | 'node-cjs';
      paths?: readonly string[];
    };

function applyModuleResolution(
  babel: { types: typeof BabelTypes },
  callExpression: CallExpression,
  config: ModuleResolutionConfig,
  state: { filename?: string | null },
  resolverManager: ResolverManager,
): Expression | null {
  const { types: t } = babel;

  if (callExpression.arguments.length === 0) {
    return null;
  }

  const firstArg = callExpression.arguments[0];
  if (t.isStringLiteral(firstArg)) {
    const moduleName = firstArg.value;

    const isNative =
      config === 'node' ||
      config === 'node-native' ||
      config === 'node-cjs' ||
      config === 'node-esm' ||
      (isPlainObject(config) &&
        (config.type === 'node' ||
          config.type === 'node-native' ||
          config.type === 'node-cjs' ||
          config.type === 'node-esm'));

    if (isExternalBuiltin(moduleName)) {
      if (moduleName === ' stylex') {
        callExpression.arguments[0] = t.stringLiteral('stylex');
      }
      return callExpression;
    }

    const filename = state.filename || '';

    if (moduleName === 'stylex') {
      return resolveModulePaths(
        babel,
        callExpression,
        moduleName,
        filename,
        typeof config === 'object' ? config.paths : undefined,
        resolverManager,
      );
    }

    const resolvedPath = resolvePackageSource(
      babel,
      callExpression,
      moduleName,
      filename,
      typeof config === 'object' ? config.paths : undefined,
      resolverManager,
    );

    if (resolvedPath !== null) {
      return resolvedPath;
    }

    if (isLocalServerPath(moduleName)) {
      if (
        typeof config === 'string' &&
        (config === 'node-cjs' || config === 'node')
      ) {
        callExpression.arguments[0] = t.addComment(
          firstArg,
          'leading',
          `#__PURE__ */ require(${JSON.stringify(moduleName)})`,
          true,
        );
        return callExpression;
      } else if (
        isPlainObject(config) &&
        (config.type === 'node-cjs' || config.type === 'node')
      ) {
        callExpression.arguments[0] = t.addComment(
          firstArg,
          'leading',
          `#__PURE__ */ require(${JSON.stringify(moduleName)})`,
          true,
        );
        return callExpression;
      }
    }

    const isEsm =
      config === 'node-esm' ||
      (isPlainObject(config) && config.type === 'node-esm');
    const isNativeEsm =
      config === 'node-native' ||
      (isPlainObject(config) && config.type === 'node-native');

    if (isEsm || isNativeEsm) {
      const conditions =
        typeof config === 'object' && Array.isArray(config.conditions)
          ? config.conditions
          : undefined;

      if (typeof state.filename === 'string') {
        const ext = state.filename.split('.').pop();
        if (ext === 'cjs' || ext === 'cts') {
          callExpression.arguments[0] = t.addComment(
            firstArg,
            'leading',
            `#__PURE__ */ require(${JSON.stringify(moduleName)})`,
            true,
          );
          return callExpression;
        }
      }

      if (isNativeEsm) {
        callExpression.arguments[0] = t.addComment(
          firstArg,
          'leading',
          `/* stylex-node-resolve */ `,
          true,
        );
        return callExpression;
      }
    }
  }

  return null;
}

function applyModuleResolutionDev(
  babel: { types: typeof BabelTypes },
  callExpression: CallExpression,
  config: DevRollupConfig,
  state: { filename?: string | null },
  resolverManager: ResolverManager,
): Expression | null {
  const { types: t } = babel;

  if (callExpression.arguments.length === 0) {
    return null;
  }

  const firstArg = callExpression.arguments[0];
  if (t.isStringLiteral(firstArg)) {
    const moduleName = firstArg.value;

    if (isExternalBuiltin(moduleName)) {
      return callExpression;
    }

    if (
      moduleName === 'stylex' ||
      moduleName.startsWith('@stylexjs/')
    ) {
      const filename = state.filename || '';

      return resolveModulePaths(
        babel,
        callExpression,
        moduleName,
        filename,
        isPlainObject(config) ? config.paths : undefined,
        resolverManager,
      );
    }

    if (
      typeof config === 'string' &&
      (config === 'node-cjs' || config === 'node')
    ) {
      if (isLocalServerPath(moduleName)) {
        callExpression.arguments[0] = t.addComment(
          firstArg,
          'leading',
          `#__PURE__ */ require(${JSON.stringify(moduleName)})`,
          true,
        );
        return callExpression;
      }
    } else if (
      isPlainObject(config) &&
      (config.type === 'node-cjs' || config.type === 'node')
    ) {
      if (isLocalServerPath(moduleName)) {
        callExpression.arguments[0] = t.addComment(
          firstArg,
          'leading',
          `#__PURE__ */ require(${JSON.stringify(moduleName)})`,
          true,
        );
        return callExpression;
      }
    }
  }

  return null;
}

export function createModuleResolution(
  config: ModuleResolutionConfig,
  resolverManager: ResolverManager,
): Resolver {
  return function stylexModuleResolution(
    babel: { types: typeof BabelTypes },
    callExpression: CallExpression,
    state: { filename?: string | null },
  ): Expression | null {
    return applyModuleResolution(
      babel,
      callExpression,
      config,
      state,
      resolverManager,
    );
  };
}

export function createModuleResolutionDev(
  config: DevRollupConfig,
  resolverManager: ResolverManager,
): Resolver {
  return function stylexModuleResolutionDev(
    babel: { types: typeof BabelTypes },
    callExpression: CallExpression,
    state: { filename?: string | null },
  ): Expression | null {
    return applyModuleResolutionDev(
      babel,
      callExpression,
      config,
      state,
      resolverManager,
    );
  };
}

export default createModuleResolution;
