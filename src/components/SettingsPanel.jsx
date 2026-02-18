import { RgbaStringColorPicker } from 'react-colorful';
import { useState, useRef, useEffect } from 'react';
import { AlignLeft, AlignCenter, AlignRight, ArrowUpFromLine, ArrowDownToLine, Minus, Minimize, ScanLine } from 'lucide-react';

import { validateProjectName } from '../utils/validation';
import Tooltip from './Tooltip';

// Simple Popover component for color picker
const ColorPickerPopover = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef();

  const handleClickOutside = (event) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="color-picker-wrapper" style={{ position: 'relative' }}>
      <div
        style={{
          width: '30px',
          height: '30px',
          backgroundColor: color,
          border: '1px solid #ccc',
          cursor: 'pointer',
          borderRadius: '4px',
          background: `linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)`,
          backgroundSize: '10px 10px',
          backgroundPosition: '0 0, 5px 5px'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ width: '100%', height: '100%', backgroundColor: color, borderRadius: '4px' }}></div>
      </div>

      {isOpen && (
        <div className="popover" ref={popoverRef} style={{ position: 'absolute', zIndex: 100, top: '100%', left: 0, marginTop: '5px' }}>
          <RgbaStringColorPicker color={color} onChange={onChange} />
        </div>
      )}
    </div>
  );
};


