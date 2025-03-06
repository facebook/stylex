/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import {
  type CalcConstant,
  allCalcConstants,
  calcConstant,
} from './calc-constant';
import { Percentage } from './common-types';
// import { type Dimension, dimension } from './dimension';

import { TokenParser } from '../core2';
import type { TokenDimension } from '@csstools/css-tokenizer';

type Addition = {
  type: '+',
  left: CalcValue,
  right: CalcValue,
};
type Subtraction = {
  type: '-',
  left: CalcValue,
  right: CalcValue,
};
type Multiplication = {
  type: '*',
  left: CalcValue,
  right: CalcValue,
};
type Division = {
  type: '/',
  left: CalcValue,
  right: CalcValue,
};

type CalcValue =
  | number
  | TokenDimension[4]
  | Percentage
  | CalcConstant
  | Addition
  | Subtraction
  | Multiplication
  | Division;

const valueParser = TokenParser.oneOf(
  calcConstant,
  TokenParser.tokens.Number.map((number) => number[4].value),
  TokenParser.tokens.Dimension.map((dimension) => dimension[4]),
  Percentage.parser,
);

const composeAddAndSubtraction = (
  valuesAndOperators: $ReadOnlyArray<CalcValue | string>,
): CalcValue => {
  if (valuesAndOperators.length === 1) {
    if (typeof valuesAndOperators[0] === 'string') {
      if (allCalcConstants.includes(valuesAndOperators[0])) {
        return valuesAndOperators[0] as $FlowFixMe as CalcConstant;
      }
      throw new Error('Invalid operator');
    }
    return valuesAndOperators[0];
  }
  const firstOperator = valuesAndOperators.findIndex(
    (op) => op === '+' || op === '-',
  );
  if (firstOperator === -1) {
    throw new Error('No valid operator found');
  }
  const left = valuesAndOperators.slice(0, firstOperator);
  const right = valuesAndOperators.slice(firstOperator + 1);

  if (valuesAndOperators[firstOperator] === '+') {
    return {
      type: '+',
      left: composeAddAndSubtraction(left),
      right: composeAddAndSubtraction(right),
    };
  }
  return {
    type: '-',
    left: composeAddAndSubtraction(left),
    right: composeAddAndSubtraction(right),
  };
};

const splitByMultiplicationOrDivision = (
  valuesAndOperators: $ReadOnlyArray<CalcValue | string>,
): CalcValue => {
  if (valuesAndOperators.length === 1) {
    if (typeof valuesAndOperators[0] === 'string') {
      throw new Error('Invalid operator');
    }
    return valuesAndOperators[0];
  }
  const firstOperator = valuesAndOperators.findIndex(
    (op) => op === '*' || op === '/',
  );
  if (firstOperator === -1) {
    return composeAddAndSubtraction(valuesAndOperators);
  }
  const left = valuesAndOperators.slice(0, firstOperator);
  const right = valuesAndOperators.slice(firstOperator + 1);

  if (valuesAndOperators[firstOperator] === '*') {
    return {
      type: '*',
      left: composeAddAndSubtraction(left),
      right: splitByMultiplicationOrDivision(right),
    };
  }

  return {
    type: '/',
    left: composeAddAndSubtraction(left),
    right: splitByMultiplicationOrDivision(right),
  };
};

const operationsParser: TokenParser<CalcValue> = TokenParser.sequence(
  TokenParser.oneOf(valueParser, () =>
    TokenParser.sequence(
      TokenParser.tokens.OpenParen,
      operationsParser,
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([_, value]) => value),
  ),
  TokenParser.zeroOrMore(
    TokenParser.sequence(
      TokenParser.tokens.Delim.map((delim) => delim[4].value).where(
        (delim) =>
          delim === '*' || delim === '/' || delim === '+' || delim === '-',
      ),
      TokenParser.oneOf(valueParser, () =>
        TokenParser.sequence(
          TokenParser.tokens.OpenParen,
          operationsParser,
          TokenParser.tokens.CloseParen,
        )
          .separatedBy(TokenParser.tokens.Whitespace.optional)
          .map(([_, value]) => value),
      ),
    ).separatedBy(TokenParser.tokens.Whitespace.optional),
  ).separatedBy(TokenParser.tokens.Whitespace.optional),
)
  .separatedBy(TokenParser.tokens.Whitespace.optional)
  .map(([firstValue, restOfTheValues]) => {
    if (restOfTheValues == null || restOfTheValues.length === 0) {
      return firstValue;
    }

    const valuesAndOperators: $ReadOnlyArray<CalcValue | string> = [
      firstValue,
      ...restOfTheValues.flat(),
    ];

    return splitByMultiplicationOrDivision(valuesAndOperators);
  });

export class Calc {
  +value: CalcValue;
  constructor(value: this['value']) {
    this.value = value;
  }
  toString(): string {
    return this.value.toString();
  }
  static get parser(): TokenParser<Calc> {
    return TokenParser.sequence(
      TokenParser.tokens.Function.map((func) => func[4].value).where(
        (func) => func === 'calc',
      ),
      TokenParser.oneOf(operationsParser, valueParser),
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(([_, value, _closeParen]) => new Calc(value));
  }
}
