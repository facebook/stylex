/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

/**
 * Tokenize CSS following the {@link https://drafts.csswg.org/css-syntax/#tokenization | CSS Syntax Level 3 specification}.
 *
 * @remarks
 * The tokenizing and parsing tools provided by CSS Tools are designed to be low level and generic with strong ties to their respective specifications.
 *
 * Any analysis or mutation of CSS source code should be done with the least powerful tool that can accomplish the task.
 * For many applications it is sufficient to work with tokens.
 * For others you might need to use {@link https://github.com/csstools/postcss-plugins/tree/main/packages/css-parser-algorithms | @csstools/css-parser-algorithms} or a more specific parser.
 *
 * @example
 * Tokenize a string of CSS into an array of tokens:
 * ```js
 * import { tokenize } from '@csstools/css-tokenizer';
 *
 * const myCSS = `@media only screen and (min-width: 768rem) {
 * 	.foo {
 * 		content: 'Some content!' !important;
 * 	}
 * }
 * `;
 *
 * const tokens = tokenize({
 * 	css: myCSS,
 * });
 *
 * console.log(tokens);
 * ```
 *
 * @packageDocumentation
 *
 *
 */

/* eslint-disable ft-flow/no-types-missing-file-annotation */

declare module '@csstools/css-tokenizer' {
  /**
   * Deep clone a list of tokens.
   * Useful for mutations without altering the original list.
   */
  declare export function cloneTokens(tokens: Array<CSSToken>): Array<CSSToken>;

  /**
   * The type of hash token
   */
  declare export enum HashType {
    /**
     * The hash token did not start with an ident sequence (e.g. `#-2`)
     */
    Unrestricted = 'unrestricted',
    /**
     * The hash token started with an ident sequence (e.g. `#foo`)
     * Only hash tokens with the "id" type are valid ID selectors.
     */
    ID = 'id',
  }

  /**
   * Assert that a given value has the general structure of a CSS token:
   * 1. is an array.
   * 2. has at least four items.
   * 3. has a known token type.
   * 4. has a string representation.
   * 5. has a start position.
   * 6. has an end position.
   */
  declare export function isToken(x: any): x is CSSToken;

  declare export function isTokenAtKeyword(
    x?: CSSToken | null,
  ): x is TokenAtKeyword;

  declare export function isTokenBadString(
    x?: CSSToken | null,
  ): x is TokenBadString;

  declare export function isTokenBadURL(x?: CSSToken | null): x is TokenBadURL;

  declare export function isTokenCDC(x?: CSSToken | null): x is TokenCDC;

  declare export function isTokenCDO(x?: CSSToken | null): x is TokenCDO;

  declare export function isTokenCloseCurly(
    x?: CSSToken | null,
  ): x is TokenCloseCurly;

  declare export function isTokenCloseParen(
    x?: CSSToken | null,
  ): x is TokenCloseParen;

  declare export function isTokenCloseSquare(
    x?: CSSToken | null,
  ): x is TokenCloseSquare;

  declare export function isTokenColon(x?: CSSToken | null): x is TokenColon;

  declare export function isTokenComma(x?: CSSToken | null): x is TokenComma;

  declare export function isTokenComment(
    x?: CSSToken | null,
  ): x is TokenComment;

  declare export function isTokenDelim(x?: CSSToken | null): x is TokenDelim;

  declare export function isTokenDimension(
    x?: CSSToken | null,
  ): x is TokenDimension;

  declare export function isTokenEOF(x?: CSSToken | null): x is TokenEOF;

  declare export function isTokenFunction(
    x?: CSSToken | null,
  ): x is TokenFunction;

  declare export function isTokenHash(x?: CSSToken | null): x is TokenHash;

  declare export function isTokenIdent(x?: CSSToken | null): x is TokenIdent;

  declare export function isTokenNumber(x?: CSSToken | null): x is TokenNumber;

  /**
   * Assert that a token is a numeric token
   */
  declare export function isTokenNumeric(
    x?: CSSToken | null,
  ): x is NumericToken;

  declare export function isTokenOpenCurly(
    x?: CSSToken | null,
  ): x is TokenOpenCurly;

  declare export function isTokenOpenParen(
    x?: CSSToken | null,
  ): x is TokenOpenParen;

  declare export function isTokenOpenSquare(
    x?: CSSToken | null,
  ): x is TokenOpenSquare;

  declare export function isTokenPercentage(
    x?: CSSToken | null,
  ): x is TokenPercentage;

  declare export function isTokenSemicolon(
    x?: CSSToken | null,
  ): x is TokenSemicolon;

  declare export function isTokenString(x?: CSSToken | null): x is TokenString;

