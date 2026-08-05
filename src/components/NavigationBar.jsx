import React from 'react';
import { Home, Package, User } from 'lucide-react';

export default function NavigationBar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="glass-card nav-bar" style={{
      position: 'fixed',
      bottom: '12px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 24px)',
      maxWidth: '480px',
      zIndex: 100,
      display: 'flex',
      justify: 'space-around',
      padding: '8px 12px',
      borderRadius: '20px',
      background: '#ffffff',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e2e8f0'
    }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#d97706' : '#64748b',
              fontWeight: isActive ? '700' : '500',
              padding: '6px 16px',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              width: '33%'
            }}
          >
            <Icon size={22} color={isActive ? '#d97706' : '#64748b'} />
            <span style={{ fontSize: '11px', marginTop: '3px' }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
