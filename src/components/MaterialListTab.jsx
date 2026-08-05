import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  X, 
  Calendar, 
  User, 
  Tag, 
  SlidersHorizontal, 
  RotateCcw,
  Check,
  ImageIcon
} from 'lucide-react';

export default function MaterialListTab({ 
  initialDirection = 'INWARD',
  materials,
  manufacturers,
  onBack,
  onOpenAddModal
}) {
  const [selectedCategory, setSelectedCategory] = useState('gold'); // 'gold', 'diamond', 'gemstone'
  const [filterDirection, setFilterDirection] = useState('ALL'); // 'ALL', 'INWARD', 'OUTWARD'
  const [selectedEntry, setSelectedEntry] = useState(null); // Detail modal popup
  
  // Advanced Filter Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterVendor, setFilterVendor] = useState('');
  const [filterPurity, setFilterPurity] = useState('');

  // Filter materials by selected category
  const categoryMaterials = materials.filter(m => {
    const mType = (m.materialType || m.material_type || 'gold').toLowerCase();
    return mType === selectedCategory;
  });

  // Calculate Summary: Total IN (Green), Total OUT (RED), Remaining (BLUE)
  const totalIn = categoryMaterials
    .filter(m => m.direction === 'INWARD')
    .reduce((sum, m) => sum + (parseFloat(m.weight) || 0), 0);

  const totalOut = categoryMaterials
    .filter(m => m.direction === 'OUTWARD')
    .reduce((sum, m) => sum + (parseFloat(m.weight) || 0), 0);

  const balance = totalIn - totalOut;
  const unitLabel = selectedCategory === 'gold' ? 'g' : 'CTS';

  // Advanced Filter Matching Logic
  const filteredTransactions = categoryMaterials.filter(m => {
    if (filterDirection === 'INWARD' && m.direction !== 'INWARD') return false;
    if (filterDirection === 'OUTWARD' && m.direction !== 'OUTWARD') return false;

    if (filterVendor && !((m.vendorName || '').toLowerCase().includes(filterVendor.toLowerCase()))) {
      return false;
    }

    if (filterPurity && m.purity !== filterPurity) {
      return false;
    }

    return true;
  });

  const hasActiveAdvancedFilters = filterVendor || filterPurity;

  const handleResetFilters = () => {
    setFilterVendor('');
    setFilterPurity('');
    setFilterDirection('ALL');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      
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

      {/* 3. Material Vault Summary Card (In = Green, Out = RED, Remaining = BLUE) */}
      <div className="glass-card" style={{
        padding: '20px',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {selectedCategory.toUpperCase()} VAULT SUMMARY
          </span>
          <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '999px', fontWeight: '700' }}>
            LIVE BALANCE
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
          {/* Total IN (Green) */}
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

          {/* Total OUT (RED) */}
          <div 
            onClick={() => setFilterDirection('OUTWARD')}
            style={{
              background: '#fef2f2',
              padding: '12px 8px',
              borderRadius: '12px',
              border: filterDirection === 'OUTWARD' ? '2px solid #dc2626' : '1px solid #fca5a5',
              cursor: 'pointer',
              boxShadow: filterDirection === 'OUTWARD' ? '0 0 0 3px rgba(220, 38, 38, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#dc2626' }}>TOTAL OUT</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#991b1b', marginTop: '2px' }}>
              {totalOut.toFixed(3)} {unitLabel}
            </div>
          </div>

          {/* Remaining Balance (BLUE) */}
          <div 
            onClick={() => setFilterDirection('ALL')}
            style={{
              background: '#eff6ff',
              padding: '12px 8px',
              borderRadius: '12px',
              border: filterDirection === 'ALL' ? '2px solid #2563eb' : '1px solid #bfdbfe',
              cursor: 'pointer',
              boxShadow: filterDirection === 'ALL' ? '0 0 0 3px rgba(37, 99, 235, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#2563eb' }}>REMAINING</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#1e40af', marginTop: '2px' }}>
              {balance.toFixed(3)} {unitLabel}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Prominent + Add Entry Button */}
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
          boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)'
        }}
      >
        <Plus size={20} /> Add New {selectedCategory.toUpperCase()} Entry
      </button>

      {/* 5. Filtered Material Entry List with Photo Thumbnail Preview */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            {selectedCategory.toUpperCase()} Transactions ({filteredTransactions.length})
          </h3>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              style={{
                background: hasActiveAdvancedFilters ? '#fef3c7' : '#ffffff',
                border: hasActiveAdvancedFilters ? '1px solid #d97706' : '1px solid #e2e8f0',
                color: hasActiveAdvancedFilters ? '#b45309' : '#475569',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <SlidersHorizontal size={14} /> 
              {hasActiveAdvancedFilters ? 'Filtered' : 'Filter Options'}
            </button>

            {hasActiveAdvancedFilters && (
              <button
                onClick={handleResetFilters}
                style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', background: '#ffffff', borderRadius: '14px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
              No {selectedCategory} entries match the selected filters.
            </div>
          ) : (
            filteredTransactions.map(entry => {
              const isInward = entry.direction === 'INWARD';
              const photoSrc = entry.photoUrl || (entry.photos && entry.photos[0]);

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
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Entry Thumbnail Image Preview or Direction Icon */}
                    <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                      {photoSrc ? (
                        <img 
                          src={photoSrc} 
                          alt="Entry Thumbnail" 
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            objectFit: 'cover',
                            border: '1px solid #cbd5e1'
                          }} 
                        />
                      ) : (
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '10px',
                          background: isInward ? '#dcfce7' : '#fef2f2',
                          color: isInward ? '#15803d' : '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isInward ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                        </div>
                      )}

                      {/* Direction Overlay Badge */}
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: isInward ? '#15803d' : '#dc2626',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        border: '2px solid #ffffff'
                      }}>
                        {isInward ? '↓' : '↑'}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: isInward ? '#dcfce7' : '#fef2f2',
                          color: isInward ? '#15803d' : '#dc2626'
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
                    <div style={{ fontSize: '10px', color: '#d97706', fontWeight: '700' }}>Tap details ➔</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 6. Advanced Filter Options Modal */}
      {isFilterModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 2000,
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
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                Filter Transactions
              </h3>
              <button onClick={() => setIsFilterModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>VENDOR / KARIGAR NAME</label>
                <input
                  type="text"
                  placeholder="Filter by vendor or Karigar name..."
                  value={filterVendor}
                  onChange={(e) => setFilterVendor(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                />
              </div>

              {selectedCategory === 'gold' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>PURITY STANDARD</label>
                  <select
                    value={filterPurity}
                    onChange={(e) => setFilterPurity(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                  >
                    <option value="">All Purities</option>
                    <option value="24K - 995">24K - 995</option>
                    <option value="24K - 999">24K - 999</option>
                    <option value="22K - 916">22K - 916</option>
                    <option value="18K - 750">18K - 750</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleResetFilters();
                    setIsFilterModalOpen(false);
                  }}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '700', cursor: 'pointer' }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#d97706', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Bulletproof Entry Detail Pop-up Modal */}
      {selectedEntry && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            border: '1px solid #e2e8f0',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: selectedEntry.direction === 'INWARD' ? '#dcfce7' : '#fef2f2',
                  color: selectedEntry.direction === 'INWARD' ? '#15803d' : '#dc2626'
                }}>
                  {selectedEntry.direction} ENTRY
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  Entry Details
                </h3>
              </div>
              <button 
                onClick={() => setSelectedEntry(null)} 
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Photo Attachment Preview Banner */}
            {(selectedEntry.photoUrl || (selectedEntry.photos && selectedEntry.photos.length > 0)) && (
              <div style={{ marginBottom: '16px', borderRadius: '16px', overflow: 'hidden', height: '160px', border: '1px solid #e2e8f0' }}>
                <img 
                  src={selectedEntry.photoUrl || selectedEntry.photos[0]} 
                  alt="Attached Entry Photo" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
            )}

            {/* Details Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
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
                <strong style={{ color: '#0f172a', fontSize: '15px' }}>{selectedEntry.weight} {unitLabel}</strong>
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

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>Total Amount:</span>
                <strong style={{ fontWeight: '800', color: selectedEntry.direction === 'INWARD' ? '#15803d' : '#dc2626' }}>
                  ₹{selectedEntry.totalAmount ? selectedEntry.totalAmount.toLocaleString('en-IN') : '0'}
                </strong>
              </div>
            </div>

            <button
              onClick={() => setSelectedEntry(null)}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '14px',
                borderRadius: '12px',
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                fontWeight: '800',
                fontSize: '14px',
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
