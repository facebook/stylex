import React, { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import LogoDownloadModal from './LogoDownloadModal';

const styles = stylex.create({
    logo: {
        cursor: 'context-menu',
    },
});

export default function CustomLogo(props) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleContextMenu = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    return (
        <>
            <img
                {...props}
                {...stylex.props(styles.logo)}
                onContextMenu={handleContextMenu}
            />
            <LogoDownloadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
