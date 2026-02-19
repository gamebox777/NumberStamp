import React, { useState, useEffect, useRef } from 'react';
import { MousePointer2, Stamp, Square, Type, Pen, ArrowRight, Download, Image as ImageIcon, FileJson, FolderOpen, Trash2, Undo2, Redo2, ChevronDown } from 'lucide-react';
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
          <MousePointer2 size={20} />
        </div>
      </Tooltip>

      <Tooltip text="スタンプ (Stamp)" position="right">
        <div
          className={`toolbar-button ${mode === 'stamp' ? 'active' : ''}`}
          onClick={() => setMode('stamp')}
        >
          <Stamp size={20} />
        </div>
      </Tooltip>

      <Tooltip text="矩形 (Rectangle)" position="right">
        <div
          className={`toolbar-button ${mode === 'rectangle' ? 'active' : ''}`}
          onClick={() => setMode('rectangle')}
        >
          <Square size={20} />
        </div>
      </Tooltip>

      <Tooltip text="テキスト (Text)" position="right">
        <div
          className={`toolbar-button ${mode === 'text' ? 'active' : ''}`}
          onClick={() => setMode('text')}
        >
          <Type size={20} />
        </div>
      </Tooltip>

      <Tooltip text="ペン (Pen)" position="right">
        <div
          className={`toolbar-button ${mode === 'pen' ? 'active' : ''}`}
          onClick={() => setMode('pen')}
        >
          <Pen size={20} />
        </div>
      </Tooltip>

      <Tooltip text="直線・矢印 (Line/Arrow)" position="right">
        <div
          className={`toolbar-button ${mode === 'line' ? 'active' : ''}`}
          onClick={() => setMode('line')}
        >
          <ArrowRight size={20} />
        </div>
      </Tooltip>

      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', margin: '6px 0', width: '60%' }}></div>

      <Tooltip text="元に戻す (Ctrl+Z)" position="right">
        <div
          className="toolbar-button"
          onClick={undo}
          style={{ opacity: canUndo ? 1 : 0.3, cursor: canUndo ? 'pointer' : 'default' }}
        >
          <Undo2 size={20} />
        </div>
      </Tooltip>

      <Tooltip text="やり直し (Ctrl+Y)" position="right">
        <div
          className="toolbar-button"
          onClick={redo}
          style={{ opacity: canRedo ? 1 : 0.3, cursor: canRedo ? 'pointer' : 'default' }}
        >
          <Redo2 size={20} />
        </div>
      </Tooltip>

      <div style={{ flex: 1 }}></div>

      <Tooltip text="画像を読み込む" position="right">
        <div
          className="toolbar-button"
        >
          <label htmlFor="file-upload" style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ImageIcon size={20} />
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              onLoadImage(e);
              e.target.value = '';
            }}
            style={{ display: 'none' }}
          />
        </div>
      </Tooltip>

      <Tooltip text="プロジェクトを読み込む" position="right">
        <div
          className="toolbar-button"
        >
          <label htmlFor="project-upload" style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <FolderOpen size={20} />
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
          <FileJson size={20} />
        </div>
      </Tooltip>

      <div style={{ position: 'relative' }} ref={exportMenuRef}>
        <Tooltip text="画像を保存" position="right">
          <div
            className="toolbar-button"
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            <Download size={20} />
            <ChevronDown size={10} style={{ position: 'absolute', bottom: '3px', right: '3px', opacity: 0.6 }} />
          </div>
        </Tooltip>
        {showExportMenu && (
          <div style={{
            position: 'absolute',
            left: '100%',
            top: '0',
            marginLeft: '4px',
            backgroundColor: '#fff',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 100,
            whiteSpace: 'nowrap',
            padding: '4px',
            minWidth: '140px'
          }}>
            <div
              style={{ padding: '8px 14px', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', fontWeight: 500, color: '#1e293b', transition: 'background-color 150ms ease' }}
              onClick={() => handleExportClick('image/png')}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#eff6ff'; e.target.style.color = '#2563eb'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#1e293b'; }}
            >
              PNGで保存
            </div>
            <div
              style={{ padding: '8px 14px', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', fontWeight: 500, color: '#1e293b', transition: 'background-color 150ms ease' }}
              onClick={() => handleExportClick('image/jpeg')}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#eff6ff'; e.target.style.color = '#2563eb'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#1e293b'; }}
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
          style={{ color: '#f87171' }}
        >
          <Trash2 size={20} />
        </div>
      </Tooltip>
    </div >
  );
};
export default Toolbar;
