/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import * as stylex from '@stylexjs/stylex';
import { Check, Clipboard } from 'lucide-react';
import { useRef, useState, useCallback } from 'react';
import { vars } from '@/theming/vars.stylex';

interface ScrollableCodeBlockProps {
  content: string;
  title: string;
  maxHeight?: number;
}

export function ScrollableCodeBlock({
  content,
  title,
  maxHeight = 300,
}: ScrollableCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  return (
    <figure {...stylex.props(styles.figure)}>
      <div {...stylex.props(styles.header)}>
        <figcaption {...stylex.props(styles.title)}>{title}</figcaption>
        <button
          onClick={handleCopy}
          type="button"
          {...stylex.props(
            styles.copyButton,
            copied && styles.copyButtonChecked,
          )}
          aria-label={copied ? 'Copied' : 'Copy to clipboard'}
        >
          {copied ? (
            <Check {...stylex.props(styles.copyIcon)} />
          ) : (
            <Clipboard {...stylex.props(styles.copyIcon)} />
          )}
        </button>
      </div>
      <div {...stylex.props(styles.viewport)} style={{ maxHeight }}>
        <pre ref={codeRef} {...stylex.props(styles.pre)}>
          <code {...stylex.props(styles.code)}>{content}</code>
        </pre>
      </div>
    </figure>
  );
}

const DURATION = '0.15s';

const styles = stylex.create({
  figure: {
    position: 'relative',
    marginTop: 16,
    marginBottom: 16,
    overflow: 'hidden',
    fontSize: 13,
    backgroundColor: vars['--color-fd-card'],
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 12,
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  },
  header: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    height: 38,
    paddingInline: 16,
    color: vars['--color-fd-muted-foreground'],
    borderBottomColor: vars['--color-fd-border'],
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
  },
  title: {
    flexGrow: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
  },
  viewport: {
    paddingBlock: 8,
    overflow: 'auto',
  },
  pre: {
    display: 'flex',
    flexDirection: 'column',
    width: 'max-content',
    minWidth: '100%',
    margin: 0,
    backgroundColor: 'transparent',
  },
  code: {
    paddingBlock: 8,
    paddingInline: 16,
    fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: 13,
    lineHeight: 1.5,
    whiteSpace: 'pre',
  },
  copyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    padding: 0,
    color: {
      default: vars['--color-fd-muted-foreground'],
      ':hover': vars['--color-fd-accent-foreground'],
    },
    cursor: 'pointer',
    backgroundColor: {
      default: 'transparent',
      ':hover': vars['--color-fd-accent'],
    },
    borderWidth: 0,
    borderRadius: 6,
    transitionDuration: DURATION,
    transitionProperty: 'background-color, color',
  },
  copyButtonChecked: {
    color: vars['--color-fd-accent-foreground'],
  },
  copyIcon: {
    width: 14,
    height: 14,
  },
});
