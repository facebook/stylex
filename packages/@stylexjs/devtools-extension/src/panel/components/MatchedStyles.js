/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import * as React from 'react';
import { useMemo } from 'react';
import * as stylex from '@stylexjs/stylex';

import type {
  OverrideCommand,
  StylexDebugData,
  StylexDeclaration,
} from '../../types';
import { formatCssValue, parseCssValue } from '../../utils/css';
import {
  conditionsAreActive,
  findDisplayedOverride,
  findSuggestion,
  formatConditions,
  getReplacementOverrideIds,
  getSuggestionValues,
  groupDeclarations,
} from '../declarations/model';
import { colors } from '../theme.stylex';
import { ValueEditor } from './ValueEditor';

export function MatchedStyles({
  data,
  onMutate,
}: {
  data: StylexDebugData,
  onMutate: (command: OverrideCommand) => Promise<void>,
}): React.Node {
  const groups = useMemo(
    () => groupDeclarations(data.matched.classes),
    [data.matched.classes],
  );
  if (groups.length === 0) {
    return (
      <div {...stylex.props(styles.muted)}>
        No matching StyleX CSS rules were found.
      </div>
    );
  }

  return (
    <div {...stylex.props(styles.groups)}>
      {groups.map(({ pseudoElement, properties }) => (
        <div
          {...stylex.props(styles.pseudoGroup)}
          key={pseudoElement || 'base'}
        >
          {pseudoElement !== '' ? (
            <div {...stylex.props(styles.pseudoTitle)}>{pseudoElement}</div>
          ) : null}
          {properties.map(({ property, declarations }) => (
            <PropertyGroup
              computedValue={data.computed[pseudoElement]?.[property]}
              data={data}
              declarations={declarations}
              key={property}
              onMutate={onMutate}
              property={property}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function PropertyGroup({
  computedValue,
  data,
  declarations,
  onMutate,
  property,
}: {
  computedValue?: string,
  data: StylexDebugData,
  declarations: $ReadOnlyArray<StylexDeclaration>,
  onMutate: (command: OverrideCommand) => Promise<void>,
  property: string,
}): React.Node {
  const propertyPrefix = (
    <span
      {...stylex.props(styles.propertyPrefix)}
      title={computedValue?.trim() || undefined}
    >
      <span {...stylex.props(styles.property)}>{property}</span>:
    </span>
  );

  if (declarations.length === 1) {
    return (
      <div {...stylex.props(styles.propertyGroup)}>
        <DeclarationRow
          data={data}
          declaration={declarations[0]}
          onMutate={onMutate}
          prefix={propertyPrefix}
        />
      </div>
    );
  }

  return (
    <div {...stylex.props(styles.propertyGroup)}>
      <div {...stylex.props(styles.propertyHeading)}>{propertyPrefix}</div>
      <div {...stylex.props(styles.conditionList)}>
        {declarations.map((declaration) => (
          <DeclarationRow
            data={data}
            declaration={declaration}
            key={declaration.key}
            onMutate={onMutate}
            prefix={<ConditionPrefix declaration={declaration} />}
          />
        ))}
      </div>
    </div>
  );
}

function ConditionPrefix({
  declaration,
}: {
  declaration: StylexDeclaration,
}): React.Node {
  const conditionLabel = formatConditions(declaration.conditions);
  const conditionState = conditionsAreActive(declaration.conditions);

  return (
    <span
      title={
        conditionState === false
          ? 'This condition is currently inactive.'
          : undefined
      }
    >
      <span
        {...stylex.props(
          styles.condition,
          conditionState === false && styles.inactive,
        )}
      >
        {conditionLabel}
      </span>
      :
    </span>
  );
}

function DeclarationRow({
  data,
  declaration,
  onMutate,
  prefix,
}: {
  data: StylexDebugData,
  declaration: StylexDeclaration,
  onMutate: (command: OverrideCommand) => Promise<void>,
  prefix: React.Node,
}): React.Node {
  const suggestions = data.suggestions[declaration.contextKey] ?? [];
  const displayedOverride = findDisplayedOverride(declaration, data.overrides);
  const displayValue = formatCssValue(
    displayedOverride?.value ?? declaration.value,
    displayedOverride?.important ?? declaration.important,
  );
  const commit = async (rawValue: string) => {
    const parsed = parseCssValue(rawValue);
    const formatted = formatCssValue(parsed.value, parsed.important);
    const suggestion = findSuggestion(suggestions, formatted);
    const common = {
      selectionId: data.selectionId,
      contextKey: declaration.contextKey,
      property: declaration.property,
      value: parsed.value,
      important: parsed.important,
      conditions: declaration.conditions,
      sourceEntryKey: declaration.key,
      replaceOverrideIds: getReplacementOverrideIds(
        declaration,
        data.overrides,
      ),
    };

    if (suggestion != null) {
      await onMutate({
        ...common,
        type: 'swap-class',
        fromClassName: declaration.className,
        toClassName: suggestion.className,
        ...(declaration.pseudoElement != null
          ? { pseudoElement: declaration.pseudoElement }
          : {}),
      });
    } else if (declaration.pseudoElement != null) {
      await onMutate({
        ...common,
        type: 'set-rule',
        pseudoElement: declaration.pseudoElement,
      });
    } else {
      await onMutate({ ...common, type: 'set-inline' });
    }
  };

  return (
    <div {...stylex.props(styles.row)}>
      <div {...stylex.props(styles.declaration)}>
        {prefix}
        <ValueEditor
          onCommit={commit}
          suggestions={getSuggestionValues(suggestions)}
          value={displayValue}
        />
      </div>
      <span {...stylex.props(styles.className)}>{declaration.className}</span>
    </div>
  );
}

const styles = stylex.create({
  muted: { color: colors.textMuted },
  groups: { display: 'grid', gap: 12 },
  pseudoGroup: { display: 'grid', gap: 7 },
  pseudoTitle: {
    color: colors.textMuted,
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    fontWeight: 600,
  },
  propertyGroup: {
    borderBottomColor: colors.separator,
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    display: 'grid',
    gap: 4,
    paddingBlock: 5,
  },
  propertyHeading: {
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    minWidth: 0,
    textWrap: 'nowrap',
    whiteSpace: 'nowrap',
  },
  conditionList: { display: 'grid', gap: 2, paddingInlineStart: 12 },
  row: {
    alignItems: 'baseline',
    display: 'flex',
    gap: 12,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  declaration: {
    alignItems: 'baseline',
    columnGap: 6,
    display: 'flex',
    flex: 1,
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    minWidth: 0,
  },
  propertyPrefix: {
    flexShrink: 0,
    textWrap: 'nowrap',
    whiteSpace: 'nowrap',
  },
  property: { color: colors.textAccent },
  condition: {
    color: colors.secondaryAccent,
  },
  inactive: { opacity: 0.55, textDecoration: 'line-through' },
  className: {
    color: colors.textMuted,
    flexShrink: 0,
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    maxWidth: '50%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '::before': { content: '.' },
  },
});
