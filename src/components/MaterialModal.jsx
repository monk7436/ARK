import React, { useState, useEffect } from 'react';
import { X, Camera, Image as ImageIcon, ArrowDownLeft, ArrowUpRight, Check, Trash2, Plus } from 'lucide-react';

export default function MaterialModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  defaultCategory = 'gold',
  manufacturers = [] 
}) {
  // Step 1: Material Selection Segmented Control
  const [materialType, setMaterialType] = useState('gold'); // 'gold', 'diamond', 'gemstone'
  
  // Step 2: Entry Type Segmented Control
  const [direction, setDirection] = useState('INWARD'); // 'INWARD' or 'OUTWARD'

  // Step 3: Dynamic Fields State
  const [weight, setWeight] = useState('');
  const [purity, setPurity] = useState('24K - 995');
  const [diamondSize, setDiamondSize] = useState('');
  const [diamondClarity, setDiamondClarity] = useState('VVS - EF');
  const [gemstoneType, setGemstoneType] = useState('Ruby');
  
  const [vendorName, setVendorName] = useState('');
  const [manufacturerId, setManufacturerId] = useState('');
  const [price, setPrice] = useState('7200');
  const [productType, setProductType] = useState('Ring');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');

  // Modern Capsule Photo Upload Modal Sheet
  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (defaultCategory) {
      setMaterialType(defaultCategory.toLowerCase());
      updateDefaultPrice(defaultCategory.toLowerCase());
    }
  }, [defaultCategory, isOpen]);

  const updateDefaultPrice = (mat) => {
    if (mat === 'gold') {
      setPrice('7200');
      setPurity('24K - 995');
    } else if (mat === 'diamond') {
      setPrice('45000');
    } else {
      setPrice('12000');
    }
  };

  if (!isOpen) return null;

  const totalAmount = (parseFloat(weight) || 0) * (parseFloat(price) || 0);

  const goldPurityOptions = [
    '24K - 995',
    '24K - 999',
    '22K - 916',
    '20K - 833',
    '18K - 750',
    '14K - 585',
    '9K - 375'
  ];

  const handleMaterialChange = (type) => {
    setMaterialType(type);
    updateDefaultPrice(type);
  };

  const handlePhotoUpload = (e, source) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const maxAllowed = source === 'camera' ? 1 : 3;
      files.slice(0, maxAllowed - photos.length).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos(prev => [...prev, reader.result].slice(0, 3));
        };
        reader.readAsDataURL(file);
      });
    }
    setIsPhotoSheetOpen(false);
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
      diamondSize: materialType === 'diamond' ? diamondSize : null,
      diamondClarity: materialType === 'diamond' ? diamondClarity : null,
      gemstoneType: materialType === 'gemstone' ? gemstoneType : null,
      vendorName: finalVendor,
      manufacturerId: direction === 'OUTWARD' ? manufacturerId : null,
      price: parseFloat(price),
      totalAmount,
      productType: direction === 'OUTWARD' ? productType : null,
      expectedReturnDate: direction === 'OUTWARD' ? expectedReturnDate : null,
      notes,
      photoUrl: photos[0] || 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=300',
      photos
    };

    onSubmit(newEntry);
    onClose();
    setWeight('');
    setPhotos([]);
    setNotes('');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 2100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        border: '1px solid #e2e8f0'
      }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '999px', fontWeight: '800' }}>
              UNIVERSAL MATERIAL ENTRY
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0 0 0', color: '#0f172a' }}>
              Record Material Vault Entry
            </h3>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* STEP 1: MATERIAL SELECTION (SEGMENTED CONTROL) */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              STEP 1: SELECT MATERIAL
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '6px',
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: '12px',
              marginTop: '6px'
            }}>
              {['gold', 'diamond', 'gemstone'].map(cat => {
                const isSelected = materialType === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleMaterialChange(cat)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isSelected ? '#d97706' : 'transparent',
                      color: isSelected ? '#ffffff' : '#64748b',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: ENTRY TYPE (SEGMENTED CONTROL) */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              STEP 2: ENTRY TYPE
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setDirection('INWARD')}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: direction === 'INWARD' ? '2px solid #059669' : '1px solid #e2e8f0',
                  background: direction === 'INWARD' ? '#ecfdf5' : '#ffffff',
                  color: direction === 'INWARD' ? '#059669' : '#64748b',
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
                  border: direction === 'OUTWARD' ? '2px solid #dc2626' : '1px solid #e2e8f0',
                  background: direction === 'OUTWARD' ? '#fef2f2' : '#ffffff',
                  color: direction === 'OUTWARD' ? '#dc2626' : '#64748b',
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
          </div>

          {/* STEP 3: DYNAMIC FIELDS COMBINATION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            
            {/* Vendor (Inward) OR Karigar (Outward) */}
            {direction === 'INWARD' ? (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>VENDOR / SUPPLIER NAME</label>
                <input
                  type="text"
                  placeholder="e.g. MMTC-PAMP Bullion / Surat Syndicate"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>ASSIGNED KARIGAR / MANUFACTURER</label>
                <select
                  value={manufacturerId}
                  onChange={(e) => setManufacturerId(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  <option value="">-- Select Karigar --</option>
                  {manufacturers.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.office})</option>
                  ))}
                </select>
              </div>
            )}

            {/* GOLD COMBINATION FIELDS */}
            {materialType === 'gold' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>WEIGHT (GRAMS)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', fontWeight: '700', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>GOLD PURITY</label>
                  <select
                    value={purity}
                    onChange={(e) => setPurity(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', fontWeight: '800', color: '#b45309', background: '#fef3c7', boxSizing: 'border-box' }}
                  >
                    {goldPurityOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* DIAMOND COMBINATION FIELDS */}
            {materialType === 'diamond' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>WEIGHT (CARATS / CTS)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00 CTS"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', fontWeight: '700', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>SIEVE / SIZE (MM)</label>
                  <input
                    type="text"
                    placeholder="e.g. Sieve 3 / 2.5 mm"
                    value={diamondSize}
                    onChange={(e) => setDiamondSize(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}

            {/* GEMSTONE COMBINATION FIELDS */}
            {materialType === 'gemstone' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>WEIGHT (CTS)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00 CTS"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', fontWeight: '700', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>GEMSTONE TYPE</label>
                  <select
                    value={gemstoneType}
                    onChange={(e) => setGemstoneType(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    <option value="Ruby">Ruby (Manik)</option>
                    <option value="Emerald">Emerald (Panna)</option>
                    <option value="Sapphire">Blue Sapphire (Neelam)</option>
                    <option value="Pearl">Pearl (Moti)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Rate & Total Amount */}
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
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{
                background: '#ffffff',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>TOTAL AMOUNT</span>
                <span style={{ fontSize: '16px', fontWeight: '800', color: direction === 'INWARD' ? '#059669' : '#dc2626', marginTop: '2px' }}>
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Expected Return Date (Outward only) */}
            {direction === 'OUTWARD' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>EXPECTED RETURN DATE</label>
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>REMARKS / NOTES</label>
              <input
                type="text"
                placeholder="Optional notes or tag code..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

          </div>

          {/* REDESIGNED PHOTO ATTACHMENT WORKFLOW (MODERN WHATSAPP / NOTION CAPSULE BUTTON) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>
                PHOTO ATTACHMENTS ({photos.length}/3)
              </label>

              {/* Single Modern Capsule Button */}
              <button
                type="button"
                onClick={() => setIsPhotoSheetOpen(true)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '999px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: '800',
                  color: '#0f172a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                }}
              >
                <Plus size={14} color="#d97706" /> Add Photos
              </button>
            </div>

            {/* Small Rounded Thumbnail Previews */}
            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
                {photos.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <img src={url} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      style={{
                        position: 'absolute',
                        top: '3px', right: '3px',
                        background: 'rgba(220, 38, 38, 0.9)',
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
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
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
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)'
            }}
          >
            SAVE {materialType.toUpperCase()} ENTRY
          </button>
        </form>

      </div>

      {/* MODERN ATTACHMENT BOTTOM SHEET (TAKE PHOTO vs CHOOSE GALLERY) */}
      {isPhotoSheetOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#ffffff',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
            boxShadow: '0 -10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Attach Photo</h4>
              <button onClick={() => setIsPhotoSheetOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label style={{
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13px',
                color: '#0f172a'
              }}>
                <Camera size={26} color="#d97706" />
                Take Photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handlePhotoUpload(e, 'camera')}
                  style={{ display: 'none' }}
                />
              </label>

              <label style={{
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13px',
                color: '#0f172a'
              }}>
                <ImageIcon size={26} color="#2563eb" />
                Choose From Gallery
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoUpload(e, 'gallery')}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
