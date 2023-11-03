import stylex from '@stylexjs/stylex';
import { globalTokens as $, spacing, text } from './globalTokens.stylex';
import '@stylexjs/open-props/lib/colors.stylex';
import { colors } from '@stylexjs/open-props/lib/colors.stylex';

type Props = Readonly<{
  title: string;
  body: string;
  href: string;
}>;

export default function Card({ title, body, href }: Props) {
  return (
    <a
      className={stylex(styles.link)}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <h2 className={stylex(styles.h2)}>
        {title} <span className={stylex(styles.span)}>→</span>
      </h2>
      <p className={stylex(styles.p)}>{body}</p>
    </a>
  );
}

const MOBILE = '@media (max-width: 700px)';
const REDUCE_MOTION = '@media (prefers-reduced-motion: reduce)';

const cardBgTransparent = `rgba(${$.cardR}, ${$.cardG}, ${$.cardB}, 0)`;
const CardBgTranslucent = `rgba(${$.cardR}, ${$.cardG}, ${$.cardB}, 0.1)`;
const cardBorderTransparent = `rgba(${$.cardBorderR}, ${$.cardBorderG}, ${$.cardBorderB}, 0)`;
const cardBorderHover = `rgba(${$.cardBorderR}, ${$.cardBorderG}, ${$.cardBorderB}, 0.1)`;

const styles = stylex.create({
  link: {
    display: {
      default: 'flex',
      [MOBILE]: 'block',
    },
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    borderRadius: spacing.xs,
    backgroundColor: {
      default: cardBgTransparent,
      ':hover': CardBgTranslucent,
    },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: cardBorderTransparent,
      ':hover': cardBorderHover,
    },
    color: 'inherit',
    fontFamily: $.fontSans,
    padding: spacing.sm,
    transitionProperty: 'background-color, border-color',
    transitionDuration: '400ms',
    transform: {
      default: 'translateX(0)',
      ':hover span': 'translateX(4px)',
    },
    textAlign: 'center',
    textDecoration: 'none',
  },
  h2: {
    color: colors.blue3,
    fontSize: text.h4,
    fontWeight: 600,
    marginBottom: {
      default: spacing.xs,
      [MOBILE]: spacing.xxs,
    },
  },
  span: {
    display: 'inline-block',
    transitionProperty: 'transform',
    transitionDuration: {
      default: '200ms',
      [REDUCE_MOTION]: '0s',
    },
  },
  p: {
    margin: 0,
    opacity: 0.6,
    fontSize: text.p,
    textWrap: 'balance',
    lineHeight: 1.5,
    maxWidth: '30ch',
  },
});
