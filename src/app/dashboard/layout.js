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
    <div className="dashboard-layout" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Slider */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: '#000' }}>
        <div className="bg-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="bg-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1920&q=80')", animationDelay: '6s' }} />
        <div className="bg-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1920&q=80')", animationDelay: '12s' }} />
        <div className="bg-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1920&q=80')", animationDelay: '18s' }} />
        <div className="bg-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=1920&q=80')", animationDelay: '24s' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10, 10, 15, 0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}/>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bg-slide {
          position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0; animation: crossfade 30s infinite;
        }
        @keyframes crossfade { 0% { opacity: 0; transform: scale(1.05); } 10%, 25% { opacity: 1; transform: scale(1); } 35%, 100% { opacity: 0; transform: scale(1.05); } }
        
        /* Ensure sidebar and main content are above background */
        .sidebar { z-index: 50 !important; background: var(--bg-sidebar); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .dashboard-main { position: relative; z-index: 10; flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
      `}} />
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
          <Link href="/dashboard/profile" className="sidebar-user" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info" style={{ flex: 1 }}>
              <div className="sidebar-user-name" style={{ color: 'var(--text-primary)' }}>
                {user?.first_name} {user?.last_name}
              </div>
              <div className="sidebar-user-role" style={{ color: 'var(--text-secondary)' }}>{roleLabel}</div>
            </div>
            <div className="sidebar-user-settings-icon" style={{ opacity: 0.6, fontSize: '18px' }}>⚙️</div>
          </Link>
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
            {/* The language and theme switchers have been moved to /dashboard/profile */}
          </div>
        </header>
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
