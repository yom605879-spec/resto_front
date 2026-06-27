'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Oziq-ovqat',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Oziq-ovqat', 'Maosh', 'Ijara', 'Kommunal', 'Soliq', 'Boshqa'];

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await api.getExpenses();
      setExpenses(data.expenses || data || []);
    } catch (err) {
      console.error(err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setIsModalOpen(false);
      setFormData({
        category: 'Oziq-ovqat',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      loadExpenses();
      alert('Xarajat muvaffaqiyatli saqlandi!');
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Haqiqatan ham ushbu xarajatni o\'chirmoqchimisiz?')) return;
    try {
      await api.deleteExpense(id);
      loadExpenses();
    } catch (err) {
      alert('O\'chirishda xatolik: ' + err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount || 0) + ' UZS';
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Xarajatlar Nazorati</h2>
        <button className="btn btn-red" onClick={() => setIsModalOpen(true)}>+ Yangi Xarajat</button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="glass-card animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '3px solid var(--accent-red)' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>Jami Xarajatlar</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-red)' }}>{formatCurrency(totalExpenses)}</div>
          </div>
          <div style={{ fontSize: '30px', background: 'rgba(225,112,85,0.1)', padding: '15px', borderRadius: '50%' }}>📉</div>
        </div>
      </div>

      <div className="glass-card-static">
        {expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💸</div>
            <div className="empty-state-title">Xarajatlar yo'q</div>
            <div className="empty-state-desc">Hali birorta ham xarajat yozilmagan</div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Sana</th>
                  <th>Kategoriya</th>
                  <th>Summa</th>
                  <th>Izoh</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        {expense.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--accent-red)' }}>
                      -{formatCurrency(expense.amount)}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{expense.description || '-'}</td>
                    <td>
                      <button className="btn btn-sm btn-ghost" style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }} onClick={() => handleDelete(expense.id)}>
                        O'chirish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Xarajatni Kiritish</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Kategoriya</label>
                <select name="category" className="form-select" value={formData.category} onChange={handleInputChange}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Summa (UZS)</label>
                  <input type="number" name="amount" className="form-input" value={formData.amount} onChange={handleInputChange} required min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Sana</label>
                  <input type="date" name="date" className="form-input" value={formData.date} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Izoh (ixtiyoriy)</label>
                <input type="text" name="description" className="form-input" value={formData.description} onChange={handleInputChange} placeholder="Nima uchun xarajat qilindi?" />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className="btn btn-red">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
