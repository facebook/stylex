/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const { fetchTemplatesManifest } = require('./utils/fetch-template');

/**
 * Bundled templates as fallback if GitHub fetch fails
 */
const BUNDLED_TEMPLATES = require('../templates.json').templates;

/**
 * Get templates from GitHub, falling back to bundled templates
 * @returns {Promise<Array>} Array of template definitions
 */
async function getTemplates() {
  try {
    const manifest = await fetchTemplatesManifest();
    if (manifest && Array.isArray(manifest.templates)) {
      return manifest.templates;
    }
  } catch (error) {
    // Silently fall back to bundled templates
  }
  return BUNDLED_TEMPLATES;
}

/**
 * Get bundled templates synchronously (for help text, etc.)
 * @returns {Array} Array of template definitions
 */
function getBundledTemplates() {
  return BUNDLED_TEMPLATES;
}

module.exports = {
  getTemplates,
  getBundledTemplates,
  BUNDLED_TEMPLATES,
};
