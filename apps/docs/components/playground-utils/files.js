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
module.exports = {
  presets: ["@babel/preset-react"],
  plugins: [
    "transform-node-env-inline",
    [
      "@stylexjs/babel-plugin",
      {
        dev: false,
        stylexSheetName: "<>",
        genConditionalClasses: true,
        unstable_moduleResolution: {
          type: "commonJS",
          rootDir: "/",
        },
      },
    ],
  ],
};
      
`,
    },
  },
  'index.html': {
    file: {
      contents: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Stylex Playground</title>
  <link rel="stylesheet" href="./stylex.css">
</head>
<body>
  <h1>Loaded HTML from webcontainer!</h1>
  <div id="root"></div>
  <script src="./bundle.js"></script>
</body>
</html>
      `,
    },
  },
  'rollup.config.mjs': {
    file: {
      contents: `
import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import serve from "rollup-plugin-serve";
import stylex from "@stylexjs/rollup-plugin";

const extensions = [".js", ".jsx", "ts", "tsx"];

export default {
  extensions,
  input: "./input.js",
  output: {
    file: "./bundle.js",
    format: "umd",
  },
  plugins: [
    stylex({ fileName: "stylex.css" }),
    babel({
      babelHelpers: "bundled",
      extensions,
      configFile: "./.babelrc.js",
    }),
    resolve({ extensions }),
    commonjs(),
    serve({
      contentBase: "./",
      port: 3111,
    }),
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
    "build": "babel ./input.js -o ./output.js",
    "start": "rollup --config ./rollup.config.mjs --watch"
  },
  "dependencies": {
    "@babel/cli": "latest",
    "@babel/core": "latest",
    "@babel/plugin-syntax-flow": "latest",
    "@babel/plugin-syntax-jsx": "latest",
    "@babel/plugin-syntax-typescript": "latest",
    "@babel/preset-env": "^7.23.5",
    "@babel/preset-react": "^7.23.3",
    "@rollup/plugin-babel": "6.0.4",
    "@rollup/plugin-commonjs": "25.0.7",
    "@rollup/plugin-node-resolve": "15.2.3",
    "@rollup/plugin-typescript": "^11.1.5",
    "@stylexjs/babel-plugin": "0.2.0-beta.27",
    "@stylexjs/rollup-plugin": "0.2.0-beta.27",
    "@stylexjs/stylex": "0.2.0-beta.27",
    "babel-plugin-transform-node-env-inline": "^0.4.3",
    "react": "*",
    "react-dom": "*",
    "rollup": "4.6.1",
    "rollup-plugin-serve": "3.0.0"
  }
}
`,
    },
  },
  'input.js': {
    file: {
      contents: `
import * as React from "react";
import * as ReactDOM from "react-dom";
import Card from "./src/app";

ReactDOM.render(
  React.createElement(Card, { em: true }, "Hello World!"),
  document.getElementById("root")
);
      `,
    },
  },
  src: {
    directory: {
      'app.jsx': {
        file: {
          contents: `
import * as React from 'react';
import * as stylex from "@stylexjs/stylex";

export default function Card({ children, em = false, ...props }) {
  return (
    <div {...props} {...stylex.props(styles.base, em && styles.emphasise)}>
      {children}
    </div>
  );
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
          `,
        },
      },
    },
  },
};
