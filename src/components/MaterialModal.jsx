import React, { useState, useEffect } from 'react';
import { X, Camera, Image as ImageIcon, ArrowDownLeft, ArrowUpRight, Check, Trash2 } from 'lucide-react';

export default function MaterialModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  defaultCategory = 'gold',
  manufacturers = [] 
}) {
  const [direction, setDirection] = useState('INWARD'); // INWARD or OUTWARD
  const [materialType, setMaterialType] = useState('gold');
  
  const [weight, setWeight] = useState('');
  const [purity, setPurity] = useState('24K - 995 (99.5% Store Standard)');
  const [size, setSize] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [manufacturerId, setManufacturerId] = useState('');
  const [price, setPrice] = useState('7200');
  const [productType, setProductType] = useState('Ring');
  
  // Multi-photo attachments (up to 3 images)
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (defaultCategory) {
      setMaterialType(defaultCategory.toLowerCase());
      if (defaultCategory.toLowerCase() === 'gold') {
        setPrice('7200');
        setPurity('24K - 995 (99.5% Store Standard)');
      } else if (defaultCategory.toLowerCase() === 'diamond') {
        setPrice('45000');
      } else {
        setPrice('12000');
      }
    }
  }, [defaultCategory, isOpen]);

  if (!isOpen) return null;

  const totalAmount = (parseFloat(weight) || 0) * (parseFloat(price) || 0);

  const goldPurityOptions = [
    '24K - 995 (99.5% Store Standard)',
    '24K - 999 (99.9% Fine Gold)',
    '22K - 916 (91.6% Hallmarked)',
    '20K - 833 (83.3%)',
    '18K - 750 (75.0% Fine)',
    '14K - 585 (58.5% Fine)',
    '9K - 375 (37.5% Fine)'
  ];

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPhotoUrls = files.slice(0, 3 - photos.length).map(file => URL.createObjectURL(file));
      setPhotos(prev => [...prev, ...newPhotoUrls].slice(0, 3));
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!weight || !price) {
      alert("Please fill in weight and price");
      return;
    }

    const selectedMfg = manufacturers.find(m => m.id === manufacturerId);
    const finalVendor = direction === 'INWARD'
      ? (vendorName || 'MMTC-PAMP Bullion Supplier')
      : (selectedMfg ? selectedMfg.name : 'Artisan Workshop');

    const timestamp = new Date().toLocaleString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const newEntry = {
      id: 'tx-' + Date.now(),
      timestamp,
      direction,
      materialType,
      weight: parseFloat(weight),
      purity: materialType === 'gold' ? purity : null,
      size: materialType !== 'gold' ? size : null,
      vendorName: finalVendor,
      manufacturerId: direction === 'OUTWARD' ? manufacturerId : null,
      price: parseFloat(price),
      totalAmount,
      productType: direction === 'OUTWARD' ? productType : null,
      photoUrl: photos[0] || 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=300',
      photos
    };

    onSubmit(newEntry);
    onClose();
    // Reset
    setWeight('');
    setPhotos([]);
  };

  const categoryTitle = materialType.toUpperCase();

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        background: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '999px', fontWeight: '800' }}>
              {categoryTitle} VAULT ENTRY
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0 0 0', color: '#0f172a' }}>
              Record {categoryTitle} Transaction
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Direction Selector (Inward vs Outward) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setDirection('INWARD')}
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: direction === 'INWARD' ? '2px solid #059669' : '1px solid #e2e8f0',
                background: direction === 'INWARD' ? '#ecfdf5' : '#ffffff',
                color: direction === 'INWARD' ? '#047857' : '#64748b',
                fontWeight: '800',
                fontSize: '13px',
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
                padding: '12px',
                borderRadius: '12px',
                border: direction === 'OUTWARD' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                background: direction === 'OUTWARD' ? '#eff6ff' : '#ffffff',
                color: direction === 'OUTWARD' ? '#1e40af' : '#64748b',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <ArrowUpRight size={18} /> Outward (Issue Karigar)
            </button>
          </div>

          {/* Weight Input */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
              WEIGHT ({materialType === 'gold' ? 'GRAMS' : 'CARATS'})
            </label>
            <input
              type="number"
              step="0.001"
              placeholder="0.000"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                marginTop: '4px',
                fontSize: '15px',
                fontWeight: '700',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Gold Purity Dropdown (24K down to 9K) */}
          {materialType === 'gold' ? (
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                GOLD PURITY SELECTION
              </label>
              <select
                value={purity}
                onChange={(e) => setPurity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  marginTop: '4px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#b45309',
                  background: '#fef3c7',
                  boxSizing: 'border-box'
                }}
              >
                {goldPurityOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>SIZE (MM / SIEVE)</label>
              <input
                type="text"
                placeholder="e.g. 2.5 mm / Sieve 3"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  marginTop: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {/* Vendor Name or Assigned Karigar */}
          {direction === 'INWARD' ? (
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>VENDOR / SUPPLIER NAME</label>
              <input
                type="text"
                placeholder="e.g. MMTC-PAMP Bullion / Surat Syndicate"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  marginTop: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>ASSIGNED KARIGAR / MANUFACTURER</label>
              <select
                value={manufacturerId}
                onChange={(e) => setManufacturerId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  marginTop: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Select Karigar --</option>
                {manufacturers.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.office})</option>
                ))}
              </select>
            </div>
          )}

          {/* Rate per Gram & Total Amount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                RATE (₹ / {materialType === 'gold' ? 'GRAM' : 'CARAT'})
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  marginTop: '4px',
                  fontSize: '14px',
                  fontWeight: '700',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{
              background: '#f8fafc',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>TOTAL AMOUNT</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#15803d', marginTop: '2px' }}>
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Outward Product Type */}
          {direction === 'OUTWARD' && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>PRODUCT TYPE TO MANUFACTURE</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  marginTop: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Ring">Ring</option>
                <option value="Necklace">Necklace</option>
                <option value="Bangle">Bangle</option>
                <option value="Pendant">Pendant</option>
                <option value="Earrings">Earrings</option>
              </select>
            </div>
          )}

          {/* Photo Attachments (Camera & Up to 3 Gallery Photos) */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
              <span>PHOTO ATTACHMENTS ({photos.length}/3)</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Camera or Gallery</span>
            </label>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', alignItems: 'center' }}>
              {photos.map((url, idx) => (
                <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                  <img src={url} alt="Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    style={{
                      position: 'absolute',
                      top: '2px', right: '2px',
                      background: 'rgba(239, 68, 68, 0.85)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {photos.length < 3 && (
                <label style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '10px',
                  border: '2px dashed #cbd5e1',
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b'
                }}>
                  <Camera size={20} />
                  <span style={{ fontSize: '9px', fontWeight: '700', marginTop: '2px' }}>+ Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: '#d97706',
              color: '#ffffff',
              border: 'none',
              fontSize: '15px',
              fontWeight: '800',
              cursor: 'pointer',
              marginTop: '10px',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)'
            }}
          >
            SAVE {categoryTitle} ENTRY
          </button>
        </form>

      </div>
    </div>
  );
}
