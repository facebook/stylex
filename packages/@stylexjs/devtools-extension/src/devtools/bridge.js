/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {
  OverrideCommand,
  OverrideMutationResult,
  SourcePreview,
  StylexDebugData,
} from '../types';

import { devtools } from './browserApi';
import { collectDebugData, mutateOverride } from './inspectedClient';
import {
  getSourcePreview,
  invalidateSourceCache,
  openSource,
  supportsOpenResource,
  supportsSourcePreview,
} from './sourceResources';

export type DevtoolsBridge = {
  capabilities: {
    openSource: boolean,
    sourcePreview: boolean,
  },
  collect: () => Promise<StylexDebugData>,
  mutate: (command: OverrideCommand) => Promise<OverrideMutationResult>,
  getSourcePreview: (
    file: string,
    line: number | null,
  ) => Promise<SourcePreview>,
  openSource: (file: string, line: number | null) => Promise<void>,
  subscribe: (callback: () => mixed) => () => void,
};

function subscribe(callback: () => mixed): () => void {
  const selectionEvent = devtools.panels?.elements?.onSelectionChanged;
  const navigationEvent = devtools.network?.onNavigated;
  const handleNavigation = () => {
    invalidateSourceCache();
    callback();
  };

  selectionEvent?.addListener(callback);
  navigationEvent?.addListener(handleNavigation);

  return () => {
    selectionEvent?.removeListener(callback);
    navigationEvent?.removeListener(handleNavigation);
  };
}

export const devtoolsBridge: DevtoolsBridge = {
  capabilities: {
    openSource: supportsOpenResource && supportsSourcePreview,
    sourcePreview: supportsSourcePreview,
  },
  collect: collectDebugData,
  mutate: mutateOverride,
  getSourcePreview,
  openSource,
  subscribe,
};
