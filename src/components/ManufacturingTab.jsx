import React, { useState } from 'react';
import { Hammer, UserPlus, Send, CheckCircle2, Clock, MapPin, Award, Plus, X } from 'lucide-react';

export default function ManufacturingTab({ manufacturers, onAddManufacturer, materials }) {
  const [activeSubTab, setActiveSubTab] = useState('profiles'); // profiles or jobs
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Manufacturer form state
  const [name, setName] = useState('');
  const [office, setOffice] = useState('');
  const [makingCharge, setMakingCharge] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const handleCreateManufacturer = (e) => {
    e.preventDefault();
    onAddManufacturer({
      id: 'mfg-' + Date.now(),
      name,
      office,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=300',
      jobsDone: 0,
      jobsOngoing: 0,
      goldRemaining: 0.000,
      makingCharge: parseFloat(makingCharge || 0)
    });
    setName('');
    setOffice('');
    setMakingCharge('');
    setPhotoUrl('');
    setIsAddModalOpen(false);
  };

  // Derive ongoing jobs from outward transactions
  const outwardJobs = materials.filter(m => m.direction === 'OUTWARD');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      {/* Sub-header & Navigation */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(15,23,42,0.8)', padding: '4px', borderRadius: '12px' }}>
          <button
            onClick={() => setActiveSubTab('profiles')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'profiles' ? '#f59e0b' : 'transparent',
              color: activeSubTab === 'profiles' ? '#000' : '#94a3b8',
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
              background: activeSubTab === 'jobs' ? '#f59e0b' : 'transparent',
              color: activeSubTab === 'jobs' ? '#000' : '#94a3b8',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Job Orders Pipeline ({outwardJobs.length})
          </button>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-gold"
        >
          <UserPlus size={18} /> Add Manufacturer Profile
        </button>
      </div>

      {/* SUB-TAB 1: MANUFACTURER PROFILES */}
      {activeSubTab === 'profiles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {manufacturers.map((m) => {
            // Calculate gold remaining for this manufacturer from materials list
            const totalIssuedGold = materials
              .filter(tx => tx.direction === 'OUTWARD' && (tx.vendorName === m.name || tx.manufacturerId === m.id) && tx.materialType === 'gold')
              .reduce((acc, curr) => acc + curr.weight, 0);

            const activeCount = materials.filter(tx => tx.direction === 'OUTWARD' && (tx.vendorName === m.name || tx.manufacturerId === m.id)).length;

            return (
              <div key={m.id} className="glass-card gold-border" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Header Profile Info */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <img
                    src={m.photoUrl}
                    alt={m.name}
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f59e0b' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>{m.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      <MapPin size={14} color="#64748b" /> {m.office}
                    </div>
                    <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '2px', fontWeight: '600' }}>
                      Making Charge: ₹{m.makingCharge} / gram
                    </div>
                  </div>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Gold Held</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#f59e0b', marginTop: '2px' }}>
                      {(m.goldRemaining + totalIssuedGold).toFixed(2)}g
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Ongoing</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#38bdf8', marginTop: '2px' }}>
                      {m.jobsOngoing + activeCount}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Completed</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#10b981', marginTop: '2px' }}>
                      {m.jobsDone}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 2: JOB ORDERS PIPELINE */}
      {activeSubTab === 'jobs' && (
        <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                <th style={{ padding: '14px 16px' }}>Issued Date</th>
                <th style={{ padding: '14px 16px' }}>Manufacturer</th>
                <th style={{ padding: '14px 16px' }}>Product Type</th>
                <th style={{ padding: '14px 16px' }}>Issued Material</th>
                <th style={{ padding: '14px 16px' }}>Valuation</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {outwardJobs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No active jobs issued yet. Go to Materials tab and issue an Outward entry to a manufacturer.
                  </td>
                </tr>
              ) : (
                outwardJobs.map((job) => (
                  <tr key={job.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 16px', color: '#94a3b8' }}>{job.timestamp}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#f8fafc' }}>{job.vendorName}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-gold">{job.productType || 'Jewelry Piece'}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#f59e0b' }}>
                      {job.weight} {job.materialType === 'gold' ? 'g (995 24K Gold)' : 'CTS'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: '700' }}>
                      ₹{job.totalAmount.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-inward" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> In Progress
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal to Add New Manufacturer */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="glass-card gold-border" style={{ width: '100%', maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>Add Manufacturer Profile</h2>
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
                  placeholder="e.g. Swarn Artistry / Ramesh Artisans"
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
                  placeholder="e.g. Zaveri Bazaar, Mumbai / Johri Bazaar, Jaipur"
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
                  placeholder="e.g. 450"
                  className="form-input"
                  value={makingCharge}
                  onChange={(e) => setMakingCharge(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Photo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="form-input"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" style={{ flex: 1, justifyContent: 'center' }}>
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
