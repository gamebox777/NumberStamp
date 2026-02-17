import React from 'react';
import './Tooltip.css';

const Tooltip = ({ text, children, className = '', style = {}, position = 'top' }) => {
    if (!text) return children;

    return (
        <div className={`tooltip-container ${className}`} style={style}>
            {children}
            <span className={`tooltip-text tooltip-${position}`}>{text}</span>
        </div>
    );
};

export default Tooltip;
