'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.getOrders();
      setOrders(res.orders || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'new': return <span className="badge badge-new">Kutilmoqda 🕒</span>;
      case 'cooking': return <span className="badge" style={{background: '#f5a623', color: '#fff'}}>Tayyorlanmoqda 👨‍🍳</span>;
      case 'ready': return <span className="badge" style={{background: 'var(--accent-blue)', color: '#fff'}}>Tayyor ✅</span>;
      case 'served': return <span className="badge badge-paid">Yetkazildi / Topshirildi 🏁</span>;
      case 'completed': return <span className="badge badge-paid">Yopilgan 🏁</span>;
      case 'cancelled': return <span className="badge badge-cancelled">Bekor qilingan ❌</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Mening Buyurtmalarim</h2>
      
      {orders.length === 0 ? (
        <div className="empty-state">
          Sizda hozircha buyurtmalar yo'q. Menyudan nimadir tanlang!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {orders.map(o => (
            <div key={o.id} className="dashboard-card animate-fade-in" style={{ borderLeft: '3px solid var(--accent-blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Buyurtma #{o.id}</span>
                {getStatusBadge(o.status)}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '15px' }}>
                <p><b>Sana:</b> {new Date(o.created_at).toLocaleString()}</p>
                <p><b>Turi:</b> {o.order_type === 'delivery' ? 'Yetkazib berish (Dostavka)' : 'Olib ketish'}</p>
                <p><b>To'lov holati:</b> <span style={{ color: o.payment_status === 'paid' ? 'var(--accent-green)' : 'var(--accent-red)' }}>{o.payment_status === 'paid' ? 'To\'langan' : 'To\'lanmagan'}</span></p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-green)' }}>
                  {new Intl.NumberFormat('uz-UZ').format(o.total_amount)} UZS
                </span>
                {o.payment_status !== 'paid' && o.status !== 'cancelled' && (
                  <button className="btn btn-sm btn-primary" onClick={() => window.location.href='/dashboard/payments-client'}>To'lash</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
