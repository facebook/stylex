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
  '--accent': 'blue',
  '--accent-deemphasized': '#4B91F1',
  '--accent-emphasized': 'blue',

  '--secondary-negative': '#FF3B30',
  '--secondary-negative-deemphasized': '#FF6B61',
  '--secondary-negative-emphasized': '#D63029',
  '--secondary-positive': '#34C759',
  '--secondary-positive-deemphasized': '#65D683',
  '--secondary-warning': '#FFCC00',
  '--secondary-warning-deemphasized': '#FFD633',

  '--content-default': '#000000',
  '--content-deemphasized': '#666666',
  '--content-disabled': '#999999',
  '--content-on-accent': '#FFFFFF',
  '--content-action-default': '#0A84FF',
  '--content-action-emphasized': '#007AFF',
  '--content-external-link': '#0A84FF',
  '--content-inverse': '#FFFFFF',
  '--content-read': '#8E8E93',

  '--background-wash-plain': '#F2F2F7',
  '--background-wash-inset': '#E5E5EA',
  '--background-elevated-wash-plain': '#F8F8F8',
  '--background-elevated-wash-inset': '#EBEBEB',
  '--background-dimmer': 'rgba(0, 0, 0, 0.4)',

  '--surface-default': '#FFFFFF',
  '--surface-emphasized': '#F2F2F7',
  '--surface-elevated-default': '#FFFFFF',
  '--surface-elevated-emphasized': '#F2F2F7',
  '--surface-highlight': 'rgba(0, 122, 255, 0.1)',
  '--surface-inverse': '#000000',
  '--surface-pressed': 'rgba(0, 0, 0, 0.1)',

  '--lines-divider': '#C6C6C8',
  '--lines-outline-default': '#C6C6C8',
  '--lines-outline-deemphasized': '#E5E5EA',

  '--persistent-always-branded': '#007AFF',
  '--persistent-always-black': '#000000',
  '--persistent-always-white': '#FFFFFF',
  '--persistent-activity-indicator': '#007AFF',

  '--systems-bubble-surface-incoming': '#E9E9EB',
  '--systems-bubble-surface-outgoing': '#007AFF',
  '--systems-bubble-content-deemphasized': '#8E8E93',
  '--systems-bubble-surface-overlay': 'rgba(0, 0, 0, 0.5)',
  '--systems-bubble-surface-system': '#F2F2F7',
  '--systems-bubble-surface-e2e': '#34C759',
  '--systems-bubble-content-e2e': '#FFFFFF',
  '--systems-bubble-surface-business': '#5856D6',
  '--systems-bubble-content-business': '#FFFFFF',
  '--systems-chat-surface-composer': '#FFFFFF',
  '--systems-chat-background-wallpaper': '#FFFFFF',
  '--systems-chat-foreground-wallpaper': '#000000',
  '--systems-chat-surface-tray': '#F2F2F7',
  '--systems-status-seen': '#007AFF',

  '--internal-components-surface-nav-bar': '#F9F9F9',
  '--internal-components-active-list-row': '#F2F2F7',
};

export type SemanticColorsType = typeof SemanticColors;

export const colors: VarGroup<SemanticColorsType, SemanticColorsTheme> =
  stylex.defineVars(SemanticColors);
