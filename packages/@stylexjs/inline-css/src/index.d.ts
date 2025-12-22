import type { StyleXClassNameFor, StyleXStyles } from '@stylexjs/stylex';
import type { Properties } from 'csstype';

type InlineValue<V> = {
  [Key in string | number]: StyleXClassNameFor<string, V>;
} & ((value: V) => StyleXStyles);

type InlineCSS = {
  [Key in keyof Properties<string | number>]: InlineValue<
    Properties<string | number>[Key]
  >;
};

declare const inlineCSS: InlineCSS;

export = inlineCSS;
