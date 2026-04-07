/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Cross-file demo: imports nested tokens from tokens.stylex.ts and
 * uses them in a separate stylex.create() call. This exercises the
 * cross-file resolution path for unstable_defineVarsNested.
 */

import * as stylex from '@stylexjs/stylex';
import { tokens, consts } from './tokens.stylex';

const DARK = '@media (prefers-color-scheme: dark)';

const s = stylex.create({
  section: {
    width: '100%',
    maxWidth: 640,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  heading: {
    fontSize: '1rem',
    fontWeight: 600,
    fontFamily: consts.font.sans,
    color: tokens.accent.base,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  headingIcon: {
    fontSize: '1.25rem',
  },
  description: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
    fontFamily: consts.font.sans,
    color: tokens.text.secondary,
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem',
  },
  card: {
    padding: '1rem',
    borderRadius: consts.radius.md,
    backgroundColor: tokens.surface.card,
    boxShadow: tokens.surface.cardShadow,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  cardTitle: {
    margin: 0,
    fontSize: '0.8rem',
    fontWeight: 600,
    fontFamily: consts.font.sans,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: tokens.text.muted,
  },
  swatchRow: {
    display: 'flex',
    gap: '0.375rem',
    flexWrap: 'wrap',
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: consts.radius.pill,
    borderWidth: 2,
    borderStyle: 'solid',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: '200ms',
    transform: {
      default: null,
      ':hover': 'scale(1.15)',
    },
    boxShadow: {
      default: 'none',
      ':hover': '0 2px 8px rgba(0,0,0,0.15)',
    },
  },
  infoSwatch: {
    backgroundColor: tokens.badge.info.bg,
    borderColor: tokens.badge.info.border,
  },
  successSwatch: {
    backgroundColor: tokens.badge.success.bg,
    borderColor: tokens.badge.success.border,
  },
  warningSwatch: {
    backgroundColor: tokens.badge.warning.bg,
    borderColor: tokens.badge.warning.border,
  },
  errorSwatch: {
    backgroundColor: tokens.badge.error.bg,
    borderColor: tokens.badge.error.border,
  },
  tokenList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  tokenRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    fontFamily: consts.font.mono,
    color: tokens.text.secondary,
  },
  tokenDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    flexShrink: 0,
  },
  accentDot: {
    backgroundColor: tokens.accent.base,
  },
  surfaceDot: {
    backgroundColor: tokens.surface.card,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.surface.divider,
  },
  hoverDot: {
    backgroundColor: tokens.surface.hover,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.surface.divider,
  },
  code: {
    fontFamily: consts.font.mono,
    fontSize: '0.8em',
    backgroundColor: {
      default: 'rgba(0,0,0,0.04)',
      [DARK]: 'rgba(255,255,255,0.08)',
    },
    paddingInline: '0.35em',
    paddingBlock: '0.15em',
    borderRadius: '4px',
  },
  footer: {
    fontSize: '0.75rem',
    color: tokens.text.muted,
    fontFamily: consts.font.sans,
    margin: 0,
    textAlign: 'center',
  },
});

export default function CrossFileSection() {
  return (
    <section {...stylex.props(s.section)}>
      <p {...stylex.props(s.description)}>
        Cross-file imports: You can define your nested tokens in{' '}
        <code {...stylex.props(s.code)}>tokens.stylex.ts</code> and import{' '}
        <code {...stylex.props(s.code)}>tokens</code> /{' '}
        <code {...stylex.props(s.code)}>consts</code> into any other file. The
        nested member expressions like{' '}
        <code {...stylex.props(s.code)}>tokens.badge.info.bg</code> resolve
        across file boundaries.
      </p>
      <div {...stylex.props(s.grid)}>
        <div {...stylex.props(s.card)}>
          <p {...stylex.props(s.cardTitle)}>Badge swatches</p>
          <div {...stylex.props(s.swatchRow)}>
            <div {...stylex.props(s.swatch, s.infoSwatch)} title="info" />
            <div {...stylex.props(s.swatch, s.successSwatch)} title="success" />
            <div {...stylex.props(s.swatch, s.warningSwatch)} title="warning" />
            <div {...stylex.props(s.swatch, s.errorSwatch)} title="error" />
          </div>
          <p {...stylex.props(s.footer)}>
            <code {...stylex.props(s.code)}>tokens.badge.*.bg</code>
          </p>
        </div>
        <div {...stylex.props(s.card)}>
          <p {...stylex.props(s.cardTitle)}>Resolved tokens</p>
          <div {...stylex.props(s.tokenList)}>
            <div {...stylex.props(s.tokenRow)}>
              <span {...stylex.props(s.tokenDot, s.accentDot)} />
              accent.base
            </div>
            <div {...stylex.props(s.tokenRow)}>
              <span {...stylex.props(s.tokenDot, s.surfaceDot)} />
              surface.card
            </div>
            <div {...stylex.props(s.tokenRow)}>
              <span {...stylex.props(s.tokenDot, s.hoverDot)} />
              surface.hover
            </div>
          </div>
          <p {...stylex.props(s.footer)}>
            <code {...stylex.props(s.code)}>tokens.surface.*</code>
          </p>
        </div>
      </div>
    </section>
  );
}
