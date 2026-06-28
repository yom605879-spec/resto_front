'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getToken, saveUser, removeToken, getUser, getDefaultRoute } from '@/lib/auth';

const ROLE_LABELS_UZ = {
  boss: 'Boss',
  admin: 'Admin',
  kassir: 'Kassir',
  oshpaz: 'Oshpaz',
  ofitsiant: 'Ofitsiant',
  mijoz: 'Mijoz',
};

const NAV_ITEMS = {
  boss: [
    { href: '/dashboard', t_key: 'sidebar.dashboard', icon: '📈' },
    { href: '/dashboard/finance', t_key: 'sidebar.expenses', icon: '💰' },
    { href: '/dashboard/staff', t_key: 'sidebar.staff', icon: '👥' },
    { href: '/dashboard/payroll', label: 'Oylik Maosh', icon: '💸' },
    { href: '/dashboard/menu', t_key: 'sidebar.menu', icon: '🍽️' },
    { href: '/dashboard/branches', label: 'Filial Boshqaruv', icon: '🏢' }, // No translation yet, fallback to label if t_key is missing
    { href: '/dashboard/settings', label: 'Platforma Sozlama', icon: '⚙️' },
  ],
  admin: [
    { href: '/dashboard', t_key: 'sidebar.dashboard', icon: '📈' },
    { href: '/dashboard/staff', t_key: 'sidebar.staff', icon: '👥' },
    { href: '/dashboard/payroll', label: 'Oylik Maosh', icon: '💸' },
    { href: '/dashboard/customers', t_key: 'sidebar.customers', icon: '👥' },
  ],
  kassir: [
    { href: '/dashboard/payments', t_key: 'sidebar.payments', icon: '💵' },
    { href: '/dashboard/receipts', label: 'Chek Chiqarish', icon: '🧾' },
    { href: '/dashboard/refunds', t_key: 'sidebar.refunds', icon: '↩️' },
    { href: '/dashboard/reports-daily', t_key: 'sidebar.reportsDaily', icon: '📊' },
    { href: '/dashboard/discounts', t_key: 'sidebar.discounts', icon: '🏷️' },
    { href: '/dashboard/payment-history', t_key: 'sidebar.paymentHistory', icon: '⏳' },
  ],
  oshpaz: [
    { href: '/dashboard/kitchen', label: 'Buyurtma Ko\'rish', icon: '🍳' },
    { href: '/dashboard/inventory', t_key: 'sidebar.inventory', icon: '📦' },
    { href: '/dashboard/tasks', t_key: 'sidebar.tasks', icon: '📋' },
    { href: '/dashboard/schedule', t_key: 'sidebar.schedule', icon: '📅' },
  ],
  ofitsiant: [
    { href: '/dashboard/tables-view', label: 'Stollar Xaritasi', icon: '🪑' },
    { href: '/dashboard/order-take', label: 'Buyurtma Olish', icon: '📝' },
    { href: '/dashboard/orders', label: 'Buyurtmalarim', icon: '📋' },
  ],
  mijoz: [
    { href: '/dashboard/menu-view', t_key: 'sidebar.menuView', icon: '🍔' },
    { href: '/dashboard/my-orders', t_key: 'sidebar.myOrders', icon: '📍' },
    { href: '/dashboard/payments-client', t_key: 'sidebar.paymentsClient', icon: '💳' },
    { href: '/dashboard/reviews', t_key: 'sidebar.reviews', icon: '⭐' },
  ],
};

import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const LANG_OPTIONS = [
  { code: 'uz', flag: '🇺🇿', label: "O'zbek" },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
];

