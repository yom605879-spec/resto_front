'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadOrder = useCallback(async () => {
    try {
      const data = await api.trackPublicOrder(orderId);
      setOrder(data.order || data || null);
    } catch (err) {
      setError('Buyurtma ma\'lumotlarini olishda xatolik yuz berdi: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      loadOrder();
      // Poll every 8 seconds for status updates
      const interval = setInterval(loadOrder, 8000);
      return () => clearInterval(interval);
    }
  }, [orderId, loadOrder]);

  const getStepStatus = (stepName) => {
    if (!order) return 'upcoming';
    const status = order.status;

    const statusFlow = ['new', 'cooking', 'ready', 'served', 'completed'];
    const currentIdx = statusFlow.indexOf(status);
    const stepIdx = statusFlow.indexOf(stepName);

    if (status === 'cancelled') {
      return 'cancelled';
    }

    if (currentIdx >= stepIdx) {
      return currentIdx === stepIdx ? 'active' : 'completed';
    }
    return 'upcoming';
  };

  const handleSendReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.createPublicReview(orderId, { rating, comment });
      setReviewSuccess(true);
      showToast("Fikringiz uchun rahmat!");
      loadOrder();
    } catch (err) {
      showToast("Fikr yuborishda xatolik: " + err.message, "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount || 0) + ' UZS';
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p style={{ marginTop: '15px', color: 'var(--text-secondary)' }}>Buyurtma holati yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>Buyurtma topilmadi</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            {error || "Kechirasiz, buyurtma ID noto'g'ri kiritilgan yoki buyurtma mavjud emas."}
          </p>
          <button className="btn btn-primary" onClick={() => router.push('/')}>Bosh sahifaga qaytish</button>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '40px 24px' }}>
      {toast && (
        <div className={`toast toast-${toast.type}`} style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          background: toast.type === 'error' ? 'var(--gradient-red)' : 'var(--gradient-green)',
          padding: '12px 24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
          color: '#fff', fontWeight: '600'
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Restaurant Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>✦ {order.restaurant_name || "Restoran"}</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginTop: '5px' }}>
            Buyurtma ID: #{order.id} • {new Date(order.created_at).toLocaleTimeString()}
          </p>
        </div>

        {/* Progress Tracker Card */}
        <div className="glass-card-static" style={{ padding: '30px', marginBottom: '24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '30px' }}>
            {order.status === 'new' && '🔵 Buyurtmangiz qabul qilindi!'}
            {order.status === 'cooking' && '🍳 Oshpaz taomingizni tayyorlamoqda...'}
            {order.status === 'ready' && '🔔 Taom tayyor! Tez orada olib borishadi.'}
            {order.status === 'served' && '🎉 Taom yetkazildi. Yoqimli ishtaha!'}
            {order.status === 'completed' && '✅ Buyurtma yakunlandi.'}
            {order.status === 'cancelled' && '❌ Buyurtma bekor qilindi.'}
          </h2>

          {order.status === 'cancelled' ? (
            <div style={{ padding: '20px', borderRadius: 'var(--radius-md)', background: 'rgba(225, 112, 85, 0.1)', color: 'var(--accent-red)', fontWeight: '600' }}>
              Afsuski, ushbu buyurtma bekor qilingan. Qo'shimcha ma'lumot olish uchun restoran xodimlari bilan bog'laning.
            </div>
          ) : (
            <div className="tracking-timeline" style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '20px', padding: '0 10px' }}>
              {/* Timeline Connector Line */}
              <div style={{
                position: 'absolute', top: '20px', left: '30px', right: '30px', height: '3px',
                background: 'var(--border-color)', zIndex: 1
              }}></div>

              {/* Steps */}
              {[
                { key: 'new', label: 'Qabul qilindi', icon: '📝' },
                { key: 'cooking', label: 'Tayyorlanmoqda', icon: '🍳' },
                { key: 'ready', label: 'Tayyor', icon: '🔔' },
                { key: 'served', label: 'Yetkazildi', icon: '🎉' }
              ].map((step, index) => {
                const stepStatus = getStepStatus(step.key);
                const isActive = stepStatus === 'active';
                const isCompleted = stepStatus === 'completed';
                
                return (
                  <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', width: '70px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px',
                      background: isCompleted ? 'var(--gradient-green)' : (isActive ? 'var(--gradient-primary)' : 'var(--bg-secondary)'),
                      border: isActive ? '2px solid #fff' : '2px solid var(--border-color)',
                      boxShadow: isActive ? 'var(--shadow-glow-primary)' : (isCompleted ? 'var(--shadow-glow-green)' : 'none'),
                      transition: 'all 0.3s ease'
                    }}>
                      {isCompleted ? '✓' : step.icon}
                    </div>
                    <span style={{
                      fontSize: '11px', marginTop: '10px', textAlign: 'center',
                      fontWeight: isActive || isCompleted ? '700' : '500',
                      color: isActive ? 'var(--primary-light)' : (isCompleted ? 'var(--accent-green)' : 'var(--text-tertiary)'),
                      whiteSpace: 'nowrap'
                    }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Details Card */}
        <div className="glass-card-static" style={{ padding: '30px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            📋 Buyurtma tafsilotlari
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Mijoz:</span>
              <span style={{ fontWeight: '600' }}>{order.customer_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Xizmat ko'rsatish turi:</span>
              <span style={{ fontWeight: '600' }}>
                {order.order_type === 'dine_in' && `Stolda (Stol raqami: ${order.table_number})`}
                {order.order_type === 'takeaway' && 'Olib ketish'}
                {order.order_type === 'delivery' && 'Yetkazib berish'}
              </span>
            </div>
            {order.notes && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Izoh:</span>
                <span style={{ fontStyle: 'italic' }}>{order.notes}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>To'lov holati:</span>
              <span style={{
                fontWeight: '700',
                color: order.payment_status === 'paid' ? 'var(--accent-green)' : 'var(--accent-red)'
              }}>
                {order.payment_status === 'paid' ? 'To\'langan' : 'To\'lanmagan (Kuting)'}
              </span>
            </div>

            {/* Items list */}
            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Taomlar</span>
              <div style={{ marginTop: '8px' }}>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' }}>
                    <span>{item.item_name} <span style={{ color: 'var(--text-tertiary)' }}>× {item.quantity}</span></span>
                    <span style={{ fontWeight: '600' }}>{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '10px' }}>
              <span>Jami:</span>
              <span style={{ color: 'var(--accent-green)' }}>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Rating and Review Card (Only shown if served or completed) */}
        {['served', 'completed'].includes(order.status) && (
          <div className="glass-card-static" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '10px', textAlign: 'center' }}>
              ⭐ Fikr-mulohaza qoldiring
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>
              Taom va xizmat ko'rsatish sifatimizni oshirishga yordam bering!
            </p>

            {(reviewSuccess || order.review) ? (
              <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(0, 184, 148, 0.1)', border: '1px solid rgba(0, 184, 148, 0.2)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ color: 'var(--accent-green)', fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>🎉 Sharhingiz uchun rahmat!</div>
                <div style={{ fontSize: '20px', color: 'var(--accent-yellow)', marginBottom: '5px' }}>
                  {'★'.repeat(order.review?.rating || rating)}{'☆'.repeat(5 - (order.review?.rating || rating))}
                </div>
                <p style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  "{order.review?.comment || comment}"
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendReview} className="auth-form" style={{ textAlign: 'center' }}>
                {/* Stars container */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px', fontSize: '32px', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        color: (hoverRating || rating) >= star ? 'var(--accent-yellow)' : 'var(--text-muted)',
                        transition: 'color 0.1s ease'
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <textarea
                    className="form-input"
                    placeholder="Sharhingizni yozing (ixtiyoriy)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ minHeight: '80px', resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', background: 'var(--gradient-primary)' }}
                  disabled={submittingReview}
                >
                  {submittingReview ? "Yuborilmoqda..." : "Sharh yuborish ✉️"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
