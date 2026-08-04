import React, { useState } from 'react';
import { Package, Download, Upload, Search, Plus, Filter, FileSpreadsheet, Check, X } from 'lucide-react';

export default function InventoryTab({ inventory, onAddStockItem, onImportExcel }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New stock form state
  const [tagCode, setTagCode] = useState('ARK-RNG-' + Math.floor(1000 + Math.random() * 9000));
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Ring');
  const [purityKarat, setPurityKarat] = useState('22K (91.6%)');
  const [grossWeight, setGrossWeight] = useState('');
  const [stoneWeight, setStoneWeight] = useState('0');
  const [makingCharge, setMakingCharge] = useState('450');

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tagCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateStockItem = (e) => {
    e.preventDefault();
    const gross = parseFloat(grossWeight || 0);
    const stone = parseFloat(stoneWeight || 0);
    const net = gross - stone;
    const fine = net * 0.916; // 22k default

    onAddStockItem({
      id: 'inv-' + Date.now(),
      tagCode,
      name,
      category,
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
    setIsAddModalOpen(false);
  };

  // Export to Excel / CSV trigger
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
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>
            Tagged Inventory Catalog
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>
            {inventory.length} total items | Vault Net Weight: {inventory.reduce((a,b)=>a+b.netWeight,0).toFixed(2)}g
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

      {/* Search & Category Filter */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search by Tag ID (e.g. ARK-RNG-1001) or item name..."
            className="form-input"
            style={{ paddingLeft: '36px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'rgba(15,23,42,0.8)', padding: '4px', borderRadius: '10px' }}>
          {['ALL', 'Ring', 'Necklace', 'Bangle', 'Earrings'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: selectedCategory === cat ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: selectedCategory === cat ? '#f59e0b' : '#64748b',
                fontWeight: '600',
                fontSize: '12px',
                cursor: 'pointer'
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
            <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden' }}>
              <img
                src={item.photoUrl}
                alt={item.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                {item.tagCode}
              </div>
              <div style={{ position: 'absolute', bottom: '8px', right: '8px' }}>
                <span className="badge badge-inward">{item.status}</span>
              </div>
            </div>

            {/* Title & Category */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>{item.name}</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{item.category} • {item.purityKarat}</p>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

            {/* Weight Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', textAlign: 'center', fontSize: '12px' }}>
              <div style={{ background: 'rgba(15,23,42,0.5)', padding: '6px', borderRadius: '6px' }}>
                <div style={{ color: '#64748b', fontSize: '10px' }}>Gross Wt</div>
                <div style={{ fontWeight: '700', color: '#f8fafc' }}>{item.grossWeight}g</div>
              </div>
              <div style={{ background: 'rgba(15,23,42,0.5)', padding: '6px', borderRadius: '6px' }}>
                <div style={{ color: '#64748b', fontSize: '10px' }}>Net Wt</div>
                <div style={{ fontWeight: '700', color: '#f59e0b' }}>{item.netWeight}g</div>
              </div>
              <div style={{ background: 'rgba(15,23,42,0.5)', padding: '6px', borderRadius: '6px' }}>
                <div style={{ color: '#64748b', fontSize: '10px' }}>Fine Wt</div>
                <div style={{ fontWeight: '700', color: '#10b981' }}>{item.fineWeight}g</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Excel Import Modal */}
      {isImportModalOpen && (
        <div className="modal-backdrop">
          <div className="glass-card gold-border" style={{ width: '100%', maxWidth: '500px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>Excel Inventory Import</h2>
              <button onClick={() => setIsImportModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px', borderRadius: '10px', fontSize: '12px', color: '#10b981', marginBottom: '16px' }}>
              ✓ Auto-calculates Fine Weight from Net Weight & Purity.<br />
              ✓ Missing Tag IDs are auto-generated.<br />
              ✓ Supports photo URLs & ZIP file upload.
            </div>

            <label style={{ border: '2px dashed rgba(245,158,11,0.4)', padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(15,23,42,0.6)' }}>
              <FileSpreadsheet size={32} color="#f59e0b" />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>Choose Excel (.xlsx / .csv) File</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>or drag & drop your inventory sheet here</span>
              <input
                type="file"
                accept=".csv, .xlsx"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    onImportExcel();
                    setIsImportModalOpen(false);
                  }
                }}
                style={{ display: 'none' }}
              />
            </label>

            <button onClick={() => setIsImportModalOpen(false)} className="btn-secondary" style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add New Tag Item Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="glass-card gold-border" style={{ width: '100%', maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>Tag New Finished Item</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStockItem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Auto Tag Code</label>
                  <input type="text" readOnly className="form-input" value={tagCode} style={{ color: '#f59e0b', fontWeight: '700' }} />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Ring">Ring</option>
                    <option value="Necklace">Necklace / Choker</option>
                    <option value="Bangle">Bangle</option>
                    <option value="Earrings">Earrings</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Item Title / Description *</label>
                <input type="text" required placeholder="e.g. 22K Antique Royal Ring" className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
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
