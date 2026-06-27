'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { saveToken, saveUser } from '@/lib/auth';

async function signInWithGoogle() {
  const { getFirebaseAuth, getGoogleProvider, signInWithPopup } = await import('@/lib/firebase');
  const auth = getFirebaseAuth();
  const googleProvider = getGoogleProvider();
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setIsPending(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsPending(false);
    setLoading(true);

    try {
      const data = await api.login(form);
      saveToken(data.token);
      saveUser(data.user);
      router.push('/dashboard');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('tasdiqlanmagan') || msg.includes('Boss tomonidan')) {
        setIsPending(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsPending(false);
    setGoogleLoading(true);

    try {
      const firebaseUser = await signInWithGoogle();

      const data = await api.googleAuth({
        google_uid: firebaseUser.uid,
        email: firebaseUser.email,
        display_name: firebaseUser.displayName,
        photo_url: firebaseUser.photoURL,
      });

      if (data.isNew) {
        // Yangi foydalanuvchi — register sahifasiga o'tkazamiz va ma'lumotlarni saqlaymiz
        sessionStorage.setItem('pendingGoogleRegister', JSON.stringify(data));
        router.push('/register');
        return;
      }

      saveToken(data.token);
      saveUser(data.user);
      router.push('/dashboard');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return;
      }
      const msg = err.message || '';
      if (msg.includes('tasdiqlanmagan') || msg.includes('Boss tomonidan')) {
        setIsPending(true);
      } else {
        setError(msg || 'Google bilan kirishda xatolik.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb auth-bg-orb-1"></div>
        <div className="auth-bg-orb auth-bg-orb-2"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">✦ Restaran</div>
          <h1 className="auth-title">Xush Kelibsiz</h1>
          <p className="auth-subtitle">Hisobingizga kiring</p>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          style={{
            width: '100%', padding: '13px 20px',
            borderRadius: '12px',
            border: '1.5px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
            color: 'var(--text)', cursor: (googleLoading || loading) ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '12px', fontSize: '15px', fontWeight: '600',
            transition: 'all 0.2s',
            opacity: (googleLoading || loading) ? 0.7 : 1,
            marginBottom: '20px',
          }}
          onMouseEnter={e => {
            if (!googleLoading && !loading) {
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
          {googleLoading ? (
            <span className="spinner spinner-small"></span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
          )}
          {googleLoading ? 'Yuklanmoqda...' : 'Google bilan kirish'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>yoki</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Pending approval notice */}
        {isPending && (
          <div style={{
            padding: '14px 16px', borderRadius: '12px', marginBottom: '16px',
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
            display: 'flex', gap: '12px', alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '22px', flexShrink: 0 }}>⏳</span>
            <div>
              <div style={{ fontWeight: '700', color: '#f59e0b', marginBottom: '3px', fontSize: '14px' }}>
                Hisobingiz tasdiqlanmagan
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Boss sizning hisobingizni hali tasdiqlamagan. Iltimos, Boss bilan bog'laning.
              </div>
            </div>
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="Usernameni kiriting"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parol</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Parolni kiriting"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg auth-submit"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <><span className="spinner spinner-small"></span> Kirilmoqda...</>
            ) : (
              'Kirish →'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Hisobingiz yo&apos;qmi?{' '}
          <Link href="/register">Ro&apos;yxatdan o&apos;tish</Link>
        </div>
      </div>
    </div>
  );
}
