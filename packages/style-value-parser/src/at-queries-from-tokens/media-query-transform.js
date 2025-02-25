/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import {
  MediaQuery,
  NotMediaRule,
  AndSeparatedMediaRules,
  OrSeparatedMediaRules,
} from './media-query.js';

export function lastMediaQueryWinsTransform(styles: Object): Object {
  return dfsProcessQueries(styles);
}

function dfsProcessQueries(obj: { [key: string]: any }): {
  [key: string]: any,
} {
  const result: { [key: string]: any } = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      result[key] = dfsProcessQueries(value);
    } else {
      result[key] = value;
    }
  });

  // process media queries at innermost layer
  if (Object.keys(result).some((key) => key.startsWith('@media '))) {
    const mediaKeys = Object.keys(result).filter((key) =>
      key.startsWith('@media '),
    );

    const accumulatedNegations: NotMediaRule[] = [];

    for (let i = mediaKeys.length - 1; i >= 0; i--) {
      const currentKey = mediaKeys[i];
      const currentValue = result[currentKey];

      // parse the current media query into a MediaQuery instance
      const baseMediaQuery = MediaQuery.parser.parseToEnd(currentKey);
      const currentOrQueries = baseMediaQuery.queries.queries;
      const reversedNegations = [...accumulatedNegations].reverse();

      const updatedOrQueries = currentOrQueries.map((andSeparatedRule) => {
        return new AndSeparatedMediaRules([
          // $FlowFixMe: OrSeparatedMediaRules typing is in progress
          ...andSeparatedRule.queries,
          ...reversedNegations,
        ]);
      });

      const combinedQuery = new MediaQuery(
        new OrSeparatedMediaRules(updatedOrQueries),
      );

      const newMediaKey = combinedQuery.toString();

      delete result[currentKey];
      result[newMediaKey] = currentValue;

      // create negations for all queries in the current media query
      // $FlowFixMe: OrSeparatedMediaRules typing is in progress
      const allQueries = currentOrQueries[0].queries;
      const negations = allQueries.map((query) => new NotMediaRule(query));
      accumulatedNegations.push(...negations);
    }
  }

  return result;
}
