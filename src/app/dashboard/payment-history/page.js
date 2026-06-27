'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function PaymentHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.getOrders();
      // Faqat to'langan buyurtmalar
      const paid = (res.orders || res || []).filter(o => o.payment_status === 'paid');
      setOrders(paid);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div className="dashboard-card animate-fade-in">
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>To'lovlar Tarixi (Tranzaksiyalar)</h2>
      
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Buyurtma #</th>
              <th>Mijoz</th>
              <th>Summa</th>
              <th>To'lov Turi</th>
              <th>Sana</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  To'lov tarixi bo'sh.
                </td>
              </tr>
            ) : (
              orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 'bold' }}>#{o.id}</td>
                  <td>{o.customer_name || '-'}</td>
                  <td style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>
                    {new Intl.NumberFormat('uz-UZ').format(o.total_amount)} UZS
                  </td>
                  <td style={{ textTransform: 'uppercase' }}>{o.payment_method}</td>
                  <td>{new Date(o.updated_at || o.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