  declare export function isTokenUnicodeRange(
    x?: CSSToken | null,
  ): x is TokenUnicodeRange;

  declare export function isTokenURL(x?: CSSToken | null): x is TokenURL;

  declare export function isTokenWhitespace(
    x?: CSSToken | null,
  ): x is TokenWhitespace;

  /**
   * Assert that a token is a whitespace or comment token
   */
  declare export function isTokenWhiteSpaceOrComment(
    x?: CSSToken | null,
  ): x is TokenWhitespace | TokenComment;

  /**
   * Get the mirror variant of a given token
   *
   * @example
   *
   * ```js
   * const input = [(typeof TokenType)['OpenParen'], '(', 0, 1, undefined];
   * const output = mirrorVariant(input);
   *
   * console.log(output); // [(typeof TokenType)['CloseParen'], ')', -1, -1, undefined]
   * ```
   */
  declare export function mirrorVariant(token: CSSToken): CSSToken | null;

  /**
   * Get the mirror variant type of a given token type
   *
   * @example
   *
   * ```js
   * const input = (typeof TokenType)['OpenParen'];
   * const output = mirrorVariantType(input);
   *
   * console.log(output); // (typeof TokenType)['CloseParen']
   * ```
   */
  declare export function mirrorVariantType(
    type: TTokenType,
  ): TTokenType | null;

  /**
   * Set the ident value and update the string representation.
   * This handles escaping.
   */
  declare export function mutateIdent(
    ident: TokenIdent,
    newValue: string,
  ): void;

  /**
   * Set the unit and update the string representation.
   * This handles escaping.
   */
  declare export function mutateUnit(
    ident: TokenDimension,
    newUnit: string,
  ): void;

  /**
   * The type of number token
   * Either `integer` or `number`
   */
  declare export enum NumberType {
    Integer = 'integer',
    Number = 'number',
  }

  /**
   * The union of all possible CSS tokens that represent a numeric value
   */
  declare export type NumericToken =
    | TokenDimension
    | TokenNumber
    | TokenPercentage;

  /**
   * The CSS Tokenizer is forgiving and will never throw on invalid input.
   * Any errors are reported through the `onParseError` callback.
   */
  declare export class ParseError extends Error {
    /** The index of the start character of the current token. */
    sourceStart: number;
    /** The index of the end character of the current token. */
    sourceEnd: number;
    /** The parser steps that preceded the error. */
    parserState: Array<string>;
    constructor(
      message: string,
      sourceStart: number,
      sourceEnd: number,
      parserState: Array<string>,
    ): ParseError;
  }

  declare export const ParseErrorMessage: {
    UnexpectedNewLineInString: string,
    UnexpectedEOFInString: string,
    UnexpectedEOFInComment: string,
    UnexpectedEOFInURL: string,
    UnexpectedEOFInEscapedCodePoint: string,
    UnexpectedCharacterInURL: string,
    InvalidEscapeSequenceInURL: string,
    InvalidEscapeSequenceAfterBackslash: string,
  };

  declare export class ParseErrorWithToken extends ParseError {
    /** The associated token. */
    token: CSSToken;
    constructor(
      message: string,
      sourceStart: number,
      sourceEnd: number,
      parserState: Array<string>,
      token: CSSToken,
    ): ParseErrorWithToken;
  }

  /**
   * Concatenate the string representation of a list of tokens.
   * This is not a proper serializer that will handle escaping and whitespace.
   * It only produces valid CSS for a token list that is also valid.
   */
  declare export function stringify(...tokens: Array<CSSToken>): string;

  /**
   * The CSS Token interface
   *
   * @remarks
   * CSS Tokens are fully typed and have a strict structure.
   * This makes it easier to iterate and analyze a token stream.
   *
   * The string representation and the parsed value are stored separately for many token types.
   * It is always assumed that the string representation will be used when stringifying, while the parsed value should be used when analyzing tokens.
   */

