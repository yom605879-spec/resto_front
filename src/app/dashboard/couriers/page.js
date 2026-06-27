'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function CouriersPage() {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCouriers();
  }, []);

  const loadCouriers = async () => {
    try {
      const data = await api.getCouriers();
      setCouriers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div className="dashboard-card animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Kuryerlar Ro'yxati</h2>
      </div>

      <div className="alert" style={{ marginBottom: '20px', padding: '15px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '10px' }}>
        ℹ️ <strong>Ma'lumot:</strong> Kuryerlarni tizimga qo'shish uchun "Hodimlar" (Xodim boshqaruv) bo'limidan yangi xodim qo'shing va roliga <b>kuryer</b> ni tanlang. Ular shu yerda paydo bo'ladi.
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '15px' }}>{error}</div>}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ism / Familiya</th>
              <th>Username</th>
              <th>Holati</th>
            </tr>
          </thead>
          <tbody>
            {couriers.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  Tizimda birorta ham kuryer yo'q.
                </td>
              </tr>
            ) : (
              couriers.map(c => (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td style={{ fontWeight: '500' }}>{c.first_name || '-'} {c.last_name || ''}</td>
                  <td>@{c.username}</td>
                  <td>
                    <span className={`badge ${c.is_active ? 'badge-ready' : 'badge-cancelled'}`}>
                      {c.is_active ? 'Aktiv' : 'Nofaol'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
