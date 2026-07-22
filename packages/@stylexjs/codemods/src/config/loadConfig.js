/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * L0 config — loads a `stylex-codemod.config.js` (or an explicit path) into
 * the options the transform accepts. Missing file → defaults. Unknown keys
 * or wrong-typed values throw, so a typo fails loudly instead of silently
 * doing the wrong thing.
 *
 * M6 wires the two behavioral toggles that already have implementations:
 * `hoverGuard` (M2) and `logicalProperties` (M3a). `resolveValue`
 * (theme-token mapping) is reserved for the token slice and
 * is intentionally not part of this schema yet.
 */

import * as fs from 'fs';
import * as path from 'path';

export type CodemodConfig = {
  +hoverGuard: boolean,
  +logicalProperties: boolean,
};

export const DEFAULT_CONFIG: CodemodConfig = {
  hoverGuard: true,
  logicalProperties: true,
};

const DEFAULT_CONFIG_FILENAME = 'stylex-codemod.config.js';

const BOOLEAN_KEYS: $ReadOnlyArray<string> = [
  'hoverGuard',
  'logicalProperties',
];

export class ConfigError extends Error {
  constructor(message: string) {
    super(`[stylex-codemod config] ${message}`);
    this.name = 'ConfigError';
  }
}

/**
 * Resolves the config: an explicit `configPath`, else
 * `stylex-codemod.config.js` in `cwd`, else defaults.
 */
export function loadConfig(options?: {
  +cwd?: string,
  +configPath?: string | null,
}): CodemodConfig {
  const cwd = options?.cwd ?? process.cwd();
  const explicit = options?.configPath ?? null;
  const resolved =
    explicit != null
      ? path.resolve(cwd, explicit)
      : path.join(cwd, DEFAULT_CONFIG_FILENAME);

  if (!fs.existsSync(resolved)) {
    if (explicit != null) {
      throw new ConfigError(`config file not found: ${resolved}`);
    }
    return DEFAULT_CONFIG;
  }

  // $FlowFixMe[unsupported-syntax] - dynamic require of the user's config
  const loaded: mixed = require(resolved);
  return validateConfig(loaded, resolved);
}

/** Validates a plain object into a CodemodConfig, merging over defaults. */
export function validateConfig(raw: mixed, source: string): CodemodConfig {
  const object =
    raw != null && typeof raw === 'object' && raw.default != null
      ? raw.default
      : raw;
  if (object == null || typeof object !== 'object') {
    throw new ConfigError(`${source}: config must export an object`);
  }
  const merged: { [string]: boolean } = { ...DEFAULT_CONFIG };
  for (const key of Object.keys(object)) {
    if (!BOOLEAN_KEYS.includes(key)) {
      throw new ConfigError(
        `${source}: unknown option '${key}' (expected: ${BOOLEAN_KEYS.join(', ')})`,
      );
    }
    const value = object[key];
    if (typeof value !== 'boolean') {
      throw new ConfigError(`${source}: option '${key}' must be a boolean`);
    }
    merged[key] = value;
  }
  return {
    hoverGuard: merged.hoverGuard,
    logicalProperties: merged.logicalProperties,
  };
}
