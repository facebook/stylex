/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import './root.css';
import * as stylex from '@stylexjs/stylex';
import { DevStyleXInject } from './DevStyleXInject';

const styles = stylex.create({
  html: {
    backgroundColor: '#f4eedf',
  },
  body: {
    margin: 0,
  },
});

export const Document: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <html {...stylex.props(styles.html)} lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <title>@redwoodjs/starter-stylex</title>
      {/* Optional: load display fonts used in the welcome page */}
      <link
        crossOrigin="anonymous"
        href="https://fonts.googleapis.com"
        rel="preconnect"
      />
      <link
        crossOrigin="anonymous"
        href="https://fonts.gstatic.com"
        rel="preconnect"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&family=Playfair+Display:wght@700&display=block"
        rel="stylesheet"
      />
      <DevStyleXInject cssHref="/client/assets/stylex.css" />
      <link href="/src/client.tsx" rel="modulepreload" />
    </head>
    <body {...stylex.props(styles.body)}>
      <div id="root">{children}</div>
      <script>import("/src/client.tsx")</script>
    </body>
  </html>
);