  type TokenTypeToValue = {
    comment: void,
    'at-keyword-token': {
      /**
       * The unescaped at-keyword name without the leading `@`.
       */
      value: string,
    },
    'bad-string-token': void,
    'bad-url-token': void,
    'CDC-token': void,
    'CDO-token': void,
    'colon-token': void,
    'comma-token': void,
    'delim-token': {
      /**
       * The delim character.
       */
      value: string,
    },
    'dimension-token': {
      /**
       * The numeric value.
       */
      value: number,
      /**
       * The unescaped unit name.
       */
      unit: string,
      /**
       * `integer` or `number`
       */
      type: NumberType,
      /**
       * The sign character as it appeared in the source.
       * This is only useful if you need to determine if a value was written as "2px" or "+2px".
       */
      signCharacter?: '+' | '-',
    },
    'EOF-token': void,
    'function-token': {
      /**
       * The unescaped function name without the trailing `(`.
       */
      value: string,
    },
    'hash-token': {
      /**
       * The unescaped hash value without the leading `#`.
       */
      value: string,
      /**
       * The hash type.
       */
      type: HashType,
    },
    'ident-token': {
      /**
       * The unescaped ident value.
       */
      value: string,
    },
    'number-token': {
      /**
       * The numeric value.
       */
      value: number,
      /**
       * `integer` or `number`
       */
      type: NumberType,
      /**
       * The sign character as it appeared in the source.
       * This is only useful if you need to determine if a value was written as "2" or "+2".
       */
      signCharacter?: '+' | '-',
    },
    'percentage-token': {
      /**
       * The numeric value.
       */
      value: number,
      /**
       * The sign character as it appeared in the source.
       * This is only useful if you need to determine if a value was written as "2%" or "+2%".
       */
      signCharacter?: '+' | '-',
    },
    'semicolon-token': void,
    'string-token': {
      /**
       * The unescaped string value without the leading and trailing quotes.
       */
      value: string,
    },
    'url-token': {
      /**
       * The unescaped URL value without the leading `url(` and trailing `)`.
       */
      value: string,
    },
    'whitespace-token': void,
    '(-token': void,
    ')-token': void,
    '[-token': void,
    ']-token': void,
    '{-token': void,
    '}-token': void,
    'unicode-range-token': {
      startOfRange: number,
      endOfRange: number,
    },
  };
  declare export type TokenAtKeyword = $ReadOnly<
    [
      (typeof TokenType)['AtKeyword'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['AtKeyword']],
    ],
  >;
  declare export type TokenBadString = $ReadOnly<
    [
      (typeof TokenType)['BadString'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['BadString']],
    ],
  >;
  declare export type TokenBadURL = $ReadOnly<
    [
      (typeof TokenType)['BadURL'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['BadURL']],
    ],
  >;
  declare export type TokenCDC = $ReadOnly<
    [
      (typeof TokenType)['CDC'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['CDC']],
    ],
  >;
  declare export type TokenCDO = $ReadOnly<
    [
      (typeof TokenType)['CDO'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['CDO']],
    ],
  >;
  declare export type TokenCloseCurly = $ReadOnly<
    [
      (typeof TokenType)['CloseCurly'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['CloseCurly']],
    ],
  >;
  declare export type TokenColon = $ReadOnly<
    [
      (typeof TokenType)['Colon'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['Colon']],
    ],
  >;
  declare export type TokenComma = $ReadOnly<
    [
      (typeof TokenType)['Comma'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['Comma']],
    ],
  >;
  declare export type TokenComment = $ReadOnly<
    [
      (typeof TokenType)['Comment'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['Comment']],
    ],
  >;
  declare export type TokenDimension = $ReadOnly<
    [
      (typeof TokenType)['Dimension'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['Dimension']],
    ],
  >;
  declare export type TokenDelim = $ReadOnly<
    [
      (typeof TokenType)['Delim'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['Delim']],
    ],
  >;
  declare export type TokenEOF = $ReadOnly<
    [
      (typeof TokenType)['EOF'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['EOF']],
    ],
  >;
  declare export type TokenFunction = $ReadOnly<
    [
      (typeof TokenType)['Function'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['Function']],
    ],
  >;
  declare export type TokenHash = $ReadOnly<
    [
      (typeof TokenType)['Hash'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['Hash']],
    ],
  >;
  declare export type TokenIdent = $ReadOnly<
    [
      (typeof TokenType)['Ident'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['Ident']],
    ],
  >;
  declare export type TokenNumber = $ReadOnly<
    [
      (typeof TokenType)['Number'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['Number']],
    ],
  >;
  declare export type TokenOpenCurly = $ReadOnly<
    [
      (typeof TokenType)['OpenCurly'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['OpenCurly']],
    ],
  >;

  declare export type TokenOpenParen = $ReadOnly<
    [
      (typeof TokenType)['OpenParen'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['OpenParen']],
    ],
  >;

  declare export type TokenCloseParen = $ReadOnly<
    [
      (typeof TokenType)['CloseParen'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['CloseParen']],
    ],
  >;
  declare export type TokenOpenSquare = $ReadOnly<
    [
      (typeof TokenType)['OpenSquare'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['OpenSquare']],
    ],
  >;
  declare export type TokenCloseSquare = $ReadOnly<
    [
      (typeof TokenType)['CloseSquare'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['CloseSquare']],
    ],
  >;
  declare export type TokenPercentage = $ReadOnly<
    [
      (typeof TokenType)['Percentage'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['Percentage']],
    ],
  >;

