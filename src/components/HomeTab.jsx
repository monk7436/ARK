import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  UserCheck, 
  Search, 
  Download, 
  SlidersHorizontal, 
  ChevronDown, 
  Building2,
  Boxes,
  Briefcase
} from 'lucide-react';

export default function HomeTab({ 
  companyInfo, 
  onOpenMaterialModal, 
  onOpenManufacturersModal, 
  onOpenCustomersModal, 
  materials,
  manufacturers,
  customers,
  onOpenStaffModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Filter materials and entries
  const filteredEntries = materials.filter(m => {
    const matchesSearch = 
      (m.vendorName && m.vendorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.productType && m.productType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.purity && m.purity.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'INWARD') return m.direction === 'INWARD';
    if (activeFilter === 'OUTWARD') return m.direction === 'OUTWARD';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Control App Style Top Company & Store Header Card */}
      <div style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        padding: '20px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)'
      }}>
        {/* Background Decorative Graphic */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60%',
          height: '100%',
          backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(217, 119, 6, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Top Company Info Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              background: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '18px',
              color: '#ffffff'
            }}>
              {companyInfo.name ? companyInfo.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#f8fafc' }}>
                {companyInfo.name || 'Royal Swarn Jewellers'}
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                {companyInfo.ownerName || 'Rahul'} (Owner)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Language Pill */}
            <span style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '0.5px'
            }}>EN</span>

            {/* Staff Management Icon Button */}
            <button
              onClick={onOpenStaffModal}
              title="Staff Management"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#ffffff',
                padding: '8px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease'
              }}
            >
              <Users size={18} />
            </button>
          </div>
        </div>

        {/* Store Location Card Dropdown */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          borderRadius: '14px',
          padding: '14px 16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#34d399', fontWeight: '700', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></span>
              ACTIVE STORE
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#ffffff' }}>
              {companyInfo.activeStore || 'Zaveri Bazaar Main Store'}
            </h3>
          </div>
          <button style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <ChevronDown size={18} />
          </button>
        </div>
      </div>


      {/* 2. Four Action Grid Cards (Control App 2x2 Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        
        {/* Box 1: Material (In) */}
        <div 
          onClick={() => onOpenMaterialModal('inward')}
          className="glass-card clickable-card" 
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{
            background: '#ecfdf5',
            color: '#059669',
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ArrowDownLeft size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Material (In)</h4>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Vault Inward Intake</p>
          </div>
        </div>

        {/* Box 2: Material (Out) */}
        <div 
          onClick={() => onOpenMaterialModal('outward')}
          className="glass-card clickable-card" 
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{
            background: '#eff6ff',
            color: '#2563eb',
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ArrowUpRight size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Material (Out)</h4>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Issue to Karigar</p>
          </div>
        </div>

        {/* Box 3: Manufacturer */}
        <div 
          onClick={onOpenManufacturersModal}
          className="glass-card clickable-card" 
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{
            background: '#faf5ff',
            color: '#9333ea',
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Briefcase size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Manufacturer</h4>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Karigars & Balances</p>
          </div>
        </div>

        {/* Box 4: Customers */}
        <div 
          onClick={onOpenCustomersModal}
          className="glass-card clickable-card" 
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{
            background: '#fff7ed',
            color: '#ea580c',
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Customers</h4>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Shops & Invoices</p>
          </div>
        </div>

      </div>


      {/* 3. Recent Activity Logs Section (Control App Style) */}
      <div style={{ marginTop: '10px' }}>
        
        {/* Title Bar with Export & Filter Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Recent Activity Logs
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '6px 10px',
              borderRadius: '8px',
              color: '#475569',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Download size={14} /> Export
            </button>
            <button style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '6px 10px',
              borderRadius: '8px',
              color: '#475569',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <SlidersHorizontal size={14} /> Filter
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search entries by vendor, product, or purity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px 12px 42px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Quick Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
          {['ALL', 'INWARD', 'OUTWARD'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
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

        {/* Entry List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', background: '#ffffff', borderRadius: '14px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
              No recent entries found.
            </div>
          ) : (
            filteredEntries.map(entry => (
              <div key={entry.id} className="glass-card" style={{
                padding: '14px 16px',
                borderRadius: '14px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Photo or Direction Icon */}
                  {entry.photoUrl ? (
                    <img 
                      src={entry.photoUrl} 
                      alt="Entry" 
                      style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      background: entry.direction === 'INWARD' ? '#dcfce7' : '#dbeafe',
                      color: entry.direction === 'INWARD' ? '#15803d' : '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {entry.direction === 'INWARD' ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: entry.direction === 'INWARD' ? '#dcfce7' : '#dbeafe',
                        color: entry.direction === 'INWARD' ? '#15803d' : '#1d4ed8'
                      }}>
                        {entry.direction}
                      </span>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                        {entry.weight} g ({entry.purity || '24K 995'})
                      </h4>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
                      {entry.vendorName} • {entry.timestamp}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                    ₹{entry.totalAmount ? entry.totalAmount.toLocaleString('en-IN') : '0'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#d97706', fontWeight: '600' }}>
                    {entry.materialType ? entry.materialType.toUpperCase() : 'GOLD'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
