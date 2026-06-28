'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { saveToken, saveUser, getDefaultRoute } from '@/lib/auth';

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
    setError(''); setIsPending(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setIsPending(false); setLoading(true);
    try {
      const data = await api.login(form);
      saveToken(data.token); saveUser(data.user);
      router.push(getDefaultRoute(data.user.role));
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('tasdiqlanmagan') || msg.includes('Boss tomonidan')) setIsPending(true);
      else setError(msg);
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setError(''); setIsPending(false); setGoogleLoading(true);
    try {
      const firebaseUser = await signInWithGoogle();
      const data = await api.googleAuth({
        google_uid: firebaseUser.uid, email: firebaseUser.email,
        display_name: firebaseUser.displayName, photo_url: firebaseUser.photoURL,
      });
      if (data.isNew) { sessionStorage.setItem('pendingGoogleRegister', JSON.stringify(data)); router.push('/register'); return; }
      saveToken(data.token); saveUser(data.user);
      router.push(getDefaultRoute(data.user.role));
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return;
      const msg = err.message || '';
      if (msg.includes('tasdiqlanmagan') || msg.includes('Boss tomonidan')) setIsPending(true);
      else setError(msg || 'Google bilan kirishda xatolik.');
    } finally { setGoogleLoading(false); }
  };

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; background: #06040f !important; }
        .login-bg {
          min-height: 100vh;
          background: #06040f;
          display: flex; align-items: center; justify-content: center;
          padding: 20px; position: relative; overflow: hidden;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        /* Nebula blobs */
        .nb1 {
          position: fixed; top: -20%; left: -15%;
          width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle at center, rgba(130,60,255,0.55) 0%, rgba(100,30,220,0.25) 35%, transparent 70%);
          filter: blur(60px); pointer-events: none; z-index: 1;
          animation: nb1move 14s ease-in-out infinite;
        }
        .nb2 {
          position: fixed; bottom: -15%; right: -10%;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle at center, rgba(0,200,180,0.4) 0%, rgba(0,150,200,0.15) 40%, transparent 70%);
          filter: blur(60px); pointer-events: none; z-index: 1;
          animation: nb2move 18s ease-in-out infinite;
        }
        .nb3 {
          position: fixed; top: 30%; right: 10%;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle at center, rgba(200,60,255,0.3) 0%, transparent 65%);
          filter: blur(50px); pointer-events: none; z-index: 1;
          animation: nb3move 22s ease-in-out infinite;
        }
        /* Stars */
        .stars {
          position: fixed; inset: 0; pointer-events: none; z-index: 1;
          background-image:
            radial-gradient(circle, rgba(255,255,255,0.95) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px),
            radial-gradient(circle, rgba(200,180,255,0.7) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px);
          background-size: 320px 320px, 210px 210px, 160px 160px, 120px 120px;
          background-position: 0 0, 80px 110px, 40px 170px, 160px 60px;
        }
        /* Card */
        .login-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 440px;
          background: rgba(18,12,40,0.75);
          border: 1px solid rgba(130,80,255,0.35);
          border-radius: 24px;
          padding: 44px 40px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow:
            0 0 0 1px rgba(130,80,255,0.25),
            0 0 60px rgba(130,60,255,0.3),
            0 0 120px rgba(130,60,255,0.15),
            0 0 200px rgba(0,200,200,0.08),
            inset 0 1px 0 rgba(255,255,255,0.1);
          animation: cardIn 0.65s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .card-top-line {
          position: absolute; top: 0; left: 8%; right: 8%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(160,100,255,0.9), rgba(80,220,210,0.9), transparent);
          border-radius: 1px;
        }
        .card-bot-line {
          position: absolute; bottom: 0; left: 20%; right: 20%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(80,220,210,0.4), transparent);
        }
        /* Google btn */
        .google-btn {
          width: 100%; padding: 13px 20px; margin-bottom: 20px;
          border-radius: 14px;
          border: 1px solid rgba(130,80,255,0.45);
          background: rgba(255,255,255,0.05);
          color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 12px;
          font-size: 15px; font-weight: 600;
          transition: all 0.25s ease;
          box-shadow: 0 0 20px rgba(130,60,255,0.12);
        }
        .google-btn:hover {
          background: rgba(130,60,255,0.18);
          border-color: rgba(160,100,255,0.8);
          box-shadow: 0 0 35px rgba(130,60,255,0.25);
          transform: translateY(-1px);
        }
        /* Input */
        .c-input {
          width: 100%; padding: 13px 16px; border-radius: 13px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #fff; font-size: 14px; outline: none;
          transition: all 0.22s; box-sizing: border-box;
          font-family: inherit;
        }
        .c-input::placeholder { color: rgba(255,255,255,0.25); }
        .c-input:focus {
          border-color: rgba(130,80,255,0.75);
          background: rgba(130,80,255,0.08);
          box-shadow: 0 0 0 3px rgba(130,60,255,0.14), 0 0 20px rgba(130,60,255,0.12);
        }
        /* Submit */
        .submit-btn {
          width: 100%; padding: 14px; border-radius: 14px; border: none;
          background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #a855f7 100%);
          background-size: 200% 100%;
          color: #fff; font-size: 16px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 24px rgba(120,60,255,0.45), 0 0 40px rgba(120,60,255,0.2);
          font-family: inherit;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 36px rgba(120,60,255,0.55), 0 0 60px rgba(120,60,255,0.25);
        }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        /* Corner star */
        .corner-star {
          position: fixed; bottom: 28px; right: 28px;
          color: rgba(255,255,255,0.2); font-size: 28px; z-index: 5;
          animation: starPulse 4s ease-in-out infinite;
        }
        /* Spinner */
        .mini-spin {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.75s linear infinite; display: inline-block;
          flex-shrink: 0;
        }
        @keyframes cardIn { from { opacity:0; transform:translateY(28px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes nb1move { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(40px,-30px) scale(1.1);} }
        @keyframes nb2move { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-30px,25px) scale(1.07);} }
        @keyframes nb3move { 0%,100%{transform:translate(0,0);} 50%{transform:translate(20px,-25px);} }
        @keyframes starPulse { 0%,100%{opacity:0.2;transform:scale(1) rotate(0deg);} 50%{opacity:0.5;transform:scale(1.3) rotate(20deg);} }
        @keyframes spin { to { transform:rotate(360deg); } }
        @media (max-width:480px) { .login-card { padding: 32px 24px; } }
      `}</style>

      <div className="login-bg">
        {/* Nebulas */}
        <div className="nb1"/>
        <div className="nb2"/>
        <div className="nb3"/>
        <div className="stars"/>

        {/* Card */}
        <div className="login-card">
          <div className="card-top-line"/>
          <div className="card-bot-line"/>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              fontSize: '22px', fontWeight: 800, marginBottom: '14px',
              background: 'linear-gradient(135deg, #c4b5fd, #60d0dc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>✦ Restaran</div>
            <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 700, margin: '0 0 8px', lineHeight: 1.2 }}>Xush Kelibsiz</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>Hisobingizga kiring</p>
          </div>

          {/* Google */}
          <button className="google-btn" onClick={handleGoogleLogin} disabled={googleLoading || loading}>
            {googleLoading ? <span className="mini-spin"/> : (
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            {googleLoading ? 'Yuklanmoqda...' : 'Google bilan kirish'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}/>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>yoki</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}/>
          </div>

          {/* Pending */}
          {isPending && (
            <div style={{ padding: '13px 15px', borderRadius: '12px', marginBottom: '16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', gap: '10px' }}>
              <span>⏳</span>
              <div>
                <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '13px' }}>Hisobingiz tasdiqlanmagan</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>Boss sizning hisobingizni hali tasdiqlamagan.</div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: '12px 15px', borderRadius: '12px', marginBottom: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', fontSize: '13px', textAlign: 'center' }}>{error}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '7px' }}>Username</label>
              <input className="c-input" type="text" name="username" placeholder="Usernameni kiriting" value={form.username} onChange={handleChange} required autoComplete="username" autoFocus/>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '7px' }}>Parol</label>
              <input className="c-input" type="password" name="password" placeholder="Parolni kiriting" value={form.password} onChange={handleChange} required autoComplete="current-password"/>
            </div>

            <button type="submit" className="submit-btn" disabled={loading || googleLoading}>
              {loading ? <><span className="mini-spin"/> Kirilmoqda...</> : 'Kirish →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            Hisobingiz yo&apos;qmi?{' '}
            <Link href="/register" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>
              Ro&apos;yxatdan o&apos;tish 🔗
            </Link>
          </div>
        </div>

        <div className="corner-star">✦</div>
      </div>
    </>
  );
}
