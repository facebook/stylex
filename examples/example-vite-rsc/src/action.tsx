/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use server';

let serverCounter = 0;

export async function getServerCounter() {
  return serverCounter;
}

export async function updateServerCounter(change: number) {
  serverCounter += change;
}
