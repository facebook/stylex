/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { canUseDOM } from './utils';

export function createCSSStyleSheet(
  rootNode?: Node,
  textContent?: string,
): ?CSSStyleSheet {
  if (canUseDOM) {
    const root = rootNode != null ? rootNode : document;
    // $FlowIgnore[prop-missing]
    let element = root?.querySelector('[data-stylex]');
    if (element == null) {
      element = document.createElement('style');
      element.setAttribute('data-stylex', 'true');
      if (typeof textContent === 'string') {
        element.appendChild(document.createTextNode(textContent));
      }
      // If the root is a document, insert into the head.
      // Otherwise we're in a Shadow DOM tree.
      // $FlowIgnore[prop-missing]
      const container = root.nodeType === Node.DOCUMENT_NODE ? root.head : root;
      if (container) {
        const firstChild = container.firstChild;
        if (firstChild != null) {
          container.insertBefore(element, firstChild);
        } else {
          container.appendChild(element);
        }
      }
    }
    // $FlowFixMe: we know this is HTMLStyleElement by this point
    return element.sheet;
  } else {
    return null;
  }
}
