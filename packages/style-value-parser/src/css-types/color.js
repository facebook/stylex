/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';
import { alphaValue } from './alpha-value';
import { Angle, Deg } from './angle';
import { Percentage } from './common-types';

export class Color {
  static get parse(): Parser<Color> {
    return Parser.oneOf<Color>(
      NamedColor.parse,
      HashColor.parse,
      Rgb.parse,
      Rgba.parse,
    );
  }
}

export class NamedColor extends Color {
  +value: string;
  constructor(value: string) {
    super();
    this.value = value;
  }
  toString(): string {
    return this.value;
  }
  static parse: Parser<NamedColor> = Parser.oneOf(
    // NOTE: We might map all colors to their hex values.
    Parser.string('aliceblue'), // #f0f8ff
    Parser.string('antiquewhite'), // #faebd7
    Parser.string('aqua').map(() => 'cyan'), // #00ffff
    Parser.string('aquamarine'), // #7fffd4
    Parser.string('azure'), // #f0ffff
    Parser.string('beige'), // #f5f5dc
    Parser.string('bisque'), // #ffe4c4
    Parser.string('black'), // #000000
    Parser.string('blanchedalmond'), // #ffebcd
    Parser.string('blue'), // #0000ff
    Parser.string('blueviolet'), // #8a2be2
    Parser.string('brown'), // #a52a2a
    Parser.string('burlywood'), // #deb887
    Parser.string('cadetblue'), // #5f9ea0
    Parser.string('chartreuse'), // #7fff00
    Parser.string('chocolate'), // #d2691e
    Parser.string('coral'), // #ff7f50
    Parser.string('cornflowerblue'), // #6495ed
    Parser.string('cornsilk'), // #fff8dc
    Parser.string('crimson'), // #dc143c
    Parser.string('cyan'), // #00ffff
    Parser.string('darkblue'), // #00008b
    Parser.string('darkcyan'), // #008b8b
    Parser.string('darkgoldenrod'), // #b8860b
    Parser.string('darkgray'), // #a9a9a9
    Parser.string('darkgreen'), // #006400
    Parser.string('darkgrey').map(() => 'darkgray'), // #a9a9a9
    Parser.string('darkkhaki'), // #bdb76b
    Parser.string('darkmagenta'), // #8b008b
    Parser.string('darkolivegreen'), // #556b2f
    Parser.string('darkorange'), // #ff8c00
    Parser.string('darkorchid'), // #9932cc
    Parser.string('darkred'), // #8b0000
    Parser.string('darksalmon'), // #e9967a
    Parser.string('darkseagreen'), // #8fbc8f
    Parser.string('darkslateblue'), // #483d8b
    Parser.string('darkslategray'), // #2f4f4f
    Parser.string('darkslategrey').map(() => 'darkslategray'),
    Parser.string('darkturquoise'), // #00ced1
    Parser.string('darkviolet'), // #9400d3
    Parser.string('deeppink'), // #ff1493
    Parser.string('deepskyblue'), // #00bfff
    Parser.string('dimgray'), // #696969
    Parser.string('dimgrey').map(() => 'dimgray'),
    Parser.string('dodgerblue'), // #1e90ff
    Parser.string('firebrick'), // #b22222
    Parser.string('floralwhite'), // #fffaf0
    Parser.string('forestgreen'), // #228b22
    Parser.string('fuchsia').map(() => 'magenta'),
    Parser.string('gainsboro'), // #dcdcdc
    Parser.string('ghostwhite'), // #f8f8ff
    Parser.string('gold'), // #ffd700
    Parser.string('goldenrod'), // #daa520
    Parser.string('gray'), // #808080
    Parser.string('green'), // #008000
    Parser.string('greenyellow'), // #adff2f
    Parser.string('grey').map(() => 'gray'),
    Parser.string('honeydew'), // #f0fff0
    Parser.string('hotpink'), // #ff69b4
    Parser.string('indianred'), // #cd5c5c
    Parser.string('indigo'), // #4b0082
    Parser.string('ivory'), // #fffff0
    Parser.string('khaki'), // #f0e68c
    Parser.string('lavender'), // #e6e6fa
    Parser.string('lavenderblush'), // #fff0f5
    Parser.string('lawngreen'), // #7cfc00
    Parser.string('lemonchiffon'), // #fffacd
    Parser.string('lightblue'), // #add8e6
    Parser.string('lightcoral'), // #f08080
    Parser.string('lightcyan'), // #e0ffff
    Parser.string('lightgoldenrodyellow'), // #fafad2
    Parser.string('lightgray'), // #d3d3d3
    Parser.string('lightgreen'), // #90ee90
    Parser.string('lightgrey').map(() => 'lightgray'),
    Parser.string('lightpink'), // #ffb6c1
    Parser.string('lightsalmon'), // #ffa07a
    Parser.string('lightseagreen'), // #20b2aa
    Parser.string('lightskyblue'), // #87cefa
    Parser.string('lightslategray'), // #778899
    Parser.string('lightslategrey').map(() => 'lightslategray'),
    Parser.string('lightsteelblue'), // #b0c4de
    Parser.string('lightyellow'), // #ffffe0
    Parser.string('lime'), // #00ff00
    Parser.string('limegreen'), // #32cd32
    Parser.string('linen'), // #faf0e6
    Parser.string('magenta'), // #ff00ff
    Parser.string('maroon'), // #800000
    Parser.string('mediumaquamarine'), // #66cdaa
    Parser.string('mediumblue'), // #0000cd
    Parser.string('mediumorchid'), // #ba55d3
    Parser.string('mediumpurple'), // #9370db
    Parser.string('mediumseagreen'), // #3cb371
    Parser.string('mediumslateblue'), // #7b68ee
    Parser.string('mediumspringgreen'), // #00fa9a
    Parser.string('mediumturquoise'), // #48d1cc
    Parser.string('mediumvioletred'), // #c71585
    Parser.string('midnightblue'), // #191970
    Parser.string('mintcream'), // #f5fffa
    Parser.string('mistyrose'), // #ffe4e1
    Parser.string('moccasin'), // #ffe4b5
    Parser.string('navajowhite'), // #ffdead
    Parser.string('navy'), // #000080
    Parser.string('oldlace'), // #fdf5e6
    Parser.string('olive'), // #808000
    Parser.string('olivedrab'), // #6b8e23
    Parser.string('orange'), // #ffa500
    Parser.string('orangered'), // #ff4500
    Parser.string('orchid'), // #da70d6
    Parser.string('palegoldenrod'), // #eee8aa
    Parser.string('palegreen'), // #98fb98
    Parser.string('paleturquoise'), // #afeeee
    Parser.string('palevioletred'), // #db7093
    Parser.string('papayawhip'), // #ffefd5
    Parser.string('peachpuff'), // #ffdab9
    Parser.string('peru'), // #cd853f
    Parser.string('pink'), // #ffc0cb
    Parser.string('plum'), // #dda0dd
    Parser.string('powderblue'), // #b0e0e6
    Parser.string('purple'), // #800080
    Parser.string('rebeccapurple'), // #663399
    Parser.string('red'), // #ff0000
    Parser.string('rosybrown'), // #bc8f8f
    Parser.string('royalblue'), // #4169e1
    Parser.string('saddlebrown'), // #8b4513
    Parser.string('salmon'), // #fa8072
    Parser.string('sandybrown'), // #f4a460
    Parser.string('seagreen'), // #2e8b57
    Parser.string('seashell'), // #fff5ee
    Parser.string('sienna'), // #a0522d
    Parser.string('silver'), // #c0c0c0
    Parser.string('skyblue'), // #87ceeb
    Parser.string('slateblue'), // #6a5acd
    Parser.string('slategray'), // #708090
    Parser.string('slategrey').map(() => 'slategrey'),
    Parser.string('snow'), // #fffafa
    Parser.string('springgreen'), // #00ff7f
    Parser.string('steelblue'), // #4682b4
    Parser.string('tan'), // #d2b48c
    Parser.string('teal'), // #008080
    Parser.string('thistle'), // #d8bfd8
    Parser.string('tomato'), // #ff6347
    Parser.string('transparent'), // #00000000
    Parser.string('turquoise'), // #40e0d0
    Parser.string('violet'), // #ee82ee
    Parser.string('wheat'), // #f5deb3
    Parser.string('white'), // #ffffff
    Parser.string('whitesmoke'), // #f5f5f5
    Parser.string('yellow'), // #ffff00
    Parser.string('yellowgreen'), // #9acd32
  ).map((value) => new NamedColor(value));
}

