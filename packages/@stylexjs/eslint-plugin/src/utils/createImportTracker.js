/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type { ImportDeclaration } from 'estree';

export type ValidImportSource =
  | string
  | {
      from: string,
      as: string,
    };

type ImportTracker = {
  ImportDeclaration: (node: ImportDeclaration) => void,
  isStylexDefaultImport: (name: string) => boolean,
  isStylexNamedImport: (importName: string, name: string) => boolean,
  clear: () => void,
};

export default function createImportTracker(
  importsToLookFor: Array<ValidImportSource>,
): ImportTracker {
  const styleXDefaultImports = new Set<string>();
  const styleXNamedImports = new Map<string, Set<string>>();

  function handleImportDeclaration(node: ImportDeclaration) {
    if (
      node.source.type !== 'Literal' ||
      typeof node.source.value !== 'string'
    ) {
      return;
    }

    const foundImportSource = importsToLookFor.find((importSource) => {
      if (typeof importSource === 'string') {
        return importSource === node.source?.value;
      }
      return importSource.from === node.source?.value;
    });

    if (!foundImportSource) {
      return;
    }

    if (typeof foundImportSource === 'string') {
      node.specifiers.forEach((specifier) => {
        if (
          specifier.type === 'ImportDefaultSpecifier' ||
          specifier.type === 'ImportNamespaceSpecifier'
        ) {
          styleXDefaultImports.add(specifier.local.name);
        }

        if (specifier.type === 'ImportSpecifier') {
          const importName = specifier.imported.name;
          if (!styleXNamedImports.has(importName)) {
            styleXNamedImports.set(importName, new Set());
          }
          styleXNamedImports.get(importName)?.add(specifier.local.name);
        }
      });
    }

    if (typeof foundImportSource === 'object') {
      node.specifiers.forEach((specifier) => {
        if (specifier.type === 'ImportSpecifier') {
          if (specifier.imported.name === foundImportSource.as) {
            styleXDefaultImports.add(specifier.local.name);
          }
        }
      });
    }
  }

  function isStylexDefaultImport(name: string): boolean {
    return styleXDefaultImports.has(name);
  }

  function isStylexNamedImport(importName: string, name: string): boolean {
    return styleXNamedImports.get(importName)?.has(name) ?? false;
  }

  function clear() {
    styleXDefaultImports.clear();
    styleXNamedImports.clear();
  }

  return {
    ImportDeclaration: handleImportDeclaration,
    isStylexDefaultImport,
    isStylexNamedImport,
    clear,
  };
}
