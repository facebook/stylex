/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CustomAtRules, TransformOptions, TransformResult, Visitor } from 'lightningcss';

export declare function createConditionVisitor<C extends CustomAtRules = CustomAtRules>(): Visitor<C>;
export declare function simplifyConditions<C extends CustomAtRules = CustomAtRules>(options: TransformOptions<C>): TransformResult;
