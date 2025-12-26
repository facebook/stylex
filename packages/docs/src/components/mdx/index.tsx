import TabItem from './TabItem';
import Tabs from './Tabs';
import Dial from '../Dial';
import { DevInstallExample } from './PackageInstall';
import { Card as WhenDemo } from './Card';
import { Card, Cards } from './Cards';
import Heading from './Heading';
import type { HTMLAttributes, ComponentProps } from 'react';
import { StyleXStyles } from '@stylexjs/stylex';
import MDXLink from './Link';
import * as stylex from '@stylexjs/stylex';
import { Accordion, Accordions, Details, Summary } from './Details';
import {
  Callout,
  CalloutContainer,
  CalloutTitle,
  CalloutDescription,
} from './Callout';
import P from './P';
import Image from './Image';
import {
  CodeBlock,
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  Pre,
} from './CodeBlock';
import { preMarker } from './mdx.stylex';

type StyleXHTMLProps<T extends HTMLElement = HTMLElement> = Omit<
  HTMLAttributes<T>,
  'className' | 'style'
> & {
  xstyle?: StyleXStyles;
};

// PENDING ELEMENTS:
//
// table

export const mdxComponents = {
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
  p: P,
  TabItem,
  Tabs,
  Dial,
  DevInstallExample,
  WhenDemo,
  Card,
  Cards,
  details: Details,
  summary: Summary,
  Accordion,
  Accordions,
  Details,
  Summary,
  Callout,
  CalloutContainer,
  CalloutTitle,
  CalloutDescription,
  img: Image,
  pre: (props: ComponentProps<'pre'>) => (
    <CodeBlock {...props}>
      <Pre>{props.children}</Pre>
    </CodeBlock>
  ),
  CodeBlock,
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
};

const styles = stylex.create({
  code: {
    // color: `hsl(var(--cyan-h), var(--cyan-s), var(--cyan-l))`,
    color: 'light-dark(hsl(146, 55%, 45%), hsl(146, 52%, 68%))',
    backgroundColor: {
      default: null,
      [stylex.when.ancestor(':where(*)', preMarker)]: 'transparent',
    },
    borderStyle: {
      default: null,
      [stylex.when.ancestor(':where(*)', preMarker)]: 'none',
    },
    lineHeight: 1.5,
  },
});
