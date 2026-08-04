import React from 'react';
import { Layers, Hammer, Package, Users } from 'lucide-react';

export default function NavigationBar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'materials', label: 'Materials', icon: Layers },
    { id: 'manufacturing', label: 'Manufacturing', icon: Hammer },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={22} color={isActive ? '#d97706' : '#64748b'} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
