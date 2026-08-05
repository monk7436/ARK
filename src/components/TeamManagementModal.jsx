import React, { useState } from 'react';
import { X, Users, UserPlus, Contact, Phone, ShieldCheck, Check } from 'lucide-react';

export default function TeamManagementModal({ 
  isOpen, 
  onClose, 
  storeName = 'Sahyadri Tower Store',
  teamMembers = [
    { id: 'tm-1', name: 'Rahul (You)', phone: '+91 98765 43210', role: 'Owner', access: 'Admin', avatar: 'R' },
    { id: 'tm-2', name: 'Amit Sharma', phone: '+91 98111 22334', role: 'Counter Sales', access: 'Sales Access', avatar: 'A' },
    { id: 'tm-3', name: 'Pooja Verma', phone: '+91 98222 33445', role: 'Vault Operator', access: 'Vault In/Out', avatar: 'P' }
  ],
  onAddTeamMember
}) {
  const [activeView, setActiveView] = useState('LIST'); // 'LIST', 'ADD_MANUAL', 'ADD_CONTACT'
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Counter Sales');
  const [access, setAccess] = useState('Sales Access');

  if (!isOpen) return null;

  const handleAddMemberSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newMember = {
      id: 'tm-' + Date.now(),
      name,
      phone,
      role,
      access,
      avatar: name.charAt(0).toUpperCase()
    };

    onAddTeamMember(newMember);
    setName('');
    setPhone('');
    setActiveView('LIST');
  };

  const sampleContacts = [
    { name: 'Rohan Mehta', phone: '+91 98333 44556', suggestedRole: 'Store Manager' },
    { name: 'Suresh Patel', phone: '+91 98444 55667', suggestedRole: 'Accountant' },
    { name: 'Kavita Shah', phone: '+91 98555 66778', suggestedRole: 'Vault Operator' }
  ];

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
            <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '999px', fontWeight: '800' }}>
              STORE TEAM & STAFF
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0 0 0', color: '#0f172a' }}>
              {activeView === 'LIST' ? `Team Management` : (activeView === 'ADD_MANUAL' ? 'Add Member Manually' : 'Add from Contacts')}
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              📍 {storeName}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* VIEW 1: TEAM MEMBER LIST */}
        {activeView === 'LIST' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Member Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {teamMembers.map(member => (
                <div
                  key={member.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px', height: '42px',
                      borderRadius: '50%',
                      background: member.role === 'Owner' ? '#d97706' : '#0f172a',
                      color: '#ffffff',
                      fontWeight: '800',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px'
                    }}>
                      {member.avatar}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                        {member.name}
                      </h4>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                        📞 {member.phone} • <strong style={{ color: '#b45309' }}>{member.role}</strong>
                      </p>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: member.role === 'Owner' ? '#dcfce7' : '#e0f2fe',
                    color: member.role === 'Owner' ? '#15803d' : '#0369a1'
                  }}>
                    {member.access}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Add Buttons (Add Contact / Add Manually) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={() => setActiveView('ADD_CONTACT')}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Contact size={18} color="#d97706" /> Add Contact
              </button>

              <button
                onClick={() => setActiveView('ADD_MANUAL')}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  border: 'none',
                  background: '#d97706',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)'
                }}
              >
                <UserPlus size={18} /> Add Manually
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: ADD MANUALLY FORM */}
        {activeView === 'ADD_MANUAL' && (
          <form onSubmit={handleAddMemberSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>FULL NAME</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Shah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>PHONE NUMBER</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>STORE ROLE</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
              >
                <option value="Store Manager">Store Manager</option>
                <option value="Counter Sales">Counter Sales</option>
                <option value="Vault Operator">Vault Operator</option>
                <option value="Accountant">Accountant</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>ACCESS PERMISSION LEVEL</label>
              <select
                value={access}
                onChange={(e) => setAccess(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '14px', boxSizing: 'border-box' }}
              >
                <option value="Sales Access">Sales & Inventory Access</option>
                <option value="Vault In/Out">Vault Inward / Outward Access</option>
                <option value="Full Access">Full Manager Access</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setActiveView('LIST')}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '700', cursor: 'pointer' }}
              >
                Back
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#d97706', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}
              >
                ADD MEMBER TO STORE
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: ADD FROM CONTACTS */}
        {activeView === 'ADD_CONTACT' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Select a contact from your phone / saved contacts directory:</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sampleContacts.map((c, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onAddTeamMember({
                      id: 'tm-' + Date.now(),
                      name: c.name,
                      phone: c.phone,
                      role: c.suggestedRole,
                      access: 'Sales Access',
                      avatar: c.name.charAt(0)
                    });
                    setActiveView('LIST');
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#0f172a' }}>{c.name}</h4>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>{c.phone}</p>
                  </div>
                  <span style={{ fontSize: '11px', color: '#d97706', fontWeight: '700' }}>+ Add as {c.suggestedRole}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveView('LIST')}
              style={{ width: '100%', marginTop: '10px', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '700', cursor: 'pointer' }}
            >
              Back to Team List
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
