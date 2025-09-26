/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
import { FC } from 'react';
import * as stylex from '@stylexjs/stylex';
import { cardStyles } from './Card.stylex';

type CardProps = {
  title: string;
  content: string;
  elevated?: boolean;
};

export const Card: FC<CardProps> = ({ title, content, elevated = false }) => {
  return (
    <div {...stylex.props(cardStyles.base, elevated && cardStyles.elevated)}>
      <h3 {...stylex.props(cardStyles.title)}>{title}</h3>
      <p {...stylex.props(cardStyles.content)}>{content}</p>
    </div>
  );
};
