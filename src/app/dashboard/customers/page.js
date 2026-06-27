'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.updateCustomerStatus(id, !currentStatus);
      setCustomers(customers.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div className="dashboard-card animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Mijozlar Boshqaruvi</h2>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '15px' }}>{error}</div>}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ism / Familiya</th>
              <th>Username</th>
              <th>Telefon</th>
              <th>Email</th>
              <th>Holat</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  Hali mijozlar yo'q
                </td>
              </tr>
            ) : (
              customers.map(c => (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td style={{ fontWeight: '500' }}>{c.first_name || '-'} {c.last_name || ''}</td>
                  <td>{c.username ? '@' + c.username : '-'}</td>
                  <td>{c.phone_number || '-'}</td>
                  <td>{c.email || '-'}</td>
                  <td>
                    <span className={`badge ${c.is_active ? 'badge-paid' : 'badge-cancelled'}`}>
                      {c.is_active ? 'Faol' : 'Bloklangan'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`btn ${c.is_active ? 'btn-danger' : 'btn-primary'}`} 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => toggleStatus(c.id, c.is_active)}
                    >
                      {c.is_active ? 'Bloklash' : 'Faollashtirish'}
                    </button>
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
