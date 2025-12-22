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
import type { AtomicStyleRule, StylexOverride } from '../../types.js';
import {
  swapClassName,
  setInlineStyle,
  clearInlineStyle,
  setStylexOverrides,
} from '../../devtools/overrides.js';

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

type TOverrideValue = {
  value: string,
  important: boolean,
};

type TOverridesByEntry = { [string]: TOverrideValue, ... };

type TOverrideUpdater = (override: StylexOverride) => Promise<void>;

type TOverrideRemover = (id: string) => Promise<void>;

type TClassOverrideMap = { [string]: StylexOverride, ... };

type TAtomicValueIndex = {
  values: Array<string>,
  valueToClassName: { [string]: string, ... },
};

type TAtomicIndex = { [string]: TAtomicValueIndex, ... };

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

function isDefaultLabel(label: string): boolean {
  return label.trim() === 'default';
}

function collapseDefaultChild(node: TConditionNode): TConditionNode {
  if (node.children.length !== 1) return node;
  const child = node.children[0];
  if (!isDefaultLabel(child.label)) return node;
  return {
    ...node,
    entries: [...node.entries, ...child.entries],
    children: child.children,
  };
}

function formatValue(value: string, important: boolean): string {
  return important ? `${value} !important` : value;
}

function parseValueInput(raw: string): TOverrideValue {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { value: '', important: false };
  }
  if (!/\s!important\s*$/i.test(trimmed)) {
    return { value: trimmed, important: false };
  }
  return {
    value: trimmed.replace(/\s!important\s*$/i, '').trim(),
    important: true,
  };
}

function buildInlineOverrideId(
  property: string,
  pseudoElement?: string,
): string {
  return ['inline', property, pseudoElement ?? ''].join('::');
}

function buildClassOverrideId(originalClassName: string): string {
  return `class::${originalClassName}`;
}

function createInlineOverride(
  entry: TDeclaration,
  override: TOverrideValue,
  entryKey: string,
): StylexOverride {
  const conditions = getConditionParts(entry);
  const base: StylexOverride = {
    id: buildInlineOverrideId(entry.property, entry.pseudoElement),
    kind: 'inline',
    property: entry.property,
    value: override.value,
    important: override.important,
    conditions,
    sourceEntryKey: entryKey,
  };
  return entry.pseudoElement
    ? { ...base, pseudoElement: entry.pseudoElement }
    : base;
}

function createClassOverride(
  entry: TDeclaration,
  override: TOverrideValue,
  entryKey: string,
  nextClassName: string,
  originalClassNameOverride?: string,
): StylexOverride {
  const originalClassName = originalClassNameOverride ?? entry.className ?? '';
  const conditions = getConditionParts(entry);
  const base: StylexOverride = {
    id: buildClassOverrideId(originalClassName),
    kind: 'class',
    property: entry.property,
    value: override.value,
    important: override.important,
    conditions,
    className: nextClassName,
    originalClassName,
    sourceEntryKey: entryKey,
  };
  return entry.pseudoElement
    ? { ...base, pseudoElement: entry.pseudoElement }
    : base;
}

function upsertOverride(
  overrides: $ReadOnlyArray<StylexOverride>,
  nextOverride: StylexOverride,
): Array<StylexOverride> {
  const index = overrides.findIndex((item) => item.id === nextOverride.id);
  if (index === -1) {
    return [...overrides, nextOverride];
  }
  return overrides.map((item) =>
    item.id === nextOverride.id ? nextOverride : item,
  );
}

function removeOverride(
  overrides: $ReadOnlyArray<StylexOverride>,
  id: string,
): Array<StylexOverride> {
  return overrides.filter((item) => item.id !== id);
}

function overridesToEntryMap(
  overrides: $ReadOnlyArray<StylexOverride>,
): TOverridesByEntry {
  return overrides.reduce(
    (acc, override) =>
      override.kind === 'inline' && override.sourceEntryKey
        ? {
            ...acc,
            [override.sourceEntryKey]: {
              value: override.value,
              important: override.important,
            },
          }
        : acc,
    {},
  );
}

function buildClassOverrideMap(
  overrides: $ReadOnlyArray<StylexOverride>,
): TClassOverrideMap {
  return overrides.reduce(
    (acc, override) =>
      override.kind === 'class' && override.className
        ? { ...acc, [override.className]: override }
        : acc,
    {},
  );
}

function buildPropertyValues(rules: $ReadOnlyArray<AtomicStyleRule>): {
  [string]: Array<string>,
  ...
} {
  return rules.reduce((acc, rule) => {
    const displayValue = formatValue(rule.value, rule.important);
    const key = rule.property.toLowerCase();
    const existing = acc[key] ?? [];
    const values = existing.includes(displayValue)
      ? existing
      : [...existing, displayValue];
    return { ...acc, [key]: values };
  }, {});
}

