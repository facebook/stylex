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
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      side="bottom"
      {...props}
      {...stylex.props(styles.content, xstyle)}
    />
  </PopoverPrimitive.Portal>
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
const styles = stylex.create({
  content: {
    // rounded-xl border bg-fd-popover/60 backdrop-blur-lg p-2 text-sm text-fd-popover-foreground shadow-lg focus-visible:outline-none data-[state=closed]:animate-fd-popover-out data-[state=open]:animate-fd-popover-in
    zIndex: 50,
    transformOrigin: 'var(--radix-popover-content-transform-origin)',
    overflowY: 'auto',
    maxHeight: 'var(--radix-popover-content-available-height)',
    minWidth: '240px',
    maxWidth: '98vw',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border-fd-popover)',
    backgroundColor:
      'color-mix(in oklab, var(--bg-fd-popover) 60%, transparent)',
    backdropFilter: 'blur(16px)',
    padding: 2 * 4,
    fontSize: `${12 / 16}rem`,
    lineHeight: 1.4,
    color: 'var(--text-fd-popover-foreground)',
    boxShadow:
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    outline: 'none',
    // animation: {
    //   default: null,
    //   ':where([data-state=closed])': 'var(--animation-fd-popover-out)',
    //   ':where([data-state=open])': 'var(--animation-fd-popover-in)',
    // },
  },
});

const PopoverClose = PopoverPrimitive.PopoverClose;

export { Popover, PopoverTrigger, PopoverContent, PopoverClose };
