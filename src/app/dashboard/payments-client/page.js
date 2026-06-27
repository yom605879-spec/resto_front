'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function PaymentsClientPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('payme');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.getOrders();
      const unpaid = (res.orders || res || []).filter(o => o.payment_status !== 'paid' && o.status !== 'cancelled');
      setOrders(unpaid);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!payingOrderId) return;
    try {
      // Simulyatsiya qilingan to'lov jarayoni
      await new Promise(resolve => setTimeout(resolve, 1500)); // loading simulatsiyasi
      
      await api.updateOrder(payingOrderId, { payment_status: 'paid', payment_method: paymentMethod });
      alert("To'lov muvaffaqiyatli amalga oshirildi!");
      
      setPayingOrderId(null);
      loadOrders();
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div className="dashboard-card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>To'lov qilish (Kassa/Click/Payme)</h2>

      {orders.length === 0 ? (
        <div className="empty-state">Sizda to'lanmagan buyurtmalar yo'q.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="auth-form-group">
            <label>Qaysi buyurtma uchun to'lov qilasiz?</label>
            <select 
              className="auth-input" 
              value={payingOrderId || ''}
              onChange={(e) => setPayingOrderId(e.target.value)}
            >
              <option value="">Tanlang...</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  Buyurtma #{o.id} - {new Intl.NumberFormat('uz-UZ').format(o.total_amount)} UZS
                </option>
              ))}
            </select>
          </div>

          {payingOrderId && (
            <div className="animate-fade-in">
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>To'lov Tizimi:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div 
                  onClick={() => setPaymentMethod('click')}
                  style={{ 
                    padding: '20px', 
                    borderRadius: '10px', 
                    border: paymentMethod === 'click' ? '2px solid #00a1f1' : '1px solid rgba(255,255,255,0.1)',
                    background: paymentMethod === 'click' ? 'rgba(0, 161, 241, 0.1)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: paymentMethod === 'click' ? '#00a1f1' : 'inherit'
                  }}
                >
                  🔵 CLICK
                </div>
                <div 
                  onClick={() => setPaymentMethod('payme')}
                  style={{ 
                    padding: '20px', 
                    borderRadius: '10px', 
                    border: paymentMethod === 'payme' ? '2px solid #33cccc' : '1px solid rgba(255,255,255,0.1)',
                    background: paymentMethod === 'payme' ? 'rgba(51, 204, 204, 0.1)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: paymentMethod === 'payme' ? '#33cccc' : 'inherit'
                  }}
                >
                  🟢 PAYME
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }} onClick={handlePay}>
                To'lash ({new Intl.NumberFormat('uz-UZ').format(orders.find(o => o.id.toString() === payingOrderId.toString())?.total_amount)} UZS)
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
