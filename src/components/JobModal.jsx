import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Lock, Hash, Camera, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import DiamondItemInput from './DiamondItemInput';

export default function JobModal({
  isOpen,
  onClose,
  onSubmit,
  initialJob = null,
  manufacturers = [],
  nextJobNumber = '001',
  diamondStock = {}
}) {
  const isEditing = Boolean(initialJob);

  // Locked Fields
  const [jobNumber, setJobNumber] = useState('001');
  const [dateTime, setDateTime] = useState('');
  const [manufacturerId, setManufacturerId] = useState('');
  const [productName, setProductName] = useState('');

  // Gold Section (Always starts with 24K)
  const [goldWeight, setGoldWeight] = useState('');
  const [goldPurity, setGoldPurity] = useState('24K');

  // Structured Independent Diamond Child Items
  const [diamondItems, setDiamondItems] = useState([
    { id: 'd-item-1', parentId: null, weight: '', sizeMm: 2.5, shape: 'Round', customShape: '' }
  ]);

  // Independent Gemstone Child Items
  const [gemstoneItems, setGemstoneItems] = useState([
    { id: 'g-item-1', parentId: null, weight: '', size: '', stoneType: 'Gemstone' }
  ]);

  // Photo Attachments (up to 3 photos)
  const [photos, setPhotos] = useState([]);
  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false);

  // Notes
  const [notes, setNotes] = useState('');

  // Insufficient Diamond Stock Error
  const [stockError, setStockError] = useState(null);

  // Gold purity dropdown starts with 24K
  const goldPurityOptions = ['24K', '22K', '18K', '14K', '9K'];

  useEffect(() => {
    if (isOpen) {
      setStockError(null);
      if (initialJob) {
        setJobNumber(initialJob.jobNumber || '001');
        setDateTime(initialJob.timestamp || '');
        setManufacturerId(initialJob.manufacturerId || '');
        setProductName(initialJob.productName || '');
        setGoldWeight(initialJob.goldWeight && initialJob.goldWeight > 0 ? initialJob.goldWeight : '');
        setGoldPurity(initialJob.goldPurity || '24K');
        
        const dList = initialJob.diamondItems || initialJob.diamondRows || [];
        setDiamondItems(dList.length > 0 ? dList : [{ id: 'd-item-1', parentId: initialJob.id, weight: '', sizeMm: 2.5, shape: 'Round', customShape: '' }]);
        
        const gList = initialJob.gemstoneItems || initialJob.gemstoneRows || [];
        setGemstoneItems(gList.length > 0 ? gList : [{ id: 'g-item-1', parentId: initialJob.id, weight: '', size: '', stoneType: 'Gemstone' }]);
        
        setNotes(initialJob.notes || '');
        if (initialJob.photos && initialJob.photos.length > 0) {
          setPhotos(initialJob.photos);
        } else if (initialJob.photoUrl) {
          setPhotos([initialJob.photoUrl]);
        } else {
          setPhotos([]);
        }
      } else {
        setJobNumber(nextJobNumber);
        const now = new Date();
        const formattedDT = now.toLocaleString('en-IN', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true
        });
        setDateTime(formattedDT);
        setManufacturerId(manufacturers[0]?.id || '');
        setProductName('');
        setGoldWeight('');
        setGoldPurity('24K'); // Always start with 24K
        setDiamondItems([{ id: 'd-item-1', parentId: null, weight: '', sizeMm: 2.5, shape: 'Round', customShape: '' }]);
        setGemstoneItems([{ id: 'g-item-1', parentId: null, weight: '', size: '', stoneType: 'Gemstone' }]);
        setPhotos([]);
        setNotes('');
      }
    }
  }, [isOpen, initialJob, nextJobNumber, manufacturers]);

  if (!isOpen) return null;

  // Helper to look up available stock from passed diamondStock map
  const getAvailableStock = (sizeMm, shape, customShape) => {
    const shapeKey = shape === 'Other' ? (customShape || 'Other') : shape;
    const sizeKey = parseFloat(sizeMm || 2.5).toFixed(1);
    if (diamondStock[sizeKey] && diamondStock[sizeKey][shapeKey]) {
      return diamondStock[sizeKey][shapeKey].available || 0;
    }
    // Default mock available if stock map not populated
    return 10.0;
  };

  // Independent Diamond Item Handlers
  const handleAddDiamondItem = () => {
    setDiamondItems(prev => [
      ...prev, 
      { id: 'd-item-' + Date.now() + Math.random().toString(36).substring(2, 5), parentId: initialJob?.id || null, weight: '', sizeMm: 2.5, shape: 'Round', customShape: '' }
    ]);
  };
  const handleRemoveDiamondItem = (id) => {
    if (diamondItems.length > 1) {
      setDiamondItems(prev => prev.filter(r => r.id !== id));
      setStockError(null);
    }
  };
  const handleDiamondChange = (id, field, value) => {
    setDiamondItems(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setStockError(null);
  };

  // Independent Gemstone Item Handlers
  const handleAddGemstoneItem = () => {
    setGemstoneItems(prev => [
      ...prev, 
      { id: 'g-item-' + Date.now() + Math.random().toString(36).substring(2, 5), parentId: initialJob?.id || null, weight: '', size: '', stoneType: 'Gemstone' }
    ]);
  };
  const handleRemoveGemstoneItem = (id) => {
    if (gemstoneItems.length > 1) {
      setGemstoneItems(prev => prev.filter(r => r.id !== id));
    }
  };
  const handleGemstoneChange = (id, field, value) => {
    setGemstoneItems(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
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

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedMfg = manufacturers.find(m => m.id === manufacturerId);
    const mfgName = selectedMfg ? selectedMfg.name : 'Artisan Workshop';
    const parentJobId = initialJob ? initialJob.id : ('job-' + Date.now());

    // 1. Check Exact Diamond Stock Availability
    for (const item of diamondItems) {
      const reqWeight = parseFloat(item.weight || item.weightCt || 0);
      if (reqWeight > 0) {
        const avail = getAvailableStock(item.sizeMm, item.shape, item.customShape);
        if (avail < reqWeight) {
          const short = (reqWeight - avail).toFixed(2);
          setStockError({
            message: `Insufficient Diamond Stock for ${parseFloat(item.sizeMm || 2.5).toFixed(1)} mm ${item.shape}.`,
            required: reqWeight.toFixed(2),
            available: avail.toFixed(2),
            short
          });
          return;
        }
      }
    }

    // 2. Map structured independent child items with parentJobId
    const finalDiamondItems = diamondItems
      .filter(r => (parseFloat(r.weight) || 0) > 0)
      .map(r => ({
        id: r.id,
        parentId: parentJobId,
        weight: parseFloat(r.weight) || 0,
        weightCt: parseFloat(r.weight) || 0,
        sizeMm: parseFloat(r.sizeMm || 2.5),
        size: `${parseFloat(r.sizeMm || 2.5).toFixed(1)} mm`,
        shape: r.shape || 'Round',
        customShape: r.shape === 'Other' ? r.customShape : null
      }));

    const finalGemstoneItems = gemstoneItems
      .filter(r => r.weight || r.size)
      .map(r => ({
        id: r.id,
        parentId: parentJobId,
        weight: parseFloat(r.weight) || 0,
        size: r.size || 'Standard',
        stoneType: r.stoneType || 'Gemstone'
      }));

    const jobData = {
      id: parentJobId,
      jobNumber,
      timestamp: dateTime,
      manufacturerId,
      manufacturerName: mfgName,
      productName: productName || 'Custom Jewellery Order',
      goldWeight: parseFloat(goldWeight) || 0,
      goldPurity,
      diamondItems: finalDiamondItems,
      gemstoneItems: finalGemstoneItems,
      notes,
      photoUrl: photos[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300',
      photos,
      status: initialJob ? initialJob.status : 'In Progress'
    };

    onSubmit(jobData);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
      zIndex: 2200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '480px',
        maxHeight: '90vh', overflowY: 'auto', padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', border: '1px solid #e2e8f0'
      }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <span style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '999px', fontWeight: '800' }}>
              {isEditing ? 'EDIT JOB' : 'NEW MANUFACTURING JOB'}
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0 0 0', color: '#0f172a' }}>
              {isEditing ? `Edit Job #${jobNumber}` : `Create Job #${jobNumber}`}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Insufficient Stock Error Banner */}
        {stockError && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px',
            padding: '12px', marginBottom: '14px', display: 'flex', gap: '10px', alignItems: 'flex-start'
          }}>
            <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#991b1b' }}>INSUFFICIENT DIAMOND STOCK</div>
              <div style={{ fontSize: '11.5px', color: '#b91c1c', marginTop: '2px' }}>{stockError.message}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#7f1d1d', marginTop: '4px' }}>
                Required: {stockError.required} ct | Available: {stockError.available} ct | <span style={{ color: '#dc2626' }}>Short: {stockError.short} ct</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* LOCKED FIELD 1: AUTO-GENERATED JOB NUMBER */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Hash size={12} /> JOB NUMBER (AUTO)
              </label>
              <div style={{
                background: '#f1f5f9', padding: '12px', borderRadius: '10px',
                fontSize: '15px', fontWeight: '900', color: '#2563eb', border: '1px solid #cbd5e1',
                marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <span>#{jobNumber}</span>
                <Lock size={14} color="#94a3b8" />
              </div>
            </div>

            {/* LOCKED FIELD 2: CREATION TIMESTAMP */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> DATE & TIME
              </label>
              <div style={{
                background: '#f1f5f9', padding: '10px 12px', borderRadius: '10px',
                fontSize: '11.5px', fontWeight: '700', color: '#475569', border: '1px solid #cbd5e1',
                marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dateTime}</span>
                <Lock size={14} color="#94a3b8" />
              </div>
            </div>
          </div>

          {/* KARIGAR & PRODUCT NAME (Locked in Editing) */}
          {!isEditing ? (
            <>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>ASSIGNED KARIGAR / MANUFACTURER</label>
                <select
                  value={manufacturerId}
                  onChange={(e) => setManufacturerId(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  {manufacturers.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.office})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>PRODUCT NAME / ITEM TYPE</label>
                <input
                  type="text"
                  placeholder="e.g. 14 K snake ring"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </>
          ) : (
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>PRODUCT & KARIGAR (LOCKED)</div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{productName}</div>
            </div>
          )}

          {/* 1. GOLD SINGLE RECORD SECTION (Always starts with 24K) */}
          <div style={{ background: '#fffbe8', padding: '14px', borderRadius: '16px', border: '1px solid #fef08a' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              GOLD ISSUED (OPTIONAL)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#92400e' }}>WEIGHT (GRAMS)</label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.000 g"
                  value={goldWeight}
                  onChange={(e) => setGoldWeight(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#92400e' }}>PURITY</label>
                <select
                  value={goldPurity}
                  onChange={(e) => setGoldPurity(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', fontWeight: '800', color: '#b45309', background: '#ffffff', boxSizing: 'border-box' }}
                >
                  {goldPurityOptions.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. STRUCTURED DIAMOND SECTION WITH REUSABLE COMPONENT (+ ADD MORE) */}
          <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                DIAMOND ISSUED ({diamondItems.length} ROWS)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {diamondItems.map((item, idx) => {
                const avail = getAvailableStock(item.sizeMm, item.shape, item.customShape);
                return (
                  <DiamondItemInput
                    key={item.id}
                    item={item}
                    index={idx}
                    availableStock={avail}
                    onChange={handleDiamondChange}
                    onRemove={() => handleRemoveDiamondItem(item.id)}
                    showRemove={diamondItems.length > 1}
                  />
                );
              })}
            </div>

            {/* + Add More Button */}
            <button
              type="button"
              onClick={handleAddDiamondItem}
              style={{
                width: '100%', marginTop: '10px', padding: '8px',
                borderRadius: '8px', background: '#ffffff', color: '#2563eb',
                border: '1px solid #93c5fd', fontSize: '12px', fontWeight: '800',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <Plus size={14} /> Add More Diamond Item
            </button>
          </div>

          {/* 3. GEMSTONE SECTION (+ ADD MORE) */}
          <div style={{ background: '#faf5ff', padding: '14px', borderRadius: '16px', border: '1px solid #e9d5ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#6b21a8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                GEMSTONE ISSUED ({gemstoneItems.length} ROWS)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {gemstoneItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Weight (ct)"
                      value={item.weight}
                      onChange={(e) => handleGemstoneChange(item.id, 'weight', e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Stone Size (e.g. 5x7 mm Oval)"
                      value={item.size}
                      onChange={(e) => handleGemstoneChange(item.id, 'size', e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  {gemstoneItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveGemstoneItem(item.id)}
                      style={{ background: '#fee2e2', border: 'none', borderRadius: '8px', width: '34px', height: '34px', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* + Add More Button */}
            <button
              type="button"
              onClick={handleAddGemstoneItem}
              style={{
                width: '100%', marginTop: '10px', padding: '8px',
                borderRadius: '8px', background: '#ffffff', color: '#9333ea',
                border: '1px solid #d8b4fe', fontSize: '12px', fontWeight: '800',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <Plus size={14} /> Add More Gemstone Size
            </button>
          </div>

          {/* 4. PHOTO ATTACHMENT SECTION */}
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
                <Plus size={14} color="#2563eb" /> Add Photos
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

          {/* 5. NOTES */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>NOTES (OPTIONAL)</label>
            <textarea
              placeholder="Gold colour, special instructions, purity requirements, customer requests..."
              value={notes}
              rows={3}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>

          {/* Create Job / Save Changes Button */}
          <button
            type="submit"
            style={{
              width: '100%', padding: '14px', borderRadius: '14px',
              background: '#2563eb', color: '#ffffff', border: 'none',
              fontSize: '15px', fontWeight: '800', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
            }}
          >
            {isEditing ? 'SAVE JOB CHANGES' : 'CREATE JOB'}
          </button>
        </form>

      </div>

      {/* Modern Photo Attachment Bottom Sheet for Web */}
      {isPhotoSheetOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }}>
          <div style={{ background: '#ffffff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', width: '100%', maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Attach Photo to Job</h4>
              <button onClick={() => setIsPhotoSheetOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label style={{ padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                <Camera size={26} color="#2563eb" /> Take Photo
                <input type="file" accept="image/*" capture="environment" onChange={(e) => handlePhotoUpload(e, 'camera')} style={{ display: 'none' }} />
              </label>
              <label style={{ padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                <ImageIcon size={26} color="#9333ea" /> Choose Gallery
                <input type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(e, 'gallery')} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
