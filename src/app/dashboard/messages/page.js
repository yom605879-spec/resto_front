'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({ phone_number: '', message: '', customer_id: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [msgs, custs] = await Promise.all([
        api.getMessages(),
        api.getCustomers()
      ]);
      setMessages(msgs);
      setCustomers(custs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const selectedCust = customers.find(c => c.id.toString() === formData.customer_id);
      const phoneToUse = formData.phone_number || (selectedCust ? selectedCust.phone_number : '');
      
      if (!phoneToUse) {
        alert("Telefon raqamni kiriting yoki mijozni tanlang (mijozda telefon raqam bo'lishi kerak).");
        return;
      }

      await api.createMessage({
        phone_number: phoneToUse,
        message: formData.message,
        customer_id: formData.customer_id ? parseInt(formData.customer_id) : null
      });

      setFormData({ phone_number: '', message: '', customer_id: '' });
      loadData();
      alert("Xabar muvaffaqiyatli yuborildi! (Simulyatsiya)");
    } catch (err) {
      alert('Xatolik: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
      
      {/* Chap: Xabar yuborish formasi */}
      <div className="dashboard-card animate-fade-in">
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Yangi SMS Xabar</h2>
        
        <form onSubmit={handleSend}>
          <div className="auth-form-group">
            <label>Mijozni tanlang (Ixtiyoriy)</label>
            <select 
              className="auth-input" 
              value={formData.customer_id}
              onChange={(e) => {
                const id = e.target.value;
                const cust = customers.find(c => c.id.toString() === id);
                setFormData({ 
                  ...formData, 
                  customer_id: id,
                  phone_number: cust?.phone_number || '' 
                });
              }}
            >
              <option value="">-- Tanlang --</option>
              {customers.filter(c => c.phone_number).map(c => (
                <option key={c.id} value={c.id}>
                  {c.first_name || c.username} ({c.phone_number})
                </option>
              ))}
            </select>
          </div>

          <div className="auth-form-group">
            <label>Telefon raqam</label>
            <input 
              type="text" 
              className="auth-input" 
              placeholder="+998901234567"
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              required
            />
          </div>

          <div className="auth-form-group">
            <label>Xabar matni</label>
            <textarea 
              className="auth-input" 
              style={{ minHeight: '100px', resize: 'vertical' }}
              placeholder="Hurmatli mijoz..."
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={sending}>
            {sending ? 'Yuborilmoqda...' : 'SMS Yuborish'}
          </button>
        </form>
      </div>

      {/* O'ng: Yuborilgan xabarlar tarixi */}
      <div className="dashboard-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Yuborilgan Xabarlar Tarixi</h2>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Telefon</th>
                <th style={{ width: '50%' }}>Xabar</th>
                <th>Holat</th>
                <th>Sana</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                    Hali xabarlar yuborilmagan.
                  </td>
                </tr>
              ) : (
                messages.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: '500' }}>{m.phone_number}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{m.message}</td>
                    <td>
                      <span className={`badge ${m.status === 'sent' ? 'badge-paid' : 'badge-cancelled'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td>{new Date(m.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
