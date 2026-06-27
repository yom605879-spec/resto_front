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

export default function PendingPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPending = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id, username) => {
    try {
      await api.approveUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Bu foydalanuvchini rad etib o\'chirasizmi?')) return;
    try {
      await api.rejectUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert(err.message);
    }
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

      {/* Header Info */}
      <div style={{
        padding: '16px 20px', borderRadius: '12px',
        background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
        display: 'flex', gap: '12px', alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: '20px' }}>⏳</span>
        <div>
          <div style={{ fontWeight: '600', color: '#f59e0b', marginBottom: '4px' }}>
            {users.length} ta foydalanuvchi tasdiqingizni kutmoqda
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Quyidagi foydalanuvchilar o'z rollarida ishlash uchun ruxsatingizni kutmoqda.
            Tasdiqlasangiz, ular tizimga kira oladi.
          </div>
        </div>
      </div>

      {/* Pending Users Cards */}
      {users.length === 0 ? (
        <div style={{
          padding: '60px 20px', textAlign: 'center',
          background: 'var(--card-bg)', borderRadius: '16px',
          border: '1px solid var(--card-border)',
        }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>✅</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
            Barcha tasdiqlanган!
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Hozircha tasdiq kutayotgan foydalanuvchi yo'q.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {users.map(user => {
            const roleCfg = ROLE_CONFIG[user.role] || { label: user.role, icon: '👤', color: '#6b7280' };
            const initials = `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';
            const timeSince = Math.floor((Date.now() - new Date(user.created_at)) / 60000);
            const timeLabel = timeSince < 60
              ? `${timeSince} daqiqa oldin`
              : timeSince < 1440
                ? `${Math.floor(timeSince / 60)} soat oldin`
                : `${Math.floor(timeSince / 1440)} kun oldin`;

            return (
              <div key={user.id} style={{
                background: 'var(--card-bg)', borderRadius: '16px',
                border: '1px solid var(--card-border)',
                overflow: 'hidden', transition: 'border-color 0.2s',
              }}>
                {/* Card header */}
                <div style={{
                  height: '4px',
                  background: `linear-gradient(90deg, ${roleCfg.color}, ${roleCfg.color}80)`,
                }} />

                <div style={{ padding: '20px' }}>
                  {/* User Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <div style={{
                      width: '50px', height: '50px', borderRadius: '50%',
                      background: `${roleCfg.color}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', fontWeight: '800', color: roleCfg.color,
                      flexShrink: 0,
                    }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '2px' }}>
                        {user.first_name} {user.last_name}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        @{user.username}
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>
                      {timeLabel}
                    </div>
                  </div>

                  {/* Role badge */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '20px', marginBottom: '16px',
                    background: `${roleCfg.color}15`, border: `1px solid ${roleCfg.color}30`,
                  }}>
                    <span style={{ fontSize: '14px' }}>{roleCfg.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: roleCfg.color }}>
                      {roleCfg.label} sifatida ishlaydi
                    </span>
                  </div>

                  {/* Telegram ID */}
                  {user.telegram_id && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      📱 Telegram ID: <code style={{ color: 'var(--text)' }}>{user.telegram_id}</code>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleApprove(user.id, user.username)}
                      style={{
                        flex: 1, padding: '10px 16px', borderRadius: '10px', border: 'none',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white', fontWeight: '700', fontSize: '13px',
                        cursor: 'pointer', transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      ✓ Tasdiqlash
                    </button>
                    <button
                      onClick={() => handleReject(user.id)}
                      style={{
                        flex: 1, padding: '10px 16px', borderRadius: '10px',
                        border: '1px solid rgba(239,68,68,0.3)',
                        background: 'rgba(239,68,68,0.1)',
                        color: '#ef4444', fontWeight: '700', fontSize: '13px',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                    >
                      ✕ Rad etish
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
