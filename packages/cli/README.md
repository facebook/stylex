# @stylexjs/cli

A Command Line Interface (CLI) to pre-compile StyleX usage in a folder of files
and generate folder of files with a separate CSS file that can then be bundled
with exotic setups.

## Installation

```sh
npm install --save-dev @stylexjs/cli
```

## Basic Usage

```sh
 stylex -i [input directory] -o [output directory]
```

## Configuration Options

You can create a `.json` or `.json5` config file and pass it to the CLI via the
`--config` flag.

```json
{
  "input": ["./source"],
  "output": ["./src"],
  "cssBundleName": "stylex_bundle.css",
  "babelPresets": [
    ["@babel/preset-typescript", { "allExtensions": true, "isTSX": true }],
    "@babel/preset-react"
  ],
  "modules_EXPERIMENTAL": [["@stylexjs/open-props", { "ignore": ["src"] }]],
  "watch": "true"
}
```

## CLI Flags

---

#### `--input`

The input directories to compile with StyleX

alias: `-i`

type: `array`

required: `true`

---

#### `--output`

Name of the StyleX output directories. The order of the output directories
should match the order of the input directories.

alias: `-o`

type: `array`

required: `true`

---

#### `--styleXBundleName`

The name of the compiled css file StyleX generates

alias: `-b`

type: `string`

required: `false`

default: `stylex_bundle.css`

---

#### `--watch`

Flag to enable automatic recompiling of files in the input directory on change.
Currently only supports usage with a single input/output directory

alias: `-w`

type: `boolean`

required: `false`

default: `false`

---

#### `--modules_EXPERIMENTAL`

A list of node modules to also compile with StyleX. Used to include compiling
dependencies that contain `.stylex.js` files. Has optional "ignore"
functionality that allows ignoring specific directories in the compiled output
module.

alias: `-m`

type: `array`

required: `false`

default: `[]`

example: `[['@stylexjs/open-props', { ignore: ['src'] }]]`

---

#### `--config`

path of a .json (or .json5) config file
