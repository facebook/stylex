'use client';

import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';

export function Copy({ textToCopy }: { textToCopy: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button onClick={handleCopy} {...stylex.props(styles.copyButton)}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

const styles = stylex.create({
  copyButton: {
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(255,255,255,0.1)',
      ':focus-visible': 'rgba(255,255,255,0.1)',
      '@media not (hover: hover)': {
        default: 'rgba(255,255,255,0.1)',
        ':hover': 'rgba(255,255,255,0.3)',
        ':focus-visible': 'rgba(255,255,255,0.3)',
      },
    },
    color: '#ffad48',
    borderWidth: 0,
    borderRadius: 4,
    paddingBlock: 4,
    paddingInline: 12,
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 700,
  },
});
