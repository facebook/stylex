/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
import * as stylex from '@stylexjs/stylex';

export const cardStyles = stylex.create({
  base: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e0e0e0',
    maxWidth: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  content: {
    fontSize: 14,
    lineHeight: 1.5,
    color: '#666',
  },
  elevated: {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
  },
});
