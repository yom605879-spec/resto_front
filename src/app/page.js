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

const DEMO_PRODUCTS = [
  {
    name: "Truffle Ribeye Steak",
    desc: "Olovda pishirilgan premium mol go'shti, trufel sousi bilan.",
    price: "245 000 UZS",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Sushi Set 'Tokyo'",
    desc: "Yangi losos, orkinos va qisqichbaqa go'shtidan iborat 24 talik set.",
    price: "180 000 UZS",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Margarita Pitsasi",
    desc: "Haqiqiy italyancha resept. Motsarella pishlog'i va pomidor sousi.",
    price: "95 000 UZS",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Qirollik Qisqichbaqasi",
    desc: "Sarimsoq va limon sousida qovurilgan ulkan qisqichbaqa oyoqlari.",
    price: "320 000 UZS",
    image: "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Pista va Malina Dezerti",
    desc: "Fransuzcha makaron, yangi malina va maxsus pista kremi.",
    price: "65 000 UZS",
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Tiramisu Klasik",
    desc: "Mascarpone pishlog'i va kofe ekstrakti bilan tayyorlangan shirinlik.",
    price: "55 000 UZS",
    image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=400&q=80"
  }
];

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#050505',
      color: '#fff',
      fontFamily: "'Inter', sans-serif",
      overflowX: 'hidden',
    }}>
      {/* Background Slider */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: '#000'
      }}>
        {/* Images */}
        <div className="bg-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="bg-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1920&q=80')", animationDelay: '6s' }} />
        <div className="bg-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1920&q=80')", animationDelay: '12s' }} />
        <div className="bg-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1920&q=80')", animationDelay: '18s' }} />
        <div className="bg-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=1920&q=80')", animationDelay: '24s' }} />
        
        {/* Dark Overlay for minimal/clean look and readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
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

        {/* Demo Products Section */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{
              fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800,
              background: 'linear-gradient(135deg, #fff, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: '12px'
            }}>
              Eng xaridorgir taomlar (Demo)
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>
              Mijozlaringiz xuddi shunday chiroyli menyuni ko'rib buyurtma berishadi
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {DEMO_PRODUCTS.map((product, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                }}
                whileHover={{
                  y: -6,
                  boxShadow: '0 20px 40px rgba(108,60,255,0.15)',
                  borderColor: 'rgba(108,60,255,0.4)',
                }}
              >
                <div style={{
                  height: '220px', width: '100%',
                  backgroundImage: `url(${product.image})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }} />
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '10px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>{product.name}</h3>
                    <span style={{ color: '#60d0dc', fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap' }}>{product.price}</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
                    {product.desc}
                  </p>
                  <Link href="/register" style={{
                    display: 'block', textAlign: 'center',
                    padding: '12px', borderRadius: '12px',
                    background: 'rgba(108,60,255,0.1)',
                    border: '1px solid rgba(108,60,255,0.3)',
                    color: '#c4b5fd', fontWeight: 600, fontSize: '14px',
                    textDecoration: 'none', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(108,60,255,0.25)';
                    e.currentTarget.style.borderColor = 'rgba(108,60,255,0.6)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(108,60,255,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(108,60,255,0.3)';
                    e.currentTarget.style.color = '#c4b5fd';
                  }}>
                    🛒 Buyurtma qilish
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

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

      <style dangerouslySetInnerHTML={{ __html: `
        .bg-slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0;
          animation: crossfade 30s infinite;
        }
        @keyframes crossfade {
          0% { opacity: 0; transform: scale(1.05); }
          10% { opacity: 1; transform: scale(1); }
          25% { opacity: 1; transform: scale(1); }
          35% { opacity: 0; transform: scale(1.05); }
          100% { opacity: 0; transform: scale(1.05); }
        }
        @media (max-width: 768px) {
          #features > div:nth-child(2),
          #features > div:nth-child(3),
          #features > div:nth-child(4),
          #features > div:nth-child(5) {
            grid-column: span 12 !important;
          }
        }
      ` }} />
    </div>
  );
}
