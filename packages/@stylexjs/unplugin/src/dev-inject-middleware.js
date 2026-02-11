/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { DEV_RUNTIME_SCRIPT, DEV_RUNTIME_PATH } from './consts';

export const devInjectMiddleware = (
  req: Request,
  res: any,
  next: () => void,
): void => {
  if (!req.url) return next();
  if (req.url.startsWith(DEV_RUNTIME_PATH)) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/javascript');
    res.end(DEV_RUNTIME_SCRIPT);
    return;
  }
  next();
};
