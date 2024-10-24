/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { SubString } from './base-types';

export class Parser<+T> {
  +run: (input: SubString) => T | Error;

  constructor(parser: (SubString) => T | Error) {
    this.run = parser;
  }

  parse(input: string): T | Error {
    return this.run(new SubString(input));
  }

  parseToEnd(input: string): T {
    const subStr = new SubString(input);
    const output = this.run(subStr);
    if (output instanceof Error) {
      throw output;
    }
    if (!subStr.isEmpty) {
      throw new Error(
        `Expected end of input, got ${subStr.string.slice(
          subStr.startIndex,
        )} instead`,
      );
    }
    return output;
  }

  map<NewT>(f: (T) => NewT): Parser<NewT> {
    return new Parser((input): NewT | Error => {
      const oldOutput = this.run(input);
      if (oldOutput instanceof Error) {
        return oldOutput;
      }
      return f(oldOutput);
    });
  }

  flatMap<U>(f: (T) => Parser<U>): Parser<U> {
    return new Parser((input): U | Error => {
      const { startIndex, endIndex } = input;
      const output1 = this.run(input);
      if (output1 instanceof Error) {
        return output1;
      }
      const secondParser = f(output1);
      const output2: U | Error = secondParser.run(input);
      if (output2 instanceof Error) {
        input.startIndex = startIndex;
        input.endIndex = endIndex;
        return output2;
      }
      return output2;
    });
  }

  or<U>(parser2: Parser<U>): Parser<T | U> {
    return new Parser((input): T | U | Error => {
      const output1 = this.run(input);
      if (output1 instanceof Error) {
        return parser2.run(input);
      }
      return output1;
    });
  }

  surroundedBy(
    prefix: Parser<mixed>,
    suffix: Parser<mixed> = prefix,
  ): Parser<T> {
    return this.prefix(prefix).skip(suffix);
  }

  skip(skipParser: Parser<mixed>): Parser<T> {
    return this.flatMap((output) => skipParser.map(() => output));
  }

  get optional(): Parser<void | T> {
    return this.or(Parser.always(undefined));
  }

  prefix(prefixParser: Parser<mixed>): Parser<T> {
    return prefixParser.flatMap(() => this);
  }

  static never<T>(): Parser<T> {
    return new Parser(() => new Error('Never'));
  }

  static always<T>(output: T): Parser<T> {
    return new Parser(() => output);
  }

  where(predicate: (T) => boolean): Parser<T> {
    return this.flatMap((output) => {
      if (predicate(output)) {
        return Parser.always(output);
      }
      return Parser.never();
    });
  }

  // T will be a union of the output types of the parsers
  static oneOf<T>(...parsers: $ReadOnlyArray<Parser<T>>): Parser<T> {
    return new Parser((input): T | Error => {
      const errors = [];
      for (const parser of parsers) {
        const output = parser.run(input);
        if (!(output instanceof Error)) {
          return output;
        }
        errors.push(output);
      }
      return new Error(
        'No parser matched\n' +
          errors.map((err) => '- ' + err.toString()).join('\n'),
      );
    });
  }

  // Variadic Generics: ...T,
  static sequence<T: ConstrainedTuple<Parser<mixed>>>(
    ...parsers: T
  ): ParserSequence<T> {
    return new ParserSequence<T>(parsers);
  }

  static setOf<T: ConstrainedTuple<Parser<mixed>>>(
    ...parsers: T
  ): ParserSet<T> {
    return new ParserSet<T>(parsers);
  }

  static zeroOrMore<T>(parser: Parser<T>): ZeroOrMoreParsers<T> {
    return new ZeroOrMoreParsers(parser);
  }

  static oneOrMore<T>(parser: Parser<T>): OneOrMoreParsers<T> {
    return new OneOrMoreParsers(parser);
  }

  static string<T: string>(str: T): Parser<T> {
    return new Parser((input): T | Error => {
      const { startIndex, endIndex } = input;
      if (startIndex + str.length - 1 > endIndex) {
        return new Error('End of input');
      }
      if (input.startsWith(str)) {
        input.startIndex += str.length;
        return str;
      }
      return new Error(
        `Expected ${str}, got ${input.string.slice(startIndex)}`,
      );
    });
  }

  static get quotedString(): Parser<string> {
    // TODO: Add support for escaped code-points
    const doubleQuotes: Parser<string> = Parser.sequence<
      $ReadOnly<
        [Parser<string>, Parser<$ReadOnlyArray<string>>, Parser<string>],
      >,
    >(
      Parser.string('"'),
      Parser.zeroOrMore(
        Parser.oneOf(
          Parser.string('\\"').map(() => '"'),
          Parser.string('\\\\').map(() => '\\'),
          Parser.takeWhile((char) => char !== '"' && char !== '\\'),
        ),
      ),
      Parser.string('"'),
    ).map(
      ([_openQuote, chars, _closeQuote]: $ReadOnly<
        [string, $ReadOnlyArray<string>, string],
      >) => chars.join(''),
    );
    const singleQuotes = Parser.sequence(
      Parser.string("'"),
      Parser.zeroOrMore(
        Parser.oneOf(
          Parser.string("\\'").map(() => "'"),
          Parser.string('\\\\').map(() => '\\'),
          Parser.takeWhile((char) => char !== "'" && char !== '\\'),
        ),
      ),
      Parser.string("'"),
    ).map(([, chars]) => chars.join(''));

    return Parser.oneOf(doubleQuotes, singleQuotes);
  }

