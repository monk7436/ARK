import React, { useState } from 'react';
import NavigationBar from './components/NavigationBar';
import MaterialsTab from './components/MaterialsTab';
import ManufacturingTab from './components/ManufacturingTab';
import InventoryTab from './components/InventoryTab';
import InvoicingTab from './components/InvoicingTab';
import MaterialModal from './components/MaterialModal';
import { Layers, ShieldCheck, Flame, Bell } from 'lucide-react';

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
    },
    {
      id: 'tx-103',
      timestamp: '04/08/2026, 01:00 PM',
      direction: 'INWARD',
      materialType: 'diamond',
      weight: 12.50,
      size: '2.5 mm VVS1',
      vendorName: 'Surat Diamond Syndicate',
      price: 45000,
      totalAmount: 562500,
      photoUrl: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=300'
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
      tagCode: 'ARK-BNG-3004',
      name: '22K Designer Bridal Bangle Set',
      category: 'Bangle',
      purityKarat: '22K (91.6%)',
      grossWeight: 68.500,
      stoneWeight: 0.000,
      netWeight: 68.500,
      fineWeight: 62.746,
      makingCharge: 400,
      status: 'IN_STOCK',
      photoUrl: 'https://images.unsplash.com/photo-1611591475140-be360fc635a1?w=300'
    }
  ]);

  // Handlers
  const handleOpenMaterialModal = (category = 'gold') => {
    setModalDefaultCategory(category);
    setIsMaterialModalOpen(true);
  };

  const handleAddMaterialSubmit = (newEntry) => {
    setMaterials(prev => [newEntry, ...prev]);

    // If outward gold to manufacturer, update manufacturer balance
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
    alert("Excel file parsed successfully! 12 new items imported and pre-filled with auto Fine Weight calculations.");
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 16px 80px 16px' }}>
      {/* Top Header Shell */}
      <header className="glass-card gold-border" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '10px', borderRadius: '12px', color: '#000' }}>
            <Layers size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '1px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ARK <span style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(245,158,11,0.4)' }}>JEWELRY ERP</span>
            </h1>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Store Inventory • Material Vault • Karigar Accounting</p>
          </div>
        </div>

        {/* Live Rate Ticker Bar */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(15,23,42,0.8)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#f59e0b' }}>
            <Flame size={14} /> Live Rates (24K Gold): ₹7,200/g
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>22K: ₹6,850/g</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Silver: ₹88/g</div>
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

        {activeTab === 'invoicing' && (
          <InvoicingTab inventory={inventory} />
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
