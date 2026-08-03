/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export async function copyText(text: string): Promise<boolean> {
  try {
    const clipboard = navigator.clipboard;
    const writeText = (clipboard as any)?.writeText;
    if (clipboard != null && typeof writeText === 'function') {
      await writeText.call(clipboard, text);
      return true;
    }
  } catch {}

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    const body = document.body;
    if (body == null) return false;
    body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}