  static regex(regex: RegExp): Parser<string> {
    return new Parser((input): string | Error => {
      const { startIndex, endIndex } = input;
      if (startIndex > endIndex) {
        return new Error('End of input');
      }
      const match = input.string.slice(startIndex).match(regex);
      if (match) {
        input.startIndex += match[0].length;
        return match[0];
      }
      return new Error(
        `Expected ${String(regex)}, got ${input.string.slice(startIndex)}`,
      );
    });
  }

  static takeWhile(predicate: (string) => boolean): Parser<string> {
    return new Parser((input): string | Error => {
      const { startIndex, endIndex } = input;
      if (startIndex > endIndex) {
        return new Error('End of input');
      }
      let i = startIndex;
      while (i <= endIndex && predicate(input.string[i])) {
        i++;
      }
      const output = input.string.slice(startIndex, i);
      input.startIndex = i;
      return output;
    });
  }

  static get digit(): Parser<string> {
    return new Parser((input): string | Error => {
      if (input.first >= '0' && input.first <= '9') {
        const first = input.first;
        input.startIndex++;
        return first;
      }
      return new Error(`Expected digit, got ${input.first}`);
    });
  }

  static get letter(): Parser<string> {
    return new Parser((input): string | Error => {
      if (
        (input.first >= 'a' && input.first <= 'z') ||
        (input.first >= 'A' && input.first <= 'Z')
      ) {
        const returnValue = input.first;
        input.startIndex++;
        return returnValue;
      }
      return new Error(`Expected letter, got ${input.first}`);
    });
  }

  static get natural(): Parser<number> {
    return Parser.sequence(
      Parser.digit.where((digit) => digit !== '0'),
      Parser.zeroOrMore(Parser.digit),
    ).map(([first, rest]) => parseInt(first + rest.join(''), 10));
  }

  static get whole(): Parser<number> {
    return Parser.sequence(Parser.oneOrMore(Parser.digit)).map(([digits]) =>
      parseInt(digits.join(''), 10),
    );
  }

  static get integer(): Parser<number> {
    return Parser.sequence(
      Parser.string('-').optional.map((char) => (char != null ? -1 : 1)),
      Parser.whole.map((int) => int || 0),
    ).map(([sign, int]) => sign * int);
  }

  static get float(): Parser<number> {
    return Parser.oneOf(
      Parser.sequence(
        Parser.string('-').optional.map((char) => (char != null ? -1 : 1)),
        Parser.whole.map((int) => int || 0),
        Parser.string('.'),
        Parser.oneOrMore(Parser.digit),
      ).map(
        ([sign, int, _, digits]) =>
          sign * parseFloat(int + '.' + digits.join('')),
      ),
      Parser.sequence(
        Parser.string('-').optional.map((char) => (char != null ? -1 : 1)),
        Parser.string('.'),
        Parser.oneOrMore(Parser.digit),
      ).map(([sign, _, digits]) => sign * parseFloat('0.' + digits.join(''))),
      Parser.integer,
    );
  }

  static get space(): Parser<void> {
    return Parser.oneOrMore(Parser.string(' ')).map(() => undefined);
  }

  static get whitespace(): Parser<void> {
    return Parser.oneOrMore(
      Parser.oneOf(
        // Spaces
        Parser.string(' '),
        // Newlines
        Parser.string('\n'),
        // Carriage returns
        Parser.string('\r\n'),
      ),
    ).map(() => undefined);
  }
}

class ZeroOrMoreParsers<+T> extends Parser<$ReadOnlyArray<T>> {
  +parser: Parser<T>;
  separator: ?Parser<void>;

  constructor(parser: Parser<T>) {
    super((input): $ReadOnlyArray<T> => {
      const output: Array<T> = [];
      for (let i = 0; true; i++) {
        const separator = getThis().separator;
        if (i > 0 && separator) {
          const result = separator.run(input);
          if (result instanceof Error) {
            return output;
          }
        }
        const result = getThis().parser.run(input);
        if (result instanceof Error) {
          return output;
        }
        output.push(result);
      }
      // eslint-disable-next-line no-unreachable
      return output;
    });
    const getThis = () => this;
    this.parser = parser;
  }

  separatedBy(separator: Parser<void>): ZeroOrMoreParsers<T> {
    this.separator = separator;
    return this;
  }
}

class OneOrMoreParsers<+T> extends Parser<$ReadOnlyArray<T>> {
  +parser: Parser<T>;
  separator: ?Parser<mixed>;

