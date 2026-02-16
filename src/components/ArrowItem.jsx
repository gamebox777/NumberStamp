import React from 'react';
import { Arrow, Circle } from 'react-konva';

const ArrowItem = ({ item, stampX, stampY, isSelected, onHandleDrag }) => {
  if (!item.arrowEndPoint || (item.arrowEndPoint.x === 0 && item.arrowEndPoint.y === 0)) {
    return null;
  }

  // スタンプ中心から矢印終点までのベクトル計算
  const dx = item.arrowEndPoint.x;
  const dy = item.arrowEndPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length < item.radius) {
     return null; // スタンプに隠れる長さなら描画しない
  }

  // スタンプの縁から開始するためのオフセット計算
  const offsetX = (dx / length) * item.radius;
  const offsetY = (dy / length) * item.radius;

  // 絶対座標に変換
  const startX = stampX + offsetX;
  const startY = stampY + offsetY;
  const endX = stampX + dx;
  const endY = stampY + dy;

  return (
    <>
      <Arrow
        points={[startX, startY, endX, endY]}
        stroke={item.color}
        fill={item.color}
        strokeWidth={3}
        pointerLength={10}
        pointerWidth={10}
        lineCap="round"
        lineJoin="round"
      />
      
      {/* 矢印操作用ハンドル (選択時かつ矢印がある場合) */}
      {isSelected && (
        <Circle
            x={endX}
            y={endY}
            radius={8}
            fill="cyan"
            stroke="black"
            strokeWidth={1}
            draggable
            onDragEnd={(e) => {
                // 親のスタンプからの相対座標に戻して保存
                const newX = e.target.x() - stampX;
                const newY = e.target.y() - stampY;
                onHandleDrag(newX, newY);
            }}
             // ドラッグ中は再描画が必要だが、onDragMoveは重くなるのでEndで更新か、
             // 本格的にはCanvasAreaでdragMoveを受け取ってState更新などが望ましい
             // ここでは簡易的にドラッグ終了で確定とする
        />
      )}
    </>
  );
};

export default ArrowItem;
