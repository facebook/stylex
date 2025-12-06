import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import TabItem from './TabItem';
import Tabs from './Tabs';
import Dial from '../Dial';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { DevInstallExample } from './PackageInstall';
import { Card } from './Card';

export const mdxComponents = {
  ...defaultMdxComponents,
  TypeTable,
  Accordion,
  Accordions,
  TabItem,
  Tabs,
  Dial,
  DevInstallExample,
  WhenDemo: Card,
};
