/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type { VarGroup } from '@stylexjs/stylex';

import * as stylex from '@stylexjs/stylex';

opaque type SemanticColorsTheme: 'theme' = 'theme';

const SemanticColors = {
  '--accent': null as null | string,
  '--accent-deemphasized': null as null | string,
  '--accent-emphasized': null as null | string,

  '--secondary-negative': null as null | string,
  '--secondary-negative-deemphasized': null as null | string,
  '--secondary-negative-emphasized': null as null | string,
  '--secondary-positive': null as null | string,
  '--secondary-positive-deemphasized': null as null | string,
  '--secondary-warning': null as null | string,
  '--secondary-warning-deemphasized': null as null | string,

  '--content-default': null as null | string,
  '--content-deemphasized': null as null | string,
  '--content-disabled': null as null | string,
  '--content-on-accent': null as null | string,
  '--content-action-default': null as null | string,
  '--content-action-emphasized': null as null | string,
  '--content-external-link': null as null | string,
  '--content-inverse': null as null | string,
  '--content-read': null as null | string,

  '--background-wash-plain': null as null | string,
  '--background-wash-inset': null as null | string,
  '--background-elevated-wash-plain': null as null | string,
  '--background-elevated-wash-inset': null as null | string,
  '--background-dimmer': null as null | string,

  '--surface-default': null as null | string,
  '--surface-emphasized': null as null | string,
  '--surface-elevated-default': null as null | string,
  '--surface-elevated-emphasized': null as null | string,
  '--surface-highlight': null as null | string,
  '--surface-inverse': null as null | string,
  '--surface-pressed': null as null | string,

  '--lines-divider': null as null | string,
  '--lines-outline-default': null as null | string,
  '--lines-outline-deemphasized': null as null | string,

  '--persistent-always-branded': null as null | string,
  '--persistent-always-black': null as null | string,
  '--persistent-always-white': null as null | string,
  '--persistent-activity-indicator': null as null | string,

  '--systems-bubble-surface-incoming': null as null | string,
  '--systems-bubble-surface-outgoing': null as null | string,
  '--systems-bubble-content-deemphasized': null as null | string,
  '--systems-bubble-surface-overlay': null as null | string,
  '--systems-bubble-surface-system': null as null | string,
  '--systems-bubble-surface-e2e': null as null | string,
  '--systems-bubble-content-e2e': null as null | string,
  '--systems-bubble-surface-business': null as null | string,
  '--systems-bubble-content-business': null as null | string,
  '--systems-chat-surface-composer': null as null | string,
  '--systems-chat-background-wallpaper': null as null | string,
  '--systems-chat-foreground-wallpaper': null as null | string,
  '--systems-chat-surface-tray': null as null | string,
  '--systems-status-seen': null as null | string,

  '--internal-components-surface-nav-bar': null as null | string,
  '--internal-components-active-list-row': null as null | string,
};

export type SemanticColorsType = typeof SemanticColors;
export type SemanticColorsFull = {
  [Key in keyof SemanticColorsType]: $NonMaybeType<SemanticColorsType[Key]>,
};

export const colors: VarGroup<SemanticColorsType, SemanticColorsTheme> =
  stylex.defineVars(SemanticColors);
