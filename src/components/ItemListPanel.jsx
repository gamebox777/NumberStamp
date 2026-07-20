import React from 'react';
import { Stamp, Square, Type, Pen, ArrowRight, Trash2, X } from 'lucide-react';

// アイテムタイプごとのアイコンと表示名
const TYPE_INFO = {
  stamp: { icon: Stamp, label: 'スタンプ' },
  rectangle: { icon: Square, label: '矩形' },
  text: { icon: Type, label: 'テキスト' },
  pen: { icon: Pen, label: 'ペン' },
  line: { icon: ArrowRight, label: '直線・矢印' },
};

// アイテムの表示ラベルを生成
const getItemLabel = (item) => {
  switch (item.type) {
    case 'stamp':
      return `スタンプ #${item.number}`;
    case 'rectangle':
      return item.text ? `矩形 "${item.text}"` : '矩形';
    case 'text':
      return `"${item.text}"`;
    case 'pen':
      return 'ペン';
    case 'line':
      return item.startArrow || item.endArrow ? '矢印' : '直線';
    default:
      return item.type;
  }
};

const ItemListPanel = ({ items, selectedIds, onSelectItem, onDeleteItem, onClose }) => {
  // 重ね順の上（配列の末尾）が一覧の先頭に来るように反転
  const reversedItems = [...items].reverse();

  return (
    <div style={{
      width: '220px',
      height: '100%',
      borderLeft: '1px solid #ccc',
      backgroundColor: '#f8f8f8',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 10px',
        borderBottom: '1px solid #ccc',
        backgroundColor: '#f0f0f0'
      }}>
        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>アイテム一覧 ({items.length})</span>
        <X
          size={16}
          style={{ cursor: 'pointer', color: '#666' }}
          onClick={onClose}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {items.length === 0 ? (
          <div style={{ padding: '20px 10px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
            アイテムがありません
          </div>
        ) : (
          reversedItems.map((item) => {
            const info = TYPE_INFO[item.type] || {};
            const Icon = info.icon;
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  backgroundColor: isSelected ? '#d0e4f7' : 'transparent',
                  borderBottom: '1px solid #eee'
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#efefef'; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {Icon && <Icon size={16} style={{ flexShrink: 0, color: item.color || item.stroke || '#333' }} />}
                <span style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {getItemLabel(item)}
                </span>
                <Trash2
                  size={14}
                  style={{ flexShrink: 0, color: '#999', cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#d32f2f'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#999'; }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ItemListPanel;
