import React, { useState } from 'react';
import Logo from '@theme-original/Logo';
import * as stylex from '@stylexjs/stylex';
import LogoDownloadModal from '../../../components/LogoDownloadModal';

const styles = stylex.create({
    logoWrapper: {
        cursor: 'pointer',
        display: 'inline-block',
    },
});

export default function LogoWrapper(props) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    return (
        <>
            <div {...stylex.props(styles.logoWrapper)} onClick={handleClick}>
                <Logo {...props} />
            </div>
            <LogoDownloadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
