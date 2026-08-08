import React, { useState } from 'react';
import { X, MapPin, Phone, Briefcase, Trash2, AlertTriangle, Layers, Calendar, CheckCircle, Clock } from 'lucide-react';
import { getManufacturerInitials } from './ManufacturingTab';

export default function ManufacturerDetailModal({ manufacturer, jobs = [], materials = [], onClose, onDelete }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!manufacturer) return null;

  // 1. Single Source of Truth: Derive all statistics from actual jobs and materials
  const assignedJobs = (jobs || []).filter(j => 
    (j.manufacturerId && j.manufacturerId === manufacturer.id) ||
    (j.manufacturerName && j.manufacturerName.trim().toLowerCase() === manufacturer.name.trim().toLowerCase())
  );

  const jobsDone = assignedJobs.filter(j => j.status === 'Completed').length;
  const jobsOngoing = assignedJobs.filter(j => j.status !== 'Completed').length;
  const goldIssued = assignedJobs.reduce((sum, j) => sum + (parseFloat(j.goldWeight) || 0), 0);

  const goldReturned = (materials || []).filter(m => 
    m.direction === 'INWARD' && 
    ((m.manufacturerId && m.manufacturerId === manufacturer.id) || (m.vendorName && m.vendorName.trim().toLowerCase() === manufacturer.name.trim().toLowerCase())) &&
    m.materialType === 'gold'
  ).reduce((sum, m) => sum + (parseFloat(m.weight) || 0), 0);

  const goldRemaining = Math.max(0, goldIssued - goldReturned);
  const initials = getManufacturerInitials(manufacturer.name);

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
        maxWidth: '480px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: '1px solid #e2e8f0'
      }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', background: '#faf5ff', color: '#9333ea', padding: '2px 8px', borderRadius: '999px', fontWeight: '800' }}>
            MANUFACTURER PROFILE
          </span>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Profile Card Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          marginBottom: '16px'
        }}>
          {manufacturer.photoUrl && manufacturer.photoUrl.trim().length > 0 ? (
            <img src={manufacturer.photoUrl} alt={manufacturer.name} style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #d97706' }} />
          ) : (
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              color: '#ffffff', fontWeight: '900', fontSize: '22px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(217, 119, 6, 0.25)',
              border: '2px solid #fef3c7'
            }}>
              {initials}
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
              {manufacturer.name}
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} color="#94a3b8" /> {manufacturer.office || 'Artisan Workshop'}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={13} color="#94a3b8" /> {manufacturer.mobile || 'Registered Workshop'}
            </p>
            <div style={{ marginTop: '4px', fontSize: '11px', fontWeight: '800', color: '#b45309' }}>
              Default Making Charge: ₹{manufacturer.makingCharge || 450} / g
            </div>
          </div>
        </div>

        {/* Live System-Generated Statistics (Read-Only Grid) */}
        <div style={{ marginBottom: '18px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
            SYSTEM LIVE STATISTICS (READ-ONLY)
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#047857' }}>JOBS COMPLETED</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#065f46', marginTop: '2px' }}>{jobsDone}</div>
            </div>

            <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#2563eb' }}>JOBS ONGOING</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#1e40af', marginTop: '2px' }}>{jobsOngoing}</div>
            </div>

            <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '12px', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#b45309' }}>GOLD ISSUED</div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#92400e', marginTop: '2px' }}>{goldIssued.toFixed(3)} g</div>
            </div>

            <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#16a34a' }}>GOLD RETURNED</div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#15803d', marginTop: '2px' }}>{goldReturned.toFixed(3)} g</div>
            </div>

            <div style={{ gridColumn: 'span 2', background: '#fff7ed', padding: '14px', borderRadius: '14px', border: '1.5px solid #ea580c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#c2410c' }}>NET GOLD REMAINING</span>
                <p style={{ fontSize: '10px', color: '#9a3412', margin: '2px 0 0 0' }}>Outstanding balance at workshop</p>
              </div>
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#c2410c' }}>
                {goldRemaining.toFixed(3)} g
              </span>
            </div>
          </div>
        </div>

        {/* Real Manufacturing Activity from Database */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
            RECENT MANUFACTURING ACTIVITY ({assignedJobs.length})
          </h4>

          {assignedJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', color: '#64748b', fontSize: '12px', border: '1px dashed #cbd5e1' }}>
              No manufacturing work orders assigned to this artisan yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {assignedJobs.map(job => (
                <div key={job.id} style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#2563eb', background: '#eff6ff', padding: '1px 6px', borderRadius: '4px' }}>
                        #{job.jobNumber}
                      </span>
                      <h5 style={{ fontSize: '13px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                        {job.productName}
                      </h5>
                    </div>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Issued: {job.goldWeight > 0 ? `${job.goldWeight.toFixed(3)} g (${job.goldPurity || '24K'})` : 'None'} • {job.timestamp}
                    </p>
                  </div>

                  <span style={{
                    fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '999px',
                    background: job.status === 'Completed' ? '#dcfce7' : '#eff6ff',
                    color: job.status === 'Completed' ? '#059669' : '#2563eb'
                  }}>
                    {job.status || 'In Progress'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Manufacturer Action */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          {showConfirmDelete ? (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: '700', fontSize: '12px' }}>
                <AlertTriangle size={16} /> Confirm Deletion?
              </div>
              <p style={{ fontSize: '11px', color: '#991b1b', margin: 0 }}>
                Are you sure you want to delete {manufacturer.name}? This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(manufacturer.id);
                    onClose();
                  }}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#ffffff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                border: '1.5px solid #dc2626', background: '#fef2f2', color: '#dc2626',
                fontSize: '13px', fontWeight: '800', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <Trash2 size={16} /> Delete Manufacturer Profile
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
