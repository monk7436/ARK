import React, { useState } from 'react';
import { ArrowLeft, Plus, Phone, MapPin, Briefcase, ChevronRight, Layers, Trash2 } from 'lucide-react';
import AddManufacturerModal from './AddManufacturerModal';
import ManufacturerDetailModal from './ManufacturerDetailModal';
import { getManufacturerInitials } from './ManufacturingTab';

export default function ManufacturersTab({ 
  manufacturers = [], 
  materials = [],
  jobs = [],
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

      {/* 2. MANUFACTURER LIST CARDS / ACTIONABLE EMPTY STATE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {manufacturers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
            <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px', marginBottom: '4px' }}>No manufacturers found</div>
            <p style={{ fontSize: '12px', margin: '0 0 16px 0' }}>Add your first manufacturer to get started.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                background: '#d97706', color: '#ffffff', border: 'none',
                borderRadius: '999px', padding: '10px 20px', fontWeight: '800',
                fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Plus size={16} /> Add New
            </button>
          </div>
        ) : (
          manufacturers.map(mfg => {
            // Calculate live statistics for this manufacturer from actual jobs & materials
            const assignedJobs = (jobs || []).filter(j => 
              (j.manufacturerId && j.manufacturerId === mfg.id) ||
              (j.manufacturerName && j.manufacturerName.trim().toLowerCase() === mfg.name.trim().toLowerCase())
            );

            const mfgMaterials = (materials || []).filter(m => 
              (m.manufacturerId && m.manufacturerId === mfg.id) || 
              (m.vendorName && m.vendorName.trim().toLowerCase() === mfg.name.trim().toLowerCase())
            );

            const goldIssued = assignedJobs.reduce((sum, j) => sum + (parseFloat(j.goldWeight) || 0), 0);
            const goldReturned = mfgMaterials.filter(m => m.direction === 'INWARD' && m.materialType === 'gold').reduce((sum, m) => sum + (parseFloat(m.weight) || 0), 0);
            const liveGoldRemaining = Math.max(0, goldIssued - goldReturned);
            const jobsOngoing = assignedJobs.filter(j => j.status !== 'Completed').length;
            const jobsDone = assignedJobs.filter(j => j.status === 'Completed').length;
            const initials = getManufacturerInitials(mfg.name);

            return (
              <div
                key={mfg.id}
                onClick={() => setSelectedManufacturer({ ...mfg, liveGoldRemaining, goldIssued, goldReturned, jobsOngoing, jobsDone })}
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
                  {mfg.photoUrl && mfg.photoUrl.trim().length > 0 ? (
                    <img
                      src={mfg.photoUrl}
                      alt={mfg.name}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        objectFit: 'cover',
                        border: '1px solid #e2e8f0'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #d97706, #b45309)',
                      color: '#ffffff',
                      fontWeight: '900',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #fde68a'
                    }}>
                      {initials}
                    </div>
                  )}

                  {/* Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                      {mfg.name}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                      <MapPin size={13} color="#94a3b8" />
                      <span>{mfg.office}</span>
                    </div>

                    {/* Live Metric Badges */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#fef3c7',
                        color: '#b45309',
                        border: '1px solid #fde68a'
                      }}>
                        Gold: {liveGoldRemaining.toFixed(3)} g
                      </span>

                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe'
                      }}>
                        Ongoing: {jobsOngoing}
                      </span>

                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0'
                      }}>
                        Done: {jobsDone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Arrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ChevronRight size={18} color="#94a3b8" />
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
        onSubmit={(newMfg) => {
          onAddManufacturer(newMfg);
          setIsAddModalOpen(false);
        }}
      />

      {/* 4. MANUFACTURER DETAILS SCREEN */}
      {selectedManufacturer && (
        <ManufacturerDetailModal
          manufacturer={selectedManufacturer}
          jobs={jobs}
          materials={materials}
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
