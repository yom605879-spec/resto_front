'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getUser } from '@/lib/auth';

const LANG_OPTIONS = [
  { code: 'uz', flag: '🇺🇿', label: "O'zbek", descKey: "profile.workInUz" },
  { code: 'ru', flag: '🇷🇺', label: 'Русский', descKey: "profile.workInRu" },
  { code: 'en', flag: '🇬🇧', label: 'English', descKey: "profile.workInEn" },
];

export default function ProfilePage() {
  const { t, locale, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cachedUser = getUser();
    if (cachedUser) {
      setUser(cachedUser);
    }
  }, []);

  const initials = `${(user?.first_name || '')[0] || ''}${(user?.last_name || '')[0] || ''}`.toUpperCase() || 'U';

  const formatRole = (role) => {
    return t('common.roles.' + role) || role;
  };

  return (
    <div className="profile-container animate-fade-in">
      <div className="profile-header">
        <h2 className="section-title">{t('profile.title') || 'Profil va Sozlamalar'}</h2>
        <p className="section-subtitle">{t('profile.subtitle') || "Shaxsiy ma'lumotlar va platforma sozlamalarini boshqarish"}</p>
      </div>

      <div className="profile-grid">
        {/* User Info Card */}
        <div className="profile-card user-card">
          <div className="user-avatar-large">
            {initials}
          </div>
          <div className="user-details">
            <h3>{user?.first_name} {user?.last_name}</h3>
            <p className="user-role-badge">{formatRole(user?.role)}</p>
            <div className="user-info-list">
              <div className="info-item">
                <span className="info-icon">📞</span>
                <div>
                  <div className="info-label">{t('profile.phoneUsername') || 'Telefon / Username'}</div>
                  <div className="info-value">{user?.username || '+998 ** *** ** **'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <div className="profile-card settings-card">
          <h3 className="card-title">{t('profile.platformSettings') || 'Platforma Sozlamalari'}</h3>
          
          <div className="settings-group">
            <div className="settings-header">
              <span className="settings-icon">🌓</span>
              <div>
                <h4>{t('profile.systemTheme') || 'Tizim Mavzusi'}</h4>
                <p>{t('profile.themeDesc') || "Yorug' yoki qorong'u rejimni tanlang"}</p>
              </div>
            </div>
            <div className="theme-switcher">
              <button 
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => theme !== 'light' && toggleTheme()}
              >
                <span className="theme-btn-icon">☀️</span>
                {t('profile.lightMode') || "Yorug' (Light)"}
              </button>
              <button 
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => theme !== 'dark' && toggleTheme()}
              >
                <span className="theme-btn-icon">🌙</span>
                {t('profile.darkMode') || "Qorong'u (Dark)"}
              </button>
            </div>
          </div>

          <div className="settings-divider"></div>

          <div className="settings-group">
            <div className="settings-header">
              <span className="settings-icon">🌍</span>
              <div>
                <h4>{t('profile.systemLanguage') || 'Tizim Tili'}</h4>
                <p>{t('profile.languageDesc') || "O'zingizga qulay tilni tanlang"}</p>
              </div>
            </div>
            <div className="lang-grid">
              {LANG_OPTIONS.map(lang => (
                <button
                  key={lang.code}
                  className={`lang-option-btn ${locale === lang.code ? 'active' : ''}`}
                  onClick={() => changeLanguage(lang.code)}
                >
                  <div className="lang-option-flag">{lang.flag}</div>
                  <div className="lang-option-text">
                    <div className="lang-option-label">{lang.label}</div>
                    <div className="lang-option-desc">{t(lang.descKey)}</div>
                  </div>
                  {locale === lang.code && (
                    <div className="lang-option-check">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
