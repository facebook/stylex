/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {
  CSSToken,
  TokenAtKeyword,
  TokenBadString,
  TokenBadURL,
  TokenCDC,
  TokenCDO,
  TokenColon,
  TokenComma,
  TokenComment,
  TokenDelim,
  TokenDimension,
  TokenEOF,
  TokenFunction,
  TokenHash,
  TokenIdent,
  TokenNumber,
  TokenPercentage,
  TokenSemicolon,
  TokenString,
  TokenURL,
  TokenWhitespace,
  TokenOpenParen,
  TokenCloseParen,
  TokenOpenSquare,
  TokenCloseSquare,
  TokenOpenCurly,
  TokenCloseCurly,
  TokenUnicodeRange,
} from '@csstools/css-tokenizer';

import { TokenList } from './token-types';
import { TokenType } from '@csstools/css-tokenizer';

type TokenNameToTokenType = {
  Comment: TokenComment,
  AtKeyword: TokenAtKeyword,
  BadString: TokenBadString,
  BadURL: TokenBadURL,
  CDC: TokenCDC,
  CDO: TokenCDO,
  Colon: TokenColon,
  Comma: TokenComma,
  Delim: TokenDelim,
  Dimension: TokenDimension,
  EOF: TokenEOF,
  Function: TokenFunction,
  Hash: TokenHash,
  Ident: TokenIdent,
  Number: TokenNumber,
  Percentage: TokenPercentage,
  Semicolon: TokenSemicolon,
  String: TokenString,
  URL: TokenURL,
  Whitespace: TokenWhitespace,
  OpenParen: TokenOpenParen,
  CloseParen: TokenCloseParen,
  OpenSquare: TokenOpenSquare,
  CloseSquare: TokenCloseSquare,
  OpenCurly: TokenOpenCurly,
  CloseCurly: TokenCloseCurly,
  UnicodeRange: TokenUnicodeRange,
};

export class TokenParser<+T> {
  +run: (input: TokenList) => T | Error;

  constructor(parser: (input: TokenList) => T | Error) {
    this.run = parser;
  }

  parse(css: string): T | Error {
    const tokens = new TokenList(css);
    return this.run(tokens);
  }

  parseToEnd(css: string): T {
    const tokens = new TokenList(css);
    const output = this.run(tokens);
    if (output instanceof Error) {
      throw output;
    }
    if (!tokens.isAtEnd) {
      const token = tokens.peek();
      if (token == null) {
        return output;
      }
      throw new Error(`Expected end of input, got ${token[0]} instead`);
    }
    return output;
  }

  map<NewT>(f: (value: T) => NewT): TokenParser<NewT> {
    return new TokenParser((input): NewT | Error => {
      const currentIndex = input.currentIndex;
      const result = this.run(input);
      if (result instanceof Error) {
        input.setCurrentIndex(currentIndex);
        return result;
      }
      return f(result);
    });
  }

  flatMap<U>(f: (value: T) => TokenParser<U>): TokenParser<U> {
    return new TokenParser((input): U | Error => {
      const currentIndex = input.currentIndex;
      const output1 = this.run(input);
      if (output1 instanceof Error) {
        input.setCurrentIndex(currentIndex);
        return output1;
      }
      const secondParser = f(output1);
      const output2: U | Error = secondParser.run(input);
      if (output2 instanceof Error) {
        input.setCurrentIndex(currentIndex);
        return output2;
      }
      return output2;
    });
  }

  or<U>(parser2: TokenParser<U>): TokenParser<T | U> {
    return new TokenParser((input): T | U | Error => {
      const currentIndex = input.currentIndex;
      const output1 = this.run(input);
      if (output1 instanceof Error) {
        input.setCurrentIndex(currentIndex);
        const output2 = parser2.run(input);
        if (output2 instanceof Error) {
          input.setCurrentIndex(currentIndex);
        }
        return output2;
      }
      return output1;
    });
  }

  surroundedBy(
    prefix: TokenParser<mixed>,
    suffix: TokenParser<mixed> = prefix,
  ): TokenParser<T> {
    return this.prefix(prefix).skip(suffix);
  }

  skip(skipParser: TokenParser<mixed>): TokenParser<T> {
    return this.flatMap((output) => skipParser.map(() => output));
  }

  get optional(): TokenParser<void | T> {
    return this.or(TokenParser.always(undefined));
  }

  prefix(prefixParser: TokenParser<mixed>): TokenParser<T> {
    return prefixParser.flatMap(() => this);
  }

  suffix(suffixParser: TokenParser<mixed>): TokenParser<T> {
    return this.flatMap((output) => suffixParser.map(() => output));
  }

