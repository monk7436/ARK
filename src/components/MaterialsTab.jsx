import React, { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, Filter, Search, Image as ImageIcon } from 'lucide-react';

export default function MaterialsTab({ materials, onOpenModal, manufacturers }) {
  const [selectedCategory, setSelectedCategory] = useState('gold'); // gold, diamond, gemstone
  const [filterDirection, setFilterDirection] = useState('ALL'); // ALL, INWARD, OUTWARD
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Calculate Balances
  const goldIn = materials.filter(m => m.materialType === 'gold' && m.direction === 'INWARD').reduce((acc, curr) => acc + curr.weight, 0);
  const goldOut = materials.filter(m => m.materialType === 'gold' && m.direction === 'OUTWARD').reduce((acc, curr) => acc + curr.weight, 0);
  const goldNetGrams = (goldIn - goldOut).toFixed(3);

  const diamondIn = materials.filter(m => m.materialType === 'diamond' && m.direction === 'INWARD').reduce((acc, curr) => acc + curr.weight, 0);
  const diamondOut = materials.filter(m => m.materialType === 'diamond' && m.direction === 'OUTWARD').reduce((acc, curr) => acc + curr.weight, 0);
  const diamondNetCarats = (diamondIn - diamondOut).toFixed(2);

  const gemstoneIn = materials.filter(m => m.materialType === 'gemstone' && m.direction === 'INWARD').reduce((acc, curr) => acc + curr.weight, 0);
  const gemstoneOut = materials.filter(m => m.materialType === 'gemstone' && m.direction === 'OUTWARD').reduce((acc, curr) => acc + curr.weight, 0);
  const gemstoneNetCarats = (gemstoneIn - gemstoneOut).toFixed(2);

  // Filtered List
  const filteredMaterials = materials.filter(m => {
    const matchesCat = m.materialType === selectedCategory;
    const matchesDir = filterDirection === 'ALL' || m.direction === filterDirection;
    const matchesSearch = searchQuery === '' || 
      (m.vendorName && m.vendorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.productType && m.productType.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesDir && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      {/* KPI Vault Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        <div className="glass-card gold-border" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
            24K Gold Vault (995)
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#f59e0b', marginTop: '4px' }}>
            {goldNetGrams} <span style={{ fontSize: '14px', color: '#94a3b8' }}>grams</span>
          </div>
          <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>
            In: +{goldIn.toFixed(2)}g | Out: -{goldOut.toFixed(2)}g
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
            Diamond Vault
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>
            {diamondNetCarats} <span style={{ fontSize: '14px', color: '#94a3b8' }}>CTS</span>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
            In: +{diamondIn.toFixed(2)} | Out: -{diamondOut.toFixed(2)}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
            Gemstone Vault
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#a855f7', marginTop: '4px' }}>
            {gemstoneNetCarats} <span style={{ fontSize: '14px', color: '#94a3b8' }}>CTS</span>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
            In: +{gemstoneIn.toFixed(2)} | Out: -{gemstoneOut.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Action Header & Category Tabs */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
        {/* Material Category Switcher */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(15,23,42,0.8)', padding: '4px', borderRadius: '12px' }}>
          {['gold', 'diamond', 'gemstone'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: selectedCategory === cat ? '#f59e0b' : 'transparent',
                color: selectedCategory === cat ? '#000' : '#94a3b8',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {cat} Vault
            </button>
          ))}
        </div>

        {/* Quick Transaction Entry Button */}
        <button
          onClick={() => onOpenModal(selectedCategory)}
          className="btn-gold"
        >
          <Plus size={18} /> Record New Entry
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder={`Search ${selectedCategory} transactions by vendor or product...`}
            className="form-input"
            style={{ paddingLeft: '36px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'rgba(15,23,42,0.8)', padding: '4px', borderRadius: '10px' }}>
          {['ALL', 'INWARD', 'OUTWARD'].map(dir => (
            <button
              key={dir}
              onClick={() => setFilterDirection(dir)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: filterDirection === dir ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: filterDirection === dir ? '#f8fafc' : '#64748b',
                fontWeight: '600',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>

      {/* Material Entries Table */}
      <div className="glass-card" style={{ overflowX: 'auto', padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
              <th style={{ padding: '14px 16px' }}>Type / Date</th>
              <th style={{ padding: '14px 16px' }}>Weight & Purity</th>
              <th style={{ padding: '14px 16px' }}>Vendor / Manufacturer</th>
              <th style={{ padding: '14px 16px' }}>Rate & Total Amount</th>
              <th style={{ padding: '14px 16px' }}>Product Type</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Photo</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No {selectedCategory} material records found. Click "+ Record New Entry" to add one.
                </td>
              </tr>
            ) : (
              filteredMaterials.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}>
                  {/* Type / Date */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${m.direction === 'INWARD' ? 'badge-inward' : 'badge-outward'}`}>
                        {m.direction === 'INWARD' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                        {m.direction}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                      {m.timestamp}
                    </div>
                  </td>

                  {/* Weight & Purity */}
                  <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                    <div style={{ color: '#f8fafc', fontSize: '14px' }}>
                      {m.weight} {m.materialType === 'gold' ? 'g' : 'CTS'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '2px' }}>
                      {m.purity ? `Purity: ${m.purity}` : `Size: ${m.size || 'N/A'}`}
                    </div>
                  </td>

                  {/* Vendor / Manufacturer */}
                  <td style={{ padding: '14px 16px', color: '#e2e8f0' }}>
                    <div style={{ fontWeight: '600' }}>{m.vendorName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {m.direction === 'INWARD' ? 'Supplier Intake' : 'Issued to Karigar'}
                    </div>
                  </td>

                  {/* Rate & Total */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#10b981', fontWeight: '700', fontSize: '14px' }}>
                      ₹{m.totalAmount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      @ ₹{m.price.toLocaleString()} / {m.materialType === 'gold' ? 'g' : 'carat'}
                    </div>
                  </td>

                  {/* Product Type */}
                  <td style={{ padding: '14px 16px' }}>
                    {m.productType ? (
                      <span className="badge badge-gold">{m.productType}</span>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '12px' }}>—</span>
                    )}
                  </td>

                  {/* Photo Thumbnail */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    {m.photoUrl ? (
                      <button
                        onClick={() => setSelectedPhoto(m.photoUrl)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <img
                          src={m.photoUrl}
                          alt="Thumbnail"
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                      </button>
                    ) : (
                      <ImageIcon size={20} color="#64748b" />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div className="modal-backdrop" onClick={() => setSelectedPhoto(null)}>
          <div className="glass-card gold-border" style={{ padding: '16px', maxWidth: '450px', width: '90%' }}>
            <img src={selectedPhoto} alt="Full Attachment" style={{ width: '100%', borderRadius: '12px', maxHeight: '70vh', objectFit: 'contain' }} />
            <button onClick={() => setSelectedPhoto(null)} className="btn-secondary" style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}>
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
