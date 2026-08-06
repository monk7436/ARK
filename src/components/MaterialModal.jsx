import React, { useState, useEffect } from 'react';
import { X, Camera, Image as ImageIcon, Plus, Calendar, Trash2 } from 'lucide-react';

export default function MaterialModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  defaultCategory = 'gold',
  manufacturers = [] 
}) {
  // 1. Material Selection
  const [materialType, setMaterialType] = useState('gold'); // 'gold', 'diamond', 'gemstone'
  
  // 2. Common Fields State
  const [dateTime, setDateTime] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState('7200');
  const [notes, setNotes] = useState('');

  // 3. Gold Specific Fields State
  const [purity, setPurity] = useState('24K');

  // 4. Multi-Stone Rows for Diamond & Gemstone Inward Entries
  const [diamondRows, setDiamondRows] = useState([
    { id: 'd-1', weight: '', size: '' }
  ]);
  const [gemstoneRows, setGemstoneRows] = useState([
    { id: 'g-1', weight: '', size: '' }
  ]);

  // Photo Picker State
  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const formattedDT = now.toLocaleString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
      setDateTime(formattedDT);

      if (defaultCategory) {
        setMaterialType(defaultCategory.toLowerCase());
        updateDefaultPrice(defaultCategory.toLowerCase());
      }
    }
  }, [isOpen, defaultCategory]);

  const updateDefaultPrice = (mat) => {
    if (mat === 'gold') {
      setPrice('7200');
      setPurity('24K');
    } else if (mat === 'diamond') {
      setPrice('45000');
    } else {
      setPrice('12000');
    }
    setErrors({});
  };

  if (!isOpen) return null;

  // Diamond & Gemstone Multi-Row Handlers
  const handleAddDiamondRow = () => setDiamondRows(prev => [...prev, { id: 'd-' + Date.now(), weight: '', size: '' }]);
  const handleRemoveDiamondRow = (id) => { if (diamondRows.length > 1) setDiamondRows(prev => prev.filter(r => r.id !== id)); };
  const handleDiamondChange = (id, field, val) => setDiamondRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));

  const handleAddGemstoneRow = () => setGemstoneRows(prev => [...prev, { id: 'g-' + Date.now(), weight: '', size: '' }]);
  const handleRemoveGemstoneRow = (id) => { if (gemstoneRows.length > 1) setGemstoneRows(prev => prev.filter(r => r.id !== id)); };
  const handleGemstoneChange = (id, field, val) => setGemstoneRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));

  // Total Weight Calculation
  const totalCalculatedWeight = materialType === 'gold' 
    ? (parseFloat(weight) || 0)
    : (materialType === 'diamond' 
        ? diamondRows.reduce((sum, r) => sum + (parseFloat(r.weight) || 0), 0)
        : gemstoneRows.reduce((sum, r) => sum + (parseFloat(r.weight) || 0), 0));

  const priceNum = parseFloat(price) || 0;
  const totalAmount = totalCalculatedWeight * priceNum;

  const goldPurityOptions = ['24K', '23K', '22K', '21K', '20K', '18K', '14K', '10K', '9K'];

  const handleMaterialChange = (mat) => {
    setMaterialType(mat);
    updateDefaultPrice(mat);
  };

  const handlePhotoUpload = (e, source) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const maxAllowed = source === 'camera' ? 1 : 3;
      files.slice(0, maxAllowed - photos.length).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setPhotos(prev => [...prev, reader.result].slice(0, 3));
        reader.readAsDataURL(file);
      });
    }
    setIsPhotoSheetOpen(false);
  };

  const handleRemovePhoto = (index) => setPhotos(prev => prev.filter((_, i) => i !== index));

  const validate = () => {
    const errs = {};
    if (!vendorName.trim()) errs.vendorName = 'Vendor Name is required.';
    if (totalCalculatedWeight <= 0) errs.weight = 'Weight must be greater than zero.';
    if (!price || parseFloat(price) <= 0) errs.price = 'Price must be greater than zero.';
    if (materialType === 'gold' && !purity) errs.purity = 'Purity is mandatory for Gold.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newEntry = {
      id: 'tx-' + Date.now(),
      timestamp: dateTime,
      direction: 'INWARD',
      materialType,
      weight: totalCalculatedWeight,
      purity: materialType === 'gold' ? purity : null,
      diamondRows: materialType === 'diamond' ? diamondRows : null,
      gemstoneRows: materialType === 'gemstone' ? gemstoneRows : null,
      vendorName,
      price: parseFloat(price),
      totalAmount,
      photoUrl: photos[0] || 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=300',
      photos,
      notes
    };

    onSubmit(newEntry);
    onClose();
    setWeight('');
    setVendorName('');
    setPhotos([]);
    setErrors({});
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
      zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '480px',
        maxHeight: '90vh', overflowY: 'auto', padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', border: '1px solid #e2e8f0'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '999px', fontWeight: '800' }}>
              MATERIAL VAULT INTAKE
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0 0 0', color: '#0f172a' }}>
              Add Material Entry
            </h3>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* SEGMENTED SELECTOR AT VERY TOP */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', background: '#f1f5f9', padding: '5px', borderRadius: '14px' }}>
              {['gold', 'diamond', 'gemstone'].map(mat => {
                const isSelected = materialType === mat;
                return (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => handleMaterialChange(mat)}
                    style={{
                      padding: '12px 8px', borderRadius: '10px', border: 'none',
                      background: isSelected ? '#d97706' : 'transparent',
                      color: isSelected ? '#ffffff' : '#64748b', fontWeight: '800',
                      fontSize: '13px', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.15s ease'
                    }}
                  >
                    {mat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* COMMON FIELD 1: DATE & TIME */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} color="#d97706" /> DATE & TIME (EDITABLE)
            </label>
            <input
              type="text"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '13.5px', fontWeight: '600', color: '#0f172a', boxSizing: 'border-box' }}
            />
          </div>

          {/* COMMON FIELD 2: VENDOR NAME */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>
              VENDOR NAME <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. MMTC-PAMP Bullion / Surat Diamond Syndicate"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: errors.vendorName ? '2px solid #dc2626' : '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            />
            {errors.vendorName && <div style={{ color: '#dc2626', fontSize: '11px', fontWeight: '700', marginTop: '3px' }}>{errors.vendorName}</div>}
          </div>

          {/* DYNAMIC MATERIAL FIELDS */}

          {/* GOLD FIELDS */}
          {materialType === 'gold' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#fffbe8', padding: '14px', borderRadius: '16px', border: '1px solid #fef08a' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#b45309' }}>WEIGHT (grams) *</label>
                <input
                  type="number" step="0.001" placeholder="0.000 g"
                  value={weight} onChange={(e) => setWeight(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: errors.weight ? '2px solid #dc2626' : '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', fontWeight: '800', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#b45309' }}>PURITY *</label>
                <select
                  value={purity} onChange={(e) => setPurity(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', fontWeight: '800', color: '#b45309', background: '#ffffff', boxSizing: 'border-box' }}
                >
                  {goldPurityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#b45309' }}>PRICE PER GRAM (₹) *</label>
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: '#b45309' }}>₹</span>
                  <input
                    type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                    style={{ width: '100%', padding: '12px 12px 12px 28px', borderRadius: '10px', border: errors.price ? '2px solid #dc2626' : '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* DIAMOND MULTI-ROW FIELDS (+ ADD MORE) */}
          {materialType === 'diamond' && (
            <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase' }}>
                DIAMOND STONES ({diamondRows.length} ROWS)
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {diamondRows.map((row) => (
                  <div key={row.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number" step="0.01" placeholder="Weight (ct)"
                      value={row.weight} onChange={(e) => handleDiamondChange(row.id, 'weight', e.target.value)}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                    />
                    <input
                      type="text" placeholder="Size (e.g. 0.10 ct)"
                      value={row.size} onChange={(e) => handleDiamondChange(row.id, 'size', e.target.value)}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                    {diamondRows.length > 1 && (
                      <button type="button" onClick={() => handleRemoveDiamondRow(row.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: '8px', width: '34px', height: '34px', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button" onClick={handleAddDiamondRow}
                style={{ width: '100%', marginTop: '10px', padding: '8px', borderRadius: '8px', background: '#ffffff', color: '#2563eb', border: '1px solid #93c5fd', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Plus size={14} /> Add More Diamond Size
              </button>

              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#1e40af' }}>PRICE PER CARAT (₹) *</label>
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: '#1e40af' }}>₹</span>
                  <input
                    type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 28px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* GEMSTONE MULTI-ROW FIELDS (+ ADD MORE) */}
          {materialType === 'gemstone' && (
            <div style={{ background: '#faf5ff', padding: '14px', borderRadius: '16px', border: '1px solid #e9d5ff' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#6b21a8', textTransform: 'uppercase' }}>
                GEMSTONE STONES ({gemstoneRows.length} ROWS)
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {gemstoneRows.map((row) => (
                  <div key={row.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number" step="0.01" placeholder="Weight (ct)"
                      value={row.weight} onChange={(e) => handleGemstoneChange(row.id, 'weight', e.target.value)}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                    />
                    <input
                      type="text" placeholder="Size (e.g. 5x7 mm)"
                      value={row.size} onChange={(e) => handleGemstoneChange(row.id, 'size', e.target.value)}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                    {gemstoneRows.length > 1 && (
                      <button type="button" onClick={() => handleRemoveGemstoneRow(row.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: '8px', width: '34px', height: '34px', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button" onClick={handleAddGemstoneRow}
                style={{ width: '100%', marginTop: '10px', padding: '8px', borderRadius: '8px', background: '#ffffff', color: '#9333ea', border: '1px solid #d8b4fe', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Plus size={14} /> Add More Gemstone Size
              </button>

              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#6b21a8' }}>PRICE PER CARAT (₹) *</label>
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: '#6b21a8' }}>₹</span>
                  <input
                    type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 28px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '800', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* COMMON FIELD 3: READ-ONLY AUTO-CALCULATED TOTAL AMOUNT */}
          <div style={{
            background: '#ecfdf5', padding: '14px 16px', borderRadius: '16px', border: '1.5px solid #059669',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>
                TOTAL AMOUNT (AUTO-CALCULATED)
              </span>
              <p style={{ fontSize: '11px', color: '#065f46', margin: '2px 0 0 0', fontWeight: '500' }}>
                {totalCalculatedWeight.toFixed(2)} {materialType === 'gold' ? 'g' : 'ct'} × ₹{priceNum}
              </p>
            </div>
            <span style={{ fontSize: '20px', fontWeight: '900', color: '#047857' }}>
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          {/* COMMON FIELD 4: PHOTO ATTACHMENT CAPSULE WORKFLOW */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>
                PHOTO ATTACHMENTS ({photos.length}/3)
              </label>

              <button
                type="button" onClick={() => setIsPhotoSheetOpen(true)}
                style={{
                  background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '999px',
                  padding: '6px 14px', fontSize: '12px', fontWeight: '800', color: '#0f172a',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Plus size={14} color="#d97706" /> Add Photos
              </button>
            </div>

            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
                {photos.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <img src={url} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => handleRemovePhoto(idx)} style={{ position: 'absolute', top: '3px', right: '3px', background: 'rgba(220, 38, 38, 0.95)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            style={{
              width: '100%', padding: '14px', borderRadius: '14px', background: '#d97706', color: '#ffffff',
              border: 'none', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)'
            }}
          >
            SAVE {materialType.toUpperCase()} ENTRY
          </button>
        </form>

      </div>

      {/* Modern Photo Attachment Bottom Sheet */}
      {isPhotoSheetOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }}>
          <div style={{ background: '#ffffff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', width: '100%', maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Attach Photo</h4>
              <button onClick={() => setIsPhotoSheetOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label style={{ padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                <Camera size={26} color="#d97706" /> Take Photo
                <input type="file" accept="image/*" capture="environment" onChange={(e) => handlePhotoUpload(e, 'camera')} style={{ display: 'none' }} />
              </label>
              <label style={{ padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                <ImageIcon size={26} color="#2563eb" /> Choose Gallery
                <input type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(e, 'gallery')} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
