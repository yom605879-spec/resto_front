'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function PayrollPage() {
  const [payrollData, setPayrollData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [payModal, setPayModal] = useState({ open: false, staff: null, amount: '' });

  useEffect(() => {
    loadPayroll();
  }, [month]);

  const loadPayroll = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getPayroll(month);
      setPayrollData(data.payroll);
      setTotalRevenue(data.total_revenue);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    try {
      await api.paySalary({
        staff_id: payModal.staff.staff_id,
        amount: parseFloat(payModal.amount),
        month: month,
        details: 'Oylik to\'lovi'
      });
      setPayModal({ open: false, staff: null, amount: '' });
      loadPayroll();
      alert('To\'lov muvaffaqiyatli saqlandi!');
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount || 0) + ' UZS';
  };

  if (loading && payrollData.length === 0) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div className="dashboard-card animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Oylik Maoshlar (Payroll)</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: '500' }}>Oy:</label>
          <input 
            type="month" 
            className="auth-input" 
            value={month} 
            onChange={(e) => setMonth(e.target.value)} 
            style={{ padding: '8px 15px', width: 'auto' }}
          />
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="glass-card-static" style={{ marginBottom: '20px', padding: '15px', background: 'rgba(0,184,148,0.1)', border: '1px solid rgba(0,184,148,0.2)' }}>
        <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Restoranning jami oylik tushumi (Completed buyurtmalar bo'yicha)</h3>
        <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-green)' }}>
          {formatCurrency(totalRevenue)}
        </p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Xodim</th>
              <th>Lavozimi</th>
              <th>Oylik turi</th>
              <th>Fiks Maosh</th>
              <th>Foizdan tushum</th>
              <th>Jami Oylik</th>
              <th>To'landi</th>
              <th>Qoldiq (Qarz)</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {payrollData.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>Ushbu oy uchun ma'lumot topilmadi.</td>
              </tr>
            ) : (
              payrollData.map((row) => (
                <tr key={row.staff_id}>
                  <td style={{ fontWeight: '600' }}>{row.first_name} {row.last_name}</td>
                  <td><span className="badge badge-admin">{row.role.toUpperCase()}</span></td>
                  <td>{row.salary_type}</td>
                  <td>{formatCurrency(row.fixed_salary)}</td>
                  <td>
                    {formatCurrency(row.percentage_earned)}
                    <br/><small style={{ color: 'var(--text-secondary)' }}>({row.percentage_rate}%)</small>
                  </td>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{formatCurrency(row.total_earned)}</td>
                  <td style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>{formatCurrency(row.paid)}</td>
                  <td style={{ color: row.remaining > 0 ? 'var(--accent-red)' : 'var(--text-primary)', fontWeight: 'bold' }}>
                    {formatCurrency(row.remaining)}
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary" 
                      onClick={() => setPayModal({ open: true, staff: row, amount: row.remaining > 0 ? row.remaining : 0 })}
                      disabled={row.remaining <= 0}
                      style={{ opacity: row.remaining <= 0 ? 0.5 : 1 }}
                    >
                      To'lash
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {payModal.open && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '10px' }}>Oylik to'lash</h3>
            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
              Xodim: <b>{payModal.staff.first_name} {payModal.staff.last_name}</b><br/>
              Oy: <b>{month}</b>
            </p>
            <form onSubmit={handlePay}>
              <div className="auth-form-group">
                <label>To'lov summasi (UZS)</label>
                <input 
                  type="number" 
                  className="auth-input" 
                  required 
                  value={payModal.amount} 
                  onChange={(e) => setPayModal({...payModal, amount: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setPayModal({ open: false, staff: null, amount: '' })}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Tasdiqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
