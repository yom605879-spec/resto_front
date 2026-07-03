'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: ''
  });

  const { t, locale, changeLanguage } = useLanguage();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);
    
    // Fetch latest user info if available, or just use what we have in localStorage
    api.getOverview().then(() => {
      // getOverview isn't specifically for user info, but let's assume we can hit an endpoint
      // Actually we have `/api/auth/me` but it's not exposed in api.js currently
      // We will just use localStorage data to pre-fill
      setFormData({
        username: storedUser.username || '',
        first_name: storedUser.first_name || '',
        last_name: storedUser.last_name || '',
        email: storedUser.email || ''
      });
      setLoading(false);
    }).catch(() => {
      setFormData({
        username: storedUser.username || '',
        first_name: storedUser.first_name || '',
        last_name: storedUser.last_name || '',
        email: storedUser.email || ''
      });
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateSettings(formData);
      
      // Update local storage
      const updatedUser = { ...user, ...res.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      alert(t('settingsPage.successMsg') || 'Sozlamalar muvaffaqiyatli saqlandi!');
    } catch (err) {
      alert((t('common.error') || 'Xatolik') + ': ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>{t('settingsPage.title') || 'Umumiy Sozlamalar'}</h2>

      <div className="glass-card" style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          {t('settingsPage.systemLanguage') || 'Tizim Tili'}
        </h3>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            className={`btn ${locale === 'uz' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => changeLanguage('uz')}
          >
            O'zbekcha
          </button>
          <button 
            className={`btn ${locale === 'ru' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => changeLanguage('ru')}
          >
            Русский
          </button>
          <button 
            className={`btn ${locale === 'en' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => changeLanguage('en')}
          >
            English
          </button>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          {t('settingsPage.profileData') || "Profil Ma'lumotlari"}
        </h3>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('settingsPage.username') || 'Username'}</label>
              <input 
                type="text" 
                name="username"
                className="form-input" 
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('settingsPage.email') || 'Email'}</label>
              <input 
                type="email" 
                name="email"
                className="form-input" 
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.com"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('settingsPage.firstName') || 'Ism'}</label>
              <input 
                type="text" 
                name="first_name"
                className="form-input" 
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('settingsPage.lastName') || 'Familiya'}</label>
              <input 
                type="text" 
                name="last_name"
                className="form-input" 
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (t('settingsPage.saving') || 'Saqlanmoqda...') : (t('settingsPage.saveChanges') || "O'zgarishlarni Saqlash")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
