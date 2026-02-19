import { useState, useRef, useEffect, useCallback } from 'react';
import { RgbaStringColorPicker } from 'react-colorful';
import { AlignLeft, AlignCenter, AlignRight, ArrowUpFromLine, ArrowDownToLine, Minus, Minimize, ScanLine, RotateCcw, Palette } from 'lucide-react';

import { validateProjectName } from '../utils/validation';
import Tooltip from './Tooltip';
import { DEFAULT_STYLES } from '../constants/defaults';

// 基本プリセットカラー
const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#008000', '#0000FF',
  '#FFFF00', '#FFA500', '#800080', '#FFC0CB', '#808080'
];

// 最近使った色の履歴管理
const COLOR_HISTORY_KEY = 'numberStamp_colorHistory';
const MAX_COLOR_HISTORY = 5;

const getColorHistory = () => {
  try {
    const stored = localStorage.getItem(COLOR_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addColorToHistory = (color) => {
  if (!color) return;
  // rgba系の色や透明は履歴に追加しない
  const normalizedColor = color.toLowerCase().trim();
  if (normalizedColor === 'transparent') return;

  const history = getColorHistory();
  // 既に同じ色がある場合は先頭に移動
  const filtered = history.filter(c => c.toLowerCase() !== normalizedColor);
  filtered.unshift(color);
  // 最大5件に制限
  const trimmed = filtered.slice(0, MAX_COLOR_HISTORY);
  localStorage.setItem(COLOR_HISTORY_KEY, JSON.stringify(trimmed));
};

const ColorPickerPopover = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [colorHistory, setColorHistory] = useState(getColorHistory);
  const popoverRef = useRef();
  const buttonRef = useRef();
  const showPickerRef = useRef(false);
  const colorRef = useRef(color);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  // refを最新値に同期
  useEffect(() => { showPickerRef.current = showPicker; }, [showPicker]);
  useEffect(() => { colorRef.current = color; }, [color]);

  const handleClickOutside = (event) => {
    if (
      popoverRef.current && !popoverRef.current.contains(event.target) &&
      buttonRef.current && !buttonRef.current.contains(event.target)
    ) {
      // フリーカラーピッカーが開いていた場合、閉じる時に現在の色を履歴に追加
      if (showPickerRef.current) {
        addColorToHistory(colorRef.current);
      }
      setIsOpen(false);
      setShowPicker(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ポップオーバーの位置をボタンの位置から計算
  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // ポップオーバーの幅（約220px）を考慮して左に寄せる
      const popoverWidth = 220;
      let left = rect.right - popoverWidth;
      // 画面左端からはみ出さないように
      if (left < 5) left = 5;
      // 画面下端からはみ出す場合は上に表示
      const popoverHeight = showPicker ? 320 : 80;
      let top = rect.bottom + 5;
      if (top + popoverHeight > window.innerHeight) {
        top = rect.top - popoverHeight - 5;
      }
      setPopoverPos({ top, left });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      setColorHistory(getColorHistory());
      updatePosition();
    } else {
      // フリーカラーピッカーが開いていた場合、閉じる時に現在の色を履歴に追加
      if (showPicker) {
        addColorToHistory(color);
        setColorHistory(getColorHistory());
      }
      setShowPicker(false);
    }
    setIsOpen(!isOpen);
  };

  // フリーカラーピッカーの表示切替時に位置を再計算
  const handleTogglePicker = () => {
    setShowPicker(prev => {
      // 次のtickで位置を更新
      setTimeout(() => updatePosition(), 0);
      return !prev;
    });
  };

  const handleColorChange = useCallback((newColor) => {
    onChange(newColor);
  }, [onChange]);

  // フリーカラーピッカーで色変更が完了した時（mouseup時）に履歴に追加
  const handleColorChangeComplete = useCallback((newColor) => {
    addColorToHistory(newColor);
    setColorHistory(getColorHistory());
    onChange(newColor);
  }, [onChange]);

  const handleHistoryColorClick = (historyColor) => {
    onChange(historyColor);
    addColorToHistory(historyColor);
    setColorHistory(getColorHistory());
  };

  const transparentPattern = {
    backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)`,
    backgroundSize: '10px 10px',
    backgroundPosition: '0 0, 5px 5px'
  };

  // 虹色グラデーションスタイル
  const rainbowStyle = {
    background: 'linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00cc00, #0088ff, #8800ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <div className="color-picker-wrapper" style={{ position: 'relative' }}>
      <div
        ref={buttonRef}
        style={{
          width: '30px',
          height: '30px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          borderRadius: '4px',
          ...transparentPattern
        }}
        onClick={handleToggle}
      >
        <div style={{ width: '100%', height: '100%', backgroundColor: color, borderRadius: '4px' }}></div>
      </div>

      {isOpen && (
        <div
          className="popover"
          ref={popoverRef}
          style={{
            position: 'fixed',
            zIndex: 10000,
            top: popoverPos.top,
            left: popoverPos.left,
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            border: '1px solid #ddd'
          }}
        >
          {/* 最近使った色の履歴 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap' }}>履歴:</span>
            {colorHistory.length > 0 ? (
              colorHistory.map((histColor, idx) => (
                <div
                  key={`${histColor}-${idx}`}
                  onClick={() => handleHistoryColorClick(histColor)}
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: histColor,
                    border: color === histColor ? '2px solid #333' : '1px solid #ccc',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    flexShrink: 0,
                  }}
                  title={histColor}
                />
              ))
            ) : (
              <span style={{ fontSize: '11px', color: '#bbb' }}>なし</span>
            )}
          </div>

          {/* 基本色プリセット */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px', width: '200px' }}>
            {PRESET_COLORS.map((preset) => (
              <div
                key={preset}
                onClick={() => onChange(preset)}
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: preset,
                  border: color === preset ? '2px solid #333' : '1px solid #ccc',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
                title={preset}
              />
            ))}
          </div>

          {/* 虹色ピッカーアイコン（クリックでフリーカラーパレットを開閉） */}
          <div
            onClick={handleTogglePicker}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: '5px 8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              backgroundColor: showPicker ? '#f0f0f0' : '#fafafa',
              marginBottom: showPicker ? '8px' : '0',
              userSelect: 'none',
              transition: 'background-color 0.15s',
            }}
            title="フリーカラーパレットを開く"
          >
            <Palette size={16} style={{
              stroke: 'url(#rainbowGrad)',
              filter: 'brightness(0.9)',
            }} />
            {/* SVGグラデーション定義 */}
            <svg width="0" height="0" style={{ position: 'absolute' }}>
              <defs>
                <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff0000" />
                  <stop offset="20%" stopColor="#ff8800" />
                  <stop offset="40%" stopColor="#ffff00" />
                  <stop offset="60%" stopColor="#00cc00" />
                  <stop offset="80%" stopColor="#0088ff" />
                  <stop offset="100%" stopColor="#8800ff" />
                </linearGradient>
              </defs>
            </svg>
            <span style={{ fontSize: '12px', color: '#555' }}>
              {showPicker ? '▲ カラーパレットを閉じる' : '▼ カラーパレットを開く'}
            </span>
          </div>

          {/* フリーカラーパレット（虹アイコンクリックで開閉） */}
          {showPicker && (
            <RgbaStringColorPicker
              color={color}
              onChange={handleColorChange}
            />
          )}
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

  /* Removed colors array as it is now handled in ColorPickerPopover */

  const projectValidation = validateProjectName(projectName);

  const handleReset = () => {
    if (!window.confirm('このツールの設定を初期状態（システムデフォルト）に戻しますか？')) return;

    const targetType = isEditing ? selectedItem.type : mode;
    const defaults = DEFAULT_STYLES[targetType];

    if (!defaults) return;

    if (isEditing) {
      // 選択アイテムのリセット
      updateSelectedItem(selectedItem.id, defaults);
    } else {
      // ツール設定のリセット
      const newSettings = { ...settings };

      if (targetType === 'stamp') {
        Object.assign(newSettings, defaults);
      } else if (targetType === 'rectangle') {
        newSettings.strokeWidth = defaults.strokeWidth;
        newSettings.color = defaults.color;
        newSettings.fill = defaults.fill;
        newSettings.rectFontSize = defaults.fontSize;
        newSettings.rectFontFamily = defaults.fontFamily;
        newSettings.rectTextColor = defaults.textColor;
        newSettings.rectAlign = defaults.align;
        newSettings.rectVerticalAlign = defaults.verticalAlign;
        newSettings.rectTextWrap = defaults.wrap;
      } else if (targetType === 'text') {
        newSettings.text = settings.text;
        newSettings.fontSize = defaults.fontSize;
        newSettings.fontFamily = defaults.fontFamily;
        newSettings.fill = defaults.fill;
      } else if (targetType === 'pen') {
        newSettings.penWidth = defaults.strokeWidth;
        newSettings.penColor = defaults.color;
      } else if (targetType === 'line') {
        newSettings.lineWidth = defaults.strokeWidth;
        newSettings.lineColor = defaults.color;
        newSettings.lineStartArrow = defaults.startArrow;
        newSettings.lineEndArrow = defaults.endArrow;
      }

      setSettings(newSettings);
    }
  };
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
              mode === 'rectangle' ? '矩形 (Rectangle)' :
                mode === 'text' ? 'テキスト (Text)' :
                  mode === 'pen' ? 'ペン (Pen)' : mode
        }
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>設定 ({isEditing ? '選択中' : '新規'})</h3>
        <div style={{ display: 'flex', gap: '5px' }}>
          {(mode !== 'select' || isEditing) && (
            <Tooltip text="初期設定に戻す">
              <button
                onClick={handleReset}
                style={{
                  backgroundColor: '#f0f0f0',
                  color: '#333',
                  border: '1px solid #ccc',
                  padding: '5px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <RotateCcw size={14} />
              </button>
            </Tooltip>
          )}

          {isEditing && (
            <button
              onClick={onDelete}
              style={{
                backgroundColor: '#ff4d4d',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              削除
            </button>
          )}
        </div>
      </div>

      {(mode === 'stamp' || (selectedItem && selectedItem.type === 'stamp')) && (
        <div className="settings-group">
          <h4>スタンプ設定</h4>
          <div className="settings-row">
            <label>番号</label>
            <input
              type="number"
              value={currentSettings.number}
              onChange={(e) => handleChange('number', parseInt(e.target.value))}
              style={{ width: '60px' }}
            />
          </div>
          <div className="settings-row">
            <label>増分</label>
            <input
              type="number"
              value={currentSettings.step}
              onChange={(e) => handleChange('step', parseInt(e.target.value))}
              style={{ width: '60px' }}
            />
          </div>

          <div className="settings-row">
            <label>形状サイズ</label>
            <input
              type="range"
              min="10"
              max="100"
              value={currentSettings.radius}
              onChange={(e) => handleChange('radius', parseInt(e.target.value))}
            />
            <span>{currentSettings.radius}</span>
          </div>

          <div className="settings-row">
            <label>文字サイズ</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input
                type="number"
                min="6"
                max="100"
                value={isEditing ? (selectedItem.stampFontSize || 24) : (settings.stampFontSize || 24)}
                onChange={(e) => handleChange(isEditing ? 'stampFontSize' : 'stampFontSize', parseInt(e.target.value))}
                style={{ width: '50px' }}
              />
              <span>px</span>
            </div>
          </div>

          <div className="settings-row">
            <label></label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input
                type="checkbox"
                id="stampSyncFontSize"
                checked={isEditing ? (selectedItem.stampSyncFontSize !== false) : (settings.stampSyncFontSize !== false)}
                onChange={(e) => handleChange(isEditing ? 'stampSyncFontSize' : 'stampSyncFontSize', e.target.checked)}
              />
              <label htmlFor="stampSyncFontSize" style={{ cursor: 'pointer', fontSize: '12px' }}>文字サイズも連動</label>
            </div>
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

          <h4>色設定</h4>
          <div className="settings-row">
            <label>形状色</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ColorPickerPopover
                color={currentSettings.color}
                onChange={(newColor) => handleChange('color', newColor)}
              />
              <span style={{ fontSize: '12px', color: '#666' }}>{currentSettings.color}</span>
            </div>
          </div>
          <div className="settings-row">
            <label>文字色</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ColorPickerPopover
                color={isEditing ? (selectedItem.stampTextColor || '#FFFFFF') : (settings.stampTextColor || '#FFFFFF')}
                onChange={(newColor) => handleChange(isEditing ? 'stampTextColor' : 'stampTextColor', newColor)}
              />
              <span style={{ fontSize: '12px', color: '#666' }}>{isEditing ? (selectedItem.stampTextColor || '#FFFFFF') : (settings.stampTextColor || '#FFFFFF')}</span>
            </div>
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

          <div className="settings-row">
            <label>線色</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ColorPickerPopover
                color={currentSettings.color || 'red'}
                onChange={(newColor) => handleChange('color', newColor)}
              />
              <span style={{ fontSize: '12px', color: '#666' }}>{currentSettings.color}</span>
            </div>
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
              {/* Colors are now handled in the Popover */}
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

      {(mode === 'pen' || (selectedItem && selectedItem.type === 'pen')) && (
        <div className="settings-group">
          <h4>ペン設定</h4>
          <div className="settings-row">
            <label>線の太さ</label>
            <input
              type="range"
              min="1"
              max="50"
              value={isEditing ? (selectedItem.strokeWidth || 5) : (settings.penWidth || 5)}
              onChange={(e) => handleChange(isEditing ? 'strokeWidth' : 'penWidth', parseInt(e.target.value))}
            />
            <span>{isEditing ? (selectedItem.strokeWidth || 5) : (settings.penWidth || 5)}px</span>
          </div>

          <div className="settings-row">
            <label>色</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ColorPickerPopover
                color={isEditing ? (selectedItem.color || 'red') : (settings.penColor || 'red')}
                onChange={(newColor) => handleChange(isEditing ? 'color' : 'penColor', newColor)}
              />
            </div>
          </div>
        </div>
      )}

      {(mode === 'line' || (selectedItem && selectedItem.type === 'line')) && (
        <div className="settings-group">
          <h4>直線・矢印設定</h4>
          <div className="settings-row">
            <label>線の太さ</label>
            <input
              type="range"
              min="1"
              max="50"
              value={isEditing ? (selectedItem.strokeWidth || 5) : (settings.lineWidth || 5)}
              onChange={(e) => handleChange(isEditing ? 'strokeWidth' : 'lineWidth', parseInt(e.target.value))}
            />
            <span>{isEditing ? (selectedItem.strokeWidth || 5) : (settings.lineWidth || 5)}px</span>
          </div>

          <div className="settings-row">
            <label>色</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ColorPickerPopover
                color={isEditing ? (selectedItem.color || '#FF0000') : (settings.lineColor || '#FF0000')}
                onChange={(newColor) => handleChange(isEditing ? 'color' : 'lineColor', newColor)}
              />
            </div>
          </div>

          <div className="settings-row">
            <label>始点形状</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="startArrow"
                checked={isEditing ? (selectedItem.startArrow) : (settings.lineStartArrow)}
                onChange={(e) => handleChange(isEditing ? 'startArrow' : 'lineStartArrow', e.target.checked)}
              />
              <label htmlFor="startArrow" style={{ cursor: 'pointer' }}>矢印</label>
            </div>
          </div>

          <div className="settings-row">
            <label>終点形状</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="endArrow"
                checked={isEditing ? (selectedItem.endArrow) : (settings.lineEndArrow)}
                onChange={(e) => handleChange(isEditing ? 'endArrow' : 'lineEndArrow', e.target.checked)}
              />
              <label htmlFor="endArrow" style={{ cursor: 'pointer' }}>矢印</label>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SettingsPanel;
