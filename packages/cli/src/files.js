/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

// import type { Rule } from '@stylexjs/babel-plugin';

import fs from 'fs';
import path from 'path';
import errors from './errors';

// gets the directory for compiled styles (creates it if it doesn't exist)
export function makeCompiledDir(compiledDir: string): void {
  if (!fs.existsSync(compiledDir)) {
    console.log('made dir', compiledDir);
    fs.mkdirSync(compiledDir);
  }
}

export function getInputDirectoryFiles(inputDir: string): Array<string> {
  if (!fs.existsSync(inputDir)) {
    throw errors.dirNotFound;
  } else {
    const files = fs.readdirSync(inputDir, { recursive: true });
    return files.filter((file) => {
      const maybeDir = path.join(inputDir, file);
      return !isDir(maybeDir);
    });
  }
}

// takes in the compiled rules and writes them to a file at the top of the compiled directory
export function writeCompiledCSS(filePath: string, compiledCSS: string): void {
  fs.writeFileSync(filePath, compiledCSS);
}

export function writeCompiledJS(path: string, code: string): void {
  makeDirExistRecursive(path);
  fs.writeFileSync(path, code, {});
}

export function isDir(path: string): boolean {
  return fs.lstatSync(path).isDirectory();
}

function makeDirExistRecursive(filePath: string): ?boolean {
  const dirName = path.dirname(filePath);
  if (fs.existsSync(dirName)) {
    return true;
  }
  makeDirExistRecursive(dirName);
  fs.mkdirSync(dirName);
}