  // $FlowFixMe[incompatible-variance]
  where<Refined: T = T>(
    predicate: (value: T) => implies value is Refined,
  ): TokenParser<Refined> {
    return this.flatMap((output) => {
      if (predicate(output)) {
        return TokenParser.always(output);
      }
      return TokenParser.never();
    });
  }

  static never<T>(): TokenParser<T> {
    return new TokenParser(() => new Error('Never'));
  }

  static always<T>(output: T): TokenParser<T> {
    return new TokenParser(() => output);
  }

  static token<TT: CSSToken>(tokenType: TT[0]): TokenParser<TT> {
    return new TokenParser((input): TT | Error => {
      const currentIndex = input.currentIndex;
      const token = input.consumeNextToken();
      if (token == null) {
        input.setCurrentIndex(currentIndex);
        return new Error('Expected token');
      }
      if (token[0] !== tokenType) {
        input.setCurrentIndex(currentIndex);
        return new Error(`Expected token type ${tokenType}, got ${token[0]}`);
      }
      // $FlowFixMe[incompatible-cast]
      return token as TT;
    });
  }

  static tokens: {
    [Key in keyof typeof TokenType]: TokenParser<TokenNameToTokenType[Key]>,
  } = {
    Comment: TokenParser.token<TokenComment>(TokenType.Comment),
    AtKeyword: TokenParser.token<TokenAtKeyword>(TokenType.AtKeyword),
    BadString: TokenParser.token<TokenBadString>(TokenType.BadString),
    BadURL: TokenParser.token<TokenBadURL>(TokenType.BadURL),
    CDC: TokenParser.token<TokenCDC>(TokenType.CDC),
    CDO: TokenParser.token<TokenCDO>(TokenType.CDO),
    Colon: TokenParser.token<TokenColon>(TokenType.Colon),
    Comma: TokenParser.token<TokenComma>(TokenType.Comma),
    Delim: TokenParser.token<TokenDelim>(TokenType.Delim),
    Dimension: TokenParser.token<TokenDimension>(TokenType.Dimension),
    EOF: TokenParser.token<TokenEOF>(TokenType.EOF),
    Function: TokenParser.token<TokenFunction>(TokenType.Function),
    Hash: TokenParser.token<TokenHash>(TokenType.Hash),
    Ident: TokenParser.token<TokenIdent>(TokenType.Ident),
    Number: TokenParser.token<TokenNumber>(TokenType.Number),
    Percentage: TokenParser.token<TokenPercentage>(TokenType.Percentage),
    Semicolon: TokenParser.token<TokenSemicolon>(TokenType.Semicolon),
    String: TokenParser.token<TokenString>(TokenType.String),
    URL: TokenParser.token<TokenURL>(TokenType.URL),
    Whitespace: TokenParser.token<TokenWhitespace>(TokenType.Whitespace),
    OpenParen: TokenParser.token<TokenOpenParen>(TokenType.OpenParen),
    CloseParen: TokenParser.token<TokenCloseParen>(TokenType.CloseParen),
    OpenSquare: TokenParser.token<TokenOpenSquare>(TokenType.OpenSquare),
    CloseSquare: TokenParser.token<TokenCloseSquare>(TokenType.CloseSquare),
    OpenCurly: TokenParser.token<TokenOpenCurly>(TokenType.OpenCurly),
    CloseCurly: TokenParser.token<TokenCloseCurly>(TokenType.CloseCurly),
    UnicodeRange: TokenParser.token<TokenUnicodeRange>(TokenType.UnicodeRange),
  };

  // T will be a union of the output types of the parsers
  static oneOf<T>(...parsers: $ReadOnlyArray<TokenParser<T>>): TokenParser<T> {
    return new TokenParser((input): T | Error => {
      const errors = [];
      const index = input.currentIndex;
      for (const parser of parsers) {
        const output = parser.run(input);
        if (!(output instanceof Error)) {
          return output;
        }
        input.setCurrentIndex(index);
        errors.push(output);
      }
      return new Error(
        'No parser matched\n' +
          errors.map((err) => '- ' + err.toString()).join('\n'),
      );
    });
  }

  static sequence<T: ConstrainedTuple<TokenParser<mixed>>>(
    ...parsers: T
  ): TokenParserSequence<T> {
    return new TokenParserSequence<T>(parsers);
  }

  static setOf<T: ConstrainedTuple<TokenParser<mixed>>>(
    ...parsers: T
  ): TokenParserSet<T> {
    return new TokenParserSet<T>(parsers);
  }

  static zeroOrMore<T>(parser: TokenParser<T>): TokenZeroOrMoreParsers<T> {
    return new TokenZeroOrMoreParsers(parser);
  }

  static oneOrMore<T>(parser: TokenParser<T>): TokenOneOrMoreParsers<T> {
    return new TokenOneOrMoreParsers(parser);
  }
}

