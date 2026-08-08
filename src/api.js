// Bulletproof API Client with True Network Fallback & Error Transparency

const LOCAL_API_BASE = 'http://localhost:5000/api';
const CLOUD_API_BASE = 'https://ark-z9mw.onrender.com/api';

async function fetchWithFallback(endpoint, options = {}) {
  const mergedHeaders = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...(options.headers || {})
  };

  const finalOptions = {
    ...options,
    cache: 'no-store',
    headers: mergedHeaders
  };

  // 1. Try local server first
  try {
    const res = await fetch(`${LOCAL_API_BASE}${endpoint}?_t=${Date.now()}`, finalOptions);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      console.error(`[API ERROR ${res.status}] ${endpoint}:`, errData);
      return { error: errData.error || `HTTP ${res.status}`, status: res.status, ...errData };
    }
    return await res.json();
  } catch (err) {
    // Only fall back to cloud if fetch threw a Network Error (e.g. server is down / connection refused)
    console.warn(`Local API offline at ${LOCAL_API_BASE} (${err.message}), trying cloud fallback for ${endpoint}...`);
  }

  // 2. Try cloud server ONLY if local was completely offline
  try {
    const res = await fetch(`${CLOUD_API_BASE}${endpoint}?_t=${Date.now()}`, finalOptions);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      console.error(`[CLOUD API ERROR ${res.status}] ${endpoint}:`, errData);
      return { error: errData.error || `HTTP ${res.status}`, status: res.status, ...errData };
    }
    return await res.json();
  } catch (err) {
    console.error(`Both local and cloud API endpoints unreachable for ${endpoint}:`, err);
    return null;
  }
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
