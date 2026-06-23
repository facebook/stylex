/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as stylex from '@stylexjs/stylex';
import { Playground } from '@/components/Playground/DynamicPlayground';
import Footer from '@/components/Footer';
import { Seo } from '@/components/Seo';
import { vars } from '@/theming/vars.stylex';

export default function PlaygroundPage() {
  return (
    <>
      <title>Playground | StyleX</title>
      <Seo
        description="Try StyleX in your browser — edit styles and see the compiled output live."
        title="Playground"
      />
      <main {...stylex.props(styles.main)}>
        <Playground />
      </main>
      <Footer noBorderTop />
    </>
  );
}

const styles = stylex.create({
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    color: `${vars['--color-fd-foreground']}`,
    backgroundColor: `${vars['--color-fd-background']}`,
  },
});

export const getConfig = async () => {
  return {
    render: 'static',
  };
};
