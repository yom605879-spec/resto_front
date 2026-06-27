'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function RefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ order_id: '', amount: '', reason: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [refs, ords] = await Promise.all([
        api.getRefunds(),
        api.getOrders()
      ]);
      setRefunds(refs);
      // Faqat to'langan buyurtmalarni bekor qilish mumkin
      const paidOrders = (ords.orders || ords || []).filter(o => o.payment_status === 'paid');
      setOrders(paidOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (e) => {
    e.preventDefault();
    try {
      await api.createRefund({
        order_id: parseInt(formData.order_id),
        amount: parseFloat(formData.amount),
        reason: formData.reason
      });
      setShowModal(false);
      setFormData({ order_id: '', amount: '', reason: '' });
      loadData();
      alert('Qaytarish muvaffaqiyatli amalga oshirildi!');
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div className="dashboard-card animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>To'lovni Qaytarish (Vozvrat)</h2>
        <button className="btn btn-danger" onClick={() => setShowModal(true)}>+ Qaytarish Qo'shish</button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Buyurtma #</th>
              <th>Summa</th>
              <th>Sabab</th>
              <th>Sana</th>
            </tr>
          </thead>
          <tbody>
            {refunds.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  Hech qanday qaytarishlar yo'q.
                </td>
              </tr>
            ) : (
              refunds.map(r => (
                <tr key={r.id}>
                  <td>#{r.id}</td>
                  <td style={{ fontWeight: 'bold' }}>#{r.order_id}</td>
                  <td style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>
                    -{new Intl.NumberFormat('uz-UZ').format(r.amount)} UZS
                  </td>
                  <td>{r.reason}</td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '20px' }}>Pul Qaytarish (Bekor qilish)</h3>
            <form onSubmit={handleRefund}>
              <div className="auth-form-group">
                <label>To'langan Buyurtma</label>
                <select 
                  className="auth-input" 
                  required
                  value={formData.order_id}
                  onChange={(e) => {
                    const id = e.target.value;
                    const o = orders.find(x => x.id.toString() === id);
                    setFormData({...formData, order_id: id, amount: o ? o.total_amount : ''});
                  }}
                >
                  <option value="">Tanlang</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>#{o.id} - {o.customer_name} ({new Intl.NumberFormat('uz-UZ').format(o.total_amount)} UZS)</option>
                  ))}
                </select>
              </div>
              <div className="auth-form-group">
                <label>Qaytarilayotgan Summa (UZS)</label>
                <input 
                  type="number" 
                  className="auth-input" 
                  required 
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              <div className="auth-form-group">
                <label>Sababi (Izoh)</label>
                <textarea 
                  className="auth-input" 
                  required 
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Bekor qilish</button>
                <button type="submit" className="btn btn-danger" style={{ flex: 1 }}>Tasdiqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
