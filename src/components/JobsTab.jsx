import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Edit3, Trash2 } from 'lucide-react';
import JobModal from './JobModal';

export default function JobsTab({
  manufacturers = [],
  materials = [],
  onBack,
  onRecordJobOutward,
  onRemoveJobOutward
}) {
  // Ordered by latest created job first (each containing structured diamond and gemstone item records)
  const [jobs, setJobs] = useState([
    {
      id: 'job-103',
      jobNumber: '003',
      timestamp: '04/08/2026, 05:45 PM',
      manufacturerId: 'mfg-1',
      manufacturerName: 'Ramesh Artisan Workshop',
      productName: '24K Temple Heritage Choker Necklace',
      goldWeight: 110.500,
      goldPurity: '24K',
      diamondItems: [],
      gemstoneItems: [
        { id: 'g-item-101', parentId: 'job-103', weight: 2.50, size: 'Emerald 5x7 mm', stoneType: 'Emerald' }
      ],
      notes: 'Traditional Nakshi work with fine filigree',
      photoUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300',
      photos: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300'],
      status: 'Completed'
    },
    {
      id: 'job-102',
      jobNumber: '002',
      timestamp: '02/08/2026, 03:15 PM',
      manufacturerId: 'mfg-1',
      manufacturerName: 'Ramesh Artisan Workshop',
      productName: '18K Diamond Solitaire Bangle Set',
      goldWeight: 45.000,
      goldPurity: '18K',
      diamondItems: [
        { id: 'd-item-201', parentId: 'job-102', weight: 1.20, weightCt: 1.20, sizeMm: 2.5, shape: 'Round' },
        { id: 'd-item-202', parentId: 'job-102', weight: 0.80, weightCt: 0.80, sizeMm: 2.0, shape: 'Oval' }
      ],
      gemstoneItems: [],
      notes: 'White Gold Rhodium plating requested by customer',
      photoUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300',
      photos: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300'],
      status: 'In Progress'
    },
    {
      id: 'job-101',
      jobNumber: '001',
      timestamp: '28/07/2026, 11:30 AM',
      manufacturerId: 'mfg-1',
      manufacturerName: 'Ramesh Artisan Workshop',
      productName: '22K Antique Royal Signet Ring',
      goldWeight: 14.200,
      goldPurity: '22K',
      diamondItems: [
        { id: 'd-item-301', parentId: 'job-101', weight: 0.25, weightCt: 0.25, sizeMm: 2.5, shape: 'Oval' }
      ],
      gemstoneItems: [
        { id: 'g-item-301', parentId: 'job-101', weight: 0.10, size: 'Ruby 3mm', stoneType: 'Ruby' }
      ],
      notes: 'Yellow Gold finish with antique matte polish',
      photoUrl: '',
      photos: [],
      status: 'In Progress'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Compute live diamond stock map for exact Size + Shape matching
  const diamondStock = useMemo(() => {
    const stockMap = {};

    materials.filter(m => (m.materialType || m.material_type) === 'diamond').forEach(mat => {
      const dItems = mat.diamondItems || mat.diamond_items || [];
      dItems.forEach(d => {
        const sizeKey = parseFloat(d.sizeMm || d.size || 2.5).toFixed(1);
        const shapeKey = d.shape === 'Other' ? (d.customShape || 'Other') : (d.shape || 'Round');
        const weightVal = parseFloat(d.weightCt || d.weight || 0);

        if (!stockMap[sizeKey]) stockMap[sizeKey] = {};
        if (!stockMap[sizeKey][shapeKey]) {
          stockMap[sizeKey][shapeKey] = {
            sizeMm: parseFloat(d.sizeMm || d.size || 2.5),
            shape: shapeKey,
            totalReceived: 0,
            totalIssued: 0,
            available: 0
          };
        }

        if (mat.direction === 'INWARD') {
          stockMap[sizeKey][shapeKey].totalReceived += weightVal;
        } else {
          stockMap[sizeKey][shapeKey].totalIssued += weightVal;
        }
        stockMap[sizeKey][shapeKey].available = 
          stockMap[sizeKey][shapeKey].totalReceived - stockMap[sizeKey][shapeKey].totalIssued;
      });
    });

    return stockMap;
  }, [materials]);

  // Continuous Sequence Job Number Generator (001, 002, 003...)
  const getNextJobNumber = () => {
    const nextSeq = jobs.length + 1;
    return String(nextSeq).padStart(3, '0');
  };

  const handleSaveJob = (jobData) => {
    if (editingJob) {
      setJobs(prev => prev.map(j => j.id === jobData.id ? jobData : j));
    } else {
      // Latest created job is ALWAYS at the top (index 0)
      setJobs(prev => [jobData, ...prev]);
    }

    // Auto-generate linked Material Out record if callback provided
    if (onRecordJobOutward) {
      onRecordJobOutward(jobData);
    }
    setEditingJob(null);
  };

  const handleDeleteJob = (jobId) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    if (onRemoveJobOutward) {
      onRemoveJobOutward(jobId);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#0f172a' }}>
      
      {/* 1. HEADER BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        padding: '14px 18px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
      }}>
        {/* Left: Back & Module Name "Jobs" */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: '50%', width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#0f172a'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
              Jobs
            </h2>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
              Manufacturing Work Orders & Auto Diamond Stock Consumption
            </p>
          </div>
        </div>

        {/* Right: + Create Job Button */}
        <button
          onClick={() => { setEditingJob(null); setIsModalOpen(true); }}
          style={{
            background: '#2563eb', color: '#ffffff', border: 'none',
            borderRadius: '999px', padding: '8px 16px', fontWeight: '800',
            fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: '6px', boxShadow: '0 3px 10px rgba(37, 99, 235, 0.3)'
          }}
        >
          <Plus size={16} /> Create Job
        </button>
      </div>

      {/* 2. JOBS LIST CARDS (LATEST FIRST) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
            No jobs created yet. Tap <strong>+ Create Job</strong> above to assign a manufacturing work order.
          </div>
        ) : (
          jobs.map(job => {
            const isCompleted = job.status === 'Completed';
            const photoSrc = job.photoUrl || (job.photos && job.photos[0]);
            const dItems = job.diamondItems || job.diamondRows || [];
            const gItems = job.gemstoneItems || job.gemstoneRows || [];

            return (
              <div
                key={job.id}
                className="glass-card"
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {photoSrc && (
                      <img 
                        src={photoSrc} 
                        alt="Product Preview" 
                        style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #cbd5e1' }} 
                      />
                    )}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '900', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                          #{job.jobNumber}
                        </span>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                          {job.productName}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '999px',
                      background: isCompleted ? '#dcfce7' : '#eff6ff',
                      color: isCompleted ? '#059669' : '#2563eb'
                    }}>
                      {job.status}
                    </span>

                    <button
                      onClick={() => { setEditingJob(job); setIsModalOpen(true); }}
                      title="Edit Job"
                      style={{
                        background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px',
                        padding: '4px 8px', fontSize: '11px', fontWeight: '800', color: '#475569',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <Edit3 size={13} /> Edit
                    </button>

                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      title="Delete Job & Restore Stock"
                      style={{
                        background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px',
                        padding: '4px 8px', fontSize: '11px', fontWeight: '800', color: '#dc2626',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                  <span>📍 {job.manufacturerName}</span>
                  <span>🕒 {job.timestamp}</span>
                </div>

                {/* Structured Stone Items Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                  {job.goldWeight > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: '800', background: '#fffbe8', color: '#b45309', padding: '4px 10px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                      Gold: {job.goldWeight} g ({job.goldPurity})
                    </span>
                  )}

                  {dItems.map((d, i) => (
                    <span key={i} style={{ fontSize: '11px', fontWeight: '800', background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                      Diamond: {parseFloat(d.weight || d.weightCt || 0).toFixed(2)} ct ({d.size || `${parseFloat(d.sizeMm || 2.5).toFixed(1)} mm`} {d.shape || 'Round'})
                    </span>
                  ))}

                  {gItems.map((g, i) => (
                    <span key={i} style={{ fontSize: '11px', fontWeight: '800', background: '#faf5ff', color: '#6b21a8', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
                      Gemstone: {g.weight} ct ({g.size || 'Standard'})
                    </span>
                  ))}
                </div>

                {job.notes && (
                  <p style={{ fontSize: '12px', color: '#475569', margin: 0, fontStyle: 'italic', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px' }}>
                    "{job.notes}"
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 3. CREATE / EDIT JOB MODAL WITH DIAMOND STOCK VALIDATION */}
      <JobModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingJob(null); }}
        onSubmit={handleSaveJob}
        initialJob={editingJob}
        manufacturers={manufacturers}
        nextJobNumber={getNextJobNumber()}
        diamondStock={diamondStock}
      />

    </div>
  );
}
