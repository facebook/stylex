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

type Props = {
  children: React.Node,
  fallback?: React.Node | ((error: Error) => React.Node),
};

type State = {
  error: Error | null,
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  render(): React.Node {
    const { fallback, children } = this.props;
    if (this.state.error) {
      return typeof fallback === 'function'
        ? fallback(this.state.error)
        : (fallback ?? null);
    }
    return children;
  }
}
