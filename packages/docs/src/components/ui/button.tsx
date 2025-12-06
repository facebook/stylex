import * as stylex from '@stylexjs/stylex';

export const buttonStyles = stylex.create({
  base: {
    // 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring'
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 8,
    fontSize: `${14 / 16}rem`,
    fontWeight: 500,
    transitionProperty:
      'color, background-color, border-color, text-decoration-color',
    transitionDuration: '0.1s',
    transitionTimingFunction: 'ease-in-out',
    pointerEvents: {
      default: null,
      ':disabled': 'none',
    },
    opacity: {
      default: null,
      ':disabled': 0.5,
    },
    outline: 'none',
    boxShadow: {
      default: 'none',
      ':focus-visible': '0 0 0 2px var(--color-fd-ring)',
    },
  },
});

export const buttonVariantStyles = stylex.create({
  primary: {
    backgroundColor: {
      default: 'var(--color-fd-primary)',
      ':hover': `color-mix(in srgb, var(--color-fd-primary) 80%, transparent)`,
    },
    color: 'var(--color-fd-primary-foreground)',
  },
  outline: {
    backgroundColor: {
      default: 'transparent',
      ':hover': `var(--color-fd-accent)`,
    },
    color: {
      default: null,
      ':hover': 'var(--color-fd-accent-foreground)',
    },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-fd-accent)',
  },
  ghost: {
    backgroundColor: {
      default: null,
      ':hover': `var(--color-fd-accent)`,
    },
    color: {
      default: null,
      ':hover': 'var(--color-fd-accent-foreground)',
    },
  },
  secondary: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-fd-accent)',
    backgroundColor: {
      default: 'var(--color-fd-secondary)',
      ':hover': 'var(--color-fd-accent)',
    },
    color: {
      default: 'var(--color-fd-secondary-foreground)',
      ':hover': 'var(--color-fd-accent-foreground)',
    },
  },
});

export const buttonSizeVariants = stylex.create({
  sm: {
    gap: 4,
    paddingInline: 8,
    paddingBlock: 6,
    fontSize: `${12 / 16}rem`,
    lineHeight: 1.4,
  },
  icon: {
    padding: 12,
    '--svg-size': '20px',
  },
  'icon-sm': {
    padding: 6,
    '--svg-size': '18px',
  },
  'icon-xs': {
    padding: 4,
    '--svg-size': '16px',
  },
});

export type ButtonProps = {
  color?: keyof typeof buttonVariantStyles | null | undefined;
  variant?: keyof typeof buttonVariantStyles | null | undefined;
  size?: keyof typeof buttonSizeVariants | null | undefined;
};
