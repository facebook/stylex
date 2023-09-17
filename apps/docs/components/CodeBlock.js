/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import React from 'react';
import stylex from '@stylexjs/stylex';
import {PrismLight as SyntaxHighlighter} from 'react-syntax-highlighter';
import {useColorMode} from '@docusaurus/theme-common';
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import themeLight from 'react-syntax-highlighter/dist/cjs/styles/prism/material-light';
import themeDark from 'react-syntax-highlighter/dist/cjs/styles/prism/material-dark';

SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('bash', bash);

function tweakStyle(theme) {
  return Object.fromEntries(
    Object.entries(theme).map(([key, value]) => [
      key,
      Object.fromEntries(
        Object.entries(value).map(([k, v]) => {
          if (k === 'background') {
            return [k, 'transparent'];
          }
          if (k === 'margin') {
            return [k, '0'];
          }
          if (k === 'padding') {
            return [k, '1.25em 1em 0'];
          }
          return [k, v];
        }),
      ),
    ]),
  );
}

function tweakStyleH(theme) {
  return Object.fromEntries(
    Object.entries(theme).map(([key, value]) => [
      key,
      Object.fromEntries(
        Object.entries(value).map(([k, v]) => {
          if (k === 'background') {
            return [k, 'var(--bg2)'];
          }
          if (k === 'margin') {
            return [k, '0'];
          }
          if (k === 'padding') {
            return [k, '1.25em 1em'];
          }
          return [k, v];
        }),
      ),
    ]),
  );
}

const lightTheme = tweakStyle(themeLight);
const darkTheme = tweakStyle(themeDark);

const lightThemeH = tweakStyleH(themeLight);
const darkThemeH = tweakStyleH(themeDark);

export default function CodeBlock({
  children,
  xstyle,
  language = 'tsx',
  highlight = false,
}) {
  const {isDarkTheme} = useColorMode();
  const finalTheme = highlight
    ? isDarkTheme
      ? darkThemeH
      : lightThemeH
    : isDarkTheme
    ? darkTheme
    : lightTheme;
  return (
    <SyntaxHighlighter
      className={stylex(xstyle)}
      language={language}
      style={finalTheme}>
      {children}
    </SyntaxHighlighter>
  );
}

/**
a11y-dark - OK (background is lightish grey, good for both light and dark mode.)
atom-dark - Quite good, but background has a greenish hue compared to website colors
base16-ateliersulphurpool.light - OK for light mode.
coldark-cold - OK for light mode.
coldark-dark - Kinda Good
duotone-dark - Kinda Good
funky - Interesting - No BG
hopscotch - Too brown
material-dark - Good except for the background
material-light - Good for light mode
material-oceanic - Same as dark, but bg is still bad
nord - Quite Good BG, but bad syntax coloring
okaidia - Decently Good, except for the background
synthwave84 - Viable as is. Looks Neon
vs-dark - Almost Viable as is, but the background is too grey.
vs -
vsc-dark-plus -
*/
