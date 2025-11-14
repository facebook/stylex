/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Footer from '@theme-original/Footer';
//import { Analytics } from '@vercel/analytics/react';

export default function FooterWrapper(props) {
  return (
    <>
      <Footer {...props} />
      {/*<Analytics />*/}
    </>
  );
}
