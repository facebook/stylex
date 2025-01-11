/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { ModuleType, TransformConfig } from './config';
import type { NodePath } from '@babel/traverse';
import { getRelativePath } from './files';
import { findModuleDir } from './modules';
import * as t from '@babel/types';
import { moduleResolve } from '@dual-bundle/import-meta-resolve';
import url from 'url';

import * as nodePath from 'path';

type ImportModifierPlugin = $ReadOnly<{
  visitor: {
    Program: {
      enter?: (path: NodePath<t.Program>) => void,
      exit?: (path: NodePath<t.Program>) => void,
    },
  },
}>;

export const createImportPlugin = (
  relativeImport: string,
): ImportModifierPlugin => {
  const importDeclaration = t.importDeclaration(
    [],
    t.stringLiteral(relativeImport),
  );

  return {
    visitor: {
      Program: {
        enter(path: NodePath<t.Program>) {
          const lastImportIndex = path.node.body.findLastIndex((node) =>
            t.isImportDeclaration(node),
          );
          if (lastImportIndex === -1) {
            path.node.body.unshift(importDeclaration);
          } else {
            path.node.body.splice(lastImportIndex + 1, 0, importDeclaration);
          }
        },
      },
    },
  };
};

/**
 * transforms
 * import {item} from 'module'
 * into
 * import {item} from './compiled_modules/module'
 */
export const createModuleImportModifierPlugin = (
  filePath: string,
  config: TransformConfig,
): ImportModifierPlugin => {
  return {
    visitor: {
      Program: {
        enter(path: NodePath<t.Program>) {
          path.traverse({
            ImportDeclaration: {
              enter(path: NodePath<t.ImportDeclaration>) {
                if (
                  config.modules_EXPERIMENTAL == null ||
                  config.modules_EXPERIMENTAL.length === 0
                ) {
                  return;
                }
                const source = path.node.source.value;
                const includesModule = config.modules_EXPERIMENTAL.some(
                  (configModule: ModuleType) => {
                    if (Array.isArray(configModule)) {
                      return configModule[0] === source;
                    }
                    return configModule === source;
                  },
                );
                if (!includesModule) {
                  return;
                }
                const sourcePath = findModuleDir(source, config);
                if (sourcePath == null) {
                  throw new Error(
                    `[stylex] error: could not find source for module {${source}`,
                  );
                }
                const module = sourcePath.split('node_modules/').pop() ?? '';
                const moduleDir = config.state.compiledNodeModuleDir
                  ? nodePath.join(
                      config.state.compiledNodeModuleDir,
                      module,
                      source.split(module).pop() ?? '',
                    )
                  : nodePath.join(
                      config.output,
                      'stylex_compiled_modules',
                      module,
                      source.split(module).pop() ?? '',
                    );
                const relativePath = getRelativePath(filePath, moduleDir);
                const newImport = t.importDeclaration(
                  [...path.node.specifiers],
                  t.stringLiteral(relativePath),
                );

                path.replaceWith<t.ImportDeclaration>(newImport);
              },
            },
          });
        },
      },
    },
  };
};

export const createAliasRewritePlugin = (
  sourceFilePath: string,
  aliasConfig: $ReadOnly<{ [string]: string | $ReadOnlyArray<string> }>,
): ImportModifierPlugin => {
  return {
    visitor: {
      Program: {
        exit(path: NodePath<t.Program>) {
          path.traverse({
            ImportDeclaration: {
              enter(path: NodePath<t.ImportDeclaration>) {
                const source = path.node.source.value;

                const aliases =
                  aliasConfig == null
                    ? aliasConfig
                    : Object.fromEntries(
                        Object.entries(aliasConfig).map(([key, value]) => {
                          if (typeof value === 'string') {
                            return [key, [value]];
                          }
                          return [key, value];
                        }),
                      );

                const themeFileExtension = '.stylex';
                if (!matchesFileSuffix(themeFileExtension)(source)) {
                  return;
                }
                const resolvedFilePath = filePathResolver(
                  source,
                  sourceFilePath,
                  aliases,
                );

                if (resolvedFilePath == null) {
                  return;
                }

                let relativeFilePath = getRelativePath(
                  sourceFilePath,
                  resolvedFilePath,
                );

                const extension = EXTENSIONS.find((ext) =>
                  relativeFilePath.endsWith(ext),
                );
                if (extension != null) {
                  relativeFilePath = relativeFilePath.slice(
                    0,
                    -extension.length,
                  );
                }

                path.node.source.value = relativeFilePath;
              },
            },
          });
        },
      },
    },
  };
};

const matchesFileSuffix = (allowedSuffix: string) => (filename: string) =>
  filename.endsWith(`${allowedSuffix}.js`) ||
  filename.endsWith(`${allowedSuffix}.ts`) ||
  filename.endsWith(`${allowedSuffix}.tsx`) ||
  filename.endsWith(`${allowedSuffix}.jsx`) ||
  filename.endsWith(`${allowedSuffix}.mjs`) ||
  filename.endsWith(`${allowedSuffix}.cjs`) ||
  filename.endsWith(allowedSuffix);

const EXTENSIONS = ['.js', '.ts', '.tsx', '.jsx', '.mjs', '.cjs'];
const filePathResolver = (
  relativeFilePath: string,
  sourceFilePath: string,
  aliases: $ReadOnly<{ [string]: $ReadOnlyArray<string> }>,
): ?string => {
  // Try importing without adding any extension
  // and then every supported extension
  for (const ext of ['', ...EXTENSIONS]) {
    const importPathStr = relativeFilePath + ext;

    // Try to resolve relative paths as is
    if (importPathStr.startsWith('.')) {
      try {
        return moduleResolve(importPathStr, url.pathToFileURL(sourceFilePath))
          .pathname;
      } catch {
        continue;
      }
    }

    // Otherwise, try to resolve the path with aliases
    const allAliases = possibleAliasedPaths(importPathStr, aliases);
    for (const possiblePath of allAliases) {
      try {
        return moduleResolve(possiblePath, url.pathToFileURL(sourceFilePath))
          .pathname;
      } catch {
        continue;
      }
    }
  }
  // Failed to resolve the file path
  return null;
};

function possibleAliasedPaths(
  importPath: string,
  aliases: $ReadOnly<{ [string]: $ReadOnlyArray<string> }>,
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
