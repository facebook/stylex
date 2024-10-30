/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import React, { useRef, useEffect } from 'react';
import * as stylex from '@stylexjs/stylex';
import { useColorMode } from '@docusaurus/theme-common';

const styles = stylex.create({
    dialog: {
        position: 'fixed',
        top: 60,
        left: 20,
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        maxWidth: '16.25rem',
        maxHeight: '80vh',
        width: '90%',
        borderStyle: 'none',
        boxSizing: 'border-box',
        margin: 0,
        overflowY: 'auto',
        '::backdrop': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
    },
    dialogLight: {
        backgroundColor: 'var(--ifm-background-surface-color)',
        color: 'var(--ifm-font-color-base)',
    },
    dialogDark: {
        backgroundColor: 'var(--bg2)',
        color: '#FFFFFF',
    },
    section: {
        marginBottom: '16px',
    },
    sectionTitle: {
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '8px',
    },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '12px 16px',
        cursor: 'pointer',
        backgroundColor: {
            default: 'var(--ifm-background-color)',
            ':hover': 'var(--ifm-color-primary-light)',
        },
        color: {
            default: 'var(--ifm-font-color-base)',
            ':hover': '#FFFFFF',
        },
        borderRadius: '4px',
        fontSize: '14px',
        transition: 'background-color 0.2s, color 0.2s',
        border: 'none',
        width: '100%',
        marginBottom: '8px',
    },
    icon: {
        marginRight: '8px',
        width: '16px',
        height: '16px',
        fill: 'currentColor',
    },
});

const DownloadIcon = () => (
    <svg viewBox="0 0 24 24" {...stylex.props(styles.icon)}>
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </svg>
);

const CopyIcon = () => (
    <svg viewBox="0 0 24 24" {...stylex.props(styles.icon)}>
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
    </svg>
);

export default function LogoDownloadModal({ isOpen, onClose }) {
    const { colorMode } = useColorMode();
    const dialogRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen]);

    useEffect(() => {
        const dialog = dialogRef.current;
        const handleClick = (event) => {
            if (event.target === dialog) {
                onClose();
            }
        };

        dialog?.addEventListener('click', handleClick);
        return () => dialog?.removeEventListener('click', handleClick);
    }, [onClose]);

    const downloadFile = (url) => {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = url.split('/').pop();
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
    };

    const copySvgCode = async (url) => {
        try {
            const response = await fetch(url);
            const svgText = await response.text();
            navigator.clipboard.writeText(svgText);
        } catch (error) {
            console.error('Failed to copy SVG:', error);
        }
    };

    return (
        <dialog
            {...stylex.props(
                styles.dialog,
                colorMode === 'dark' ? styles.dialogDark : styles.dialogLight
            )}
            onClose={onClose}
            ref={dialogRef}
        >
            <div {...stylex.props(styles.section)}>
                <h3 {...stylex.props(styles.sectionTitle)}>Dark Mode</h3>
                <div {...stylex.props(styles.buttonGroup)}>
                    <button
                        {...stylex.props(styles.button)}
                        onClick={() => downloadFile('/img/stylex-logo-large-dark.svg')}
                    >
                        <DownloadIcon />
                        Logo SVG
                    </button>
                    <button
                        {...stylex.props(styles.button)}
                        onClick={() => copySvgCode('/img/stylex-logo-large-dark.svg')}
                    >
                        <CopyIcon />
                        Copy SVG Code
                    </button>
                </div>
            </div>
            <div {...stylex.props(styles.section)}>
                <h3 {...stylex.props(styles.sectionTitle)}>Light Mode</h3>
                <div {...stylex.props(styles.buttonGroup)}>
                    <button
                        {...stylex.props(styles.button)}
                        onClick={() => downloadFile('/img/stylex-logo-large-light.svg')}
                    >
                        <DownloadIcon />
                        Logo SVG
                    </button>
                    <button
                        {...stylex.props(styles.button)}
                        onClick={() => copySvgCode('/img/stylex-logo-large-light.svg')}
                    >
                        <CopyIcon />
                        Copy SVG Code
                    </button>
                </div>
            </div>
            <div {...stylex.props(styles.section)}>
                <h3 {...stylex.props(styles.sectionTitle)}>Assets</h3>
                <div {...stylex.props(styles.buttonGroup)}>
                    <button
                        {...stylex.props(styles.button)}
                        onClick={() => downloadFile('img/stylex-cover-photo.png')}
                    >
                        <DownloadIcon />
                        Cover Photo
                    </button>
                </div>
            </div>
        </dialog>
    );
}
