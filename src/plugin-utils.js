function stringifyCssRequest(outputLoaders) {
  const cssLoaders = outputLoaders.map(stringifyLoaderRequest).join('!');

  return `!${cssLoaders}!`;
}

function stringifyLoaderRequest({ loader, options = {} }) {
  return `${loader}?${JSON.stringify(options)}`;
}

module.exports = { stringifyCssRequest, stringifyLoaderRequest };
