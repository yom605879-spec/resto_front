'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  ChefHat, 
  Smartphone, 
  CreditCard, 
  Star,
  ArrowRight,
  PlayCircle
} from 'lucide-react';
import styles from './Landing.module.css';

export default function Home() {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className={styles.wrapper}>
      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>✦</span> Restaran
        </div>
        <div>
          <Link href="/login" className={styles.btnSecondary} style={{ padding: '10px 24px', fontSize: '14px' }}>
            Tizimga Kirish
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroOrb1}></div>
          <div className={styles.heroOrb2}></div>
        </div>

        <motion.div 
          className={styles.heroContent}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn}>
            <span style={{ 
              display: 'inline-block', 
              padding: '6px 16px', 
              background: '#FFF7ED', 
              color: '#F97316',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '14px',
              marginBottom: '24px'
            }}>
              🚀 Yangi avlod platformasi
            </span>
          </motion.div>

          <motion.h1 className={styles.heroTitle} variants={fadeIn}>
            <span className={styles.heroTitleHighlight}>"Restaran"</span> — bu restoraningizni yangi bosqichga olib chiquvchi zamonaviy platforma!
          </motion.h1>

          <motion.p className={styles.heroSubtitle} variants={fadeIn}>
            Tasavvur qiling, restoraningiz xuddi soatdek aniq va muammosiz ishlayapti. "Restaran" — bu shunchaki dastur emas, balki muassasangizning "raqamli miyasi". U eski qog'oz-qalamlar o'rniga barcha ishlarni telefon yoki kompyuter orqali oson, tez va xatosiz hal qilishga yordam beradi.
          </motion.p>

          <motion.div className={styles.heroButtons} variants={fadeIn}>
            <Link href="/register" className={styles.btnPrimary}>
              Boshlash <ArrowRight size={18} />
            </Link>
            <Link href="#features" className={styles.btnSecondary}>
              <PlayCircle size={18} /> Demo ko'rish
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Image / Dashboard Mockup */}
        <motion.div 
          className={styles.heroImageWrapper}
          initial="hidden"
          animate="visible"
          variants={scaleIn}
        >
          <img 
            src="/api/placeholder/1000/600" 
            alt="Restaran Dashboard UI Mockup" 
            className={styles.heroImage}
            style={{ display: 'none' }} // Hide placeholder if we don't have a real image yet, but keep wrapper for spacing
          />
          {/* Mockup UI representation */}
          <div style={{ padding: '4px', background: '#F3F4F6', borderRadius: '24px' }}>
             <div style={{ background: 'white', borderRadius: '20px', height: '400px', display: 'flex', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
               <div style={{ width: '220px', background: '#F9FAFB', borderRight: '1px solid #E5E7EB', padding: '24px' }}>
                  <div style={{ width: '70%', height: '24px', background: '#E5E7EB', borderRadius: '4px', marginBottom: '40px' }}></div>
                  <div style={{ width: '100%', height: '16px', background: '#F3F4F6', borderRadius: '4px', marginBottom: '16px' }}></div>
                  <div style={{ width: '80%', height: '16px', background: '#F3F4F6', borderRadius: '4px', marginBottom: '16px' }}></div>
                  <div style={{ width: '90%', height: '16px', background: '#F3F4F6', borderRadius: '4px', marginBottom: '16px' }}></div>
               </div>
               <div style={{ flex: 1, padding: '32px', background: '#ffffff' }}>
                  <div style={{ width: '30%', height: '32px', background: '#E5E7EB', borderRadius: '6px', marginBottom: '32px' }}></div>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
                    <div style={{ flex: 1, height: '120px', background: '#FFF7ED', borderRadius: '16px', border: '1px solid #FFEDD5' }}></div>
                    <div style={{ flex: 1, height: '120px', background: '#ECFDF5', borderRadius: '16px', border: '1px solid #D1FAE5' }}></div>
                    <div style={{ flex: 1, height: '120px', background: '#EFF6FF', borderRadius: '16px', border: '1px solid #DBEAFE' }}></div>
                  </div>
                  <div style={{ width: '100%', height: '180px', background: '#F9FAFB', borderRadius: '16px', border: '1px solid #F3F4F6' }}></div>
               </div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <motion.div 
          className={styles.featuresGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Card 1: Boss */}
          <motion.div className={`${styles.featureCard} ${styles.cardBoss}`} variants={fadeIn}>
            <div className={`${styles.iconWrapper} ${styles.iconOrange}`}>
              <Briefcase size={28} />
            </div>
            <h3 className={styles.featureTitle}>👨‍💼 Restoran rahbari (Boss) uchun: Hammasi nazorat ostida</h3>
            <p className={styles.featureDesc}>
              Dunyoning qaysi chekkasida bo'lmang, restoraningizda nimalar bo'layotganini kaftingizdagidek ko'rib turasiz. Qancha daromad bo'ldi, qayerga xarajat qilindi, eng xaridorgir taom qaysi — hammasi bitta ekranda. Xodimlarning oylik maoshini hisoblash ham endi bir necha soniyalik ish!
            </p>
          </motion.div>

          {/* Card 2: Chef */}
          <motion.div className={`${styles.featureCard} ${styles.cardChef}`} variants={fadeIn}>
            <div className={`${styles.iconWrapper} ${styles.iconRose}`}>
              <ChefHat size={28} />
            </div>
            <h3 className={styles.featureTitle}>👨‍🍳 Oshpazlar uchun: Qog'ozlarsiz ish</h3>
            <p className={styles.featureDesc}>
              Oshxonada qichqirib buyurtma aytish yoki yo'qolib qoladigan qog'oz cheklar o'tmishda qoldi. Ofitsiant buyurtma olishi bilan, oshpazning ekranida avtomatik tarzda yozuv paydo bo'ladi. Taom pishdimi? Bitta tugmani bosish kifoya. Ombor nazorati ham mavjud.
            </p>
          </motion.div>

          {/* Card 3: Waiter */}
          <motion.div className={`${styles.featureCard} ${styles.cardWaiter}`} variants={fadeIn}>
            <div className={`${styles.iconWrapper} ${styles.iconBlue}`}>
              <Smartphone size={28} />
            </div>
            <h3 className={styles.featureTitle}>🤵 Ofitsiantlar uchun: Tezlik va qulaylik</h3>
            <p className={styles.featureDesc}>
              Mijoz yoniga borib, buyurtmani planshet yoki telefonda bir zumda qabul qilishadi. Zal xaritasi orqali qaysi stol bo'shligini ko'rishadi. Mijoz qo'shimcha nimadir so'rasa, u to'g'ridan-to'g'ri oshxonaga yetib boradi — yugur-yugurga hojat yo'q!
            </p>
          </motion.div>

          {/* Card 4: Cashier */}
          <motion.div className={`${styles.featureCard} ${styles.cardCashier}`} variants={fadeIn}>
            <div className={`${styles.iconWrapper} ${styles.iconEmerald}`}>
              <CreditCard size={28} />
            </div>
            <h3 className={styles.featureTitle}>👩‍💻 Kassirlar uchun: Xatosiz hisob-kitob</h3>
            <p className={styles.featureDesc}>
              To'lovlarni ko'z ochib yumguncha qabul qilish, chek chiqarish yoki chegirmalar taqdim etish juda oson. Kechqurun kunlik kassani sanab, bosh qotirish shart emas — hisobotlar avtomatik o'zi tayyorlanadi.
            </p>
          </motion.div>

          {/* Card 5: Guest */}
          <motion.div className={`${styles.featureCard} ${styles.cardGuest}`} variants={fadeIn}>
            <div className={`${styles.iconWrapper} ${styles.iconPurple}`}>
              <Star size={28} />
            </div>
            <h3 className={styles.featureTitle}>👥 Mijozlar uchun: Zamonaviy xizmat</h3>
            <p className={styles.featureDesc}>
              Mehmonlar o'z telefonlarida chiroyli raqamli menyuni ko'zdan kechirishadi. Fikrlarini bemalol qoldirishlari yoki maxsus Telegram bot orqali to'g'ridan-to'g'ri rahbar bilan bog'lanib, o'z takliflarini bildirishlari mumkin.
            </p>
          </motion.div>

        </motion.div>
      </section>

      {/* CTA & Closing Section */}
      <section className={styles.cta}>
        <motion.div 
          className={styles.ctaCard}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.ctaOrb}></div>
          <p className={styles.ctaText}>
            Xullas... <span className={styles.ctaAccent}>"Restaran"</span> — bu muassasadagi tartibsizliklarga chek qo'yib, hamma narsani bir joyga jamlaydigan, xodimlarning ishini yengillashtirib, mijozlarni xursand qiladigan "sehrli yordamchi".
          </p>
          <Link href="/register" className={styles.btnPrimary} style={{ position: 'relative', zIndex: 10 }}>
            Hozir ulanish <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        © 2026 Restaran. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}

