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
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>@redwoodjs/starter-stylex</title>
      {/* Optional: load display fonts used in the welcome page */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
        crossOrigin="anonymous"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&family=Playfair+Display:wght@700&display=block"
        rel="stylesheet"
      />
      <DevStyleXInject cssHref="/client/assets/stylex.css" />
      <link rel="modulepreload" href="/src/client.tsx" />
    </head>
    <body {...stylex.props(styles.body)}>
      <div id="root">{children}</div>
      <script>import("/src/client.tsx")</script>
    </body>
  </html>
);
