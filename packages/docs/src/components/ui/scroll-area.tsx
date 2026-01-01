/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { StyleXComponentProps } from '../layout/shared';
import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { vars } from '../../theming/vars.stylex';

export const ScrollArea = ({
  xstyle,
  children,
  ref,
  ...props
}: StyleXComponentProps<typeof ScrollAreaPrimitive.Root>) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    type="scroll"
    {...props}
    {...stylex.props(styles.overflowHidden, xstyle)}
  >
    {children}
    <ScrollAreaPrimitive.Corner />
    <ScrollBar orientation="vertical" />
  </ScrollAreaPrimitive.Root>
);

ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

export const ScrollViewport = ({
  xstyle,
  children,
  ref,
  ...props
}: StyleXComponentProps<typeof ScrollAreaPrimitive.Viewport>) => (
  <ScrollAreaPrimitive.Viewport
    ref={ref}
    {...props}
    {...stylex.props(styles.viewport, xstyle)}
  >
    {children}
  </ScrollAreaPrimitive.Viewport>
);

ScrollViewport.displayName = ScrollAreaPrimitive.Viewport.displayName;

export const ScrollBar = ({
  xstyle,
  orientation = 'vertical',
  ref,
  ...props
}: StyleXComponentProps<typeof ScrollAreaPrimitive.Scrollbar>) => (
  <ScrollAreaPrimitive.Scrollbar
    orientation={orientation}
    ref={ref}
    {...props}
    {...stylex.props(styles.scrollBar, styles[orientation], xstyle)}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb {...stylex.props(styles.thumb)} />
  </ScrollAreaPrimitive.Scrollbar>
);
ScrollBar.displayName = ScrollAreaPrimitive.Scrollbar.displayName;

const styles = stylex.create({
  overflowHidden: { overflow: 'hidden' },
  viewport: {
    width: '100%',
    height: '100%',
    borderRadius: 'inherit',
  },
  scrollBar: {
    display: 'flex',
    userSelect: 'none',
    animation: {
      default: null,
      ':where([data-state="hidden"])': vars['--animate-fd-fade-out'],
    },
  },
  vertical: {
    width: 1.5 * 4,
    height: '100%',
  },
  horizontal: {
    flexDirection: 'column',
    height: 1.5 * 4,
  },
  thumb: {
    position: 'relative',
    flexGrow: 1,
    backgroundColor: `${vars['--color-fd-border']}`,
    borderRadius: 9999,
  },
});
