'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateValue, translateRole } from '@/lib/translateValue';

export default function PayrollPage() {
  const { locale } = useLanguage();
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

  const PL = {
    uz: { title: 'Oylik Maoshlar', monthLabel: 'Oy', revenueDesc: "Restoranning jami oylik tushumi", staff: 'Xodim', role: 'Lavozimi', salaryType: 'Oylik turi', fixed: 'Fiks Maosh', fromPct: 'Foizdan tushum', total: 'Jami Oylik', paid: "To'landi", remaining: 'Qoldiq (Qarz)', actions: 'Amallar', noData: "Ushbu oy uchun ma'lumot topilmadi.", payTitle: "Oylik to'lash", staff2: 'Xodim', month2: 'Oy', payLabel: "To'lov summasi (UZS)", cancelBtn: 'Bekor qilish', confirmBtn: 'Tasdiqlash', payBtn: "To'lash" },
    ru: { title: 'Зарплаты (Payroll)', monthLabel: 'Месяц', revenueDesc: 'Общий месячный доход ресторана', staff: 'Сотрудник', role: 'Должность', salaryType: 'Тип зарплаты', fixed: 'Оклад', fromPct: 'С процентов', total: 'Итого зарплата', paid: 'Выплачено', remaining: 'Остаток (Долг)', actions: 'Действия', noData: 'Данных за этот месяц нет.', payTitle: 'Выплата зарплаты', staff2: 'Сотрудник', month2: 'Месяц', payLabel: 'Сумма выплаты (UZS)', cancelBtn: 'Отмена', confirmBtn: 'Подтвердить', payBtn: 'Выплатить' },
    en: { title: 'Payroll', monthLabel: 'Month', revenueDesc: 'Total monthly restaurant revenue', staff: 'Employee', role: 'Role', salaryType: 'Salary Type', fixed: 'Fixed Salary', fromPct: 'From %', total: 'Total Salary', paid: 'Paid', remaining: 'Remaining (Debt)', actions: 'Actions', noData: 'No data for this month.', payTitle: 'Pay Salary', staff2: 'Employee', month2: 'Month', payLabel: 'Payment Amount (UZS)', cancelBtn: 'Cancel', confirmBtn: 'Confirm', payBtn: 'Pay' },
  };
  const pl = PL[locale] || PL.uz;

  return (
    <div className="dashboard-card animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{pl.title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: '500' }}>{pl.monthLabel}:</label>
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
        <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>{pl.revenueDesc}</h3>
        <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-green)' }}>
          {formatCurrency(totalRevenue)}
        </p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>{pl.staff}</th>
              <th>{pl.role}</th>
              <th>{pl.salaryType}</th>
              <th>{pl.fixed}</th>
              <th>{pl.fromPct}</th>
              <th>{pl.total}</th>
              <th>{pl.paid}</th>
              <th>{pl.remaining}</th>
              <th>{pl.actions}</th>
            </tr>
          </thead>
          <tbody>
            {payrollData.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>{pl.noData}</td>
              </tr>
            ) : (
              payrollData.map((row) => (
                <tr key={row.staff_id}>
                  <td style={{ fontWeight: '600' }}>{row.first_name} {row.last_name}</td>
                  <td><span className="badge badge-admin">{translateRole(row.role, locale)}</span></td>
                  <td>{translateValue('salaryType', row.salary_type, locale)}</td>
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
                      {pl.payBtn}
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
            <h3 style={{ marginBottom: '10px' }}>{pl.payTitle}</h3>
            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
              {pl.staff2}: <b>{payModal.staff.first_name} {payModal.staff.last_name}</b><br/>
              {pl.month2}: <b>{month}</b>
            </p>
            <form onSubmit={handlePay}>
              <div className="auth-form-group">
                <label>{pl.payLabel}</label>
                <input 
                  type="number" 
                  className="auth-input" 
                  required 
                  value={payModal.amount} 
                  onChange={(e) => setPayModal({...payModal, amount: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setPayModal({ open: false, staff: null, amount: '' })}>{pl.cancelBtn}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{pl.confirmBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
