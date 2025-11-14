/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'StyleX',
  tagline: 'Super fast atomic styles, no thought required.',
  url: 'https://stylexjs.com',
  baseUrl: '/',
  trailingSlash: true,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.svg',

  // GitHub pages deployment config.
  organizationName: 'facebook',
  projectName: 'stylex',

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/facebook/stylex/tree/main/packages/docs/',
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/facebook/stylex/tree/main/packages/docs/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    {
      colorMode: {
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      prism: {
        theme: require('prism-react-renderer/themes/dracula'),
      },
      algolia: {
        // The application ID provided by Algolia
        // eslint-disable-next-line no-useless-concat
        appId: '94L' + 'A' + 'F81A4P',

        // Public API key: it is safe to commit it
        apiKey: 'd7b1348f1d8a68c1c5a868c54536759c',

        indexName: 'stylexjs',

        // Optional: see doc section below
        // contextualSearch: true,

        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        // externalUrlRegex: 'external\\.com|domain\\.com',

        // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
        // replaceSearchResultPathname: {
        //   from: '/docs/', // or as RegExp: /\/docs\//
        //   to: '/',
        // },

        // Optional: Algolia search parameters
        // searchParameters: {},

        // Optional: path for search page that enabled by default (`false` to disable it)
        // searchPagePath: 'search',

        // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
        // insights: false,

        //... other Algolia params
      },
      navbar: {
        title: '',
        logo: {
          alt: 'StyleX Project Logo',
          src: 'img/stylex-logo-small.svg',
          srcDark: 'img/stylex-logo-small-dark.svg',
        },
        items: [
          {
            label: 'Learn',
            to: '/docs/learn',
            position: 'left',
          },
          {
            label: 'API',
            to: '/docs/api',
            position: 'left',
          },
          {
            label: 'Playground',
            to: '/playground',
            position: 'left',
          },
          {
            label: 'Blog',
            to: '/blog',
            position: 'right',
          },
          {
            'aria-label': 'GitHub',
            className: 'navbar-github-link',
            href: 'https://github.com/facebook/stylex',
            position: 'right',
          },
        ],
      },
      footer: {
        links: [
          {
            title: 'Develop',
            items: [
              {
                label: 'Learn',
                to: '/docs/learn',
              },
              {
                label: 'API',
                to: '/docs/api',
              },
            ],
          },
          {
            title: 'Explore',
            items: [
              {
                label: 'Playground',
                to: '/playground',
              },
              {
                label: 'Blog',
                href: '/blog',
              },
            ],
          },
          {
            title: 'Participate',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/stylex/',
              },
              {
                label: 'Acknowledgements',
                href: '/docs/learn/acknowledgements',
              },
            ],
          },
          {
            title: 'Other',
            items: [
              // Please do not remove the privacy and terms, it's a legal requirement.
              {
                label: 'Privacy',
                href: 'https://opensource.fb.com/legal/privacy/',
              },
              {
                label: 'Terms',
                href: 'https://opensource.fb.com/legal/terms/',
              },
            ],
          },
        ],
        logo: {
          alt: 'Meta Open Source Logo',
          // This default includes a positive & negative version, allowing for
          // appropriate use depending on your site's style.
          src: '/img/meta_opensource_logo.svg',
          srcDark: '/img/meta_opensource_logo_negative.svg',
          href: 'https://opensource.fb.com',
        },
        // Please do not remove the credits, help to publicize Docusaurus :)
        copyright: `Copyright © ${new Date().getFullYear()} Meta Platforms, Inc. Built with Docusaurus.`,
      },
      metadata: [
        { name: 'og:title', content: 'StyleX' },
        {
          name: 'og:description',
          content: 'The styling system that powers Meta.',
        },
        {
          name: 'og:image',
          content: 'https://stylexjs.com/img/stylex-cover-photo.png',
        },
      ],
    },
};

module.exports = config;
