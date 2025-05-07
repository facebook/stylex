/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { InjectableStyle, StyleXOptions } from '../common-types';

import { convertStyleToClassName } from '../utils/convert-to-className';
import { arrayEquals } from '../utils/object-utils';
import { sortAtRules, sortPseudos } from '../utils/rule-utils';

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
  compiled(options: StyleXOptions): $ReadOnlyArray<ComputedStyle>;
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
  }

  get atRules(): $ReadOnlyArray<string> {
    const unsortedAtRules = this.keyPath.filter((key) => key.startsWith('@'));
    return sortAtRules(unsortedAtRules);
  }

  get constRules(): $ReadOnlyArray<string> {
    return this.keyPath.filter((key) => key.startsWith('var(--'));
  }

  compiled(
    options: StyleXOptions,
  ): $ReadOnlyArray<[string, InjectableStyle, ClassesToOriginalPaths]> {
    const [_key, className, rule] = convertStyleToClassName(
      [this.property, this.value],
      this.pseudos ?? [],
      this.atRules ?? [],
      this.constRules ?? [],
      options,
    );

    // if (constWrapper != null) {
    //   const wrappedLTR =
    //     rule.ltr != null
    //       ? `${constWrapper}{${rule.ltr}}`
    //       : null;

    //   const wrappedRTL =
    //     rule.rtl != null
    //       ? `${constWrapper}{${rule.rtl}}`
    //       : null;

    //   return [[
    //     className,
    //     {
    //       ltr: wrappedLTR,
    //       rtl: wrappedRTL,
    //       priority: rule.priority,
    //     },
    //     { [className]: this.keyPath },
    //   ]];
    // }

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
