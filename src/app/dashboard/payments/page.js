'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

export default function KassirPaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.getOrders();
      // Kassir faqat to'lanmagan 'served' (topshirilgan) yoki 'ready' (tayyor) buyurtmalarni ko'radi
      const pendingPayments = (res.orders || res || []).filter(o => o.payment_status !== 'paid' && o.status !== 'cancelled');
      setOrders(pendingPayments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedOrder) return;
    try {
      // 1. To'lovni amalga oshirish
      await api.updateOrder(selectedOrder.id, { payment_status: 'paid', payment_method: paymentMethod });
      // 2. Statusini 'completed' qilish
      await api.updateOrderStatus(selectedOrder.id, 'completed');
      
      alert('To`lov qabul qilindi! Chek chiqarish oynasi ochiladi.');
      printReceipt(selectedOrder);
      
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  const printReceipt = (order) => {
    const printWindow = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>Chek #${order.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; width: 300px; margin: 0 auto; border: 1px dashed #ccc; }
            h2 { text-align: center; margin-bottom: 5px; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { font-weight: bold; font-size: 18px; margin-top: 10px; text-align: right; }
          </style>
        </head>
        <body>
          <h2>RESTARAN</h2>
          <div style="text-align: center">Xaridingiz uchun rahmat!</div>
          <div class="divider"></div>
          <div>Buyurtma: #${order.id}</div>
          <div>Sana: ${new Date().toLocaleString()}</div>
          <div>Stol/Turi: ${order.table_number ? 'Stol ' + order.table_number : order.order_type}</div>
          <div class="divider"></div>
          <div style="text-align:center; font-weight:bold; margin-bottom: 10px;">MAHSULOTLAR (SIMULYATSIYA)</div>
          <div class="item"><span>Jami summa:</span> <span>${new Intl.NumberFormat('uz-UZ').format(order.total_amount)} UZS</span></div>
          <div class="item"><span>To'lov turi:</span> <span style="text-transform:uppercase">${paymentMethod}</span></div>
          <div class="divider"></div>
          <div class="total">To'landi: ${new Intl.NumberFormat('uz-UZ').format(order.total_amount)} UZS</div>
          <div style="text-align: center; margin-top: 20px; font-size: 12px;">Xizmat ko'rsatuvchi: Kassir</div>
          <script>window.print(); setTimeout(() => window.close(), 500);</script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
      
      <div className="dashboard-card animate-fade-in">
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>To'lov Qabul Qilish (Kassa)</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {orders.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>To'lov kutilayotgan buyurtmalar yo'q.</div>
          ) : (
            orders.map(order => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                style={{ 
                  padding: '15px', 
                  borderRadius: '10px', 
                  border: selectedOrder?.id === order.id ? '2px solid var(--accent-green)' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedOrder?.id === order.id ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>#{order.id}</h3>
                  <span className="badge badge-new">{order.order_type}</span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-green)', marginBottom: '5px' }}>
                  {new Intl.NumberFormat('uz-UZ').format(order.total_amount)} UZS
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {order.table_number ? `Stol: ${order.table_number}` : 'Mijoz: ' + (order.customer_name || 'Noma\'lum')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="dashboard-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>To'lov Va Chek</h2>
        
        {selectedOrder ? (
          <div>
            <div style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Buyurtma:</span>
                <strong>#{selectedOrder.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Mijoz:</span>
                <strong>{selectedOrder.customer_name || 'Noma\'lum'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '20px', color: 'var(--accent-green)' }}>
                <span>Jami Summa:</span>
                <strong>{new Intl.NumberFormat('uz-UZ').format(selectedOrder.total_amount)} UZS</strong>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>To'lov Turi:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button 
                  className={`btn ${paymentMethod === 'cash' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setPaymentMethod('cash')}
                >💵 Naqd</button>
                <button 
                  className={`btn ${paymentMethod === 'card' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setPaymentMethod('card')}
                >💳 Karta</button>
                <button 
                  className={`btn ${paymentMethod === 'click' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setPaymentMethod('click')}
                >🔵 Click</button>
                <button 
                  className={`btn ${paymentMethod === 'payme' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setPaymentMethod('payme')}
                >🟢 Payme</button>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '16px' }} onClick={handlePayment}>
              To'lovni Qabul Qilish & Chek
            </button>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">💳</div>
            <div className="empty-state-title">Buyurtma tanlanmagan</div>
            <div className="empty-state-desc">To'lovni qabul qilish uchun chap tomondan buyurtmani tanlang.</div>
          </div>
        )}
      </div>

    </div>
  );
}
