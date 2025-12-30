#!/usr/bin/env node
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'fs';
import path from 'path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const out = path.join(root, '.vercel/output');

fs.rmSync(out, { recursive: true, force: true });

fs.mkdirSync(path.join(out, 'static'), { recursive: true });
fs.mkdirSync(path.join(out, 'functions'), { recursive: true });

fs.cpSync(path.join(dist, 'public'), path.join(out, 'static'), {
  recursive: true,
});

fs.cpSync(path.join(dist, 'server'), path.join(out, 'functions'), {
  recursive: true,
});
