/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';

export const FIXTURES_DIR: string = path.join(
  __dirname,
  '..',
  '..',
  '__fixtures__',
);

/**
 * Normalizes code through the Prettier CLI so fixture comparison is
 * byte-exact but formatting-insensitive.
 *
 * Deliberately the CLI via spawnSync, NOT the Node API: Prettier 3's Node
 * API is async-only and breaks under Jest's module sandbox.
 */
export function formatWithPrettier(code: string, filepath: string): string {
  // $FlowFixMe[cannot-resolve-module] - untyped bin file
  const bin = require.resolve('prettier/bin/prettier.cjs');
  const result = spawnSync(
    process.execPath,
    [bin, '--stdin-filepath', filepath],
    { input: code, encoding: 'utf8' },
  );
  if (result.status !== 0) {
    throw new Error(
      `prettier failed for ${filepath}:\n${String(result.stderr)}`,
    );
  }
  // String(): Flow types spawnSync stdout as string | Buffer.
  return String(result.stdout);
}

export type Fixture = {
  name: string,
  inputPath: string,
  expectedPath: string,
  input: string,
  expected: string,
};

/** Discovers all input/expected fixture pairs for an adapter. */
export function loadFixtures(adapter: string): Array<Fixture> {
  const dir = path.join(FIXTURES_DIR, adapter);
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      // String(): Flow's Dirent libdef types `name` as string | Buffer.
      const name = String(entry.name);
      const inputPath = path.join(dir, name, 'input.js');
      const expectedPath = path.join(dir, name, 'expected.js');
      return {
        name,
        inputPath,
        expectedPath,
        input: fs.readFileSync(inputPath, 'utf8'),
        expected: fs.readFileSync(expectedPath, 'utf8'),
      };
    });
}

export function readBrokenFixture(name: string): string {
  return fs.readFileSync(path.join(FIXTURES_DIR, 'broken', name), 'utf8');
}
