import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import Toolbar from './components/Toolbar';
import SettingsPanel from './components/SettingsPanel';
import CanvasArea from './components/CanvasArea';
import ContextMenu from './components/ContextMenu';
import ErrorBoundary from './components/ErrorBoundary';
import useUndoRedo from './hooks/useUndoRedo';
import { v4 as uuidv4 } from 'uuid';
import { validateProjectName } from './utils/validation';
import Tooltip from './components/Tooltip';
import packageJson from '../package.json';
import bannerImg from './assets/banner_new.jpg';
import { DEFAULT_STYLES } from './constants/defaults';

function App() {
  const [items, setItems, undo, redo, canUndo, canRedo, resetItems] = useUndoRedo([]);
  const [projectName, setProjectName] = useState('untitled-project');
  const [mode, setMode] = useState('stamp'); // select, stamp, rectangle
  const [settings, setSettings] = useState({
    number: 1,
    step: 1,
    // Stamp defaults
    color: DEFAULT_STYLES.stamp.color,
    radius: DEFAULT_STYLES.stamp.radius,
    shape: DEFAULT_STYLES.stamp.shape,
    stampFontSize: DEFAULT_STYLES.stamp.stampFontSize,
    stampTextColor: DEFAULT_STYLES.stamp.stampTextColor,
    stampSyncFontSize: DEFAULT_STYLES.stamp.stampSyncFontSize,

    // Rectangle defaults
    strokeWidth: DEFAULT_STYLES.rectangle.strokeWidth,
    fill: DEFAULT_STYLES.rectangle.fill,
    rectText: '',
    rectFontSize: DEFAULT_STYLES.rectangle.fontSize,
    rectFontFamily: DEFAULT_STYLES.rectangle.fontFamily,
    rectTextColor: DEFAULT_STYLES.rectangle.textColor,
    rectAlign: DEFAULT_STYLES.rectangle.align,
    rectVerticalAlign: DEFAULT_STYLES.rectangle.verticalAlign,
    rectTextWrap: DEFAULT_STYLES.rectangle.wrap,

    // Text defaults
    text: 'Text',
    fontSize: DEFAULT_STYLES.text.fontSize,
    fontFamily: DEFAULT_STYLES.text.fontFamily,

    // Pen defaults
    penColor: DEFAULT_STYLES.pen.color,
    penWidth: DEFAULT_STYLES.pen.strokeWidth,

    // Line defaults
    lineColor: DEFAULT_STYLES.line.color,
    lineWidth: DEFAULT_STYLES.line.strokeWidth,
    lineStartArrow: DEFAULT_STYLES.line.startArrow,
    lineEndArrow: DEFAULT_STYLES.line.endArrow,

    // Unused/Legacy
    brush_color: '',
    line_width: 2,
    pen_style: 'solid',
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageName, setImageName] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });
  const stageRef = useRef(null);
  const [clipboard, setClipboard] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, canvasX: 0, canvasY: 0 });
  const canvasWrapperRef = useRef(null);

  // Developer Mode State
  const [isDevMode, setIsDevMode] = useState(false);
  const devModeClickCount = useRef(0);
  const devModeTimer = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Developer Mode: Track mouse position
  useEffect(() => {
    if (!isDevMode) return;
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isDevMode]);

  // Developer Mode: Toggle trigger
  const handleVersionClick = (e) => {
    // Prevent default to avoid selecting text
    e.preventDefault();

    devModeClickCount.current += 1;
    if (devModeTimer.current) clearTimeout(devModeTimer.current);

    if (devModeClickCount.current >= 5) {
      const newMode = !isDevMode;
      setIsDevMode(newMode);
      devModeClickCount.current = 0;
      alert(`Developer Mode: ${newMode ? "ON" : "OFF"}`);
    } else {
      devModeTimer.current = setTimeout(() => {
        devModeClickCount.current = 0;
      }, 2000);
    }
  };


  // クリップボード操作
  const handleCopy = () => {
    if (selectedIds.length === 0) return;
    const selectedItems = items.filter(item => selectedIds.includes(item.id));
    // ディープコピーして保存（参照渡しを防ぐ）
    setClipboard(JSON.parse(JSON.stringify(selectedItems)));
  };

  const handlePaste = () => {
    if (clipboard.length === 0) return;

    // ペースト位置のオフセット（重ならないように少しずらす）
    const offset = 20;

    const newItems = clipboard.map(item => {
      const newItem = { ...item };
      newItem.id = uuidv4(); // 新しいIDを生成
      newItem.x += offset;
      newItem.y += offset;
      return newItem;
    });

    setItems(prevItems => [...prevItems, ...newItems]);
    // ペーストしたアイテムを選択状態にする
    setSelectedIds(newItems.map(item => item.id));
  };

  // 指定位置にペースト（右クリックメニューから呼ばれる）
  const handlePasteAtPosition = (canvasX, canvasY) => {
    if (clipboard.length === 0) return;

    // クリップボード内アイテムの中心を計算
    const centerX = clipboard.reduce((sum, item) => sum + item.x, 0) / clipboard.length;
    const centerY = clipboard.reduce((sum, item) => sum + item.y, 0) / clipboard.length;

    const newItems = clipboard.map(item => {
      const newItem = { ...item };
      newItem.id = uuidv4();
      // 右クリック位置を中心にオフセットして配置
      newItem.x = canvasX + (item.x - centerX);
      newItem.y = canvasY + (item.y - centerY);
      return newItem;
    });

    setItems(prevItems => [...prevItems, ...newItems]);
    setSelectedIds(newItems.map(item => item.id));
  };

  // Z-index (重ね順) 操作
  const handleZOrder = (action) => {
    console.log('handleZOrder called', action, selectedIds);
    if (selectedIds.length === 0) return;

    setItems(prevItems => {
      console.log('handleZOrder updater', prevItems.length);
      let newItems = [...prevItems];
      const selectedIndices = newItems
        .map((item, index) => ({ id: item.id, index }))
        .filter(item => selectedIds.includes(item.id))
        .map(item => item.index)
        .sort((a, b) => a - b); // Ascending order

      console.log('selectedIndices', selectedIndices);

      if (selectedIndices.length === 0) return prevItems;

      if (action === 'front') {
        // move to end
        const movingItems = selectedIndices.map(i => newItems[i]);
        // remove from old positions (iterate reverse to not mess up indices)
        for (let i = selectedIndices.length - 1; i >= 0; i--) {
          newItems.splice(selectedIndices[i], 1);
        }
        newItems.push(...movingItems);

      } else if (action === 'back') {
        // move to start
        const movingItems = selectedIndices.map(i => newItems[i]);
        for (let i = selectedIndices.length - 1; i >= 0; i--) {
          newItems.splice(selectedIndices[i], 1);
        }
        newItems.unshift(...movingItems);

      } else if (action === 'forward') {
        // swap with next one
        // Iterate from end to start
        for (let i = selectedIndices.length - 1; i >= 0; i--) {
          const idx = selectedIndices[i];
          if (idx < newItems.length - 1) {
            const nextItem = newItems[idx + 1];
            if (!selectedIds.includes(nextItem.id)) {
              // Swap
              [newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]];
            }
          }
        }

      } else if (action === 'backward') {
        // swap with prev one
        // Iterate from start to end
        for (let i = 0; i < selectedIndices.length; i++) {
          const idx = selectedIndices[i];
          if (idx > 0) {
            const prevItem = newItems[idx - 1];
            if (!selectedIds.includes(prevItem.id)) {
              [newItems[idx], newItems[idx - 1]] = [newItems[idx - 1], newItems[idx]];
            }
          }
        }
      }

      console.log('New items order IDs:', newItems.map(i => i.id));
      return newItems;
    });
  };

  // キーボードショートカット (Undo/Redo, Copy/Paste)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            e.preventDefault();
            break;
          case 'y':
            redo();
            e.preventDefault();
            break;
          case 'c':
            handleCopy();
            e.preventDefault();
            break;
          case 'v':
            handlePaste();
            e.preventDefault();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, items, selectedIds, clipboard]); // 依存配列にitems, selectedIds, clipboardを追加

  // 設定のマイグレーション（機能追加時のデフォルト値補完）
  useEffect(() => {
    setSettings(prev => {
      const defaults = {
        rectText: '',
        rectFontSize: 24,
        rectFontFamily: 'Arial',
        rectTextColor: '#000000',
        rectAlign: 'center',
        rectVerticalAlign: 'middle',
        rectTextWrap: 'none',
        penColor: 'red',
        penWidth: 5,
        stampFontSize: 24,
        stampTextColor: '#FFFFFF',
        stampSyncFontSize: true
      };
      // キーが足りない場合のみ追加
      const missingKeys = Object.keys(defaults).filter(key => prev[key] === undefined);
      if (missingKeys.length > 0) {
        return { ...prev, ...defaults };
      }
      return prev;
    });
  }, []);

  // 画像読み込み
  const handleImageLoad = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        setImageSrc(event.target.result);
        setImageName(file.name);
        // リセット
        resetItems([]);
        setSelectedIds([]);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // ドラッグ＆ドロップ
  const handleDrop = (e) => {
    e.preventDefault();
    handleImageLoad(e);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // キャンバス作成（白い背景画像を生成）
  const handleCreateCanvas = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/png');
    setImageSrc(dataUrl);
    setImageSize({ width, height });
    setImageName(`canvas (${width}×${height})`);
    resetItems([]);
    setSelectedIds([]);
  };

  // アイテム更新
  const updateItem = (id, newAttrs) => {
    setItems(items.map(item => item.id === id ? { ...item, ...newAttrs } : item));

    // 設定パネルからの変更を現在の設定にも反映させるか？
    // 選択中のアイテムの設定を変更した場合、次に追加するアイテムの設定もそれに���わせるかどうか。
    // 通常は合わせない方が使いやすいが、要望次第。今回は合わせない。
  };

  // アイテム削除
  const handleDeleteItem = () => {
    if (selectedIds.length > 0) {
      setItems(items.filter(item => !selectedIds.includes(item.id)));
      setSelectedIds([]);
    }
  };

  // ファイル保存ヘルパー (従来のダウンロード方式 - ブラウザの履歴に残る)
  const saveFile = async (blob, defaultName) => {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = defaultName;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Save failed:', err);
      alert('保存に失敗しました');
    }
  };

  // 画像エクスポート
  const handleExport = (mimeType = 'image/png') => {
    if (!stageRef.current) return;

    // 選択枠などを消すために一時的に選択解除
    const currentSelected = selectedIds;
    setSelectedIds([]);

    // Reactの状態更新が反映されるのを待つ
    setTimeout(async () => {
      try {
        const uri = stageRef.current.toDataURL({ pixelRatio: 2, mimeType }); // 高画質化

        // dataURL to Blob
        const res = await fetch(uri);
        const blob = await res.blob();

        const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png';
        const description = mimeType === 'image/jpeg' ? 'JPEG Images' : 'PNG Images';
        const accept = {};
        accept[mimeType] = [`.${ext}`];

        await saveFile(blob, `numstamp_export.${ext}`, [{
          description: description,
          accept: accept
        }]);

      } catch (err) {
        console.error('Export failed:', err);
      } finally {
        // 選択状態を戻す
        if (currentSelected.length > 0) {
          setSelectedIds(currentSelected);
        }
      }
    }, 100);
  };

  // プロジェクト保存
  const handleSaveProject = async () => {
    // バリデーションチェック
    const validation = validateProjectName(projectName);
    if (!validation.isValid) {
      alert(`保存できません: ${validation.error}`);
      return;
    }

    const projectData = {
      projectName,
      items,
      imageSrc,
      imageSize,
      settings,
      version: '1.1'
    };

    const json = JSON.stringify(projectData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });

    await saveFile(blob, `${projectName}.json`, [{
      description: 'JSON Files',
      accept: { 'application/json': ['.json'] }
    }]);
  };

  // プロジェクト読み込み
  const handleLoadProject = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const projectData = JSON.parse(event.target.result);
        if (projectData.projectName) setProjectName(projectData.projectName);
        if (projectData.items) resetItems(projectData.items);
        if (projectData.imageSrc) setImageSrc(projectData.imageSrc);
        if (projectData.imageSize) setImageSize(projectData.imageSize);
        if (projectData.settings) setSettings(projectData.settings);
        // 互換性チェックなどを将来的にここに追加

        // 読み込み完了後、選択解除
        setSelectedIds([]);

        // inputの値をリセット（同じファイルを再度読み込めるように）
        e.target.value = '';
      } catch (err) {
        console.error('Failed to parse project file:', err);
        alert('プロジェクトファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
  };

  // スタンプ追加時の番号自動インクリメント処理
  // CanvasAreaでクリックしてアイテム追加された後に呼ばれる
  useEffect(() => {
    // itemsの最後の要素がstampの場合、次の番号を準備
    if (items.length > 0) {
      const lastItem = items[items.length - 1];
      if (lastItem.type === 'stamp' && lastItem.number === settings.number) {
        setSettings(prev => ({
          ...prev,
          number: prev.number + prev.step
        }));
      }
    }
  }, [items]); // itemsが変わるたびにチェック（パフォーマンス注意だが要素数少ないのでOK）

  // 全アイテム削除 (新規/All Clear)
  const handleClearAll = () => {
    if (items.length === 0 && !imageSrc) return;

    if (window.confirm('現在作業中の内容（画像とスタンプ）を全てクリアしますか？')) {
      resetItems([]);
      setSelectedIds([]);
      setProjectName('untitled-project');
      setImageSrc(null);
      setImageName(null);
      // カウンターもリセットするかどうかは選択肢だが、
      // "新規"という意味合いならリセットした方が自然かもしれない。
      // ただし、画像はそのままで書き直したいだけの場合もあるので、
      // ここではアイテムクリアのみに留める。
      // ...というコメントがあったが、画像も消すなら完全にリセットなのでカウンターも戻す
      setSettings(prev => ({ ...prev, number: 1 }));
    }
  };

  // 複数選択時はとりあえず最初の1つだけ設定パネルに表示するか、あるいは専用の表示にする
  // ここではシンプルに「1つだけ選択されている時のみ」設定パネルで編集可能にする
  const selectedItem = selectedIds.length === 1 ? items.find(i => i.id === selectedIds[0]) : null;

  // ズームスケール
  const [scale, setScale] = useState(1.0);

  return (
    <ErrorBoundary>
      <div className="app-container" onDrop={handleDrop} onDragOver={handleDragOver}>
        <Toolbar
          mode={mode}
          setMode={(m) => {
            setMode(m);
            setSelectedIds([]); // モード切替時に選択解除
          }}
          onExport={handleExport}
          onLoadImage={(e) => {
            // input type="file" のonChangeイベント
            handleImageLoad(e);
          }}
          onSaveProject={handleSaveProject}
          onLoadProject={handleLoadProject}
          onClearAll={handleClearAll}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div ref={canvasWrapperRef} className="canvas-area-wrapper" style={{ flex: 1, overflow: 'auto', display: 'grid', placeItems: 'center', padding: '24px', position: 'relative' }}
            onMouseDown={(e) => {
              // 左クリックで右クリックメニューを閉じる（Konva canvas内のクリックもここで検知）
              if (e.button === 0 && contextMenu.visible) {
                setContextMenu({ ...contextMenu, visible: false });
              }
            }}
          >
            <CanvasArea
              ref={stageRef}
              imageSrc={imageSrc}
              mode={mode}
              setMode={(m) => {
                setMode(m);
              }}
              items={items}
              setItems={setItems}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              settings={settings}
              scale={scale}
              onCreateCanvas={handleCreateCanvas}
              onContextMenu={(clientX, clientY, canvasX, canvasY) => {
                // canvasWrapperの位置を基準にメニュー座標を計算
                const wrapper = canvasWrapperRef.current;
                if (wrapper) {
                  const rect = wrapper.getBoundingClientRect();
                  setContextMenu({
                    visible: true,
                    x: clientX - rect.left + wrapper.scrollLeft,
                    y: clientY - rect.top + wrapper.scrollTop,
                    canvasX,
                    canvasY
                  });
                }
              }}
            />
            <ContextMenu
              visible={contextMenu.visible}
              x={contextMenu.x}
              y={contextMenu.y}
              hasSelection={selectedIds.length > 0}
              hasClipboard={clipboard.length > 0}
              onCopy={handleCopy}
              onPaste={() => handlePasteAtPosition(contextMenu.canvasX, contextMenu.canvasY)}
              onDelete={handleDeleteItem}
              onClose={() => setContextMenu({ ...contextMenu, visible: false })}
              onZOrder={handleZOrder}
            />
          </div>
          {imageSrc && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              pointerEvents: 'none',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--color-border)',
              letterSpacing: '0.01em'
            }}>
              {imageName} ({imageSize.width} x {imageSize.height})
            </div>
          )}
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Tooltip
            text={isSidebarOpen ? "設定パネルを閉じる" : "設定パネルを開く"}
            position="right"
            style={{
              position: 'absolute',
              top: '50%',
              left: '-12px',
              transform: 'translateY(-50%)',
              width: '24px',
              height: '48px',
              zIndex: 10
            }}
          >
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRight: 'none',
                borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: 'var(--color-text-muted)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {isSidebarOpen ? '\u25B6' : '\u25C0'}
            </button>
          </Tooltip>
          <div className="right-sidebar"
            onClick={() => !isSidebarOpen && setIsSidebarOpen(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              borderLeft: '1px solid var(--color-border)',
              backgroundColor: isSidebarOpen ? 'var(--color-surface)' : 'var(--color-surface-alt)',
              width: isSidebarOpen ? '280px' : '30px',
              transition: 'width 0.3s ease, background-color 0.3s ease',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              cursor: !isSidebarOpen ? 'pointer' : 'default'
            }}>
            <div style={{ width: '280px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <SettingsPanel
                settings={settings}
                setSettings={setSettings}
                selectedItem={selectedItem}
                selectedIndex={selectedIds.length === 1 ? items.findIndex(i => i.id === selectedIds[0]) : -1}
                totalItems={items.length}
                updateSelectedItem={updateItem}
                mode={mode}
                onDelete={handleDeleteItem}
                projectName={projectName}
                setProjectName={setProjectName}
              />

              {/* Zoom Control Compact */}
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Zoom: {Math.round(scale * 100)}%</span>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  style={{ flex: 1, margin: '0 4px', accentColor: 'var(--color-primary)' }}
                />
                <div style={{ display: 'flex', gap: '2px' }}>
                  <button onClick={() => setScale(Math.max(0.1, scale - 0.1))} style={{ fontSize: '10px', padding: '3px 8px', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}>-</button>
                  <button onClick={() => setScale(1.0)} style={{ fontSize: '10px', padding: '3px 8px', cursor: 'pointer', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>1:1</button>
                  <button onClick={() => setScale(Math.min(3.0, scale + 0.1))} style={{ fontSize: '10px', padding: '3px 8px', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}>+</button>
                </div>
              </div>

              {/* Banner at bottom */}
              <div className="banner-container" style={{ padding: '12px', textAlign: 'center', position: 'relative', borderTop: '1px solid var(--color-border)' }}>
                <a href="https://github.com/gamebox777/NumberStamp/blob/main/README.md" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
                  <img src={bannerImg} alt="NumberStamp" style={{ width: '100%', borderRadius: 'var(--radius-md)', display: 'block', border: '1px solid var(--color-border)' }} />
                </a>
                <div style={{
                  position: 'absolute',
                  top: '17px',
                  right: '17px',
                  backgroundColor: 'rgba(30, 41, 59, 0.7)',
                  backdropFilter: 'blur(4px)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '10px',
                  fontWeight: 600,
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  letterSpacing: '0.02em'
                }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Link clickを防ぐ
                    handleVersionClick(e);
                  }}
                >
                  v{packageJson.version}
                </div>
              </div>


              <div
                style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface-alt)', borderTop: '1px solid var(--color-border)' }}
              >
                <a href="https://github.com/gamebox777/NumberStamp/blob/main/README.md" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: 500, transition: 'color var(--transition-fast)' }}>
                  マニュアル(GitHub)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div >
      {isDevMode && (
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '70px', // Right of toolbar
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#00ff00',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 9999,
          pointerEvents: 'none',
          fontFamily: 'monospace',
          fontSize: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
          maxWidth: '300px'
        }}>
          <div style={{ borderBottom: '1px solid #00ff00', marginBottom: '5px', fontWeight: 'bold' }}>=== Developer Mode ===</div>
          <div>Mouse: ({mousePos.x}, {mousePos.y})</div>
          <div>Zoom: {Math.round(scale * 100)}%</div>
          <div>Mode: {mode}</div>
          <div>Items: {items.length}</div>
          <div>Selection: {selectedIds.length > 0 ? selectedIds.length : 'None'}</div>
          {selectedIds.length === 1 && (() => {
            const item = items.find(i => i.id === selectedIds[0]);
            const index = items.findIndex(i => i.id === selectedIds[0]);
            if (!item) return null;
            return (
              <div style={{ marginTop: '5px', borderTop: '1px solid #555', paddingTop: '5px' }}>
                <div style={{ color: '#ffff00' }}>[Selected Item]</div>
                <div>ID: {item.id.slice(0, 8)}...</div>
                <div>Type: {item.type}</div>
                <div>Z-Order: {index}</div>
                <div>Pos: ({Math.round(item.x)}, {Math.round(item.y)})</div>
                {item.type === 'stamp' && <div>Size: r={item.radius}</div>}
                {item.type === 'rectangle' && <div>Size: {Math.round(item.width)}x{Math.round(item.height)}</div>}
                {item.type === 'text' && <div>Size: {item.fontSize}px</div>}
                {(item.type === 'pen' || item.type === 'line') && <div>Points: {item.points.length / 2}</div>}
              </div>
            );
          })()}
          {selectedIds.length > 1 && (
            <div style={{ marginTop: '5px', borderTop: '1px solid #555', paddingTop: '5px' }}>
              <div style={{ color: '#ffff00' }}>[Multi Selection]</div>
              <div>Count: {selectedIds.length}</div>
            </div>
          )}
          <div>Project: {projectName}</div>
          {imageSrc && <div>Image: {imageSize.width}x{imageSize.height}</div>}
        </div>
      )
      }
    </ErrorBoundary>
  );
}

export default App;
