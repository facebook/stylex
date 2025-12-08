/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

function ExternalLinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function BlueskyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
    </svg>
  );
}

const footerLinks = {
  develop: [
    { label: 'Learn', href: '/docs/learn' },
    { label: 'API', href: '/docs/api' },
  ],
  explore: [
    { label: 'Playground', href: '/playground' },
    { label: 'Blog', href: '/blog' },
  ],
  participate: [
    {
      label: 'GitHub',
      href: 'https://github.com/facebook/stylex',
      external: true,
    },
    { label: 'Acknowledgements', href: '/docs/learn/acknowledgements' },
  ],
  legal: [
    {
      label: 'Privacy',
      href: 'https://opensource.fb.com/legal/privacy/',
      external: true,
    },
    {
      label: 'Terms',
      href: 'https://opensource.fb.com/legal/terms/',
      external: true,
    },
  ],
};

export default function Footer() {
  return (
    <footer {...stylex.props(styles.footer)}>
      <div {...stylex.props(styles.container)}>
        <div {...stylex.props(styles.grid)}>
          <div>
            <h4 {...stylex.props(styles.heading)}>Develop</h4>
            <ul {...stylex.props(styles.list)}>
              {footerLinks.develop.map((link) => (
                <li key={link.label}>
                  <a href={link.href} {...stylex.props(styles.link)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 {...stylex.props(styles.heading)}>Explore</h4>
            <ul {...stylex.props(styles.list)}>
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <a href={link.href} {...stylex.props(styles.link)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 {...stylex.props(styles.heading)}>Participate</h4>
            <ul {...stylex.props(styles.list)}>
              {footerLinks.participate.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...stylex.props(
                      styles.link,
                      link.external && styles.externalLink,
                    )}
                    {...(link.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {link.label}
                    {link.external && (
                      <ExternalLinkIcon
                        {...stylex.props(styles.externalIcon)}
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 {...stylex.props(styles.heading)}>Legal</h4>
            <ul {...stylex.props(styles.list)}>
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...stylex.props(
                      styles.link,
                      link.external && styles.externalLink,
                    )}
                    {...(link.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {link.label}
                    {link.external && (
                      <ExternalLinkIcon
                        {...stylex.props(styles.externalIcon)}
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div {...stylex.props(styles.bottom)}>
          <span {...stylex.props(styles.copyright)}>
            Copyright © 2025 Meta Platforms, Inc.
          </span>

          <div {...stylex.props(styles.socialLinks)}>
            <a
              href="https://github.com/facebook/stylex"
              target="_blank"
              rel="noopener noreferrer"
              {...stylex.props(styles.socialLink)}
            >
              <GithubIcon {...stylex.props(styles.socialIcon)} />
            </a>
            <a
              href="https://twitter.com/styaborzhemskiy"
              target="_blank"
              rel="noopener noreferrer"
              {...stylex.props(styles.socialLink)}
            >
              <TwitterIcon {...stylex.props(styles.socialIcon)} />
            </a>
            <a
              href="https://bsky.app/profile/stylex.dev"
              target="_blank"
              rel="noopener noreferrer"
              {...stylex.props(styles.socialLink)}
            >
              <BlueskyIcon {...stylex.props(styles.socialIcon)} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = stylex.create({
  footer: {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: 'var(--color-fd-border)',
    backgroundColor: 'var(--color-fd-background)',
    transitionProperty: 'background-color, border-color',
    transitionDuration: '300ms',
  },
  container: {
    maxWidth: 1280,
    marginInline: 'auto',
    paddingInline: {
      default: 32,
      '@media (min-width: 640px)': 24,
      '@media (min-width: 1024px)': 32,
    },
    paddingTop: 48,
    paddingBottom: 32,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(2, 1fr)',
      '@media (min-width: 768px)': 'repeat(4, 1fr)',
    },
    gap: 32,
    marginBottom: 32,
  },
  heading: {
    marginBottom: 16,
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'var(--color-fd-foreground)',
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  link: {
    color: 'var(--color-fd-muted-foreground)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    transitionProperty: 'color',
    transitionDuration: '150ms',
    ':hover': {
      color: 'var(--color-fd-foreground)',
    },
  },
  externalLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  externalIcon: {
    width: 12,
    height: 12,
  },
  bottom: {
    paddingTop: 32,
    display: 'flex',
    flexDirection: {
      default: 'column',
      '@media (min-width: 640px)': 'row',
    },
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  copyright: {
    color: 'var(--color-fd-muted-foreground)',
    fontSize: '0.875rem',
  },
  socialLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  socialLink: {
    padding: 8,
    color: 'var(--color-fd-muted-foreground)',
    transitionProperty: 'color',
    transitionDuration: '150ms',
    ':hover': {
      color: 'var(--color-fd-foreground)',
    },
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
});
