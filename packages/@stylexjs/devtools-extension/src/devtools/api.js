/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import { devtools } from '../../flow-types/chrome.js';
import type {
  ExceptionInfo,
  InspectedWindowEvalOptions,
  Resource,
} from '../../flow-types/chrome.js';

export { devtools };
export type { ExceptionInfo, InspectedWindowEvalOptions, Resource };

export function evalInInspectedWindow<T>(
  fn: () => T,
  options?: InspectedWindowEvalOptions,
): Promise<T> {
  const expression = `(${fn.toString()})()`;
  const mergedOptions = { includeCommandLineAPI: true, ...options };

  return new Promise((resolve, reject) => {
    devtools.inspectedWindow.eval(
      expression,
      mergedOptions as any,
      (result, exceptionInfo) => {
        if (exceptionInfo && exceptionInfo.isException) {
          const msg =
            exceptionInfo.value != null
              ? `Error: ${String(exceptionInfo.value)}`
              : 'Error evaluating in inspected window.';
          reject(new Error(msg));
          return;
        }
        resolve(result as any as T);
      },
    );
  });
}

export function getResources(): Promise<Array<Resource>> {
  return new Promise((resolve) => {
    devtools.inspectedWindow.getResources((resources) => resolve(resources));
  });
}

export function getResourceText(resource: Resource): Promise<?string> {
  return new Promise((resolve) => {
    resource.getContent((content, encoding) => {
      if (encoding === 'base64' && typeof content === 'string') {
        try {
          resolve(atob(content));
        } catch {
          resolve(null);
        }
        return;
      }
      resolve(content);
    });
  });
}

export function openResource(url: string, lineZeroBased?: number): void {
  devtools.panels.openResource(url, lineZeroBased);
}
