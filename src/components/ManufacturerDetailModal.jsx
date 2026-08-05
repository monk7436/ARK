import React, { useState } from 'react';
import { X, MapPin, Phone, Briefcase, Trash2, AlertTriangle, Layers, Calendar, CheckCircle, Clock } from 'lucide-react';

export default function ManufacturerDetailModal({ manufacturer, onClose, onDelete }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!manufacturer) return null;

  // System-generated calculations
  const goldIssued = manufacturer.goldIssued || 250.000;
  const goldReturned = manufacturer.goldReturned || 139.500;
  const goldRemaining = manufacturer.liveGoldRemaining || (goldIssued - goldReturned);
  const jobsDone = manufacturer.jobsDone || 42;
  const jobsOngoing = manufacturer.jobsOngoing || 3;

  // Recent dummy/live manufacturing activity
  const recentJobs = [
    { id: 'JOB-9042', product: '22K Antique Royal Signet Ring', goldIssued: '14.200 g', status: 'In Progress', date: '04/08/2026' },
    { id: 'JOB-9039', product: '18K Diamond Solitaire Bangle Set', goldIssued: '45.000 g', status: 'In Progress', date: '02/08/2026' },
    { id: 'JOB-9021', product: '24K Temple Heritage Choker Necklace', goldIssued: '110.500 g', status: 'Completed', date: '28/07/2026' }
  ];

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
          {manufacturer.photoUrl ? (
            <img src={manufacturer.photoUrl} alt={manufacturer.name} style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
          ) : (
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)',
              color: '#ffffff', fontWeight: '800', fontSize: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {manufacturer.name ? manufacturer.name.charAt(0).toUpperCase() : 'K'}
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
              {manufacturer.name}
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} color="#94a3b8" /> {manufacturer.office || 'Zaveri Bazaar Workshop'}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={13} color="#94a3b8" /> {manufacturer.mobile || '+91 98765 43210'}
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

        {/* Recent Manufacturing Activity */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
            RECENT MANUFACTURING ACTIVITY
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentJobs.map(job => (
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
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#9333ea', background: '#faf5ff', padding: '1px 6px', borderRadius: '4px' }}>
                      {job.id}
                    </span>
                    <h5 style={{ fontSize: '13px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                      {job.product}
                    </h5>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Issued: {job.goldIssued} • {job.date}
                  </p>
                </div>

                <span style={{
                  fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '999px',
                  background: job.status === 'Completed' ? '#dcfce7' : '#eff6ff',
                  color: job.status === 'Completed' ? '#059669' : '#2563eb'
                }}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delete Manufacturer Action (Destructive Red) */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setShowConfirmDelete(true)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fca5a5',
              fontSize: '13.5px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Trash2 size={16} /> Delete Manufacturer
          </button>
        </div>

      </div>

      {/* Confirmation Dialog for Delete */}
      {showConfirmDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 3500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '380px', padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
              <AlertTriangle size={24} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Delete Manufacturer?</h4>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 20px 0' }}>
              Are you sure you want to delete <strong>{manufacturer.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowConfirmDelete(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => onDelete(manufacturer.id)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#dc2626', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
