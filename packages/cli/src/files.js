/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import fs from 'fs';
import path from 'path';
import errors from './errors';

// $FlowFixMe
import { mkdirp } from 'mkdirp';

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

export function writeCompiledCSS(filePath: string, compiledCSS: string): void {
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath);
  }
  mkdirp.sync(path.parse(filePath).dir);
  fs.writeFileSync(filePath, compiledCSS);
}

export function writeCompiledJS(filePath: string, code: string): string {
  const parsedFile = path.parse(filePath);
  mkdirp.sync(parsedFile.dir);
  if (parsedFile.ext !== '.js') {
    parsedFile.ext = '.js';
  }
  const newPath = path.join(
    parsedFile.dir,
    `${parsedFile.name}${parsedFile.ext}`,
  );
  fs.writeFileSync(newPath, code, {});

  return newPath;
}

export function copyFile(src: string, dst: string) {
  mkdirp.sync(path.parse(dst).dir);
  fs.copyFileSync(src, dst);
}

export function isDir(filePath: string): boolean {
  return fs.statSync(filePath).isDirectory();
}

export function isJSFile(filePath: string): boolean {
  const parsed = path.parse(filePath);
  return (
    parsed.ext === '.js' ||
    parsed.ext === '.ts' ||
    parsed.ext === '.jsx' ||
    parsed.ext === '.tsx' ||
    parsed.ext === '.cjs' ||
    parsed.ext === '.mjs'
  );
}

// e.g. ./pages/home/index.js -> ../../stylex_bundle.css
export function getRelativePath(from: string, to: string): string {
  const relativePath = path.relative(path.parse(from).dir, to);
  return formatRelativePath(relativePath);
}

function formatRelativePath(filePath: string) {
  return filePath.startsWith('.') ? filePath : './' + filePath;
}
