/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */
import type { Rule } from '@stylexjs/babel-plugin';

import * as babel from '@babel/core';
import styleXPlugin from '@stylexjs/babel-plugin';
import { getCssPathFromFilePath } from './files';

export async function transformFile(
  dir: string,
  fileName: string,
): Promise<[?string, Array<Rule>]> {
  const relativeImport = getCssPathFromFilePath(fileName);
  // $FlowFixMe[prop-missing]
  // $FlowFixMe[incompatible-use] Is there flow typing for babel?
  const importDeclaration = babel.template.statement.ast(
    `import '${relativeImport}';`,
  );

  const addImportPlugin = () => ({
    visitor: {
      Program: {
        enter(path: any) {
          path.node.body.unshift(importDeclaration);
        },
      },
    },
  });

  const result = await babel.transformFileAsync(fileName, {
    plugins: [styleXPlugin, addImportPlugin],
  });
  // $FlowFixMe
  const { code, metadata } = result;
  // $FlowFixMe
  const styleXRules: Array<Rule> = metadata.stylex;
  return [code, styleXRules];
}

export async function compileRules(rules: Array<Rule>): Promise<string> {
  return styleXPlugin.processStylexRules(rules);
}