function filterSuggestions(
  values: $ReadOnlyArray<string>,
  query: string,
): Array<string> {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered =
    normalizedQuery === ''
      ? values
      : values.filter((value) => value.toLowerCase().includes(normalizedQuery));
  return filtered.slice(0, 8);
}

function getNextIndex(current: number, delta: number, length: number): number {
  if (length === 0) return -1;
  if (current === -1) {
    return delta > 0 ? 0 : length - 1;
  }
  return (current + delta + length) % length;
}

function normalizeConditions(conditions: Array<string>): Array<string> {
  return conditions
    .map((condition) => condition.trim())
    .filter(Boolean)
    .reduce(
      (acc, condition) => (acc.includes(condition) ? acc : [...acc, condition]),
      [],
    );
}

function buildConditionKey(conditions: Array<string>): string {
  return normalizeConditions(conditions).join('||');
}

function buildAtomicKey(
  property: string,
  conditions: Array<string>,
  pseudoElement?: string,
): string {
  return [property, pseudoElement ?? '', buildConditionKey(conditions)].join(
    '::',
  );
}

function buildEntryKey(entry: TDeclaration): string {
  const conditions = getConditionParts(entry);
  return [
    entry.className ?? '',
    entry.property,
    entry.pseudoElement ?? '',
    buildConditionKey(conditions),
  ].join('::');
}

function buildAtomicIndex(
  rules: $ReadOnlyArray<AtomicStyleRule>,
): TAtomicIndex {
  const empty: TAtomicIndex = {};
  return rules.reduce((acc, rule) => {
    const key = buildAtomicKey(
      rule.property,
      rule.conditions,
      rule.pseudoElement,
    );
    const displayValue = formatValue(rule.value, rule.important);
    const existing = acc[key];
    const existingValues = existing?.values ?? [];
    const existingMap = existing?.valueToClassName ?? {};
    const values = existingValues.includes(displayValue)
      ? existingValues
      : [...existingValues, displayValue];
    const valueToClassName = existingMap[displayValue]
      ? existingMap
      : { ...existingMap, [displayValue]: rule.className };
    return {
      ...acc,
      [key]: {
        values,
        valueToClassName,
      },
    };
  }, empty);
}

