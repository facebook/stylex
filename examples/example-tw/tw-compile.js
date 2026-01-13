/**
 * Worker script that compiles Tailwind classes
 * Usage: node tw-compile.js '["class1", "class2"]'
 */

(async () => {
  const fs = require('fs');
  const classesJson = process.argv[2];

  if (!classesJson) {
    console.error('Usage: node tw-compile.js \'["class1", "class2"]\'');
    process.exit(1);
  }

  try {
    const { compile } = await import('tailwindcss');
    const themePath = require.resolve('tailwind-to-stylex/theme.css');
    let theme = fs.readFileSync(themePath, 'utf-8');
    
    // Fix Tailwind v4 compatibility: --font-size-* should be --text-* for text-lg/xl/etc utilities
    theme = theme.replace(/--font-size-([^:]+):/g, '--text-$1:');
    
    const { build } = await compile(`${theme}\n\n@tailwind utilities;`);

    const candidates = JSON.parse(classesJson);
    const result = build(candidates);
    process.stdout.write(result);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
