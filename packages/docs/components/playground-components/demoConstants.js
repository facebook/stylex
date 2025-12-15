/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const INITIAL_INPUT_FILES = {
  'App.js': `import * as stylex from "@stylexjs/stylex";
import { colors } from "./tokens.stylex";

export default function App() {
  return (
    <div {...stylex.props(styles.container)}>
      <h1 {...stylex.props(styles.text)}>Hello StyleX!</h1>
    </div>
  );
}

const styles = stylex.create({
  container: {
    backgroundColor: {
      default: colors.primary,
      ":hover": colors.secondary,
    },
    padding: 32,
    margin: 16,
    borderRadius: 12,
  },
  text: {
    color: "white",
    fontSize: 32,
    fontWeight: 600,
    textShadow: "0 1px 2px rgb(0 0 0 / 10%)",
    margin: 0,
  },
});
`,
  'tokens.stylex.js': `import * as stylex from "@stylexjs/stylex";

export const colors = stylex.defineVars({
  primary: "rebeccapurple",
  secondary: "mediumorchid",
});
`,
};

export const INITIAL_BUNDLER_FILES = {
  '/index.js': {
    code: `import './styles.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
createRoot(document.getElementById('root')).render(<App />);`,
  },
  '/public/index.html': {
    code: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body><div id="root"></div></body>
</html>`,
  },
  '/package.json': {
    code: JSON.stringify(
      {
        main: '/index.js',
        dependencies: {
          react: 'latest',
          'react-dom': 'latest',
        },
      },
      null,
      2,
    ),
  },
  '/node_modules/@stylexjs/stylex/package.json': {
    code: JSON.stringify(
      {
        name: '@stylexjs/stylex',
        main: './index.js',
      },
      null,
      2,
    ),
  },
  '/node_modules/@stylexjs/stylex/index.js': {
    code: STYLEX_SOURCE, // global variable from DefinePlugin()
  },
};

export const CSS_PRELUDE = `@layer resets {
:root {
  color-scheme: light dark;
}
* {
  box-sizing: border-box;
}
html, body {
  margin: 0;
  font-family: system-ui, sans-serif;
}
}
`;
