/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { InjectableStyle, StyleXOptions } from '../common-types';
import type { IncludedStyles } from '../stylex-include';

import { convertStyleToClassName } from '../convert-to-className';
import { arrayEquals, arraySort } from '../utils/object-utils';

export type ClassesToOriginalPaths = {
  +[className: string]: $ReadOnlyArray<string>,
};

export type ComputedStyle = null | $ReadOnly<
  [string, InjectableStyle, ClassesToOriginalPaths],
>;

// The classes in this file are used to represent objects that
// can be compiled into one or CSS rules.
//
// These are thin wrappers around the "values" in Raw Style Objects
// with all the metadata needed to compile them into CSS.
export interface IPreRule {
  compiled(
    options: StyleXOptions,
  ): IncludedStyles | $ReadOnlyArray<ComputedStyle>;
  equals(other: IPreRule): boolean;
}

export type AnyPreRule = NullPreRule | PreRule | PreRuleSet;

export class NullPreRule implements IPreRule {
  compiled(_options: StyleXOptions): [null] {
    return [null];
  }

  equals(other: IPreRule): boolean {
    return other instanceof NullPreRule;
  }
}

export class PreIncludedStylesRule implements IPreRule {
  +includedStyles: IncludedStyles;

  constructor(IncludedStyles: IncludedStyles) {
    this.includedStyles = IncludedStyles;
  }

  equals(other: IPreRule): boolean {
    return (
      other instanceof PreIncludedStylesRule &&
      // We can use reference equality here.
      this.includedStyles === other.includedStyles
    );
  }

  compiled(_options: StyleXOptions): IncludedStyles {
    return this.includedStyles;
  }
}

// a comparator function that sorts strings alphabetically
// but where `default` always comes first
const stringComparator = (a: string, b: string): number => {
  if (a === 'default') {
    return -1;
  }
  if (b === 'default') {
    return 1;
  }
  return a.localeCompare(b);
};

const sortPseudos = (
  pseudos: $ReadOnlyArray<string>,
): $ReadOnlyArray<string> => {
  if (pseudos.length < 2) {
    return pseudos;
  }

  return pseudos
    .reduce(
      (acc, pseudo) => {
        if (pseudo.startsWith('::')) {
          return [...acc, pseudo];
        }

        const lastElement = acc[acc.length - 1];
        const allButLast = acc.slice(0, acc.length - 1);
        if (Array.isArray(lastElement)) {
          return [...allButLast, [...lastElement, pseudo]];
        } else {
          return [...allButLast, lastElement, [pseudo]].filter(Boolean);
        }
      },
      [] as $ReadOnlyArray<string | $ReadOnlyArray<string>>,
    )
    .flatMap((pseudo) => {
      if (Array.isArray(pseudo)) {
        return arraySort(pseudo, stringComparator);
      }
      return [pseudo];
    });
};

export class PreRule implements IPreRule {
  +property: string;
  +value: string | number | $ReadOnlyArray<string | number>;
  +keyPath: $ReadOnlyArray<string>;

  constructor(
    property: string,
    value: string | number | $ReadOnlyArray<string | number>,
    keyPath?: $ReadOnlyArray<string>,
  ) {
    this.property = property;
    this.keyPath = keyPath ?? [];
    this.value = value;
  }

  get pseudos(): $ReadOnlyArray<string> {
    const unsortedPseudos = this.keyPath.filter((key) => key.startsWith(':'));

    return sortPseudos(unsortedPseudos);
    // return arraySort(unsortedPseudos, stringComparator);
  }

  get atRules(): $ReadOnlyArray<string> {
    const unsortedAtRules = this.keyPath.filter((key) => key.startsWith('@'));
    return arraySort(unsortedAtRules);
  }

  compiled(
    options: StyleXOptions,
  ): $ReadOnlyArray<[string, InjectableStyle, ClassesToOriginalPaths]> {
    const [_key, className, rule] = convertStyleToClassName(
      [this.property, this.value],
      this.pseudos ?? [],
      this.atRules ?? [],
      options,
    );
    return [[className, rule, { [className]: this.keyPath }]];
  }

  equals(other: IPreRule): boolean {
    if (!(other instanceof PreRule)) {
      return false;
    }

    const valuesEqual =
      Array.isArray(this.value) && Array.isArray(other.value)
        ? arrayEquals(this.value, other.value)
        : this.value === other.value;

    return (
      this.property === other.property &&
      valuesEqual &&
      arrayEquals(this.pseudos, other.pseudos) &&
      arrayEquals(this.atRules, other.atRules)
    );
  }
}

export class PreRuleSet implements IPreRule {
  +rules: $ReadOnlyArray<PreRule | NullPreRule>;

  constructor(rules: $ReadOnlyArray<PreRule | NullPreRule>) {
    this.rules = rules;
  }

  static create(
    rules: $ReadOnlyArray<PreRule | NullPreRule | PreRuleSet>,
  ): AnyPreRule {
    const flatRules = rules.flatMap((rule) =>
      rule instanceof PreRuleSet ? rule.rules : [rule],
    );
    if (flatRules.length === 0) {
      return new NullPreRule();
    }
    if (flatRules.length === 1) {
      return flatRules[0];
    }
    return new PreRuleSet(flatRules);
  }

  compiled(options: StyleXOptions): $ReadOnlyArray<ComputedStyle> {
    const styleTuple: $ReadOnlyArray<ComputedStyle> = this.rules
      .flatMap((rule) => rule.compiled(options))
      .filter(Boolean);
    return styleTuple.length > 0 ? styleTuple : [null];
  }

  equals(other: IPreRule): boolean {
    if (!(other instanceof PreRuleSet)) {
      return false;
    }
    if (this.rules.length !== other.rules.length) {
      return false;
    }
    return arrayEquals(this.rules, other.rules, (a, b) => a.equals(b));
  }
}
