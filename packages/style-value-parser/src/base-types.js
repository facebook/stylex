/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export class SubString {
  +string: string;
  startIndex: number;
  endIndex: number;
  constructor(str: string) {
    this.string = str;
    this.startIndex = 0;
    this.endIndex = str.length - 1;
  }

  startsWith(str: string): boolean {
    // Use a loop to avoid creating a new string
    for (let i = 0; i < str.length; i++) {
      if (
        this.startIndex + i > this.endIndex ||
        this.string[this.startIndex + i] !== str[i]
      ) {
        return false;
      }
    }
    return true;
  }

  get first(): string {
    return this.string[this.startIndex];
  }

  get(relativeIndex: number): string {
    return this.string[this.startIndex + relativeIndex];
  }

  toString(): string {
    return this.string.slice(this.startIndex, this.endIndex + 1);
  }

  get isEmpty(): boolean {
    return this.startIndex > this.endIndex;
  }
}
