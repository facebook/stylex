/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function DevStyleXInject({ cssHref }: { cssHref: string }) {
  return import.meta.env.DEV ? (
    <link href="/virtual:stylex.css" rel="stylesheet" />
  ) : (
    <link href={cssHref} rel="stylesheet" />
  );
}
