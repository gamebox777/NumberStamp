import React from 'react';

const SettingsPanel = ({ settings, setSettings, selectedItem, updateSelectedItem, mode }) => {
  
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

  return (
    <div className="settings-panel">
      <h3>設定 ({isEditing ? '選択中' : '新規'})</h3>

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

      <div className="settings-group">
        <h4>色設定</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {colors.map(c => (
            <div 
              key={c}
              className={`color-option ${currentSettings.color === c ? 'selected' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => handleChange('color', c)}
            />
          ))}
          <input 
            type="color" 
            value={currentSettings.color}
            onChange={(e) => handleChange('color', e.target.value)}
            style={{ width: '30px', height: '30px', padding: 0, border: 'none' }}
          />
        </div>
      </div>
    
      {(mode === 'rectangle' || (selectedItem && selectedItem.type === 'rectangle')) && (
         <div className="settings-group">
            <h4>矩形設定</h4>
             {/* 矩形固有の設定があればここに追加 */}
         </div>
      )}

    </div>
  );
};

export default SettingsPanel;
