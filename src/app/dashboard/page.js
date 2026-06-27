'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { getUser, getDefaultRoute } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    // Redirect if user is not loaded or not authorized
    if (!user || (user.role !== 'boss' && user.role !== 'admin')) {
      if (user && user.role) {
        router.push(getDefaultRoute(user.role));
      }
      return;
    }
    loadData();
  }, [router]);
  const revenueData = [
    { name: 'Mon', revenue: 400000, orders: 24 },
    { name: 'Tue', revenue: 300000, orders: 18 },
    { name: 'Wed', revenue: 550000, orders: 35 },
    { name: 'Thu', revenue: 450000, orders: 28 },
    { name: 'Fri', revenue: 800000, orders: 50 },
    { name: 'Sat', revenue: 1200000, orders: 85 },
    { name: 'Sun', revenue: 950000, orders: 60 },
  ];

  const loadData = async () => {
    try {
      const data = await api.getOverview();
      setStats(data.stats || data);
      setRecentOrders(data.recent_orders || data.recentOrders || []);
    } catch (err) {
      if (err.message && err.message.includes('Access denied')) {
        // Ruxsat yo'q bo'lsa, xatoni ko'rsatib feyk data qo'ymaymiz.
        // Redirect layout.js yoki useEffect da ishlaydi
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount || 0) + ' UZS';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      new: 'badge-new',
      cooking: 'badge-cooking',
      ready: 'badge-ready',
      served: 'badge-served',
      paid: 'badge-paid',
      cancelled: 'badge-cancelled',
      completed: 'badge-paid',
    };
    return statusMap[status] || 'badge-new';
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div>
      {error && <div className="auth-error" style={{ marginBottom: '20px' }}>{error}</div>}

      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>Jami Buyurtmalar</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats?.total_orders || 0} ta</div>
          </div>
          <div style={{ fontSize: '30px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '50%' }}>📋</div>
        </div>

        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '3px solid var(--accent-green)' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>Jami Tushum</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-green)' }}>{formatCurrency(stats?.total_income)}</div>
          </div>
          <div style={{ fontSize: '30px', background: 'rgba(0,184,148,0.1)', padding: '15px', borderRadius: '50%' }}>💵</div>
        </div>

        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '3px solid var(--accent-red)' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>Jami Xarajatlar</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-red)' }}>{formatCurrency(stats?.total_expenses)}</div>
          </div>
          <div style={{ fontSize: '30px', background: 'rgba(225,112,85,0.1)', padding: '15px', borderRadius: '50%' }}>📉</div>
        </div>

        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.4s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>Faol Taomlar</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-blue)' }}>{stats?.active_menu_items || 0} ta</div>
          </div>
          <div style={{ fontSize: '30px', background: 'rgba(9,132,227,0.1)', padding: '15px', borderRadius: '50%' }}>🍽️</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.5s', height: '400px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>Haftalik Daromad (Grafik)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Daromad (UZS)" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.6s', height: '400px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>Buyurtmalar Soni</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="orders" name="Buyurtmalar" fill="var(--accent-green)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card-static animate-fade-in" style={{ animationDelay: '0.7s' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>So'nggi Buyurtmalar</h2>
        {recentOrders.length === 0 ? (
          <div className="empty-state">Buyurtmalar yo'q</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Buyurtma #</th>
                  <th>Stol / Tur</th>
                  <th>Summa</th>
                  <th>Holat</th>
                  <th>Vaqt</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: '600' }}>#{order.id}</td>
                    <td>{order.table_number ? `Stol ${order.table_number}` : (order.order_type === 'delivery' ? 'Dostavka' : 'Olib ketish')}</td>
                    <td style={{ fontWeight: '600', color: 'var(--accent-green)' }}>{formatCurrency(order.total_amount)}</td>
                    <td><span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span></td>
                    <td>{new Date(order.created_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
