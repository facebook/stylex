'use client';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { useEffect, useState } from 'react';
import { StyleXComponentProps } from '../layout/shared';
import * as stylex from '@stylexjs/stylex';

export const Collapsible = CollapsiblePrimitive.Root;

export const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

export const CollapsibleContent = ({
  children,
  xstyle,
  ref,
  ...props
}: StyleXComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <CollapsiblePrimitive.CollapsibleContent
      ref={ref}
      {...props}
      {...stylex.props(
        styles.overflowHidden,
        mounted && styles.mounted,
        xstyle,
      )}
    >
      {children}
    </CollapsiblePrimitive.CollapsibleContent>
  );
};

CollapsibleContent.displayName =
  CollapsiblePrimitive.CollapsibleContent.displayName;

const styles = stylex.create({
  overflowHidden: {
    overflow: 'hidden',
  },
  mounted: {
    animation: {
      default: null,
      ':where([data-state=closed])': 'var(--animation-fd-collapsible-up)',
      ':where([data-state=open])': 'var(--animation-fd-collapsible-down)',
    },
  },
});
