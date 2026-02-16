import React from 'react';
import { Group, Circle, Rect, Text } from 'react-konva';

const StampItem = ({ 
  item, 
  isSelected, 
  onSelect, 
  onChange 
}) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  // 形状に応じた矩形サイズ計算
  const getShapeProps = () => {
    if (item.shape === 'square') {
      const digits = String(item.number).length;
      const widthFactor = Math.max(1.0, 0.6 + digits * 0.4);
      const width = item.radius * 2 * widthFactor;
      const height = item.radius * 2 * 0.65;
      return {
        width,
        height,
        offsetX: width / 2,
        offsetY: height / 2,
        cornerRadius: Math.min(width, height) * 0.2
      };
    } else {
       return {
         radius: item.radius
       };
    }
  };

  const shapeProps = getShapeProps();

  // フォントサイズ計算
  const getFontSize = () => {
    const digits = String(item.number).length;
    if (item.shape === 'square') {
      return item.radius * 2 * 0.6 * 0.6; // height * 0.6
    } else {
      let size = item.radius * 0.8;
      if (digits >= 4) size = item.radius * 0.55;
      else if (digits >= 3) size = item.radius * 0.65;
      else if (digits >= 2) size = item.radius * 0.75;
      return Math.max(size, 6);
    }
  };

  return (
    <Group
      id={item.id}
      x={item.x}
      y={item.y}
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
    >
      {/* 形状描画 */}
      {item.shape === 'square' ? (
        <Rect
          {...shapeProps}
          fill={item.color}
          shadowBlur={5}
        />
      ) : (
        <Circle
          {...shapeProps}
          fill={item.color}
          shadowBlur={5}
        />
      )}

      {/* 選択時の枠線 */}
      {isSelected && (
         item.shape === 'square' ? (
            <Rect
              {...shapeProps}
              stroke="yellow"
              strokeWidth={2}
              dash={[4, 4]}
            />
         ) : (
            <Circle
              {...shapeProps}
              stroke="yellow"
              strokeWidth={2}
              dash={[4, 4]}
            />
         )
      )}

      {/* テキスト */}
      <Text
        text={String(item.number)}
        fontSize={getFontSize()}
        fontStyle="bold"
        fontFamily="Arial"
        fill="white"
        align="center"
        verticalAlign="middle"
        width={item.shape === 'square' ? shapeProps.width : item.radius * 2}
        height={item.shape === 'square' ? shapeProps.height : item.radius * 2}
        offsetX={item.shape === 'square' ? shapeProps.width / 2 : item.radius}
        offsetY={item.shape === 'square' ? shapeProps.height / 2 : item.radius}
      />
      
      {/* 矢印操作ハンドル (選択時のみ) */}
      {isSelected && (
          <Circle
            x={0} // スタンプ中心
            y={0} 
            radius={6}
            fill="cyan"
            stroke="black"
            strokeWidth={1}
          />
      )}

    </Group>
  );
};

export default StampItem;
