import {
  useCallback,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

export function useStateWithCallback<T>(
  initialValue: T | (() => T),
): [T, (newVal: T | ((prev: T) => T), cb?: (latest: T) => void) => void] {
  const [state, setState] = useState(initialValue);
  const callbackRef = useRef<((latest: T) => void)[]>([]);

  const setStateThen = useCallback(
    (newState: T | ((old: T) => T), cb?: (latest: T) => void) => {
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
