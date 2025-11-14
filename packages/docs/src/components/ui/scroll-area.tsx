import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { StyleXComponentProps } from '../layout/shared';
import * as stylex from '@stylexjs/stylex';

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
    ref={ref}
    orientation={orientation}
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
      ':where([data-state="hidden"])': 'var(--animate-fd-fade-out)',
    },
  },
  vertical: {
    height: '100%',
    width: 1.5 * 4,
  },
  horizontal: {
    height: 1.5 * 4,
    flexDirection: 'column',
  },
  thumb: {
    position: 'relative',
    flex: 1,
    borderRadius: 9999,
    backgroundColor: 'var(--color-fd-border)',
  },
});
