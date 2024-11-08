/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

export const files = {
  public: {
    directory: {
      'index.html': {
        file: {
          contents: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React + Rollup</title>
    <link rel="stylesheet" href="/resets.css" />
    <link rel="stylesheet" href="/stylex.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/bundle.js"></script>
  </body>
</html>
          `,
        },
      },
      'resets.css': {
        file: {
          contents: `
@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    color-scheme: light dark;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: light-dark(white, black);
    line-height: 1.5;
  }
}
          `,
        },
      },
    },
  },
  build: {
    directory: {
      'rollup-stylex-plugin.mjs': {
        file: {
          contents: `
import { transformAsync } from "@babel/core";
import flowSyntaxPlugin from "@babel/plugin-syntax-flow";
import jsxSyntaxPlugin from "@babel/plugin-syntax-jsx";
import typescriptSyntaxPlugin from "@babel/plugin-syntax-typescript";
import stylexBabelPlugin from "@stylexjs/babel-plugin";
import browserslist from "browserslist";
import fs from "fs/promises";
import { browserslistToTargets, transform } from "lightningcss";
import path from "path";

const IS_DEV_ENV =
  process.env.NODE_ENV === "development" ||
  process.env.BABEL_ENV === "development";

export default function stylexPlugin({
  dev = IS_DEV_ENV,
  unstable_moduleResolution = {
    type: "commonJS",
    rootDir: process.cwd(),
  },
  fileName = "stylex.css",
  babelConfig: { plugins = [], presets = [] } = {},
  importSources = ["stylex", "@stylexjs/stylex"],
  useCSSLayers = false,
  lightningcssOptions,
  ...options
}) {
  let stylexRules = {};
  return {
    name: "rollup-plugin-stylex-playground",
    buildStart() {
      stylexRules = {};
    },
    generateBundle() {
      const rules = Object.values(stylexRules).flat();
      if (rules.length > 0) {
        const collectedCSS = stylexBabelPlugin.processStylexRules(
          rules,
          useCSSLayers
        );
        const { code } = transform({
          targets: browserslistToTargets(browserslist(">= 1%")),
          ...lightningcssOptions,
          filename: fileName,
          code: Buffer.from(collectedCSS),
        });
        const processedCSS = code.toString();
        this.emitFile({
          fileName,
          source: processedCSS,
          type: "asset",
        });
      }
    },
    shouldTransformCachedModule(_ref) {
      let { code: _code, id, meta } = _ref;
      stylexRules[id] = meta.stylex;
      return false;
    },
    async transform(inputCode, id) {
      if (
        !importSources.some((importName) =>
          typeof importName === "string"
            ? inputCode.includes(importName)
            : inputCode.includes(importName.from)
        )
      ) {
        return null;
      }
      const result = await transformAsync(inputCode, {
        babelrc: false,
        filename: id,
        presets,
        plugins: [
          ...plugins,
          /\\.jsx?/.test(path.extname(id))
            ? flowSyntaxPlugin
            : [
                typescriptSyntaxPlugin,
                {
                  isTSX: true,
                },
              ],
          jsxSyntaxPlugin,
          stylexBabelPlugin.withOptions({
            ...options,
            dev,
            unstable_moduleResolution,
          }),
        ],
        caller: {
          name: "@stylexjs/rollup-plugin",
          supportsStaticESM: true,
          supportsDynamicImport: true,
          supportsTopLevelAwait: !inputCode.includes("require("),
          supportsExportNamespaceFrom: true,
        },
      });
      if (result == null) {
        console.warn("stylex: transformAsync returned null");
        return {
          code: inputCode,
        };
      }
      const { code, map, metadata } = result;
      if (code == null) {
        console.warn("stylex: transformAsync returned null code");
        return {
          code: inputCode,
        };
      }
      const self = this;
      if (self.meta.watchMode) {
        const ast = self.parse(code);
        for (const stmt of ast.body) {
          if (stmt.type === "ImportDeclaration") {
            const resolved = await self.resolve(stmt.source.value, id);
            if (resolved && !resolved.external) {
              const result = await self.load(resolved);
              if (result && result.meta && "stylex" in result.meta) {
                stylexRules[resolved.id] = result.meta.stylex;
              }
            }
          }
        }
      }
      let hasData = false;
      if (!dev && metadata.stylex != null && metadata.stylex.length > 0) {
        hasData = true;
        stylexRules[id] = metadata.stylex;
      }

      const srcPath = path.join(unstable_moduleResolution.rootDir, "src");
      const jsPreviewsPath = path.join(
        unstable_moduleResolution.rootDir,
        "previews/js"
      );
      const metadataPreviewsPath = path.join(
        unstable_moduleResolution.rootDir,
        "previews/metadata"
      );

      if (hasData && typeof id === "string" && id.includes(srcPath)) {
        const fileRelativePath = path.relative(srcPath, id);

        const jsOutputPath = path.join(jsPreviewsPath, fileRelativePath);
        const metadataOutputPath = path.join(
          metadataPreviewsPath,
          fileRelativePath + ".json"
        );

        await Promise.all([
          fs.mkdir(path.dirname(jsOutputPath), { recursive: true }),
          fs.mkdir(path.dirname(metadataOutputPath), { recursive: true }),
        ]);
        await Promise.all([
          fs.writeFile(jsOutputPath, code),
          fs.writeFile(metadataOutputPath, formatMetadata(metadata.stylex)),
        ]);
      }

      return {
        code,
        map: map,
        meta: metadata,
      };
    },
  };
}

function formatMetadata(metadata) {
  const rows = metadata
    .map(
      ([id, { ltr }, priority]) =>
        \`  [ \${JSON.stringify(id)}, \${JSON.stringify(ltr)}, \${priority} ]\`
    )
    .join(",\\n");
  return \`[\\n\${rows}\\n]\`;
}
          `,
        },
      },
    },
  },
  'rollup.config.js': {
    file: {
      contents: `
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import livereload from "rollup-plugin-livereload";
import serve from "rollup-plugin-serve";
import styleX from "./build/rollup-stylex-plugin.mjs";

const isDev = process.env.NODE_ENV !== "production";

export default {
  input: "src/main.jsx",
  output: {
    file: "dist/bundle.js",
    format: "umd",
    sourcemap: true,
  },
  plugins: [
    resolve({
      extensions: [".js", ".jsx"],
    }),
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify(
        isDev ? "development" : "production"
      ),
    }),
    commonjs(),
    babel({
      babelrc: false,
      babelHelpers: "bundled",
      extensions: [".js", ".jsx"],
      presets: ["@babel/preset-react"],
    }),
    styleX({
      fileName: "stylex.css",
      useCSSLayers: true,
    }),
    isDev &&
      serve({
        open: true,
        contentBase: ["dist", "public"],
        host: "localhost",
        port: 3000,
      }),
    isDev && livereload("dist"),
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
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "rollup -c -w",
    "build": "rollup -c"
  },
  "dependencies": {
    "@stylexjs/open-props": "^0.9.3",
    "@stylexjs/stylex": "^0.9.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@babel/preset-react": "^7.25.9",
    "@rollup/plugin-babel": "^6.0.4",
    "@rollup/plugin-commonjs": "^25.0.7",
    "@rollup/plugin-node-resolve": "^15.2.3",
    "@rollup/plugin-replace": "^5.0.5",
    "@stylexjs/rollup-plugin": "^0.9.3",
    "globals": "^15.12.0",
    "rollup": "^4.12.0",
    "rollup-plugin-livereload": "^2.0.5",
    "rollup-plugin-postcss": "^4.0.2",
    "rollup-plugin-serve": "^2.0.2"
  }
}
      `,
    },
  },
  src: {
    directory: {
      'main.jsx': {
        file: {
          contents: `
import * as React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
          `,
        },
      },
      'App.jsx': {
        file: {
          contents: `
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { colorsHSL } from "@stylexjs/open-props/lib/colorsHSL.stylex";

export default function App() {
  return (
    <div {...stylex.props(styles.container)}>
      <p>Hello World!</p>
      <p {...stylex.props(styles.code)}>beep boop</p>
    </div>
  );
}

const styles = stylex.create({
  container: {
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    justifyContent: "center",
    minHeight: stylex.firstThatWorks("100dvh", "100vh"),
  },
  code: {
    color: \`hsl(\${colorsHSL.green4})\`,
  },
});
          `,
        },
      },
    },
  },
};
