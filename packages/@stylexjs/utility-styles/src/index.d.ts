import type { StyleXClassNameFor, StyleXStyles } from '@stylexjs/stylex';
import type { Properties } from 'csstype';

type UtilValue<V> = {
  [Key in string | number]: StyleXClassNameFor<string, V>;
} & ((value: V) => StyleXStyles);

type UtilStyles = {
  [Key in keyof Properties<string | number>]: UtilValue<
    Properties<string | number>[Key]
  >;
};

declare const utilityStyles: UtilStyles;

export = utilityStyles;
