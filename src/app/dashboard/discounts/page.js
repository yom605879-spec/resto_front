'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ code: '', discount_type: 'percentage', value: '' });

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      const data = await api.getDiscounts();
      setDiscounts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createDiscount({
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        value: parseFloat(formData.value)
      });
      setShowModal(false);
      setFormData({ code: '', discount_type: 'percentage', value: '' });
      loadDiscounts();
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div className="dashboard-card animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Chegirmalar va Promokodlar</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Yangi Chegirma</button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Kod (Promokod)</th>
              <th>Turi</th>
              <th>Qiymati</th>
              <th>Holat</th>
              <th>Sana</th>
            </tr>
          </thead>
          <tbody>
            {discounts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  Hech qanday chegirma mavjud emas.
                </td>
              </tr>
            ) : (
              discounts.map(d => (
                <tr key={d.id}>
                  <td>#{d.id}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>{d.code}</td>
                  <td>{d.discount_type === 'percentage' ? 'Foizli (%)' : 'Aniq summa'}</td>
                  <td style={{ fontWeight: 'bold' }}>
                    {d.discount_type === 'percentage' ? `${d.value}%` : `${new Intl.NumberFormat('uz-UZ').format(d.value)} UZS`}
                  </td>
                  <td>
                    <span className={`badge ${d.is_active ? 'badge-ready' : 'badge-cancelled'}`}>
                      {d.is_active ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                  <td>{new Date(d.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '20px' }}>Yangi Promokod Qo'shish</h3>
            <form onSubmit={handleCreate}>
              <div className="auth-form-group">
                <label>Promokod matni (Masalan: BAYRAM20)</label>
                <input 
                  type="text" 
                  className="auth-input" 
                  required 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="auth-form-group">
                <label>Chegirma turi</label>
                <select 
                  className="auth-input" 
                  value={formData.discount_type}
                  onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                >
                  <option value="percentage">Foizli (%)</option>
                  <option value="fixed">Aniq summa (UZS)</option>
                </select>
              </div>
              <div className="auth-form-group">
                <label>Chegirma qiymati</label>
                <input 
                  type="number" 
                  className="auth-input" 
                  required 
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
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
