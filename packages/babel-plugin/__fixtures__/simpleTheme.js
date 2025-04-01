/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Theme } from '@stylexjs/stylex';
import { colors } from './colors.stylex';
import * as stylex from '@stylexjs/stylex';

export const WDSSystemTheme: Theme<typeof colors> = stylex.createTheme(colors, {
  '--accent': '#1DAA61',
  '--accent-deemphasized': '#D9FDD3',
  '--accent-emphasized': '#15603E',
  '--secondary-negative': '#EA0038',
  '--secondary-negative-deemphasized': '#FDE8EB',
  '--secondary-negative-emphasized': '#B80531',
  '--secondary-positive': '#1DAA61',
  '--secondary-positive-deemphasized': '#E7FCE3',
  '--secondary-warning': '#FFB938',
  '--secondary-warning-deemphasized': '#FFF7E5',
  '--content-default': '#0A0A0A',
  '--content-deemphasized': 'rgba(0, 0, 0, 0.6)',
  '--content-disabled': '#BDBDBD',
  '--content-on-accent': '#FFFFFF',
  '--content-action-default': '#0A0A0A',
  '--content-action-emphasized': '#1B8755',
  '--content-external-link': '#1B8755',
  '--content-inverse': '#FFFFFF',
  '--content-read': '#007BFC',
  '--background-wash-plain': '#FFFFFF',
  '--background-wash-inset': '#F7F5F3',
  '--background-elevated-wash-plain': '#FFFFFF',
  '--background-elevated-wash-inset': '#F7F5F3',
  '--background-dimmer': 'rgb(0, 0, 0, 0.32)',
  '--surface-default': '#FFFFFF',
  '--surface-emphasized': '#F7F5F3',
  '--surface-elevated-default': '#FFFFFF',
  '--surface-elevated-emphasized': '#F7F5F3',
  '--surface-highlight': 'rgba(194, 189, 184, 0.15)',
  '--surface-inverse': '#242626',
  '--surface-pressed': 'rgba(0, 0, 0, 0.2)',
  '--lines-divider': 'rgba(0, 0, 0, 0.1)',
  '--lines-outline-default': '#959393',
  '--lines-outline-deemphasized': 'rgba(0, 0, 0, 0.2)',
  '--persistent-always-branded': '#1DAA61',
  '--persistent-always-black': '#0A0A0A',
  '--persistent-always-white': '#FFFFFF',
  '--persistent-activity-indicator': '#25D366',
  '--systems-bubble-surface-incoming': '#FFFFFF',
  '--systems-bubble-surface-outgoing': '#D9FDD3',
  '--systems-bubble-content-deemphasized': 'rgba(0, 0, 0, 0.6)',
  '--systems-bubble-surface-overlay': 'rgba(194, 189, 184, 0.15)',
  '--systems-bubble-surface-system': 'rgba(255, 255, 255, 0.9)',
  '--systems-bubble-surface-e2e': '#FFF0D4',
  '--systems-bubble-content-e2e': 'rgba(0, 0, 0, 0.6)',
  '--systems-bubble-surface-business': '#D5FDED',
  '--systems-bubble-content-business': 'rgba(0, 0, 0, 0.6)',
  '--systems-chat-surface-composer': '#FFFFFF',
  '--systems-chat-background-wallpaper': '#F5F1EB',
  '--systems-chat-foreground-wallpaper': '#EAE0D3',
  '--systems-chat-surface-tray': '#F7F5F3',
  '--systems-status-seen': '#C2BDB8',
  '--internal-components-surface-nav-bar': '#F7F5F3',
  '--internal-components-active-list-row': 'rgba(194, 189, 184, 0.15)',
});
