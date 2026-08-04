// Bulletproof API Client with Cloud Render & Local Server Fallback

const CLOUD_API_BASE = 'https://ark-z9mw.onrender.com/api';
const LOCAL_API_BASE = 'http://localhost:5000/api';

async function fetchWithFallback(endpoint, options = {}) {
  try {
    const res = await fetch(`${CLOUD_API_BASE}${endpoint}`, options);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`Cloud API (${CLOUD_API_BASE}) unreachable, attempting local fallback...`, err);
  }

  // Fallback to local server if cloud server is sleeping/offline
  try {
    const res = await fetch(`${LOCAL_API_BASE}${endpoint}`, options);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error(`Local API (${LOCAL_API_BASE}) also failed.`, err);
  }

  return null;
}

export const API = {
  getMaterials: () => fetchWithFallback('/materials'),
  createMaterial: (data) => fetchWithFallback('/materials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  getManufacturers: () => fetchWithFallback('/manufacturers'),
  createManufacturer: (data) => fetchWithFallback('/manufacturers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  getInventory: () => fetchWithFallback('/inventory'),
  createInventoryItem: (data) => fetchWithFallback('/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

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
  })
};
