/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { CSSToken } from '@csstools/css-tokenizer';
import { tokenizer } from '@csstools/css-tokenizer';

export type TokenIterator = {
  nextToken: () => CSSToken,
  endOfFile: () => boolean,
};

export class TokenList {
  +tokenIterator: TokenIterator;
  +consumedTokens: Array<CSSToken>;
  currentIndex: number;
  isAtEnd: boolean;

  constructor(input: TokenIterator | string) {
    const iterator =
      typeof input === 'string' ? tokenizer({ css: input }) : input;
    this.tokenIterator = iterator;
    this.consumedTokens = [];
    this.currentIndex = 0;
    this.isAtEnd = false;
  }

  consumeNextToken(): CSSToken | null {
    if (this.currentIndex < this.consumedTokens.length) {
      // Return already consumed token
      return this.consumedTokens[this.currentIndex++];
    }

    if (this.isAtEnd) {
      return null;
    }

    if (this.tokenIterator.endOfFile()) {
      this.isAtEnd = true;
      return null;
    }

    const token = this.tokenIterator.nextToken();
    this.consumedTokens.push(token);
    this.currentIndex++;

    return token;
  }

  peek(): CSSToken | null {
    if (this.currentIndex < this.consumedTokens.length) {
      return this.consumedTokens[this.currentIndex];
    }

    if (this.isAtEnd || this.tokenIterator.endOfFile()) {
      return null;
    }

    const token = this.tokenIterator.nextToken();
    this.consumedTokens.push(token);
    return token;
  }

  get first(): CSSToken | null {
    return this.peek();
  }

  setCurrentIndex(newIndex: number): void {
    if (newIndex < this.consumedTokens.length) {
      // If we already have these tokens consumed, just update the index
      this.currentIndex = newIndex;
      return;
    }

    // Try to consume tokens until we reach the target index
    while (
      !this.isAtEnd &&
      !this.tokenIterator.endOfFile() &&
      this.consumedTokens.length <= newIndex
    ) {
      const token = this.tokenIterator.nextToken();
      this.consumedTokens.push(token);
      if (this.tokenIterator.endOfFile()) {
        this.isAtEnd = true;
      }
    }

    // Clamp to the end if we couldn't reach the target
    this.currentIndex = Math.min(newIndex, this.consumedTokens.length);
    // if (this.currentIndex >= this.consumedTokens.length) {
    //   this.isAtEnd = true;
    // }
  }

  rewind(positions: number = 1): void {
    this.currentIndex = Math.max(0, this.currentIndex - positions);
  }

  get isEmpty(): boolean {
    return (
      this.isAtEnd ||
      (this.currentIndex >= this.consumedTokens.length &&
        this.tokenIterator.endOfFile())
    );
  }

  getAllTokens(): $ReadOnlyArray<CSSToken> {
    // Consume all remaining tokens
    while (!this.isEmpty) {
      this.consumeNextToken();
    }
    return this.consumedTokens;
  }

  slice(start: number, end: number = this.currentIndex): Array<CSSToken> {
    const initialIndex = this.currentIndex;
    if (start < 0 || end < start) {
      return [];
    }

    this.setCurrentIndex(start);
    const result: Array<CSSToken> = [];

    // Consume tokens until we have enough to satisfy the slice request
    while (this.currentIndex < end) {
      const token = this.consumeNextToken();
      if (token == null) {
        break;
      }
      result.push(token);
    }

    this.setCurrentIndex(initialIndex);

    return result;
  }
}
