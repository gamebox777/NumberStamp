import React, { useState, useLayoutEffect, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';

const RectangleItem = ({ item, isSelected, onSelect, onChange }) => {
  const groupRef = useRef();
  const rectRef = useRef();

  // Auto Fit Logic
  const [fittedFontSize, setFittedFontSize] = useState(item.fontSize || 24);

  // Groupの選択範囲(Transformer)をRectのサイズに制限する
  useLayoutEffect(() => {
    if (groupRef.current && rectRef.current) {
      groupRef.current.getClientRect = (config) => {
        return rectRef.current.getClientRect(config);
      };
    }
  }, []);

  useLayoutEffect(() => {
    if (item.wrap === 'fit' && item.text) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      let size = item.fontSize || 24;
      const minSize = 8;

      while (size >= minSize) {
        context.font = `${size}px ${item.fontFamily || 'Arial'}`;
        // 高さ概算 (簡易的に size * 1.2 * 行数)
        const lines = String(item.text).split('\n');
        const maxWidth = Math.max(...lines.map(line => context.measureText(line).width));
        const totalHeight = size * lines.length * 1.2;

        if (maxWidth <= item.width && totalHeight <= item.height) {
          break;
        }
        size--;
      }
      setFittedFontSize(size);
    } else {
      setFittedFontSize(item.fontSize || 24);
    }
  }, [item.text, item.width, item.height, item.fontSize, item.fontFamily, item.wrap]);

  // Overflow Alignment Logic
  const isOverflow = item.wrap !== 'fit';
  let textProps = {};

  if (isOverflow) {
    const largeWidth = 10000;
    const align = item.align || 'center';

    if (align === 'center') {
      textProps = {
        width: largeWidth,
        offsetX: largeWidth / 2,
        x: item.width / 2,
        align: 'center'
      };
    } else if (align === 'right') {
      textProps = {
        width: largeWidth,
        offsetX: largeWidth,
        x: item.width,
        align: 'right'
      };
    } else {
      // Left
      textProps = {
        width: largeWidth,
        x: 0,
        align: 'left'
      };
    }
  } else {
    // Fit mode
    textProps = {
      width: item.width,
      height: item.height,
      x: 0,
      y: 0,
      align: item.align || 'center',
      verticalAlign: item.verticalAlign || 'middle'
    };
  }

  return (
    <Group
      ref={groupRef}
      id={item.id}
      x={item.x}
      y={item.y}
      width={item.width}
      height={item.height}
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
        const node = groupRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        node.scaleX(1);
        node.scaleY(1);

        onChange({
          ...item,
          x: node.x(),
          y: node.y(),
          width: Math.max(5, item.width * scaleX),
          height: Math.max(5, item.height * scaleY),
          rotation: node.rotation(),
          scaleX: 1,
          scaleY: 1
        });
      }}
    >
      <Rect
        ref={rectRef}
        width={item.width}
        height={item.height}
        stroke={item.color}
        strokeWidth={item.strokeWidth || 2}
        fill={item.fill || 'transparent'}
        fillEnabled={true}
      />

      {/* 
        Wrap=none (Overflow) の場合、widthを大きく取ってAlignmentを制御する。
        Wrap=fit の場合、width=item.widthで、fontSizeを計算して収める。
      */}
      <Text
        text={item.text !== undefined && item.text !== null ? String(item.text) : ''}
        height={item.height}
        fontSize={fittedFontSize}
        fontFamily={item.fontFamily || 'Arial'}
        fill={item.textColor || '#000000'}
        wrap="none"
        listening={false}
        verticalAlign={item.verticalAlign || 'middle'}
        {...textProps}
      />
    </Group>
  );
};

export default RectangleItem;
