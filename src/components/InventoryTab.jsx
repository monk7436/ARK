import React, { useState } from 'react';
import { Package, Download, Upload, Search, Plus, FileSpreadsheet, X, Check } from 'lucide-react';

export default function InventoryTab({ inventory, onAddStockItem, onImportExcel }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New stock form state
  const [tagCode, setTagCode] = useState('ARK-TAG-' + Math.floor(1000 + Math.random() * 9000));
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Ring');
  const [customCategory, setCustomCategory] = useState('');
  const [purityKarat, setPurityKarat] = useState('22K (91.6%)');
  const [grossWeight, setGrossWeight] = useState('');
  const [stoneWeight, setStoneWeight] = useState('0');
  const [makingCharge, setMakingCharge] = useState('450');

  // DYNAMIC CATEGORIES FILTER: Only show categories that currently exist in inventory items!
  const availableCategories = ['ALL', ...Array.from(new Set(inventory.map(item => item.category)))];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tagCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateStockItem = (e) => {
    e.preventDefault();
    const finalCategory = category === 'CUSTOM' ? (customCategory || 'Custom') : category;
    const gross = parseFloat(grossWeight || 0);
    const stone = parseFloat(stoneWeight || 0);
    const net = gross - stone;
    const fine = net * 0.916; // 22k default

    onAddStockItem({
      id: 'inv-' + Date.now(),
      tagCode,
      name,
      category: finalCategory,
      purityKarat,
      grossWeight: gross,
      stoneWeight: stone,
      netWeight: net,
      fineWeight: parseFloat(fine.toFixed(3)),
      makingCharge: parseFloat(makingCharge || 0),
      status: 'IN_STOCK',
      photoUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300'
    });

    setName('');
    setGrossWeight('');
    setCustomCategory('');
    setTagCode('ARK-TAG-' + Math.floor(1000 + Math.random() * 9000));
    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['Tag Code', 'Item Name', 'Category', 'Purity', 'Gross Wt (g)', 'Net Wt (g)', 'Fine Wt (g)', 'Status', 'Image URL'];
    const rows = inventory.map(item => [
      item.tagCode,
      `"${item.name}"`,
      item.category,
      item.purityKarat,
      item.grossWeight,
      item.netWeight,
      item.fineWeight,
      item.status,
      item.photoUrl
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ARK_Inventory_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      {/* Action Header */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
            Tagged Inventory Catalog
          </h2>
          <p style={{ fontSize: '12px', color: '#64748b' }}>
            {inventory.length} total items | Net Weight: {inventory.reduce((a,b)=>a+b.netWeight,0).toFixed(2)}g
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setIsImportModalOpen(true)} className="btn-secondary">
            <Upload size={16} /> Import Excel
          </button>
          <button onClick={handleExportCSV} className="btn-secondary">
            <Download size={16} /> Export Excel
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="btn-gold">
            <Plus size={16} /> Tag New Item
          </button>
        </div>
      </div>

      {/* DYNAMIC CATEGORY QUICK FILTERS */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search by Tag ID or item name..."
            className="form-input"
            style={{ paddingLeft: '36px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dynamic Category Buttons */}
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
          {availableCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: selectedCategory === cat ? '#d97706' : 'transparent',
                color: selectedCategory === cat ? '#ffffff' : '#475569',
                fontWeight: '600',
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {filteredInventory.map((item) => (
          <div key={item.id} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Image + Tag Badge */}
            <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <img
                src={item.photoUrl}
                alt={item.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#ffffff', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: '#b45309', border: '1px solid #fde68a', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {item.tagCode}
              </div>
              <div style={{ position: 'absolute', bottom: '8px', right: '8px' }}>
                <span className="badge badge-inward">{item.status}</span>
              </div>
            </div>

            {/* Title & Category */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{item.name}</h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{item.category} • {item.purityKarat}</p>
            </div>

            <div style={{ height: '1px', background: '#e2e8f0' }} />

            {/* Weight Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', textAlign: 'center', fontSize: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', fontSize: '10px' }}>Gross Wt</div>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.grossWeight}g</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', fontSize: '10px' }}>Net Wt</div>
                <div style={{ fontWeight: '700', color: '#b45309' }}>{item.netWeight}g</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', fontSize: '10px' }}>Fine Wt</div>
                <div style={{ fontWeight: '700', color: '#15803d' }}>{item.fineWeight}g</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Tag Item Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="glass-card gold-border" style={{ width: '100%', maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Tag New Finished Item</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStockItem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Auto Tag Code</label>
                  <input type="text" readOnly className="form-input" value={tagCode} style={{ color: '#b45309', fontWeight: '700' }} />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Ring">Ring</option>
                    <option value="Necklace">Necklace</option>
                    <option value="Pendant">Pendant</option>
                    <option value="Bangle">Bangle</option>
                    <option value="Earrings">Earrings</option>
                    <option value="CUSTOM">+ Add New Category...</option>
                  </select>
                </div>
              </div>

              {category === 'CUSTOM' && (
                <div>
                  <label className="form-label">New Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mangalsutra / Chain / Nose Pin"
                    className="form-input"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="form-label">Item Title / Description *</label>
                <input type="text" required placeholder="e.g. 22K Royal Solitaire Pendant" className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Gross Weight (g) *</label>
                  <input type="number" step="0.001" required placeholder="0.000" className="form-input" value={grossWeight} onChange={(e) => setGrossWeight(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Stone Weight (g)</label>
                  <input type="number" step="0.001" placeholder="0.000" className="form-input" value={stoneWeight} onChange={(e) => setStoneWeight(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn-gold" style={{ flex: 1, justifyContent: 'center' }}>Save & Tag Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
