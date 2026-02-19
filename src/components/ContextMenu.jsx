import React, { useEffect, useRef } from 'react';

const ContextMenu = ({ visible, x, y, hasSelection, hasClipboard, onCopy, onPaste, onDelete, onClose }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        if (!visible) return;

        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        // 少し遅延させて、右クリックイベント自体で閉じないようにする
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [visible, onClose]);

    if (!visible) return null;

    const menuItems = [
        {
            label: 'コピー',
            shortcut: 'Ctrl+C',
            disabled: !hasSelection,
            onClick: () => { onCopy(); onClose(); }
        },
        {
            label: '貼り付け',
            shortcut: 'Ctrl+V',
            disabled: !hasClipboard,
            onClick: () => { onPaste(); onClose(); }
        },
        { type: 'separator' },
        {
            label: '削除',
            shortcut: 'Del',
            disabled: !hasSelection,
            onClick: () => { onDelete(); onClose(); }
        }
    ];

    return (
        <div
            ref={menuRef}
            className="context-menu"
            style={{ left: x, top: y }}
        >
            {menuItems.map((item, index) => {
                if (item.type === 'separator') {
                    return <div key={index} className="context-menu-separator" />;
                }
                return (
                    <div
                        key={index}
                        className={`context-menu-item ${item.disabled ? 'disabled' : ''}`}
                        onClick={item.disabled ? undefined : item.onClick}
                    >
                        <span className="context-menu-label">{item.label}</span>
                        <span className="context-menu-shortcut">{item.shortcut}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default ContextMenu;
