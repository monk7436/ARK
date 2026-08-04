import React, { useState } from 'react';
import { FileText, Printer, Plus, Trash2, Edit3, Check, Building2, UserCheck, ShieldCheck } from 'lucide-react';

export default function InvoicingTab({ inventory }) {
  // Live B2B Customer Intake State
  const [customer, setCustomer] = useState({
    companyName: 'Royal Swarn Jewellers Pvt Ltd',
    gstin: '27AAAAA0000A1Z5',
    contactPerson: 'Vikram Shah (Owner)',
    phone: '+91 98765 43210',
    address: 'Shop 14, Zaveri Bazaar, Mumbai, MH - 400002',
    invoiceNo: 'ARK-INV-2026-084',
    invoiceDate: new Date().toISOString().slice(0, 10),
    goldRate22K: 6850, // Live rate per gram
  });

  // Selected Invoice Items
  const [invoiceItems, setInvoiceItems] = useState([
    {
      id: 'inv-item-1',
      description: '22K Gold Antique Choker Necklace',
      tagCode: 'ARK-NCK-1002',
      grossWeight: 45.200,
      netWeight: 42.000,
      goldRate: 6850,
      makingChargePerGram: 450,
      stoneCost: 2500,
    },
    {
      id: 'inv-item-2',
      description: '22K Gold Designer Bridal Bangle Set',
      tagCode: 'ARK-BNG-3004',
      grossWeight: 68.500,
      netWeight: 68.500,
      goldRate: 6850,
      makingChargePerGram: 400,
      stoneCost: 0,
    }
  ]);

  // Adjustments & Trade-in
  const [oldGoldDeduction, setOldGoldDeduction] = useState(15000);
  const [discountAmount, setDiscountAmount] = useState(2500);
  const [isEditable, setIsEditable] = useState(true);

  // Calculations
  const calculateItemMetalValue = (item) => item.netWeight * item.goldRate;
  const calculateItemMakingCharges = (item) => item.netWeight * item.makingChargePerGram;
  const calculateItemTotal = (item) => calculateItemMetalValue(item) + calculateItemMakingCharges(item) + item.stoneCost;

  const itemsSubtotal = invoiceItems.reduce((acc, item) => acc + calculateItemTotal(item), 0);
  const totalMakingCharges = invoiceItems.reduce((acc, item) => acc + calculateItemMakingCharges(item), 0);
  const taxableAmount = Math.max(0, itemsSubtotal - discountAmount - oldGoldDeduction);
  
  // Tax (3% GST for Jewelry: 1.5% CGST + 1.5% SGST)
  const cgstAmount = taxableAmount * 0.015;
  const sgstAmount = taxableAmount * 0.015;
  const finalTotal = taxableAmount + cgstAmount + sgstAmount;

  // Add Item Handler
  const handleAddItemFromInventory = (item) => {
    setInvoiceItems(prev => [
      ...prev,
      {
        id: 'inv-item-' + Date.now(),
        description: item.name,
        tagCode: item.tagCode,
        grossWeight: item.grossWeight,
        netWeight: item.netWeight,
        goldRate: customer.goldRate22K,
        makingChargePerGram: item.makingCharge || 450,
        stoneCost: 0,
      }
    ]);
  };

  const handleRemoveItem = (id) => {
    setInvoiceItems(prev => prev.filter(i => i.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      {/* Top Toolbar */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#f59e0b" /> B2B & Retail Invoice Generator
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
            Click any field directly on the paper invoice preview below to edit rates, customer info, or line items.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsEditable(!isEditable)}
            className="btn-secondary"
            style={{ borderColor: isEditable ? '#f59e0b' : 'rgba(255,255,255,0.1)' }}
          >
            <Edit3 size={16} /> {isEditable ? 'Editing Mode Active' : 'Lock Invoice'}
          </button>

          <button onClick={handlePrint} className="btn-gold">
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Customer Quick Selector & Item Picker */}
      {isEditable && (
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase' }}>
            Quick Inventory Picker (Click to add item to invoice)
          </div>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {inventory.map(item => (
              <button
                key={item.id}
                onClick={() => handleAddItemFromInventory(item)}
                style={{
                  background: 'rgba(15,23,42,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={14} color="#10b981" /> {item.tagCode} - {item.name} ({item.netWeight}g)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LIVE PAPER INVOICE PREVIEW (STATIONERY DESIGN) */}
      <div
        className="glass-card gold-border printable-area"
        style={{
          background: '#ffffff',
          color: '#0f172a',
          padding: '36px',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          maxWidth: '850px',
          margin: '0 auto',
          width: '100%',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {/* Invoice Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#b45309', letterSpacing: '1px' }}>
              ARK JEWELRY CREATIONS
            </h1>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              High-Precision Manufacturing & Wholesale Bullion Hub
            </p>
            <p style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
              Zaveri Bazaar, Kalbadevi, Mumbai - 400002 • GSTIN: 27ARKJW9999Z1
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>TAX INVOICE</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Inv #: {isEditable ? (
                <input
                  type="text"
                  value={customer.invoiceNo}
                  onChange={(e) => setCustomer({ ...customer, invoiceNo: e.target.value })}
                  style={{ border: '1px border #cbd5e1', padding: '2px 4px', fontSize: '12px', width: '130px' }}
                />
              ) : customer.invoiceNo}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Date: {customer.invoiceDate}
            </div>
          </div>
        </div>

        {/* Customer Details Box (B2B Jewelry Shop Owner) */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', margin: '20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              BUYER (JEWELRY SHOP OWNER / PARTY)
            </div>
            {isEditable ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                <input
                  type="text"
                  value={customer.companyName}
                  onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
                  style={{ fontWeight: '700', fontSize: '14px', border: '1px solid #cbd5e1', padding: '4px' }}
                />
                <input
                  type="text"
                  placeholder="GSTIN"
                  value={customer.gstin}
                  onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })}
                  style={{ fontSize: '12px', border: '1px solid #cbd5e1', padding: '4px' }}
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  style={{ fontSize: '12px', border: '1px solid #cbd5e1', padding: '4px' }}
                />
              </div>
            ) : (
              <div style={{ marginTop: '6px' }}>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{customer.companyName}</div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>GSTIN: {customer.gstin}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{customer.address}</div>
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              BILLING METRICS & LIVE RATES
            </div>
            <div style={{ marginTop: '6px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Live 22K Gold Rate: </span>
                {isEditable ? (
                  <input
                    type="number"
                    value={customer.goldRate22K}
                    onChange={(e) => setCustomer({ ...customer, goldRate22K: parseFloat(e.target.value || 0) })}
                    style={{ width: '80px', padding: '2px', fontWeight: '700', color: '#b45309' }}
                  />
                ) : (
                  <strong>₹{customer.goldRate22K} / g</strong>
                )}
              </div>
              <div><span style={{ color: '#64748b' }}>Contact Person: </span>{customer.contactPerson}</div>
              <div><span style={{ color: '#64748b' }}>Phone: </span>{customer.phone}</div>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Tag / Item</th>
              <th style={{ padding: '10px' }}>Gross Wt</th>
              <th style={{ padding: '10px' }}>Net Wt</th>
              <th style={{ padding: '10px' }}>Rate/g</th>
              <th style={{ padding: '10px' }}>Making/g</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Total (₹)</th>
              {isEditable && <th style={{ padding: '10px', width: '40px' }}></th>}
            </tr>
          </thead>
          <tbody>
            {invoiceItems.map((item, index) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px' }}>
                  {isEditable ? (
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInvoiceItems(prev => prev.map(i => i.id === item.id ? { ...i, description: val } : i));
                      }}
                      style={{ width: '100%', padding: '2px', fontSize: '12px' }}
                    />
                  ) : (
                    <div>
                      <strong>{item.description}</strong>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{item.tagCode}</div>
                    </div>
                  )}
                </td>

                <td style={{ padding: '10px' }}>{item.grossWeight}g</td>
                <td style={{ padding: '10px', fontWeight: '700' }}>{item.netWeight}g</td>
                <td style={{ padding: '10px' }}>₹{customer.goldRate22K}</td>

                <td style={{ padding: '10px' }}>
                  {isEditable ? (
                    <input
                      type="number"
                      value={item.makingChargePerGram}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value || 0);
                        setInvoiceItems(prev => prev.map(i => i.id === item.id ? { ...i, makingChargePerGram: val } : i));
                      }}
                      style={{ width: '60px', padding: '2px' }}
                    />
                  ) : (
                    `₹${item.makingChargePerGram}`
                  )}
                </td>

                <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>
                  ₹{calculateItemTotal(item).toLocaleString()}
                </td>

                {isEditable && (
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button onClick={() => handleRemoveItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Calculation Totals & Old Gold Exchange */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', paddingTop: '10px', borderTop: '2px solid #e2e8f0' }}>
          {/* Notes & Bank Transfer Info */}
          <div style={{ fontSize: '11px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <strong style={{ color: '#0f172a' }}>Payment Terms & Bank Details:</strong>
            <div>Bank: HDFC Bank Ltd • A/c: 50200012345678</div>
            <div>IFSC Code: HDFC0000123 • Branch: Zaveri Bazaar</div>
            <div style={{ marginTop: '10px', fontStyle: 'italic', color: '#64748b' }}>
              "Thank you for your business. Certified 916 BIS Hallmarked Ornaments."
            </div>
          </div>

          {/* Totals Breakdown */}
          <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Items Subtotal:</span>
              <span>₹{itemsSubtotal.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
              <span>Old Gold Exchange Deduction:</span>
              {isEditable ? (
                <input
                  type="number"
                  value={oldGoldDeduction}
                  onChange={(e) => setOldGoldDeduction(parseFloat(e.target.value || 0))}
                  style={{ width: '90px', textAlign: 'right', padding: '2px' }}
                />
              ) : (
                <span>- ₹{oldGoldDeduction.toLocaleString()}</span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>CGST (1.5%):</span>
              <span>₹{cgstAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>SGST (1.5%):</span>
              <span>₹{sgstAmount.toFixed(2)}</span>
            </div>

            <div style={{ borderTop: '2px solid #0f172a', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#b45309' }}>
              <span>Final Amount Payable:</span>
              <span>₹{Math.round(finalTotal).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px dashed #cbd5e1', fontSize: '11px', color: '#64748b' }}>
          <div>Customer Signature</div>
          <div style={{ textAlign: 'right' }}>
            <strong style={{ color: '#0f172a' }}>For ARK JEWELRY CREATIONS</strong>
            <div style={{ marginTop: '30px' }}>Authorized Signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
}
