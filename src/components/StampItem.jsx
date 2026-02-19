import React from 'react';
import { Group, Circle, Rect, Text } from 'react-konva';

const StampItem = ({
  item,
  isSelected,
  onSelect,
  onChange,
  opacity = 1,
  listening = true
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
      rotation={item.rotation || 0}
      scaleX={item.scaleX || 1}
      scaleY={item.scaleY || 1}
      draggable={isSelected}
      onClick={onSelect}
      onTap={onSelect}
      opacity={opacity}
      listening={listening}
      onDragMove={(e) => {
        if (e.target.id() === item.id) {
          onChange({
            ...item,
            x: e.target.x(),
            y: e.target.y(),
          });
        }
      }}
      onDragEnd={(e) => {
        // グループ自身のドラッグ終了時のみ座標更新
        // 子要素（矢印ハンドル）のドラッグがバブルしてくるのを防ぐためIDチェック
        if (e.target.id() === item.id) {
          onChange({
            ...item,
            x: e.target.x(),
            y: e.target.y(),
          });
        }
      }}
      onTransformEnd={(e) => {
        if (e.target.id() === item.id) {
          const node = e.target;
          const scaleX = node.scaleX();

          // 新しい値を計算
          // 現在のフォントサイズが未設定の場合は計算で求める
          const currentFontSize = item.stampFontSize || getFontSize();

          const newRadius = Math.max(10, Math.round(item.radius * scaleX));

          // 文字サイズ追従設定を確認 (デフォルトはtrue)
          const syncFontSize = item.stampSyncFontSize !== false;
          const newFontSize = syncFontSize
            ? Math.max(6, Math.round(currentFontSize * scaleX))
            : currentFontSize;

          // スケールをリセットして、実際のサイズ値を更新
          // これにより設定パネル上の数値も更新される
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...item,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: 1,
            scaleY: 1,
            radius: newRadius,
            stampFontSize: newFontSize
          });
        }
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
        fontSize={item.stampFontSize ? item.stampFontSize : getFontSize()}
        fontStyle="bold"
        fontFamily="Arial"
        fill={item.stampTextColor ? item.stampTextColor : "white"}
        align="center"
        verticalAlign="middle"
        width={item.shape === 'square' ? shapeProps.width : item.radius * 2}
        height={item.shape === 'square' ? shapeProps.height : item.radius * 2}
        offsetX={item.shape === 'square' ? shapeProps.width / 2 : item.radius}
        offsetY={item.shape === 'square' ? shapeProps.height / 2 : item.radius}
      />



    </Group>
  );
};

export default StampItem;
