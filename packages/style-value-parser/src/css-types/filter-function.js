/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Length } from './length';
import { Percentage } from './common-types';

import { Parser } from '../core';
import { Color } from './color';
import { Angle } from './angle';

export class FilterFunction {
  toString(): string {
    return '';
  }
  static get parse(): Parser<FilterFunction> {
    return Parser.oneOf(
      BlurFilterFunction.parse,
      BrightnessFilterFunction.parse,
      ContrastFilterFunction.parse,
      DropShadowFilterFunction.parse,
      GrayscaleFilterFunction.parse,
      HueRotateFilterFunction.parse,
      InverFilterFunction.parse,
      OpacityFilterFunction.parse,
      SaturateFilterFunction.parse,
      SepiaFilterFunction.parse,
    );
  }
}

export class BlurFilterFunction extends FilterFunction {
  +radius: Length;
  constructor(radius: Length) {
    super();
    this.radius = radius;
  }
  toString(): string {
    return `blur(${this.radius.toString()})`;
  }
  static get parse(): Parser<BlurFilterFunction> {
    return Parser.sequence(
      Parser.string('blur('),
      Length.parse.surroundedBy(Parser.whitespace.optional),
      Parser.string(')'),
    ).map(([_, radius, _1]) => new BlurFilterFunction(radius));
  }
}

export class BrightnessFilterFunction extends FilterFunction {
  +percentage: number;
  constructor(percentage: number) {
    super();
    this.percentage = percentage;
  }
  toString(): string {
    return `brightness(${this.percentage})`;
  }
  static get parse(): Parser<BrightnessFilterFunction> {
    return Parser.sequence(
      Parser.string('brightness('),
      Parser.oneOf(
        Percentage.parse.map((p) => p.value / 100),
        Parser.float.where((n) => n >= 0),
      ).surroundedBy(Parser.whitespace.optional),
      Parser.string(')'),
    ).map(([_, percentage, _1]) => new BrightnessFilterFunction(percentage));
  }
}

export class ContrastFilterFunction extends FilterFunction {
  +amount: number;
  constructor(amount: number) {
    super();
    this.amount = amount;
  }
  toString(): string {
    return `contrast(${this.amount})`;
  }
  static get parse(): Parser<ContrastFilterFunction> {
    return Parser.sequence(
      Parser.string('contrast('),
      Parser.oneOf(
        Percentage.parse.map((p) => p.value / 100),
        Parser.float.where((n) => n >= 0),
      ).surroundedBy(Parser.whitespace.optional),
      Parser.string(')'),
    ).map(([_, amount, _1]) => new ContrastFilterFunction(amount));
  }
}

export class DropShadowFilterFunction extends FilterFunction {
  +offsetX: Length;
  +offsetY: Length;
  +blurRadius: Length;
  +color: ?Color;
  constructor(
    offsetX: Length,
    offsetY: Length,
    blurRadius: Length,
    color: ?Color,
  ) {
    super();
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.blurRadius = blurRadius;
    this.color = color;
  }
  toString(): string {
    const args = [
      this.offsetX.toString(),
      this.offsetY.toString(),
      this.blurRadius.value !== 0 ? this.blurRadius.toString() : null,
      this.color?.toString(),
    ]
      .filter(Boolean)
      .join(' ');
    return `drop-shadow(${args})`;
  }
  static get parse(): Parser<DropShadowFilterFunction> {
    return Parser.sequence(
      Parser.string('drop-shadow('),
      Parser.sequence(
        Length.parse,
        Length.parse,
        Length.parse.optional,
        Color.parse.optional,
      )
        .separatedBy(Parser.whitespace)
        .surroundedBy(Parser.whitespace.optional),
      Parser.string(')'),
    ).map(
      ([_, [offsetX, offsetY, blurRadius = new Length(0), color], _1]) =>
        new DropShadowFilterFunction(offsetX, offsetY, blurRadius, color),
    );
  }
}

export class GrayscaleFilterFunction extends FilterFunction {
  +amount: number;
  constructor(amount: number) {
    super();
    this.amount = amount;
  }
  toString(): string {
    return `grayscale(${this.amount})`;
  }
  static get parse(): Parser<GrayscaleFilterFunction> {
    return Parser.sequence(
      Parser.string('grayscale('),
      Parser.oneOf(
        Percentage.parse.map((p) => p.value / 100),
        Parser.float.where((n) => n >= 0),
      ).surroundedBy(Parser.whitespace.optional),
      Parser.string(')'),
    ).map(([_, amount, _1]) => new GrayscaleFilterFunction(amount));
  }
}

export class HueRotateFilterFunction extends FilterFunction {
  +angle: Angle;
  constructor(angle: Angle) {
    super();
    this.angle = angle;
  }
  toString(): string {
    return `hue-rotate(${this.angle.toString()})`;
  }
  static get parse(): Parser<HueRotateFilterFunction> {
    return Parser.sequence(
      Parser.string('hue-rotate('),
      Angle.parse,
      Parser.string(')'),
    ).map(([_, angle, _1]) => new HueRotateFilterFunction(angle));
  }
}

export class InverFilterFunction extends FilterFunction {
  +amount: number;
  constructor(amount: number) {
    super();
    this.amount = amount;
  }
  toString(): string {
    return `invert(${this.amount})`;
  }
  static get parse(): Parser<InverFilterFunction> {
    return Parser.sequence(
      Parser.string('invert('),
      Parser.oneOf(
        Percentage.parse.map((p) => p.value / 100),
        Parser.float.where((n) => n >= 0),
      ).surroundedBy(Parser.whitespace.optional),
      Parser.string(')'),
    ).map(([_, amount, _1]) => new InverFilterFunction(amount));
  }
}

export class OpacityFilterFunction extends FilterFunction {
  +amount: number;
  constructor(amount: number) {
    super();
    this.amount = amount;
  }
  toString(): string {
    return `opacity(${this.amount})`;
  }
  static get parse(): Parser<OpacityFilterFunction> {
    return Parser.sequence(
      Parser.string('opacity('),
      Parser.oneOf(
        Percentage.parse.map((p) => p.value / 100),
        Parser.float.where((n) => n >= 0),
      ).surroundedBy(Parser.whitespace.optional),
      Parser.string(')'),
    ).map(([_, amount, _1]) => new OpacityFilterFunction(amount));
  }
}

export class SaturateFilterFunction extends FilterFunction {
  +amount: number;
  constructor(amount: number) {
    super();
    this.amount = amount;
  }
  toString(): string {
    return `saturate(${this.amount})`;
  }
  static get parse(): Parser<SaturateFilterFunction> {
    return Parser.sequence(
      Parser.string('saturate('),
      Parser.oneOf(
        Percentage.parse.map((p) => p.value / 100),
        Parser.float.where((n) => n >= 0),
      ).surroundedBy(Parser.whitespace.optional),
      Parser.string(')'),
    ).map(([_, amount, _1]) => new SaturateFilterFunction(amount));
  }
}

export class SepiaFilterFunction extends FilterFunction {
  +amount: number;
  constructor(amount: number) {
    super();
    this.amount = amount;
  }
  toString(): string {
    return `sepia(${this.amount})`;
  }
  static get parse(): Parser<SepiaFilterFunction> {
    return Parser.sequence(
      Parser.string('sepia('),
      Parser.oneOf(
        Percentage.parse.map((p) => p.value / 100),
        Parser.float.where((n) => n >= 0),
      ).surroundedBy(Parser.whitespace.optional),
      Parser.string(')'),
    ).map(([_, amount, _1]) => new SepiaFilterFunction(amount));
  }
}
