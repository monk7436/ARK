import React, { useState } from 'react';
import NavigationBar from './components/NavigationBar';
import MaterialsTab from './components/MaterialsTab';
import ManufacturingTab from './components/ManufacturingTab';
import InventoryTab from './components/InventoryTab';
import CustomersTab from './components/CustomersTab';
import MaterialModal from './components/MaterialModal';
import { Layers, Flame } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('materials');
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [modalDefaultCategory, setModalDefaultCategory] = useState('gold');

  // Initial Sample State for Materials (Gold 995 24K, Diamond, Gemstone)
  const [materials, setMaterials] = useState([
    {
      id: 'tx-101',
      timestamp: '04/08/2026, 11:30 AM',
      direction: 'INWARD',
      materialType: 'gold',
      weight: 250.000,
      purity: '995 (24K)',
      vendorName: 'MMTC-PAMP Bullion Supplier',
      price: 7200,
      totalAmount: 1800000,
      photoUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=300'
    },
    {
      id: 'tx-102',
      timestamp: '04/08/2026, 12:15 PM',
      direction: 'OUTWARD',
      materialType: 'gold',
      weight: 45.000,
      purity: '995 (24K)',
      vendorName: 'Ramesh Artisan Workshop',
      manufacturerId: 'mfg-1',
      price: 7200,
      totalAmount: 324000,
      productType: 'Necklace',
      photoUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300'
    }
  ]);

  // Initial Manufacturer Profiles
  const [manufacturers, setManufacturers] = useState([
    {
      id: 'mfg-1',
      name: 'Ramesh Artisan Workshop',
      office: 'Zaveri Bazaar, Mumbai',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      jobsDone: 42,
      jobsOngoing: 3,
      goldRemaining: 110.500,
      makingCharge: 450
    },
    {
      id: 'mfg-2',
      name: 'Swarn Artistry',
      office: 'Johri Bazaar, Jaipur',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
      jobsDone: 88,
      jobsOngoing: 5,
      goldRemaining: 245.800,
      makingCharge: 400
    }
  ]);

  // Initial Tagged Inventory Stock
  const [inventory, setInventory] = useState([
    {
      id: 'inv-1',
      tagCode: 'ARK-RNG-1001',
      name: '22K Antique Royal Signet Ring',
      category: 'Ring',
      purityKarat: '22K (91.6%)',
      grossWeight: 14.200,
      stoneWeight: 0.200,
      netWeight: 14.000,
      fineWeight: 12.824,
      makingCharge: 450,
      status: 'IN_STOCK',
      photoUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300'
    },
    {
      id: 'inv-2',
      tagCode: 'ARK-NCK-1002',
      name: '22K Gold Choker Necklace',
      category: 'Necklace',
      purityKarat: '22K (91.6%)',
      grossWeight: 45.200,
      stoneWeight: 3.200,
      netWeight: 42.000,
      fineWeight: 38.472,
      makingCharge: 500,
      status: 'IN_STOCK',
      photoUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300'
    },
    {
      id: 'inv-3',
      tagCode: 'ARK-PND-2005',
      name: '22K Royal Solitaire Diamond Pendant',
      category: 'Pendant',
      purityKarat: '22K (91.6%)',
      grossWeight: 8.500,
      stoneWeight: 0.500,
      netWeight: 8.000,
      fineWeight: 7.328,
      makingCharge: 600,
      status: 'IN_STOCK',
      photoUrl: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=300'
    }
  ]);

  // Customer Profiles & Assignments State
  const [customers, setCustomers] = useState([
    {
      id: 'cust-1',
      name: 'Vikram Shah (Owner)',
      companyName: 'Royal Swarn Jewellers Pvt Ltd',
      phone: '+91 98765 43210',
      gstin: '27AAAAA0000A1Z5',
      address: 'Shop 14, Zaveri Bazaar, Mumbai, MH',
      assignedItems: [],
      invoices: []
    },
    {
      id: 'cust-2',
      name: 'Rajesh Kalyan (Partner)',
      companyName: 'Kalyan Partner Store',
      phone: '+91 98111 22334',
      gstin: '07BBBBB1111B2Z8',
      address: 'Johri Bazaar, Jaipur, RJ',
      assignedItems: [],
      invoices: []
    }
  ]);

  // Handlers
  const handleOpenMaterialModal = (category = 'gold') => {
    setModalDefaultCategory(category);
    setIsMaterialModalOpen(true);
  };

  const handleAddMaterialSubmit = (newEntry) => {
    setMaterials(prev => [newEntry, ...prev]);

    if (newEntry.direction === 'OUTWARD' && newEntry.manufacturerId) {
      setManufacturers(prev => prev.map(m => {
        if (m.id === newEntry.manufacturerId) {
          return {
            ...m,
            goldRemaining: m.goldRemaining + (newEntry.materialType === 'gold' ? newEntry.weight : 0),
            jobsOngoing: m.jobsOngoing + 1
          };
        }
        return m;
      }));
    }
  };

  const handleAddManufacturer = (newMfg) => {
    setManufacturers(prev => [...prev, newMfg]);
  };

  const handleAddStockItem = (newItem) => {
    setInventory(prev => [newItem, ...prev]);
  };

  const handleImportExcel = () => {
    alert("Excel file parsed successfully! New items imported.");
  };

  const handleAddCustomer = (newCust) => {
    setCustomers(prev => [...prev, newCust]);
  };

  const handleAssignProductToCustomer = (customerId, item, invoice) => {
    // Update inventory item status
    setInventory(prev => prev.map(i => i.id === item.id ? { ...i, status: 'ASSIGNED' } : i));

    // Add item and invoice to customer
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          assignedItems: [...(c.assignedItems || []), item],
          invoices: [invoice, ...(c.invoices || [])]
        };
      }
      return c;
    }));
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 16px 80px 16px' }}>
      {/* Top Header Shell (Light Theme) */}
      <header className="glass-card gold-border" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#d97706', padding: '10px', borderRadius: '10px', color: '#ffffff' }}>
            <Layers size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '0.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ARK <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '999px', border: '1px solid #fde68a' }}>JEWELRY SOFTWARE</span>
            </h1>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Store Inventory • Material Vault • Karigar & Customer Management</p>
          </div>
        </div>

        {/* Live Rate Ticker Bar */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f8fafc', padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#b45309' }}>
            <Flame size={14} color="#d97706" /> Live 24K Gold: ₹7,200/g
          </div>
          <div style={{ fontSize: '12px', color: '#475569' }}>22K: ₹6,850/g</div>
          <div style={{ fontSize: '12px', color: '#475569' }}>Silver: ₹88/g</div>
        </div>
      </header>

      {/* Main Active Tab Renderer */}
      <main>
        {activeTab === 'materials' && (
          <MaterialsTab
            materials={materials}
            onOpenModal={handleOpenMaterialModal}
            manufacturers={manufacturers}
          />
        )}

        {activeTab === 'manufacturing' && (
          <ManufacturingTab
            manufacturers={manufacturers}
            onAddManufacturer={handleAddManufacturer}
            materials={materials}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            inventory={inventory}
            onAddStockItem={handleAddStockItem}
            onImportExcel={handleImportExcel}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersTab
            inventory={inventory}
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onAssignProductToCustomer={handleAssignProductToCustomer}
          />
        )}
      </main>

      {/* Shared Material Inward/Outward Modal */}
      <MaterialModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSubmit={handleAddMaterialSubmit}
        defaultCategory={modalDefaultCategory}
        manufacturers={manufacturers}
      />

      {/* Bottom Bar Navigation Component */}
      <NavigationBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
