/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import { useLayoutEffect, useRef } from 'react';

export default function useViewTransition() {
  const promise = useRef(null);
  const transition = useRef(null);

  useLayoutEffect(() => {
    if (promise.current) {
      promise.current.resolve();
      promise.current = null;
      transition.current = null;
    }
    () => {
      if (promise.current) {
        promise.current.resolve();
        promise.current = null;
      }
      if (transition.current) {
        transition.current.skipTransition();
      }
    };
  });

  const withAnimation = (callback) => {
    if (!document.startViewTransition) {
      callback();
      return;
    }

    transition.current = document.startViewTransition(
      () =>
        new Promise((resolve, reject) => {
          promise.current = { resolve, reject };
          callback();
        }),
    );
  };

  return withAnimation;
}
