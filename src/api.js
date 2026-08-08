// Bulletproof API Client with Cloud Render & Local Server Fallback

const LOCAL_API_BASE = 'http://localhost:5000/api';
const CLOUD_API_BASE = 'https://ark-z9mw.onrender.com/api';

async function fetchWithFallback(endpoint, options = {}) {
  // 1. Try local server first (for fast live development)
  try {
    const res = await fetch(`${LOCAL_API_BASE}${endpoint}`, options);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Local server offline, continue to cloud
  }

  // 2. Try cloud server if local is offline
  try {
    const res = await fetch(`${CLOUD_API_BASE}${endpoint}`, options);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`Both local and cloud API endpoints failed for ${endpoint}`, err);
  }

  return null;
}

export const API = {
  // Materials
  getMaterials: () => fetchWithFallback('/materials'),
  createMaterial: (data) => fetchWithFallback('/materials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  getDiamondStock: () => fetchWithFallback('/materials/diamond-stock'),

  // Jobs
  getJobs: () => fetchWithFallback('/jobs'),
  createJob: (data) => fetchWithFallback('/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateJob: (id, data) => fetchWithFallback(`/jobs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteJob: (id) => fetchWithFallback(`/jobs/${id}`, {
    method: 'DELETE'
  }),

  // Manufacturers
  getManufacturers: () => fetchWithFallback('/manufacturers'),
  createManufacturer: (data) => fetchWithFallback('/manufacturers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  // Inventory
  getInventory: () => fetchWithFallback('/inventory'),
  createInventoryItem: (data) => fetchWithFallback('/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  // Customers
  getCustomers: () => fetchWithFallback('/customers'),
  createCustomer: (data) => fetchWithFallback('/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  assignProductToCustomer: (data) => fetchWithFallback('/customers/assign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  // Dashboard & Transactions
  getDashboardStats: () => fetchWithFallback('/dashboard/stats'),
  getRecentTransactions: () => fetchWithFallback('/transactions/recent')
};
