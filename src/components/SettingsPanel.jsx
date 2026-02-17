
import bannerImg from '../assets/banner.svg';

const SettingsPanel = ({ settings, setSettings, selectedItem, updateSelectedItem, mode, onDelete }) => {


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
      <div className="banner-container" style={{ marginBottom: '15px', textAlign: 'center' }}>
        <img src={bannerImg} alt="NumberStamp" style={{ width: '100%', borderRadius: '5px', display: 'block' }} />
      </div>
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
      )}

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
