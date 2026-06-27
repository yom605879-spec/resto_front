'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { saveToken, saveUser } from '@/lib/auth';

const ROLES = [
  { value: 'boss', label: 'Boss', subtitle: 'Restoran egasi', icon: '👑', color: '#f59e0b' },
  { value: 'admin', label: 'Admin', subtitle: 'Menejer / Administrator', icon: '🛠️', color: '#6366f1' },
  { value: 'kassir', label: 'Kassir', subtitle: 'Kassa operatori', icon: '💰', color: '#10b981' },
  { value: 'oshpaz', label: 'Oshpaz', subtitle: 'Oshxona xodimi', icon: '👨‍🍳', color: '#f97316' },
  { value: 'ofitsiant', label: 'Ofitsiant', subtitle: 'Xizmatchi', icon: '🍽️', color: '#3b82f6' },
  { value: 'mijoz', label: 'Mijoz', subtitle: 'Oddiy foydalanuvchi', icon: '👤', color: '#8b5cf6' },
];

// Google Sign-In funksiyasini dinamik import qilamiz (SSR xatoligidan saqlash uchun)
async function signInWithGoogle() {
  const { getFirebaseAuth, getGoogleProvider, signInWithPopup } = await import('@/lib/firebase');
  const auth = getFirebaseAuth();
  const googleProvider = getGoogleProvider();
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [authMode, setAuthMode] = useState(null); // 'telegram' | 'google'

  // Telegram flow state
  const [code, setCode] = useState('');
  const [telegramUser, setTelegramUser] = useState(null);

  // Google flow state
  const [googleUser, setGoogleUser] = useState(null);

  const [selectedRole, setSelectedRole] = useState('');
  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);
  // ─── Pending Google Register Check ────────────────────────────
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingGoogleRegister');
    if (pending) {
      const data = JSON.parse(pending);
      sessionStorage.removeItem('pendingGoogleRegister');
      setGoogleUser({
        uid: data.google_uid,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        photo_url: data.photo_url,
      });
      setAuthMode('google');
      setForm(prev => ({
        ...prev,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
      }));
      setStep(2);
    }
  }, []);

  // ─── Telegram flow ───────────────────────────────────────────
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.verifyCode(code);
      setTelegramUser(data);
      setAuthMode('telegram');
      setForm(prev => ({
        ...prev,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
      }));
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Google flow ─────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const firebaseUser = await signInWithGoogle();

      // Backend bilan tekshiramiz
      const data = await api.googleAuth({
        google_uid: firebaseUser.uid,
        email: firebaseUser.email,
        display_name: firebaseUser.displayName,
        photo_url: firebaseUser.photoURL,
      });

      if (!data.isNew) {
        // Mavjud foydalanuvchi — to'g'ridan-to'g'ri kirish
        saveToken(data.token);
        saveUser(data.user);
        router.push('/dashboard');
        return;
      }

      // Yangi foydalanuvchi — rol tanlash bosqichiga o'tish
      setGoogleUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        first_name: data.first_name,
        last_name: data.last_name,
        photo_url: data.photo_url,
      });
      setAuthMode('google');
      setForm(prev => ({
        ...prev,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
      }));
      setStep(2);
    } catch (err) {
      // Firebase popup yopilsa (user cancel)
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('');
      } else if (err.message?.includes('tasdiqlanmagan')) {
        setError('⏳ Hisobingiz Boss tomonidan tasdiqlanmagan. Iltimos, kuting.');
      } else {
        setError(err.message || 'Google bilan kirishda xatolik.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Role select ──────────────────────────────────────────────
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(3);
  };

  // ─── Final register ───────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (authMode === 'telegram') {
      if (form.password !== form.confirmPassword) {
        setError('Parollar mos kelmadi');
        return;
      }
      if (form.password.length < 4) {
        setError("Parol kamida 4 belgidan iborat bo'lishi kerak");
        return;
      }
    }

    setLoading(true);
    try {
      let data;

      if (authMode === 'google') {
        // Parol ixtiyoriy — Google foydalanuvchilarda
        data = await api.googleRegister({
          google_uid: googleUser.uid,
          email: googleUser.email,
          username: form.username,
          first_name: form.first_name,
          last_name: form.last_name,
          role: selectedRole,
          password: form.password || undefined,
        });
      } else {
        // Telegram orqali
        data = await api.register({
          telegram_id: telegramUser.telegram_id,
          username: form.username,
          first_name: form.first_name,
          last_name: form.last_name,
          password: form.password,
          role: selectedRole,
        });
      }

      if (data.pending) {
        setPendingResult({ username: data.user.username, role: data.user.role });
        setStep(4);
      } else {
        saveToken(data.token);
        saveUser(data.user);
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const progressSteps = [
    { label: 'Kirish', num: 1 },
    { label: 'Rol', num: 2 },
    { label: "Ma'lumotlar", num: 3 },
  ];

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb auth-bg-orb-1"></div>
        <div className="auth-bg-orb auth-bg-orb-2"></div>
      </div>

      <div className="auth-card" style={{ maxWidth: step === 2 ? '560px' : '440px', transition: 'max-width 0.3s ease' }}>
        <div className="auth-header">
          <div className="auth-logo">✦ Restaran</div>
          {step < 4 && (
            <>
              <h1 className="auth-title">Hisob Yaratish</h1>
              <p className="auth-subtitle">Faqat bir necha qadamda boshlang</p>
            </>
          )}
        </div>

        {/* Progress Indicator */}
        {step < 4 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '28px' }}>
            {progressSteps.map((s, i) => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontSize: '13px',
                    background: step > s.num ? 'var(--primary)' : step === s.num ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                    color: step >= s.num ? 'white' : 'var(--text-muted)',
                    border: step === s.num ? '2px solid rgba(99,102,241,0.5)' : '2px solid transparent',
                    boxShadow: step === s.num ? '0 0 0 4px rgba(99,102,241,0.15)' : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span style={{ fontSize: '10px', color: step === s.num ? 'rgba(165,180,252,1)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {s.label}
                  </span>
                </div>
                {i < progressSteps.length - 1 && (
                  <div style={{
                    width: '60px', height: '2px',
                    background: step > s.num ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                    margin: '0 4px', marginTop: '-14px', transition: 'all 0.3s',
                  }} />
                )}
              </div>
            ))}
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        {/* ═══ STEP 1: Kirish usulini tanlash ═══════════════════════════ */}
        {step === 1 && (
          <div className="auth-form">

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                width: '100%', padding: '13px 20px',
                borderRadius: '12px',
                border: '1.5px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text)', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '12px', fontSize: '15px', fontWeight: '600',
                transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
                marginBottom: '16px',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.border = '1.5px solid rgba(255,255,255,0.22)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.border = '1.5px solid rgba(255,255,255,0.12)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {loading ? (
                <span className="spinner spinner-small"></span>
              ) : (
                /* Google SVG Logo */
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
              )}
              {loading ? 'Yuklanmoqda...' : 'Google bilan ro\'yxatdan o\'tish'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                yoki Telegram kod bilan
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Telegram code form */}
            <form onSubmit={handleVerifyCode}>
              <div style={{
                padding: '12px 14px', borderRadius: '10px', marginBottom: '14px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6,
              }}>
                📱 <a href="https://t.me/restaranuz_bot" target="_blank" rel="noopener noreferrer"
                  style={{ color: 'rgba(165,180,252,0.9)', textDecoration: 'none' }}>
                  @restaranuz_bot
                </a> ga <strong style={{ color: 'var(--text)' }}>/start</strong> yuboring va kodni kiriting
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Telegram kodini kiriting"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  style={{ textAlign: 'center', letterSpacing: '0.2em', fontSize: '18px', fontWeight: '700' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <><span className="spinner spinner-small"></span> Tekshirilmoqda...</>
                ) : (
                  'Kodni Tasdiqlash →'
                )}
              </button>
            </form>
          </div>
        )}

        {/* ═══ STEP 2: Rol tanlash ══════════════════════════════════════ */}
        {step === 2 && (
          <div className="auth-form">
            {/* Google user badge */}
            {authMode === 'google' && googleUser && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '12px', marginBottom: '16px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              }}>
                {googleUser.photo_url ? (
                  <img src={googleUser.photo_url} alt="avatar" style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: 'var(--primary-light)' }}>
                    {(googleUser.first_name || '?')[0]}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>
                    {googleUser.first_name} {googleUser.last_name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{googleUser.email}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <svg width="16" height="16" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </svg>
                </div>
              </div>
            )}

            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '14px', textAlign: 'center' }}>
              {authMode === 'google'
                ? '🎉 Google akkaunt ulandi! Rolingizni tanlang:'
                : `👋 Salom, ${telegramUser?.first_name || ''}! Rolingizni tanlang:`}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => handleRoleSelect(role.value)}
                  style={{
                    padding: '14px 12px', borderRadius: '12px',
                    border: '2px solid rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.03)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column', gap: '4px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = `2px solid ${role.color}`;
                    e.currentTarget.style.background = `${role.color}15`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = '2px solid rgba(255,255,255,0.07)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '26px' }}>{role.icon}</span>
                  <span style={{ fontWeight: '700', color: role.color, fontSize: '14px' }}>{role.label}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.3 }}>{role.subtitle}</span>
                  {role.value !== 'boss' && role.value !== 'mijoz' && (
                    <span style={{ fontSize: '10px', color: '#f59e0b', marginTop: '2px' }}>⏳ Boss tasdig'i kerak</span>
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { setStep(1); setError(''); setAuthMode(null); }}
              style={{ marginTop: '12px', width: '100%' }}
            >
              ← Orqaga
            </button>
          </div>
        )}

        {/* ═══ STEP 3: Ma'lumotlar ═══════════════════════════════════════ */}
        {step === 3 && (
          <form className="auth-form" onSubmit={handleRegister}>
            {/* Selected role + auth mode badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '10px', marginBottom: '4px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <span style={{ fontSize: '20px' }}>{ROLES.find(r => r.value === selectedRole)?.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: ROLES.find(r => r.value === selectedRole)?.color, fontSize: '13px' }}>
                  {ROLES.find(r => r.value === selectedRole)?.label}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {authMode === 'google' ? '🔵 Google akkaunt orqali' : '📱 Telegram orqali'}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="Username tanlang (harflar, raqamlar, _)"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ism</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ismingiz"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Familiya</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Familiyangiz"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Parol {authMode === 'google' && <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '400' }}>(ixtiyoriy)</span>}
              </label>
              <input
                type="password"
                className="form-input"
                placeholder={authMode === 'google' ? 'Parol o\'rnatish (ixtiyoriy)' : 'Parol yarating'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={authMode !== 'google'}
                autoComplete="new-password"
              />
            </div>

            {authMode !== 'google' && (
              <div className="form-group">
                <label className="form-label">Parolni Tasdiqlang</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Parolni qayta kiriting"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-ghost btn-lg"
                onClick={() => { setStep(2); setError(''); }}
                style={{ flex: 1 }}
              >
                ← Orqaga
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{ flex: 2 }}
              >
                {loading ? (
                  <><span className="spinner spinner-small"></span> Yaratilmoqda...</>
                ) : (
                  'Hisob Yaratish'
                )}
              </button>
            </div>
          </form>
        )}

        {/* ═══ STEP 4: Tasdiq kutilmoqda ════════════════════════════════ */}
        {step === 4 && pendingResult && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '60px', marginBottom: '14px' }}>⏳</div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text)', marginBottom: '10px' }}>
              Tasdiq Kutilmoqda
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              <strong style={{ color: 'var(--text)' }}>@{pendingResult.username}</strong> hisobi yaratildi.<br />
              Boss siz bilan bog'lanib hisobingizni tasdiqlaydi.<br />
              Tasdiqlangandan so'ng kirish mumkin bo'ladi.
            </p>
            <div style={{
              padding: '12px 20px', borderRadius: '12px', marginBottom: '24px',
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
            }}>
              <div style={{ fontSize: '13px', color: '#f59e0b', fontWeight: '600' }}>
                ⚠️ Rol: {ROLES.find(r => r.value === pendingResult.role)?.label}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Bu rol Boss tasdig'ini talab qiladi
              </div>
            </div>
            <Link href="/login" className="btn btn-primary btn-lg" style={{ display: 'inline-flex' }}>
              Kirish sahifasiga o'tish
            </Link>
          </div>
        )}

        {step < 4 && (
          <div className="auth-footer">
            Hisobingiz bormi?{' '}
            <Link href="/login">Kirish</Link>
          </div>
        )}
      </div>
    </div>
  );
}
