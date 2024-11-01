/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

export const files = {
  'generateCSS.js': {
    file: {
      contents: `
const fs = require("fs/promises");
const { transformAsync } = require("@babel/core");
const stylexBabelPlugin = require("@stylexjs/babel-plugin");
const flowSyntaxPlugin = require("@babel/plugin-syntax-flow");
const jsxSyntaxPlugin = require("@babel/plugin-syntax-jsx");
const path = require("path");
const { mkdirp } = require("mkdirp");

async function transformFile(filePath) {
  const code = await fs.readFile(filePath, "utf8");
  const result = await transformAsync(code, {
    filename: filePath,
    plugins: [
      flowSyntaxPlugin,
      jsxSyntaxPlugin,
      [
        stylexBabelPlugin,
        {
          dev: false,
          test: false,
          stylexSheetName: "<>",
          genConditionalClasses: true,
          unstable_moduleResolution: {
            type: "commonJS",
            rootDir: path.join(__dirname),
          },
        },
      ],
    ],
    sourceType: "unambiguous",
    babelrc: false,
  });
  return result.metadata.stylex;
}

async function getAllFilesOfType(folder, type) {
  const contents = await fs.readdir(folder, { withFileTypes: true });

  const files = await Promise.all(
    contents.map(async (dirent) => {
      const subPath = path.join(folder, dirent.name);
      if (dirent.isDirectory()) {
        return await getAllFilesOfType(subPath, type);
      }
      if (dirent.name.endsWith(type)) {
        return subPath;
      }
      return null;
    })
  );

  return files.flat().filter(Boolean);
}

async function genSheet() {
  const src = await getAllFilesOfType(path.join(__dirname, "src"), ".jsx");
  const ruleSets = await Promise.all(src.map(transformFile));
  const generatedCSS = stylexBabelPlugin.processStylexRules(ruleSets.flat());
  const outputDir = path.join(__dirname, "src");
  const cssPath = path.join(outputDir, "stylex.css");

  await mkdirp(outputDir);
  await fs.writeFile(cssPath, generatedCSS);

  console.log("Successfully generated CSS.");
}

genSheet();
      `,
    },
  },
  'index.html': {
    file: {
      contents: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stylex Playground</title>
  </head>
  <body>
    <h1 style="color: blue">Loaded HTML from webcontainer!</h1>
    <div id="root"></div>
    <script type="module" src="./src/main.jsx"></script>
  </body>
</html>
      `,
    },
  },
  'vite.config.js': {
    file: {
      contents: `
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react({
      babel: {
        presets: ["@babel/preset-react"],
        plugins: ["@stylexjs/babel-plugin"],
      },
    }),
  ],
  server: {
    port: 3111,
  },
});
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
    "start": "node generateCSS.js && vite dev"
  },
  "dependencies": {
    "@babel/cli": "latest",
    "@babel/core": "latest",
    "@babel/plugin-syntax-flow": "latest",
    "@babel/plugin-syntax-jsx": "latest",
    "@babel/plugin-syntax-typescript": "latest",
    "@babel/preset-env": "^7.23.5",
    "@babel/preset-react": "^7.23.3",
    "@stylexjs/babel-plugin": "^0.8.0",
    "@stylexjs/stylex": "^0.8.0",
    "babel-plugin-transform-node-env-inline": "^0.4.3",
    "react": "*",
    "react-dom": "*",
    "vite": "^5.4.10",
    "@vitejs/plugin-react": "^4.3.3",
    "mkdirp": "^3.0.1"
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
import { createRoot } from "react-dom/client";
import Card from "./app.jsx";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Card em={true}>Hello World!</Card>);
          `,
        },
      },
      'app.jsx': {
        file: {
          contents: `
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import "./stylex.css";

export default function Card({ children, em = false, props }) {
  return (
    <div {...props} {...stylex.props(styles.base, em && styles.emphasise)}>
      {children}
    </div>
  );
}

const styles = stylex.create({
  base: {
    appearance: "none",
    backgroundColor: "blue",
    borderRadius: 4,
    borderStyle: "none",
    boxSize: "border-box",
    color: "white",
    marginInline: "auto",
    paddingBlock: 4,
    paddingInline: 8,
    width: "95%",
  },
  emphasise: {
    transform: "rotate(-2deg)",
  },
});
`,
        },
      },
    },
  },
};
