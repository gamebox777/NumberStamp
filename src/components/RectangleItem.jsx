import React from 'react';
import { Rect, Transformer } from 'react-konva';

const RectangleItem = ({ item, isSelected, onSelect, onChange }) => {
  const shapeRef = React.useRef();

  return (
    <>
      <Rect
        ref={shapeRef}
        id={item.id}
        x={item.x}
        y={item.y}
        width={item.width}
        height={item.height}
        stroke={item.color}
        strokeWidth={item.strokeWidth || 2}
        fill={item.fill || 'transparent'}
        fillEnabled={true}
        rotation={item.rotation || 0}
        draggable={isSelected}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            ...item,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // スケールをリセットしてwidth/heightを更新
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...item,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
            scaleX: 1,
            scaleY: 1
          });
        }}
      />
    </>
  );
};

export default RectangleItem;
