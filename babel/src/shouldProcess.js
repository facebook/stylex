/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 */

module.exports = function shouldProcess(fileSourceText) {
  return fileSourceText.includes('stylex');
};
