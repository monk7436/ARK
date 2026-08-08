import React, { useState } from 'react';
import { UserPlus, MapPin, X, Plus } from 'lucide-react';

export function getManufacturerInitials(name) {
  if (!name || !name.trim()) return 'MF';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].length >= 2 ? parts[0].substring(0, 2).toUpperCase() : parts[0].toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ManufacturingTab({ manufacturers, onAddManufacturer, materials }) {
  const [activeSubTab, setActiveSubTab] = useState('profiles'); // profiles or jobs
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Manufacturer form state
  const [name, setName] = useState('');
  const [office, setOffice] = useState('');
  const [makingCharge, setMakingCharge] = useState('450');
  const [photoUrl, setPhotoUrl] = useState('');

  const handleCreateManufacturer = (e) => {
    e.preventDefault();
    onAddManufacturer({
      id: 'mfg-' + Date.now(),
      name: name.trim(),
      office: office.trim(),
      photoUrl: photoUrl || '', // No auto-filled fake image!
      jobsDone: 0,
      jobsOngoing: 0,
      goldRemaining: 0.000,
      makingCharge: parseFloat(makingCharge || 450)
    });
    setName('');
    setOffice('');
    setMakingCharge('450');
    setPhotoUrl('');
    setIsAddModalOpen(false);
  };

  const outwardJobs = materials.filter(m => m.direction === 'OUTWARD');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      {/* Prominent Action Bar with Add Manufacturer Button */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setActiveSubTab('profiles')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'profiles' ? '#d97706' : 'transparent',
              color: activeSubTab === 'profiles' ? '#ffffff' : '#475569',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Manufacturer Profiles ({manufacturers.length})
          </button>
          <button
            onClick={() => setActiveSubTab('jobs')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'jobs' ? '#d97706' : 'transparent',
              color: activeSubTab === 'jobs' ? '#ffffff' : '#475569',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Job Orders ({outwardJobs.length})
          </button>
        </div>

        {/* PROMINENT ADD MANUFACTURER BUTTON */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-gold"
          style={{ fontSize: '13px' }}
        >
          <UserPlus size={18} /> + Add New Manufacturer Profile
        </button>
      </div>

      {/* SUB-TAB 1: MANUFACTURER PROFILES */}
      {activeSubTab === 'profiles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {manufacturers.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', background: '#ffffff', padding: '36px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <h4 style={{ margin: 0, color: '#0f172a' }}>No manufacturers registered</h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 16px 0' }}>Add your first manufacturer to begin tracking workshop orders.</p>
              <button onClick={() => setIsAddModalOpen(true)} className="btn-gold" style={{ fontSize: '12px' }}>
                <Plus size={14} /> Add Manufacturer
              </button>
            </div>
          ) : (
            manufacturers.map((m) => {
              const totalIssuedGold = materials
                .filter(tx => tx.direction === 'OUTWARD' && (tx.vendorName === m.name || tx.manufacturerId === m.id) && tx.materialType === 'gold')
                .reduce((acc, curr) => acc + curr.weight, 0);

              const activeCount = materials.filter(tx => tx.direction === 'OUTWARD' && (tx.vendorName === m.name || tx.manufacturerId === m.id)).length;
              const initials = getManufacturerInitials(m.name);

              return (
                <div key={m.id} className="glass-card gold-border" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    {m.photoUrl && m.photoUrl.trim().length > 0 ? (
                      <img
                        src={m.photoUrl}
                        alt={m.name}
                        style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #d97706' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #d97706, #b45309)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '900',
                          fontSize: '20px',
                          letterSpacing: '0.5px',
                          boxShadow: '0 4px 10px rgba(217, 119, 6, 0.25)',
                          border: '2px solid #fef3c7'
                        }}
                      >
                        {initials}
                      </div>
                    )}
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{m.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        <MapPin size={14} color="#64748b" /> {m.office}
                      </div>
                      <div style={{ fontSize: '12px', color: '#b45309', marginTop: '4px', fontWeight: '600' }}>
                        Making Charge: ₹{m.makingCharge || 450} / gram
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: '#e2e8f0' }} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>24K Gold Held</div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#b45309', marginTop: '2px' }}>
                        {((m.goldRemaining || 0) + totalIssuedGold).toFixed(3)}g
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Ongoing</div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>
                        {(m.jobsOngoing || 0) + activeCount}
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Completed</div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#15803d', marginTop: '2px' }}>
                        {m.jobsDone || 0}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add New Manufacturer Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="glass-card gold-border" style={{ width: '100%', maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Add Manufacturer Profile</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateManufacturer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Manufacturer / Workshop Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Soni & Sons Goldsmiths"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Office / Workshop Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue Diamond Complex / Surat Hub"
                  className="form-input"
                  value={office}
                  onChange={(e) => setOffice(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Default Making Charge (₹ / Gram) *</label>
                <input
                  type="number"
                  required
                  placeholder="450"
                  className="form-input"
                  value={makingCharge}
                  onChange={(e) => setMakingCharge(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-gold" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>
                CREATE MANUFACTURER PROFILE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
