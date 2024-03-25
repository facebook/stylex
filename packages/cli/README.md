# @stylexjs/cli

A Command Line Interface (CLI) to pre-compile StyleX usage in a folder of files
and generate folder of files with a separate CSS file that can then be bundled
with exotic setups.

## Installation

Simply install the CLI to start using it

```sh
npm install --save-dev @stylexjs/cli
```

### Basic Usage

```sh
stylex -i [input_directory] -o [output_directory]
```

### CLI Options

#### `--input`

The input directory to compile with Stylex `[string] [Required]`

alias: `-i`

type: `string`

required: `true`

#### `--output`

Name of the StyleX output directory

alias: `-o`

type: `string`

required: `true`

#### `--watch`

Flag to enable automatic recompiling of files in the input directory on change

alias: `-w`

type: `boolean`

required: `false`

default: `false`

#### `--config`

path of a .json (or .json5) config file

default: `null`

### Config Structure

You can create a `.json` or `.json5` config file and pass it to the CLI.

```json
{
  "input": "./source",
  "output": "./src",
  "cssBundleName": "stylex_bundle.css"
  // watch: true
}
```