  constructor(parser: Parser<T>) {
    super((input): $ReadOnlyArray<T> | Error => {
      const output: Array<T> = [];
      for (let i = 0; true; i++) {
        const separator = getThis().separator;
        if (i > 0 && separator) {
          const result = separator.run(input);
          if (result instanceof Error) {
            return output;
          }
        }
        const result = getThis().parser.run(input);
        if (result instanceof Error) {
          if (i === 0) {
            return result;
          }
          return output;
        }
        output.push(result);
      }
      // eslint-disable-next-line no-unreachable
      return output;
    });
    const getThis = () => this;
    this.parser = parser;
  }

  separatedBy(separator: Parser<mixed>): OneOrMoreParsers<T> {
    this.separator = separator;
    return this;
  }
}

export class ParserSequence<+T: ConstrainedTuple<Parser<mixed>>> extends Parser<
  ValuesFromParserTuple<T>,
> {
  +parsers: T;

  constructor(parsers: T) {
    super((input: SubString): ValuesFromParserTuple<T> | Error => {
      const { startIndex, endIndex } = input;
      let failed: null | Error = null;

      // $FlowFixMe[incompatible-type]
      const output: ValuesFromParserTuple<T> | Error = parsers.map(
        <X>(parser: Parser<X>): X | Error => {
          if (failed) {
            return Error('already failed');
          }
          const result = parser.run(input);
          if (result instanceof Error) {
            failed = result;
          }
          return result;
        },
      );

      if (failed) {
        input.startIndex = startIndex;
        input.endIndex = endIndex;
        return failed;
      }

      return output;
    });

    this.parsers = parsers;
  }

  separatedBy(separator: Parser<mixed>): ParserSequence<T> {
    // $FlowFixMe[incompatible-type]
    const parsers: T = this.parsers.map(
      <X>(originalParser: Parser<X>, index: number): Parser<X> =>
        index === 0
          ? originalParser
          : originalParser.prefix(separator.map(() => undefined)),
    );

    return new ParserSequence<T>(parsers);
  }
}

// Similar to ParserSequence, but the parsers can occur in any order.
class ParserSet<+T: ConstrainedTuple<Parser<mixed>>> extends Parser<
  ValuesFromParserTuple<T>,
> {
  +parsers: T;
  +separator: ?Parser<void>;

  constructor(parsers: T, separator?: ?Parser<void>) {
    super((input: SubString): ValuesFromParserTuple<T> | Error => {
      const { startIndex, endIndex } = input;
      let failed: null | Error = null;

      const output: [...ValuesFromParserTuple<T>] = [] as $FlowFixMe;
      const indices: Set<number> = new Set();

      for (let i = 0; i < parsers.length; i++) {
        let found = false;
        const errors = [];
        if (separator != null && i > 0) {
          const result = separator.run(input);
          if (result instanceof Error) {
            failed = new Error(
              `Expected ${separator.toString()} but got ${result.message}`,
            );
            break;
          }
        }
        for (let j = 0; j < parsers.length && !indices.has(j); j++) {
          const parser = parsers[j];
          const result = parser.run(input);
          if (result instanceof Error) {
            errors.push(result);
          } else {
            found = true;
            output[j] = result;
            indices.add(j);
            break;
          }
        }
        if (found) {
          continue;
        } else {
          failed = new Error(
            `Expected one of ${parsers
              .map((parser) => parser.toString())
              .join(', ')} but got ${errors
              .map((error) => error.message)
              .join(', ')}`,
          );
          break;
        }
      }

      if (failed) {
        input.startIndex = startIndex;
        input.endIndex = endIndex;
        return failed;
      }

      return output as ValuesFromParserTuple<T>;
    });
    this.parsers = parsers;
    this.separator = separator;
  }

  // TODO: This is wrong!
  separatedBy(separator: Parser<mixed>): ParserSet<T> {
    // This is correct, but Flow can't map tuples right.
    // $FlowFixMe[incompatible-type]
    // const parsers: T = this.parsers.map(
    //   <X>(originalParser: Parser<X>): Parser<X> =>
    //     originalParser.prefix(separator.map(() => undefined)),
    // );

    const sep =
      this.separator != null
        ? this.separator.prefix(separator.map(() => undefined))
        : separator.map(() => undefined);

    return new ParserSet(this.parsers, sep);
  }
}

type ConstrainedTuple<+T> =
  | $ReadOnly<[T]>
  | $ReadOnly<[T, T]>
  | $ReadOnly<[T, T, T]>
  | $ReadOnly<[T, T, T, T]>
  | $ReadOnly<[T, T, T, T, T]>
  | $ReadOnly<[T, T, T, T, T, T]>
  | $ReadOnly<[T, T, T, T, T, T, T]>
  | $ReadOnly<[T, T, T, T, T, T, T, T]>
  | $ReadOnly<[T, T, T, T, T, T, T, T, T]>
  | $ReadOnly<[T, T, T, T, T, T, T, T, T, T]>;

// prettier-ignore
export type FromParser<+T: Parser<mixed>, Fallback = empty> =
  | Fallback
  | T extends Parser<infer V> ? V : empty;

type ValuesFromParserTuple<
  +T: ConstrainedTuple<Parser<mixed>>,
  Fallback = empty,
> = {
  [Key in keyof T]: FromParser<T[Key], Fallback>,
};
