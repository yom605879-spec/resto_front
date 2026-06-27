'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createTask({
        title: formData.title,
        description: formData.description
      });
      setShowModal(false);
      setFormData({ title: '', description: '' });
      loadTasks();
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.updateTaskStatus(id, status);
      loadTasks();
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Vazifalar (Kanselyariya/Ishlar)</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Yangi Vazifa</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Pending */}
        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--accent-red)' }}>🔴 Yangi / Bajarilmagan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tasks.filter(t => t.status === 'pending').map(t => (
              <div key={t.id} style={{ padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '3px solid var(--accent-red)' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '5px' }}>{t.title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>{t.description}</p>
                <button className="btn btn-sm btn-primary" onClick={() => updateStatus(t.id, 'in_progress')}>Boshlash ➡️</button>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress */}
        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <h3 style={{ marginBottom: '15px', color: '#f5a623' }}>🟡 Bajarilmoqda</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tasks.filter(t => t.status === 'in_progress').map(t => (
              <div key={t.id} style={{ padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '3px solid #f5a623' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '5px' }}>{t.title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>{t.description}</p>
                <button className="btn btn-sm btn-primary" style={{ background: 'var(--accent-green)', border: 'none' }} onClick={() => updateStatus(t.id, 'completed')}>Tugatish ✅</button>
              </div>
            ))}
          </div>
        </div>

        {/* Completed */}
        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--accent-green)' }}>🟢 Bajarilgan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tasks.filter(t => t.status === 'completed').map(t => (
              <div key={t.id} style={{ padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '3px solid var(--accent-green)', opacity: 0.7 }}>
                <h4 style={{ fontSize: '15px', marginBottom: '5px', textDecoration: 'line-through' }}>{t.title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '20px' }}>Yangi vazifa</h3>
            <form onSubmit={handleCreate}>
              <div className="auth-form-group">
                <label>Vazifa nomi (Sarlavha)</label>
                <input type="text" className="auth-input" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="auth-form-group">
                <label>Batafsil tushuntirish</label>
                <textarea className="auth-input" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Qo'shish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
