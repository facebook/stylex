/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

export type StatusKind = 'info' | 'error';

export type StatusState = {
  message: string,
  kind: StatusKind,
};

export type StylexSource = {
  raw: string,
  file: string,
  line: number | null,
};

export type StylexDeclaration = {
  property: string,
  value: string,
  important: boolean,
  condition?: string,
  conditions?: $ReadOnlyArray<string>,
  pseudoElement?: string,
  className?: string,
  ...
};

export type AppliedStylexClass = {
  name: string,
  declarations: Array<StylexDeclaration>,
};

export type AtomicStyleRule = {
  className: string,
  property: string,
  value: string,
  important: boolean,
  conditions: Array<string>,
  pseudoElement?: string,
};

export type StylexDebugData = $ReadOnly<{
  element: {
    tagName: string,
  },
  sources: Array<StylexSource>,
  computed: { [string]: string, ... },
  atomicRules: Array<AtomicStyleRule>,
  overrides: Array<StylexOverride>,
  applied: {
    classes: Array<AppliedStylexClass>,
  },
}>;

export type SourcePreview = {
  url: string,
  snippet: string,
};

export type StylexOverride = {
  id: string,
  kind: 'inline' | 'class',
  property: string,
  value: string,
  important: boolean,
  conditions: Array<string>,
  pseudoElement?: string,
  className?: string,
  originalClassName?: string,
  sourceEntryKey?: string,
};
