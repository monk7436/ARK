import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Lock, Hash } from 'lucide-react';

export default function JobModal({
  isOpen,
  onClose,
  onSubmit,
  initialJob = null,
  manufacturers = [],
  nextJobNumber = '001'
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

  // Diamond Section (Multi-row)
  const [diamondRows, setDiamondRows] = useState([
    { id: 'd-1', weight: '', size: '' }
  ]);

  // Gemstone Section (Multi-row)
  const [gemstoneRows, setGemstoneRows] = useState([
    { id: 'g-1', weight: '', size: '' }
  ]);

  // Notes
  const [notes, setNotes] = useState('');

  // Gold purity dropdown starts with 24K
  const goldPurityOptions = ['24K', '22K', '18K', '14K', '9K'];

  useEffect(() => {
    if (isOpen) {
      if (initialJob) {
        setJobNumber(initialJob.jobNumber || '001');
        setDateTime(initialJob.timestamp || '');
        setManufacturerId(initialJob.manufacturerId || '');
        setProductName(initialJob.productName || '');
        setGoldWeight(initialJob.goldWeight && initialJob.goldWeight > 0 ? initialJob.goldWeight : '');
        setGoldPurity(initialJob.goldPurity || '24K');
        setDiamondRows(initialJob.diamondRows && initialJob.diamondRows.length > 0 ? initialJob.diamondRows : [{ id: 'd-1', weight: '', size: '' }]);
        setGemstoneRows(initialJob.gemstoneRows && initialJob.gemstoneRows.length > 0 ? initialJob.gemstoneRows : [{ id: 'g-1', weight: '', size: '' }]);
        setNotes(initialJob.notes || '');
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
        setDiamondRows([{ id: 'd-1', weight: '', size: '' }]);
        setGemstoneRows([{ id: 'g-1', weight: '', size: '' }]);
        setNotes('');
      }
    }
  }, [isOpen, initialJob, nextJobNumber, manufacturers]);

  if (!isOpen) return null;

  // Diamond Row Handlers
  const handleAddDiamondRow = () => {
    setDiamondRows(prev => [...prev, { id: 'd-' + Date.now(), weight: '', size: '' }]);
  };
  const handleRemoveDiamondRow = (id) => {
    if (diamondRows.length > 1) {
      setDiamondRows(prev => prev.filter(r => r.id !== id));
    }
  };
  const handleDiamondChange = (id, field, value) => {
    setDiamondRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Gemstone Row Handlers
  const handleAddGemstoneRow = () => {
    setGemstoneRows(prev => [...prev, { id: 'g-' + Date.now(), weight: '', size: '' }]);
  };
  const handleRemoveGemstoneRow = (id) => {
    if (gemstoneRows.length > 1) {
      setGemstoneRows(prev => prev.filter(r => r.id !== id));
    }
  };
  const handleGemstoneChange = (id, field, value) => {
    setGemstoneRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedMfg = manufacturers.find(m => m.id === manufacturerId);
    const mfgName = selectedMfg ? selectedMfg.name : 'Artisan Workshop';

    const jobData = {
      id: initialJob ? initialJob.id : ('job-' + Date.now()),
      jobNumber,
      timestamp: dateTime,
      manufacturerId,
      manufacturerName: mfgName,
      productName: productName || 'Custom Jewellery Order',
      goldWeight: parseFloat(goldWeight) || 0,
      goldPurity,
      diamondRows: diamondRows.filter(r => r.weight || r.size),
      gemstoneRows: gemstoneRows.filter(r => r.weight || r.size),
      notes,
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
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

          {/* 1. GOLD SECTION (OPTIONAL) - Always starts with 24K */}
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

          {/* 2. DIAMOND SECTION (DYNAMIC MULTI-ROW WITH + ADD MORE) */}
          <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                DIAMOND ISSUED ({diamondRows.length} ROWS)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {diamondRows.map((row) => (
                <div key={row.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Weight (ct)"
                      value={row.weight}
                      onChange={(e) => handleDiamondChange(row.id, 'weight', e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Size (e.g. 0.10 ct)"
                      value={row.size}
                      onChange={(e) => handleDiamondChange(row.id, 'size', e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  {diamondRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDiamondRow(row.id)}
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
              onClick={handleAddDiamondRow}
              style={{
                width: '100%', marginTop: '10px', padding: '8px',
                borderRadius: '8px', background: '#ffffff', color: '#2563eb',
                border: '1px solid #93c5fd', fontSize: '12px', fontWeight: '800',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <Plus size={14} /> Add More Diamond Size
            </button>
          </div>

          {/* 3. GEMSTONE SECTION (DYNAMIC MULTI-ROW WITH + ADD MORE) */}
          <div style={{ background: '#faf5ff', padding: '14px', borderRadius: '16px', border: '1px solid #e9d5ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#6b21a8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                GEMSTONE ISSUED ({gemstoneRows.length} ROWS)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {gemstoneRows.map((row) => (
                <div key={row.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Weight (ct)"
                      value={row.weight}
                      onChange={(e) => handleGemstoneChange(row.id, 'weight', e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Stone Size (e.g. 5x7 mm)"
                      value={row.size}
                      onChange={(e) => handleGemstoneChange(row.id, 'size', e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  {gemstoneRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveGemstoneRow(row.id)}
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
              onClick={handleAddGemstoneRow}
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

          {/* 4. NOTES */}
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
    </div>
  );
}
