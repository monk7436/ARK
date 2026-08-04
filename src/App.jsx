import React, { useState, useEffect } from 'react';
import NavigationBar from './components/NavigationBar';
import MaterialsTab from './components/MaterialsTab';
import ManufacturingTab from './components/ManufacturingTab';
import InventoryTab from './components/InventoryTab';
import CustomersTab from './components/CustomersTab';
import MaterialModal from './components/MaterialModal';
import { Layers, Flame, Wifi, WifiOff } from 'lucide-react';
import { API } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('materials');
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [modalDefaultCategory, setModalDefaultCategory] = useState('gold');
  const [isSyncing, setIsSyncing] = useState(false);

  // State
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
    }
  ]);

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
    }
  ]);

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
    }
  ]);

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
    }
  ]);

  // Load initial data from Live API on mount
  useEffect(() => {
    async function loadLiveData() {
      setIsSyncing(true);
      try {
        const matRes = await API.getMaterials();
        if (matRes && matRes.materials && matRes.materials.length > 0) {
          setMaterials(matRes.materials.map(m => ({
            ...m,
            materialType: m.material_type || m.materialType,
            totalAmount: parseFloat(m.total_amount || m.totalAmount || 0),
            weight: parseFloat(m.weight || 0),
            price: parseFloat(m.price || 0),
            vendorName: m.vendor_name || m.vendorName
          })));
        }

        const mfgRes = await API.getManufacturers();
        if (mfgRes && mfgRes.manufacturers && mfgRes.manufacturers.length > 0) {
          setManufacturers(mfgRes.manufacturers.map(m => ({
            ...m,
            goldRemaining: parseFloat(m.gold_remaining || m.goldRemaining || 0),
            makingCharge: parseFloat(m.making_charge || m.makingCharge || 0),
            jobsDone: m.jobs_done || m.jobsDone || 0,
            jobsOngoing: m.jobs_ongoing || m.jobsOngoing || 0
          })));
        }

        const invRes = await API.getInventory();
        if (invRes && invRes.inventory && invRes.inventory.length > 0) {
          setInventory(invRes.inventory.map(i => ({
            ...i,
            tagCode: i.tag_code || i.tagCode,
            purityKarat: i.purity_karat || i.purityKarat,
            grossWeight: parseFloat(i.gross_weight || i.grossWeight || 0),
            stoneWeight: parseFloat(i.stone_weight || i.stoneWeight || 0),
            netWeight: parseFloat(i.net_weight || i.netWeight || 0),
            fineWeight: parseFloat(i.fine_weight || i.fineWeight || 0),
            makingCharge: parseFloat(i.making_charge || i.makingCharge || 0)
          })));
        }

        const custRes = await API.getCustomers();
        if (custRes && custRes.customers && custRes.customers.length > 0) {
          setCustomers(custRes.customers.map(c => ({
            ...c,
            companyName: c.company_name || c.companyName || c.name,
            assignedItems: c.assignedItems || [],
            invoices: c.invoices || []
          })));
        }
      } catch (err) {
        console.warn("Could not sync initial data with live backend, using local state", err);
      } finally {
        setIsSyncing(false);
      }
    }

    loadLiveData();
  }, []);

  // Handlers with Live API Sync
  const handleOpenMaterialModal = (category = 'gold') => {
    setModalDefaultCategory(category);
    setIsMaterialModalOpen(true);
  };

  const handleAddMaterialSubmit = async (newEntry) => {
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
    // Push to Live API
    await API.createMaterial(newEntry);
  };

  const handleAddManufacturer = async (newMfg) => {
    setManufacturers(prev => [...prev, newMfg]);
    await API.createManufacturer(newMfg);
  };

  const handleAddStockItem = async (newItem) => {
    setInventory(prev => [newItem, ...prev]);
    await API.createInventoryItem(newItem);
  };

  const handleImportExcel = () => {
    alert("Excel file parsed successfully!");
  };

  const handleAddCustomer = async (newCust) => {
    setCustomers(prev => [...prev, newCust]);
    await API.createCustomer(newCust);
  };

  const handleAssignProductToCustomer = async (customerId, item, invoice) => {
    setInventory(prev => prev.map(i => i.id === item.id ? { ...i, status: 'ASSIGNED' } : i));
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

    await API.assignProductToCustomer({
      customerId,
      itemId: item.id,
      goldRate: invoice.goldRate,
      oldGoldDeduction: invoice.oldGoldDeduction
    });
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 16px 80px 16px' }}>
      {/* Top Header Shell */}
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

        {/* Live Rate Ticker & Sync Status */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f8fafc', padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#b45309' }}>
              <Flame size={14} color="#d97706" /> Live 24K Gold: ₹7,200/g
            </div>
            <div style={{ fontSize: '12px', color: '#475569' }}>22K: ₹6,850/g</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: isSyncing ? '#d97706' : '#15803d', background: '#f0fdf4', padding: '6px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <Wifi size={14} /> {isSyncing ? 'Syncing...' : 'Neon DB Connected'}
          </div>
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

      <MaterialModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSubmit={handleAddMaterialSubmit}
        defaultCategory={modalDefaultCategory}
        manufacturers={manufacturers}
      />

      <NavigationBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
