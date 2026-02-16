import React from 'react';
import { MousePointer2, Stamp, Square, Download, Image as ImageIcon } from 'lucide-react';

const Toolbar = ({ mode, setMode, onExport, onLoadImage }) => {
  return (
    <div className="toolbar">
      <div 
        className={`toolbar-button ${mode === 'select' ? 'active' : ''}`}
        onClick={() => setMode('select')}
        title="選択 (Select)"
      >
        <MousePointer2 size={24} />
      </div>
      
      <div 
        className={`toolbar-button ${mode === 'stamp' ? 'active' : ''}`}
        onClick={() => setMode('stamp')}
        title="スタンプ (Stamp)"
      >
        <Stamp size={24} />
      </div>

      <div 
        className={`toolbar-button ${mode === 'rectangle' ? 'active' : ''}`}
        onClick={() => setMode('rectangle')}
        title="矩形 (Rectangle)"
      >
        <Square size={24} />
      </div>

      <div style={{ flex: 1 }}></div>

      <div 
        className="toolbar-button"
        title="画像を読み込む"
      >
        <label htmlFor="file-upload" style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ImageIcon size={24} />
        </label>
        <input 
            id="file-upload" 
            type="file" 
            accept="image/*" 
            onChange={onLoadImage} 
            style={{ display: 'none' }} 
        />
      </div>

      <div 
        className="toolbar-button"
        onClick={onExport}
        title="画像を保存"
      >
        <Download size={24} />
      </div>
    </div>
  );
};

export default Toolbar;
