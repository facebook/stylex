/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { ThemedComponent } from '@docusaurus/theme-common';
export default function ThemedImage(props) {
  const { sources, ...propsRest } = props;
  return (
    <ThemedComponent>
      {({ theme }) => <img src={sources[theme]} {...propsRest} />}
    </ThemedComponent>
  );
}
