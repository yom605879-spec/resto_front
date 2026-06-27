'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    emoji: '👑',
    title: 'Restoran rahbari',
    short: 'Boss uchun',
    desc: "Dunyoning qaysi chekkasida bo'lmang, restoraningizda nimalar bo'layotganini kaftingizdagidek ko'rib turasiz. Qancha daromad, qayerga xarajat, eng xaridorgir taom — hammasi bitta ekranda.",
    color: '#f59e0b',
    bg: 'rgba(245,159,11,0.08)',
    border: 'rgba(245,159,11,0.25)',
    glow: 'rgba(245,159,11,0.2)',
    icon: '📊',
  },
  {
    emoji: '🍳',
    title: 'Oshpazlar uchun',
    short: 'Oshxona',
    desc: "Ofitsiant buyurtma olishi bilan, oshpazning ekranida avtomatik tarzda '2 ta palov, 1 ta choy' paydo bo'ladi. Qog'oz cheklar o'tmishda qoldi!",
    color: '#f97316',
    bg: 'rgba(249,115,22,0.08)',
    border: 'rgba(249,115,22,0.25)',
    glow: 'rgba(249,115,22,0.2)',
    icon: '🔪',
  },
  {
    emoji: '🤵',
    title: 'Ofitsiantlar uchun',
    short: 'Xizmat',
    desc: "Mijoz yoniga borib, buyurtmani planshet yoki telefonda bir zumda qabul qilishadi. Zal xaritasi orqali qaysi stol bo'shligini ko'rishadi.",
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.25)',
    glow: 'rgba(59,130,246,0.2)',
    icon: '📱',
  },
  {
    emoji: '💳',
    title: 'Kassirlar uchun',
    short: 'To\'lovlar',
    desc: "To'lovlarni ko'z ochib yumguncha qabul qilish, chek chiqarish yoki chegirmalar taqdim etish juda oson. Hisobotlar avtomatik tayyorlanadi.",
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
    glow: 'rgba(16,185,129,0.2)',
    icon: '🧾',
  },
  {
    emoji: '⭐',
    title: 'Mijozlar uchun',
    short: 'Mehmonlar',
    desc: "Mehmonlar telefonlarida chiroyli raqamli menyuni ko'rishadi. Fikrlarini qoldirishlari yoki Telegram bot orqali rahbar bilan bog'lanishlari mumkin.",
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.08)',
    border: 'rgba(168,85,247,0.25)',
    glow: 'rgba(168,85,247,0.2)',
    icon: '📱',
  },
];

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 40% 30%, #0a0818 0%, #050510 60%, #060410 100%)',
      color: '#fff',
      fontFamily: "'Inter', sans-serif",
      overflowX: 'hidden',
    }}>
      {/* Stars */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        {/* Nebula 1 */}
        <div style={{
          position: 'absolute', top: '-15%', left: '-10%',
          width: '80vw', height: '80vw',
          background: 'radial-gradient(ellipse, rgba(100,50,255,0.2) 0%, rgba(100,50,255,0.05) 40%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)',
          animation: 'nebula1 16s ease-in-out infinite',
        }}/>
        <div style={{
          position: 'absolute', bottom: '10%', right: '-15%',
          width: '70vw', height: '70vw',
          background: 'radial-gradient(ellipse, rgba(0,180,200,0.15) 0%, rgba(0,150,200,0.04) 40%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)',
          animation: 'nebula2 20s ease-in-out infinite',
        }}/>
        <div style={{
          position: 'absolute', top: '50%', left: '40%',
          width: '40vw', height: '40vw',
          background: 'radial-gradient(ellipse, rgba(200,80,200,0.1) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(30px)',
          animation: 'nebula3 24s ease-in-out infinite',
        }}/>
        {/* Star dots */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px),
            radial-gradient(circle, rgba(200,180,255,0.6) 1px, transparent 1px)
          `,
          backgroundSize: '300px 300px, 200px 200px, 150px 150px, 400px 400px',
          backgroundPosition: '0 0, 70px 100px, 35px 160px, 150px 50px',
          opacity: 0.5,
        }}/>
      </div>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 5%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(6,5,20,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          fontSize: '20px', fontWeight: 800,
          background: 'linear-gradient(135deg, #a78bfa, #60d0dc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          ✦ Restaran
        </div>
        <Link href="/login" style={{
          padding: '10px 22px', borderRadius: '12px',
          border: '1px solid rgba(108,60,255,0.5)',
          background: 'rgba(108,60,255,0.1)',
          color: '#a78bfa', fontWeight: 600, fontSize: '14px',
          textDecoration: 'none', transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(108,60,255,0.2)';
          e.currentTarget.style.borderColor = 'rgba(108,60,255,0.8)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(108,60,255,0.1)';
          e.currentTarget.style.borderColor = 'rgba(108,60,255,0.5)';
        }}>
          Tizimga Kirish
        </Link>
      </nav>

      {/* Hero */}
      <section style={{
        position: 'relative', zIndex: 10,
        paddingTop: '140px', paddingBottom: '80px',
        padding: '140px 5% 80px',
        maxWidth: '1300px', margin: '0 auto',
      }}>
        {/* Main glassmorphism hero card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '28px',
            padding: '60px',
            marginBottom: '28px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `
              0 0 0 1px rgba(108,60,255,0.2),
              0 0 80px rgba(108,60,255,0.08),
              inset 0 1px 0 rgba(255,255,255,0.07)
            `,
          }}
        >
          {/* Neon border top */}
          <div style={{
            position: 'absolute', top: 0, left: '8%', right: '8%', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(108,60,255,0.7), rgba(0,220,200,0.7), transparent)',
          }}/>

          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '40px',
            alignItems: 'center',
          }}>
            <div style={{ flex: '1 1 500px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                fontSize: '13px', color: 'rgba(255,255,255,0.5)',
                marginBottom: '28px',
              }}>
                <span style={{ color: '#a78bfa' }}>✦</span> Restaran
                <span style={{ padding: '2px 8px', background: 'rgba(108,60,255,0.3)', borderRadius: '6px', color: '#c4b5fd', fontSize: '11px', fontWeight: 700 }}>v2.0</span>
              </div>

              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 48px)',
                fontWeight: 800, lineHeight: 1.2,
                marginBottom: '20px',
              }}>
                "Restaran" — bu restoraningizni{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #a78bfa, #60d0dc)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>yangi bosqichga</span>{' '}olib chiquvchi zamonaviy platforma!
              </h1>

              <p style={{
                fontSize: '16px', color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.7, marginBottom: '36px', maxWidth: '480px',
              }}>
                "Restaran" — bu shunchaki dastur emas, balki muassasangizning "raqamli miyasi".
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link href="/register" style={{
                  padding: '14px 32px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #f97316, #ef4444)',
                  color: '#fff', fontWeight: 700, fontSize: '15px',
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(249,115,22,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(249,115,22,0.35)'; }}>
                  Boshlash →
                </Link>
                <Link href="#features" style={{
                  padding: '14px 32px', borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '15px',
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
                  Demo ko&apos;rish
                </Link>
              </div>
            </div>

            {/* Dashboard mini preview */}
            <div style={{
              flex: '1 1 300px', maxWidth: '380px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px', padding: '20px',
              boxShadow: '0 0 40px rgba(108,60,255,0.1)',
            }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f5f' }}/>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbc2e' }}/>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28c940' }}/>
              </div>
              {[
                { label: 'Daromad', val: '12,450,000 UZS', color: '#10b981' },
                { label: 'Buyurtmalar', val: '48 ta', color: '#a78bfa' },
                { label: 'Xodimlar', val: '12 ta', color: '#f59e0b' },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '10px', marginBottom: '8px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: item.color }}>{item.val}</span>
                </div>
              ))}
              <div style={{
                padding: '10px 14px',
                background: 'rgba(108,60,255,0.1)',
                borderRadius: '10px',
                border: '1px solid rgba(108,60,255,0.2)',
                fontSize: '12px', color: 'rgba(255,255,255,0.5)', textAlign: 'center',
              }}>
                📊 Real vaqt statistikasi
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div id="features" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '20px',
        }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                gridColumn: i === 0 ? 'span 12' : i <= 2 ? 'span 6' : 'span 6',
                background: f.bg,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${f.border}`,
                borderRadius: '22px',
                padding: '28px 30px',
                position: 'relative', overflow: 'hidden',
                cursor: 'default',
                transition: 'all 0.3s ease',
                boxShadow: `0 0 30px ${f.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}
              whileHover={{
                y: -4,
                boxShadow: `0 0 60px ${f.glow}, 0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)`,
                borderColor: f.color + '80',
              }}
            >
              {/* Neon top border */}
              <div style={{
                position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
                background: `linear-gradient(90deg, transparent, ${f.color}90, transparent)`,
              }}/>

              <div style={{
                fontSize: '36px', marginBottom: '16px',
                filter: 'drop-shadow(0 0 8px ' + f.color + '60)',
              }}>
                {f.emoji}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                  {f.title}
                </h3>
                <span style={{
                  padding: '4px 10px', borderRadius: '8px',
                  background: f.color + '20', color: f.color,
                  fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap',
                }}>
                  {f.short}
                </span>
              </div>

              <p style={{
                fontSize: '14px', color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.65,
              }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            marginTop: '28px',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '50px 40px',
            textAlign: 'center',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 0 80px rgba(108,60,255,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(108,60,255,0.8), rgba(0,220,200,0.6), transparent)',
          }}/>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(108,60,255,0.08) 0%, transparent 70%)' }}/>

          <p style={{
            fontSize: 'clamp(18px, 3vw, 26px)',
            fontWeight: 500, lineHeight: 1.5,
            color: 'rgba(255,255,255,0.85)',
            marginBottom: '32px', position: 'relative',
          }}>
            Xullas...{' '}
            <span style={{ color: '#a78bfa', fontWeight: 700 }}>"Restaran"</span>
            {' '}— bu muassasadagi tartibsizliklarga chek qo&apos;yib, hamma narsani bir joyga jamlaydigan, xodimlarning ishini yengillashtirib, mijozlarni xursand qiladigan{' '}
            <span style={{ color: '#60d0dc' }}>"sehrli yordamchi"</span>.
          </p>

          <Link href="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '16px 40px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff', fontWeight: 700, fontSize: '16px',
            textDecoration: 'none', position: 'relative',
            boxShadow: '0 4px 24px rgba(108,60,255,0.4)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(108,60,255,0.55)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(108,60,255,0.4)'; }}>
            Hozir ulanish →
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 10,
        textAlign: 'center',
        padding: '30px 20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        color: 'rgba(255,255,255,0.25)', fontSize: '14px',
      }}>
        © 2026 Restaran. Barcha huquqlar himoyalangan.
        <div style={{
          position: 'absolute', bottom: '16px', right: '24px',
          color: 'rgba(255,255,255,0.12)', fontSize: '24px',
        }}>✦</div>
      </footer>

      <style>{`
        @keyframes nebula1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.08); }
        }
        @keyframes nebula2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 20px) scale(1.05); }
        }
        @keyframes nebula3 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(20px, 30px); }
          66% { transform: translate(-15px, -20px); }
        }
        @media (max-width: 768px) {
          #features > div:nth-child(2),
          #features > div:nth-child(3),
          #features > div:nth-child(4),
          #features > div:nth-child(5) {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </div>
  );
}
