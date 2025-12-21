/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../theme.stylex';

type TDeclaration = $ReadOnly<{
  property: string,
  value: string,
  important: boolean,
  condition?: string,
  conditions?: $ReadOnlyArray<string>,
  pseudoElement?: string,
  className?: string,
  ...
}>;

type TPropertyGroup = $ReadOnly<{
  property: string,
  entries: $ReadOnlyArray<TDeclaration>,
}>;

type TSection = $ReadOnly<{
  key: string,
  properties: $ReadOnlyArray<TPropertyGroup>,
}>;

type TConditionNode = {
  key: string,
  label: string,
  entries: Array<TDeclaration>,
  children: Array<TConditionNode>,
};

function getConditionParts(entry: TDeclaration): Array<string> {
  if (entry.conditions && entry.conditions.length > 0) {
    return [...entry.conditions];
  }
  if (!entry.condition || entry.condition === 'default') return [];
  return entry.condition
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function moveKeyToFront(list: Array<string>, key: string): Array<string> {
  if (!list.includes(key)) {
    return list.slice();
  }
  return [key, ...list.filter((item) => item !== key)];
}

function formatConditionLabel(label: string): string {
  if (label === 'default') return 'default';
  return `'${label}'`;
}

function isAtRuleLabel(label: string): boolean {
  return label.startsWith('@');
}

function collapseDefaultChild(node: TConditionNode): TConditionNode {
  if (node.children.length !== 1) return node;
  const child = node.children[0];
  if (child.label !== 'default') return node;
  return {
    ...node,
    entries: [...node.entries, ...child.entries],
    children: child.children,
  };
}

function buildSections(
  classes: $ReadOnlyArray<
    $ReadOnly<{
      name: string,
      declarations: $ReadOnlyArray<TDeclaration>,
      ...
    }>,
  >,
): Array<TSection> {
  const sectionOrder: Array<string> = [];
  const sectionMap: Map<
    string,
    {
      propertyOrder: Array<string>,
      propertyToEntries: Map<string, Array<TDeclaration>>,
    },
  > = new Map();

  for (const entry of classes) {
    for (const decl of entry.declarations) {
      const sectionKey = decl.pseudoElement ?? '';
      let section = sectionMap.get(sectionKey);
      if (section == null) {
        section = {
          propertyOrder: [],
          propertyToEntries: new Map(),
        };
        sectionMap.set(sectionKey, section);
        sectionOrder.push(sectionKey);
      }
      const bucket = section.propertyToEntries.get(decl.property);
      if (bucket == null) {
        section.propertyOrder.push(decl.property);
        section.propertyToEntries.set(decl.property, [decl]);
      } else {
        bucket.push(decl);
      }
    }
  }

  const orderedSections = moveKeyToFront(sectionOrder, '');
  const result: Array<TSection> = [];
  for (const sectionKey of orderedSections) {
    const section = sectionMap.get(sectionKey);
    if (!section) continue;
    const properties = section.propertyOrder.map((property) => ({
      property,
      entries: section.propertyToEntries.get(property) ?? [],
    }));
    result.push({ key: sectionKey, properties });
  }
  return result;
}

type TConditionSplit = {
  atRuleKey: string,
  conditionKey: string,
  entry: TDeclaration,
};

type TGroupData = {
  atRuleKey: string,
  conditionOrder: Array<string>,
  conditions: { [string]: TConditionNode, ... },
};

type TGroupState = {
  atRuleOrder: Array<string>,
  groups: { [string]: TGroupData, ... },
};

function ensureUnique(list: Array<string>, value: string): Array<string> {
  return list.includes(value) ? list : [...list, value];
}

function partitionParts(parts: Array<string>): {
  atRules: Array<string>,
  others: Array<string>,
} {
  return parts.reduce(
    (acc, part) =>
      part.startsWith('@')
        ? { atRules: [...acc.atRules, part], others: acc.others }
        : part
          ? { atRules: acc.atRules, others: [...acc.others, part] }
          : acc,
    { atRules: [], others: [] },
  );
}

function splitConditions(entry: TDeclaration): TConditionSplit {
  const parts = getConditionParts(entry);
  const { atRules, others } = partitionParts(parts);
  const atRuleKey = atRules.join(', ');
  const conditionKey = others.length > 0 ? others.join(', ') : 'default';
  return { atRuleKey, conditionKey, entry };
}

function createConditionNode(
  atRuleKey: string,
  conditionKey: string,
): TConditionNode {
  return {
    key: `cond:${atRuleKey}:${conditionKey}`,
    label: conditionKey,
    entries: [],
    children: [],
  };
}

function updateGroupWithEntry(
  group: TGroupData,
  split: TConditionSplit,
): TGroupData {
  const existingNode = group.conditions[split.conditionKey];
  const nextNode = {
    ...(existingNode ??
      createConditionNode(split.atRuleKey, split.conditionKey)),
    entries: [...(existingNode?.entries ?? []), split.entry],
  };

  return {
    ...group,
    conditionOrder: ensureUnique(group.conditionOrder, split.conditionKey),
    conditions: { ...group.conditions, [split.conditionKey]: nextNode },
  };
}

function updateStateWithEntry(
  state: TGroupState,
  split: TConditionSplit,
): TGroupState {
  const existingGroup = state.groups[split.atRuleKey];
  const baseGroup = existingGroup ?? {
    atRuleKey: split.atRuleKey,
    conditionOrder: [],
    conditions: {},
  };
  const nextGroup = updateGroupWithEntry(baseGroup, split);

  return {
    atRuleOrder: ensureUnique(state.atRuleOrder, split.atRuleKey),
    groups: { ...state.groups, [split.atRuleKey]: nextGroup },
  };
}

function toConditionNodes(state: TGroupState): Array<TConditionNode> {
  const orderedAtRules = moveKeyToFront(state.atRuleOrder, '');
  // $FlowFixMe[incompatible-type]
  return orderedAtRules.reduce(
    (acc: Array<TConditionNode>, atRuleKey: string) => {
      const group = state.groups[atRuleKey];
      if (!group) return acc;
      const orderedConditions = moveKeyToFront(group.conditionOrder, 'default');
      const children = orderedConditions.reduce(
        (childAcc: Array<TConditionNode>, conditionKey: string) => {
          const node = group.conditions[conditionKey];
          return node ? [...childAcc, node] : childAcc;
        },
        [] as Array<TConditionNode>,
      );

      if (atRuleKey === '') {
        return [...acc, ...children];
      }

      return [
        ...acc,
        {
          key: `at:${atRuleKey || 'base'}`,
          label: atRuleKey,
          entries: [],
          children,
        },
      ];
    },
    [] as Array<TConditionNode>,
  );
}

function buildConditionNodes(
  entries: $ReadOnlyArray<TDeclaration>,
): Array<TConditionNode> {
  const splits = entries.map(splitConditions);
  // $FlowFixMe[incompatible-type]
  const grouped = splits.reduce(updateStateWithEntry, {
    atRuleOrder: [],
    groups: {},
  });
  return toConditionNodes(grouped);
}

export function DeclarationsList({
  classes,
  computed,
}: {
  classes: $ReadOnlyArray<
    $ReadOnly<{
      name: string,
      declarations: $ReadOnlyArray<TDeclaration>,
      ...
    }>,
  >,
  computed: { [string]: string, ... },
}): React.Node {
  if (classes.length === 0) {
    return (
      <div {...stylex.props(styles.muted)}>
        No matching StyleX CSS rules found for the selected element.
      </div>
    );
  }

  const sections = buildSections(classes);
  if (sections.length === 0) {
    return (
      <div {...stylex.props(styles.muted)}>
        No matching StyleX CSS rules found for the selected element.
      </div>
    );
  }

  return (
    <div {...stylex.props(styles.declList)}>
      {sections.map((section) => (
        <PseudoSection
          computed={computed}
          key={section.key || 'base'}
          section={section}
        />
      ))}
    </div>
  );
}

function PseudoSection({
  computed,
  section,
}: {
  computed: { [string]: string, ... },
  section: TSection,
}): React.Node {
  if (section.key === '') {
    return <PropertyList computed={computed} properties={section.properties} />;
  }
  return (
    <div {...stylex.props(styles.pseudoSection)}>
      <div {...stylex.props(styles.pseudoTitle)}>{section.key}</div>
      <PropertyList computed={computed} properties={section.properties} />
    </div>
  );
}

function PropertyList({
  computed,
  properties,
}: {
  computed: { [string]: string, ... },
  properties: $ReadOnlyArray<TPropertyGroup>,
}): React.Node {
  return (
    <div {...stylex.props(styles.sectionList)}>
      {properties.map((group) => (
        <PropertyGroup
          computedValue={computed[group.property]}
          group={group}
          key={group.property}
        />
      ))}
    </div>
  );
}

function PropertyGroup({
  computedValue,
  group,
}: {
  computedValue?: string,
  group: TPropertyGroup,
}): React.Node {
  if (group.entries.length === 1) {
    return (
      <SingleDeclaration
        computedValue={computedValue}
        entry={group.entries[0]}
        property={group.property}
      />
    );
  }

  return (
    <GroupedDeclaration
      computedValue={computedValue}
      entries={group.entries}
      property={group.property}
    />
  );
}

function SingleDeclaration({
  computedValue,
  entry,
  property,
}: {
  computedValue?: string,
  entry: TDeclaration,
  property: string,
}): React.Node {
  const value = entry.value + (entry.important ? ' !important' : '');
  const computedTitle = computedValue ? computedValue.trim() : '';
  const line: React.Node = (
    <>
      <span
        {...stylex.props(styles.declProperty)}
        title={computedTitle || undefined}
      >
        {property}
      </span>
      {`: ${value}`}
    </>
  );

  return (
    <div {...stylex.props(styles.declRow)}>
      <div {...stylex.props(styles.declLine, styles.declText)}>{line}</div>
      {entry.className ? (
        <span {...stylex.props(styles.className)}>{entry.className}</span>
      ) : null}
    </div>
  );
}

function GroupedDeclaration({
  computedValue,
  entries,
  property,
}: {
  computedValue?: string,
  entries: $ReadOnlyArray<TDeclaration>,
  property: string,
}): React.Node {
  const nodes = buildConditionNodes(entries);
  const computedTitle = computedValue ? computedValue.trim() : '';
  const line: React.Node = (
    <>
      <span
        {...stylex.props(styles.declProperty)}
        title={computedTitle || undefined}
      >
        {property}
      </span>
      :
    </>
  );

  return (
    <div {...stylex.props(styles.declGroup)}>
      <div {...stylex.props(styles.declLine, styles.declText)}>{line}</div>
      <ConditionList depth={0} nodes={nodes} />
    </div>
  );
}

function ConditionList({
  depth,
  nodes,
}: {
  depth: number,
  nodes: $ReadOnlyArray<TConditionNode>,
}): React.Node {
  if (nodes.length === 0) return null;
  const listStyle = depth === 0 ? styles.declSubList : styles.atRuleList;

  return (
    <div {...stylex.props(listStyle)}>
      {nodes.map((node) => (
        <ConditionNode depth={depth} key={node.key} node={node} />
      ))}
    </div>
  );
}

function ConditionNode({
  depth,
  node,
}: {
  depth: number,
  node: TConditionNode,
}): React.Node {
  const displayNode = collapseDefaultChild(node);
  const label = displayNode.label;
  const isAtRule = isAtRuleLabel(label);
  const hasEntries = displayNode.entries.length > 0;
  const hasChildren = displayNode.children.length > 0;
  const formattedLabel = label !== '' ? formatConditionLabel(label) : null;
  const shouldInlineAtRule = isAtRule && hasEntries && !hasChildren;
  const showLabel = isAtRule && formattedLabel != null && !shouldInlineAtRule;
  const labelText = isAtRule
    ? shouldInlineAtRule
      ? formattedLabel
      : null
    : formattedLabel;

  return (
    <div {...stylex.props(isAtRule && styles.atRuleGroup)}>
      {showLabel ? (
        <div {...stylex.props(styles.atRuleTitle)}>
          <span {...stylex.props(styles.declCondition)}>{formattedLabel}</span>
        </div>
      ) : null}
      {displayNode.entries.length > 0 ? (
        <DeclarationEntries entries={displayNode.entries} label={labelText} />
      ) : null}
      {displayNode.children.length > 0 ? (
        <ConditionList depth={depth + 1} nodes={displayNode.children} />
      ) : null}
    </div>
  );
}

function DeclarationEntries({
  entries,
  label,
}: {
  entries: $ReadOnlyArray<TDeclaration>,
  label: string | null,
}): React.Node {
  return entries.map((entry, index) => {
    const value = entry.value + (entry.important ? ' !important' : '');
    const content: React.Node = label ? (
      <>
        <span {...stylex.props(styles.declCondition)}>{label}</span>
        {`: ${value}`}
      </>
    ) : (
      value
    );
    return (
      <div
        {...stylex.props(styles.declRow)}
        key={`${entry.property}:${String(entry.className ?? '')}:${index}`}
      >
        <div {...stylex.props(styles.declSubLine, styles.declText)}>
          {content}
        </div>
        {entry.className ? (
          <span {...stylex.props(styles.className)}>{entry.className}</span>
        ) : null}
      </div>
    );
  });
}

const styles = stylex.create({
  muted: {
    color: colors.textMuted,
  },
  declList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    paddingBlock: 8,
  },
  declRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  declText: {
    flex: 1,
    minWidth: 0,
  },
  declLine: {
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  declProperty: {
    color: colors.textAccent,
  },
  declGroup: {
    display: 'grid',
    gap: 4,
  },
  declSubList: {
    display: 'grid',
    gap: 2,
    paddingLeft: 12,
  },
  declSubLine: {
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  declCondition: {
    color: colors.secondaryAccent,
  },
  pseudoSection: {
    display: 'grid',
    gap: 6,
  },
  pseudoTitle: {
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    color: colors.textMuted,
  },
  sectionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  atRuleGroup: {
    display: 'grid',
    gap: 2,
  },
  atRuleTitle: {
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
  },
  atRuleList: {
    display: 'grid',
    gap: 2,
    paddingLeft: 12,
  },
  className: {
    color: colors.textMuted,
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    '::before': {
      content: '.',
    },
  },
});
