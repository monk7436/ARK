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
import { X, RefreshCw } from 'lucide-react';
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

  // Loading & Error state
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Company Info State
  const [companyInfo, setCompanyInfo] = useState({
    name: 'ark labs',
    ownerName: 'Rahul',
    activeStore: 'Sahyadri Tower Store',
    phone: '+91 98765 43210',
    gstin: '27AAAAA0000A1Z5'
  });

  // Purely dynamic lists initialized from PostgreSQL Database (Empty on fresh install)
  const [materials, setMaterials] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [jobs, setJobs] = useState([]);

  // Load live data dynamically from backend API on mount
  const loadLiveData = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // 1. Materials
      const matRes = await API.getMaterials();
      if (matRes && matRes.materials) {
        setMaterials(matRes.materials.map(m => ({
          ...m,
          materialType: m.material_type || m.materialType,
          totalAmount: parseFloat(m.total_amount || m.totalAmount || 0),
          weight: parseFloat(m.weight || m.gold_weight || 0),
          price: parseFloat(m.price || 0),
          vendorName: m.vendor_name || m.vendorName,
          diamondItems: m.diamond_items || m.diamondItems || [],
          gemstoneItems: m.gemstone_items || m.gemstoneItems || []
        })));
      }

      // 2. Manufacturers
      const mfgRes = await API.getManufacturers();
      if (mfgRes && mfgRes.manufacturers) {
        setManufacturers(mfgRes.manufacturers.map(m => ({
          ...m,
          goldRemaining: parseFloat(m.gold_remaining || m.goldRemaining || 0),
          makingCharge: parseFloat(m.making_charge || m.makingCharge || 450),
          jobsDone: parseInt(m.jobs_done || m.jobsDone || 0),
          jobsOngoing: parseInt(m.jobs_ongoing || m.jobsOngoing || 0)
        })));
      }

      // 3. Jobs
      const jobsRes = await API.getJobs();
      if (jobsRes && jobsRes.jobs) {
        setJobs(jobsRes.jobs.map(j => ({
          ...j,
          jobNumber: j.job_number || j.jobNumber,
          manufacturerId: j.manufacturer_id || j.manufacturerId,
          manufacturerName: j.manufacturer_name || j.manufacturerName,
          productName: j.product_name || j.productName,
          goldWeight: parseFloat(j.gold_weight || j.goldWeight || 0),
          goldPurity: j.gold_purity || j.goldPurity || '24K',
          diamondItems: j.diamond_items || j.diamondItems || [],
          gemstoneItems: j.gemstone_items || j.gemstoneItems || [],
          photoUrl: j.photo_url || j.photoUrl || ''
        })));
      }

      // 4. Tagged Inventory
      const invRes = await API.getInventory();
      if (invRes && invRes.inventory) {
        setInventory(invRes.inventory.map(i => ({
          ...i,
          tagCode: i.tag_code || i.tagCode,
          purityKarat: i.purity_karat || i.purityKarat,
          grossWeight: parseFloat(i.gross_weight || i.grossWeight || 0),
          stoneWeight: parseFloat(i.stone_weight || i.stoneWeight || 0),
          netWeight: parseFloat(i.net_weight || i.netWeight || 0),
          fineWeight: parseFloat(i.fine_weight || i.fineWeight || 0),
          makingCharge: parseFloat(i.making_charge || i.makingCharge || 0),
          status: i.status || 'IN_STOCK'
        })));
      }

      // 5. Customers
      const custRes = await API.getCustomers();
      if (custRes && custRes.customers) {
        setCustomers(custRes.customers.map(c => ({
          ...c,
          companyName: c.company_name || c.companyName || c.name,
          assignedItems: c.assignedItems || [],
          invoices: c.invoices || []
        })));
      }
    } catch (err) {
      console.warn("Failed to load live data from database:", err);
      setApiError("Unable to load entries. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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

  // Material Mutations
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
    const res = await API.createMaterial(newEntry);
    if (res && res.material) {
      setMaterials(prev => prev.map(m => m.id === newEntry.id ? { ...newEntry, id: res.material.id } : m));
    }
  };

  // Job Mutations
  const handleAddJob = async (newJob) => {
    setJobs(prev => [newJob, ...prev]);
    handleRecordJobOutward(newJob);
    await API.createJob(newJob);
  };

  const handleUpdateJob = async (updatedJob) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
    handleRecordJobOutward(updatedJob);
    await API.updateJob(updatedJob.id, updatedJob);
  };

  const handleDeleteJob = async (jobId) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    handleRemoveJobOutward(jobId);
    await API.deleteJob(jobId);
  };

  // Auto-generate linked Material Out transaction when a Job with diamonds is created/updated
  const handleRecordJobOutward = (job) => {
    setMaterials(prev => {
      const withoutPrevious = prev.filter(m => m.jobId !== job.id);
      if (job.diamondItems && job.diamondItems.length > 0) {
        const totalWeight = job.diamondItems.reduce((s, d) => s + (parseFloat(d.weightCt || d.weight) || 0), 0);
        const outEntry = {
          id: 'tx-auto-out-' + job.id,
          timestamp: job.timestamp,
          direction: 'OUTWARD',
          materialType: 'diamond',
          weight: totalWeight,
          vendorName: 'Auto Issued from Vault',
          manufacturerId: job.manufacturerId,
          jobId: job.id,
          price: 45000,
          totalAmount: totalWeight * 45000,
          notes: `Auto Material OUT for Job #${job.jobNumber} (${job.productName})`,
          diamondItems: job.diamondItems,
          photoUrl: job.photoUrl || ''
        };
        return [outEntry, ...withoutPrevious];
      }
      return withoutPrevious;
    });
  };

  // Reconcile and restore stock when a Job is deleted
  const handleRemoveJobOutward = (jobId) => {
    setMaterials(prev => prev.filter(m => m.jobId !== jobId));
  };

  // Manufacturer Mutations
  const handleAddManufacturer = async (newMfg) => {
    setManufacturers(prev => [...prev, newMfg]);
    const res = await API.createManufacturer(newMfg);
    if (res && res.manufacturer) {
      setManufacturers(prev => prev.map(m => m.name === newMfg.name ? res.manufacturer : m));
    }
  };

  const handleDeleteManufacturer = (mfgId) => {
    setManufacturers(prev => prev.filter(m => m.id !== mfgId));
  };

  // Inventory Mutations
  const handleAddStockItem = async (newItem) => {
    setInventory(prev => [newItem, ...prev]);
    const res = await API.createInventoryItem(newItem);
    if (res && res.item) {
      setInventory(prev => prev.map(i => i.id === newItem.id ? res.item : i));
    }
  };

  // Customer Mutations
  const handleAddCustomer = async (newCust) => {
    setCustomers(prev => [...prev, newCust]);
    const res = await API.createCustomer(newCust);
    if (res && res.customer) {
      setCustomers(prev => prev.map(c => c.name === newCust.name ? res.customer : c));
    }
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

  // Loading indicator
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '14px', color: '#64748b' }}>
        <RefreshCw size={28} className="animate-spin" color="#d97706" />
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Loading ARK Vault Data...</div>
        <div style={{ fontSize: '12px' }}>Connecting to PostgreSQL database</div>
      </div>
    );
  }

  // Error State with Retry Button
  if (apiError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '24px', textAlign: 'center', gap: '12px' }}>
        <div style={{ fontSize: '16px', fontWeight: '800', color: '#dc2626' }}>Unable to load entries</div>
        <div style={{ fontSize: '13px', color: '#64748b', maxWidth: '300px' }}>Please check your connection and try again.</div>
        <button
          onClick={loadLiveData}
          style={{
            marginTop: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            background: '#d97706',
            color: '#ffffff',
            border: 'none',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px 16px 90px 16px' }}>
      
      <main>
        {activeTab === 'home' && (
          <HomeTab
            companyInfo={companyInfo}
            materials={materials}
            manufacturers={manufacturers}
            customers={customers}
            jobs={jobs}
            onOpenMaterialModal={(dir) => handleOpenMaterialList(dir.toUpperCase())}
            onOpenJobsModal={() => setActiveTab('jobs')}
            onOpenManufacturersModal={() => setActiveTab('manufacturers')}
            onOpenCustomersModal={() => setIsCustModalOpen(true)}
            onOpenStaffModal={() => setIsStaffModalOpen(true)}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsTab
            jobs={jobs}
            manufacturers={manufacturers}
            materials={materials}
            onBack={() => setActiveTab('home')}
            onAddJob={handleAddJob}
            onUpdateJob={handleUpdateJob}
            onDeleteJob={handleDeleteJob}
            onRecordJobOutward={handleRecordJobOutward}
            onRemoveJobOutward={handleRemoveJobOutward}
          />
        )}

        {activeTab === 'manufacturers' && (
          <ManufacturersTab
            manufacturers={manufacturers}
            materials={materials}
            jobs={jobs}
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
            onOpenAddModal={handleOpenAddModal}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            inventory={inventory}
            onAddStockItem={handleAddStockItem}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            companyInfo={companyInfo}
            onUpdateCompanyInfo={setCompanyInfo}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation Bar */}
      <NavigationBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Universal Dynamic Material Entry Modal */}
      <MaterialModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSubmit={handleAddMaterialSubmit}
        defaultCategory={modalDefaultCategory}
        manufacturers={manufacturers}
      />

      {/* Customers List Modal */}
      {isCustModalOpen && (
        <CustomersTab
          customers={customers}
          inventory={inventory}
          onBack={() => setIsCustModalOpen(false)}
          onAddCustomer={handleAddCustomer}
          onAssignProduct={handleAssignProductToCustomer}
        />
      )}

      {/* Staff Permissions Modal */}
      {isStaffModalOpen && (
        <div className="modal-backdrop">
          <div className="glass-card" style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '440px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Staff Access & Roles</h3>
              <button onClick={() => setIsStaffModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: '800', color: '#0f172a' }}>Store Owner (Admin)</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Full control over bullion intake, margins, and invoices</div>
              </div>
              <div style={{ padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: '800', color: '#0f172a' }}>Sales Executive</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Create invoices, view stock catalog, manage customers</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
