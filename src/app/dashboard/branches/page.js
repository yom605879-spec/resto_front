'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const data = await api.getBranches();
      setBranches(data.branches || []);
    } catch (err) {
      console.error(err);
      alert('Filiallarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;

    try {
      await api.addBranch({ name: newBranchName });
      setIsModalOpen(false);
      setNewBranchName('');
      loadBranches();
      alert('Yangi filial muvaffaqiyatli qo\'shildi!');
    } catch (err) {
      alert('Filial qo\'shishda xatolik: ' + err.message);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Filiallar Boshqaruvi</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Yangi Filial</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {branches.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>Filiallar topilmadi</div>
        ) : (
          branches.map((branch) => (
            <div key={branch.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '30px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '50%' }}>🏢</div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>{branch.name}</h3>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Yaratilgan: {new Date(branch.created_at).toLocaleDateString()}
                </div>
                <div style={{ marginTop: '5px' }}>
                  <span className={`badge ${branch.is_active ? 'badge-ready' : 'badge-cancelled'}`}>
                    {branch.is_active ? 'Faol' : 'Nofaol'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Yangi Filial Qo'shish</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAddBranch}>
              <div className="form-group">
                <label className="form-label">Filial nomi (Restoran nomi)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newBranchName} 
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="Masalan: Chilonzor filiali"
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
