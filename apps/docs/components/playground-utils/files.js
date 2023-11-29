/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

export const files = {
  '.babelrc.js': {
    file: {
      contents: `
const tsSyntaxPlugin = require('@babel/plugin-syntax-typescript');
const jsxSyntaxPlugin = require('@babel/plugin-syntax-jsx');

module.exports = {
  plugins: [
    tsSyntaxPlugin,
    jsxSyntaxPlugin,
    [
      "@stylexjs/babel-plugin",
      {
        dev: true,
        stylexSheetName: "<>",
        genConditionalClasses: true,
        unstable_moduleResolution: {
          type: "commonJS",
          rootDir: '/',
        },
      },
    ],
  ],
};
`,
    },
  },
  'package.json': {
    file: {
      contents: `
{
  "name": "stylex-playground",
  "version": "1.0.0",
  "description": "Playground using WebContainers",
  "main": "index.js",
  "scripts": {
    "build": "babel ./input.js -o ./output.js"
  },
  "dependencies": {
    "@stylexjs/stylex": "0.2.0-beta.27",
    "@stylexjs/babel-plugin": "0.2.0-beta.27",
    "@babel/cli": "latest",
    "@babel/core": "latest",
    "@babel/plugin-syntax-typescript": "latest",
    "@babel/plugin-syntax-jsx": "latest"
  }
}
`,
    },
  },
  'input.js': {
    file: {
      contents: `
import * as React from 'react';
import * as stylex from "@stylexjs/stylex";

export default function Card({ onClick, children, theme, variant, em = false }) {
  const props = stylex.props(theme, styles.base, em && styles.emphasise, variantStyles[variant]);
}

const styles = stylex.create({
  base: {
    appearance: "none",
    borderStyle: "none",
    backgroundColor: "blue",
    color: "white",
    borderRadius: 4,
    paddingBlock: 4,
    paddingInline: 8,
  },
  emphasise: {
    transform: "scale(1.1)",
  }
});

const variantStyles = stylex.create({
  danger: {
    backgroundColor: "red",
    color: "white",
  },
  primary: {
    fontWeight: "bold",
  },
});
`,
    },
  },
};
