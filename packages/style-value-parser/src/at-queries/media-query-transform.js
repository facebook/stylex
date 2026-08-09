/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { MediaQueryRule } from './media-query';

import { MediaQuery } from './media-query.js';

export function lastMediaQueryWinsTransform(styles: Object): Object {
  return dfsProcessQueries(styles, 0);
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
    } as const;
  }

  return new MediaQuery(
    combinedAst as $FlowFixMe as MediaQueryRule,
    current.atRuleName,
  );
}

function applyQueryOrder(resultObj: { [key: string]: any }, prefix: string) {
  if (!Object.keys(resultObj).some((key) => key.startsWith(prefix))) {
    return;
  }

  const queryKeys = Object.keys(resultObj).filter((key) => key.startsWith(prefix));

  const negations = [];
  const accumulatedNegations = [];

  for (let i = queryKeys.length - 1; i > 0; i--) {
    const query = MediaQuery.parser.parseToEnd(queryKeys[i]);
    negations.push(query);
    accumulatedNegations.push([...negations]);
  }
  accumulatedNegations.reverse();
  accumulatedNegations.push([]);

  for (let i = 0; i < queryKeys.length; i++) {
    const currentKey = queryKeys[i];
    const currentValue = resultObj[currentKey];

    const baseQuery = MediaQuery.parser.parseToEnd(currentKey);
    const reversedNegations = [...accumulatedNegations[i]].reverse();

    const combinedQuery = combineMediaQueryWithNegations(
      baseQuery,
      reversedNegations,
    );

    const newQueryKey = combinedQuery.toString();

    delete resultObj[currentKey];
    resultObj[newQueryKey] = currentValue;
  }
}

function dfsProcessQueries(
  obj: { [key: string]: any },
  depth: number,
): {
  [key: string]: any,
} {
  if (Array.isArray(obj)) {
    // Ignore `firstThatWorks` arrays
    return obj;
  }
  const result: { [key: string]: any } = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      result[key] = dfsProcessQueries(value, depth + 1);
    } else {
      result[key] = value;
    }
  });

  if (depth >= 1) {
    applyQueryOrder(result, '@media ');
    applyQueryOrder(result, '@container ');
  }

  return result;
}
