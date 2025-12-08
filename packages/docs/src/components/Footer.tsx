/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { GithubIcon, TwitterIcon } from 'lucide-react';

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
              href="https://x.com/stylexjs"
              target="_blank"
              rel="noopener noreferrer"
              {...stylex.props(styles.socialLink)}
            >
              <TwitterIcon {...stylex.props(styles.socialIcon)} />
            </a>
            {/* <a
              href="https://bsky.app/profile/stylex.dev"
              target="_blank"
              rel="noopener noreferrer"
              {...stylex.props(styles.socialLink)}
            >
              <BlueskyIcon {...stylex.props(styles.socialIcon)} />
            </a> */}
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
    textAlign: 'center',
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
