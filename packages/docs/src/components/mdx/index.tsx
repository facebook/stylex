import TabItem from './TabItem';
import Tabs from './Tabs';
import Dial from '../Dial';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { DevInstallExample } from './PackageInstall';
import { Card } from './Card';
import Heading from './Heading';
import { HTMLAttributes } from 'react';
import { StyleXStyles } from '@stylexjs/stylex';
import MDXLink from './Link';
import * as stylex from '@stylexjs/stylex';

type StyleXHTMLProps<T extends HTMLElement = HTMLElement> = Omit<
  HTMLAttributes<T>,
  'className' | 'style'
> & {
  xstyle?: StyleXStyles;
};

export const mdxComponents = {
  ...defaultMdxComponents,
  a: MDXLink,
  h1: (props: StyleXHTMLProps<HTMLHeadingElement>) => (
    <Heading as="h1" {...props} />
  ),
  h2: (props: StyleXHTMLProps<HTMLHeadingElement>) => (
    <Heading as="h2" {...props} />
  ),
  h3: (props: StyleXHTMLProps<HTMLHeadingElement>) => (
    <Heading as="h3" {...props} />
  ),
  h4: (props: StyleXHTMLProps<HTMLHeadingElement>) => (
    <Heading as="h4" {...props} />
  ),
  h5: (props: StyleXHTMLProps<HTMLHeadingElement>) => (
    <Heading as="h5" {...props} />
  ),
  h6: (props: StyleXHTMLProps<HTMLHeadingElement>) => (
    <Heading as="h6" {...props} />
  ),
  code: (props: StyleXHTMLProps<HTMLElement>) => (
    <code {...props} {...stylex.props(styles.code)} />
  ),
  TabItem,
  Tabs,
  Dial,
  DevInstallExample,
  WhenDemo: Card,
};

const styles = stylex.create({
  code: {
    // color: `hsl(var(--cyan-h), var(--cyan-s), var(--cyan-l))`,
    color: 'light-dark(hsl(146, 55%, 45%), hsl(146, 52%, 68%))',
  },
});
