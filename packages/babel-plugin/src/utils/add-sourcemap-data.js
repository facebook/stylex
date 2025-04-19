/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { NodePath } from '@babel/traverse';
import type { CompiledNamespaces, MutableCompiledNamespaces } from '../shared';

import * as t from '@babel/types';
import path from 'path';
import StateManager from './state-manager';

function getPackagePrefix(absolutePath: string): ?string {
  const nodeModulesIndex = absolutePath.indexOf('node_modules');
  if (nodeModulesIndex !== -1) {
    const packageName = absolutePath.substring(
      nodeModulesIndex + 'node_modules'.length + 1,
    );
    return packageName.split(path.sep)[0];
  }
  return undefined;
}

function getShortPath(relativePath: string): string {
  // Normalize slashes in the path and truncated
  return relativePath.split(path.sep).slice(-2).join('/');
}

function createShortFilename(
  absolutePath: string,
  state: StateManager,
): string {
  const isHaste = state.options.unstable_moduleResolution?.type === 'haste';
  const relativePath = path.relative(process.cwd(), absolutePath);
  // Construct a path based on package, moduleType, and file
  const packagePrefix = getPackagePrefix(absolutePath);
  if (packagePrefix) {
    const shortPath = getShortPath(relativePath);
    return `${packagePrefix}:${shortPath}`;
  } else {
    if (isHaste) {
      return path.basename(absolutePath);
    }
    return getShortPath(relativePath);
  }
}

/**
 * Adds sourceMap data to objects created with stylex.create.
 * Populates the '$$css' property, which the runtime uses to produce a
 * debug string.
 */
export function addSourceMapData(
  obj: CompiledNamespaces,
  babelPath: NodePath<t.CallExpression>,
  state: StateManager,
): CompiledNamespaces {
  const result: MutableCompiledNamespaces = {};
  for (const [key, value] of Object.entries(obj)) {
    // $FlowIgnore (this repo's flow_modules types for babel are incomplete)
    const currentFile = babelPath.hub.file;
    const sourceMap = currentFile.codeMap;

    // Find the line number of a given style object
    const styleNodePath = babelPath
      // $FlowIgnore
      .get('arguments.0.properties')
      // $FlowIgnore
      .find((prop) => {
        const k = prop.node.key;
        return (
          // string and number properties (normalized to string)
          (t.isIdentifier(k) && k.name === key) ||
          (t.isStringLiteral(k) && k.value === key) ||
          (t.isNumericLiteral(k) && String(k.value) === key)
        );
      });

    if (styleNodePath) {
      const generatedLineNumber = styleNodePath.node.loc?.start.line;

      // Find the original line number in the source
      let originalLineNumber = generatedLineNumber;
      if (sourceMap && originalLineNumber) {
        const originalPosition = sourceMap.originalPositionFor({
          line: generatedLineNumber,
          column: styleNodePath.node.loc?.start.column,
        });
        if (originalPosition && originalPosition.line !== null) {
          originalLineNumber = originalPosition.line;
        } else {
          console.warn(
            `Could not determine original line number for key: ${key}`,
          );
        }
      }

      // Add the file name and line number information to the compiled style
      const shortFilename = createShortFilename(
        currentFile.opts.filename || '',
        state,
      );
      result[key] = {
        ...value,
        $$css:
          shortFilename !== '' && originalLineNumber
            ? `${shortFilename}:${originalLineNumber}`
            : true,
      };
    } else {
      // fallback in case no sourcemap data is found
      result[key] = value;
    }
  }
  return result;
}
