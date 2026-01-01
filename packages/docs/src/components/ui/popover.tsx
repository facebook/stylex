/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { StyleXComponentProps } from '../layout/shared';
import * as stylex from '@stylexjs/stylex';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = ({
  xstyle,
  align = 'center',
  sideOffset = 4,
  ref,
  ...props
}: StyleXComponentProps<typeof PopoverPrimitive.Content>) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      align={align}
      ref={ref}
      side="bottom"
      sideOffset={sideOffset}
      {...props}
      {...stylex.props(styles.content, xstyle)}
    />
  </PopoverPrimitive.Portal>
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
const styles = stylex.create({
  content: {
    zIndex: 50,
    minWidth: '240px',
    maxWidth: '98vw',
    maxHeight: 'var(--radix-popover-content-available-height)',
    padding: 2 * 4,
    overflowY: 'auto',
    fontSize: `${12 / 16}rem`,
    lineHeight: 1.4,
    color: 'var(--text-fd-popover-foreground)',
    outline: 'none',
    backgroundColor:
      'color-mix(in oklab, var(--bg-fd-popover) 60%, transparent)',
    borderColor: 'var(--border-fd-popover)',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 12,
    boxShadow:
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    backdropFilter: 'blur(16px)',
    transformOrigin: 'var(--radix-popover-content-transform-origin)',
  },
});

const PopoverClose = PopoverPrimitive.PopoverClose;

export { Popover, PopoverTrigger, PopoverContent, PopoverClose };
