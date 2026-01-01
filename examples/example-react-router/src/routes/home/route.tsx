/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import MainArticle from '../../components/MainArticle';

export default function Home() {
  return (
    <MainArticle>
      <h1>Welcome to React Router RSC</h1>
      <p>
        This is a simple example of a React Router application using React
        Server Components (RSC) with Vite. It demonstrates how to set up a basic
        routing structure and render components server-side.
      </p>
    </MainArticle>
  );
}
