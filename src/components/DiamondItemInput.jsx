import React from 'react';
import { Trash2 } from 'lucide-react';

export const standardDiamondSizes = Array.from({ length: 103 }, (_, i) => (0.8 + i * 0.1).toFixed(1));

export const standardDiamondShapes = [
  'Round',
  'Princess',
  'Cushion',
  'Oval',
  'Pear',
  'Marquise',
  'Emerald',
  'Radiant',
  'Asscher',
  'Heart',
  'Baguette',
  'Uncut',
  'Other'
];

export default function DiamondItemInput({
  item,
  index,
  onChange,
  onRemove,
  showRemove = true,
  availableStock = null
}) {
  const isCustomShape = item.shape === 'Other';
  const currentSize = item.sizeMm ? parseFloat(item.sizeMm).toFixed(1) : (item.size ? parseFloat(item.size).toFixed(1) : '');

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '14px',
      padding: '12px',
      border: '1px solid #bfdbfe',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }}>
      {/* Row Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: '800', color: '#1e40af', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #93c5fd' }}>
            DIAMOND #{index + 1}
          </span>
          {availableStock !== null && item.sizeMm && item.shape && (
            <span style={{
              fontSize: '10px',
              fontWeight: '800',
              padding: '2px 8px',
              borderRadius: '6px',
              background: availableStock > 0 ? '#dcfce7' : '#fee2e2',
              color: availableStock > 0 ? '#15803d' : '#dc2626',
              border: `1px solid ${availableStock > 0 ? '#86efac' : '#fca5a5'}`
            }}>
              Stock: {availableStock.toFixed(2)} ct
            </span>
          )}
        </div>

        {showRemove && (
          <button
            type="button"
            onClick={onRemove}
            style={{
              background: '#fee2e2',
              border: 'none',
              borderRadius: '6px',
              width: '24px',
              height: '24px',
              color: '#dc2626',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Inputs: Weight (ct) | Size (mm) | Shape (No forced pre-filled defaults) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        <div>
          <label style={{ fontSize: '10px', fontWeight: '700', color: '#1e40af' }}>WEIGHT (ct) *</label>
          <input
            type="number"
            step="0.01"
            placeholder="e.g. 0.25"
            value={item.weight || item.weightCt || ''}
            onChange={(e) => onChange(item.id, 'weight', e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box', marginTop: '2px' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '10px', fontWeight: '700', color: '#1e40af' }}>SIZE (mm) *</label>
          <select
            value={currentSize}
            onChange={(e) => onChange(item.id, 'sizeMm', e.target.value ? parseFloat(e.target.value) : '')}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', boxSizing: 'border-box', marginTop: '2px', background: '#ffffff', color: currentSize ? '#0f172a' : '#94a3b8' }}
          >
            <option value="">-- Size --</option>
            {standardDiamondSizes.map(s => (
              <option key={s} value={s}>{s} mm</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '10px', fontWeight: '700', color: '#1e40af' }}>SHAPE *</label>
          <select
            value={item.shape || ''}
            onChange={(e) => onChange(item.id, 'shape', e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', boxSizing: 'border-box', marginTop: '2px', background: '#ffffff', color: item.shape ? '#0f172a' : '#94a3b8' }}
          >
            <option value="">-- Shape --</option>
            {standardDiamondShapes.map(sh => (
              <option key={sh} value={sh}>{sh}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Specify Custom Shape when 'Other' is chosen */}
      {isCustomShape && (
        <div style={{ marginTop: '2px' }}>
          <label style={{ fontSize: '10px', fontWeight: '700', color: '#dc2626' }}>SPECIFY SHAPE *</label>
          <input
            type="text"
            placeholder="e.g. Trilliant / Shield Cut / Kite Cut"
            value={item.customShape || ''}
            onChange={(e) => onChange(item.id, 'customShape', e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f87171', fontSize: '12.5px', boxSizing: 'border-box', marginTop: '2px' }}
          />
        </div>
      )}
    </div>
  );
}
