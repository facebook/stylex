/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { render, route } from 'rwsdk/router';
import { defineApp } from 'rwsdk/worker';

import './app/root.css';
import { Document } from '@/app/Document';
import { setCommonHeaders } from '@/app/headers';
import { Home } from '@/app/pages/Home';
import { Counter } from './app/pages/Counter';

export type AppContext = {};

export default defineApp([
  setCommonHeaders(),
  ({ ctx }) => {
    // setup ctx here
    ctx;
  },
  render(Document, [route('/', Home), route('/counter', Counter)]),
]);