function getAtomicGroupForEntry(
  atomicIndex: TAtomicIndex,
  entry: TDeclaration,
): ?TAtomicValueIndex {
  const key = buildAtomicKey(
    entry.property,
    getConditionParts(entry),
    entry.pseudoElement,
  );
  return atomicIndex[key];
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
        [],
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
    [],
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
  atomicRules,
  onRefresh,
  overrides,
}: {
  classes: $ReadOnlyArray<
    $ReadOnly<{
      name: string,
      declarations: $ReadOnlyArray<TDeclaration>,
      ...
    }>,
  >,
  computed: { [string]: string, ... },
  atomicRules: $ReadOnlyArray<AtomicStyleRule>,
  onRefresh: () => void,
  overrides: $ReadOnlyArray<StylexOverride>,
}): React.Node {
  const atomicIndex = React.useMemo(
    () => buildAtomicIndex(atomicRules),
    [atomicRules],
  );
  const propertyValues = React.useMemo(
    () => buildPropertyValues(atomicRules),
    [atomicRules],
  );
  const overrideValues = React.useMemo(
    () => overridesToEntryMap(overrides),
    [overrides],
  );
  const classOverrides = React.useMemo(
    () => buildClassOverrideMap(overrides),
    [overrides],
  );
  const overridesRef = React.useRef(overrides);
  overridesRef.current = overrides;

  const persistOverrides = React.useCallback(
    async (nextOverrides: Array<StylexOverride>) => {
      overridesRef.current = nextOverrides;
      await setStylexOverrides(nextOverrides);
    },
    [],
  );

  const upsertOverrideEntry = React.useCallback(
    async (override: StylexOverride) => {
      const nextOverrides = upsertOverride(overridesRef.current, override);
      await persistOverrides(nextOverrides);
    },
    [persistOverrides],
  );
  const removeOverrideEntry = React.useCallback(
    async (id: string) => {
      const nextOverrides = removeOverride(overridesRef.current, id);
      await persistOverrides(nextOverrides);
    },
    [persistOverrides],
  );
  const handleAddOverride = React.useCallback(
    async (property: string, rawValue: string) => {
      const normalizedProperty = property.trim();
      if (!normalizedProperty) return;
      const parsed = parseValueInput(rawValue);
      if (!parsed.value) return;
      let didMutate = false;
      try {
        await setInlineStyle({
          property: normalizedProperty,
          value: parsed.value,
          important: parsed.important,
        });
        didMutate = true;
        await upsertOverrideEntry({
          id: buildInlineOverrideId(normalizedProperty),
          kind: 'inline',
          property: normalizedProperty,
          value: parsed.value,
          important: parsed.important,
          conditions: [],
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        if (didMutate) {
          onRefresh();
        }
      }
    },
    [onRefresh, upsertOverrideEntry],
  );
  const handleRemoveOverride = React.useCallback(
    async (override: StylexOverride) => {
      let didMutate = false;
      try {
        if (override.kind === 'inline') {
          await clearInlineStyle({ property: override.property });
          didMutate = true;
        }
        if (
          override.kind === 'class' &&
          override.className &&
          override.originalClassName
        ) {
          await swapClassName({
            from: override.className,
            to: override.originalClassName,
          });
          didMutate = true;
        }
        await removeOverrideEntry(override.id);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        if (didMutate) {
          onRefresh();
        }
      }
    },
    [onRefresh, removeOverrideEntry],
  );

  const sections = buildSections(classes);
  const hasSections = sections.length > 0;

  return (
    <div {...stylex.props(styles.declList)}>
      {hasSections ? (
        sections.map((section) => (
          <PseudoSection
            atomicIndex={atomicIndex}
            classOverrides={classOverrides}
            computed={computed}
            key={section.key || 'base'}
            onOverrideRemove={removeOverrideEntry}
            onOverrideUpsert={upsertOverrideEntry}
            onRefresh={onRefresh}
            overrideValues={overrideValues}
            section={section}
          />
        ))
      ) : (
        <div {...stylex.props(styles.muted)}>
          No matching StyleX CSS rules found for the selected element.
        </div>
      )}
      <OverridesSection
        onAddOverride={handleAddOverride}
        onRemoveOverride={handleRemoveOverride}
        overrides={overrides}
        propertyValues={propertyValues}
      />
    </div>
  );
}

function PseudoSection({
  atomicIndex,
  classOverrides,
  computed,
  onOverrideRemove,
  onOverrideUpsert,
  onRefresh,
  overrideValues,
  section,
}: {
  atomicIndex: TAtomicIndex,
  classOverrides: TClassOverrideMap,
  computed: { [string]: string, ... },
  onOverrideRemove: TOverrideRemover,
  onOverrideUpsert: TOverrideUpdater,
  onRefresh: () => void,
  overrideValues: TOverridesByEntry,
  section: TSection,
}): React.Node {
  if (section.key === '') {
    return (
      <PropertyList
        atomicIndex={atomicIndex}
        classOverrides={classOverrides}
        computed={computed}
        onOverrideRemove={onOverrideRemove}
        onOverrideUpsert={onOverrideUpsert}
        onRefresh={onRefresh}
        overrideValues={overrideValues}
        properties={section.properties}
      />
    );
  }
  return (
    <div {...stylex.props(styles.pseudoSection)}>
      <div {...stylex.props(styles.pseudoTitle)}>{section.key}</div>
      <PropertyList
        atomicIndex={atomicIndex}
        classOverrides={classOverrides}
        computed={computed}
        onOverrideRemove={onOverrideRemove}
        onOverrideUpsert={onOverrideUpsert}
        onRefresh={onRefresh}
        overrideValues={overrideValues}
        properties={section.properties}
      />
    </div>
  );
}

function PropertyList({
  atomicIndex,
  classOverrides,
  computed,
  onOverrideRemove,
  onOverrideUpsert,
  onRefresh,
  overrideValues,
  properties,
}: {
  atomicIndex: TAtomicIndex,
  classOverrides: TClassOverrideMap,
  computed: { [string]: string, ... },
  onOverrideRemove: TOverrideRemover,
  onOverrideUpsert: TOverrideUpdater,
  onRefresh: () => void,
  overrideValues: TOverridesByEntry,
  properties: $ReadOnlyArray<TPropertyGroup>,
}): React.Node {
  return (
    <div {...stylex.props(styles.sectionList)}>
      {properties.map((group) => (
        <PropertyGroup
          atomicIndex={atomicIndex}
          classOverrides={classOverrides}
          computedValue={computed[group.property]}
          group={group}
          key={group.property}
          onOverrideRemove={onOverrideRemove}
          onOverrideUpsert={onOverrideUpsert}
          onRefresh={onRefresh}
          overrideValues={overrideValues}
        />
      ))}
    </div>
  );
}

function PropertyGroup({
  atomicIndex,
  classOverrides,
  computedValue,
  group,
  onOverrideRemove,
  onOverrideUpsert,
  onRefresh,
  overrideValues,
}: {
  atomicIndex: TAtomicIndex,
  classOverrides: TClassOverrideMap,
  computedValue?: string,
  group: TPropertyGroup,
  onOverrideRemove: TOverrideRemover,
  onOverrideUpsert: TOverrideUpdater,
  onRefresh: () => void,
  overrideValues: TOverridesByEntry,
}): React.Node {
  if (group.entries.length === 1) {
    return (
      <SingleDeclaration
        atomicIndex={atomicIndex}
        classOverrides={classOverrides}
        computedValue={computedValue}
        entry={group.entries[0]}
        onOverrideRemove={onOverrideRemove}
        onOverrideUpsert={onOverrideUpsert}
        onRefresh={onRefresh}
        overrideValues={overrideValues}
        property={group.property}
      />
    );
  }

  return (
    <GroupedDeclaration
      atomicIndex={atomicIndex}
      classOverrides={classOverrides}
      computedValue={computedValue}
      entries={group.entries}
      onOverrideRemove={onOverrideRemove}
      onOverrideUpsert={onOverrideUpsert}
      onRefresh={onRefresh}
      overrideValues={overrideValues}
      property={group.property}
    />
  );
}

function SingleDeclaration({
  atomicIndex,
  classOverrides,
  computedValue,
  entry,
  onOverrideRemove,
  onOverrideUpsert,
  onRefresh,
  overrideValues,
  property,
}: {
  atomicIndex: TAtomicIndex,
  classOverrides: TClassOverrideMap,
  computedValue?: string,
  entry: TDeclaration,
  onOverrideRemove: TOverrideRemover,
  onOverrideUpsert: TOverrideUpdater,
  onRefresh: () => void,
  overrideValues: TOverridesByEntry,
  property: string,
}): React.Node {
  const computedTitle = computedValue ? computedValue.trim() : '';
  const prefix: React.Node = (
    <span
      {...stylex.props(styles.declProperty)}
      title={computedTitle || undefined}
    >
      {property}
    </span>
  );

  return (
    <DeclarationEntryRow
      atomicIndex={atomicIndex}
      classOverrides={classOverrides}
      entry={entry}
      isSubLine={false}
      onOverrideRemove={onOverrideRemove}
      onOverrideUpsert={onOverrideUpsert}
      onRefresh={onRefresh}
      overrideValues={overrideValues}
      prefix={prefix}
      showColon
    />
  );
}

function GroupedDeclaration({
  atomicIndex,
  classOverrides,
  computedValue,
  entries,
  onOverrideRemove,
  onOverrideUpsert,
  onRefresh,
  overrideValues,
  property,
}: {
  atomicIndex: TAtomicIndex,
  classOverrides: TClassOverrideMap,
  computedValue?: string,
  entries: $ReadOnlyArray<TDeclaration>,
  onOverrideRemove: TOverrideRemover,
  onOverrideUpsert: TOverrideUpdater,
  onRefresh: () => void,
  overrideValues: TOverridesByEntry,
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
      <ConditionList
        atomicIndex={atomicIndex}
        classOverrides={classOverrides}
        depth={0}
        nodes={nodes}
        onOverrideRemove={onOverrideRemove}
        onOverrideUpsert={onOverrideUpsert}
        onRefresh={onRefresh}
        overrideValues={overrideValues}
      />
    </div>
  );
}

function ConditionList({
  atomicIndex,
  classOverrides,
  depth,
  nodes,
  onOverrideRemove,
  onOverrideUpsert,
  onRefresh,
  overrideValues,
}: {
  atomicIndex: TAtomicIndex,
  classOverrides: TClassOverrideMap,
  depth: number,
  nodes: $ReadOnlyArray<TConditionNode>,
  onOverrideRemove: TOverrideRemover,
  onOverrideUpsert: TOverrideUpdater,
  onRefresh: () => void,
  overrideValues: TOverridesByEntry,
}): React.Node {
  if (nodes.length === 0) return null;
  const listStyle = depth === 0 ? styles.declSubList : styles.atRuleList;

  return (
    <div {...stylex.props(listStyle)}>
      {nodes.map((node) => (
        <ConditionNode
          atomicIndex={atomicIndex}
          classOverrides={classOverrides}
          depth={depth}
          key={node.key}
          node={node}
          onOverrideRemove={onOverrideRemove}
          onOverrideUpsert={onOverrideUpsert}
          onRefresh={onRefresh}
          overrideValues={overrideValues}
        />
      ))}
    </div>
  );
}

function ConditionNode({
  atomicIndex,
  classOverrides,
  node,
  onOverrideRemove,
  onOverrideUpsert,
  onRefresh,
  overrideValues,
  depth = 0,
}: {
  atomicIndex: TAtomicIndex,
  classOverrides: TClassOverrideMap,
  node: TConditionNode,
  onOverrideRemove: TOverrideRemover,
  onOverrideUpsert: TOverrideUpdater,
  onRefresh: () => void,
  overrideValues: TOverridesByEntry,
  depth: number,
}): React.Node {
  const collapsedNode = collapseDefaultChild(node);
  const displayNode =
    isAtRuleLabel(collapsedNode.label) &&
    collapsedNode.entries.length === 0 &&
    collapsedNode.children.length === 1 &&
    isDefaultLabel(collapsedNode.children[0].label)
      ? {
          ...collapsedNode,
          entries: collapsedNode.children[0].entries,
          children: collapsedNode.children[0].children,
        }
      : collapsedNode;
  const label = displayNode.label;
  const isAtRule = isAtRuleLabel(label);
  const hasEntries = displayNode.entries.length > 0;
  const formattedLabel = label !== '' ? formatConditionLabel(label) : null;
  const shouldInlineAtRule = isAtRule && hasEntries;
  const showLabel =
    isAtRule && formattedLabel != null && displayNode.entries.length === 0;
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
        <DeclarationEntries
          atomicIndex={atomicIndex}
          classOverrides={classOverrides}
          entries={displayNode.entries}
          label={labelText}
          onOverrideRemove={onOverrideRemove}
          onOverrideUpsert={onOverrideUpsert}
          onRefresh={onRefresh}
          overrideValues={overrideValues}
        />
      ) : null}
      {displayNode.children.length > 0 ? (
        <ConditionList
          atomicIndex={atomicIndex}
          classOverrides={classOverrides}
          depth={depth + 1}
          nodes={displayNode.children}
          onOverrideRemove={onOverrideRemove}
          onOverrideUpsert={onOverrideUpsert}
          onRefresh={onRefresh}
          overrideValues={overrideValues}
        />
      ) : null}
    </div>
  );
}

