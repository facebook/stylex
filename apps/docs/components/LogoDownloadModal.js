import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { useColorMode } from '@docusaurus/theme-common';

const styles = stylex.create({
    modal: {
        position: 'fixed',
        top: '60px',
        left: '20px',
        backgroundColor: 'var(--ifm-background-surface-color)',
        color: 'var(--ifm-font-color-base)',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        maxWidth: '250px',
        width: '100%',
        zIndex: 1000,
    },
    title: {
        fontSize: '18px',
        marginBottom: '16px',
        fontWeight: 'bold',
        color: 'var(--ifm-color-primary)',
    },
    section: {
        marginBottom: '16px',
    },
    sectionTitle: {
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: 'var(--ifm-color-emphasis-700)',
    },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        cursor: 'pointer',
        backgroundColor: 'var(--ifm-color-emphasis-200)',
        color: 'var(--ifm-font-color-base)',
        border: 'none',
        borderRadius: '4px',
        fontSize: '14px',
        transition: 'background-color 0.2s',
        ':hover': {
            backgroundColor: 'var(--ifm-color-emphasis-300)',
        },
    },
    icon: {
        marginRight: '8px',
        width: '16px',
        height: '16px',
        fill: 'currentColor',
    },
    closeButton: {
        marginTop: '16px',
        justifyContent: 'center',
        backgroundColor: 'var(--ifm-color-emphasis-300)',
        ':hover': {
            backgroundColor: 'var(--ifm-color-emphasis-400)',
        },
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

    if (!isOpen) return null;

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

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert(`Copied ${text} to clipboard!`);
        });
    };

    return (
        <div {...stylex.props(styles.modal)}>
            <h2 {...stylex.props(styles.title)}>StyleX Resources</h2>
            <div {...stylex.props(styles.section)}>
                <h3 {...stylex.props(styles.sectionTitle)}>Dark Mode</h3>
                <div {...stylex.props(styles.buttonGroup)}>
                    <button
                        {...stylex.props(styles.button)}
                        onClick={() => downloadFile('img/stylex-logo-large-dark.svg')}
                    >
                        <DownloadIcon />
                        Logo SVG
                    </button>
                    <button
                        {...stylex.props(styles.button)}
                        onClick={() => copyToClipboard('#d6249f')}
                    >
                        <CopyIcon />
                        Copy Dark Mode Color
                    </button>
                </div>
            </div>
            <div {...stylex.props(styles.section)}>
                <h3 {...stylex.props(styles.sectionTitle)}>Light Mode</h3>
                <div {...stylex.props(styles.buttonGroup)}>
                    <button
                        {...stylex.props(styles.button)}
                        onClick={() => downloadFile('img/stylex-logo-large.svg')}
                    >
                        <DownloadIcon />
                        Logo SVG
                    </button>
                    <button
                        {...stylex.props(styles.button)}
                        onClick={() => copyToClipboard('#0866FF')}
                    >
                        <CopyIcon />
                        Copy Light Mode Color
                    </button>
                </div>
            </div>
            <button {...stylex.props(styles.button, styles.closeButton)} onClick={onClose}>
                Close
            </button>
        </div>
    );
}
