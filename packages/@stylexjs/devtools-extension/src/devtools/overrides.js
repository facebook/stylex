/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import { evalInInspectedWindowWithArgs } from './api.js';
import type { StylexOverride } from '../types.js';

type SwapClassArgs = {
  from: string,
  to: string,
};

type InlineStyleArgs = {
  property: string,
  value: string,
  important?: boolean,
};

type ClearInlineArgs = {
  property: string,
};

type SetOverridesArgs = {
  overrides: Array<StylexOverride>,
};

function swapClassNameInInspectedWindow({ from, to }: SwapClassArgs): boolean {
  const overrideElementKey = '__stylexDevtoolsOverrideElement__';
  // $FlowExpectedError[cannot-resolve-name]
  const current = typeof $0 !== 'undefined' ? $0 : null;
  const stored = (window: any)[overrideElementKey];
  const sameNode =
    stored &&
    current &&
    typeof stored.isSameNode === 'function' &&
    stored.isSameNode(current);
  if (!sameNode && current) {
    (window: any)[overrideElementKey] = current;
  }
  const element = sameNode
    ? stored
    : current ||
      (stored && typeof stored.isSameNode === 'function' ? stored : null);
  if (!element || !from || !to) return false;
  element.classList.remove(from);
  element.classList.add(to);
  return true;
}

function setInlineStyleInInspectedWindow({
  property,
  value,
  important,
}: InlineStyleArgs): boolean {
  const overrideElementKey = '__stylexDevtoolsOverrideElement__';
  // $FlowExpectedError[cannot-resolve-name]
  const current = typeof $0 !== 'undefined' ? $0 : null;
  const stored = (window: any)[overrideElementKey];
  const sameNode =
    stored &&
    current &&
    typeof stored.isSameNode === 'function' &&
    stored.isSameNode(current);
  if (!sameNode && current) {
    (window: any)[overrideElementKey] = current;
  }
  const element = sameNode
    ? stored
    : current ||
      (stored && typeof stored.isSameNode === 'function' ? stored : null);
  if (!element || !property) return false;
  element.style.setProperty(property, value, important ? 'important' : '');
  return true;
}

function clearInlineStyleInInspectedWindow({
  property,
}: ClearInlineArgs): boolean {
  const overrideElementKey = '__stylexDevtoolsOverrideElement__';
  // $FlowExpectedError[cannot-resolve-name]
  const current = typeof $0 !== 'undefined' ? $0 : null;
  const stored = (window: any)[overrideElementKey];
  const sameNode =
    stored &&
    current &&
    typeof stored.isSameNode === 'function' &&
    stored.isSameNode(current);
  if (!sameNode && current) {
    (window: any)[overrideElementKey] = current;
  }
  const element = sameNode
    ? stored
    : current ||
      (stored && typeof stored.isSameNode === 'function' ? stored : null);
  if (!element || !property) return false;
  element.style.removeProperty(property);
  return true;
}

function setStylexOverridesInInspectedWindow({
  overrides,
}: SetOverridesArgs): boolean {
  try {
    const overrideElementKey = '__stylexDevtoolsOverrideElement__';
    const overrideStoreKey = '__stylexDevtoolsOverrides__';
    // $FlowExpectedError[cannot-resolve-name]
    const current = typeof $0 !== 'undefined' ? $0 : null;
    const stored = (window: any)[overrideElementKey];
    const sameNode =
      stored &&
      current &&
      typeof stored.isSameNode === 'function' &&
      stored.isSameNode(current);
    if (!sameNode && current) {
      (window: any)[overrideElementKey] = current;
    }
    const element = sameNode
      ? stored
      : current ||
        (stored && typeof stored.isSameNode === 'function' ? stored : null);
    if (!element) return false;
    const existing = (window: any)[overrideStoreKey];
    const store: WeakMap<any, any> =
      existing && typeof existing.get === 'function' ? existing : new WeakMap();
    if (existing == null || existing !== store) {
      (window: any)[overrideStoreKey] = store;
    }
    if (!Array.isArray(overrides) || overrides.length === 0) {
      store.delete(element);
    } else {
      store.set(element, overrides);
    }
    return true;
  } catch {
    return false;
  }
}

export function swapClassName(args: SwapClassArgs): Promise<boolean> {
  return evalInInspectedWindowWithArgs(swapClassNameInInspectedWindow, args);
}

export function setInlineStyle(args: InlineStyleArgs): Promise<boolean> {
  return evalInInspectedWindowWithArgs(setInlineStyleInInspectedWindow, args);
}

export function clearInlineStyle(args: ClearInlineArgs): Promise<boolean> {
  return evalInInspectedWindowWithArgs(clearInlineStyleInInspectedWindow, args);
}

export function setStylexOverrides(
  overrides: Array<StylexOverride>,
): Promise<boolean> {
  return evalInInspectedWindowWithArgs(setStylexOverridesInInspectedWindow, {
    overrides,
  });
}
