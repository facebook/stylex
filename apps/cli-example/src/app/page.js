/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import React from 'react';
import * as stylex from '@stylexjs/stylex';
import Card from '../components/Card';
import {
  globalTokens as $,
  spacing,
  text,
  scales,
} from './globalTokens.stylex';
import Counter from './Counter';
import '../stylex_bundle.css';
const HOMEPAGE = 'https://stylexjs.com';
export default function Home() {
  return (
    <main
      {...{
        className:
          'x78zum5 xdt5ytf x6s0dn4 x1qughib xg6iff7 x13xeyr1 xx34p9s x1g5m3n8',
      }}
    >
      <div
        {...{
          className:
            'x1jfb8zj xarpa2k x1h91t0o x1soeqn6 xsql988 xh8yej3 xhtitgo xtpfoyb',
        }}
      >
        <p
          {...{
            className:
              'xjg0vao x1n2onr6 x15f3dyk xo5s888 xu8adaz x1v68ji2 x1ghz6dp xkqrnls x494wpr x1w7k8nm xirgxff x1g5m3n8 x11etd3l x1wd2t2p xmkeg23 x1m60m6i x1y0btm7 xqrouad x1063edl x1twfsck xd22jv x1los6se',
          }}
        >
          Get started by editing&nbsp;
          <code
            {...{
              className: 'x1xlr1w8 xtpfoyb',
            }}
          >
            app/page.tsx
          </code>
        </p>
      </div>
      <div
        {...{
          className: 'x1iyjqo2 x78zum5 xdt5ytf x6s0dn4 xl56j7k x1ncvuvm',
        }}
      >
        <h1
          {...{
            className:
              'xa23tx5 xo5v014 xvcvwp6 xo1l8bm x2b8uid x78zum5 x1t39n6d xuxw1ft x1q0g3np xwlf911',
          }}
        >
          Next.js App Dir
          <span
            {...{
              className:
                'x1n2onr6 x6icuqf x13vifvy x4a57sx xycr77m x1c74tu6 xa4qsjk x1esw782',
            }}
          >
            ♥️
          </span>
          ️StyleX
        </h1>
        <Counter />
      </div>

      <div
        {...{
          className:
            'xrvj5dj xtp8ymz xx3cr9d xtffbmy xb35y45 x193iq5w xl858mc x15hltav',
        }}
      >
        <Card
          body="Learn how to use StyleX to build UIs"
          href={`${HOMEPAGE}/docs/learn/`}
          title="Docs"
        />
        <Card
          body="Browse through the StyleX API reference"
          href={`${HOMEPAGE}/docs/api/`}
          title="API"
        />
        <Card
          body="Play with StyleX and look at the compile outputs"
          href={`${HOMEPAGE}/playground/`}
          title="Playground"
        />
        <Card
          body="Get started with a NextJS+StyleX project"
          href="https://github.com/nmn/nextjs-app-dir-stylex"
          title="Templates"
        />
      </div>
    </main>
  );
}
const MEDIA_MOBILE = '@media (max-width: 700px)';
const MEDIA_TABLET = '@media (min-width: 701px) and (max-width: 1120px)';
const beat = 'x15dho8k-B';
