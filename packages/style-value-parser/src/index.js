/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export * as tokenParser from './token-parser';
export * as properties from './properties';
export { lastMediaQueryWinsTransform } from './at-queries/media-query-transform.js';
export { MediaQuery } from './at-queries/media-query.js';
export type { MediaQueryRule } from './at-queries/media-query.js';

export {
  parseAtRule,
  serializeAtRule,
  simplifyAtRule,
  subtractAtRule,
} from './at-queries/condition-at-rule';
export type { AtRule } from './at-queries/condition-at-rule';
export {
  parseCondition,
  andConditions,
  orConditions,
  notCondition,
  simplifyCondition,
  serializeCondition,
  conditionBranches,
  isTotalMediaCondition,
} from './at-queries/condition';
export type { Condition } from './at-queries/condition';

export {
  deferCondition,
  resolveDeferredConditions,
} from './at-queries/deferred-condition';
