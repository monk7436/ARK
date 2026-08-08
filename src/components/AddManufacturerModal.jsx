import React, { useState } from 'react';
import { X, Camera, Image as ImageIcon, Plus } from 'lucide-react';

export default function AddManufacturerModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [office, setOffice] = useState('');
  const [makingCharge, setMakingCharge] = useState('450');
  const [notes, setNotes] = useState('');

  // Modern Capsule Photo Upload State
  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

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

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Manufacturer Name is required.';
    if (!office.trim()) errs.office = 'Office / Workshop Location is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newMfg = {
      id: 'mfg-' + Date.now(),
      name: name.trim(),
      mobile: mobile.trim(),
      office: office.trim(),
      makingCharge: parseFloat(makingCharge) || 450,
      notes: notes.trim(),
      photoUrl: photos[0] || '',
      jobsDone: 0,
      jobsOngoing: 0,
      goldRemaining: 0.000
    };

    onSubmit(newMfg);
    onClose();
    setName('');
    setMobile('');
    setOffice('');
    setNotes('');
    setPhotos([]);
    setErrors({});
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 2500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '460px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        border: '1px solid #e2e8f0'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <span style={{ fontSize: '11px', background: '#faf5ff', color: '#9333ea', padding: '2px 8px', borderRadius: '999px', fontWeight: '800' }}>
              KARIGAR REGISTRATION
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0 0 0', color: '#0f172a' }}>
              Add New Manufacturer
            </h3>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Name * */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>
              MANUFACTURER NAME <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh Artisan Workshop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                border: errors.name ? '2px solid #dc2626' : '1px solid #cbd5e1',
                marginTop: '4px', fontSize: '14px', boxSizing: 'border-box'
              }}
            />
            {errors.name && <div style={{ color: '#dc2626', fontSize: '11px', fontWeight: '700', marginTop: '2px' }}>{errors.name}</div>}
          </div>

          {/* Mobile Number */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>MOBILE NUMBER (OPTIONAL)</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Office / Workshop Location * */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>
              OFFICE / WORKSHOP LOCATION <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Zaveri Bazaar, Mumbai / Surat Hub"
              value={office}
              onChange={(e) => setOffice(e.target.value)}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                border: errors.office ? '2px solid #dc2626' : '1px solid #cbd5e1',
                marginTop: '4px', fontSize: '14px', boxSizing: 'border-box'
              }}
            />
            {errors.office && <div style={{ color: '#dc2626', fontSize: '11px', fontWeight: '700', marginTop: '2px' }}>{errors.office}</div>}
          </div>

          {/* Default Making Charge */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>DEFAULT MAKING CHARGE (₹ / GRAM)</label>
            <input
              type="number"
              placeholder="450"
              value={makingCharge}
              onChange={(e) => setMakingCharge(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', fontWeight: '700', boxSizing: 'border-box' }}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>NOTES (OPTIONAL)</label>
            <textarea
              placeholder="Specialization, wastage terms, or notes..."
              value={notes}
              rows={3}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>

          {/* Photo Attachment Capsule Workflow */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>
                PROFILE PHOTO (OPTIONAL)
              </label>
              <button
                type="button"
                onClick={() => setIsPhotoSheetOpen(true)}
                style={{
                  background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '999px',
                  padding: '6px 14px', fontSize: '12px', fontWeight: '800', color: '#0f172a',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Plus size={14} color="#d97706" /> Add Photo
              </button>
            </div>

            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
                {photos.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <img src={url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
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

          {/* Save Button */}
          <button
            type="submit"
            style={{
              width: '100%', marginTop: '8px', padding: '14px', borderRadius: '14px',
              background: '#d97706', color: '#ffffff', border: 'none',
              fontSize: '15px', fontWeight: '800', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)'
            }}
          >
            CREATE MANUFACTURER
          </button>
        </form>

      </div>

      {/* Attachment Bottom Sheet */}
      {isPhotoSheetOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 3000,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }}>
          <div style={{
            background: '#ffffff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
            width: '100%', maxWidth: '460px', padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Attach Profile Photo</h4>
              <button onClick={() => setIsPhotoSheetOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label style={{
                padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: '#0f172a'
              }}>
                <Camera size={26} color="#d97706" /> Take Photo
                <input type="file" accept="image/*" capture="environment" onChange={(e) => handlePhotoUpload(e, 'camera')} style={{ display: 'none' }} />
              </label>
              <label style={{
                padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: '#0f172a'
              }}>
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
