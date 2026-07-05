/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { StylexDebugData } from '../../types.js';
import { exportMetadata } from '../../utils/exportMetadata.js';
import { Button } from './Button';

declare const navigator: any;
declare const document: any;

// Clipboard access can be flaky inside a DevTools panel context, so fall back
// to a hidden-textarea + execCommand copy when the async clipboard API is
// unavailable or rejects (e.g. the panel is not focused).
async function copyText(text: string): Promise<boolean> {
  try {
    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the execCommand path
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function CopyMetadataButton({
  data,
}: {
  data: StylexDebugData,
}): React.Node {
  const [label, setLabel] = useState('Copy metadata');
  const timeoutRef = useRef<?TimeoutID>(null);

  // The panel re-mounts on refresh (its `key` changes), so clear any pending
  // label-reset timeout on unmount to avoid a state update after unmount.
  useEffect(
    () => () => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const handleClick = useCallback(async () => {
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
    }
    const ok = await copyText(exportMetadata(data));
    setLabel(ok ? 'Copied!' : 'Copy failed');
    timeoutRef.current = setTimeout(() => {
      setLabel('Copy metadata');
      timeoutRef.current = null;
    }, 1500);
  }, [data]);

  return (
    <Button
      onClick={handleClick}
      title="Copy this element's StyleX metadata as markdown"
    >
      {label}
    </Button>
  );
}
