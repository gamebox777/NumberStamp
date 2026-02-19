import React, { useRef, useEffect } from 'react';
import { Group, Line } from 'react-konva';

const PenItem = ({
    item,
    isSelected,
    onSelect,
    onChange,
    listening = true
}) => {
    const groupRef = useRef();
    const lineRef = useRef();

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
            listening={listening}
            onDragEnd={(e) => {
                onChange({
                    ...item,
                    x: e.target.x(),
                    y: e.target.y(),
                });
            }}
            onTransformEnd={(e) => {
                const node = groupRef.current;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();

                // 線の太さが変わってしまうのを防ぐため、scaleをリセットしてpointsを再計算するか、
                // あるいは単純にscaleを維持するか。
                // KonvaのLineはscaleの影響を受けるので、ここではscaleをそのまま保存する形にする。
                // もし太さを一定に保ちたい場合はpointsを変換する必要があるが、
                // 自由変形としては太さも変わる方が自然な場合が多い。

                onChange({
                    ...item,
                    x: node.x(),
                    y: node.y(),
                    rotation: node.rotation(),
                    scaleX: scaleX,
                    scaleY: scaleY,
                });
            }}
            ref={groupRef}
        >
            <Line
                ref={lineRef}
                points={item.points}
                stroke={item.color}
                strokeWidth={item.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                // 選択時は当たり判定を見やすくするために太くするなどの工夫も可能だが、
                // ここでは標準の当たり判定
                hitStrokeWidth={Math.max(item.strokeWidth * 2, 20)}
                shadowColor="black"
                shadowBlur={isSelected ? 5 : 0}
                shadowOpacity={0.3}
                shadowOffset={{ x: 2, y: 2 }}
                shadowEnabled={isSelected} // 選択時のみ影をつけるなど
            />
            {/* 選択時の枠線（Lineの場合はバウンディングボックスが表示されるのでTransformerに任せる） */}
        </Group>
    );
};

export default PenItem;