const SettingsPanel = ({ settings, setSettings, selectedItem, updateSelectedItem, mode, onDelete, projectName, setProjectName }) => {

  // 選択中のアイテムがあればそれの設定、なければ現在のツールの設定を表示
  const currentSettings = selectedItem ? selectedItem : settings;
  const isEditing = !!selectedItem;

  const handleChange = (key, value) => {
    if (isEditing) {
      updateSelectedItem(selectedItem.id, { [key]: value });
    } else {
      setSettings(prev => ({ ...prev, [key]: value }));
    }
  };

  const colors = ['#FF0000', '#0000FF', '#008000', '#FFA500', '#000000', '#FFFFFF'];

  const projectValidation = validateProjectName(projectName);

  return (
    <div className="settings-panel">


      {mode === 'select' && (
        <div className="settings-group">
          <h4>プロジェクト名</h4>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            style={{
              width: '100%',
              padding: '5px',
              marginBottom: '5px',
              border: projectValidation.isValid ? '1px solid #888' : '2px solid #ff4d4d',
              backgroundColor: 'white',
              color: 'black',
              borderRadius: '2px'
            }}
            placeholder="project-name"
          />
          {!projectValidation.isValid && (
            <div style={{ color: '#ff4d4d', fontSize: '11px', marginBottom: '5px' }}>
              {projectValidation.error}
            </div>
          )}
        </div>
      )}

      <div style={{
        padding: '10px',
        marginBottom: '15px',
        backgroundColor: '#e8f4fc',
        border: '1px solid #b6e0fe',
        borderRadius: '4px',
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#005a9c'
      }}>
        現在のモード: {
          mode === 'select' ? '選択 (Select)' :
            mode === 'stamp' ? 'スタンプ (Stamp)' :
              mode === 'rectangle' ? '矩形 (Rectangle)' : mode
        }
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>設定 ({isEditing ? '選択中' : '新規'})</h3>
        {isEditing && (
          <button
            onClick={onDelete}
            style={{
              backgroundColor: '#ff4d4d',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            削除
          </button>
        )}
      </div>

      {(mode === 'stamp' || (selectedItem && selectedItem.type === 'stamp')) && (
        <>
          <div className="settings-group">
            <h4>スタンプ設定</h4>
            <div className="settings-row">
              <label>番号</label>
              <input
                type="number"
                value={currentSettings.number}
                onChange={(e) => handleChange('number', parseInt(e.target.value))}
              />
            </div>

            {!isEditing && (
              <div className="settings-row">
                <label>増分</label>
                <input
                  type="number"
                  value={settings.step || 1}
                  onChange={(e) => setSettings(prev => ({ ...prev, step: parseInt(e.target.value) }))}
                />
              </div>
            )}

            <div className="settings-row">
              <label>サイズ</label>
              <input
                type="range"
                min="10"
                max="50"
                value={currentSettings.radius}
                onChange={(e) => handleChange('radius', parseInt(e.target.value))}
              />
              <span>{currentSettings.radius}</span>
            </div>

            <div className="settings-row">
              <label>形状</label>
              <select
                value={currentSettings.shape}
                onChange={(e) => handleChange('shape', e.target.value)}
              >
                <option value="circle">円 (Circle)</option>
                <option value="square">角丸四角 (Square)</option>
              </select>
            </div>
          </div>
        </>
      )}

      {(mode !== 'select' || selectedItem) && (
        <div className="settings-group">
          <h4>色設定</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <ColorPickerPopover
              color={currentSettings.color}
              onChange={(newColor) => handleChange('color', newColor)}
            />
            <span style={{ fontSize: '12px', color: '#666' }}>{currentSettings.color}</span>
          </div>
        </div>
      )}

      {(mode === 'rectangle' || (selectedItem && selectedItem.type === 'rectangle')) && (
        <div className="settings-group">
          <h4>矩形設定</h4>

          <div className="settings-row">
            <label>線の太さ</label>
            <input
              type="range"
              min="1"
              max="20"
              value={currentSettings.strokeWidth || 5}
              onChange={(e) => handleChange('strokeWidth', parseInt(e.target.value))}
            />
            <span>{currentSettings.strokeWidth || 5}px</span>
          </div>


          <div className="settings-group">
            <h4>塗りつぶし色</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ColorPickerPopover
                color={currentSettings.fill || 'rgba(0,0,0,0)'}
                onChange={(newColor) => handleChange('fill', newColor)}
              />
              <span style={{ fontSize: '12px', color: '#666' }}>{currentSettings.fill}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
              <Tooltip text="透明">
                <div
                  className={`color-option ${currentSettings.fill === 'transparent' ? 'selected' : ''}`}
                  style={{
                    width: '24px', height: '24px', border: '1px solid #ccc',
                    background: 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)',
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 4px 4px',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleChange('fill', 'transparent')}
                />
              </Tooltip>
              {colors.map(c => (
                <div
                  key={c}
                  className={`color-option ${currentSettings.fill === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c, width: '24px', height: '24px', cursor: 'pointer', border: currentSettings.fill === c ? '2px solid black' : '1px solid #ddd' }}
                  onClick={() => handleChange('fill', c)}
                />
              ))}
            </div>
          </div>

          <div className="settings-group">
            <h4>矩形内テキスト設定</h4>
            <div className="settings-row" style={{ display: 'block' }}>
              <label style={{ marginBottom: '5px', display: 'block' }}>テキスト内容</label>
              <textarea
                value={isEditing ? (selectedItem.text || '') : (settings.rectText || '')}
                onChange={(e) => handleChange(isEditing ? 'text' : 'rectText', e.target.value)}
                style={{ width: '100%', height: '60px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                placeholder="テキストを入力..."
              />
            </div>

            <div className="settings-row">
              <label>フォントサイズ</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="number"
                  min="8"
                  max="200"
                  value={isEditing ? (selectedItem.fontSize || 24) : (settings.rectFontSize || 24)}
                  onChange={(e) => handleChange(isEditing ? 'fontSize' : 'rectFontSize', parseInt(e.target.value))}
                  style={{ width: '50px' }}
                />
                <span>px</span>
              </div>
            </div>

            <div className="settings-row">
              <label>フォント</label>
              <select
                value={isEditing ? (selectedItem.fontFamily || 'Arial') : (settings.rectFontFamily || 'Arial')}
                onChange={(e) => handleChange(isEditing ? 'fontFamily' : 'rectFontFamily', e.target.value)}
                style={{ width: '130px' }}
              >
                <option value="Arial">Arial</option>
                <option value="Verdana">Verdana</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="serif">Serif</option>
                <option value="sans-serif">Sans-serif</option>
                <option value="monospace">Monospace</option>
                <option value="'Yu Gothic', 'YuGothic'">游ゴシック</option>
                <option value="'Meiryo', 'Hiragino Kaku Gothic ProN'">メイリオ/ヒラギノ角ゴ</option>
              </select>
            </div>

            <div className="settings-row">
              <label>文字色</label>
              <ColorPickerPopover
                color={isEditing ? (selectedItem.textColor || '#000000') : (settings.rectTextColor || '#000000')}
                onChange={(newColor) => handleChange(isEditing ? 'textColor' : 'rectTextColor', newColor)}
              />
            </div>

            <div className="settings-row" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '5px' }}>
              <label>配置</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                 {/* Horizontal Align */}
                <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '4px' }}>
                  {['left', 'center', 'right'].map((align) => (
                    <div
                      key={align}
                      onClick={() => handleChange(isEditing ? 'align' : 'rectAlign', align)}
                      style={{
                        padding: '5px',
                        cursor: 'pointer',
                        backgroundColor: (isEditing ? (selectedItem.align || 'center') : (settings.rectAlign || 'center')) === align ? '#e0e0e0' : 'transparent',
                        display: 'flex', alignItems: 'center'
                      }}
                      title={align}
                    >
                      {align === 'left' && <AlignLeft size={16} />}
                      {align === 'center' && <AlignCenter size={16} />}
                      {align === 'right' && <AlignRight size={16} />}
                    </div>
                  ))}
                </div>

                {/* Vertical Align */}
                <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '4px' }}>
                  {['top', 'middle', 'bottom'].map((valign) => (
                    <div
                      key={valign}
                      onClick={() => handleChange(isEditing ? 'verticalAlign' : 'rectVerticalAlign', valign)}
                      style={{
                        padding: '5px',
                        cursor: 'pointer',
                        backgroundColor: (isEditing ? (selectedItem.verticalAlign || 'middle') : (settings.rectVerticalAlign || 'middle')) === valign ? '#e0e0e0' : 'transparent',
                        display: 'flex', alignItems: 'center'
                      }}
                      title={valign}
                    >
                      {valign === 'top' && <ArrowUpFromLine size={16} />}
                      {valign === 'middle' && <Minus size={16} />}
                      {valign === 'bottom' && <ArrowDownToLine size={16} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="settings-row">
              <label>折り返し</label>
              <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '4px' }}>
                <div
                  onClick={() => handleChange(isEditing ? 'wrap' : 'rectTextWrap', 'none')}
                  style={{
                    padding: '5px 10px',
                    cursor: 'pointer',
                    backgroundColor: (isEditing ? (selectedItem.wrap || 'none') : (settings.rectTextWrap || 'none')) === 'none' ? '#e0e0e0' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px'
                  }}
                  title="はみ出す"
                >
                  <ScanLine size={16} /> <span>はみ出す</span>
                </div>
                <div
                  onClick={() => handleChange(isEditing ? 'wrap' : 'rectTextWrap', 'fit')}
                  style={{
                    padding: '5px 10px',
                    cursor: 'pointer',
                    backgroundColor: (isEditing ? (selectedItem.wrap || 'none') : (settings.rectTextWrap || 'none')) === 'fit' ? '#e0e0e0' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', borderLeft: '1px solid #ccc'
                  }}
                  title="収める"
                >
                  <Minimize size={16} /> <span>収める</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {(mode === 'text' || (selectedItem && selectedItem.type === 'text')) && (
        <div className="settings-group">
          <h4>テキスト設定</h4>
          <div className="settings-row" style={{ display: 'block' }}>
            <label style={{ marginBottom: '5px', display: 'block' }}>テキスト内容</label>
            <textarea
              value={currentSettings.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              style={{ width: '100%', height: '60px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div className="settings-row">
            <label>フォントサイズ</label>
            <input
              type="number"
              min="8"
              max="200"
              value={currentSettings.fontSize || 24}
              onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
              style={{ width: '60px' }}
            />
            <span>px</span>
          </div>

          <div className="settings-row">
            <label>フォント</label>
            <select
              value={currentSettings.fontFamily || 'Arial'}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
              style={{ width: '130px' }}
            >
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="serif">Serif</option>
              <option value="sans-serif">Sans-serif</option>
              <option value="monospace">Monospace</option>
              <option value="'Yu Gothic', 'YuGothic'">游ゴシック</option>
              <option value="'Meiryo', 'Hiragino Kaku Gothic ProN'">メイリオ/ヒラギノ角ゴ</option>
            </select>
          </div>

          <div className="settings-row">
            <label>文字色</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ColorPickerPopover
                color={currentSettings.fill || '#000000'} // Text uses 'fill' for color
                onChange={(newColor) => handleChange('fill', newColor)}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SettingsPanel;
