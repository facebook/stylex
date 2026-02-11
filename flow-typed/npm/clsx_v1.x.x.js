// flow-typed signature: 5ef3bc11652db024d81b00bd82b56f83
// flow-typed version: 9a968c602c/clsx_v1.x.x/flow_>=v0.201.x

declare module 'clsx' {
  declare type Classes =
    | Array<Classes>
    | { [className: string]: any, ... }
    | string
    | number
    | boolean
    | void
    | null;

  declare module.exports: (...classes: Array<Classes>) => string;
}
