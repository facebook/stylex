/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import * as React from 'react';

let count = 0;

export default function useId() {
  const [id, setId] = React.useState(null);
  React.useEffect(() => {
    setId(`id-${++count}`);
  }, []);
  return id;
}
