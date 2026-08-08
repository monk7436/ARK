import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  Search, 
  ChevronDown, 
  Briefcase,
  X,
  Calendar,
  Tag,
  User,
  Building2,
  PackageCheck,
  Hammer,
  Receipt,
  Layers,
  Sparkles
} from 'lucide-react';
import StoreDropdownModal from './StoreDropdownModal';
import TeamManagementModal from './TeamManagementModal';

export default function HomeTab({ 
  companyInfo, 
  onOpenMaterialModal, 
  onOpenJobsModal,
  onOpenManufacturersModal, 
  onOpenCustomersModal, 
  materials,
  manufacturers,
  customers,
  onOpenStaffModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedEntry, setSelectedEntry] = useState(null); // Universal detail pop-up modal

  // Stores State
  const [activeStoreName, setActiveStoreName] = useState(companyInfo.activeStore || 'Sahyadri Tower Store');
  const [stores, setStores] = useState([
    { id: 's-1', name: 'Sahyadri Tower Store', city: 'Mumbai', isDefault: true },
    { id: 's-2', name: 'Zaveri Bazaar Main Vault', city: 'Mumbai', isDefault: false },
    { id: 's-3', name: 'Surat Diamond Hub', city: 'Surat', isDefault: false }
  ]);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  // Team Members State
  const [teamMembers, setTeamMembers] = useState([
    { id: 'tm-1', name: 'Rahul (You)', phone: '+91 98765 43210', role: 'Owner', access: 'Admin', avatar: 'R' },
    { id: 'tm-2', name: 'Amit Sharma', phone: '+91 98111 22334', role: 'Counter Sales', access: 'Sales Access', avatar: 'A' },
    { id: 'tm-3', name: 'Pooja Verma', phone: '+91 98222 33445', role: 'Vault Operator', access: 'Vault In/Out', avatar: 'P' }
  ]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const handleAddStore = (newStore) => {
    setStores(prev => [...prev, newStore]);
  };

  const handleAddTeamMember = (newMember) => {
    setTeamMembers(prev => [...prev, newMember]);
  };

  // Universal Filter Across Transactions, Vendors, Products, and Karigars
  const filteredEntries = materials.filter(m => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      if (activeFilter === 'INWARD') return m.direction === 'INWARD';
      if (activeFilter === 'OUTWARD') return m.direction === 'OUTWARD';
      return true;
    }

    const matchesSearch = 
      (m.vendorName && m.vendorName.toLowerCase().includes(query)) ||
      (m.productType && m.productType.toLowerCase().includes(query)) ||
      (m.purity && m.purity.toLowerCase().includes(query)) ||
      (m.materialType && m.materialType.toLowerCase().includes(query)) ||
      (m.id && m.id.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (activeFilter === 'INWARD') return m.direction === 'INWARD';
    if (activeFilter === 'OUTWARD') return m.direction === 'OUTWARD';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#0f172a' }}>
      
      {/* 1. COMPACT TOP COMPANY HEADER */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '14px 18px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        {/* Left: Company Logo & Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            color: '#ffffff',
            fontWeight: '900',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)'
          }}>
            {companyInfo.name ? companyInfo.name.charAt(0).toUpperCase() : 'A'}
          </div>

          <div>
            <h2 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#0f172a', lineHeight: '1.2' }}>
              {companyInfo.name || 'ark labs'}
            </h2>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0, fontWeight: '500' }}>
              {companyInfo.ownerName || 'Rahul'}
            </p>
          </div>
        </div>

        {/* Center/Right: Active Store Selector Dropdown */}
        <div 
          onClick={() => setIsStoreModalOpen(true)}
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeStoreName}
            </span>
          </div>
          <ChevronDown size={14} color="#64748b" />
        </div>

        {/* Right Actions: Language & Team Management Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#475569',
            background: '#f1f5f9',
            padding: '4px 8px',
            borderRadius: '6px'
          }}>
            EN
          </span>

          <button
            onClick={() => setIsTeamModalOpen(true)}
            title="Team Management"
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '10px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0f172a'
            }}
          >
            <Users size={17} />
          </button>
        </div>
      </div>

      {/* 2. QUICK ACTIONS GRID (DIRECTLY BELOW COMPACT HEADER) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        
        {/* Card 1: Material */}
        <div 
          onClick={() => onOpenMaterialModal('inward')}
          className="glass-card clickable-card" 
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
            cursor: 'pointer',
            minHeight: '100px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: '#fef3c7', color: '#b45309', padding: '10px', borderRadius: '12px', display: 'flex' }}>
              <Layers size={22} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: '800', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '999px' }}>
              {materials.length} Entries
            </span>
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Material</h4>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0', fontWeight: '500' }}>Vault In & Issue Out</p>
          </div>
        </div>

        {/* Card 2: Jobs */}
        <div 
          onClick={onOpenJobsModal}
          className="glass-card clickable-card" 
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
            cursor: 'pointer',
            minHeight: '100px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: '#eff6ff', color: '#2563eb', padding: '10px', borderRadius: '12px', display: 'flex' }}>
              <Hammer size={22} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: '800', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '999px' }}>
              3 Active Jobs
            </span>
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Jobs</h4>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0', fontWeight: '500' }}>Manufacturing Work Orders</p>
          </div>
        </div>

        {/* Card 3: Manufacturer */}
        <div 
          onClick={onOpenManufacturersModal}
          className="glass-card clickable-card" 
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
            cursor: 'pointer',
            minHeight: '100px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: '#faf5ff', color: '#9333ea', padding: '10px', borderRadius: '12px', display: 'flex' }}>
              <Briefcase size={22} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: '800', background: '#faf5ff', color: '#9333ea', padding: '2px 8px', borderRadius: '999px' }}>
              {manufacturers.length} Karigars
            </span>
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Manufacturer</h4>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0', fontWeight: '500' }}>Karigars & Balances</p>
          </div>
        </div>

        {/* Card 4: Customers */}
        <div 
          onClick={onOpenCustomersModal}
          className="glass-card clickable-card" 
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
            cursor: 'pointer',
            minHeight: '100px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: '#fff7ed', color: '#ea580c', padding: '10px', borderRadius: '12px', display: 'flex' }}>
              <Users size={22} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: '800', background: '#fff7ed', color: '#ea580c', padding: '2px 8px', borderRadius: '999px' }}>
              {customers.length} Accounts
            </span>
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Customers</h4>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0', fontWeight: '500' }}>Shops & Invoices</p>
          </div>
        </div>

      </div>

      {/* 3. GLOBAL SEARCH (IMMEDIATELY BELOW QUICK ACTIONS) */}
      <div style={{ position: 'relative' }}>
        <Search 
          size={18} 
          color="#94a3b8" 
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} 
        />
        <input
          type="text"
          placeholder="Search customers, jewellery, manufacturers, products, transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '13px 16px 13px 44px',
            borderRadius: '14px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            fontSize: '13.5px',
            fontWeight: '500',
            color: '#0f172a',
            outline: 'none',
            boxSizing: 'border-box',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 4. RECENT TRANSACTIONS */}
      <div style={{ marginTop: '2px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Recent Transactions
          </h3>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'INWARD', 'OUTWARD'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '700',
                  border: activeFilter === filter ? '1px solid #d97706' : '1px solid #e2e8f0',
                  background: activeFilter === filter ? '#fef3c7' : '#ffffff',
                  color: activeFilter === filter ? '#b45309' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', background: '#ffffff', borderRadius: '14px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '13px' }}>
              No transactions match your search.
            </div>
          ) : (
            filteredEntries.map(entry => {
              const isInward = entry.direction === 'INWARD';
              const photoSrc = entry.photoUrl || (entry.photos && entry.photos[0]);

              return (
                <div 
                  key={entry.id} 
                  onClick={() => setSelectedEntry(entry)}
                  className="glass-card clickable-card" 
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative', width: '44px', height: '44px' }}>
                      {photoSrc ? (
                        <img 
                          src={photoSrc} 
                          alt="Attachment" 
                          style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #cbd5e1' }} 
                        />
                      ) : (
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '10px',
                          background: isInward ? '#dcfce7' : '#fef2f2',
                          color: isInward ? '#059669' : '#dc2626',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {isInward ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                        </div>
                      )}

                      <div style={{
                        position: 'absolute', bottom: '-2px', right: '-2px',
                        width: '16px', height: '16px', borderRadius: '50%',
                        background: isInward ? '#059669' : '#dc2626',
                        color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '9px', fontWeight: '900', border: '2px solid #ffffff'
                      }}>
                        {isInward ? '↓' : '↑'}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
                          background: isInward ? '#dcfce7' : '#fef2f2',
                          color: isInward ? '#059669' : '#dc2626'
                        }}>
                          {entry.direction}
                        </span>
                        <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                          {entry.weight} g ({entry.purity || '24K - 995'})
                        </h4>
                      </div>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '3px 0 0 0', fontWeight: '500' }}>
                        {entry.vendorName || 'General Supplier'} • {entry.timestamp}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                      ₹{entry.totalAmount ? entry.totalAmount.toLocaleString('en-IN') : '0'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#d97706', fontWeight: '700' }}>
                      {(entry.materialType || 'GOLD').toUpperCase()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Universal Entry Detail Pop-up Card */}
      {selectedEntry && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 3000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '440px',
            padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px',
                  background: selectedEntry.direction === 'INWARD' ? '#dcfce7' : '#fef2f2',
                  color: selectedEntry.direction === 'INWARD' ? '#059669' : '#dc2626'
                }}>
                  {selectedEntry.direction} ENTRY
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  Entry Details
                </h3>
              </div>
              <button onClick={() => setSelectedEntry(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            {selectedEntry.photoUrl && (
              <div style={{ marginBottom: '16px', borderRadius: '14px', overflow: 'hidden', height: '150px', border: '1px solid #cbd5e1' }}>
                <img src={selectedEntry.photoUrl} alt="Entry Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Timestamp:</span>
                <strong style={{ color: '#0f172a' }}>{selectedEntry.timestamp}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Category:</span>
                <strong style={{ color: '#d97706', textTransform: 'uppercase' }}>{selectedEntry.materialType || 'GOLD'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Weight:</span>
                <strong style={{ color: '#0f172a' }}>{selectedEntry.weight} g</strong>
              </div>

              {selectedEntry.purity && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Purity Standard:</span>
                  <strong style={{ color: '#b45309' }}>{selectedEntry.purity}</strong>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>{selectedEntry.direction === 'INWARD' ? 'Vendor:' : 'Karigar:'}</span>
                <strong style={{ color: '#0f172a' }}>{selectedEntry.vendorName || 'General Supplier'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>Total Amount:</span>
                <strong style={{ fontWeight: '800', color: selectedEntry.direction === 'INWARD' ? '#059669' : '#dc2626' }}>
                  ₹{selectedEntry.totalAmount ? selectedEntry.totalAmount.toLocaleString('en-IN') : '0'}
                </strong>
              </div>
            </div>

            <button
              onClick={() => setSelectedEntry(null)}
              style={{
                width: '100%', marginTop: '16px', padding: '14px',
                borderRadius: '12px', background: '#0f172a', color: '#ffffff',
                border: 'none', fontWeight: '800', cursor: 'pointer'
              }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Store Dropdown Modal */}
      <StoreDropdownModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        stores={stores}
        activeStoreName={activeStoreName}
        onSelectStore={(name) => setActiveStoreName(name)}
        onAddStore={handleAddStore}
      />

      {/* Team Management Modal */}
      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        storeName={activeStoreName}
        teamMembers={teamMembers}
        onAddTeamMember={handleAddTeamMember}
      />

    </div>
  );
}
