import React, { useState } from 'react';
import { ArrowLeft, Plus, ArrowDownLeft, ArrowUpRight, X, Calendar, User, Tag, Image as ImageIcon } from 'lucide-react';

export default function MaterialListTab({ 
  initialDirection = 'INWARD',
  materials,
  manufacturers,
  onBack,
  onOpenAddModal
}) {
  const [selectedCategory, setSelectedCategory] = useState('gold'); // 'gold', 'diamond', 'gemstone'
  const [filterDirection, setFilterDirection] = useState('ALL'); // 'ALL', 'INWARD', 'OUTWARD'
  const [selectedEntry, setSelectedEntry] = useState(null); // Detail modal

  // Filter materials by selected category
  const categoryMaterials = materials.filter(m => {
    const mType = (m.materialType || m.material_type || 'gold').toLowerCase();
    return mType === selectedCategory;
  });

  // Calculate Summary: Total IN, Total OUT, Balance
  const totalIn = categoryMaterials
    .filter(m => m.direction === 'INWARD')
    .reduce((sum, m) => sum + (parseFloat(m.weight) || 0), 0);

  const totalOut = categoryMaterials
    .filter(m => m.direction === 'OUTWARD')
    .reduce((sum, m) => sum + (parseFloat(m.weight) || 0), 0);

  const balance = totalIn - totalOut;
  const unitLabel = selectedCategory === 'gold' ? 'g' : 'CTS';

  // Filter transaction list based on active summary box selection
  const filteredTransactions = categoryMaterials.filter(m => {
    if (filterDirection === 'INWARD') return m.direction === 'INWARD';
    if (filterDirection === 'OUTWARD') return m.direction === 'OUTWARD';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Header Bar with Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onBack}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#0f172a',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Material Vault List
          </h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
            {filterDirection === 'ALL' ? 'All Transactions' : `${filterDirection} Entries`}
          </p>
        </div>
      </div>

      {/* 2. Three Material Category Tabs (Gold, Diamond, Gemstone) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px',
        background: '#ffffff',
        padding: '6px',
        borderRadius: '14px',
        border: '1px solid #e2e8f0'
      }}>
        {['gold', 'diamond', 'gemstone'].map(cat => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setFilterDirection('ALL');
              }}
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                border: 'none',
                background: isSelected ? '#d97706' : 'transparent',
                color: isSelected ? '#ffffff' : '#64748b',
                fontWeight: isSelected ? '800' : '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 3. Interactive Material Summary Vault Card (Clickable Boxes) */}
      <div className="glass-card" style={{
        padding: '20px',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {selectedCategory.toUpperCase()} VAULT SUMMARY (TAP TO FILTER)
          </span>
          <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '999px', fontWeight: '700' }}>
            LIVE BALANCE
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
          {/* Total IN (Clickable) */}
          <div 
            onClick={() => setFilterDirection('INWARD')}
            style={{
              background: '#ecfdf5',
              padding: '12px 8px',
              borderRadius: '12px',
              border: filterDirection === 'INWARD' ? '2px solid #059669' : '1px solid #a7f3d0',
              cursor: 'pointer',
              boxShadow: filterDirection === 'INWARD' ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#047857' }}>TOTAL IN</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#065f46', marginTop: '2px' }}>
              {totalIn.toFixed(3)} {unitLabel}
            </div>
          </div>

          {/* Total OUT (Clickable) */}
          <div 
            onClick={() => setFilterDirection('OUTWARD')}
            style={{
              background: '#eff6ff',
              padding: '12px 8px',
              borderRadius: '12px',
              border: filterDirection === 'OUTWARD' ? '2px solid #2563eb' : '1px solid #bfdbfe',
              cursor: 'pointer',
              boxShadow: filterDirection === 'OUTWARD' ? '0 0 0 3px rgba(37, 99, 235, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#1d4ed8' }}>TOTAL OUT</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#1e40af', marginTop: '2px' }}>
              {totalOut.toFixed(3)} {unitLabel}
            </div>
          </div>

          {/* Vault Balance (Clickable - Resets to ALL) */}
          <div 
            onClick={() => setFilterDirection('ALL')}
            style={{
              background: '#fff7ed',
              padding: '12px 8px',
              borderRadius: '12px',
              border: filterDirection === 'ALL' ? '2px solid #ea580c' : '1px solid #fed7aa',
              cursor: 'pointer',
              boxShadow: filterDirection === 'ALL' ? '0 0 0 3px rgba(234, 88, 12, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#c2410c' }}>REMAINING</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#9a3412', marginTop: '2px' }}>
              {balance.toFixed(3)} {unitLabel}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Prominent + Add Entry Button (Directly Below Summary Card) */}
      <button
        onClick={() => onOpenAddModal(selectedCategory)}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '14px',
          background: '#d97706',
          color: '#ffffff',
          border: 'none',
          fontSize: '15px',
          fontWeight: '800',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
          transition: 'transform 0.1s ease'
        }}
      >
        <Plus size={20} /> Add New {selectedCategory.toUpperCase()} Entry
      </button>

      {/* 5. Filtered Material Entry List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            {selectedCategory.toUpperCase()} Transactions ({filteredTransactions.length})
          </h3>
          {filterDirection !== 'ALL' && (
            <button
              onClick={() => setFilterDirection('ALL')}
              style={{ background: 'none', border: 'none', color: '#d97706', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Clear Filter (Show All)
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', background: '#ffffff', borderRadius: '14px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
              No {filterDirection !== 'ALL' ? filterDirection : ''} {selectedCategory} entries found.
            </div>
          ) : (
            filteredTransactions.map(entry => {
              const isInward = entry.direction === 'INWARD';
              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="glass-card clickable-card"
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: isInward ? '#dcfce7' : '#dbeafe',
                      color: isInward ? '#15803d' : '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isInward ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: isInward ? '#dcfce7' : '#dbeafe',
                          color: isInward ? '#15803d' : '#1d4ed8'
                        }}>
                          {entry.direction}
                        </span>
                        <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                          {entry.weight} {unitLabel} {entry.purity ? `(${entry.purity})` : ''}
                        </h4>
                      </div>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '3px 0 0 0' }}>
                        {entry.vendorName || 'General Supplier'} • {entry.timestamp}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                      ₹{entry.totalAmount ? entry.totalAmount.toLocaleString('en-IN') : '0'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Tap details ➔</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 6. Entry Detail Pop-up / Modal */}
      {selectedEntry && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: selectedEntry.direction === 'INWARD' ? '#dcfce7' : '#dbeafe',
                  color: selectedEntry.direction === 'INWARD' ? '#15803d' : '#1d4ed8'
                }}>
                  {selectedEntry.direction} ENTRY
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  Transaction Details
                </h3>
              </div>
              <button onClick={() => setSelectedEntry(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={22} />
              </button>
            </div>

            {selectedEntry.photoUrl && (
              <div style={{ marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', height: '140px' }}>
                <img src={selectedEntry.photoUrl} alt="Entry Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> Timestamp:</span>
                <strong style={{ color: '#0f172a' }}>{selectedEntry.timestamp}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}><Tag size={14} /> Category:</span>
                <strong style={{ color: '#d97706', textTransform: 'uppercase' }}>{selectedEntry.materialType || selectedCategory}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Weight:</span>
                <strong style={{ color: '#0f172a' }}>{selectedEntry.weight} {unitLabel}</strong>
              </div>

              {selectedEntry.purity && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Purity Standard:</span>
                  <strong style={{ color: '#b45309' }}>{selectedEntry.purity}</strong>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> {selectedEntry.direction === 'INWARD' ? 'Vendor / Supplier:' : 'Assigned Karigar:'}</span>
                <strong style={{ color: '#0f172a' }}>{selectedEntry.vendorName || 'General Supplier'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Rate per {unitLabel}:</span>
                <strong style={{ color: '#0f172a' }}>₹{selectedEntry.price}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>Total Amount:</span>
                <strong style={{ fontWeight: '800', color: '#15803d' }}>
                  ₹{selectedEntry.totalAmount ? selectedEntry.totalAmount.toLocaleString('en-IN') : '0'}
                </strong>
              </div>
            </div>

            <button
              onClick={() => setSelectedEntry(null)}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '12px',
                borderRadius: '10px',
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
