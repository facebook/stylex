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

  type TSection = $ReadOnly<{
    propertyOrder: Array<string>,
    propertyToEntries: Map<string, Array<TDeclaration>>,
  }>;
  type TAtRuleGroup = $ReadOnly<{
    conditionOrder: Array<string>,
    conditionMap: Map<string, Array<TDeclaration>>,
  }>;

  const sectionOrder: Array<string> = [];
  const sectionMap = new Map<string, TSection>();

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

  if (sectionOrder.length === 0) {
    return (
      <div {...stylex.props(styles.muted)}>
        No matching StyleX CSS rules found for the selected element.
      </div>
    );
  }

  const baseIndex = sectionOrder.indexOf('');
  if (baseIndex > 0) {
    sectionOrder.splice(baseIndex, 1);
    sectionOrder.unshift('');
  }

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

  function renderConditionRows(
    keyPrefix: string,
    group: TAtRuleGroup,
  ): React.Node {
    const { conditionOrder, conditionMap } = group;
    const ordered = conditionOrder.slice();
    const defaultIndex = ordered.indexOf('default');
    if (defaultIndex > 0) {
      ordered.splice(defaultIndex, 1);
      ordered.unshift('default');
    }
    return ordered.map((condition) => {
      const bucket = conditionMap.get(condition) ?? [];
      const label = condition === 'default' ? 'default' : `'${condition}'`;
      return bucket.map((entry, index) => {
        const value = entry.value + (entry.important ? ' !important' : '');
        return (
          <div
            key={`${keyPrefix}:${condition}:${index}`}
            {...stylex.props(styles.declRow)}
          >
            <div {...stylex.props(styles.declSubLine, styles.declText)}>
              <span {...stylex.props(styles.declCondition)}>{label}</span>:{' '}
              {value}
            </div>
            {entry.className ? (
              <span {...stylex.props(styles.className)}>{entry.className}</span>
            ) : null}
          </div>
        );
      });
    });
  }

  function renderProperties(sectionKey: string, section: TSection): React.Node {
    const { propertyOrder, propertyToEntries } = section;
    return propertyOrder.map((property) => {
      const entries = propertyToEntries.get(property) ?? [];
      const computedValue = computed[property];
      const computedTitle = computedValue ? computedValue.trim() : '';
      if (entries.length === 1) {
        const entry = entries[0];
        const value = entry.value + (entry.important ? ' !important' : '');
        return (
          <div
            key={`${sectionKey}:${property}`}
            {...stylex.props(styles.declRow)}
          >
            <div {...stylex.props(styles.declLine, styles.declText)}>
              <span
                {...stylex.props(styles.declProperty)}
                title={computedTitle || undefined}
              >
                {property}
              </span>
              : {value}
            </div>
            {entry.className ? (
              <span {...stylex.props(styles.className)}>{entry.className}</span>
            ) : null}
          </div>
        );
      }

      const atRuleOrder: Array<string> = [];
      const atRuleMap = new Map<string, TAtRuleGroup>();
      for (const entry of entries) {
        const parts = getConditionParts(entry);
        const atRules = [];
        const otherParts = [];
        for (const part of parts) {
          if (part.startsWith('@')) {
            atRules.push(part);
          } else if (part) {
            otherParts.push(part);
          }
        }
        const atRuleKey = atRules.join(', ');
        const conditionKey =
          otherParts.length > 0 ? otherParts.join(', ') : 'default';
        let group = atRuleMap.get(atRuleKey);
        if (group == null) {
          group = { conditionOrder: [], conditionMap: new Map() };
          atRuleMap.set(atRuleKey, group);
          atRuleOrder.push(atRuleKey);
        }
        const bucket = group.conditionMap.get(conditionKey);
        if (bucket == null) {
          group.conditionOrder.push(conditionKey);
          group.conditionMap.set(conditionKey, [entry]);
        } else {
          bucket.push(entry);
        }
      }
      const baseAtRuleIndex = atRuleOrder.indexOf('');
      if (baseAtRuleIndex > 0) {
        atRuleOrder.splice(baseAtRuleIndex, 1);
        atRuleOrder.unshift('');
      }

      return (
        <div
          key={`${sectionKey}:${property}`}
          {...stylex.props(styles.declGroup)}
        >
          <div {...stylex.props(styles.declLine, styles.declText)}>
            <span
              {...stylex.props(styles.declProperty)}
              title={computedTitle || undefined}
            >
              {property}
            </span>
            :
          </div>
          <div {...stylex.props(styles.declSubList)}>
            {atRuleOrder.map((atRuleKey) => {
              const group = atRuleMap.get(atRuleKey);
              if (!group) return null;
              if (atRuleKey === '') {
                return (
                  <React.Fragment key={`${sectionKey}:${property}:base`}>
                    {renderConditionRows(
                      `${sectionKey}:${property}:base`,
                      group,
                    )}
                  </React.Fragment>
                );
              }
              return (
                <div
                  key={`${sectionKey}:${property}:${atRuleKey}`}
                  {...stylex.props(styles.atRuleGroup)}
                >
                  <div {...stylex.props(styles.atRuleTitle)}>
                    <span {...stylex.props(styles.declCondition)}>
                      {`'${atRuleKey}'`}
                    </span>
                  </div>
                  <div {...stylex.props(styles.atRuleList)}>
                    {renderConditionRows(
                      `${sectionKey}:${property}:${atRuleKey}`,
                      group,
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  }

  return (
    <div {...stylex.props(styles.declList)}>
      {sectionOrder.map((sectionKey) => {
        const section = sectionMap.get(sectionKey);
        if (!section) return null;
        if (sectionKey === '') {
          return (
            <React.Fragment key="base">
              {renderProperties('base', section)}
            </React.Fragment>
          );
        }
        return (
          <div key={sectionKey} {...stylex.props(styles.pseudoSection)}>
            <div {...stylex.props(styles.pseudoTitle)}>{sectionKey}</div>
            <div {...stylex.props(styles.sectionList)}>
              {renderProperties(sectionKey, section)}
            </div>
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
  declCondition: {
    color: colors.textMuted,
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
