'use client';

import * as stylex from '@stylexjs/stylex';
import { Check, Clipboard } from 'lucide-react';
import type { ComponentProps, HTMLAttributes, ReactNode } from 'react';
import {
  createContext,
  use,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { preMarker } from './mdx.stylex';
import { vars } from '@/theming/vars.stylex';

// Context for tracking if we're inside CodeBlockTabs
const TabsContext = createContext<{
  containerRef: React.RefObject<HTMLDivElement | null>;
  nested: boolean;
} | null>(null);

// =============================================================================
// Pre Component
// =============================================================================

export function Pre(props: ComponentProps<'pre'>) {
  return (
    <pre
      {...stylex.props(styles.pre, stylex.defaultMarker(), preMarker)}
      {...props}
    >
      {props.children}
    </pre>
  );
}

// =============================================================================
// CodeBlock Component
// =============================================================================

export interface CodeBlockProps extends ComponentProps<'figure'> {
  icon?: ReactNode;
  title?: string;
  allowCopy?: boolean;
  keepBackground?: boolean;
  viewportProps?: HTMLAttributes<HTMLDivElement>;
  'data-line-numbers'?: boolean;
  'data-line-numbers-start'?: number;
  Actions?: (props: { className?: string; children?: ReactNode }) => ReactNode;
  xstyle?: stylex.StyleXStyles;
}

export function CodeBlock({
  ref,
  title,
  allowCopy = true,
  keepBackground = false,
  icon,
  viewportProps = {},
  children,
  xstyle,
  Actions = ({ children }) => (
    <div {...stylex.props(styles.actionsWrapper)}>{children}</div>
  ),
  ...props
}: CodeBlockProps) {
  const inTab = use(TabsContext) !== null;
  const areaRef = useRef<HTMLDivElement>(null);
  const { className, style, ...rest } = props;

  const {
    className: _className,
    style: _style,
    ..._rest
  } = stylex.props(
    styles.figure,
    inTab ? styles.figureInTab : styles.figureStandalone,
    xstyle,
  );

  return (
    <figure
      ref={ref}
      dir="ltr"
      tabIndex={-1}
      {...rest}
      className={[_className, className].join(' ')}
      style={{ ..._style, ...style }}
      {..._rest}
    >
      {title ? (
        <div {...stylex.props(styles.header)}>
          {typeof icon === 'string' ? (
            <div
              {...stylex.props(styles.iconWrapper)}
              dangerouslySetInnerHTML={{ __html: icon }}
            />
          ) : (
            icon
          )}
          <figcaption {...stylex.props(styles.title)}>{title}</figcaption>
          {Actions({
            children: allowCopy && <CopyButton containerRef={areaRef} />,
          })}
        </div>
      ) : (
        Actions({
          children: allowCopy && (
            <CopyButton
              containerRef={areaRef}
              xstyle={styles.floatingCopyButton}
            />
          ),
        })
      )}
      <div
        ref={areaRef}
        role="region"
        tabIndex={0}
        {...stylex.props(styles.viewport, !title && styles.viewportPadded)}
        style={{
          counterSet: props['data-line-numbers']
            ? `line ${Number(props['data-line-numbers-start'] ?? 1) - 1}`
            : undefined,
          ...viewportProps.style,
        }}
        {...viewportProps}
      >
        {children}
      </div>
    </figure>
  );
}

// =============================================================================
// CopyButton Component
// =============================================================================

interface CopyButtonProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  xstyle?: stylex.StyleXStyles;
}

function CopyButton({ containerRef, xstyle }: CopyButtonProps) {
  const [checked, setChecked] = useState(false);

  const handleClick = useCallback(() => {
    const pre = containerRef.current?.getElementsByTagName('pre').item(0);
    if (!pre) return;

    const clone = pre.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.nd-copy-ignore').forEach((node) => {
      node.replaceWith('\n');
    });

    void navigator.clipboard.writeText(clone.textContent ?? '');
    setChecked(true);
    setTimeout(() => setChecked(false), 2000);
  }, [containerRef]);

  return (
    <button
      type="button"
      data-checked={checked || undefined}
      {...stylex.props(
        styles.copyButton,
        checked && styles.copyButtonChecked,
        xstyle,
      )}
      aria-label={checked ? 'Copied Text' : 'Copy Text'}
      onClick={handleClick}
    >
      {checked ? (
        <Check {...stylex.props(styles.copyIcon)} />
      ) : (
        <Clipboard {...stylex.props(styles.copyIcon)} />
      )}
    </button>
  );
}

// =============================================================================
// CodeBlockTabs Components
// =============================================================================

