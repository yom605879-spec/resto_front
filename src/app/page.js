import Link from 'next/link';

export default function Home() {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-logo">✦ Restaran</div>
        <div className="landing-nav-links">
          <Link href="/login" className="btn btn-primary" style={{ borderRadius: '30px', padding: '10px 24px' }}>
            Tizimga Kirish
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        {/* Animated Background Orbs */}
        <div className="hero-bg">
          <div className="hero-bg-orb hero-bg-orb-1"></div>
          <div className="hero-bg-orb hero-bg-orb-2"></div>
          <div className="hero-bg-orb hero-bg-orb-3"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge badge-boss">v2.0</span>
            <span>Premium Restaurant SaaS</span>
          </div>
          
          <h1 className="hero-title">
            Restoraningizni <br />
            <span className="hero-title-gradient">Aqlli Boshqaring</span>
          </h1>
          
          <p className="hero-subtitle">
            Admin, Kassir, Oshpaz, Ofitsiant va Kuryerlar uchun yagona raqamli tizim. Buyurtmalar, moliya va xodimlarni nazorat qilish hech qachon bunchalik oson bo'lmagan.
          </p>
          
          <div className="hero-buttons">
            <Link href="/register" className="btn btn-primary btn-lg" style={{ borderRadius: '30px', padding: '16px 40px' }}>
              Bepul Boshlash
            </Link>
            <Link href="#features" className="btn btn-ghost btn-lg" style={{ borderRadius: '30px', padding: '16px 40px' }}>
              Imkoniyatlar
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">Nega aynan Restaran?</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '50px' }}>
          Restoraningizni rivojlantirish uchun barcha asboblar bitta platformada mujassam.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          
          <div className="glass-card">
            <div style={{ fontSize: '40px', marginBottom: '20px' }}>📊</div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>To'liq Moliyaviy Nazorat</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              Daromad va xarajatlar, kassa holati va kunlik tushumlarni real vaqt rejimida kuzatib boring.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ fontSize: '40px', marginBottom: '20px' }}>📱</div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Telegram Bot va Web App</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              Buyurtmalarni avtomatlashtiring. Mijozlar to'g'ridan-to'g'ri Telegram orqali chiroyli menyuni ko'rib xarid qila oladi.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ fontSize: '40px', marginBottom: '20px' }}>🤵</div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Ofitsiant Plansheti</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              Jonli stollar xaritasi yordamida qog'oz va qalamdan voz keching. Buyurtmalar to'g'ri oshxonaga uchadi.
            </p>
          </div>

        </div>
      </section>

      <footer style={{ padding: '40px', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
        <div className="landing-logo" style={{ marginBottom: '10px' }}>✦ Restaran</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>© 2026 Restaran SaaS Platformasi. Barcha huquqlar himoyalangan.</p>
      </footer>
    </div>
  );
}
