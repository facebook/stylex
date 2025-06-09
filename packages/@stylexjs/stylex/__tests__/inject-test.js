/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import inject from '../src/inject';

describe('inject', () => {
  test('@keyframes', () => {
    const cssText =
      '@keyframes name { from: { color: red }, to: { color: blue } }';
    expect(inject(cssText, 10)).toMatchInlineSnapshot(
      '"@keyframes name { from: { color: red }, to: { color: blue } }"',
    );
  });

  test('@positionTry', () => {
    const cssText =
      '@position-try --name { top: anchor(bottom); left: anchor(left); }';
    expect(inject(cssText, 10)).toMatchInlineSnapshot(
      '"@position-try --name { top: anchor(bottom); left: anchor(left); }"',
    );
  });

  test('::view-transition', () => {
    const cssText =
      '::view-transition-group(*.name){transition-property:none;}::view-transition-image-pair(*.name){border-radius:16px;}::view-transition-old(*.name){animation-duration:.5s;}::view-transition-new(*.name){animation-timing-function:ease-out;}';
    expect(inject(cssText, 10)).toMatchInlineSnapshot(
      '"::view-transition-group(*.name){transition-property:none;}::view-transition-image-pair(*.name){border-radius:16px;}::view-transition-old(*.name){animation-duration:.5s;}::view-transition-new(*.name){animation-timing-function:ease-out;}"',
    );
  });

  test('@media', () => {
    const cssText = '@media (min-width: 320px) { .color { color: red } }';
    expect(inject(cssText, 200)).toMatchInlineSnapshot(
      '"@media (min-width: 320px) { .color { color: red } }"',
    );
  });

  test('::before', () => {
    const cssText = '.color::before { color: red }';
    expect(inject(cssText, 5000)).toMatchInlineSnapshot(
      '".color:not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#)::before { color: red }"',
    );
  });

  test(':hover', () => {
    const cssText = '.color:hover { color: red }';
    expect(inject(cssText, 130)).toMatchInlineSnapshot(
      '".color:hover { color: red }"',
    );
  });

  test('::before:hover', () => {
    const cssText = '.color::before:hover { color: red }';
    expect(inject(cssText, 5000)).toMatchInlineSnapshot(
      '".color:not(#\\#):not(#\\#):not(#\\#):not(#\\#):not(#\\#)::before:hover { color: red }"',
    );
  });
});