class TokenZeroOrMoreParsers<+T> extends TokenParser<$ReadOnlyArray<T>> {
  +parser: TokenParser<T>;
  separator: ?TokenParser<void>;

  constructor(parser: TokenParser<T>) {
    super((input): $ReadOnlyArray<T> => {
      const output: Array<T> = [];
      for (let i = 0; true; i++) {
        const separator = getThis().separator;
        if (i > 0 && separator) {
          const currentIndex = input.currentIndex;
          const result = separator.run(input);
          if (result instanceof Error) {
            input.setCurrentIndex(currentIndex);
            return output;
          }
        }
        const currentIndex = input.currentIndex;
        const result = getThis().parser.run(input);
        if (result instanceof Error) {
          input.setCurrentIndex(currentIndex);
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

  separatedBy(separator: TokenParser<void>): TokenZeroOrMoreParsers<T> {
    this.separator = separator;
    return this;
  }
}

class TokenOneOrMoreParsers<+T> extends TokenParser<$ReadOnlyArray<T>> {
  +parser: TokenParser<T>;
  separator: ?TokenParser<mixed>;

  constructor(parser: TokenParser<T>) {
    super((input): $ReadOnlyArray<T> | Error => {
      const output: Array<T> = [];
      for (let i = 0; true; i++) {
        const separator = getThis().separator;
        if (i > 0 && separator) {
          const currentIndex = input.currentIndex;
          const result = separator.run(input);
          if (result instanceof Error) {
            input.setCurrentIndex(currentIndex);
            return output;
          }
        }
        const currentIndex = input.currentIndex;
        const result = getThis().parser.run(input);
        if (result instanceof Error) {
          if (i === 0) {
            input.setCurrentIndex(currentIndex);
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

  separatedBy(separator: TokenParser<mixed>): TokenOneOrMoreParsers<T> {
    this.separator = separator;
    return this;
  }
}

class TokenParserSequence<
  +T: ConstrainedTuple<TokenParser<mixed>>,
> extends TokenParser<ValuesFromParserTuple<T>> {
  +parsers: T;

  constructor(parsers: T) {
    super((input: TokenList): ValuesFromParserTuple<T> | Error => {
      const currentIndex = input.currentIndex;
      let failed: Error | null = null;

      // $FlowFixMe[incompatible-type]
      const output: ValuesFromParserTuple<T> | Error = parsers.map(
        <X>(parser: TokenParser<X>): X | Error => {
          if (failed) {
            return new Error('already failed');
          }
          const result = parser.run(input);
          if (result instanceof Error) {
            failed = result;
          }
          return result;
        },
      );

      if (failed) {
        const errorToReturn = failed;
        input.setCurrentIndex(currentIndex);
        return errorToReturn;
      }

      return output;
    });

    this.parsers = parsers;
  }

  separatedBy(separator: TokenParser<mixed>): TokenParserSequence<T> {
    // $FlowFixMe[incompatible-type]
    const parsers: T = this.parsers.map(
      <X>(originalParser: TokenParser<X>, index: number): TokenParser<X> =>
        index === 0
          ? originalParser
          : originalParser.prefix(separator.map(() => undefined)),
    );

    return new TokenParserSequence<T>(parsers);
  }
}

class TokenParserSet<
  +T: ConstrainedTuple<TokenParser<mixed>>,
> extends TokenParser<ValuesFromParserTuple<T>> {
  +parsers: T;
  +separator: ?TokenParser<void>;

  constructor(parsers: T, separator?: ?TokenParser<void>) {
    super((input: TokenList): ValuesFromParserTuple<T> | Error => {
      const currentIndex = input.currentIndex;
      let failed: Error | null = null;

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

      if (failed instanceof Error) {
        input.setCurrentIndex(currentIndex);
        return failed;
      }

      return output as ValuesFromParserTuple<T>;
    });
    this.parsers = parsers;
    this.separator = separator;
  }

  separatedBy(separator: TokenParser<mixed>): TokenParserSet<T> {
    const sep =
      this.separator != null
        ? this.separator.prefix(separator.map(() => undefined))
        : separator.map(() => undefined);

    return new TokenParserSet(this.parsers, sep);
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
  | $ReadOnly<[T, T, T, T, T, T, T, T, T, T]>
  | $ReadOnly<[T, T, T, T, T, T, T, T, T, T, T]>
  | $ReadOnly<[T, T, T, T, T, T, T, T, T, T, T, T]>;

// prettier-ignore
export type FromParser<+T: TokenParser<mixed>, Fallback = empty> =
  | Fallback
  | T extends TokenParser<infer V> ? V : empty;

type ValuesFromParserTuple<
  +T: ConstrainedTuple<TokenParser<mixed>>,
  Fallback = empty,
> = {
  [Key in keyof T]: FromParser<T[Key], Fallback>,
};
