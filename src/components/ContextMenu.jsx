import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const ContextMenu = ({ visible, x, y, hasSelection, hasClipboard, onCopy, onPaste, onDelete, onClose, onZOrder }) => {
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
            label: '重ね順(A)',
            disabled: !hasSelection,
            children: [
                {
                    label: '最前面へ',
                    onClick: () => { onZOrder('front'); onClose(); }
                },
                {
                    label: '前面へ',
                    onClick: () => { onZOrder('forward'); onClose(); }
                },
                {
                    label: '背面へ',
                    onClick: () => { onZOrder('backward'); onClose(); }
                },
                {
                    label: '最背面へ',
                    onClick: () => { onZOrder('back'); onClose(); }
                }
            ]
        },
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

    return ReactDOM.createPortal(
        <div
            ref={menuRef}
            className="context-menu"
            style={{ left: x, top: y, position: 'fixed' }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {menuItems.map((item, index) => {
                if (item.type === 'separator') {
                    return <div key={index} className="context-menu-separator" />;
                }

                const hasChildren = item.children && item.children.length > 0;

                return (
                    <div
                        key={index}
                        className={`context-menu-item ${item.disabled ? 'disabled' : ''}`}
                        onClick={(e) => {
                            if (item.disabled) return;
                            if (hasChildren) {
                                if (item.onClick) item.onClick();
                                return;
                            }
                            item.onClick();
                        }}
                    >
                        <span className="context-menu-label">{item.label}</span>
                        {item.shortcut && <span className="context-menu-shortcut">{item.shortcut}</span>}
                        {hasChildren && <span className="context-menu-arrow">▶</span>}

                        {hasChildren && (
                            <div className="context-menu-submenu">
                                {item.children.map((child, childIndex) => (
                                    <div
                                        key={childIndex}
                                        className={`context-menu-item ${child.disabled ? 'disabled' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent parent click
                                            if (child.disabled) return;
                                            if (child.onClick) {
                                                child.onClick();
                                            }
                                        }}
                                    >
                                        <span className="context-menu-label">{child.label}</span>
                                        {child.shortcut && <span className="context-menu-shortcut">{child.shortcut}</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>,
        document.body
    );
};

export default ContextMenu;
