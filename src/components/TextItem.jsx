import React, { useRef, useEffect } from 'react';
import { Text } from 'react-konva';

const TextItem = ({ item, isSelected, onSelect, onChange }) => {
    const shapeRef = useRef();

    return (
        <Text
            onClick={onSelect}
            onTap={onSelect}
            ref={shapeRef}
            {...item}
            draggable
            onDragEnd={(e) => {
                onChange({
                    ...item,
                    x: e.target.x(),
                    y: e.target.y(),
                });
            }}
            onTransformEnd={(e) => {
                const node = shapeRef.current;
                // update scale also
                onChange({
                    ...item,
                    x: node.x(),
                    y: node.y(),
                    rotation: node.rotation(),
                    scaleX: node.scaleX(),
                    scaleY: node.scaleY(),
                });
            }}
        />
    );
};

export default TextItem;
