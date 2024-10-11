/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { type CalcConstant, calcConstant } from './calc-constant';
import { Percentage } from './common-types';
import { type Dimension, dimension } from './dimension';

import { Parser } from '../core';

type CalcValue =
  | number
  | Dimension
  | Percentage
  | CalcConstant
  | CalcSum
  | CalcProduct;

class CalcSum {
  +left: CalcValue;
  +right: CalcValue;
  +operator: '+' | '-';
  constructor(left: CalcValue, right: CalcValue, operator: '+' | '-') {
    this.left = left;
    this.right = right;
    this.operator = operator;
  }
  toString(): string {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
  static get parse(): Parser<CalcSum> {
    return Parser.sequence(
      calcValue,
      Parser.oneOf(Parser.string('+'), Parser.string('-')),
      calcValue,
    )
      .separatedBy(Parser.whitespace)
      .map(([left, operator, right]) => new CalcSum(left, right, operator));
  }
}

class CalcProduct {
  +left: CalcValue;
  +right: CalcValue;
  +operator: '*' | '/';
  constructor(left: CalcValue, right: CalcValue, operator: '*' | '/') {
    this.left = left;
    this.right = right;
    this.operator = operator;
  }
  toString(): string {
    let left = this.left.toString();
    if (this.left instanceof CalcSum) {
      left = `(${left})`;
    }
    let right = this.right.toString();
    if (this.right instanceof CalcSum) {
      right = `(${right})`;
    }
    return `${left} ${this.operator} ${right}`;
  }
  static get parse(): Parser<CalcProduct> {
    return Parser.sequence(
      calcValue,
      Parser.oneOf(Parser.string('*'), Parser.string('/')),
      calcValue,
    )
      .separatedBy(Parser.whitespace)
      .map(([left, operator, right]) => new CalcProduct(left, right, operator));
  }
}

const calcValueWithoutParens = Parser.oneOf(
  Parser.float,
  dimension,
  Percentage.parse,
  calcConstant,
  CalcSum.parse,
  CalcProduct.parse,
);

export const calcValue: Parser<CalcValue> = Parser.oneOf(
  calcValueWithoutParens,
  calcValueWithoutParens
    .surroundedBy(Parser.whitespace.optional)
    .prefix(Parser.string('('))
    .skip(Parser.string(')')),
);
