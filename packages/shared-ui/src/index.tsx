import * as stylex from '@stylexjs/stylex';
import { tokens } from './tokens.stylex';

const styles = stylex.create({
  button: {
    backgroundColor: {
      default: tokens.primaryColor,
      ':hover': tokens.secondaryColor,
    },
    color: 'white',
    padding: tokens.padding,
    borderStyle: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
});

export function Button({
  children,
  onClick,
  xstyle,
}: {
  children: any;
  onClick?: () => void;
  xstyle?: stylex.StyleXStyles;
}) {
  return (
    <button {...stylex.props(styles.button, xstyle)} onClick={onClick}>
      {children}
    </button>
  );
}