  declare export type TokenSemicolon = $ReadOnly<
    [
      (typeof TokenType)['Semicolon'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['Semicolon']],
    ],
  >;

  declare export type TokenString = $ReadOnly<
    [
      (typeof TokenType)['String'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['String']],
    ],
  >;
  declare export type TokenUnicodeRange = $ReadOnly<
    [
      (typeof TokenType)['UnicodeRange'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['UnicodeRange']],
    ],
  >;
  declare export type TokenURL = $ReadOnly<
    [
      (typeof TokenType)['URL'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['URL']],
    ],
  >;
  declare export type TokenWhitespace = $ReadOnly<
    [
      (typeof TokenType)['Whitespace'],
      string,
      number,
      number,
      TokenTypeToValue[(typeof TokenType)['Whitespace']],
    ],
  >;

  /**
   * The union of all possible CSS tokens
   */
  declare export type CSSToken =
    | TokenAtKeyword
    | TokenBadString
    | TokenBadURL
    | TokenCDC
    | TokenCDO
    | TokenColon
    | TokenComma
    | TokenComment
    | TokenDelim
    | TokenDimension
    | TokenEOF
    | TokenFunction
    | TokenHash
    | TokenIdent
    | TokenNumber
    | TokenPercentage
    | TokenSemicolon
    | TokenString
    | TokenURL
    | TokenWhitespace
    | TokenOpenParen
    | TokenCloseParen
    | TokenOpenSquare
    | TokenCloseSquare
    | TokenOpenCurly
    | TokenCloseCurly
    | TokenUnicodeRange;

  /**
   * Tokenize a CSS string into a list of tokens.
   */
  declare export function tokenize(
    input: {
      css: {
        valueOf(): string,
      },
      unicodeRangesAllowed?: boolean,
    },
    options?: {
      onParseError?: (error: ParseError) => void,
    },
  ): Array<CSSToken>;

  /**
   * Create a tokenizer for a CSS string.
   */
  declare export function tokenizer(
    input: {
      css:
        | string
        | {
            valueOf(): string,
          },
      unicodeRangesAllowed?: boolean,
    },
    options?: {
      +onParseError?: (error: ParseError) => void,
    },
  ): {
    nextToken: () => CSSToken,
    endOfFile: () => boolean,
  };

  /**
   * All possible CSS token types
   */
  declare export const TokenType: {
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#comment-diagram}
     */
    Comment: 'comment',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-at-keyword-token}
     */
    AtKeyword: 'at-keyword-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-bad-string-token}
     */
    BadString: 'bad-string-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-bad-url-token}
     */
    BadURL: 'bad-url-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-cdc-token}
     */
    CDC: 'CDC-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-cdo-token}
     */
    CDO: 'CDO-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-colon-token}
     */
    Colon: 'colon-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-comma-token}
     */
    Comma: 'comma-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-delim-token}
     */
    Delim: 'delim-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-dimension-token}
     */
    Dimension: 'dimension-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-eof-token}
     */
    EOF: 'EOF-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-function-token}
     */
    Function: 'function-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-hash-token}
     */
    Hash: 'hash-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-ident-token}
     */
    Ident: 'ident-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-percentage-token}
     */
    Number: 'number-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-percentage-token}
     */
    Percentage: 'percentage-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-semicolon-token}
     */
    Semicolon: 'semicolon-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-string-token}
     */
    String: 'string-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-url-token}
     */
    URL: 'url-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#typedef-whitespace-token}
     */
    Whitespace: 'whitespace-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-open-paren}
     */
    OpenParen: '(-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-close-paren}
     */
    CloseParen: ')-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-open-square}
     */
    OpenSquare: '[-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-close-square}
     */
    CloseSquare: ']-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-open-curly}
     */
    OpenCurly: '{-token',
    /**
     * @see {@link https://www.w3.org/TR/2021/CRD-css-syntax-3-20211224/#tokendef-close-curly}
     */
    CloseCurly: '}-token',
    /**
     * Only appears in the token stream when the `unicodeRangesAllowed` option is set to true.
     *
     * @example
     * ```js
     * import { tokenize } from '@csstools/css-tokenizer';
     *
     * const tokens: tokenize({
     * 	css: `U+0025-00FF, U+4??`,
     * 	unicodeRangesAllowed: true,
     * });
     *
     * console.log(tokens);
     * ```
     *
     * @see {@link https://drafts.csswg.org/css-syntax/#typedef-unicode-range-token}
     */
    UnicodeRange: 'unicode-range-token',
  };
  declare export type TTokenType = (typeof TokenType)[$Keys<typeof TokenType>];
}
