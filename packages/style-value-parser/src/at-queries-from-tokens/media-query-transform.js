/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { MediaQuery } from './media-query.js';

export function lastMediaQueryWinsTransform(styles: Object): Object {
  return dfsProcessQueries(styles);
}

function combineMediaQueryWithNegations(
  current: MediaQuery,
  negations: MediaQuery[],
): MediaQuery {
  if (negations.length === 0) {
    return current;
  }

  let combinedAst;

  if (current.queries.type === 'or') {
    combinedAst = {
      type: 'or',
      rules: current.queries.rules.map((rule) => ({
        type: 'and',
        rules: [
          rule,
          ...negations.map((mq) => ({ type: 'not', rule: mq.queries })),
        ],
      })),
    };
  } else {
    combinedAst = {
      type: 'and',
      rules: [
        current.queries,
        ...negations.map((mq) => ({ type: 'not', rule: mq.queries })),
      ],
    };
  }

  return new MediaQuery(combinedAst);
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

  if (Object.keys(result).some((key) => key.startsWith('@media '))) {
    const mediaKeys = Object.keys(result).filter((key) =>
      key.startsWith('@media '),
    );

    const negations = [];
    const accumulatedNegations = [];

    for (let i = mediaKeys.length - 1; i > 0; i--) {
      // Skip last iteration
      const mediaQuery = MediaQuery.parser.parseToEnd(mediaKeys[i]);
      negations.push(mediaQuery);
      accumulatedNegations.push([...negations]); // Clone array before pushing
    }
    accumulatedNegations.reverse();
    accumulatedNegations.push([]);
    console.log('accumulatedNegations', accumulatedNegations);

    for (let i = 0; i < mediaKeys.length; i++) {
      const currentKey = mediaKeys[i];
      const currentValue = result[currentKey];

      const baseMediaQuery = MediaQuery.parser.parseToEnd(currentKey);
      const reversedNegations = [...accumulatedNegations[i]].reverse();
      console.log('start');
      console.dir(baseMediaQuery, { depth: null });
      console.dir(reversedNegations, { depth: null });

      const combinedQuery = combineMediaQueryWithNegations(
        baseMediaQuery,
        reversedNegations,
      );
      console.dir(combinedQuery, { depth: null });

      const newMediaKey = combinedQuery.toString();

      delete result[currentKey];
      result[newMediaKey] = currentValue;
    }
  }

  return result;
}
