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

  // Gold Section (Optional, starts with 24K)
  const [goldWeight, setGoldWeight] = useState('');
  const [goldPurity, setGoldPurity] = useState('24K');

  // Structured Independent Diamond Child Items (Starts empty by default)
  const [diamondItems, setDiamondItems] = useState([]);

  // Independent Gemstone Child Items (Starts empty by default)
  const [gemstoneItems, setGemstoneItems] = useState([]);

  // Photo Attachments (up to 3 photos)
  const [photos, setPhotos] = useState([]);
  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false);

  // Notes
  const [notes, setNotes] = useState('');

  // Insufficient Diamond Stock Error
  const [stockError, setStockError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Gold purity dropdown starts with 24K
  const goldPurityOptions = ['24K', '22K', '18K', '14K', '9K'];

  useEffect(() => {
    if (isOpen) {
      setStockError(null);
      setValidationError(null);
      if (initialJob) {
        setJobNumber(initialJob.jobNumber || '001');
        setDateTime(initialJob.timestamp || '');
        setManufacturerId(initialJob.manufacturerId || '');
        setProductName(initialJob.productName || '');
        setGoldWeight(initialJob.goldWeight && initialJob.goldWeight > 0 ? initialJob.goldWeight : '');
        setGoldPurity(initialJob.goldPurity || '24K');
        
        const dList = initialJob.diamondItems || initialJob.diamondRows || [];
        setDiamondItems(dList.map(d => ({
          id: d.id || ('d-item-' + Math.random()),
          parentId: initialJob.id,
          weight: d.weight || d.weightCt || '',
          sizeMm: d.sizeMm || d.size || '',
          shape: d.shape || '',
          customShape: d.customShape || ''
        })));
        
        const gList = initialJob.gemstoneItems || initialJob.gemstoneRows || [];
        setGemstoneItems(gList.map(g => ({
          id: g.id || ('g-item-' + Math.random()),
          parentId: initialJob.id,
          weight: g.weight || '',
          size: g.size || '',
          stoneType: g.stoneType || ''
        })));
        
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
        setDiamondItems([]); // No pre-filled diamond rows by default
        setGemstoneItems([]); // No pre-filled gemstone rows by default
        setPhotos([]);
        setNotes('');
      }
    }
  }, [isOpen, initialJob, nextJobNumber, manufacturers]);

  if (!isOpen) return null;

  const getAvailableStock = (sizeMm, shape, customShape) => {
    if (!sizeMm || !shape) return 0.0;
    const shapeKey = shape === 'Other' ? (customShape || 'Other') : shape;
    const sizeKey = parseFloat(sizeMm).toFixed(1);
    if (diamondStock[sizeKey] && diamondStock[sizeKey][shapeKey]) {
      return diamondStock[sizeKey][shapeKey].available || 0;
    }
    return 0.0;
  };

  // Independent Diamond Item Handlers (Creates blank unselected items)
  const handleAddDiamondItem = () => {
    setDiamondItems(prev => [
      ...prev, 
      { id: 'd-item-' + Date.now() + Math.random().toString(36).substring(2, 5), parentId: initialJob?.id || null, weight: '', sizeMm: '', shape: '', customShape: '' }
    ]);
  };
  const handleRemoveDiamondItem = (id) => {
    setDiamondItems(prev => prev.filter(r => r.id !== id));
    setStockError(null);
    setValidationError(null);
  };
  const handleDiamondChange = (id, field, value) => {
    setDiamondItems(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setStockError(null);
    setValidationError(null);
  };

  // Independent Gemstone Item Handlers (Creates blank unselected items)
  const handleAddGemstoneItem = () => {
    setGemstoneItems(prev => [
      ...prev, 
      { id: 'g-item-' + Date.now() + Math.random().toString(36).substring(2, 5), parentId: initialJob?.id || null, weight: '', size: '', stoneType: '' }
    ]);
  };
  const handleRemoveGemstoneItem = (id) => {
    setGemstoneItems(prev => prev.filter(r => r.id !== id));
    setValidationError(null);
  };
  const handleGemstoneChange = (id, field, value) => {
    setGemstoneItems(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setValidationError(null);
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
    setValidationError(null);
    setStockError(null);

    if (!productName.trim()) {
      setValidationError('Product Name / Item Type is required.');
      return;
    }

    if (!manufacturerId) {
      setValidationError('Please select an assigned Karigar / Manufacturer.');
      return;
    }

    const selectedMfg = manufacturers.find(m => m.id === manufacturerId);
    const mfgName = selectedMfg ? selectedMfg.name : 'Artisan Workshop';
    const parentJobId = initialJob ? initialJob.id : ('job-' + Date.now());

    // Validate diamond items ONLY if user added diamond rows
    for (let i = 0; i < diamondItems.length; i++) {
      const item = diamondItems[i];
      const reqWeight = parseFloat(item.weight || item.weightCt || 0);

      if (reqWeight <= 0) {
        setValidationError(`Please enter valid weight for Diamond #${i + 1}.`);
        return;
      }
      if (!item.sizeMm) {
        setValidationError(`Please select size (mm) for Diamond #${i + 1}.`);
        return;
      }
      if (!item.shape) {
        setValidationError(`Please select shape for Diamond #${i + 1}.`);
        return;
      }
      if (item.shape === 'Other' && (!item.customShape || !item.customShape.trim())) {
        setValidationError(`Please specify custom shape for Diamond #${i + 1}.`);
        return;
      }

      // Check stock availability
      const avail = getAvailableStock(item.sizeMm, item.shape, item.customShape);
      if (avail < reqWeight) {
        const short = (reqWeight - avail).toFixed(2);
        setStockError({
          message: `Insufficient Diamond Stock for ${parseFloat(item.sizeMm).toFixed(1)} mm ${item.shape}.`,
          required: reqWeight.toFixed(2),
          available: avail.toFixed(2),
          short
        });
        return;
      }
    }

    // Map structured independent child items with parentJobId
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
        customShape: r.shape === 'Other' ? (r.customShape || '').trim() : null
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

    const finalGoldWeight = parseFloat(goldWeight || 0);

    const jobData = {
      id: parentJobId,
      jobNumber,
      timestamp: dateTime,
      manufacturerId,
      manufacturerName: mfgName,
      productName: productName.trim(),
      goldWeight: finalGoldWeight,
      goldPurity: finalGoldWeight > 0 ? goldPurity : '24K',
      diamondItems: finalDiamondItems,
      diamondRows: finalDiamondItems,
      gemstoneItems: finalGemstoneItems,
      gemstoneRows: finalGemstoneItems,
      status: initialJob ? initialJob.status : 'In Progress',
      photoUrl: photos[0] || '',
      photos,
      notes: notes.trim()
    };

    onSubmit(jobData);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 2200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: '1px solid #e2e8f0'
      }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '999px', fontWeight: '800' }}>
              MANUFACTURING WORK ORDER
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0 0 0', color: '#0f172a' }}>
              {isEditing ? `Edit Job #${jobNumber}` : 'Create Job'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* 1. AUTO CONTINUOUS JOB NUMBER & EXACT CREATION DATE & TIME (LOCKED) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Hash size={13} color="#2563eb" /> JOB NUMBER (AUTO)
              </label>
              <div style={{ position: 'relative', marginTop: '4px' }}>
                <input
                  type="text"
                  value={`#${jobNumber}`}
                  readOnly
                  disabled
                  style={{
                    width: '100%', padding: '12px 32px 12px 12px', borderRadius: '12px',
                    border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '900',
                    color: '#2563eb', fontSize: '15px', cursor: 'not-allowed', boxSizing: 'border-box'
                  }}
                />
                <Lock size={14} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} color="#2563eb" /> DATE & TIME
              </label>
              <div style={{ position: 'relative', marginTop: '4px' }}>
                <input
                  type="text"
                  value={dateTime}
                  readOnly
                  disabled
                  style={{
                    width: '100%', padding: '12px 32px 12px 12px', borderRadius: '12px',
                    border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '600',
                    color: '#0f172a', fontSize: '12.5px', cursor: 'not-allowed', boxSizing: 'border-box'
                  }}
                />
                <Lock size={14} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>

          {/* 2. ASSIGNED KARIGAR / MANUFACTURER */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569' }}>
              ASSIGNED KARIGAR / MANUFACTURER <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              value={manufacturerId}
              onChange={(e) => setManufacturerId(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1',
                marginTop: '4px', fontSize: '14px', fontWeight: '700', color: '#0f172a',
                background: '#ffffff', boxSizing: 'border-box'
              }}
            >
              {manufacturers.length === 0 ? (
                <option value="">No manufacturers registered</option>
              ) : (
                manufacturers.map(mfg => (
                  <option key={mfg.id} value={mfg.id}>
                    {mfg.name} ({mfg.office || 'Workshop'})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* 3. PRODUCT NAME / ITEM TYPE */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569' }}>
              PRODUCT NAME / ITEM TYPE <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 18K Oval Diamond Solitaire Ring"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1',
                marginTop: '4px', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 4. GOLD SECTION (OPTIONAL) - PURITY STARTS WITH 24K */}
          <div style={{
            background: '#fffbe8', padding: '14px', borderRadius: '16px', border: '1px solid #fef08a'
          }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#b45309', textTransform: 'uppercase' }}>
              GOLD ISSUED (OPTIONAL)
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '700', color: '#b45309' }}>Weight (g)</label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="e.g. 5.600"
                  value={goldWeight}
                  onChange={(e) => setGoldWeight(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1',
                    marginTop: '2px', fontSize: '14px', fontWeight: '800', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: '700', color: '#b45309' }}>Purity</label>
                <select
                  value={goldPurity}
                  onChange={(e) => setGoldPurity(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1',
                    marginTop: '2px', fontSize: '14px', fontWeight: '800', color: '#b45309',
                    background: '#ffffff', boxSizing: 'border-box'
                  }}
                >
                  {goldPurityOptions.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 5. STRUCTURED DIAMOND SECTION WITH CLEAN UNSELECTED INPUTS */}
          <div style={{
            background: '#eff6ff', padding: '14px', borderRadius: '16px', border: '1px solid #bfdbfe'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase' }}>
                DIAMOND ISSUED ({diamondItems.length} ROWS)
              </span>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af' }}>
                Total: {diamondItems.reduce((s, d) => s + (parseFloat(d.weight) || 0), 0).toFixed(2)} ct
              </span>
            </div>

            {/* If 0 items, show clean add button without forced defaults */}
            {diamondItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '14px', background: '#ffffff', borderRadius: '12px', border: '1px dashed #bfdbfe', color: '#64748b', fontSize: '12px' }}>
                No diamonds added to this job yet.
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button" onClick={handleAddDiamondItem}
                    style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #93c5fd', borderRadius: '8px', padding: '6px 14px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={14} /> Add Diamond Item
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {diamondItems.map((item, idx) => (
                  <DiamondItemInput
                    key={item.id}
                    item={item}
                    index={idx}
                    onChange={handleDiamondChange}
                    onRemove={() => handleRemoveDiamondItem(item.id)}
                    showRemove={true}
                    availableStock={item.sizeMm && item.shape ? getAvailableStock(item.sizeMm, item.shape, item.customShape) : null}
                  />
                ))}

                <button
                  type="button" onClick={handleAddDiamondItem}
                  style={{
                    width: '100%', marginTop: '6px', padding: '8px', borderRadius: '8px',
                    background: '#ffffff', color: '#2563eb', border: '1px solid #93c5fd',
                    fontSize: '12px', fontWeight: '800', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <Plus size={14} /> Add More Diamond Item
                </button>
              </div>
            )}
          </div>

          {/* 6. INDEPENDENT GEMSTONE SECTION (MULTI-ROW) */}
          <div style={{
            background: '#faf5ff', padding: '14px', borderRadius: '16px', border: '1px solid #e9d5ff'
          }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#6b21a8', textTransform: 'uppercase' }}>
              GEMSTONE ISSUED ({gemstoneItems.length} ROWS)
            </span>

            {gemstoneItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '14px', background: '#ffffff', borderRadius: '12px', border: '1px dashed #e9d5ff', color: '#64748b', fontSize: '12px', marginTop: '8px' }}>
                No gemstones added to this job yet.
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button" onClick={handleAddGemstoneItem}
                    style={{ background: '#faf5ff', color: '#9333ea', border: '1px solid #d8b4fe', borderRadius: '8px', padding: '6px 14px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={14} /> Add Gemstone Item
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {gemstoneItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Weight (ct)"
                      value={item.weight}
                      onChange={(e) => handleGemstoneChange(item.id, 'weight', e.target.value)}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1',
                        fontSize: '13px', fontWeight: '700', boxSizing: 'border-box'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Size (e.g. 5x7 mm)"
                      value={item.size}
                      onChange={(e) => handleGemstoneChange(item.id, 'size', e.target.value)}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1',
                        fontSize: '13px', boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button" onClick={() => handleRemoveGemstoneItem(item.id)}
                      style={{
                        background: '#fee2e2', border: 'none', borderRadius: '8px',
                        width: '34px', height: '34px', color: '#dc2626', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                <button
                  type="button" onClick={handleAddGemstoneItem}
                  style={{
                    width: '100%', marginTop: '6px', padding: '8px', borderRadius: '8px',
                    background: '#ffffff', color: '#9333ea', border: '1px solid #d8b4fe',
                    fontSize: '12px', fontWeight: '800', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <Plus size={14} /> Add More Gemstone Size
                </button>
              </div>
            )}
          </div>

          {/* 7. PHOTO ATTACHMENTS (UP TO 3 PHOTOS) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569' }}>
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
                    <img src={url} alt="Job Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button" onClick={() => handleRemovePhoto(idx)}
                      style={{
                        position: 'absolute', top: '3px', right: '3px',
                        background: 'rgba(220, 38, 38, 0.95)', color: '#ffffff',
                        border: 'none', borderRadius: '50%', width: '18px', height: '18px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 8. NOTES (OPTIONAL) */}
          <div>
            <textarea
              rows={2}
              placeholder="NOTES (OPTIONAL)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1',
                fontSize: '13px', boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Validation Error Alert */}
          {validationError && (
            <div style={{
              background: '#fef2f2', border: '1.5px solid #f87171', borderRadius: '14px',
              padding: '12px', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <AlertTriangle size={18} color="#dc2626" />
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626' }}>
                {validationError}
              </div>
            </div>
          )}

          {/* Shortfall Error Alert */}
          {stockError && (
            <div style={{
              background: '#fef2f2', border: '1.5px solid #f87171', borderRadius: '14px',
              padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: '800', fontSize: '13px' }}>
                <AlertTriangle size={16} /> Insufficient Stock Alert
              </div>
              <div style={{ fontSize: '12px', color: '#b91c1c', fontWeight: '600' }}>
                {stockError.message}
              </div>
              <div style={{ fontSize: '11px', color: '#7f1d1d', marginTop: '2px' }}>
                Required: <strong>{stockError.required} ct</strong> | Available in Vault: <strong>{stockError.available} ct</strong> | Shortfall: <strong>{stockError.short} ct</strong>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: '100%', padding: '14px', borderRadius: '14px', background: '#2563eb', color: '#ffffff',
              border: 'none', fontSize: '15px', fontWeight: '800', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
            }}
          >
            {isEditing ? 'SAVE CHANGES' : 'CREATE JOB'}
          </button>
        </form>

      </div>

      {/* Photo Attachment Bottom Sheet */}
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
                <Camera size={26} color="#2563eb" /> Take Photo
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
