/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

/**
 * This could be an interface, but we use a class so that we can
 * use instanceof to check for it.
 */
// eslint-disable-next-line no-unused-vars
export class Rule<+V> {}

/**
 * This is a class that represents a raw style rule.
 *
 * It exists to track the actual CSS rule that should be compiled
 * even as we transform the structure of the RawStyles object.
 */
export class RawRule<V> extends Rule<V> {
  +key: string;
  +value: V;
  +psuedos: ?$ReadOnlyArray<string>;
  +atRules: ?$ReadOnlyArray<string>;

  constructor(
    key: string,
    value: V,
    psuedos: ?$ReadOnlyArray<string>,
    atRules: ?$ReadOnlyArray<string>,
  ) {
    super();
    this.key = key;
    this.value = value;
    this.psuedos = psuedos;
    this.atRules = atRules;
  }
}

export class RawRuleList<V> extends Rule<V> {
  +rules: $ReadOnlyArray<Rule<V>>;

  constructor(rules: $ReadOnlyArray<Rule<V>>) {
    super();
    this.rules = rules;
  }
}

export class RawRuleRTLTuple<V1, V2> extends Rule<V1 | V2> {
  +rules: [RawRule<V1>, RawRule<V2>];

  constructor(rule1: RawRule<V1>, rule2: RawRule<V2>) {
    super();
    this.rules = [rule1, rule2];
  }
}

export class CompiledRule<V> extends Rule<V> {
  +key: string;
  +value: V;
  +psuedos: ?$ReadOnlyArray<string>;
  +atRules: ?$ReadOnlyArray<string>;
  +className: string;

  constructor(
    key: string,
    value: V,
    psuedos: ?$ReadOnlyArray<string>,
    atRules: ?$ReadOnlyArray<string>,
    className: string,
  ) {
    super();
    this.key = key;
    this.value = value;
    this.psuedos = psuedos;
    this.atRules = atRules;
    this.className = className;
  }
}

export class CompiledRuleTuple2<V1, V2> extends Rule<V1 | V2> {
  +rules: [CompiledRule<V1>, CompiledRule<V2>];

  constructor(rule1: CompiledRule<V1>, rule2: CompiledRule<V2>) {
    super();
    this.rules = [rule1, rule2];
  }
}
