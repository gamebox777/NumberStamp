import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import Toolbar from './components/Toolbar';
import SettingsPanel from './components/SettingsPanel';
import CanvasArea from './components/CanvasArea';
import ErrorBoundary from './components/ErrorBoundary';
import useUndoRedo from './hooks/useUndoRedo';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [items, setItems, undo, redo, canUndo, canRedo, resetItems] = useUndoRedo([]);
  const [mode, setMode] = useState('stamp'); // select, stamp, rectangle
  const [settings, setSettings] = useState({
    number: 1,
    step: 1,
    color: '#FF0000',
    radius: 20,
    shape: 'circle',
    brush_color: '',
    line_width: 2,
    pen_style: 'solid'
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageName, setImageName] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });
  const stageRef = useRef(null);

  // キーボードショートカット (Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);

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

  // アイテム更新
  const updateItem = (id, newAttrs) => {
    setItems(items.map(item => item.id === id ? { ...item, ...newAttrs } : item));
    
    // 設定パネルからの変更を現在の設定にも反映させるか？
    // 選択中のアイテムの設定を変更した場合、次に追加するアイテムの設定もそれに合わせるかどうか。
    // 通常は合わせない方が使いやすいが、要望次第。今回は合わせない。
  };

  // アイテム削除
  const handleDeleteItem = () => {
    if (selectedIds.length > 0) {
      setItems(items.filter(item => !selectedIds.includes(item.id)));
      setSelectedIds([]);
    }
  };

  // ファイル保存ヘルパー (File System Access API with fallback)
  const saveFile = async (blob, defaultName, types) => {
    try {
        if (window.showSaveFilePicker) {
            const handle = await window.showSaveFilePicker({
                suggestedName: defaultName,
                types: types
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
        } else {
            // Fallback for browsers not supporting File System Access API
            const filename = window.prompt('ファイル名を入力してください', defaultName);
            if (!filename) return; // キャンセル

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Save failed:', err);
            alert('保存に失敗しました');
        }
    }
  };

  // 画像エクスポート
  const handleExport = () => {
    if (!stageRef.current) return;
    
    // 選択枠などを消すために一時的に選択解除
    const currentSelected = selectedIds;
    setSelectedIds([]);

    // Reactの状態更新が反映されるのを待つ
    setTimeout(async () => {
        try {
            const uri = stageRef.current.toDataURL({ pixelRatio: 2 }); // 高画質化
            
            // dataURL to Blob
            const res = await fetch(uri);
            const blob = await res.blob();
            
            await saveFile(blob, 'numstamp_export.png', [{
                description: 'PNG Images',
                accept: { 'image/png': ['.png'] }
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
    const projectData = {
        items,
        imageSrc,
        imageSize,
        settings,
        version: '1.0'
    };
    
    const json = JSON.stringify(projectData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    
    await saveFile(blob, 'numstamp_project.json', [{
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
          <div className="canvas-area-wrapper" style={{ flex: 1, overflow: 'auto', display: 'grid', placeItems: 'center', backgroundColor: '#e0e0e0', padding: '20px' }}>
              <CanvasArea 
                ref={stageRef}
                imageSrc={imageSrc}
                mode={mode}
                items={items}
                setItems={setItems}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                settings={settings}
                scale={scale}
              />
          </div>
          {imageSrc && (
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '12px',
              pointerEvents: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}>
              {imageName} ({imageSize.width} x {imageSize.height})
            </div>
          )}
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '-12px', // ボタンの幅の半分くらい左に出す
                    transform: 'translateY(-50%)',
                    width: '24px',
                    height: '48px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRight: 'none', // 右側の境界線はサイドバーと重複するので消すかもしくはそのまま
                    borderRadius: '4px 0 0 4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    fontSize: '10px',
                    color: '#666',
                    boxShadow: '-1px 0 2px rgba(0,0,0,0.1)'
                }}
                title={isSidebarOpen ? "設定パネルを閉じる" : "設定パネルを開く"}
            >
                {isSidebarOpen ? '▶' : '◀'}
            </button>
            <div className="right-sidebar" 
                onClick={() => !isSidebarOpen && setIsSidebarOpen(true)}
                style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%', 
                borderLeft: '1px solid #ccc', 
                backgroundColor: isSidebarOpen ? '#f8f8f8' : '#e8e8e8',
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
                    updateSelectedItem={updateItem}
                    mode={mode}
                    onDelete={handleDeleteItem}
                  />
                  
                  {/* Zoom Control */}
                  <div style={{ padding: '15px', borderTop: '1px solid #ccc', backgroundColor: '#f0f0f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>ズーム</span>
                          <span style={{ fontSize: '12px' }}>{Math.round(scale * 100)}%</span>
                      </div>
                      <input 
                          type="range" 
                          min="0.1" 
                          max="3.0" 
                          step="0.1" 
                          value={scale} 
                          onChange={(e) => setScale(parseFloat(e.target.value))}
                          style={{ width: '100%' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                          <button onClick={() => setScale(Math.max(0.1, scale - 0.1))} style={{ fontSize: '10px', padding: '2px 5px' }}>-</button>
                          <button onClick={() => setScale(1.0)} style={{ fontSize: '10px', padding: '2px 5px' }}>100%</button>
                          <button onClick={() => setScale(Math.min(3.0, scale + 0.1))} style={{ fontSize: '10px', padding: '2px 5px' }}>+</button>
                      </div>
                  </div>
              </div>
            </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
