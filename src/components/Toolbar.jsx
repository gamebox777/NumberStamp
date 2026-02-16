import React from 'react';
import { MousePointer2, Stamp, Square, Download, Image as ImageIcon, FileJson, FolderOpen, Trash2, Undo2, Redo2 } from 'lucide-react';

const Toolbar = ({ mode, setMode, onExport, onLoadImage, onSaveProject, onLoadProject, onClearAll, undo, redo, canUndo, canRedo }) => {
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

      <div style={{ flex: 0.2, borderBottom: '1px solid #ccc', margin: '5px 0', width: '80%' }}></div>

      <div 
        className="toolbar-button"
        onClick={undo}
        title="元に戻す (Ctrl+Z)"
        style={{ opacity: canUndo ? 1 : 0.3, cursor: canUndo ? 'pointer' : 'default' }}
      >
        <Undo2 size={24} />
      </div>

      <div 
        className="toolbar-button"
        onClick={redo}
        title="やり直し (Ctrl+Y)"
        style={{ opacity: canRedo ? 1 : 0.3, cursor: canRedo ? 'pointer' : 'default' }}
      >
        <Redo2 size={24} />
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
        title="プロジェクトを読み込む"
      >
        <label htmlFor="project-upload" style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <FolderOpen size={24} />
        </label>
        <input 
            id="project-upload" 
            type="file" 
            accept=".json" 
            onChange={onLoadProject} 
            style={{ display: 'none' }} 
        />
      </div>

      <div 
        className="toolbar-button"
        onClick={onSaveProject}
        title="プロジェクトを保存"
      >
        <FileJson size={24} />
      </div>

      <div 
        className="toolbar-button"
        onClick={onExport}
        title="画像を保存"
      >
        <Download size={24} />
      </div>

      <div style={{ flex: 0.5 }}></div>

      <div 
        className="toolbar-button"
        onClick={onClearAll}
        title="新規 (All Clear)"
        style={{ color: '#d32f2f' }}
      >
        <Trash2 size={24} />
      </div>
    </div>
  );
};

export default Toolbar;
