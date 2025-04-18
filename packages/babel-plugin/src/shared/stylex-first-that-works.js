/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

const isVar = (arg: string) =>
  typeof arg === 'string' && arg.match(/^var\(--[a-zA-Z0-9-_]+\)$/);

export default function stylexFirstThatWorks(
  ...args: $ReadOnlyArray<string>
): $ReadOnlyArray<string> | string {
  const firstVar = args.findIndex(isVar);

  if (firstVar === -1) {
    return [...args].reverse();
  }
  const priorities = args.slice(0, firstVar).reverse();
  const rest = args.slice(firstVar);
  const firstNonVar = rest.findIndex((arg) => !isVar(arg));
  const varParts = rest
    .slice(0, firstNonVar === -1 ? rest.length : firstNonVar + 1)
    .reverse();

  const vars = varParts.map((arg) => (isVar(arg) ? arg.slice(4, -1) : arg));

  const returnValue = [
    vars.reduce<string>(
      (soFar, varName) =>
        soFar
          ? `var(${varName}, ${String(soFar)})`
          : varName.startsWith('--')
            ? `var(${varName})`
            : varName,
      '',
    ),
    ...priorities,
  ];
  if (returnValue.length === 1) {
    return returnValue[0];
  }
  return returnValue;
}
