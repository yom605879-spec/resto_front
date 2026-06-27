'use sigle';
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ table_number: '', capacity: 4 });

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const data = await api.getTables();
      setTables(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createTable({
        table_number: parseInt(formData.table_number),
        capacity: parseInt(formData.capacity)
      });
      setShowModal(false);
      setFormData({ table_number: '', capacity: 4 });
      loadTables();
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await api.updateTable(id, status);
      loadTables();
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  const deleteTable = async (id) => {
    if (!confirm('Haqiqatan ham bu stolni o`chirmoqchimisiz?')) return;
    try {
      await api.deleteTable(id);
      loadTables();
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Stollar Xaritasi ({tables.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Yangi Stol</button>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '15px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {tables.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>Hali stollar qo'shilmagan.</div>
        ) : (
          tables.map(table => (
            <div key={table.id} className="dashboard-card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                height: '4px', width: '100%', position: 'absolute', top: 0, left: 0,
                background: table.status === 'available' ? 'var(--accent-green)' : 
                            table.status === 'occupied' ? 'var(--accent-red)' : '#f5a623'
              }}></div>
              
              <div style={{ fontSize: '40px', margin: '15px 0' }}>🪑</div>
              <h3 style={{ fontSize: '20px', marginBottom: '5px' }}>Stol {table.table_number}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '15px' }}>
                Odam soni: {table.capacity}
              </p>

              <select 
                className="auth-input" 
                style={{ padding: '8px', fontSize: '13px', marginBottom: '10px' }}
                value={table.status}
                onChange={(e) => changeStatus(table.id, e.target.value)}
              >
                <option value="available">Bo'sh (Available)</option>
                <option value="occupied">Band (Occupied)</option>
                <option value="reserved">Zabron (Reserved)</option>
              </select>

              <button 
                onClick={() => deleteTable(table.id)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
              >
                O'chirish
              </button>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '20px' }}>Yangi stol qo'shish</h3>
            <form onSubmit={handleCreate}>
              <div className="auth-form-group">
                <label>Stol raqami</label>
                <input 
                  type="number" 
                  className="auth-input" 
                  required 
                  min="1"
                  value={formData.table_number}
                  onChange={(e) => setFormData({...formData, table_number: e.target.value})}
                />
              </div>
              <div className="auth-form-group">
                <label>Sig'imi (odam soni)</label>
                <input 
                  type="number" 
                  className="auth-input" 
                  required 
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
