'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadComplaints();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadComplaints = async () => {
    try {
      const data = await api.getComplaints();
      setComplaints(data.complaints || data || []);
    } catch (err) {
      setError('Shikoyatlarni yuklashda xatolik yuz berdi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'resolved' ? 'new' : 'resolved';
    try {
      await api.updateComplaintStatus(id, nextStatus);
      showToast(`Shikoyat holati ${nextStatus === 'resolved' ? 'hal qilindi' : 'yangi'} deb belgilandi`);
      loadComplaints();
    } catch (err) {
      showToast('Holatni yangilashda xatolik: ' + err.message, 'error');
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <div className={`toast toast-${toast.type}`} style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          background: toast.type === 'error' ? 'var(--gradient-red)' : 'var(--gradient-green)',
          padding: '12px 24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
          color: '#fff', fontWeight: '600'
        }}>
          {toast.message}
        </div>
      )}

      {error && (
        <div className="auth-error" style={{ marginBottom: '20px' }}>{error}</div>
      )}

      {/* Toolbar Filters */}
      <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div className="filter-tabs" style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'all', label: 'Barchasi' },
            { key: 'new', label: 'Yangi 🔵' },
            { key: 'resolved', label: 'Hal qilingan ✅' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`btn btn-sm ${filter === tab.key ? 'btn-primary' : 'btn-ghost'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Jami: {filteredComplaints.length} ta xabar
        </span>
      </div>

      {/* Complaints List Grid */}
      {filteredComplaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <div className="empty-state-title">Shikoyat va takliflar yo'q</div>
          <div className="empty-state-desc">Ushbu bo'limda mijozlar tomonidan yuborilgan fikrlar va shikoyatlar ko'rinadi.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredComplaints.map((comp) => (
            <div key={comp.id} className="glass-card-static animate-fade-in" style={{
              padding: '24px',
              borderLeft: comp.status === 'resolved' ? '4px solid var(--accent-green)' : '4px solid var(--accent-red)',
              background: 'var(--bg-secondary)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{comp.subject}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Yubordi: <b>{comp.customer_name}</b> {comp.customer_phone ? `(${comp.customer_phone})` : ''} • {new Date(comp.created_at).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`badge ${comp.status === 'resolved' ? 'badge-served' : 'badge-new'}`}>
                    {comp.status === 'resolved' ? 'Hal qilindi' : 'Yangi'}
                  </span>
                  <button
                    onClick={() => handleResolve(comp.id, comp.status)}
                    className={`btn btn-sm ${comp.status === 'resolved' ? 'btn-ghost' : 'btn-primary'}`}
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    {comp.status === 'resolved' ? '🔴 Qayta ochish' : '✅ Hal qilindi'}
                  </button>
                </div>
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}>
                {comp.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