export class HashColor extends Color {
  +value: string;
  constructor(value: string) {
    super();
    this.value = value;
  }
  toString(): string {
    return `#${this.value}`;
  }

  get r(): number {
    return parseInt(this.value.slice(0, 2), 16);
  }

  get g(): number {
    return parseInt(this.value.slice(2, 4), 16);
  }

  get b(): number {
    return parseInt(this.value.slice(4, 6), 16);
  }

  get a(): number {
    return this.value.length === 8
      ? parseInt(this.value.slice(6, 8), 16) / 255
      : 1;
  }

  static parse: Parser<HashColor> = Parser.sequence(
    Parser.string('#'),
    Parser.oneOf(
      Parser.regex(/[0-9a-fA-F]{8}/),
      Parser.regex(/[0-9a-fA-F]{6}/),
      Parser.regex(/[0-9a-fA-F]{3}/),
    ).map((value) => String(value)),
  ).map(([_, value]: [string, string]) => {
    if (value.length === 3) {
      return new HashColor(
        value
          .split('')
          .map((c) => c + c)
          .join(''),
      );
    }
    return new HashColor(value);
  });
}

const rgbNum = Parser.oneOf(
  Parser.float.where((v) => v >= 0 && v <= 255),
  Parser.string('none').map(() => 0),
);
const rgbNums3 = Parser.sequence(rgbNum, rgbNum, rgbNum);
const commaNum = rgbNums3.separatedBy(
  Parser.string(',').surroundedBy(Parser.whitespace.optional),
);
const spaceNum = rgbNums3.separatedBy(Parser.whitespace);

