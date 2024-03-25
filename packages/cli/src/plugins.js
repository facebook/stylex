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
  config: Config,
): ImportModifierPlugin => {
  return {
    visitor: {
      Program: {
        enter(path: NodePath<t.Program>) {
          path.traverse({
            ImportDeclaration: {
              enter(path: NodePath<t.ImportDeclaration>) {
                const source = path.node.source.value;
                const sourcePath = findModuleDir(source, config);
                if (sourcePath == null) {
                  return;
                }
                const module = sourcePath.split('node_modules/').pop();
                if (config.modules != null && config.modules.includes(module)) {
                  const moduleDir = nodePath.join(
                    config.output,
                    'stylex_compiled_modules',
                    module,
                    source.split(module).pop(),
                  );

                  const relativePath = getRelativePath(filePath, moduleDir);
                  console.log(relativePath);
                  const newImport = t.importDeclaration(
                    [...path.node.specifiers],
                    t.stringLiteral(relativePath),
                  );

                  path.replaceWith<t.ImportDeclaration>(newImport);
                }
              },
            },
          });
        },
      },
    },
  };
};
