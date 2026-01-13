/**
 * Worker script that compiles Tailwind classes synchronously via stdin/stdout
 */

const fs = require('fs');
const readline = require('readline');

async function main() {
  const { compile } = await import('tailwindcss');
  const themePath = require.resolve('tailwind-to-stylex/theme.css');
  let theme = fs.readFileSync(themePath, 'utf-8');
  
  // Fix Tailwind v4 compatibility: --font-size-* should be --text-* for text-lg/xl/etc utilities
  theme = theme.replace(/--font-size-([^:]+):/g, '--text-$1:');

  const { build } = await compile(`${theme}\n\n@tailwind utilities;`);

  // Signal that we're ready
  console.log('READY');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  for await (const line of rl) {
    if (line === 'EXIT') {
      process.exit(0);
    }
    try {
      const classes = line.split(' ').filter(Boolean);
      const css = build(classes);
      // Output as single line JSON
      console.log(JSON.stringify({ css }));
    } catch (e) {
      console.log(JSON.stringify({ error: e.message }));
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
