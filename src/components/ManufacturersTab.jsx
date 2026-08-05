import React, { useState } from 'react';
import { ArrowLeft, Plus, Phone, MapPin, Briefcase, ChevronRight, Layers, Trash2, X, Camera, Image as ImageIcon } from 'lucide-react';
import AddManufacturerModal from './AddManufacturerModal';
import ManufacturerDetailModal from './ManufacturerDetailModal';

export default function ManufacturersTab({ 
  manufacturers = [], 
  materials = [],
  onBack,
  onAddManufacturer,
  onDeleteManufacturer
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#0f172a' }}>
      
      {/* 1. HEADER BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        padding: '14px 18px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
      }}>
        {/* Left side: Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0f172a'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
            Manufacturers
          </h2>
        </div>

        {/* Right side: + Add New Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            background: '#d97706',
            color: '#ffffff',
            border: 'none',
            borderRadius: '999px',
            padding: '8px 16px',
            fontWeight: '800',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 3px 10px rgba(217, 119, 6, 0.3)'
          }}
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* 2. MANUFACTURER LIST CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {manufacturers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
            No manufacturers added yet. Tap <strong>+ Add New</strong> above to register a Karigar workshop.
          </div>
        ) : (
          manufacturers.map(mfg => {
            // Calculate live statistics for this manufacturer from transaction history
            const mfgMaterials = materials.filter(m => m.manufacturerId === mfg.id || (m.vendorName && m.vendorName.includes(mfg.name)));
            const goldIssued = mfgMaterials.filter(m => m.direction === 'OUTWARD').reduce((sum, m) => sum + (parseFloat(m.weight) || 0), 0);
            const goldReturned = mfgMaterials.filter(m => m.direction === 'INWARD').reduce((sum, m) => sum + (parseFloat(m.weight) || 0), 0);
            const liveGoldRemaining = goldIssued > 0 ? (goldIssued - goldReturned) : (mfg.goldRemaining || 0);

            return (
              <div
                key={mfg.id}
                onClick={() => setSelectedManufacturer({ ...mfg, liveGoldRemaining, goldIssued, goldReturned })}
                className="glass-card clickable-card"
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Profile Photo or Initials Avatar */}
                  {mfg.photoUrl ? (
                    <img
                      src={mfg.photoUrl}
                      alt={mfg.name}
                      style={{ width: '50px', height: '50px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                    />
                  ) : (
                    <div style={{
                      width: '50px', height: '50px', borderRadius: '14px',
                      background: 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)',
                      color: '#ffffff', fontWeight: '800', fontSize: '20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {mfg.name ? mfg.name.charAt(0).toUpperCase() : 'K'}
                    </div>
                  )}

                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                      {mfg.name}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#94a3b8" /> {mfg.office || 'Zaveri Bazaar Workshop'}
                    </p>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '6px' }}>
                        Gold Remaining: {liveGoldRemaining.toFixed(3)} g
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>
                        Ongoing Jobs: {mfg.jobsOngoing || 3}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#059669' }}>
                      {mfg.jobsDone || 42} Jobs Done
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
                      Charge: ₹{mfg.makingCharge || 450}/g
                    </div>
                  </div>
                  <ChevronRight size={18} color="#cbd5e1" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. ADD NEW MANUFACTURER MODAL */}
      <AddManufacturerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onAddManufacturer}
      />

      {/* 4. MANUFACTURER DETAILS MODAL */}
      {selectedManufacturer && (
        <ManufacturerDetailModal
          manufacturer={selectedManufacturer}
          onClose={() => setSelectedManufacturer(null)}
          onDelete={(id) => {
            onDeleteManufacturer(id);
            setSelectedManufacturer(null);
          }}
        />
      )}

    </div>
  );
}
