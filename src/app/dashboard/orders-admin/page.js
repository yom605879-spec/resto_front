'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('new'); // new, cooking, ready, all

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ords, crs, tbs] = await Promise.all([
        api.getOrders(),
        api.getCouriers(),
        api.getTables()
      ]);
      setOrders(ords.orders || ords || []);
      setCouriers(crs || []);
      setTables(tbs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await api.updateOrderStatus(id, status);
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  const assignTable = async (id, table_number) => {
    try {
      await api.assignOrder(id, { table_number: parseInt(table_number) });
      loadData();
      alert(`Stol ${table_number} ga biriktirildi!`);
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  const assignCourier = async (id, courier_id) => {
    try {
      await api.assignOrder(id, { courier_id: parseInt(courier_id) });
      loadData();
      alert(`Kuryer biriktirildi!`);
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Qabul va Buyurtmalar</h2>
      </div>

      <div className="filter-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['new', 'cooking', 'ready', 'served', 'all'].map(f => (
          <button 
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
            style={{ textTransform: 'capitalize' }}
          >
            {f === 'new' ? 'Yangi 🔴' : f === 'cooking' ? 'Tayyorlanmoqda 👨‍🍳' : f === 'ready' ? 'Tayyor ✅' : f === 'served' ? 'Yetkazilgan/Xizmat' : 'Barchasi'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredOrders.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>Bu holatdagi buyurtmalar yo'q.</div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="dashboard-card animate-fade-in" style={{ borderLeft: `4px solid ${order.status === 'new' ? 'var(--accent-red)' : order.status === 'cooking' ? '#f5a623' : 'var(--accent-green)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Buyurtma #{order.id}</h3>
                <span className="badge badge-new" style={{ textTransform: 'uppercase' }}>{order.order_type}</span>
              </div>
              
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                <p><b>Mijoz:</b> {order.customer_name || 'Noma\'lum'} ({order.customer_phone || '-'})</p>
                <p><b>Summa:</b> {new Intl.NumberFormat('uz-UZ').format(order.total_amount)} UZS</p>
                <p><b>Vaqt:</b> {new Date(order.created_at).toLocaleTimeString()}</p>
              </div>

              {/* Turlarga qarab qo'shimcha biriktirishlar */}
              <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                {order.order_type === 'dine_in' ? (
                  <div>
                    <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Stolni belgilash:</label>
                    <select 
                      className="auth-input" 
                      style={{ padding: '6px', fontSize: '13px' }}
                      value={order.table_number || ''}
                      onChange={(e) => assignTable(order.id, e.target.value)}
                    >
                      <option value="">Stol tanlang</option>
                      {tables.map(t => (
                        <option key={t.id} value={t.table_number}>Stol {t.table_number} ({t.capacity} kishi) - {t.status}</option>
                      ))}
                    </select>
                  </div>
                ) : order.order_type === 'delivery' ? (
                  <div>
                    <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Kuryer tayinlash:</label>
                    <select 
                      className="auth-input" 
                      style={{ padding: '6px', fontSize: '13px' }}
                      value={order.courier_id || ''}
                      onChange={(e) => assignCourier(order.id, e.target.value)}
                    >
                      <option value="">Kuryer tanlang</option>
                      {couriers.map(c => (
                        <option key={c.id} value={c.id}>{c.first_name || c.username}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Olib ketish (O'zi olib ketadi)</p>
                )}
              </div>

              {/* Status Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {order.status === 'new' && (
                  <button className="btn btn-primary" style={{ flex: 1, padding: '8px' }} onClick={() => changeStatus(order.id, 'cooking')}>
                    Qabul qilish (Oshxonaga)
                  </button>
                )}
                {order.status === 'cooking' && (
                  <button className="btn btn-primary" style={{ flex: 1, padding: '8px', background: '#f5a623', border: 'none' }} onClick={() => changeStatus(order.id, 'ready')}>
                    Tayyor!
                  </button>
                )}
                {order.status === 'ready' && (
                  <button className="btn btn-primary" style={{ flex: 1, padding: '8px', background: 'var(--accent-green)', border: 'none' }} onClick={() => changeStatus(order.id, 'served')}>
                    Topshirish (Served)
                  </button>
                )}
                <button className="btn btn-danger" style={{ padding: '8px' }} onClick={() => changeStatus(order.id, 'cancelled')}>
                  Bekor qilish
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
