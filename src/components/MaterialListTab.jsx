import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  X, 
  SlidersHorizontal,
  Search
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
  const [diamondSearchShape, setDiamondSearchShape] = useState('ALL');
  const [diamondSearchSize, setDiamondSearchSize] = useState('ALL');

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
  const unitLabel = selectedCategory === 'gold' ? 'g' : 'ct';

  // --- STRUCTURED DIAMOND INVENTORY GROUPING (SIZE + SHAPE HIERARCHY) ---
  const diamondStockGrouped = {};
  if (selectedCategory === 'diamond') {
    materials.filter(m => (m.materialType || m.material_type) === 'diamond').forEach(mat => {
      const dItems = mat.diamondItems || mat.diamond_items || [];
      dItems.forEach(d => {
        const sizeStr = `${parseFloat(d.sizeMm || d.size || 2.5).toFixed(1)} mm`;
        const shapeStr = d.shape === 'Other' ? (d.customShape || 'Other') : (d.shape || 'Round');
        const weightVal = parseFloat(d.weightCt || d.weight || 0);

        if (!diamondStockGrouped[sizeStr]) {
          diamondStockGrouped[sizeStr] = {};
        }
        if (!diamondStockGrouped[sizeStr][shapeStr]) {
          diamondStockGrouped[sizeStr][shapeStr] = {
            sizeMm: parseFloat(d.sizeMm || d.size || 2.5),
            shape: shapeStr,
            totalReceived: 0,
            totalIssued: 0,
            available: 0
          };
        }

        if (mat.direction === 'INWARD') {
          diamondStockGrouped[sizeStr][shapeStr].totalReceived += weightVal;
        } else {
          diamondStockGrouped[sizeStr][shapeStr].totalIssued += weightVal;
        }
        diamondStockGrouped[sizeStr][shapeStr].available = 
          diamondStockGrouped[sizeStr][shapeStr].totalReceived - diamondStockGrouped[sizeStr][shapeStr].totalIssued;
      });
    });
  }

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
    setDiamondSearchShape('ALL');
    setDiamondSearchSize('ALL');
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

      {/* 3. Material Vault Summary Card */}
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
              {totalIn.toFixed(2)} {unitLabel}
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
              {totalOut.toFixed(2)} {unitLabel}
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
              {balance.toFixed(2)} {unitLabel}
            </div>
          </div>
        </div>
      </div>

      {/* 4. PROMINENT SINGLE "+ Add New Entry" BUTTON */}
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
        <Plus size={20} /> Add New Entry
      </button>

      {/* 5. STRUCTURED DIAMOND INVENTORY BREAKDOWN (GROUPED BY SIZE + SHAPE) */}
      {selectedCategory === 'diamond' && Object.keys(diamondStockGrouped).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Diamond Stock by Size & Shape
            </h3>
            <span style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '6px', fontWeight: '800', border: '1px solid #bfdbfe' }}>
              {Object.keys(diamondStockGrouped).length} Sizes Tracked
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {Object.entries(diamondStockGrouped).map(([sizeKey, shapes]) => (
              <div
                key={sizeKey}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '900', color: '#1e40af', background: '#eff6ff', padding: '3px 10px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    {sizeKey}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#047857' }}>
                    Total: {Object.values(shapes).reduce((s, sh) => s + sh.available, 0).toFixed(2)} ct
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.values(shapes).map(sh => (
                    <div
                      key={sh.shape}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: sh.available > 0 ? '#f8fafc' : '#fef2f2',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: `1px solid ${sh.available > 0 ? '#e2e8f0' : '#fca5a5'}`
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>{sh.shape}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                          Rec: {sh.totalReceived.toFixed(2)} ct | Iss: {sh.totalIssued.toFixed(2)} ct
                        </div>
                      </div>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '800',
                        color: sh.available > 0 ? '#047857' : '#dc2626'
                      }}>
                        {sh.available.toFixed(2)} ct
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Filtered Material Entry List */}
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
              const dItems = entry.diamondItems || entry.diamond_items || [];

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
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative', width: '44px', height: '44px' }}>
                        {photoSrc ? (
                          <img 
                            src={photoSrc} 
                            alt="Thumbnail" 
                            style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #cbd5e1' }} 
                          />
                        ) : (
                          <div style={{
                            width: '44px', height: '44px', borderRadius: '10px',
                            background: isInward ? '#dcfce7' : '#fef2f2',
                            color: isInward ? '#15803d' : '#dc2626',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {isInward ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                          </div>
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
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

                  {/* Structured Diamond Items Chips */}
                  {dItems.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '6px', borderTop: '1px dashed #f1f5f9' }}>
                      {dItems.map((d, i) => (
                        <span key={i} style={{ fontSize: '10px', fontWeight: '800', background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                          {parseFloat(d.weight || d.weightCt || 0).toFixed(2)} ct ({d.size || `${parseFloat(d.sizeMm || 2.5).toFixed(1)} mm`} {d.shape || 'Round'})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Advanced Filter Options Modal */}
      {isFilterModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="glass-card" style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '440px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Filter Transactions</h3>
              <button onClick={() => setIsFilterModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>VENDOR / KARIGAR NAME</label>
                <input
                  type="text"
                  placeholder="Filter by vendor..."
                  value={filterVendor}
                  onChange={(e) => setFilterVendor(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => { handleResetFilters(); setIsFilterModalOpen(false); }} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '700', cursor: 'pointer' }}>Reset</button>
                <button type="button" onClick={() => setIsFilterModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#d97706', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}>Apply Filters</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entry Detail Pop-up Modal */}
      {selectedEntry && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 3000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '440px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', background: selectedEntry.direction === 'INWARD' ? '#dcfce7' : '#fef2f2', color: selectedEntry.direction === 'INWARD' ? '#15803d' : '#dc2626' }}>
                  {selectedEntry.direction} ENTRY
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Entry Details</h3>
              </div>
              <button onClick={() => setSelectedEntry(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>
            {selectedEntry.photoUrl && (
              <div style={{ marginBottom: '16px', borderRadius: '16px', overflow: 'hidden', height: '160px', border: '1px solid #e2e8f0' }}>
                <img src={selectedEntry.photoUrl} alt="Attached Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: '#64748b' }}>Timestamp:</span><strong style={{ color: '#0f172a' }}>{selectedEntry.timestamp}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: '#64748b' }}>Category:</span><strong style={{ color: '#d97706', textTransform: 'uppercase' }}>{selectedEntry.materialType}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: '#64748b' }}>Weight:</span><strong style={{ color: '#0f172a' }}>{selectedEntry.weight} {unitLabel}</strong></div>
              {selectedEntry.purity && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: '#64748b' }}>Purity:</span><strong style={{ color: '#b45309' }}>{selectedEntry.purity}</strong></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: '#64748b' }}>{selectedEntry.direction === 'INWARD' ? 'Vendor:' : 'Karigar:'}</span><strong style={{ color: '#0f172a' }}>{selectedEntry.vendorName}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}><span style={{ fontWeight: '800', color: '#0f172a' }}>Total Amount:</span><strong style={{ fontWeight: '800', color: selectedEntry.direction === 'INWARD' ? '#15803d' : '#dc2626' }}>₹{selectedEntry.totalAmount ? selectedEntry.totalAmount.toLocaleString('en-IN') : '0'}</strong></div>
            </div>
            <button onClick={() => setSelectedEntry(null)} style={{ width: '100%', marginTop: '16px', padding: '14px', borderRadius: '12px', background: '#0f172a', color: '#ffffff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Close Details</button>
          </div>
        </div>
      )}

    </div>
  );
}
