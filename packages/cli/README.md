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

### CLI Commands

`--input` | `-i`: The input directory to compile with Stylex

`--output` | `-o`: Name of the output directory (Optional) (Default: `src`)

`--watch` | `-w`: Enable automatic recompiling of files on change (Optional)
(Default: `false`)

`--config` | `-c`: Location of a .stylex.json file (Optional) (Default: `null`)

### Config File

You can specify a `.stylex.json` config file and pass it to the CLI.

```json
{
  "input": "./source",
  "output": "./src",
  "cssBundleName": "stylex_bundle.css"
  // mode: 'watch',
}
```
