/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { OrderedCSSStyleSheet } from './createOrderedCSSStyleSheet';

import { canUseDOM } from './utils';
import { createCSSStyleSheet } from './createCSSStyleSheet';
import { createOrderedCSSStyleSheet } from './createOrderedCSSStyleSheet';

type Sheet = {
  ...OrderedCSSStyleSheet,
};

const roots = new WeakMap<Node, number>();
const sheets: Array<Sheet> = [];

export function createSheet(root?: HTMLElement): Sheet {
  let sheet;

  if (canUseDOM) {
    const rootNode = root != null ? root.getRootNode() : document;
    // Create the initial style sheet
    if (sheets.length === 0) {
      sheet = createOrderedCSSStyleSheet(createCSSStyleSheet(rootNode));
      roots.set(rootNode, sheets.length);
      sheets.push(sheet);
    } else {
      const index = roots.get(rootNode);
      if (index == null) {
        const initialSheet = sheets[0];
        // If we're creating a new sheet, populate it with existing styles
        const textContent =
          initialSheet != null ? initialSheet.getTextContent() : '';
        // Cast rootNode to 'any' because Flow types for getRootNode are wrong
        sheet = createOrderedCSSStyleSheet(
          createCSSStyleSheet(rootNode as any, textContent),
        );
        roots.set(rootNode, sheets.length);
        sheets.push(sheet);
      } else {
        sheet = sheets[index];
      }
    }
  } else {
    // Create the initial style sheet
    if (sheets.length === 0) {
      sheet = createOrderedCSSStyleSheet(createCSSStyleSheet());
      sheets.push(sheet);
    } else {
      sheet = sheets[0];
    }
  }

  return {
    getTextContent() {
      return sheet.getTextContent();
    },
    insert(cssText: string, groupValue: number) {
      sheets.forEach((s) => {
        s.insert(cssText, groupValue);
      });
    },
  };
}