function LangSwitcher({ locale, changeLanguage }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANG_OPTIONS.find(l => l.code === locale) || LANG_OPTIONS[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          padding: '8px 14px', borderRadius: '12px',
          border: '1px solid var(--border-color-light)',
          background: open ? 'rgba(var(--primary-rgb),0.12)' : 'var(--bg-input)',
          color: 'var(--text-primary)', cursor: 'pointer',
          fontSize: '14px', fontWeight: 600,
          transition: 'all 0.2s', fontFamily: 'inherit',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'rgba(var(--primary-rgb),0.08)'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = open ? 'rgba(var(--primary-rgb),0.12)' : 'var(--bg-input)'; }}
      >
        <span style={{ fontSize: '18px', lineHeight: 1 }}>{current.flag}</span>
        <span className="lang-code-text">{current.code.toUpperCase()}</span>
        <span style={{
          fontSize: '10px', opacity: 0.5,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          display: 'inline-block',
        }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'var(--bg-secondary)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '14px', padding: '6px',
          minWidth: '160px', zIndex: 200,
          boxShadow: '0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,107,239,0.15)',
          backdropFilter: 'blur(20px)',
          animation: 'dropIn 0.18s cubic-bezier(0.16,1,0.3,1) forwards',
        }}>
          {LANG_OPTIONS.map(lang => (
            <button
              key={lang.code}
              onClick={() => { changeLanguage(lang.code); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '9px 12px', borderRadius: '10px',
                border: 'none',
                background: locale === lang.code ? 'rgba(124,107,239,0.18)' : 'transparent',
                color: locale === lang.code ? 'var(--primary-light)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '14px', fontWeight: locale === lang.code ? 700 : 500,
                transition: 'all 0.15s', fontFamily: 'inherit',
                textAlign: 'left',
              }}
              onMouseEnter={e => { if (locale !== lang.code) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { if (locale !== lang.code) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '20px' }}>{lang.flag}</span>
              <div>
                <div style={{ fontSize: '13px' }}>{lang.label}</div>
                <div style={{ fontSize: '11px', opacity: 0.5 }}>{lang.code.toUpperCase()}</div>
              </div>
              {locale === lang.code && <span style={{ marginLeft: 'auto', color: 'var(--primary-light)', fontSize: '12px' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t, locale, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    api.getMe()
      .then((data) => {
        const userData = data.user || data;
        setUser(userData);
        saveUser(userData);
        setLoading(false);
        
        // Agar foydalanuvchi to'g'ridan-to'g'ri /dashboard ga kirsayu, ruxsati bo'lmasa:
        if (pathname === '/dashboard' && userData.role !== 'boss' && userData.role !== 'admin') {
          router.push(getDefaultRoute(userData.role));
        }
      })
      .catch((err) => {
        const msg = err.message || '';
        // Agar token noto'g'ri bo'lsa yoki topilmasa, chiqib ketish
        if (msg.includes('Access denied') || msg.includes('Foydalanuvchi topilmadi') || msg.includes('Authentication') || msg.includes('Token')) {
          removeToken();
          router.push('/login');
        } else {
          // Aks holda bu internet yoki server xatosi bo'lishi mumkin.
          // Keshdagi foydalanuvchini olamiz, agar bor bo'lsa tizimga kiritaveramiz.
          const cachedUser = getUser();
          if (cachedUser) {
            setUser(cachedUser);
            setLoading(false);
          } else {
            router.push('/login');
          }
        }
      });
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
      </div>
    );
  }

  const role = user?.role || 'boss';
  const navItems = NAV_ITEMS[role] || NAV_ITEMS.boss;
  const initials = `${(user?.first_name || '')[0] || ''}${(user?.last_name || '')[0] || ''}`.toUpperCase() || 'U';
  const roleLabel = ROLE_LABELS_UZ[role] || role;

  const getPageTitle = () => {
    const currentItem = navItems.find(i => i.href === pathname);
    if (currentItem && currentItem.t_key) {
      return t(currentItem.t_key);
    }
    if (currentItem) return currentItem.label;
    return 'Dashboard';
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile sidebar toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">✦ Restaran</div>
          <div className="sidebar-role">{t('common.role')}: {roleLabel}</div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Navigation</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.t_key ? t(item.t_key) : item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="sidebar-user-role">{roleLabel}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            {t('common.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-page-title animate-fade-in-down">{getPageTitle()}</h1>
            <p className="dashboard-page-subtitle animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {new Date().toLocaleDateString(locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LangSwitcher locale={locale} changeLanguage={changeLanguage} />
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? "Light modega o'tish" : "Dark modega o'tish"}
            >
              <span className="theme-toggle-icon theme-toggle-icon-moon">🌙</span>
              <span className="theme-toggle-icon theme-toggle-icon-sun">☀️</span>
            </button>
          </div>
        </header>
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
