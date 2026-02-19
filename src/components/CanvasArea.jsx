import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from 'react-konva';
import useImage from 'use-image';
import { v4 as uuidv4 } from 'uuid';
import StampItem from './StampItem';
import RectangleItem from './RectangleItem';
import ArrowItem from './ArrowItem';
import LineItem from './LineItem';
import TextItem from './TextItem';
import PenItem from './PenItem';

const URLImage = React.memo(({ image }) => {
  return <KonvaImage image={image} listening={false} />;
});

const CanvasArea = React.forwardRef(({
  imageSrc,
  mode,
  setMode,
  items,
  setItems,
  selectedIds,
  setSelectedIds,
  settings,
  scale = 1.0,
  onContextMenu: onContextMenuCallback
}, ref) => {
  const [image] = useImage(imageSrc || '');
  const [newRect, setNewRect] = useState(null); // ドラッグ中の新規矩形
  const [newLine, setNewLine] = useState(null); // ドラッグ中の新規線
  const [newLineItem, setNewLineItem] = useState(null); // ドラッグ中の新規直線・矢印
  const [selectionBox, setSelectionBox] = useState(null); // 範囲選択ボックス

  // 画像サイズに合わせてステージサイズを設定
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const trRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        setItems((prevItems) => prevItems.filter((item) => !selectedIds.includes(item.id)));
        setSelectedIds([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIds, setItems, setSelectedIds]);

  useEffect(() => {
    if (image) {
      setStageSize({ width: image.width, height: image.height });
    }
  }, [image]);

  // 選択アイテムが変わったらTransformerのノードを更新
  useEffect(() => {
    if (trRef.current && ref.current) {
      const stage = ref.current;
      // IDセレクタ('#id')はIDが数字で始まるとエラーになる可能性があるため、関数で検索する
      const selectedNodes = selectedIds.map(id => {
        return stage.findOne((node) => node.id() === id);
      }).filter(node => node);

      trRef.current.nodes(selectedNodes);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedIds, items]); // itemsが変わった時も再検索が必要（削除後など）

  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    // スケールを考慮して座標を補正
    const x = pos.x / scale;
    const y = pos.y / scale;

    // 右クリック (button === 2) の処理
    if (e.evt.button === 2) {
      if (setMode) setMode('select');

      // 何もないところをクリック -> 何もしない (or 選択解除? 今回は選択解除しない方が安全かもだが、Windwos標準などは解除される。
      // ここではアイテムの上なら選択、そうでなければ何もしない、とする。

      const id = e.target.id() || e.target.parent?.id();
      if (id && id !== 'ghost') { // ghostは選択させない
        // 既に選択されていれば何もしない（複数選択の解除を防ぐため）
        // 単一選択に切り替えるか？ -> Explorerなどは右クリックで単一選択になる
        if (!selectedIds.includes(id)) {
          setSelectedIds([id]);
        }
      }
      return; // 右クリックの場合は以降のスタンプ配置などをスキップ
    }

    const clickedOnEmpty = e.target === stage;

    // Selectモード
    if (mode === 'select') {
      if (clickedOnEmpty) {
        // 何もないところをクリック -> 選択ステータスリセット & 範囲選択開始
        setSelectedIds([]);
        setSelectionBox({
          startX: x,
          startY: y,
          width: 0,
          height: 0
        });
      } else {
        // アイテムをクリック
        const id = e.target.id() || e.target.parent?.id(); // Groupの場合はparent.id()
        if (id) {
          // Ctrlキーが押されていれば追加/削除、そうでなければ単一選択
          if (e.evt.ctrlKey || e.evt.metaKey) {
            if (selectedIds.includes(id)) {
              setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
            } else {
              setSelectedIds([...selectedIds, id]);
            }
          } else {
            if (!selectedIds.includes(id)) {
              setSelectedIds([id]);
            }
          }
        }
      }
      return;
    }

    // 他のモードで既存アイテムをクリックした場合 (移動などを優先するならここでreturnするが、
    // スタンプモード等は「クリックで配置」が優先されるべきか？
    // 仕様：スタンプモードでも既存のスタンプを動かせると便利だが、
    // 新規配置と区別がつかなくなる。通常はSelectモードで移動させる。
    // ここでは「空いてるところなら新規作成」とする。
    // コンテキスト次第だが、clickedOnEmpty判定を使う。
    if (!clickedOnEmpty) return;

    // Stamp Mode
    if (mode === 'stamp' && image) {
      const id = uuidv4();
      const newItemObj = {
        id: id,
        type: 'stamp',
        x: x,
        y: y,
        number: settings.number,
        color: settings.color,
        radius: settings.radius,
        shape: settings.shape,
        stampFontSize: settings.stampFontSize,
        stampTextColor: settings.stampTextColor,
        stampSyncFontSize: settings.stampSyncFontSize,
        arrowEndPoint: { x: 0, y: 0 }
      };

      setItems([...items, newItemObj]);
      // setSelectedIds([id]); // 作成直後は選択しない

    } else if (mode === 'rectangle' && image) {
      // Rectangle Mode
      setNewRect({
        x: x,
        y: y,
        width: 0,
        height: 0,
        startX: x,
        startY: y
      });
      setSelectedIds([]);
    } else if (mode === 'text' && image) {
      // Text Mode
      const id = uuidv4();
      const newItemObj = {
        id: id,
        type: 'text',
        x: x,
        y: y,
        text: settings.text,
        fontSize: settings.fontSize,
        fontFamily: settings.fontFamily,
        fill: settings.color, // Text uses 'fill' for color
      };

      setItems([...items, newItemObj]);
      setSelectedIds([id]); // Automatically select the new text to edit it easily
      setMode('select'); // Switch back to select mode after placing text (optional, but common for text)
    } else if (mode === 'pen' && image) {
      // Pen Mode
      setNewLine({
        points: [x, y],
        color: settings.penColor,
        strokeWidth: settings.penWidth
      });
      setSelectedIds([]);
    } else if (mode === 'line' && image) {
      // Line Mode
      setNewLineItem({
        startX: x,
        startY: y,
        endX: x,
        endY: y,
      });
      setSelectedIds([]);
    }
  };



  const [cursorPos, setCursorPos] = useState(null);

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const x = pos.x / scale;
    const y = pos.y / scale;

    setCursorPos({ x, y });

    if (mode === 'select' && selectionBox) {
      setSelectionBox({
        ...selectionBox,
        width: x - selectionBox.startX,
        height: y - selectionBox.startY
      });
      return;
    }

    if (mode === 'rectangle' && newRect) {
      const width = x - newRect.startX;
      const height = y - newRect.startY;

      setNewRect({
        ...newRect,
        width: width,
        height: height
      });
    }

    if (mode === 'pen' && newLine) {
      setNewLine({
        ...newLine,
        points: [...newLine.points, x, y]
      });
    }

    if (mode === 'line' && newLineItem) {
      setNewLineItem({
        ...newLineItem,
        endX: x,
        endY: y
      });
    }
  };

  const handleMouseLeave = () => {
    setCursorPos(null);
  };

  const handleMouseUp = (e) => {
    // 範囲選択の終了
    if (mode === 'select' && selectionBox) {
      const sb = selectionBox;
      // 正規化（幅・高さが負の場合の対応）
      const box = {
        x: Math.min(sb.startX, sb.startX + sb.width),
        y: Math.min(sb.startY, sb.startY + sb.height),
        width: Math.abs(sb.width),
        height: Math.abs(sb.height)
      };

      // 範囲内にあるアイテムを探す
      // 簡単のため、中心点がボックス内にあるかどうかで判定
      const foundIds = items.filter(item => {
        // 矩形やスタンプのサイズも考慮すべきだが、まずは中心点or開始点で判定
        // スタンプ: item.x, item.y は中心
        // 矩形: item.x, item.y は左上（ただしwidth/heightが負の可能性もあるので正規化必要）
        let itemX = item.x;
        let itemY = item.y;

        // 矩形の場合、中心を計算して判定エリアに入れてあげるのが親切
        if (item.type === 'rectangle') {
          // width/heightは正の値で保存されているはず（handleMouseUpでAbsしてる）
          itemX = item.x + item.width / 2;
          itemY = item.y + item.height / 2;
        }

        return (
          itemX >= box.x &&
          itemX <= box.x + box.width &&
          itemY >= box.y &&
          itemY <= box.y + box.height
        );
      }).map(item => item.id);

      setSelectedIds(foundIds);
      setSelectionBox(null);
      return;
    }

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
          strokeWidth: settings.strokeWidth,
          fill: settings.fill,
          text: settings.rectText,
          fontSize: settings.rectFontSize,
          fontFamily: settings.rectFontFamily,
          textColor: settings.rectTextColor,
          align: settings.rectAlign,
          verticalAlign: settings.rectVerticalAlign,
          wrap: settings.rectTextWrap || 'none'
        };
        setItems([...items, newItem]);
        setSelectedIds([newItem.id]);
      }
      setNewRect(null);
    }

    // Pen Mode End
    if (mode === 'pen' && newLine) {
      if (newLine.points.length > 2) { // 少なくとも2点以上（始点と終点、あるいは少し動いた）
        const newItem = {
          id: uuidv4(),
          type: 'pen',
          x: 0, // Lineはpointsで絶対座標を持つが、Groupでラップする場合、x,yを0基準にしてpointsを相対にするか、x,y=0でpointsを絶対にするか。
          // ここではx,y=0でpoints絶対座標とする。移動時にGroupのx,yが変わる。
          y: 0,
          points: newLine.points,
          color: newLine.color,
          strokeWidth: newLine.strokeWidth,
          tension: 0.5,
          lineCap: 'round',
          lineJoin: 'round'
        };
        setItems([...items, newItem]);
        // 描画後は選択しない（連続描画のため）
      }
      setNewLine(null);
    }

    // Line Mode End
    if (mode === 'line' && newLineItem) {
      const dx = newLineItem.endX - newLineItem.startX;
      const dy = newLineItem.endY - newLineItem.startY;
      const length = Math.sqrt(dx * dx + dy * dy);

      if (length > 5) {
        const newItem = {
          id: uuidv4(),
          type: 'line',
          x: newLineItem.startX,
          y: newLineItem.startY,
          points: [0, 0, dx, dy], // Start relative to x,y is 0,0. End is dx,dy
          color: settings.lineColor,
          strokeWidth: settings.lineWidth,
          startArrow: settings.lineStartArrow,
          endArrow: settings.lineEndArrow
        };
        setItems([...items, newItem]);
        setSelectedIds([newItem.id]);
      }
      setNewLineItem(null);
    }

    setNewRect(null);
  };

  const handleItemSelect = (id, e) => {
    // StageのonClickと競合しないようにstopPropagationしたいが、
    // KonvaではcancelBubble
    if (e && e.cancelBubble) e.cancelBubble = true;

    // Selectモード以外では選択させない？ -> 編集操作のためにSelectモード推奨
    if (mode !== 'select') return;

    // 既に選択済みの場合は何もしない（ドラッグ開始かもしれないので）
    // ただし、CtrlキーなどのハンドリングはMouseDownで行っているので、
    // ここはクリック（タップ）時の単一選択補正用
    // MouseDownで処理済みなら不要かも？
  };

  const handleItemChange = (updatedItem) => {
    // 選択されているアイテムの変更（移動など）があった場合、
    // KonvaのTransformerや一括ドラッグで他の選択アイテムも移動している可能性があるため、
    // 選択中の全アイテムの位置をDOM(Konva Node)から同期する。

    if (selectedIds.includes(updatedItem.id)) {
      // refがStageを指していることを想定
      const stage = ref.current;
      if (!stage) return;

      setItems(prevItems => prevItems.map(item => {
        if (selectedIds.includes(item.id)) {
          // トリガーとなったアイテムは渡された値を優先（Rectのリサイズ計算などで計算済みのため）
          if (item.id === updatedItem.id) {
            return updatedItem;
          }

          // それ以外の選択アイテムはStage上のNodeから最新座標を取得
          // IDで検索し、存在するか確認。セレクタエラー回避のためfindOne(func)を使用
          const node = stage.findOne((n) => n.id() === item.id);
          if (node) {
            return {
              ...item,
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
            };
          }
        }
        return item;
      }));
    } else {
      // 単一更新（選択されていない、あるいは単一選択）
      setItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? updatedItem : item));
    }
  };


  return (
    <div className="canvas-area">
      {imageSrc ? (
        <Stage
          width={stageSize.width * scale}
          height={stageSize.height * scale}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onContextMenu={(e) => {
            e.evt.preventDefault();
            // 右クリック位置をコールバックで親に通知
            if (onContextMenuCallback) {
              const stage = e.target.getStage();
              const pos = stage.getPointerPosition();
              const canvasX = pos.x / scale;
              const canvasY = pos.y / scale;
              onContextMenuCallback(e.evt.clientX, e.evt.clientY, canvasX, canvasY);
            }
          }}
          ref={ref}
        >
          <Layer>
            <URLImage image={image} key="background-image" />

            {/* 矢印はスタンプの下に描画したいので先に描画 */}
            {items.map((item, i) => {
              if (item.type === 'stamp' && item.arrowEndPoint) {
                return (
                  <ArrowItem
                    key={`arrow-${item.id}`}
                    item={item}
                    stampX={item.x}
                    stampY={item.y}
                    isSelected={selectedIds.includes(item.id)}
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
              const isSelected = selectedIds.includes(item.id);
              if (item.type === 'stamp') {
                return (
                  <StampItem
                    key={item.id}
                    item={item}
                    isSelected={isSelected}
                    onSelect={(e) => handleItemSelect(item.id, e)}
                    onChange={handleItemChange}
                  />
                );
              } else if (item.type === 'rectangle') {
                return (
                  <RectangleItem
                    key={item.id}
                    item={item}
                    isSelected={isSelected}
                    onSelect={(e) => handleItemSelect(item.id, e)}
                    onChange={handleItemChange}
                  />
                );
              } else if (item.type === 'text') {
                return (
                  <TextItem
                    key={item.id}
                    item={item}
                    isSelected={isSelected}
                    onSelect={(e) => handleItemSelect(item.id, e)}
                    onChange={handleItemChange}
                  />
                );
              } else if (item.type === 'pen') {
                return (
                  <PenItem
                    key={item.id}
                    item={item}
                    isSelected={isSelected}
                    onSelect={(e) => handleItemSelect(item.id, e)}
                    onChange={handleItemChange}
                  />
                );
              } else if (item.type === 'line') {
                return (
                  <LineItem
                    key={item.id}
                    item={item}
                    isSelected={isSelected}
                    onSelect={(e) => handleItemSelect(item.id, e)}
                    onChange={handleItemChange}
                  />
                );
              }
              return null;
            })}

            {/* ドラッグ中の新規線描画 */}
            {newLine && (
              <PenItem
                item={{
                  id: 'temp-line',
                  type: 'pen',
                  x: 0,
                  y: 0,
                  points: newLine.points,
                  color: newLine.color,
                  strokeWidth: newLine.strokeWidth,
                  tension: 0.5,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
                isSelected={false}
                listening={false} // 描画中はイベントを受け取らない
              />
            )}

            {/* ドラッグ中の新規矩形描画 */}
            {newRect && (
              <RectangleItem
                item={{
                  ...newRect,
                  color: settings.color,
                  strokeWidth: settings.strokeWidth,
                  fill: settings.fill,
                  id: 'temp-rect'
                }}
                isSelected={false}
              />
            )}

            {/* ドラッグ中の新規直線・矢印描画 */}
            {newLineItem && (
              <LineItem
                item={{
                  id: 'temp-line-item',
                  type: 'line',
                  x: newLineItem.startX,
                  y: newLineItem.startY,
                  points: [0, 0, newLineItem.endX - newLineItem.startX, newLineItem.endY - newLineItem.startY],
                  color: settings.lineColor || '#FF0000',
                  strokeWidth: settings.lineWidth || 5,
                  startArrow: settings.lineStartArrow,
                  endArrow: settings.lineEndArrow
                }}
                isSelected={false}
              />
            )}

            {/* Ghost Stamp */}
            {mode === 'stamp' && imageSrc && cursorPos && (
              <StampItem
                item={{
                  id: 'ghost',
                  type: 'stamp',
                  x: cursorPos.x,
                  y: cursorPos.y,
                  number: settings.number,
                  color: settings.color,
                  radius: settings.radius,
                  shape: settings.shape,
                  stampFontSize: settings.stampFontSize,
                  stampTextColor: settings.stampTextColor,
                  stampSyncFontSize: settings.stampSyncFontSize,
                }}
                isSelected={false}
                opacity={0.5}
                listening={false}
              />
            )}

            {/* 範囲選択ボックス (半透明の青) */}
            {selectionBox && (
              <Rect
                x={selectionBox.startX}
                y={selectionBox.startY}
                width={selectionBox.width}
                height={selectionBox.height}
                fill="rgba(0, 161, 255, 0.3)"
                stroke="#00a1ff"
                strokeWidth={1}
              />
            )}

            {/* 一括操作用Transformer */}
            <Transformer
              ref={trRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
              // 線アイテムが選択されている場合は回転・拡縮を無効化
              rotateEnabled={!items.some(item => selectedIds.includes(item.id) && item.type === 'line')}
              resizeEnabled={!items.some(item => selectedIds.includes(item.id) && item.type === 'line')}

            // スタンプなどリサイズしたくないものがある場合の制御が必要ならここで行う
            // enabledAnchorsなどで制限可能
            />

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
