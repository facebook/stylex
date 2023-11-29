/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import FeatureCard from './FeatureCard';

export default function FeaturePile() {
  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.grid)}>
        <FeatureCard
          emoji="🧗‍♂️"
          subtitle="Scale new heights without bundle sizes weighing you down"
          title="Scalable">
          <ul {...stylex.props(styles.ul)}>
            <li>Minimize CSS output with atomic CSS</li>
            <li>
              The CSS size plateaus even as the number of components grows
            </li>
            <li>
              Styles remain readable and maintainable within growing codebases
            </li>
          </ul>
        </FeatureCard>
        <FeatureCard
          emoji="🔮"
          style={styles.double}
          subtitle="You shouldn't need a crystal ball to know how an element is styled"
          title="Predictable">
          <ul {...stylex.props(styles.ul)}>
            <li>
              All styles are applied as class names applied directly on elements
            </li>
            <li>No specificity issues</li>
            <li>“The last style applied always wins!”</li>
          </ul>
        </FeatureCard>
        <FeatureCard
          emoji="🧩"
          subtitle="Merging styles shouldn't feel like a puzzle"
          title="Composable">
          <ul {...stylex.props(styles.ul)}>
            <li>Apply styles conditionally</li>
            <li>
              Merge and compose arbitrary styles across component and file
              boundaries
            </li>
            <li>
              Use local constants and expressions to keep your styles DRY
              <ul {...stylex.props(styles.ul)}>
                <li>Or repeat yourself without worrying about performance</li>
              </ul>
            </li>
          </ul>
        </FeatureCard>
        <FeatureCard
          emoji="🏎️"
          style={styles.smallOnLarge}
          subtitle="Dynamic at the speed of static, because it is static"
          title="Fast">
          <ul {...stylex.props(styles.ul)}>
            <li>No runtime style injection</li>
            <li>All styles are bundled in a static CSS file at compile-time</li>
            <li>Optimized runtime for merging class names</li>
          </ul>
        </FeatureCard>
        <FeatureCard
          emoji="🥽"
          style={styles.small}
          subtitle="More safety than just your eyes"
          title="Type-Safe">
          <ul {...stylex.props(styles.ul)}>
            <li>Type-safe APIs</li>
            <li>Type-safe styles</li>
            <li>Type-safe themes</li>
          </ul>
        </FeatureCard>
      </div>
    </div>
  );
}

const styles = stylex.create({
  container: {
    width: '100%',
    containerType: 'inline-size',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr 1fr 1fr 1fr',
      '@container (min-width: 940.1px) and (max-width: 1230px)': '1fr 1fr 1fr',
      '@container (max-width: 940px)': '1fr',
    },
    gridAutoRows: '1fr',
    gap: 16,
    width: '100%',
    alignItems: 'center',
  },
  double: {
    gridColumn: {
      default: null,
      '@container (min-width: 940.1px)': 'span 2',
    },
    gridRow: null,
  },
  small: {
    gridColumn: null,
    gridRow: null,
  },
  smallOnLarge: {
    gridRow: {
      default: null,
      '@container (min-width: 940px) and (max-width: 1230px)': 'span 2',
    },
    gridColumn: null,
  },
  ul: {
    marginTop: '0.5rem',
    padding: 0,
    paddingInline: '1.2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    textAlign: 'left',
  },
});
