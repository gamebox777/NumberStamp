import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import Toolbar from './components/Toolbar';
import SettingsPanel from './components/SettingsPanel';
import CanvasArea from './components/CanvasArea';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [items, setItems] = useState([]);
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
  const [selectedId, setSelectedId] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });
  const stageRef = useRef(null);

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
        // リセット
        setItems([]);
        setSelectedId(null);
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

  // 画像エクスポート
  const handleExport = () => {
    if (!stageRef.current) return;
    
    // 選択枠などを消すために一時的に選択解除
    const currentSelected = selectedId;
    setSelectedId(null);

    // Reactの状態更新が反映されるのを待つ必要があるが、
    // konvaは即時描画ではないため少し待つか、Transformerのrefを使って制御する。
    // ここでは簡易的にsetTimeoutを使う。
    setTimeout(() => {
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 }); // 高画質化
        const link = document.createElement('a');
        link.download = 'numstamp_export.png';
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 選択状態を戻す
        setSelectedId(currentSelected);
    }, 100);
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

  const selectedItem = items.find(i => i.id === selectedId);

  return (
    <div className="app-container" onDrop={handleDrop} onDragOver={handleDragOver}>
      <Toolbar 
        mode={mode} 
        setMode={(m) => {
             setMode(m);
             setSelectedId(null); // モード切替時に選択解除
        }}
        onExport={handleExport}
        onLoadImage={(e) => {
             // input type="file" のonChangeイベント
             handleImageLoad(e);
        }}
      />
      
      <div className="canvas-area-wrapper" style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', backgroundColor: '#e0e0e0', padding: '20px' }}>
          <CanvasArea 
            imageSrc={imageSrc}
            mode={mode}
            items={items}
            setItems={setItems}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            settings={settings}
            stageRef={stageRef} // エクスポート用に渡したいが、CanvasArea内でref定義しているので、forwardRefが必要
            // 今回は簡易的にCanvasAreaからrefをlift upするか、CanvasArea内でエクスポート関数を定義してrefで公開するか。
            // あるいは、itemsとsettingsとimageSrcがあれば再構築可能なので、非表示のStageを作ってエクスポートする方法もある。
            // 最も簡単なのは、CanvasArea内でStageにrefを渡し、それを親に渡すこと。
            // CanvasAreaをforwardRefでラップして実装し直す。
          />
      </div>

      <SettingsPanel 
        settings={settings}
        setSettings={setSettings}
        selectedItem={selectedItem}
        updateSelectedItem={updateItem}
        mode={mode}
      />
    </div>
  );
}

export default App;
