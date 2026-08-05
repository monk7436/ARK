import React, { useState } from 'react';
import { Building2, Users, MapPin, Shield, Phone, Mail, Edit3, Wifi, Database, Flame } from 'lucide-react';

export default function ProfileTab({ companyInfo, onUpdateCompanyInfo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: companyInfo.name || 'Royal Swarn Jewellers',
    ownerName: companyInfo.ownerName || 'Rahul',
    phone: companyInfo.phone || '+91 98765 43210',
    gstin: companyInfo.gstin || '27AAAAA0000A1Z5',
    activeStore: companyInfo.activeStore || 'Zaveri Bazaar Main Store'
  });

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateCompanyInfo(formData);
    setIsEditing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Profile Header Card */}
      <div className="glass-card" style={{
        padding: '24px',
        borderRadius: '20px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#d97706',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '24px'
          }}>
            {formData.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
              {formData.name}
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Owner: <strong>{formData.ownerName}</strong> • {formData.activeStore}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          style={{
            background: '#fef3c7',
            color: '#b45309',
            border: '1px solid #fde68a',
            padding: '8px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Edit3 size={15} /> Edit Info
        </button>
      </div>

      {/* 2. Live Store & Database Status */}
      <div className="glass-card" style={{
        padding: '18px 20px',
        borderRadius: '16px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} color="#d97706" /> Cloud Infrastructure & Sync Status
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>PostgreSQL Database</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Wifi size={14} /> Neon.tech Cloud (Singapore)
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Render API Engine</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Wifi size={14} /> ONLINE 24/7
            </div>
          </div>
        </div>
      </div>

      {/* 3. Staff & Store Locations */}
      <div className="glass-card" style={{
        padding: '20px',
        borderRadius: '16px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="#d97706" /> Staff & Store Management
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Rahul (You)</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Store Owner & Admin</div>
            </div>
            <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '999px', fontWeight: '800' }}>OWNER</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Amit Sharma</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Senior Counter Manager</div>
            </div>
            <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '999px', fontWeight: '800' }}>STAFF</span>
          </div>
        </div>
      </div>

      {/* Edit Company Modal */}
      {isEditing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            background: '#ffffff',
            padding: '24px',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '440px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 16px 0', color: '#0f172a' }}>
              Update Company & Store Profile
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Company / Store Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Owner Name</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Primary Store Location</label>
                <input
                  type="text"
                  value={formData.activeStore}
                  onChange={(e) => setFormData({ ...formData, activeStore: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontWeight: '700' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#d97706', color: '#ffffff', cursor: 'pointer', fontWeight: '700' }}
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
