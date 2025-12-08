/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import * as stylex from '@stylexjs/stylex';
import { useEffect, useState } from 'react';

const words = [
  'expressive',
  'type-safe',
  'composable',
  'predictable',
  'themeable',
];

export default function TypingWord() {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[index] ?? '';

    if (!isDeleting && displayed === word) {
      // Pause before deleting
      const timeout = setTimeout(() => setIsDeleting(true), 5000);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayed === '') {
      // Move to next word
      setIsDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return;
    }

    const timeout = setTimeout(
      () => {
        setDisplayed(
          isDeleting
            ? word.slice(0, displayed.length - 1)
            : word.slice(0, displayed.length + 1),
        );
      },
      isDeleting ? 50 : 100,
    );

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, index]);

  return <span {...stylex.props(styles.typingWord)}>{displayed}</span>;
}

const styles = stylex.create({
  typingWord: {
    color: 'var(--color-fd-primary)',
    fontWeight: 600,
  },
});
