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

import * as nodePath from 'path';

type ImportModifierPlugin = $ReadOnly<{
  visitor: {
    Program: { enter(path: NodePath<t.Program>): void },
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
          path.node.body.unshift(importDeclaration);
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
