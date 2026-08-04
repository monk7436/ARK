import React, { useState, useEffect } from 'react';
import { X, Camera, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function MaterialModal({ isOpen, onClose, onSubmit, defaultCategory = 'gold', manufacturers = [] }) {
  const [direction, setDirection] = useState('INWARD'); // INWARD or OUTWARD
  const [materialType, setMaterialType] = useState(defaultCategory); // gold, diamond, gemstone
  
  const [weight, setWeight] = useState('');
  const [purity, setPurity] = useState('995 (24K)');
  const [vendorName, setVendorName] = useState('');
  const [manufacturerId, setManufacturerId] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [productType, setProductType] = useState('Ring');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoName, setPhotoName] = useState('');

  useEffect(() => {
    setMaterialType(defaultCategory);
  }, [defaultCategory]);

  if (!isOpen) return null;

  const totalAmount = (parseFloat(weight || 0) * parseFloat(price || 0)).toFixed(2);
  const currentTimestamp = new Date().toLocaleString();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: 'tx-' + Date.now(),
      timestamp: currentTimestamp,
      direction,
      materialType,
      weight: parseFloat(weight || 0),
      purity: materialType === 'gold' ? purity : null,
      size: materialType !== 'gold' ? size : null,
      vendorName: direction === 'INWARD' ? vendorName : (manufacturers.find(m => m.id === manufacturerId)?.name || vendorName),
      manufacturerId: direction === 'OUTWARD' ? manufacturerId : null,
      price: parseFloat(price || 0),
      totalAmount: parseFloat(totalAmount),
      productType: direction === 'OUTWARD' ? productType : null,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1611591475140-be360fc635a1?w=300',
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-card gold-border" style={{ width: '100%', maxWidth: '520px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc' }}>
              Record Material Entry
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              Auto-timestamp: {currentTimestamp}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Direction Switcher (Inward vs Outward) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setDirection('INWARD')}
            style={{
              padding: '10px',
              borderRadius: '10px',
              border: direction === 'INWARD' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
              background: direction === 'INWARD' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: direction === 'INWARD' ? '#10b981' : '#94a3b8',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <ArrowDownLeft size={18} /> Inward (Store Intake)
          </button>
          
          <button
            type="button"
            onClick={() => setDirection('OUTWARD')}
            style={{
              padding: '10px',
              borderRadius: '10px',
              border: direction === 'OUTWARD' ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.1)',
              background: direction === 'OUTWARD' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: direction === 'OUTWARD' ? '#f43f5e' : '#94a3b8',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <ArrowUpRight size={18} /> Outward (Issue to Karigar)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Material Type Pills */}
          <div>
            <label className="form-label">Material Category</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['gold', 'diamond', 'gemstone'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setMaterialType(cat)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: materialType === cat ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                    background: materialType === cat ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                    color: materialType === cat ? '#f59e0b' : '#94a3b8',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Weight & Purity Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">
                Weight {materialType === 'gold' ? '(Grams)' : '(Carats/CTS)'} *
              </label>
              <input
                type="number"
                step="0.001"
                required
                placeholder="0.000"
                className="form-input"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            {materialType === 'gold' ? (
              <div>
                <label className="form-label">Purity *</label>
                <input
                  type="text"
                  readOnly
                  className="form-input"
                  value={purity}
                  style={{ opacity: 0.9, color: '#f59e0b', fontWeight: '700' }}
                />
              </div>
            ) : (
              <div>
                <label className="form-label">Size (MM / Sieve)</label>
                <input
                  type="text"
                  placeholder="e.g. 2.5 mm / +11"
                  className="form-input"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Vendor / Manufacturer Name */}
          <div>
            <label className="form-label">
              {direction === 'INWARD' ? 'Vendor / Supplier Name *' : 'Assigned Manufacturer (Karigar) *'}
            </label>
            {direction === 'OUTWARD' && manufacturers.length > 0 ? (
              <select
                required
                className="form-input"
                value={manufacturerId}
                onChange={(e) => setManufacturerId(e.target.value)}
              >
                <option value="">Select Manufacturer...</option>
                {manufacturers.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.office})</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                placeholder="Enter Vendor / Supplier Name"
                className="form-input"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
              />
            )}
          </div>

          {/* Price & Auto Total Amount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">
                Price Rate {materialType === 'gold' ? '(₹ / Gram)' : '(₹ / Carat)'} *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="form-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Total Amount (₹)</label>
              <input
                type="text"
                readOnly
                className="form-input"
                value={'₹ ' + totalAmount}
                style={{ fontWeight: '700', color: '#10b981' }}
              />
            </div>
          </div>

          {/* Product Type (Shown for Outward entries) */}
          {direction === 'OUTWARD' && (
            <div>
              <label className="form-label">Product Type (To Be Manufactured) *</label>
              <select
                className="form-input"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              >
                <option value="Ring">Ring</option>
                <option value="Necklace">Necklace / Choker</option>
                <option value="Bangle">Bangle / Bracelet</option>
                <option value="Pendant">Pendant Set</option>
                <option value="Earrings">Earrings / Bali</option>
                <option value="Custom Jewelry">Custom Custom Design</option>
              </select>
            </div>
          )}

          {/* Photo Attachment Field */}
          <div>
            <label className="form-label">Photo Attachment (Bill / Item Snapshot)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label
                style={{
                  flex: 1,
                  border: '1px dashed rgba(245, 158, 11, 0.4)',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#94a3b8',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Camera size={18} color="#f59e0b" />
                {photoName ? photoName : 'Click to Upload Photo / Capture'}
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>
              
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt="Preview"
                  style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #f59e0b' }}
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" className="btn-gold" style={{ flex: 1, justifyContent: 'center' }}>
              Submit Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
