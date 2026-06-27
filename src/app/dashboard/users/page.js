'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const ROLE_CONFIG = {
  boss: { label: 'Boss', icon: '👑', color: '#f59e0b' },
  admin: { label: 'Admin', icon: '🛠️', color: '#6366f1' },
  kassir: { label: 'Kassir', icon: '💰', color: '#10b981' },
  oshpaz: { label: 'Oshpaz', icon: '👨‍🍳', color: '#f97316' },
  ofitsiant: { label: 'Ofitsiant', icon: '🍽️', color: '#3b82f6' },
  mijoz: { label: 'Mijoz', icon: '👤', color: '#8b5cf6' },
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAllUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.approveUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_approved: true } : u));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Bu foydalanuvchini rad etasizmi?')) return;
    try {
      await api.rejectUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'approved' && u.is_approved) ||
      (filterStatus === 'pending' && !u.is_approved);
    return matchSearch && matchRole && matchStatus;
  });

  const stats = {
    total: users.length,
    approved: users.filter(u => u.is_approved).length,
    pending: users.filter(u => !u.is_approved).length,
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#ef4444', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Jami', value: stats.total, icon: '👥', color: '#6366f1' },
          { label: 'Tasdiqlangan', value: stats.approved, icon: '✅', color: '#10b981' },
          { label: 'Kutmoqda', value: stats.pending, icon: '⏳', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--card-bg)', borderRadius: '14px',
            border: '1px solid var(--card-border)', padding: '20px',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', height: '40px' }}
        />
        <select
          className="form-input"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{ width: '160px', height: '40px' }}
        >
          <option value="all">Barcha rollar</option>
          {Object.entries(ROLE_CONFIG).map(([v, c]) => (
            <option key={v} value={v}>{c.icon} {c.label}</option>
          ))}
        </select>
        <select
          className="form-input"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ width: '160px', height: '40px' }}
        >
          <option value="all">Barcha holat</option>
          <option value="approved">✅ Tasdiqlangan</option>
          <option value="pending">⏳ Kutmoqda</option>
        </select>
      </div>

      {/* Users Table */}
      <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700' }}>Barcha Hisoblar</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{filtered.length} ta foydalanuvchi</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['#', 'Foydalanuvchi', 'Username', 'Rol', 'Holat', 'Sana', 'Amallar'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--card-border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Foydalanuvchilar topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => {
                  const roleCfg = ROLE_CONFIG[user.role] || { label: user.role, icon: '👤', color: '#6b7280' };
                  const initials = `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';
                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: `${roleCfg.color}25`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: '700', fontSize: '13px', color: roleCfg.color,
                            flexShrink: 0,
                          }}>{initials}</div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>
                              {user.first_name} {user.last_name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              ID: {user.id} {user.telegram_id ? `• TG: ${user.telegram_id}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <code style={{ fontSize: '13px', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '6px', color: 'var(--text)' }}>
                          @{user.username}
                        </code>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                          background: `${roleCfg.color}20`, color: roleCfg.color,
                        }}>
                          {roleCfg.icon} {roleCfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                          background: user.is_approved ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                          color: user.is_approved ? '#10b981' : '#f59e0b',
                        }}>
                          {user.is_approved ? '✅ Tasdiqlangan' : '⏳ Kutmoqda'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(user.created_at).toLocaleDateString('uz-UZ')}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {!user.is_approved && user.role !== 'boss' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleApprove(user.id)}
                              style={{
                                padding: '6px 12px', borderRadius: '8px', border: 'none',
                                background: 'rgba(16,185,129,0.2)', color: '#10b981',
                                cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                              }}
                            >
                              ✓ Tasdiqlash
                            </button>
                            <button
                              onClick={() => handleReject(user.id)}
                              style={{
                                padding: '6px 12px', borderRadius: '8px', border: 'none',
                                background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                                cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                              }}
                            >
                              ✕ Rad
                            </button>
                          </div>
                        )}
                        {user.is_approved && (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note about passwords */}
      <div style={{
        padding: '14px 18px', borderRadius: '10px',
        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
        fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '10px', alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: '16px', flexShrink: 0 }}>🔒</span>
        <div>
          <strong style={{ color: 'var(--text)' }}>Xavfsizlik:</strong> Parollar shifrlangan (bcrypt) holda saqlanadi va hech kim tomonidan ko'rib chiqilmaydi.
          Faqat username, rol va holat ko'rsatilmoqda.
        </div>
      </div>
    </div>
  );
}
