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
            onTransform={(e) => {
                const node = shapeRef.current;
                const scaleX = node.scaleX();
                // スケールリセット
                node.scaleX(1);
                node.scaleY(1);

                // 新しいフォントサイズを計算
                const newFontSize = Math.max(5, Math.round(item.fontSize * scaleX));

                onChange({
                    ...item,
                    x: node.x(),
                    y: node.y(),
                    rotation: node.rotation(),
                    fontSize: newFontSize,
                    scaleX: 1, // scaleは常に1に戻す
                    scaleY: 1
                });
            }}
            onTransformEnd={(e) => {
                const node = shapeRef.current;
                const scaleX = node.scaleX();

                // 念のためここでもリセットと計算（通常はonTransformで処理済みだが）
                node.scaleX(1);
                node.scaleY(1);

                // onTransformでの計算誤差蓄積を防ぐため、元の倍率計算ロジックがあれば良いが、
                // ここではonTransformの最終結果を利用する形でOK。
                // ただし、Transformerの挙動としてドラッグ終了時にscaleが残っている場合があるので
                // 確実にfontSizeに適用してscaleを1にする。

                // onTransformが発火済みならitem.fontSizeは更新されているはずだが、
                // 最終的な整合性を保つ。

                // もしonTransformでstate更新が間に合わず、scaleXが1以外になっている場合を考慮
                if (scaleX !== 1) {
                    const newFontSize = Math.max(5, Math.round(item.fontSize * scaleX));
                    onChange({
                        ...item,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        fontSize: newFontSize,
                        scaleX: 1,
                        scaleY: 1
                    });
                }
            }}
        />
    );
};

export default TextItem;
