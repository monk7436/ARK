import React, { useState } from 'react';
import { Users, UserPlus, PackageCheck, FileText, Plus, X, Search, CheckCircle, Printer } from 'lucide-react';

export default function CustomersTab({ inventory = [], customers = [], onAddCustomer, onAssignProduct }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);

  // New Customer Form State
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');

  // Assign Product Form State
  const [selectedItemId, setSelectedItemId] = useState('');
  const [goldRate, setGoldRate] = useState('6850');
  const [oldGoldDeduction, setOldGoldDeduction] = useState('0');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    const newCust = {
      id: 'cust-' + Date.now(),
      name,
      companyName: companyName || name,
      phone,
      gstin: gstin || 'UNREGISTERED',
      address,
      assignedItems: [],
      invoices: []
    };
    onAddCustomer(newCust);
    setSelectedCustomerId(newCust.id);
    setName('');
    setCompanyName('');
    setPhone('');
    setGstin('');
    setAddress('');
    setIsAddCustomerModalOpen(false);
  };

  const handleAssignProduct = (e) => {
    e.preventDefault();
    if (!selectedItemId || !selectedCustomerId) return;

    const item = inventory.find(i => i.id === selectedItemId);
    if (!item) return;

    const rate = parseFloat(goldRate || 6850);
    const metalVal = (item.netWeight || item.grossWeight || 0) * rate;
    const makingVal = (item.netWeight || item.grossWeight || 0) * (item.makingCharge || 450);
    const itemTotal = metalVal + makingVal;
    const deduction = parseFloat(oldGoldDeduction || 0);
    const taxable = Math.max(0, itemTotal - deduction);
    const tax = taxable * 0.03; // 3% GST
    const finalPayable = taxable + tax;

    const invoice = {
      id: 'inv-' + Date.now(),
      invoiceNo: 'ARK-INV-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleDateString(),
      customerName: selectedCustomer.companyName,
      customerGstin: selectedCustomer.gstin,
      customerAddress: selectedCustomer.address,
      itemTag: item.tagCode,
      itemName: item.name,
      netWeight: item.netWeight || item.grossWeight,
      goldRate: rate,
      makingCharge: item.makingCharge || 450,
      metalValue: metalVal,
      makingValue: makingVal,
      oldGoldDeduction: deduction,
      finalAmount: Math.round(finalPayable)
    };

    onAssignProduct(selectedCustomerId, item, invoice);
    setIsAssignModalOpen(false);
    setSelectedItemId('');
    setActiveInvoice(invoice);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      {/* Top Action Bar */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#d97706" /> Customer & Shop Owner Directory
          </h2>
          <p style={{ fontSize: '12px', color: '#64748b' }}>
            Assign tagged inventory items to customer profiles to auto-generate invoices.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setIsAddCustomerModalOpen(true)} className="btn-secondary">
            <UserPlus size={16} /> + New Customer Profile
          </button>
          <button onClick={() => setIsAssignModalOpen(true)} className="btn-gold">
            <PackageCheck size={16} /> Assign Product to Customer
          </button>
        </div>
      </div>

      {customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
          <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '16px', marginBottom: '4px' }}>No customers found</div>
          <p style={{ fontSize: '13px', margin: '0 0 16px 0' }}>Add your first customer to start invoicing.</p>
          <button
            onClick={() => setIsAddCustomerModalOpen(true)}
            style={{
              background: '#d97706', color: '#ffffff', border: 'none',
              borderRadius: '999px', padding: '10px 22px', fontWeight: '800',
              fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Plus size={16} /> + Add Customer
          </button>
        </div>
      ) : (
        /* Main Grid: Customer Sidebar List + Customer Details Pane */
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '16px' }}>
          {/* Customer List Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                placeholder="Search customers..."
                className="form-input"
                style={{ paddingLeft: '36px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {customers
              .filter(c => (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()))
              .map((c) => {
                const isSelected = c.id === selectedCustomerId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomerId(c.id)}
                    className="glass-card"
                    style={{
                      padding: '14px',
                      cursor: 'pointer',
                      borderColor: isSelected ? '#d97706' : '#e2e8f0',
                      background: isSelected ? '#fef3c7' : '#ffffff',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{c.companyName || c.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{c.name} • {c.phone}</div>
                    <div style={{ fontSize: '11px', color: '#b45309', marginTop: '4px', fontWeight: '600' }}>
                      Assigned Items: {c.assignedItems ? c.assignedItems.length : 0}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Customer Details & Assigned Invoices Pane */}
          {selectedCustomer && (
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Profile Summary Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{selectedCustomer.companyName || selectedCustomer.name}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Contact Person: {selectedCustomer.name} • Phone: {selectedCustomer.phone}</p>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>GSTIN: {selectedCustomer.gstin} • Address: {selectedCustomer.address}</p>
                </div>

                <button onClick={() => setIsAssignModalOpen(true)} className="btn-gold" style={{ fontSize: '12px' }}>
                  <Plus size={14} /> Assign Item Now
                </button>
              </div>

              {/* Assigned Inventory Items List */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>
                  Assigned Jewelry Stock ({selectedCustomer.assignedItems ? selectedCustomer.assignedItems.length : 0})
                </h4>

                {(!selectedCustomer.assignedItems || selectedCustomer.assignedItems.length === 0) ? (
                  <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: '10px', color: '#64748b', border: '1px dashed #cbd5e1', fontSize: '13px' }}>
                    No items assigned to this customer yet. Click "Assign Item Now" to assign a product and generate an invoice.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                    {selectedCustomer.assignedItems.map(item => (
                      <div key={item.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#b45309' }}>{item.tagCode}</div>
                        <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a', marginTop: '2px' }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Net Weight: {item.netWeight || item.grossWeight}g</div>
                        <span className="badge badge-inward" style={{ marginTop: '6px', display: 'inline-block' }}>ASSIGNED</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Generated Invoices Section */}
              {selectedCustomer.invoices && selectedCustomer.invoices.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>
                    Generated Customer Invoices
                  </h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Invoice #</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Date</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item Tag</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount Payable</th>
                          <th style={{ padding: '8px 12px', textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCustomer.invoices.map(inv => (
                          <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0f172a' }}>{inv.invoiceNo || inv.invoice_number}</td>
                            <td style={{ padding: '8px 12px', color: '#64748b' }}>{inv.date || inv.created_at}</td>
                            <td style={{ padding: '8px 12px', color: '#b45309', fontWeight: '600' }}>{inv.itemTag || inv.item_tag} - {inv.itemName || inv.item_name}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700', color: '#15803d' }}>₹{(inv.finalAmount || inv.final_amount || 0).toLocaleString()}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                              <button onClick={() => setActiveInvoice(inv)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                                <Printer size={12} /> View Invoice
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add New Customer Modal */}
      {isAddCustomerModalOpen && (
        <div className="modal-backdrop">
          <div className="glass-card gold-border" style={{ width: '100%', maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Add Customer Profile</h3>
              <button onClick={() => setIsAddCustomerModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label">Shop / Company Name *</label>
                <input type="text" required placeholder="e.g. Royal Swarn Jewellers" className="form-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Contact Person Name *</label>
                <input type="text" required placeholder="e.g. Vikram Shah (Partner)" className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Phone Number *</label>
                <input type="tel" required placeholder="+91 98765 43210" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="form-label">GSTIN (Optional)</label>
                <input type="text" placeholder="27AAAAA0000A1Z5" className="form-input" value={gstin} onChange={(e) => setGstin(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Store / Billing Address</label>
                <textarea rows={2} placeholder="Shop 14, Zaveri Bazaar, Mumbai" className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsAddCustomerModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" style={{ flex: 1 }}>
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Product & Invoice Generation Modal */}
      {isAssignModalOpen && (
        <div className="modal-backdrop">
          <div className="glass-card gold-border" style={{ width: '100%', maxWidth: '520px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Assign Product to Customer</h3>
              <button onClick={() => setIsAssignModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label">Select Customer Account *</label>
                <select className="form-input" value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} required>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName || c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Select Available Inventory Item *</label>
                <select className="form-input" value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)} required>
                  <option value="">-- Choose Stock Item --</option>
                  {inventory.filter(i => i.status === 'IN_STOCK').map(i => (
                    <option key={i.id} value={i.id}>{i.tagCode} - {i.name} ({i.netWeight || i.grossWeight}g)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Applied Gold Rate (₹/g) *</label>
                  <input type="number" required className="form-input" value={goldRate} onChange={(e) => setGoldRate(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Old Gold Exchange / Deduction (₹)</label>
                  <input type="number" className="form-input" value={oldGoldDeduction} onChange={(e) => setOldGoldDeduction(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" style={{ flex: 1 }}>
                  Generate Invoice & Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Printable Preview Modal */}
      {activeInvoice && (
        <div className="modal-backdrop">
          <div className="glass-card" style={{ width: '100%', maxWidth: '580px', padding: '30px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#b45309', margin: 0 }}>ARK JEWELLERS</h2>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Tax Invoice & Jewellery Delivery Challan</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{activeInvoice.invoiceNo || activeInvoice.invoice_number}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Date: {activeInvoice.date || activeInvoice.created_at}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '16px 0', fontSize: '12px' }}>
              <div>
                <strong style={{ color: '#0f172a' }}>Billed To:</strong>
                <div>{activeInvoice.customerName || activeInvoice.customer_name}</div>
                <div style={{ color: '#64748b' }}>GSTIN: {activeInvoice.customerGstin || activeInvoice.gstin}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ color: '#0f172a' }}>Item Description:</strong>
                <div>{activeInvoice.itemTag || activeInvoice.item_tag} - {activeInvoice.itemName || activeInvoice.item_name}</div>
                <div style={{ color: '#64748b' }}>Net Wt: {activeInvoice.netWeight || activeInvoice.net_weight}g @ ₹{activeInvoice.goldRate || activeInvoice.gold_rate_applied}/g</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Metal Value:</span>
                <span>₹{(activeInvoice.metalValue || (activeInvoice.subtotal || 0)).toLocaleString()}</span>
              </div>
              {activeInvoice.oldGoldDeduction > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                  <span>Old Gold Exchange Deduction:</span>
                  <span>- ₹{activeInvoice.oldGoldDeduction.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#047857', borderTop: '2px dashed #0f172a', paddingTop: '8px' }}>
                <span>Total Amount Payable (incl. GST):</span>
                <span>₹{(activeInvoice.finalAmount || activeInvoice.final_amount || 0).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setActiveInvoice(null)} className="btn-secondary" style={{ flex: 1 }}>
                Close
              </button>
              <button onClick={() => window.print()} className="btn-gold" style={{ flex: 1 }}>
                <Printer size={16} /> Print Tax Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
