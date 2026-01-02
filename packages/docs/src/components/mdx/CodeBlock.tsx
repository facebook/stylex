/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
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
  viewportProps?: HTMLAttributes<HTMLDivElement>;
  'data-line-numbers'?: boolean;
  'data-line-numbers-start'?: number;
  Actions?: (_props: { className?: string; children?: ReactNode }) => ReactNode;
  xstyle?: stylex.StyleXStyles;
}

export function CodeBlock({
  ref,
  title,
  allowCopy = true,
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
      dir="ltr"
      ref={ref}
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
        // style={{
        //   counterSet: props['data-line-numbers']
        //     ? `line ${Number(props['data-line-numbers-start'] ?? 1) - 1}`
        //     : undefined,
        //   ...viewportProps.style,
        // }}
        {...viewportProps}
        {...stylex.props(styles.viewport, !title && styles.viewportPadded)}
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
      data-checked={checked || undefined}
      type="button"
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
    setActiveTab: (_value: string) => void;
  } | null;

  const isActive = context?.activeTab === value;

  return (
    <button
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      role="tab"
      type="button"
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
    overflow: 'hidden',
    fontSize: 13,
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  },
  figureStandalone: {
    marginBlock: 16,
    backgroundColor: vars['--color-fd-card'],
    borderRadius: 12,
  },
  figureInTab: {
    marginBlockEnd: -1,
    marginInline: -1,
    backgroundColor: vars['--color-fd-secondary'],
    borderEndStartRadius: 12,
    borderEndEndRadius: 12,
  },
  header: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    height: 38,
    paddingInline: 16,
    color: vars['--color-fd-muted-foreground'],
    borderBottomColor: vars['--color-fd-border'],
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flexGrow: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actionsWrapper: {
    display: 'contents',
  },
  viewport: {
    paddingBlock: 8,
    overflow: 'auto',
  },
  viewportPadded: {
    paddingInlineEnd: 48,
  },
  pre: {
    display: 'flex',
    flexDirection: 'column',
    width: 'max-content',
    minWidth: '100%',
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
    color: {
      default: vars['--color-fd-muted-foreground'],
      ':hover': vars['--color-fd-accent-foreground'],
    },
    backgroundColor: {
      default: 'transparent',
      ':hover': vars['--color-fd-accent'],
    },
    borderWidth: 0,
    borderRadius: 6,
    transitionDuration: DURATION,
    transitionProperty: 'background-color, color',
  },
  copyButtonChecked: {
    color: vars['--color-fd-accent-foreground'],
  },
  floatingCopyButton: {
    position: 'absolute',
    insetInlineEnd: 4,
    top: 4,
    zIndex: 2,
    borderRadius: 8,
    backdropFilter: 'blur(8px)',
  },
  copyIcon: {
    width: 14,
    height: 14,
  },
  // Tabs styles
  tabsContainer: {
    backgroundColor: vars['--color-fd-card'],
    borderColor: vars['--color-fd-border'],
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 12,
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
    gap: 8,
    alignItems: 'center',
    paddingBlock: 6,
    paddingInline: 8,
    fontSize: 14,
    fontWeight: 500,
    color: {
      default: 'inherit',
      ':hover': vars['--color-fd-accent-foreground'],
    },
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    borderWidth: 0,
    transitionDuration: DURATION,
    transitionProperty: 'color',
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
