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
    backgroundColor: 'transparent',
    color: '#ffad48',
    borderWidth: 0,
    borderRadius: 4,
    paddingBlock: 4,
    paddingInline: 12,
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 700,
    ':hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
  },
});