export function CodeBlockTabs({
  ref,
  defaultValue,
  children,
  ...props
}: ComponentProps<'div'> & { defaultValue?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nested = use(TabsContext) !== null;
  const [activeTab, setActiveTab] = useState(defaultValue);

  const contextValue = useMemo(
    () => ({
      containerRef,
      nested,
      activeTab,
      setActiveTab,
    }),
    [nested, activeTab],
  );

  return (
    <div
      ref={containerRef}
      {...stylex.props(
        styles.tabsContainer,
        !nested && styles.tabsContainerOuter,
      )}
      {...props}
    >
      <TabsContext value={contextValue}>{children}</TabsContext>
    </div>
  );
}

export function CodeBlockTabsList(props: ComponentProps<'div'>) {
  return (
    <div role="tablist" {...stylex.props(styles.tabsList)} {...props}>
      {props.children}
    </div>
  );
}

export function CodeBlockTabsTrigger({
  value,
  children,
  ...props
}: ComponentProps<'button'> & { value: string }) {
  const context = use(TabsContext) as {
    activeTab?: string;
    setActiveTab: (value: string) => void;
  } | null;

  const isActive = context?.activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      {...stylex.props(styles.tabTrigger, isActive && styles.tabTriggerActive)}
      onClick={() => context?.setActiveTab(value)}
      {...props}
    >
      <div
        {...stylex.props(
          styles.tabIndicator,
          isActive && styles.tabIndicatorActive,
        )}
      />
      {children}
    </button>
  );
}

export function CodeBlockTab({
  value,
  children,
  ...props
}: ComponentProps<'div'> & { value: string }) {
  const context = use(TabsContext) as { activeTab?: string } | null;
  const isActive = context?.activeTab === value;

  if (!isActive) return null;

  return (
    <div role="tabpanel" {...props}>
      {children}
    </div>
  );
}

// =============================================================================
// Styles
// =============================================================================

const DURATION = '0.15s';

const styles = stylex.create({
  figure: {
    position: 'relative',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: vars['--color-fd-border'],
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    overflow: 'hidden',
    fontSize: 13,
  },
  figureStandalone: {
    marginBlock: 16,
    backgroundColor: vars['--color-fd-card'],
    borderRadius: 12,
  },
  figureInTab: {
    marginInline: -1,
    marginBlockEnd: -1,
    backgroundColor: vars['--color-fd-secondary'],
    borderEndStartRadius: 12,
    borderEndEndRadius: 12,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 38,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: vars['--color-fd-border'],
    paddingInline: 16,
    color: vars['--color-fd-muted-foreground'],
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ':where(*) svg': {
      width: '1em',
      height: '1em',
    },
  },
  title: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actionsWrapper: {
    display: 'contents',
  },
  viewport: {
    paddingBlock: 8,
  },
  viewportPadded: {
    paddingInlineEnd: 48,
  },
  pre: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '100%',
    width: 'max-content',
    margin: 0,
    backgroundColor: 'transparent',
  },
  copyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    padding: 0,
    borderRadius: 6,
    borderWidth: 0,
    backgroundColor: {
      default: 'transparent',
      ':hover': vars['--color-fd-accent'],
    },
    color: {
      default: vars['--color-fd-muted-foreground'],
      ':hover': vars['--color-fd-accent-foreground'],
    },
    transitionProperty: 'background-color, color',
    transitionDuration: DURATION,
  },
  copyButtonChecked: {
    color: vars['--color-fd-accent-foreground'],
  },
  floatingCopyButton: {
    position: 'absolute',
    top: 8,
    insetInlineEnd: 8,
    zIndex: 2,
    backdropFilter: 'blur(8px)',
    borderRadius: 8,
  },
  copyIcon: {
    width: 14,
    height: 14,
  },
  // Tabs styles
  tabsContainer: {
    backgroundColor: vars['--color-fd-card'],
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: vars['--color-fd-border'],
  },
  tabsContainerOuter: {
    marginBlock: 16,
  },
  tabsList: {
    display: 'flex',
    flexDirection: 'row',
    paddingInline: 8,
    overflowX: 'auto',
    color: vars['--color-fd-muted-foreground'],
  },
  tabTrigger: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 8,
    paddingBlock: 6,
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: {
      default: 'inherit',
      ':hover': vars['--color-fd-accent-foreground'],
    },
    cursor: 'pointer',
    transitionProperty: 'color',
    transitionDuration: DURATION,
  },
  tabTriggerActive: {
    color: vars['--color-fd-primary'],
  },
  tabIndicator: {
    position: 'absolute',
    insetInline: 8,
    bottom: 0,
    height: 1,
    backgroundColor: 'transparent',
  },
  tabIndicatorActive: {
    backgroundColor: vars['--color-fd-primary'],
  },
});