const percentage = Parser.oneOf(
  Percentage.parse.map((p) => (p.value * 255) / 100),
  Parser.string('none').map(() => 0),
);
const percentages3 = Parser.sequence(percentage, percentage, percentage);
const commaPercentage = percentages3.separatedBy(
  Parser.string(',').surroundedBy(Parser.whitespace.optional),
);
const spacePercentage = percentages3.separatedBy(Parser.whitespace);
export class Rgb extends Color {
  +r: number;
  +g: number;
  +b: number;
  constructor(r: number, g: number, b: number) {
    super();
    this.r = r;
    this.g = g;
    this.b = b;
  }
  toString(): string {
    return `rgb(${this.r},${this.g},${this.b})`;
  }
  static get parse(): Parser<Rgb> {
    return Parser.oneOf(commaNum, spaceNum, commaPercentage, spacePercentage)
      .surroundedBy(Parser.whitespace.optional)
      .surroundedBy(Parser.string('rgb('), Parser.string(')'))
      .map(([r, g, b]: [number, number, number]) => new Rgb(r, g, b));
  }
}

export class Rgba extends Color {
  +r: number;
  +g: number;
  +b: number;
  +a: number;
  constructor(r: number, g: number, b: number, a: number) {
    super();
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  toString(): string {
    if (this.a === 1) {
      return `rgb(${this.r},${this.g},${this.b})`;
    }
    return `rgba(${this.r},${this.g},${this.b},${this.a})`;
  }
  static get parse(): Parser<Rgba> {
    const commaFn = Parser.sequence(
      Parser.oneOf(commaNum, commaPercentage),
      alphaValue,
    )
      .separatedBy(Parser.string(',').surroundedBy(Parser.whitespace.optional))
      .surroundedBy(Parser.whitespace.optional)
      .surroundedBy(Parser.string('rgba('), Parser.string(')'))
      .map(([[r, g, b], a]) => new Rgba(r, g, b, a));

    const spaceFn = Parser.sequence(
      Parser.oneOf(spaceNum, spacePercentage),
      alphaValue,
    )
      .separatedBy(Parser.string('/').surroundedBy(Parser.whitespace))
      .surroundedBy(Parser.whitespace.optional)
      .surroundedBy(Parser.string('rgb('), Parser.string(')'))
      .map(([[r, g, b], a]) => new Rgba(r, g, b, a));

    return Parser.oneOf(commaFn, spaceFn);
  }
}

const hue = Parser.oneOf<Angle>(
  Angle.parse,
  Parser.float.map((v) => new Deg(v)),
);
const saturation = Percentage.parse;
const lightness = Percentage.parse;

const hslTuple = Parser.sequence(hue, saturation, lightness);
const hslCommaTuple = hslTuple.separatedBy(
  Parser.string(',').surroundedBy(Parser.whitespace.optional),
);
const hslSpaceTuple = hslTuple.separatedBy(Parser.whitespace);
export class Hsl extends Color {
  +h: Angle;
  +s: Percentage;
  +l: Percentage;
  constructor(h: Angle, s: Percentage, l: Percentage) {
    super();
    this.h = h;
    this.s = s;
    this.l = l;
  }
  toString(): string {
    return `hsl(${this.h.toString()},${this.s.toString()},${this.l.toString()})`;
  }
  static get parse(): Parser<Hsl> {
    return Parser.oneOf(hslCommaTuple, hslSpaceTuple)
      .surroundedBy(Parser.whitespace.optional)
      .surroundedBy(Parser.string('hsl('), Parser.string(')'))
      .map(([h, s, l]: [Angle, Percentage, Percentage]) => new Hsl(h, s, l));
  }
}

export class Hsla extends Color {
  +h: Angle;
  +s: Percentage;
  +l: Percentage;
  +a: number;
  constructor(h: Angle, s: Percentage, l: Percentage, a: number) {
    super();
    this.h = h;
    this.s = s;
    this.l = l;
    this.a = a;
  }
  toString(): string {
    return `hsla(${this.h.toString()},${this.s.toString()},${this.l.toString()},${this.a.toString()})`;
  }
  static get parse(): Parser<Hsla> {
    const fnName = Parser.string('hsla').or(Parser.string('hsl'));

    const commaFnArgs = Parser.sequence(hslCommaTuple, alphaValue).separatedBy(
      Parser.string(',').surroundedBy(Parser.whitespace.optional),
    );
    const spaceFnArgs = Parser.sequence(hslCommaTuple, alphaValue).separatedBy(
      Parser.string('/').surroundedBy(Parser.whitespace),
    );

    return Parser.oneOf(commaFnArgs, spaceFnArgs)
      .surroundedBy(Parser.whitespace.optional)
      .surroundedBy(fnName, Parser.string(')'))
      .map(([[h, s, l], a]) => new Hsla(h, s, l, a));
  }
}

// TODO: add support for hwb(). lch(), oklch(), lab(), oklab(), and color()