function DeclarationEntries({
  atomicIndex,
  classOverrides,
  entries,
  label,
  onOverrideRemove,
  onOverrideUpsert,
  onRefresh,
  overrideValues,
}: {
  atomicIndex: TAtomicIndex,
  classOverrides: TClassOverrideMap,
  entries: $ReadOnlyArray<TDeclaration>,
  label: string | null,
  onOverrideRemove: TOverrideRemover,
  onOverrideUpsert: TOverrideUpdater,
  onRefresh: () => void,
  overrideValues: TOverridesByEntry,
}): React.Node {
  const prefix = label ? (
    <span {...stylex.props(styles.declCondition)}>{label}</span>
  ) : null;
  const showColon = label != null;

  return entries.map((entry, index) => (
    <DeclarationEntryRow
      atomicIndex={atomicIndex}
      classOverrides={classOverrides}
      entry={entry}
      isSubLine
      key={`${entry.property}:${String(entry.className ?? '')}:${index}`}
      onOverrideRemove={onOverrideRemove}
      onOverrideUpsert={onOverrideUpsert}
      onRefresh={onRefresh}
      overrideValues={overrideValues}
      prefix={prefix}
      showColon={showColon}
    />
  ));
}

function DeclarationEntryRow({
  atomicIndex,
  classOverrides,
  entry,
  isSubLine,
  onOverrideRemove,
  onOverrideUpsert,
  onRefresh,
  overrideValues,
  prefix,
  showColon,
}: {
  atomicIndex: TAtomicIndex,
  classOverrides: TClassOverrideMap,
  entry: TDeclaration,
  isSubLine: boolean,
  onOverrideRemove: TOverrideRemover,
  onOverrideUpsert: TOverrideUpdater,
  onRefresh: () => void,
  overrideValues: TOverridesByEntry,
  prefix: React.Node | null,
  showColon: boolean,
}): React.Node {
  const entryKey = buildEntryKey(entry);
  const override = overrideValues[entryKey];
  const baseValue = formatValue(entry.value, entry.important);
  const displayValue = override
    ? formatValue(override.value, override.important)
    : baseValue;
  const existingClassOverride =
    entry.className && classOverrides[entry.className]
      ? classOverrides[entry.className]
      : null;
  const group = getAtomicGroupForEntry(atomicIndex, entry);
  const suggestions = group?.values ?? [];
  const valueToClassName = group?.valueToClassName ?? {};

  const [isEditing, setIsEditing] = React.useState(false);
  const [draftValue, setDraftValue] = React.useState(displayValue);
  const [isPending, setIsPending] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const listId = React.useId();

  React.useEffect(() => {
    if (!isEditing) {
      setDraftValue(displayValue);
    }
  }, [displayValue, isEditing]);

  const filteredSuggestions = React.useMemo(
    () => filterSuggestions(suggestions, draftValue),
    [draftValue, suggestions],
  );

  React.useEffect(() => {
    if (!isEditing || filteredSuggestions.length === 0) {
      setActiveIndex(-1);
      return;
    }
    setActiveIndex((prev) =>
      prev >= filteredSuggestions.length
        ? filteredSuggestions.length - 1
        : prev,
    );
  }, [filteredSuggestions, isEditing]);

  const commitChange = React.useCallback(
    async (nextValue?: string) => {
      if (isPending) {
        return;
      }
      const rawValue = nextValue ?? draftValue;
      const trimmed = rawValue.trim();
      const current = displayValue.trim();
      setIsEditing(false);
      if (trimmed === current) {
        return;
      }

      const parsed = parseValueInput(trimmed);
      const nextFormatted = formatValue(parsed.value, parsed.important);
      // $FlowFixMe[invalid-computed-prop]
      const nextClassName = valueToClassName[nextFormatted];

      setIsPending(true);
      let didMutate = false;
      try {
        if (parsed.value === '') {
          await clearInlineStyle({ property: entry.property });
          didMutate = true;
          await onOverrideRemove(
            buildInlineOverrideId(entry.property, entry.pseudoElement),
          );
          return;
        }

        if (nextClassName && entry.className) {
          const originalClassName =
            existingClassOverride?.originalClassName ?? entry.className;
          const shouldRemoveClassOverride =
            existingClassOverride != null &&
            nextClassName === originalClassName;

          if (nextClassName !== entry.className) {
            await swapClassName({ from: entry.className, to: nextClassName });
            didMutate = true;
          }
          await clearInlineStyle({ property: entry.property });
          didMutate = true;
          await onOverrideRemove(
            buildInlineOverrideId(entry.property, entry.pseudoElement),
          );
          if (shouldRemoveClassOverride) {
            await onOverrideRemove(existingClassOverride.id);
            return;
          }
          await onOverrideUpsert(
            createClassOverride(
              entry,
              parsed,
              entryKey,
              nextClassName,
              existingClassOverride?.originalClassName,
            ),
          );
          return;
        }

        await setInlineStyle({
          property: entry.property,
          value: parsed.value,
          important: parsed.important,
        });
        didMutate = true;
        await onOverrideUpsert(createInlineOverride(entry, parsed, entryKey));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        setIsPending(false);
        if (didMutate) {
          onRefresh();
        }
      }
    },
    [
      displayValue,
      draftValue,
      entry,
      entryKey,
      existingClassOverride,
      isPending,
      onOverrideRemove,
      onOverrideUpsert,
      onRefresh,
      valueToClassName,
    ],
  );

  const handleKeyDown = React.useCallback(
    (
      event: KeyboardEvent & {
        currentTarget: HTMLInputElement | HTMLButtonElement,
      },
    ) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (filteredSuggestions.length === 0) return;
        event.preventDefault();
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        setActiveIndex((prev) =>
          getNextIndex(prev, delta, filteredSuggestions.length),
        );
        return;
      }
      if (event.key === 'Enter') {
        const activeValue = filteredSuggestions[activeIndex];
        if (activeValue) {
          event.preventDefault();
          commitChange(activeValue);
          return;
        }
        event.preventDefault();
        // $FlowFixMe[prop-missing]
        event.currentTarget.blur();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsEditing(false);
        setDraftValue(displayValue);
        setActiveIndex(-1);
      }
    },
    [activeIndex, commitChange, displayValue, filteredSuggestions],
  );

  const lineStyle = isSubLine ? styles.declSubLine : styles.declLine;
  const prefixContent =
    prefix && showColon ? (
      <>
        {prefix}
        {': '}
      </>
    ) : (
      prefix
    );
  const hasSuggestions = filteredSuggestions.length > 0;
  const activeDescendant =
    activeIndex >= 0 && activeIndex < filteredSuggestions.length
      ? `${listId}-option-${activeIndex}`
      : undefined;

  return (
    <div {...stylex.props(styles.declRow)}>
      <div {...stylex.props(lineStyle, styles.declText)}>
        {prefixContent}
        {isEditing ? (
          <div {...stylex.props(styles.suggestionWrap)}>
            <input
              {...stylex.props(
                styles.valueInput,
                isPending && styles.valuePending,
              )}
              aria-activedescendant={activeDescendant}
              aria-autocomplete="list"
              aria-controls={hasSuggestions ? listId : undefined}
              aria-expanded={hasSuggestions}
              aria-haspopup="listbox"
              autoFocus
              disabled={isPending}
              onBlur={() => commitChange()}
              onChange={(event) => setDraftValue(event.currentTarget.value)}
              onKeyDown={handleKeyDown}
              role="combobox"
              spellCheck={false}
              value={draftValue}
            />
            <SuggestionsList
              activeIndex={activeIndex}
              listId={listId}
              onActiveIndexChange={setActiveIndex}
              onSelect={(value) => commitChange(value)}
              suggestions={filteredSuggestions}
            />
          </div>
        ) : (
          <button
            {...stylex.props(styles.valueButton)}
            onClick={() => setIsEditing(true)}
            type="button"
          >
            {displayValue}
          </button>
        )}
      </div>
      {entry.className ? (
        <span {...stylex.props(styles.className)}>{entry.className}</span>
      ) : null}
    </div>
  );
}

