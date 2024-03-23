/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Config } from './config';
import type { NodePath } from '@babel/traverse';
import { getRelativePath } from './files';
import { findModuleDir } from './modules';
import * as t from '@babel/types';

import * as nodePath from 'path';

type ImportPlugin = $ReadOnly<{
  visitor: {
    Program: { enter(path: NodePath<t.Program>): void },
  },
}>;

type ModuleImportModifierPlugin = $ReadOnly<{
  visitor: {
    ImportDeclaration: { enter(path: NodePath<t.ImportDeclaration>): void },
  },
}>;

export const createImportPlugin = (relativeImport: string): ImportPlugin => {
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
  compiledModules: Map<string, string>,
  outputFilePath: string,
  config: Config,
): ModuleImportModifierPlugin => {
  return {
    visitor: {
      ImportDeclaration: {
        enter(path: NodePath<t.ImportDeclaration>) {
          const source = path.node.source.value;
          const sourcePath = findModuleDir(source, config);
          const module = sourcePath.split('node_modules/').pop();
          const compiledModulePath = compiledModules.get(module);
          if (compiledModulePath == null) {
            return;
          }
          const compiledDirSplit =
            compiledModulePath.split(/(compiled_modules)/);
          compiledDirSplit.pop();
          const compiledDirPath = compiledDirSplit.join('') + `/${source}`;

          const relativePath = getRelativePath(
            nodePath.parse(outputFilePath).dir,
            compiledDirPath,
          );
          const newImport = t.importDeclaration(
            [...path.node.specifiers],
            t.stringLiteral(relativePath),
          );
          path.replaceWith<t.ImportDeclaration>(newImport);
        },
      },
    },
  };
};
