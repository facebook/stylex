import * as stylex from '@stylexjs/stylex';

export const vars = stylex.defineVars({
  '--color-fd-background': null,
  '--color-fd-foreground': null,
  '--color-fd-muted': null,
  '--color-fd-muted-foreground': null,
  '--color-fd-popover': null,
  '--color-fd-popover-foreground': null,
  '--color-fd-card': null,
  '--color-fd-card-foreground': null,
  '--color-fd-border': null,
  '--color-fd-primary': null,
  '--color-fd-primary-foreground': null,
  '--color-fd-secondary': null,
  '--color-fd-secondary-foreground': null,
  '--color-fd-accent': null,
  '--color-fd-accent-foreground': null,
  '--color-fd-ring': null,
});

export const legacyColors = stylex.defineVars({
  '--bg1': 'hsl(249, 30%, 3%)',
  '--bg1-alpha50': 'hsla(249, 30%, 3%, 0.5)',
  '--bg1-alpha75': 'hsla(249, 30%, 3%, 0.75)',
  '--bg2': 'hsl(249, 35%, 16%)',
  '--code-bg': '#000000',

  '--fg1': 'hsl(0, 0%, 100%)',
  '--fg2': 'hsl(0, 0%, 60%)',

  '--link': 'hsl(202, 100%, 57%)',
  '--cyan': 'hsl(249, 70%, 57%)',
  '--cyan-h': '249',
  '--cyan-s': '70%',
  '--cyan-l': '57%',
  '--pink': 'hsl(295, 62%, 66%)',
  '--pink-h': '295',
  '--pink-s': '62%',
  '--pink-l': '66%',

  '--purple-navy': '#575176',
  '--black-coffee': '#363033',
});
