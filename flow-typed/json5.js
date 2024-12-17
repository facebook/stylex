// @flow
type TSConfig = {
  compilerOptions?: {
    baseUrl?: string,
    paths?: { [key: string]: Array<string> },
  },
};

type DenoConfig = {
  imports?: { [key: string]: string | Array<string> },
};

type PackageJSON = {
  name?: string,
  imports?: { [key: string]: string | Array<string> },
};

type ConfigType = TSConfig | DenoConfig | PackageJSON;

declare module 'json5' {
  declare module.exports: {
    parse: (input: string) => mixed,
    stringify: (
      value: mixed,
      replacer?: ?Function | ?Array<mixed>,
      space?: string | number,
    ) => string,
  };
}
