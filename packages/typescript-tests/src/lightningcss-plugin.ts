/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { transform, type Visitor } from 'lightningcss';
import {
  createConditionVisitor,
  simplifyConditions,
} from '@stylexjs/lightningcss-plugin';

const visitor: Visitor<{}> = createConditionVisitor();

transform({ filename: 'stylex.css', code: new Uint8Array(), visitor });

simplifyConditions({
  filename: 'stylex.css',
  code: new Uint8Array(),
  minify: true,
  sourceMap: true,
});
