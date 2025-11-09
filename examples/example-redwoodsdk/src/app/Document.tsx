import './root.css';
import * as stylex from '@stylexjs/stylex';

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
        href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&family=Playfair+Display:wght@700&display=swap"
        rel="stylesheet"
      />
      {/* Dev: request StyleX aggregated CSS from the dev endpoint */}
      {import.meta.env.DEV ? (
        <link rel="stylesheet" href="/virtual:stylex.css" />
      ) : null}
      {import.meta.env.PROD ? (
        <link rel="stylesheet" href="/client/assets/stylex.css" />
      ) : null}
      <link rel="modulepreload" href="/src/client.tsx" />
    </head>
    <body {...stylex.props(styles.body)}>
      <div id="root">{children}</div>
      <script>import("/src/client.tsx")</script>
    </body>
  </html>
);
