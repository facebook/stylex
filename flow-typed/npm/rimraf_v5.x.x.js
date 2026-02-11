// flow-typed signature: cfbe5bc6e47b861adf88a6819e721dbb
// flow-typed version: 68e40ea7b8/rimraf_v5.x.x/flow_>=v0.104.x

declare module 'rimraf' {
  declare type Options = {
    maxRetries?: number,
    glob?: boolean,
    ...
  };

  declare module.exports: {
    (f: string, opts?: Options): Promise<boolean>,
    sync(path: string, opts?: Options): boolean,
    ...
  };
}
