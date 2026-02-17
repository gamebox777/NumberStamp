import React from 'react';
import { Arrow, Circle } from 'react-konva';

const ArrowItem = ({ item, stampX, stampY, isSelected, onHandleDrag }) => {
    // 初期状態かどうか判定 (arrowEndPointがない、または(0,0)の場合)
    const isInitialState = !item.arrowEndPoint || (item.arrowEndPoint.x === 0 && item.arrowEndPoint.y === 0);

    // 形状パラメータの計算
    let width, height, radius;
    if (item.shape === 'square') {
        const digits = String(item.number).length;
        const widthFactor = Math.max(1.0, 0.6 + digits * 0.4);
        width = item.radius * 2 * widthFactor;
        height = item.radius * 2 * 0.65;
    } else {
        radius = item.radius;
    }

    // デフォルト位置の計算（右下）
    let defaultX, defaultY;
    if (item.shape === 'square') {
        defaultX = width / 2 + 15;
        defaultY = height / 2 + 15;
    } else {
        defaultX = radius + 15;
        defaultY = radius + 15;
    }

    // 描画すべき矢印の終点（相対座標）
    let dx, dy;
    if (isInitialState) {
        dx = defaultX;
        dy = defaultY;
    } else {
        dx = item.arrowEndPoint.x;
        dy = item.arrowEndPoint.y;
    }

    // 絶対座標
    const absEndX = stampX + dx;
    const absEndY = stampY + dy;

    // 矢印（ライン）の描画ロジック
    const renderArrow = () => {
        if (isInitialState) return null;

        const length = Math.sqrt(dx * dx + dy * dy);

        // 形状に基づいて隠れる距離（開始位置）を計算
        let startDist;
        if (item.shape === 'square') {
            const halfWidth = width / 2;
            const halfHeight = height / 2;

            const scaleX = halfWidth / Math.abs(dx);
            const scaleY = halfHeight / Math.abs(dy);
            const scale = Math.min(scaleX, scaleY);

            startDist = length * scale;
        } else {
            startDist = item.radius;
        }

        if (length < startDist) {
            return null;
        }

        const offsetX = (dx / length) * startDist;
        const offsetY = (dy / length) * startDist;

        const absStartX = stampX + offsetX;
        const absStartY = stampY + offsetY;

        return (
            <Arrow
                points={[absStartX, absStartY, absEndX, absEndY]}
                stroke={item.color}
                fill={item.color}
                strokeWidth={3}
                pointerLength={10}
                pointerWidth={10}
                lineCap="round"
                lineJoin="round"
            />
        );
    };

    return (
        <>
            {renderArrow()}

            {/* 矢印操作用ハンドル (選択時のみ常に表示) */}
            {isSelected && (
                <Circle
                    x={absEndX}
                    y={absEndY}
                    radius={8}
                    fill="cyan"
                    stroke="black"
                    strokeWidth={1}
                    draggable
                    onDragMove={(e) => {
                        const newX = e.target.x() - stampX;
                        const newY = e.target.y() - stampY;
                        onHandleDrag(newX, newY);
                    }}
                />
            )}
        </>
    );
};

export default ArrowItem;
