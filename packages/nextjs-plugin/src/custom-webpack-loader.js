const PLUGIN_NAME = 'stylex';

module.exports = function stylexLoader(inputCode) {
  const callback = this.async();
  const { stylexPlugin } = this.getOptions();
  const logger = this._compiler.getInfrastructureLogger(PLUGIN_NAME);

  stylexPlugin.transformCode(inputCode, this.resourcePath, logger).then(
    ({ code, map }) => {
      callback(null, code, map);
    },
    (error) => {
      callback(error);
    },
  );
};
