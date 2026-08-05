import React, { useState } from 'react';
import { X, Building2, Plus, Check, MapPin } from 'lucide-react';

export default function StoreDropdownModal({ 
  isOpen, 
  onClose, 
  stores = [
    { id: 's-1', name: 'Sahyadri Tower Store', city: 'Mumbai', isDefault: true },
    { id: 's-2', name: 'Zaveri Bazaar Main Vault', city: 'Mumbai', isDefault: false },
    { id: 's-3', name: 'Surat Diamond Hub', city: 'Surat', isDefault: false }
  ],
  activeStoreName, 
  onSelectStore,
  onAddStore
}) {
  const [isAddStoreFormOpen, setIsAddStoreFormOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreCity, setNewStoreCity] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');

  if (!isOpen) return null;

  const handleCreateStore = (e) => {
    e.preventDefault();
    if (!newStoreName) return;

    const newStoreObj = {
      id: 's-' + Date.now(),
      name: newStoreName,
      city: newStoreCity || 'Mumbai',
      address: newStoreAddress
    };

    onAddStore(newStoreObj);
    onSelectStore(newStoreName);
    setIsAddStoreFormOpen(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(6px)',
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
        maxWidth: '440px',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        border: '1px solid #e2e8f0'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '999px', fontWeight: '800' }}>
              COMPANY STORES
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0 0 0', color: '#0f172a' }}>
              Select Active Store Location
            </h3>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {!isAddStoreFormOpen ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Store List */}
            {stores.map(store => {
              const isSelected = store.name === activeStoreName;
              return (
                <div
                  key={store.id}
                  onClick={() => {
                    onSelectStore(store.name);
                    onClose();
                  }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    border: isSelected ? '2px solid #34d399' : '1px solid #e2e8f0',
                    background: isSelected ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px',
                      borderRadius: '10px',
                      background: isSelected ? '#34d399' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#64748b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                        {store.name}
                      </h4>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                        📍 {store.city || 'Mumbai'} • {isSelected ? 'Currently Active' : 'Tap to Switch'}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{ background: '#34d399', color: '#ffffff', borderRadius: '50%', padding: '4px', display: 'flex' }}>
                      <Check size={16} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add New Store Button */}
            <button
              onClick={() => setIsAddStoreFormOpen(true)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                border: '2px dashed #cbd5e1',
                background: '#f8fafc',
                color: '#0f172a',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px'
              }}
            >
              <Plus size={18} /> Add New Store Location
            </button>
          </div>
        ) : (
          /* Add Store Form */
          <form onSubmit={handleCreateStore} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>STORE / VAULT NAME</label>
              <input
                type="text"
                placeholder="e.g. Surat Diamond Hub Store"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>CITY / REGION</label>
              <input
                type="text"
                placeholder="e.g. Surat, Gujarat"
                value={newStoreCity}
                onChange={(e) => setNewStoreCity(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>STORE ADDRESS</label>
              <input
                type="text"
                placeholder="e.g. Shop 102, Ring Road, Diamond Market"
                value={newStoreAddress}
                onChange={(e) => setNewStoreAddress(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setIsAddStoreFormOpen(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#34d399', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}
              >
                Create Store
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
