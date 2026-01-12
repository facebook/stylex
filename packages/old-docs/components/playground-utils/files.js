/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

export const files = {
  public: {
    directory: {
      'vite.svg': {
        file: {
          contents: `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true"
role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet"
viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%"
y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%"
stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%"
x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%"
stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs>
<path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862
4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0
2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path>
<path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634
3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361
36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732
3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505
4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>
          `,
        },
      },
    },
  },
  'babel.config.cjs': {
    file: {
      contents: `
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
module.exports = {
  presets: [['@babel/preset-react', { runtime: 'automatic' }]],
  plugins: [
    [
      '@stylexjs/babel-plugin',
      {
        dev: process.env.NODE_ENV === 'development',
        runtimeInjection: false,
        treeshakeCompensation: true,
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir: __dirname,
        },
      },
    ],
  ],
};
      `,
    },
  },
  'index.html': {
    file: {
      contents: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>StyleX Playground</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
      `,
    },
  },
  'postcss.config.cjs': {
    file: {
      contents: `
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

const babelConfig = require('./babel.config.cjs');

module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      include: ['src/**/*.{js,jsx}'],
      useCSSLayers: true,
      babelConfig,
    },
  },
};
      `,
    },
  },
  'vite.config.js': {
    file: {
      contents: `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import babelConfig from './babel.config.cjs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: babelConfig,
    }),
  ],
});
      `,
    },
  },
  'package.json': {
    file: {
      contents: `
{
  "name": "stylex-playground",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@stylexjs/stylex": "^0.10.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@babel/preset-react": "^7.25.9",
    "@stylexjs/postcss-plugin": "^0.10.0",
    "@vitejs/plugin-react": "^4.3.4",
    "postcss": "^8.4.49",
    "vite": "^6.0.1"
  }
}
      `,
    },
  },
  src: {
    directory: {
      'main.jsx': {
        file: {
          contents: `
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
          `,
        },
      },
      'App.jsx': {
        file: {
          contents: `import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import * as stylex from '@stylexjs/stylex';
import StyleXLogo from './StyleXLogo';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a {...stylex.props(styles.link)} href="https://vite.dev" target="_blank">
          <img {...stylex.props(styles.logo)} src={viteLogo} alt="Vite logo" />
        </a>
        <a {...stylex.props(styles.link)} href="https://react.dev" target="_blank">
          <img
            {...stylex.props(styles.logo, styles.logoReact)}
            src={reactLogo}
            alt="React logo"
          />
        </a>
        <a {...stylex.props(styles.link)} href="https://stylexjs.com" target="_blank">
          <StyleXLogo style={styles.logo} />
        </a>
      </div>

      <h1 {...stylex.props(styles.h1)}>Vite + React</h1>
      <div {...stylex.props(styles.card)}>
        <button
          {...stylex.props(styles.button)}
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p {...stylex.props(styles.readDocs)}>
        Click on the Vite, React and StyleX logos to learn more
      </p>
    </>
  );
}

const spin = stylex.keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

const LIGHT_MODE = '@media (prefers-color-scheme: light)';
const MEDIA_ANIMATION = '@media (prefers-reduced-motion: no-preference)';

