'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function ReportsDailyPage() {
  const [data, setData] = useState({ 
    totalIncome: 0, 
    totalExpenses: 0, 
    totalRefunds: 0,
    ordersCount: 0,
    byMethod: { cash: 0, card: 0, click: 0, payme: 0 } 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailyReport();
  }, []);

  const loadDailyReport = async () => {
    try {
      // Bugungi sana
      const today = new Date().toISOString().split('T')[0];
      
      const [ords, exps, refs] = await Promise.all([
        api.getOrders(),
        api.getExpenses(),
        api.getRefunds()
      ]);

      const allOrders = ords.orders || ords || [];
      const allExpenses = exps.expenses || exps || [];
      
      // Filtrlash (bugun)
      const todayOrders = allOrders.filter(o => o.created_at.startsWith(today) && o.payment_status === 'paid');
      const todayExpenses = allExpenses.filter(e => e.date && e.date.startsWith(today));
      const todayRefunds = (refs || []).filter(r => r.created_at.startsWith(today));

      let totalIn = 0;
      let methods = { cash: 0, card: 0, click: 0, payme: 0 };
      
      todayOrders.forEach(o => {
        const amt = parseFloat(o.total_amount);
        totalIn += amt;
        if (o.payment_method && methods[o.payment_method] !== undefined) {
          methods[o.payment_method] += amt;
        }
      });

      const totalEx = todayExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const totalRef = todayRefunds.reduce((sum, r) => sum + parseFloat(r.amount), 0);

      setData({
        totalIncome: totalIn,
        totalExpenses: totalEx,
        totalRefunds: totalRef,
        ordersCount: todayOrders.length,
        byMethod: methods
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  const format = (num) => new Intl.NumberFormat('uz-UZ').format(num);
  const netIncome = data.totalIncome - data.totalExpenses - data.totalRefunds;

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Bugungi Kassa Hisoboti (Kunlik)</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        <div className="dashboard-card animate-fade-in" style={{ borderBottom: '4px solid var(--accent-green)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '10px' }}>Qabul qilingan summa (Jami)</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--accent-green)' }}>{format(data.totalIncome)} UZS</div>
          <div style={{ fontSize: '13px', marginTop: '10px', color: 'var(--text-tertiary)' }}>{data.ordersCount} ta to'lov</div>
        </div>

        <div className="dashboard-card animate-fade-in" style={{ borderBottom: '4px solid var(--accent-red)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '10px' }}>Chiqim va Qaytarishlar</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--accent-red)' }}>{format(data.totalExpenses + data.totalRefunds)} UZS</div>
          <div style={{ fontSize: '13px', marginTop: '10px', color: 'var(--text-tertiary)' }}>
            Xarajatlar: {format(data.totalExpenses)} | Vozvrat: {format(data.totalRefunds)}
          </div>
        </div>

        <div className="dashboard-card animate-fade-in" style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(168, 85, 247, 0.1))', borderBottom: '4px solid var(--accent-blue)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '10px' }}>Kassadagi sof qoldiq</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>{format(netIncome)} UZS</div>
          <div style={{ fontSize: '13px', marginTop: '10px', color: 'var(--text-tertiary)' }}>Jami kirimdan jami chiqim ayrildi</div>
        </div>

      </div>

      <div className="dashboard-card animate-fade-in">
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>To'lov turlari bo'yicha tushum</h3>
        <div className="table-container">
          <table className="table">
            <tbody>
              <tr>
                <td>💵 Naqd pul</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{format(data.byMethod.cash)} UZS</td>
              </tr>
              <tr>
                <td>💳 Karta</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{format(data.byMethod.card)} UZS</td>
              </tr>
              <tr>
                <td>🔵 Click</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#00a1f1' }}>{format(data.byMethod.click)} UZS</td>
              </tr>
              <tr>
                <td>🟢 Payme</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#33cccc' }}>{format(data.byMethod.payme)} UZS</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
