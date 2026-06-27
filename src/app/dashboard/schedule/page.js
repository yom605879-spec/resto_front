'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ staff_id: '', shift_date: '', start_time: '08:00', end_time: '20:00', role_shift: 'Kunduzgi' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [scheds, stf] = await Promise.all([
        api.getSchedule(),
        api.getStaff()
      ]);
      setSchedules(scheds);
      setStaff(stf);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createSchedule({
        staff_id: parseInt(formData.staff_id),
        shift_date: formData.shift_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        role_shift: formData.role_shift
      });
      setShowModal(false);
      loadData();
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div className="dashboard-card animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Xodimlar Ish Jadvali (Grafik)</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Jadval Qo'shish</button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Sana</th>
              <th>Xodim</th>
              <th>Rol (Lavozimi)</th>
              <th>Smena</th>
              <th>Vaqt (dan - gacha)</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  Hali ish jadvali tuzilmagan.
                </td>
              </tr>
            ) : (
              schedules.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 'bold' }}>{new Date(s.shift_date).toLocaleDateString()}</td>
                  <td>{s.first_name} {s.last_name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{s.role}</td>
                  <td><span className="badge badge-new">{s.role_shift}</span></td>
                  <td>{s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '20px' }}>Yangi jadval qo'shish</h3>
            <form onSubmit={handleCreate}>
              <div className="auth-form-group">
                <label>Xodim</label>
                <select className="auth-input" required value={formData.staff_id} onChange={(e) => setFormData({...formData, staff_id: e.target.value})}>
                  <option value="">Tanlang</option>
                  {staff.map(st => (
                    <option key={st.id} value={st.id}>{st.first_name || st.username} ({st.role})</option>
                  ))}
                </select>
              </div>
              <div className="auth-form-group">
                <label>Sana</label>
                <input type="date" className="auth-input" required value={formData.shift_date} onChange={(e) => setFormData({...formData, shift_date: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="auth-form-group" style={{ flex: 1 }}>
                  <label>Boshlanish</label>
                  <input type="time" className="auth-input" required value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                </div>
                <div className="auth-form-group" style={{ flex: 1 }}>
                  <label>Tugash</label>
                  <input type="time" className="auth-input" required value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
                </div>
              </div>
              <div className="auth-form-group">
                <label>Smena nomi (Masalan: Kunduzgi, Tungi)</label>
                <input type="text" className="auth-input" required value={formData.role_shift} onChange={(e) => setFormData({...formData, role_shift: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
