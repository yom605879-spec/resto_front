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
      router.push(getDefaultRoute(data.user.role));
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
        sessionStorage.setItem('pendingGoogleRegister', JSON.stringify(data));
        router.push('/register');
        return;
      }
      saveToken(data.token);
      saveUser(data.user);
      router.push(getDefaultRoute(data.user.role));
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return;
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
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 50%, #0d0d1a 0%, #06060f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Stars background */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
      }}>
        {/* Big cosmic nebula blobs */}
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '70vw', height: '70vw',
          background: 'radial-gradient(ellipse, rgba(120,60,255,0.22) 0%, transparent 60%)',
          borderRadius: '50%', filter: 'blur(30px)',
          animation: 'cosmicFloat1 12s ease-in-out infinite',
        }}/>
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-15%',
          width: '60vw', height: '60vw',
          background: 'radial-gradient(ellipse, rgba(0,200,180,0.15) 0%, transparent 60%)',
          borderRadius: '50%', filter: 'blur(30px)',
          animation: 'cosmicFloat2 15s ease-in-out infinite',
        }}/>
        <div style={{
          position: 'absolute', top: '30%', right: '5%',
          width: '30vw', height: '30vw',
          background: 'radial-gradient(ellipse, rgba(200,80,255,0.12) 0%, transparent 60%)',
          borderRadius: '50%', filter: 'blur(20px)',
          animation: 'cosmicFloat3 18s ease-in-out infinite',
        }}/>
        {/* Star particles - generated via CSS */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '200px 200px, 150px 150px, 100px 100px',
          backgroundPosition: '0 0, 50px 80px, 25px 120px',
          opacity: 0.4,
        }}/>
      </div>

      {/* Main card */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '440px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '44px 40px',
        boxShadow: `
          0 0 0 1px rgba(108,60,255,0.3),
          0 0 60px rgba(108,60,255,0.15),
          0 0 120px rgba(0,200,220,0.08),
          inset 0 1px 0 rgba(255,255,255,0.08)
        `,
        animation: 'cardAppear 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
      }}>
        {/* Neon glow border top */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(108,60,255,0.8), rgba(0,220,200,0.8), transparent)',
          borderRadius: '1px',
        }}/>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontSize: '22px', fontWeight: 800,
            background: 'linear-gradient(135deg, #a78bfa, #60d0dc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', marginBottom: '16px',
          }}>
            ✦ Restaran
          </div>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 700, marginBottom: '8px', lineHeight: 1.2 }}>
            Xush Kelibsiz
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
            Hisobingizga kiring
          </p>
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          style={{
            width: '100%', padding: '13px 20px', marginBottom: '20px',
            borderRadius: '14px',
            border: '1px solid rgba(108,60,255,0.5)',
            background: 'rgba(255,255,255,0.06)',
            color: '#fff', cursor: (googleLoading || loading) ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '12px', fontSize: '15px', fontWeight: 600,
            transition: 'all 0.25s ease',
            opacity: (googleLoading || loading) ? 0.6 : 1,
            boxShadow: '0 0 20px rgba(108,60,255,0.1)',
          }}
          onMouseEnter={e => {
            if (!googleLoading && !loading) {
              e.currentTarget.style.background = 'rgba(108,60,255,0.15)';
              e.currentTarget.style.borderColor = 'rgba(108,60,255,0.8)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(108,60,255,0.2)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(108,60,255,0.5)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(108,60,255,0.1)';
          }}
        >
          {googleLoading ? (
            <span style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spinAnim 0.8s linear infinite', display: 'inline-block' }}/>
          ) : (
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
          <div style={{
            padding: '14px 16px', borderRadius: '12px', marginBottom: '16px',
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
            display: 'flex', gap: '10px', alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '20px' }}>⏳</span>
            <div>
              <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '13px', marginBottom: '2px' }}>Hisobingiz tasdiqlanmagan</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>Boss sizning hisobingizni hali tasdiqlamagan. Iltimos, Boss bilan bog&apos;laning.</div>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#fca5a5', fontSize: '13px', textAlign: 'center',
          }}>{error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="Usernameni kiriting"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
              autoFocus
              style={{
                width: '100%', padding: '13px 16px', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff', fontSize: '14px', outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(108,60,255,0.7)';
                e.target.style.boxShadow = '0 0 0 3px rgba(108,60,255,0.12)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Parol
            </label>
            <input
              type="password"
              name="password"
              placeholder="Parolni kiriting"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              style={{
                width: '100%', padding: '13px 16px', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff', fontSize: '14px', outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(108,60,255,0.7)';
                e.target.style.boxShadow = '0 0 0 3px rgba(108,60,255,0.12)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            style={{
              width: '100%', padding: '14px',
              borderRadius: '14px', border: 'none',
              background: loading || googleLoading ? 'rgba(108,60,255,0.5)' : 'linear-gradient(135deg, #7c3aed, #a855f7, #7c3aed)',
              backgroundSize: '200% 100%',
              color: '#fff', fontSize: '16px', fontWeight: 700,
              cursor: loading || googleLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(108,60,255,0.4)',
              animation: 'gradientFlow 3s ease infinite',
            }}
            onMouseEnter={e => {
              if (!loading && !googleLoading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(108,60,255,0.5)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(108,60,255,0.4)';
            }}
          >
            {loading ? (
              <span style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spinAnim 0.8s linear infinite', display: 'inline-block' }}/>
            ) : 'Kirish →'}
          </button>
        </form>

        {/* Footer link */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
          Hisobingiz yo&apos;qmi?{' '}
          <Link href="/register" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>
            Ro&apos;yxatdan o&apos;tish 🔗
          </Link>
        </div>

        {/* Bottom neon */}
        <div style={{
          position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,220,200,0.5), transparent)',
        }}/>
      </div>

      {/* Corner star decoration */}
      <div style={{
        position: 'absolute', bottom: '30px', right: '30px',
        color: 'rgba(255,255,255,0.15)', fontSize: '32px', fontWeight: 900,
        zIndex: 5, animation: 'cornerStar 4s ease-in-out infinite',
      }}>✦</div>

      <style>{`
        @keyframes cosmicFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.05); }
        }
        @keyframes cosmicFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 15px) scale(1.03); }
        }
        @keyframes cosmicFloat3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, 25px); }
        }
        @keyframes cardAppear {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spinAnim {
          to { transform: rotate(360deg); }
        }
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes cornerStar {
          0%, 100% { opacity: 0.15; transform: rotate(0deg) scale(1); }
          50% { opacity: 0.3; transform: rotate(15deg) scale(1.2); }
        }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>
    </div>
  );
}
