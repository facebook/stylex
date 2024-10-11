/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import { SubString } from './base-types';
export declare class Parser<T> {
  readonly run: (input: SubString) => T | Error;
  constructor(parser: ($$PARAM_0$$: SubString) => T | Error);
  parse(input: string): T | Error;
  parseToEnd(input: string): T;
  map<NewT>(f: ($$PARAM_0$$: T) => NewT): Parser<NewT>;
  flatMap<U>(f: ($$PARAM_0$$: T) => Parser<U>): Parser<U>;
  or<U>(parser2: Parser<U>): Parser<T | U>;
  surroundedBy(prefix: Parser<unknown>, suffix: Parser<unknown>): Parser<T>;
  skip(skipParser: Parser<unknown>): Parser<T>;
  get optional(): Parser<void | T>;
  prefix(prefixParser: Parser<unknown>): Parser<T>;
  static never<T>(): Parser<T>;
  static always<T>(output: T): Parser<T>;
  where(predicate: ($$PARAM_0$$: T) => boolean): Parser<T>;
  static oneOf<T>(...parsers: ReadonlyArray<Parser<T>>): Parser<T>;
  static sequence<T extends ReadonlyArray<Parser<unknown>>>(
    ...parsers: T
  ): ParserSequence<T>;
  static setOf<T extends ReadonlyArray<Parser<unknown>>>(
    ...parsers: T
  ): ParserSet<T>;
  static zeroOrMore<T>(parser: Parser<T>): ZeroOrMoreParsers<T>;
  static oneOrMore<T>(parser: Parser<T>): OneOrMoreParsers<T>;
  static string<T extends string>(str: T): Parser<T>;
  static get quotedString(): Parser<string>;
  static regex(regex: RegExp): Parser<string>;
  static takeWhile(predicate: ($$PARAM_0$$: string) => boolean): Parser<string>;
  static get digit(): Parser<string>;
  static get letter(): Parser<string>;
  static get natural(): Parser<number>;
  static get whole(): Parser<number>;
  static get integer(): Parser<number>;
  static get float(): Parser<number>;
  static get space(): Parser<void>;
  static get whitespace(): Parser<void>;
}
declare class ZeroOrMoreParsers<T> extends Parser<ReadonlyArray<T>> {
  readonly parser: Parser<T>;
  separator: null | undefined | Parser<void>;
  constructor(parser: Parser<T>);
  separatedBy(separator: Parser<void>): ZeroOrMoreParsers<T>;
}
declare class OneOrMoreParsers<T> extends Parser<ReadonlyArray<T>> {
  readonly parser: Parser<T>;
  separator: null | undefined | Parser<unknown>;
  constructor(parser: Parser<T>);
  separatedBy(separator: Parser<unknown>): OneOrMoreParsers<T>;
}

type MapParserTuple<Ps extends ReadonlyArray<Parser<unknown>>> = Ps extends [
  Parser<infer X>,
  ...infer Rest extends Parser<unknown>[],
]
  ? [X, ...MapParserTuple<Rest>]
  : [];

export declare class ParserSequence<
  T extends ReadonlyArray<Parser<unknown>>,
> extends Parser<MapParserTuple<T>> {
  readonly parsers: T;
  constructor(...parsers: T);
  separatedBy(separator: Parser<unknown>): ParserSequence<T>;
}
declare class ParserSet<
  T extends ReadonlyArray<Parser<unknown>>,
> extends Parser<MapParserTuple<T>> {
  readonly parsers: T;
  constructor(...parsers: T);
  separatedBy(separator: Parser<unknown>): ParserSet<T>;
}

export type FromParser<P extends Parser<unknown>> =
  P extends Parser<infer T> ? T : never;
