'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

export default function StaffPage() {
  const { t } = useLanguage();
  const [staffList, setStaffList] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    telegram_id: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    role: 'ofitsiant',
    salary_type: 'fixed',
    fixed_salary: 0,
    percentage_rate: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffData, pendingData] = await Promise.all([
        api.getStaff().catch(() => ({ users: [] })),
        api.getPendingUsers().catch(() => ({ users: [] }))
      ]);
      
      // Filter out 'mijoz' and unapproved users for the main staff list
      let staffArray = staffData.users || staffData.staff || staffData || [];
      if (Array.isArray(staffArray)) {
        staffArray = staffArray.filter(u => u.is_approved && u.is_active && u.role !== 'mijoz');
      } else {
        staffArray = [];
      }
      
      setStaffList(staffArray);
      setPendingList(pendingData.users || pendingData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.approveUser(id);
      loadData();
      alert('Xodim tasdiqlandi!');
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Haqiqatan ham bu so\'rovni rad etmoqchimisiz?')) return;
    try {
      await api.rejectUser(id);
      loadData();
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  const [formError, setFormError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Client-side username validation
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setFormError("Username faqat harflar, raqamlar va _ belgisidan iborat bo'lishi kerak (email kiritish mumkin emas).");
      return;
    }
    if (formData.password.length < 4) {
      setFormError("Parol kamida 4 belgidan iborat bo'lishi kerak.");
      return;
    }

    try {
      await api.createStaff({
        ...formData,
        fixed_salary: parseFloat(formData.fixed_salary) || 0,
        percentage_rate: parseFloat(formData.percentage_rate) || 0,
        telegram_id: formData.telegram_id || null,
      });
      setIsModalOpen(false);
      setFormData({ telegram_id: '', username: '', first_name: '', last_name: '', password: '', role: 'ofitsiant', salary_type: 'fixed', fixed_salary: 0, percentage_rate: 0 });
      setFormError('');
      loadData();
      alert("Xodim muvaffaqiyatli qo'shildi!");
    } catch (err) {
      // Show exact backend error message
      setFormError(err.message || 'Xatolik yuz berdi.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Haqiqatan ham ushbu xodimni o\'chirmoqchimisiz?')) return;
    try {
      await api.deleteStaff(id);
      loadData();
    } catch (err) {
      alert('O\'chirishda xatolik: ' + err.message);
    }
  };

  const getRoleBadge = (role) => {
    const roles = {
      admin: 'badge-admin',
      kassir: 'badge-cashier',
      oshpaz: 'badge-chef',
      ofitsiant: 'badge-waiter'
    };
    return roles[role] || 'badge-new';
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{t('staffPage.title') || 'Xodimlar Boshqaruvi'}</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>{t('staffPage.addStaff') || '+ Yangi Xodim'}</button>
      </div>

      {pendingList.length > 0 && (
        <div className="glass-card-static" style={{ marginBottom: '30px', borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#f59e0b' }}>
            {t('staffPage.pendingApprovals') || 'Tasdiqlash kutilmoqda'} ({pendingList.length})
          </h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('staffPage.fullName') || 'F.I.Sh'}</th>
                  <th>{t('staffPage.username') || 'Username'}</th>
                  <th>{t('staffPage.role') || 'Lavozimi'}</th>
                  <th>{t('staffPage.telegramId') || 'Telegram ID'}</th>
                  <th>{t('staffPage.status') || "Ro'yxatdan o'tgan"}</th>
                  <th>{t('staffPage.actions') || 'Amallar'}</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: '600' }}>{user.first_name} {user.last_name}</td>
                    <td>@{user.username}</td>
                    <td>
                      <span className={`badge ${getRoleBadge(user.role)}`}>
                        {t('common.roles.' + user.role) || user.role.toUpperCase()}
                      </span>
                    </td>
                    <td>{user.telegram_id || '-'}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-sm btn-green" onClick={() => handleApprove(user.id)}>
                        {t('staffPage.approve') || 'Tasdiqlash'}
                      </button>
                      <button className="btn btn-sm btn-red" onClick={() => handleReject(user.id)}>
                        {t('staffPage.reject') || 'Rad etish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="glass-card-static">
        {staffList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">{t('staffPage.noStaff') || "Xodimlar yo'q"}</div>
            <div className="empty-state-desc">{t('staffPage.noStaffDesc') || "Hali birorta ham xodim qo'shilmagan"}</div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('staffPage.fullName') || 'F.I.Sh'}</th>
                  <th>{t('staffPage.username') || 'Username'}</th>
                  <th>{t('staffPage.role') || 'Lavozimi'}</th>
                  <th>{t('staffPage.telegramId') || 'Telegram ID'}</th>
                  <th>{t('staffPage.status') || 'Holati'}</th>
                  <th>{t('staffPage.actions') || 'Amallar'}</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff.id}>
                    <td style={{ fontWeight: '600' }}>{staff.first_name} {staff.last_name}</td>
                    <td>@{staff.username}</td>
                    <td>
                      <span className={`badge ${getRoleBadge(staff.role)}`}>
                        {t('common.roles.' + staff.role) || staff.role.toUpperCase()}
                      </span>
                    </td>
                    <td>{staff.telegram_id || '-'}</td>
                    <td>
                      <span className={`badge ${staff.is_active ? 'badge-ready' : 'badge-cancelled'}`}>
                        {staff.is_active ? (t('staffPage.active') || 'Faol') : (t('staffPage.inactive') || 'Nofaol')}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-red" onClick={() => handleDelete(staff.id)}>
                        {t('common.delete') || "O'chirish"}
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
              <h3 className="modal-title">Yangi Xodim Qo'shish</h3>
              <button className="modal-close" onClick={() => { setIsModalOpen(false); setFormError(''); }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>

              {/* Error message display */}
              {formError && (
                <div style={{
                  background: 'rgba(225,112,85,0.15)',
                  border: '1px solid var(--accent-red)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  color: 'var(--accent-red)',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  ⚠️ {formError}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ism</label>
                  <input type="text" name="first_name" className="form-input" value={formData.first_name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Familiya</label>
                  <input type="text" name="last_name" className="form-input" value={formData.last_name} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Username <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '400' }}>(faqat harf, raqam va _)</span></label>
                  <input
                    type="text"
                    name="username"
                    className="form-input"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="masalan: ali_waiter"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Parol <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '400' }}>(min. 4 belgi)</span></label>
                  <input type="password" name="password" className="form-input" value={formData.password} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Telegram ID (ixtiyoriy)</label>
                  <input type="text" name="telegram_id" className="form-input" value={formData.telegram_id} onChange={handleInputChange} placeholder="masalan: 543665123" />
                </div>
                <div className="form-group">
                  <label className="form-label">Lavozimi</label>
                  <select name="role" className="form-select" value={formData.role} onChange={handleInputChange}>
                    <option value="admin">Admin</option>
                    <option value="kassir">Kassir</option>
                    <option value="oshpaz">Oshpaz</option>
                    <option value="ofitsiant">Ofitsiant</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Oylik turi</label>
                  <select name="salary_type" className="form-select" value={formData.salary_type} onChange={handleInputChange}>
                    <option value="fixed">Fiks (Qat'iy oylik)</option>
                    <option value="percentage">Foiz (Buyurtmalardan)</option>
                    <option value="both">Ikkalasi (Fiks + Foiz)</option>
                  </select>
                </div>
              </div>
              {['fixed', 'both'].includes(formData.salary_type) && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Fiks maosh summasi (UZS)</label>
                    <input type="number" name="fixed_salary" className="form-input" value={formData.fixed_salary} onChange={handleInputChange} min="0" />
                  </div>
                </div>
              )}
              {['percentage', 'both'].includes(formData.salary_type) && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Foiz stavkasi (%)</label>
                    <input type="number" step="0.01" name="percentage_rate" className="form-input" value={formData.percentage_rate} onChange={handleInputChange} placeholder="Masalan: 5 yoki 10.5" min="0" max="100" />
                  </div>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => { setIsModalOpen(false); setFormError(''); }}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
