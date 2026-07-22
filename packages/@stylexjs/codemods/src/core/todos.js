/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

/**
 * L? — Bail-loudly flagging. When a single style site is unconvertible, the
 * codemod no longer skips the whole file: it converts what it safely can and
 * leaves a precise `// TODO(stylex-migration): …` marker on the site a human
 * must handle. This module owns the marker text and the canonical reasons.
 *
 * The reason strings that flow from the detect/read/referee layers are
 * already human-readable; `REASONS` documents the recurring categories so
 * they stay consistent, but any descriptive string is accepted.
 */

export const TODO_PREFIX: string = 'TODO(stylex-migration)';

/**
 * Canonical reasons for the recurring unconvertible categories. These land in
 * comments committed to the user's source, so they are short, plain, and
 * TIMELESS — no roadmap/version references (those go stale and read
 * ambiguously). Anything shipped-later belongs in the dry-run report, not the
 * committed comment.
 */
export const REASONS: {
  +templateLiteral: string,
  +dynamicValue: string,
  +componentElement: string,
  +propConflict: string,
} = {
  templateLiteral: 'template-literal styles',
  dynamicValue: 'dynamic value (props-driven)',
  componentElement: 'css on a component element',
  propConflict: 'css mixed with className/style/spread',
};

/** The block-comment body for a flagged site (note the surrounding spaces). */
export function formatTodo(reason: string): string {
  return ` ${TODO_PREFIX}: ${reason} `;
}

/** Whether a comment body is one of our markers (re-run guard: an already
 * flagged site is left alone on a second pass). */
export function isTodoMarker(commentValue: string): boolean {
  return commentValue.includes(TODO_PREFIX);
}
