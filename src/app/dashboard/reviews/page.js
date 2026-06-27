'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function ReviewsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [formData, setFormData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.getOrders();
      // Faqat tugatilgan buyurtmalar uchun sharh qoldirish mumkin
      const completed = (res.orders || res || []).filter(o => o.status === 'completed' || o.status === 'served');
      setOrders(completed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.createPublicReview(selectedOrderId, formData);
      alert('Sharhingiz muvaffaqiyatli saqlandi. Rahmat!');
      setShowModal(false);
      setFormData({ rating: 5, comment: '' });
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Baho va Sharhlar (Sizning fikringiz muhim)</h2>
      
      {orders.length === 0 ? (
        <div className="empty-state">Sizda hali tugallangan buyurtmalar yo'q.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {orders.map(o => (
            <div key={o.id} className="dashboard-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>Buyurtma #{o.id}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sana: {new Date(o.updated_at || o.created_at).toLocaleDateString()}</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '5px' }}>{new Intl.NumberFormat('uz-UZ').format(o.total_amount)} UZS</p>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '15px', background: 'var(--accent-blue)' }}
                onClick={() => { setSelectedOrderId(o.id); setShowModal(true); }}
              >
                ⭐ Baholash
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '20px' }}>Buyurtma #{selectedOrderId} ni baholash</h3>
            <form onSubmit={submitReview}>
              <div className="auth-form-group">
                <label>Bahongiz (1 yomon - 5 a'lo)</label>
                <div style={{ display: 'flex', gap: '10px', fontSize: '24px', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span 
                      key={star} 
                      onClick={() => setFormData({...formData, rating: star})}
                      style={{ color: star <= formData.rating ? '#f5a623' : 'rgba(255,255,255,0.2)', transition: '0.2s' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="auth-form-group">
                <label>Sharhingiz (Ixtiyoriy)</label>
                <textarea 
                  className="auth-input" 
                  rows="3" 
                  placeholder="Xizmat va taomlar haqida fikringiz..."
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Yuborish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
