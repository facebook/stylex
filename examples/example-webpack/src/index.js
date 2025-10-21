/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const domNode = document.getElementById('app');
const root = createRoot(domNode);
root.render(<App />);
