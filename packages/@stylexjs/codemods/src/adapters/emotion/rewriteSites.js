/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * L8 — Rewrite. Consumes the binding map (the second seam hand-off) and
 * swaps each Emotion css prop for `{...stylex.props(styles.key)}` in that
 * site's place.
 */

import type { StyleSite } from './detect';

export function rewriteSite(
  j: $FlowFixMe,
  site: StyleSite,
  stylesLocalName: string,
  key: string,
): void {
  const spread = j.jsxSpreadAttribute(
    j.callExpression(
      j.memberExpression(j.identifier('stylex'), j.identifier('props')),
      [j.memberExpression(j.identifier(stylesLocalName), j.identifier(key))],
    ),
  );
  j(site.attrPath).replaceWith(spread);
}
