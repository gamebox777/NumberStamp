import React from 'react';
import { Arrow, Circle, Group } from 'react-konva';

const LineItem = ({ item, isSelected, onSelect, onChange }) => {
    const handleDragEnd = (e) => {
        onChange({
            ...item,
            x: e.target.x(),
            y: e.target.y(),
        });
    };

    return (
        <Group
            id={item.id}
            x={item.x}
            y={item.y}
            draggable={isSelected}
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={handleDragEnd}
        >
            <Arrow
                points={item.points}
                stroke={item.color}
                fill={item.color}
                strokeWidth={item.strokeWidth}
                pointerLength={(item.strokeWidth || 5) * 2.5}
                pointerWidth={(item.strokeWidth || 5) * 2.5}
                pointerAtBeginning={item.startArrow}
                pointerAtEnding={item.endArrow}
                hitStrokeWidth={Math.max((item.strokeWidth || 5) + 10, 20)}
                lineCap="round"
                lineJoin="round"
            />

            {/* Handles for start and end points (only visible when selected) */}
            {isSelected && (
                <>
                    {/* Start Point Handle - Green */}
                    <Circle
                        x={item.points[0]}
                        y={item.points[1]}
                        radius={8}
                        fill="white"
                        stroke="#4CAF50" // Green for Start
                        strokeWidth={2}
                        draggable
                        onDragStart={(e) => {
                            e.cancelBubble = true; // 親Groupへのドラッグ伝播を防止
                        }}
                        onDragMove={(e) => {
                            e.cancelBubble = true;
                            const node = e.target;
                            const newPoints = [...item.points];
                            newPoints[0] = node.x();
                            newPoints[1] = node.y();

                            onChange({
                                ...item,
                                points: newPoints
                            });
                        }}
                        onDragEnd={(e) => {
                            e.cancelBubble = true; // 親GroupのonDragEndが発火しないようにする
                        }}
                    />

                    {/* End Point Handle - Red */}
                    <Circle
                        x={item.points[2]}
                        y={item.points[3]}
                        radius={8}
                        fill="white"
                        stroke="#F44336" // Red for End
                        strokeWidth={2}
                        draggable
                        onDragStart={(e) => {
                            e.cancelBubble = true;
                        }}
                        onDragMove={(e) => {
                            e.cancelBubble = true;
                            const node = e.target;
                            const newPoints = [...item.points];
                            newPoints[2] = node.x();
                            newPoints[3] = node.y();

                            onChange({
                                ...item,
                                points: newPoints
                            });
                        }}
                        onDragEnd={(e) => {
                            e.cancelBubble = true;
                        }}
                    />
                </>
            )}
        </Group>
    );
};

export default LineItem;
