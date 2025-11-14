/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import Logo from '@theme-original/Logo';
import LogoDownloadModal from '../../../components/LogoDownloadModal';

export default function LogoWrapper(props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <>
      <Logo {...props} onContextMenu={handleContextMenu} />
      <LogoDownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
