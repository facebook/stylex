/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare const STYLEX_SOURCE: string;

export const INITIAL_INPUT_FILES: Record<string, string> = {
  'App.tsx': `import * as stylex from "@stylexjs/stylex";
import Counter from "./Counter";
import { colors } from "./tokens.stylex";

export default function App() {
  return (
    <div {...stylex.props(styles.container)}>
      <h1 {...stylex.props(styles.h1)}>Welcome to the StyleX Playground!</h1>
      <Counter />
    </div>
  );
}

const styles = stylex.create({
  container: {
    backgroundColor: colors.bg,
    padding: 32,
    margin: 16,
    borderRadius: 12,
  },
  h1: {
    color: colors.text,
    textAlign: "center",
    fontSize: 32,
    fontWeight: 600,
    textShadow: "0 1px 2px rgb(0 0 0 / 10%)",
    margin: 0,
  },
});
`,
  'tokens.stylex.ts': `import * as stylex from "@stylexjs/stylex";

export const colors = stylex.defineVars({
  bg: "light-dark(#fff, #000)",
  text: "light-dark(#222, #bbb)",
});
`,
  'Counter.tsx': `import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div {...stylex.props(styles.container)}>
      <button
        {...stylex.props(styles.btn)}
        onClick={() => setCount((x) => x - 1)}
      >
        -
      </button>
      <span {...stylex.props(styles.output)}>{count}</span>
      <button
        {...stylex.props(styles.btn)}
        onClick={() => setCount((x) => x + 1)}
      >
        +
      </button>
    </div>
  );
}

const styles = stylex.create({
  container: {
    display: "flex",
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    padding: 8,
    paddingInline: 16,
    cursor: "pointer",
    borderStyle: "none",
    appearance: "none",
    borderRadius: 4,
    color: "white",
    backgroundColor: {
      default: "#279",
      ":hover": "#39b",
      ":focus-visible": "#39b",
    },
    transform: {
      default: null,
      ":active": "scale(0.95)",
    },
    transitionProperty: 'transform',
    transitionDuration: '0.1s',
  },
  output: {
    padding: 8,
    minWidth: 54,
    textAlign: "center",
  },
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
          react: '19.2.3',
          'react-dom': '19.2.3',
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
    code: STYLEX_SOURCE, // inlined via waku.config.ts
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
