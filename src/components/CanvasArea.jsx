import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { v4 as uuidv4 } from 'uuid';
import StampItem from './StampItem';
import RectangleItem from './RectangleItem';
import ArrowItem from './ArrowItem';

const URLImage = ({ image }) => {
  return <KonvaImage image={image} />;
};

const CanvasArea = React.forwardRef(({ 
  imageSrc, 
  mode, 
  items, 
  setItems, 
  selectedId, 
  setSelectedId, 
  settings 
}, ref) => {
  const [image] = useImage(imageSrc || '');
  const [newRect, setNewRect] = useState(null); // ドラッグ中の新規矩形

  // 画像サイズに合わせてステージサイズを設定
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (image) {
      setStageSize({ width: image.width, height: image.height });
    }
  }, [image]);

  const handleMouseDown = (e) => {
    // 選択解除 (背景クリック時)
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }

    if (mode === 'stamp' && image) {
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();
      
      // 新しいスタンプを追加
      const newItem = {
        id: uuidv4(),
        type: 'stamp',
        x: pos.x,
        y: pos.y,
        number: settings.number,
        color: settings.color,
        radius: settings.radius,
        shape: settings.shape,
        arrowEndPoint: { x: 0, y: 0 }
      };
      
      setItems([...items, newItem]);

    } else if (mode === 'rectangle' && image) {
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();
      setNewRect({
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        startX: pos.x,
        startY: pos.y
      });
      setSelectedId(null);
    }
  };

  const handleMouseMove = (e) => {
    if (mode === 'rectangle' && newRect) {
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();
      
      const width = pos.x - newRect.startX;
      const height = pos.y - newRect.startY;
      
      setNewRect({
        ...newRect,
        width: width,
        height: height
      });
    }
  };

  const handleMouseUp = (e) => {
    if (mode === 'rectangle' && newRect) {
      // 一定以上の大きさがあれば追加
      if (Math.abs(newRect.width) > 5 && Math.abs(newRect.height) > 5) {
        const newItem = {
          id: uuidv4(),
          type: 'rectangle',
          x: newRect.width > 0 ? newRect.x : newRect.x + newRect.width,
          y: newRect.height > 0 ? newRect.y : newRect.y + newRect.height,
          width: Math.abs(newRect.width),
          height: Math.abs(newRect.height),
          color: settings.color,
          radius: 3 // 線幅として使用
        };
        setItems([...items, newItem]);
        setSelectedId(newItem.id);
      }
      setNewRect(null);
    }
  };

  const handleItemSelect = (id) => {
    if (mode === 'select') {
      setSelectedId(id);
    }
  };

  const handleItemChange = (updatedItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
  };


  return (
    <div className="canvas-area">
      {imageSrc ? (
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={ref}
        >
          <Layer>
            <URLImage image={image} />
            
            {/* 矢印はスタンプの下に描画したいので先に描画 */}
            {items.map((item, i) => {
                if (item.type === 'stamp' && item.arrowEndPoint) {
                    return (
                        <ArrowItem
                            key={`arrow-${item.id}`}
                            item={item}
                            stampX={item.x}
                            stampY={item.y}
                            isSelected={selectedId === item.id}
                            onHandleDrag={(dx, dy) => {
                                // 矢印の更新
                                const updated = { ...item, arrowEndPoint: { x: dx, y: dy } };
                                handleItemChange(updated);
                            }}
                        />
                    );
                }
                return null;
            })}

            {items.map((item, i) => {
              if (item.type === 'stamp') {
                return (
                  <StampItem
                    key={item.id}
                    item={item}
                    isSelected={selectedId === item.id}
                    onSelect={() => handleItemSelect(item.id)}
                    onChange={handleItemChange}
                  />
                );
              } else if (item.type === 'rectangle') {
                return (
                  <RectangleItem
                    key={item.id}
                    item={item}
                    isSelected={selectedId === item.id}
                    onSelect={() => handleItemSelect(item.id)}
                    onChange={handleItemChange}
                  />
                );
              }
              return null;
            })}

            {/* ドラッグ中の新規矩形描画 */}
            {newRect && (
               <RectangleItem
                  item={{ 
                      ...newRect, 
                      color: settings.color,
                      radius: 2, 
                      id: 'temp-rect' 
                  }}
                  isSelected={false}
               />
            )}

          </Layer>
        </Stage>
      ) : (
        <div style={{ textAlign: 'center', color: '#666' }}>
          <p>画像を読み込んでください</p>
          <p>(ドラッグ＆ドロップまたはツールバーから)</p>
        </div>
      )}
    </div>
  );
});

export default CanvasArea;
