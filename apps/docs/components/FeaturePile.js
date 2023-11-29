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
          subtitle="Atomic CSS for small bundles"
          title="Scalable"
          to="/docs/learn/#scalable">
          Scale new heights without being weighed down by the size of CSS
          bundles.
        </FeatureCard>
        <FeatureCard
          emoji="🔮"
          style={styles.double}
          subtitle="“The last style applied always wins”"
          title="Predictable"
          to="/docs/learn/#predictable">
          You shouldn't need a crystal ball to know what styles are applied on
          an element.
        </FeatureCard>
        <FeatureCard
          emoji="🧩"
          subtitle="Styles are data too"
          title="Composable"
          to="/docs/learn/#flexible--composable">
          Styles can be passed around as props, and merged deterministically. It
          all fits together.
        </FeatureCard>
        <FeatureCard
          emoji="🏎️"
          style={styles.smallOnLarge}
          subtitle="Ship a single static CSS file"
          title="Fast"
          to="/docs/learn/#static--fast">
          The StyleX compiler bundles styles into a static CSS file. No runtime
          style injection.
        </FeatureCard>
        <FeatureCard
          emoji="🥽"
          style={styles.small}
          subtitle="Strong types for all styles"
          title="Type-Safe"
          to="/docs/learn/#type-safe">
          Safety first! Static types catch common styling mistakes{' '}
          <em>before</em> they reach the browser.
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
});
