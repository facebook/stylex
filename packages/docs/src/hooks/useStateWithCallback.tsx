/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
  useCallback,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

export function useStateWithCallback<T>(
  initialValue: T | (() => T),
): [T, (_newVal: T | ((_prev: T) => T), _cb?: (_latest: T) => void) => void] {
  const [state, setState] = useState(initialValue);
  const callbackRef = useRef<((_latest: T) => void)[]>([]);

  const setStateThen = useCallback(
    (newState: T | ((_old: T) => T), cb?: (_latest: T) => void) => {
      setState(newState);
      if (cb) {
        callbackRef.current.push(cb);
      }
    },
    [],
  );

  const runCallbacks = useEffectEvent(() => {
    callbackRef.current.forEach((cb) => cb(state));
    callbackRef.current = [];
  });

  useLayoutEffect(() => {
    runCallbacks();
  }, [state]);

  useLayoutEffect(() => {
    return () => {
      runCallbacks();
    };
  }, []);

  return [state, setStateThen];
}