function OverridesSection({
  onAddOverride,
  onRemoveOverride,
  overrides,
  propertyValues,
}: {
  onAddOverride: (property: string, rawValue: string) => Promise<void> | void,
  onRemoveOverride: (override: StylexOverride) => Promise<void> | void,
  overrides: $ReadOnlyArray<StylexOverride>,
  propertyValues: { [string]: Array<string>, ... },
}): React.Node {
  return (
    <div {...stylex.props(styles.overridesSection)}>
      <div {...stylex.props(styles.overridesTitle)}>Overrides</div>
      {overrides.length === 0 ? (
        <div {...stylex.props(styles.muted)}>No overrides yet.</div>
      ) : (
        <div {...stylex.props(styles.overridesList)}>
          {overrides.map((override) => (
            <OverrideRow
              key={override.id}
              onRemove={onRemoveOverride}
              override={override}
            />
          ))}
        </div>
      )}
      <OverrideComposer
        onAddOverride={onAddOverride}
        propertyValues={propertyValues}
      />
    </div>
  );
}

function OverrideRow({
  onRemove,
  override,
}: {
  onRemove: (override: StylexOverride) => Promise<void> | void,
  override: StylexOverride,
}): React.Node {
  const [isPending, setIsPending] = React.useState(false);

  const handleRemove = React.useCallback(async () => {
    if (isPending) return;
    setIsPending(true);
    try {
      await onRemove(override);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }, [isPending, onRemove, override]);

  const value = formatValue(override.value, override.important);
  const line: React.Node = (
    <>
      <span {...stylex.props(styles.declProperty)}>{override.property}</span>
      {`: ${value}`}
    </>
  );

  return (
    <div {...stylex.props(styles.declRow)}>
      <div {...stylex.props(styles.declLine, styles.declText)}>{line}</div>
      <div {...stylex.props(styles.overrideMeta)}>
        {override.className ? (
          <span {...stylex.props(styles.className)}>{override.className}</span>
        ) : null}
        <button
          {...stylex.props(
            styles.overrideButton,
            isPending && styles.overrideButtonPending,
          )}
          disabled={isPending}
          onClick={handleRemove}
          type="button"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function OverrideComposer({
  onAddOverride,
  propertyValues,
}: {
  onAddOverride: (property: string, rawValue: string) => Promise<void> | void,
  propertyValues: { [string]: Array<string>, ... },
}): React.Node {
  const [property, setProperty] = React.useState('');
  const [value, setValue] = React.useState('');
  const [isPending, setIsPending] = React.useState(false);
  const [isValueFocused, setIsValueFocused] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const listId = React.useId();

  const normalizedProperty = property.trim().toLowerCase();
  const suggestions = normalizedProperty
    ? (propertyValues[normalizedProperty] ?? [])
    : [];
  const filteredSuggestions = React.useMemo(
    () => filterSuggestions(suggestions, value),
    [suggestions, value],
  );
  const showSuggestions = isValueFocused && filteredSuggestions.length > 0;

  React.useEffect(() => {
    if (!showSuggestions) {
      setActiveIndex(-1);
      return;
    }
    setActiveIndex((prev) =>
      prev >= filteredSuggestions.length
        ? filteredSuggestions.length - 1
        : prev,
    );
  }, [filteredSuggestions, showSuggestions]);

  const commitAdd = React.useCallback(
    async (nextValue?: string) => {
      if (isPending) return;
      const prop = property.trim();
      const next = (nextValue ?? value).trim();
      if (!prop || !next) return;
      setIsPending(true);
      try {
        await onAddOverride(prop, nextValue ?? value);
        setValue('');
      } finally {
        setIsPending(false);
      }
    },
    [isPending, onAddOverride, property, value],
  );

  const handleKeyDown = React.useCallback(
    (
      event: KeyboardEvent & {
        currentTarget: HTMLInputElement | HTMLButtonElement,
      },
    ) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (!showSuggestions) return;
        event.preventDefault();
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        setActiveIndex((prev) =>
          getNextIndex(prev, delta, filteredSuggestions.length),
        );
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const activeValue = filteredSuggestions[activeIndex];
        if (activeValue) {
          commitAdd(activeValue);
          return;
        }
        commitAdd();
      }
      if (event.key === 'Escape') {
        setActiveIndex(-1);
      }
    },
    [activeIndex, commitAdd, filteredSuggestions, showSuggestions],
  );

  return (
    <div {...stylex.props(styles.overrideComposer)}>
      <input
        {...stylex.props(styles.overrideInput)}
        onChange={(event) => setProperty(event.currentTarget.value)}
        placeholder="property"
        spellCheck={false}
        value={property}
      />
      <div {...stylex.props(styles.overrideValueWrap)}>
        <input
          {...stylex.props(styles.overrideInput)}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          aria-controls={showSuggestions ? listId : undefined}
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          onBlur={() => setIsValueFocused(false)}
          onChange={(event) => setValue(event.currentTarget.value)}
          onFocus={() => setIsValueFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="value"
          role="combobox"
          spellCheck={false}
          value={value}
        />
        <SuggestionsList
          activeIndex={activeIndex}
          listId={listId}
          onActiveIndexChange={setActiveIndex}
          onSelect={(nextValue) => commitAdd(nextValue)}
          suggestions={showSuggestions ? filteredSuggestions : []}
        />
      </div>
      <button
        {...stylex.props(
          styles.overrideButton,
          isPending && styles.overrideButtonPending,
        )}
        disabled={isPending || !property.trim() || !value.trim()}
        onClick={() => commitAdd()}
        type="button"
      >
        Add
      </button>
    </div>
  );
}

function SuggestionsList({
  activeIndex,
  listId,
  onActiveIndexChange,
  onSelect,
  suggestions,
}: {
  activeIndex: number,
  listId: string,
  onActiveIndexChange?: (index: number) => void,
  onSelect: (value: string) => void,
  suggestions: $ReadOnlyArray<string>,
}): React.Node {
  if (suggestions.length === 0) return null;
  return (
    <div {...stylex.props(styles.suggestionList)} id={listId} role="listbox">
      {suggestions.map((value, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            aria-selected={isActive}
            id={`${listId}-option-${index}`}
            key={value}
            role="option"
            {...stylex.props(
              styles.suggestionItem,
              isActive && styles.suggestionItemActive,
            )}
            onMouseDown={(event) => {
              event.preventDefault();
              onSelect(value);
            }}
            onMouseEnter={() => {
              if (onActiveIndexChange) {
                onActiveIndexChange(index);
              }
            }}
          >
            {value}
          </div>
        );
      })}
    </div>
  );
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
  overridesSection: {
    display: 'grid',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  overridesTitle: {
    fontWeight: 600,
    fontSize: 12,
  },
  overridesList: {
    display: 'grid',
    gap: 6,
  },
  overrideMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  overrideButton: {
    appearance: 'none',
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 6,
    paddingInline: 6,
    paddingBlock: 2,
    cursor: 'pointer',
    color: {
      default: colors.textPrimary,
      ':hover': colors.textAccent,
      ':focus-visible': colors.textAccent,
    },
    ':disabled': {
      opacity: 0.6,
      cursor: 'default',
    },
  },
  overrideButtonPending: {
    opacity: 0.6,
    cursor: 'default',
  },
  overrideComposer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  overrideInput: {
    fontFamily:
      'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
    fontSize: 12,
    lineHeight: '1.4',
    color: 'inherit',
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 4,
    paddingInline: 6,
    paddingBlock: 2,
    minWidth: 0,
    width: '100%',
    boxSizing: 'border-box',
    flex: 1,
  },
  overrideValueWrap: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
  },
  valueButton: {
    appearance: 'none',
    backgroundColor: 'transparent',
    borderStyle: 'none',
    padding: 0,
    margin: 0,
    color: {
      default: 'inherit',
      ':hover': colors.textAccent,
      ':focus-visible': colors.textAccent,
    },
    cursor: 'text',
    textAlign: 'left',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
  },
  valueInput: {
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    color: 'inherit',
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 4,
    paddingInline: 4,
    paddingBlock: 1,
    minWidth: 0,
    width: '100%',
    boxSizing: 'border-box',
  },
  valuePending: {
    opacity: 0.6,
  },
  suggestionWrap: {
    position: 'relative',
    width: '100%',
  },
  suggestionList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 2,
    marginTop: 4,
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 6,
    paddingBlock: 4,
    minWidth: '100%',
    maxHeight: 160,
    overflowY: 'auto',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.18)',
  },
  suggestionItem: {
    appearance: 'none',
    width: '100%',
    textAlign: 'left',
    borderStyle: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    paddingBlock: 4,
    paddingInline: 8,
    color: {
      default: colors.textPrimary,
      ':hover': colors.textAccent,
    },
    fontFamily: 'inherit',
    fontSize: 'inherit',
  },
  suggestionItemActive: {
    backgroundColor: colors.bg,
    color: colors.textAccent,
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