const styles = stylex.create({
  link: {
    fontWeight: 500,
    color: {
      default: '#646cff',
      ':hover': {
        default: '#535bf2',
        [LIGHT_MODE]: '#747bff',
      },
    },
    textDecoration: 'inherit',
  },
  logo: {
    filter: {
      default: null,
      ':hover': 'drop-shadow(0 0 2em #646cffaa)',
    },
    height: '6em',
    padding: '1.5em',
    transitionProperty: 'filter',
    transitionDuration: '300ms',
    willChange: 'filter',
  },
  logoReact: {
    filter: {
      default: null,
      ':hover': 'drop-shadow(0 0 2em #61dafbaa)',
    },
    animationName: {
      default: null,
      [MEDIA_ANIMATION]: spin,
    },
    animationDuration: {
      default: null,
      [MEDIA_ANIMATION]: '20s',
    },
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
  card: { padding: '2em' },
  readDocs: { color: '#888' },

  h1: {
    fontSize: '3.2rem',
    lineHeight: 1.1,
  },

  button: {
    appearance: 'none',
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'solid',
    borderColor: {
      default: 'transparent',
      ':hover': '#646cff',
    },
    paddingBlock: '0.6em',
    paddingInline: '1.2em',
    fontSize: '1em',
    fontWeight: 500,
    fontFamily: 'inherit',
    backgroundColor: {
      default: '#1a1a1a',
      [LIGHT_MODE]: '#f9f9f9',
    },
    cursor: 'pointer',
    transitionProperty: 'border-color, transform',
    transitionDuration: {
      default: '0.2s',
      ':active': '0.1s',
    },
    outline: {
      default: 'none',
      ':focus-visible': '4px auto -webkit-focus-ring-color',
    },
    transform: {
      default: 'scale(1)',
      '@media (hover: hover)': {
        default: null,
        ':hover': 'scale(1.025)',
        ':active': 'scale(0.99)',
      },
      ':active': 'scale(0.975)',
    },
  },
  stylexLogo: {
    width: 124,
  },
});
          `,
        },
      },
      'index.css': {
        file: {
          contents: `
@layer reset {
  :root {
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;

    color-scheme: light dark;
    color: light-dark(#213547, rgba(255, 255, 255, 0.87));

    background-color: light-dark(#ffffff, #242424);

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }

  body {
    margin: 0;
    display: flex;
    place-items: center;
    min-width: 320px;
    min-height: 100vh;
  }
}

@stylex;
          `,
        },
      },
      'StyleXLogo.jsx': {
        file: {
          contents: `
import * as stylex from '@stylexjs/stylex';

export default function StyleXLogo({ style }) {
  return (
    <svg {...stylex.props(styles.container, style)} viewBox="0 0 686 473">
      <path d="M386.969,309.999L386.969,91.719L371.499,91.72L371.499,309.999L386.969,309.999ZM167.124,
      166.25L167.124,118.594L162.281,118.594L151.813,132.031L151.813,166.25L113.063,166.25L113.063,
      178.75L151.813,178.75L151.813,282.188C151.813,291.771 154.989,299.271 161.343,304.688C167.698,
      310.104 175.614,312.813 185.093,312.813C194.781,312.813 204.677,310.365 214.781,305.469L214.781,
      290.782C204.781,295.469 196.031,297.812 188.531,297.812C178.739,297.812 172.724,295.651 170.484,
      291.329C168.245,287.005 167.125,277.969 167.125,264.219L167.125,178.75L207.437,178.75L207.437,
      166.25L167.124,166.25ZM104.781,192.188L104.781,175.625L104.782,175.624C90.928,167.499 78.115,
      163.437 66.344,163.437C53.428,163.437 42.464,167.265 33.454,174.921C24.443,182.577 19.938,
      191.874 19.938,202.811C19.938,210.52 22.36,217.525 27.202,223.829C32.046,230.13 42.619,
      236.51 58.922,242.969C75.224,249.427 85.224,254.766 88.922,258.984C92.619,263.203 94.468,
      267.812 94.468,272.812C94.468,280.104 91.63,286.094 85.953,290.781C80.276,295.469 73.01,
      297.813 64.156,297.813C51.03,297.813 35.979,293.438 19,284.688L19,299.688C33.27,308.438 47.645,
      312.813 62.125,312.813C75.458,312.813 86.656,308.984 95.718,301.328C104.781,293.672 109.312,
      284.271 109.312,273.125C109.312,264.792 106.812,257.24 101.812,250.468C96.812,243.698 86.161,
      237.188 69.859,230.938C53.557,224.688 43.609,219.505 40.015,215.391C36.421,211.276 34.625,
      206.771 34.625,201.875C34.625,195 37.593,189.219 43.531,184.531C49.468,179.844 56.76,177.5 65.406,
      177.5C77.073,177.5 90.198,182.395 104.781,192.188ZM351.031,166.25L243.531,383.594L227.906,
      383.594L278.063,282.188L217.593,166.25L233.688,166.25L285.875,266.875L335.405,166.25L351.031,
      166.25ZM541.656,232.813L428.374,232.813C428.061,235.313 427.904,237.813 427.904,240.313C427.904,
      256.354 433.634,269.948 445.092,281.093C456.551,292.24 470.092,297.813 485.717,297.813C503.947,
      297.813 521.759,290.677 539.155,276.406L539.155,293.75C522.697,306.458 504.259,312.813 483.842,
      312.813C463.113,312.813 445.978,305.625 432.436,291.25C418.894,276.875 412.124,258.594 412.124,
      236.406C412.124,215.365 418.374,197.943 430.874,184.141C443.374,170.339 459.103,163.438 478.061,
      163.438C495.874,163.438 510.926,169.661 523.217,182.109C535.509,194.557 541.655,211.459 541.655,
      232.812L541.656,232.813ZM523.531,220.469L430.405,220.469C433.218,207.135 438.921,196.797 447.515,
      189.453C456.109,182.109 466.292,178.438 478.062,178.438C502.958,178.438 518.114,192.448 523.531,
      220.469Z" />
      <path d="M633.979,236.609C673.824,156.693 672.091,87.398 630.038,51.253C604.514,28.825 566.763,
      30.104 522.803,46.119L522.321,46.295L522.321,46.335L544.226,41.997L545.158,41.82L547.012,
      41.478L548.852,41.15L549.767,40.993L551.585,40.69C579.365,36.171 602.259,37.656 622.805,
      56.211C658.522,88.466 656.42,151.325 626.353,218.725C628.976,224.651 631.518,230.613 633.979,
      236.609ZM618.4,264.862C616.167,259.311 613.874,253.783 611.523,248.281L611.116,249.015C597.271,
      273.746 579.939,298.564 559.591,322.227C469.721,421.805 382.313,472.127 315.957,412.055L315.432,
      411.507L314.403,410.424L313.9,409.889L312.917,408.832L312.437,408.31L311.5,407.28L310.593,
      406.266L309.717,405.27L308.871,404.291L308.056,403.33L307.271,402.386L306.517,401.46L305.793,
      400.55L305.443,400.102L304.765,399.219C302.888,396.742 301.377,394.473 300.234,392.415C304.293,
      401.389 308.946,408.679 314.194,414.285C367.912,469.247 455.574,450.235 569.192,332.589C588.649,
      309.726 605.044,287.002 618.4,264.862Z" />
      <path d="M645.666,280.419C636.434,248.018 621.054,211.68 598.394,171.922L598.393,171.922C512.155,
      20.619 420.712,0.237 360.285,20.619C352.323,23.305 344.595,29.141 337.143,36.616L336.105,
      37.67C335.932,37.847 335.759,38.025 335.587,38.204L334.554,39.288L334.039,39.837C338.852,
      35.428 344.445,31.868 350.862,29.262C417.683,2.127 506.801,38.4 584.279,182.317C604.452,
      219.789 619.7,253.934 629.856,284.316C633.183,281.522 637.39,279.993 641.734,280C643.056,
      279.999 644.374,280.139 645.666,280.419ZM614.434,442.237C630.83,432.432 635.859,428.238 645.134,
      408.744C656.367,385.132 659.962,352.815 653.161,313.05C649.905,315.615 645.88,317.006 641.735,
      317C640.844,317 639.968,316.938 639.115,316.818C654.724,384.669 639,428.648 589.494,442.237C566.022,
      448.68 522.486,440.263 502.452,433.82L508.428,436.364C548.296,448.045 593.25,454.905 614.434,
      442.237Z" />
      <circle
        cx="296.734"
        cy="381.5"
        r="7.5"
        style={{ fill: 'url(#_Radial1)' }}
      />
      <circle
        cx="641.734"
        cy="298.5"
        r="14.5"
        style={{ fill: 'url(#_Radial2)' }}
      />
      <defs>
        <radialGradient
          id="_Radial1"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(8.37285,0,0,8.37285,298.555,380.1)"
        >
          <stop
            offset="0"
            style={{ stopColor: 'rgb(229,249,255)', stopOpacity: 1 }}
          />
          <stop
            offset="0.22"
            style={{ stopColor: 'rgb(178,238,254)', stopOpacity: 1 }}
          />
          <stop
            offset="0.57"
            style={{ stopColor: 'rgb(94,217,251)', stopOpacity: 1 }}
          />
          <stop
            offset="0.77"
            style={{ stopColor: 'rgb(93,209,241)', stopOpacity: 1 }}
          />
          <stop
            offset="1"
            style={{ stopColor: 'rgb(85,196,227)', stopOpacity: 1 }}
          />
        </radialGradient>
        <radialGradient
          id="_Radial2"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(18.2541,0,0,18.2541,647.407,294.854)"
        >
          <stop
            offset="0"
            style={{ stopColor: 'rgb(252,213,253)', stopOpacity: 1 }}
          />
          <stop
            offset="0.2"
            style={{ stopColor: 'rgb(253,158,255)', stopOpacity: 1 }}
          />
          <stop
            offset="0.51"
            style={{ stopColor: 'rgb(245,59,250)', stopOpacity: 1 }}
          />
          <stop
            offset="0.82"
            style={{ stopColor: 'rgb(226,47,230)', stopOpacity: 1 }}
          />
          <stop
            offset="1"
            style={{ stopColor: 'rgb(207,40,212)', stopOpacity: 1 }}
          />
        </radialGradient>
      </defs>
    </svg>
  );
}

const styles = stylex.create({
  container: {
    fillRule: 'evenodd',
    clipRule: 'evenodd',
    strokeLinejoin: 'round',
    strokeMiterlimit: 2,
    fill: 'light-dark(black, white)',
  },
});
          `,
        },
      },
      assets: {
        directory: {
          'react.svg': {
            file: {
              contents: `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true"
role="img" class="iconify iconify--logos" width="35.93" height="32" preserveAspectRatio="xMidYMid
meet" viewBox="0 0 256 228"><path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0
0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281
2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866
155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995
62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0
113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0
0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567
145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54
18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974
4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Zm-6.365
70.984c-1.4.463-2.836.91-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767
12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606
22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382
15.893c-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06
21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345a134.17 134.17 0 0 1 1.386 6.193ZM87.276
214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0
0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a134.668
134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35
144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322
13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477
32.332c-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0
1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463
19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565
2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0
0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381.151
381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0
0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227
13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0
0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885
8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542
31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117
15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596
22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026a347.403 347.403 0 0 0
7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815a329.4 329.4 0 0 1-23.444.823c-7.967
0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0
1-10.923-20.627a310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1
12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1
12.335 19.695a358.489 358.489 0 0 1 11.036 20.54a329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572
4.944 11.906 24.881 6.52 51.026c-.344 1.668-.73 3.367-1.15
5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0
0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86
22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86Z"></path></svg>
              `,
            },
          },
        },
      },
    },
  },
};
