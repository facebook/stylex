/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import mediaQuery from 'css-mediaquery';

export type MatchObject = {
  width: number,
  height: number,
  direction: 'ltr' | 'rtl',
};

const MQ_PREFIX = '@media';

export class CSSMediaQuery {
  static isMediaQueryString(inp: string): boolean {
    return inp.startsWith(MQ_PREFIX);
  }

  static resolveMediaQueries(
    styleObj: { +[string]: mixed },
    matchObj: MatchObject
  ): { [string]: mixed } {
    const mediaQueries = [];
    const result: { [string]: mixed } = {};

    // collect all the media queries
    for (const [key, value] of Object.entries(styleObj)) {
      if (value instanceof CSSMediaQuery) {
        mediaQueries.push(value);
      } else {
        result[key] = value;
      }
    }

    // check the media queries to see if any apply and if they do,
    // merge their styles into the result
    if (mediaQueries.length > 0) {
      for (const mqInst of mediaQueries) {
        const unresolvedMatchedStyle = mqInst.resolve(matchObj);
        const resolvedMatchedStyle = this.resolveMediaQueries(
          unresolvedMatchedStyle,
          matchObj
        );
        for (const propName in resolvedMatchedStyle) {
          result[propName] = resolvedMatchedStyle[propName];
        }
      }
    }

    return result;
  }

  query: string;
  matchedStyle: { [string]: mixed };

  constructor(query: string, matchedStyle: { [string]: mixed }) {
    this.query = query.replace(MQ_PREFIX, '');
    this.matchedStyle = matchedStyle;
  }

  resolve(matchObject: MatchObject): { [string]: mixed } {
    const { width, height, direction } = matchObject;
    const matches = mediaQuery.match(this.query, {
      width,
      height,
      orientation: width > height ? 'landscape' : 'portrait',
      'aspect-ratio': width / height,
      direction: direction,
    });
    return matches ? this.matchedStyle : {};
  }
}
