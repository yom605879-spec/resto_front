'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateValue } from '@/lib/translateValue';

export default function ExpensesPage() {
  const { locale } = useLanguage();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Oziq-ovqat',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Category keys (stored in DB as Uzbek keys, displayed translated)
  const categoryKeys = ['Oziq-ovqat', 'Maosh', 'Ijara', 'Kommunal', 'Soliq', 'Boshqa'];

  const L = {
    uz: {
      title: 'Xarajatlar Nazorati', addBtn: '+ Yangi Xarajat', totalLabel: 'Jami Xarajatlar',
      empty: "Xarajatlar yo'q", emptyDesc: 'Hali birorta ham xarajat yozilmagan',
      colDate: 'Sana', colCategory: 'Kategoriya', colAmount: 'Summa', colDesc: 'Izoh', colActions: 'Amallar',
      deleteBtn: "O'chirish", modalTitle: 'Xarajatni Kiritish',
      labelCategory: 'Kategoriya', labelAmount: 'Summa (UZS)', labelDate: 'Sana',
      labelDesc: 'Izoh (ixtiyoriy)', descPlaceholder: 'Nima uchun xarajat qilindi?',
      cancelBtn: 'Bekor qilish', saveBtn: 'Saqlash',
      confirmDelete: "Haqiqatan ham ushbu xarajatni o'chirmoqchimisiz?",
      savedOk: 'Xarajat muvaffaqiyatli saqlandi!', saveFail: 'Xatolik: ', deleteFail: "O'chirishda xatolik: ",
    },
    ru: {
      title: 'Контроль расходов', addBtn: '+ Новый расход', totalLabel: 'Общие расходы',
      empty: 'Расходов нет', emptyDesc: 'Ни одного расхода ещё не записано',
      colDate: 'Дата', colCategory: 'Категория', colAmount: 'Сумма', colDesc: 'Описание', colActions: 'Действия',
      deleteBtn: 'Удалить', modalTitle: 'Добавить расход',
      labelCategory: 'Категория', labelAmount: 'Сумма (UZS)', labelDate: 'Дата',
      labelDesc: 'Описание (опционально)', descPlaceholder: 'На что потрачено?',
      cancelBtn: 'Отмена', saveBtn: 'Сохранить',
      confirmDelete: 'Действительно удалить этот расход?',
      savedOk: 'Расход успешно сохранён!', saveFail: 'Ошибка: ', deleteFail: 'Ошибка удаления: ',
    },
    en: {
      title: 'Expense Tracker', addBtn: '+ New Expense', totalLabel: 'Total Expenses',
      empty: 'No expenses', emptyDesc: 'No expenses have been recorded yet',
      colDate: 'Date', colCategory: 'Category', colAmount: 'Amount', colDesc: 'Description', colActions: 'Actions',
      deleteBtn: 'Delete', modalTitle: 'Add Expense',
      labelCategory: 'Category', labelAmount: 'Amount (UZS)', labelDate: 'Date',
      labelDesc: 'Description (optional)', descPlaceholder: 'What was the expense for?',
      cancelBtn: 'Cancel', saveBtn: 'Save',
      confirmDelete: 'Are you sure you want to delete this expense?',
      savedOk: 'Expense saved successfully!', saveFail: 'Error: ', deleteFail: 'Delete error: ',
    },
  };
  const lbl = L[locale] || L.uz;

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
      alert(lbl.savedOk);
    } catch (err) {
      alert(lbl.saveFail + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(lbl.confirmDelete)) return;
    try {
      await api.deleteExpense(id);
      loadExpenses();
    } catch (err) {
      alert(lbl.deleteFail + err.message);
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
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{lbl.title}</h2>
        <button className="btn btn-red" onClick={() => setIsModalOpen(true)}>{lbl.addBtn}</button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="glass-card animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '3px solid var(--accent-red)' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>{lbl.totalLabel}</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-red)' }}>{formatCurrency(totalExpenses)}</div>
          </div>
          <div style={{ fontSize: '30px', background: 'rgba(225,112,85,0.1)', padding: '15px', borderRadius: '50%' }}>📉</div>
        </div>
      </div>

      <div className="glass-card-static">
        {expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💸</div>
            <div className="empty-state-title">{lbl.empty}</div>
            <div className="empty-state-desc">{lbl.emptyDesc}</div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{lbl.colDate}</th>
                  <th>{lbl.colCategory}</th>
                  <th>{lbl.colAmount}</th>
                  <th>{lbl.colDesc}</th>
                  <th>{lbl.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        {translateValue('expenseCategory', expense.category, locale)}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--accent-red)' }}>
                      -{formatCurrency(expense.amount)}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{expense.description || '-'}</td>
                    <td>
                      <button className="btn btn-sm btn-ghost" style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }} onClick={() => handleDelete(expense.id)}>
                        {lbl.deleteBtn}
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
              <h3 className="modal-title">{lbl.modalTitle}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{lbl.labelCategory}</label>
                <select name="category" className="form-select" value={formData.category} onChange={handleInputChange}>
                  {categoryKeys.map(c => (
                    <option key={c} value={c}>
                      {translateValue('expenseCategory', c, locale)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{lbl.labelAmount}</label>
                  <input type="number" name="amount" className="form-input" value={formData.amount} onChange={handleInputChange} required min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">{lbl.labelDate}</label>
                  <input type="date" name="date" className="form-input" value={formData.date} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{lbl.labelDesc}</label>
                <input type="text" name="description" className="form-input" value={formData.description} onChange={handleInputChange} placeholder={lbl.descPlaceholder} />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>{lbl.cancelBtn}</button>
                <button type="submit" className="btn btn-red">{lbl.saveBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
