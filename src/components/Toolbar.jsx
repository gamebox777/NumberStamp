import React, { useState, useEffect, useRef } from 'react';
import { MousePointer2, Stamp, Square, Type, Download, Image as ImageIcon, FileJson, FolderOpen, Trash2, Undo2, Redo2, ChevronDown } from 'lucide-react';
import Tooltip from './Tooltip';

const Toolbar = ({ mode, setMode, onExport, onLoadImage, onSaveProject, onLoadProject, onClearAll, undo, redo, canUndo, canRedo }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExportClick = (format) => {
    onExport(format);
    setShowExportMenu(false);
  };

  return (
    <div className="toolbar">
      <Tooltip text="選択 (Select)" position="right">
        <div
          className={`toolbar-button ${mode === 'select' ? 'active' : ''}`}
          onClick={() => setMode('select')}
        >
          <MousePointer2 size={24} />
        </div>
      </Tooltip>

      <Tooltip text="スタンプ (Stamp)" position="right">
        <div
          className={`toolbar-button ${mode === 'stamp' ? 'active' : ''}`}
          onClick={() => setMode('stamp')}
        >
          <Stamp size={24} />
        </div>
      </Tooltip>

      <Tooltip text="矩形 (Rectangle)" position="right">
        <div
          className={`toolbar-button ${mode === 'rectangle' ? 'active' : ''}`}
          onClick={() => setMode('rectangle')}
        >
          <Square size={24} />
        </div>
      </Tooltip>

      <Tooltip text="テキスト (Text)" position="right">
        <div
          className={`toolbar-button ${mode === 'text' ? 'active' : ''}`}
          onClick={() => setMode('text')}
        >
          <Type size={24} />
        </div>
      </Tooltip>

      <div style={{ flex: 0.2, borderBottom: '1px solid #ccc', margin: '5px 0', width: '80%' }}></div>

      <Tooltip text="元に戻す (Ctrl+Z)" position="right">
        <div
          className="toolbar-button"
          onClick={undo}
          style={{ opacity: canUndo ? 1 : 0.3, cursor: canUndo ? 'pointer' : 'default' }}
        >
          <Undo2 size={24} />
        </div>
      </Tooltip>

      <Tooltip text="やり直し (Ctrl+Y)" position="right">
        <div
          className="toolbar-button"
          onClick={redo}
          style={{ opacity: canRedo ? 1 : 0.3, cursor: canRedo ? 'pointer' : 'default' }}
        >
          <Redo2 size={24} />
        </div>
      </Tooltip>

      <div style={{ flex: 1 }}></div>

      <Tooltip text="画像を読み込む" position="right">
        <div
          className="toolbar-button"
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
      </Tooltip>

      <Tooltip text="プロジェクトを読み込む" position="right">
        <div
          className="toolbar-button"
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
      </Tooltip>

      <Tooltip text="プロジェクトを保存" position="right">
        <div
          className="toolbar-button"
          onClick={onSaveProject}
        >
          <FileJson size={24} />
        </div>
      </Tooltip>

      <div style={{ position: 'relative' }} ref={exportMenuRef}>
        <Tooltip text="画像を保存" position="right">
          <div
            className="toolbar-button"
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            <Download size={24} />
            <ChevronDown size={12} style={{ position: 'absolute', bottom: '2px', right: '2px' }} />
          </div>
        </Tooltip>
        {showExportMenu && (
          <div style={{
            position: 'absolute',
            left: '100%', // 右側に表示
            top: '0',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 100,
            whiteSpace: 'nowrap'
          }}>
            <div
              style={{ padding: '8px 16px', cursor: 'pointer', hover: { backgroundColor: '#f0f0f0' } }}
              onClick={() => handleExportClick('image/png')}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              PNGで保存
            </div>
            <div
              style={{ padding: '8px 16px', cursor: 'pointer' }}
              onClick={() => handleExportClick('image/jpeg')}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              JPGで保存
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 0.5 }}></div>

      <Tooltip text="新規 (All Clear)" position="right">
        <div
          className="toolbar-button"
          onClick={onClearAll}
          style={{ color: '#d32f2f' }}
        >
          <Trash2 size={24} />
        </div>
      </Tooltip>
    </div >
  );
};
export default Toolbar;
