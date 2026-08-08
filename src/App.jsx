import React, { useState, useEffect } from 'react';
import NavigationBar from './components/NavigationBar';
import HomeTab from './components/HomeTab';
import InventoryTab from './components/InventoryTab';
import ProfileTab from './components/ProfileTab';
import MaterialListTab from './components/MaterialListTab';
import JobsTab from './components/JobsTab';
import ManufacturersTab from './components/ManufacturersTab';
import CustomersTab from './components/CustomersTab';
import MaterialModal from './components/MaterialModal';
import { X } from 'lucide-react';
import { API } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'inventory', 'profile', 'material_list', 'jobs', 'manufacturers'
  const [materialListDirection, setMaterialListDirection] = useState('INWARD');
  
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [modalDefaultCategory, setModalDefaultCategory] = useState('gold');
  
  const [isJobsModalOpen, setIsJobsModalOpen] = useState(false);
  const [isMfgModalOpen, setIsMfgModalOpen] = useState(false);
  const [isCustModalOpen, setIsCustModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Company Info State
  const [companyInfo, setCompanyInfo] = useState({
    name: 'ark labs',
    ownerName: 'Rahul',
    activeStore: 'Sahyadri Tower Store',
    phone: '+91 98765 43210',
    gstin: '27AAAAA0000A1Z5'
  });

  // State
  const [materials, setMaterials] = useState([
    {
      id: 'tx-101',
      timestamp: '04/08/2026, 11:30 AM',
      direction: 'INWARD',
      materialType: 'gold',
      weight: 250.000,
      purity: '24K',
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
      mobile: '+91 98765 43210',
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

  // Load live data from API on mount
  useEffect(() => {
    async function loadLiveData() {
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
        console.warn("Using local state fallback", err);
      }
    }

    loadLiveData();
  }, []);

  // Handlers
  const handleOpenMaterialList = (dir = 'INWARD') => {
    setMaterialListDirection(dir);
    setActiveTab('material_list');
  };

  const handleOpenAddModal = (cat = 'gold') => {
    setModalDefaultCategory(cat);
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
    await API.createMaterial(newEntry);
  };

  const handleAddManufacturer = async (newMfg) => {
    setManufacturers(prev => [...prev, newMfg]);
    await API.createManufacturer(newMfg);
  };

  const handleDeleteManufacturer = (mfgId) => {
    setManufacturers(prev => prev.filter(m => m.id !== mfgId));
  };

  const handleAddStockItem = async (newItem) => {
    setInventory(prev => [newItem, ...prev]);
    await API.createInventoryItem(newItem);
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
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px 16px 90px 16px' }}>
      
      <main>
        {activeTab === 'home' && (
          <HomeTab
            companyInfo={companyInfo}
            materials={materials}
            manufacturers={manufacturers}
            customers={customers}
            onOpenMaterialModal={(dir) => handleOpenMaterialList(dir.toUpperCase())}
            onOpenJobsModal={() => setActiveTab('jobs')}
            onOpenManufacturersModal={() => setActiveTab('manufacturers')}
            onOpenCustomersModal={() => setIsCustModalOpen(true)}
            onOpenStaffModal={() => setIsStaffModalOpen(true)}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsTab
            manufacturers={manufacturers}
            onBack={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'manufacturers' && (
          <ManufacturersTab
            manufacturers={manufacturers}
            materials={materials}
            onBack={() => setActiveTab('home')}
            onAddManufacturer={handleAddManufacturer}
            onDeleteManufacturer={handleDeleteManufacturer}
          />
        )}

        {activeTab === 'material_list' && (
          <MaterialListTab
            initialDirection={materialListDirection}
            materials={materials}
            manufacturers={manufacturers}
            onBack={() => setActiveTab('home')}
            onOpenAddModal={(cat) => handleOpenAddModal(cat)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            inventory={inventory}
            onAddStockItem={handleAddStockItem}
            onImportExcel={() => alert("Excel imported!")}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            companyInfo={companyInfo}
            onUpdateCompanyInfo={(info) => setCompanyInfo(info)}
          />
        )}
      </main>

      {/* Shared Universal Material Add Entry Modal */}
      <MaterialModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSubmit={handleAddMaterialSubmit}
        defaultCategory={modalDefaultCategory}
        manufacturers={manufacturers}
      />

      {/* Customers Modal */}
      {isCustModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end'
        }}>
          <div style={{
            background: '#ffffff',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Customers & Invoicing</h3>
              <button onClick={() => setIsCustModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <CustomersTab
              inventory={inventory}
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onAssignProductToCustomer={handleAssignProductToCustomer}
            />
          </div>
        </div>
      )}

      {/* Staff Management Overlay */}
      {isStaffModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            background: '#ffffff',
            padding: '24px',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '440px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Staff Management</h3>
              <button onClick={() => setIsStaffModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Manage counter staff permissions and active site operators.</p>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>{companyInfo.ownerName} (You)</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Full Admin Access</div>
                </div>
                <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '999px', fontWeight: '800' }}>OWNER</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <NavigationBar activeTab={['material_list', 'jobs', 'manufacturers'].includes(activeTab) ? 'home' : activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
