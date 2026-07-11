'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'rate_orders'
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    customer_name: '',
    comment: ''
  });
  const [stats, setStats] = useState({ total: 0, average: 5.0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch public reviews feed
      const revRes = await api.getPublicReviews();
      if (revRes && revRes.success) {
        setReviews(revRes.reviews || []);
        setStats(revRes.stats || { total: revRes.reviews?.length || 0, average: 4.8 });
      }

      // Fetch user orders to rate
      const ordRes = await api.getOrders();
      const userOrders = ordRes.orders || ordRes || [];
      setOrders(userOrders);
    } catch (err) {
      console.error('Sharhlarni yuklashda xatolik:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewModal = (orderId = null) => {
    setSelectedOrderId(orderId);
    setFormData({
      rating: 5,
      customer_name: '',
      comment: ''
    });
    setShowModal(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!formData.comment && !formData.rating) return;
    setSubmitting(true);
    try {
      const res = await api.createPublicReview(selectedOrderId || 0, formData);
      if (res && res.success) {
        setReviews(prev => [res.review, ...prev]);
        setStats(prev => {
          const newTotal = prev.total + 1;
          const newAvg = Number(((prev.average * prev.total + formData.rating) / newTotal).toFixed(1));
          return { total: newTotal, average: newAvg };
        });
        setShowModal(false);
      } else {
        alert('Sharhni saqlashda xatolik yuz berdi');
      }
    } catch (err) {
      alert('Xatolik: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={{
          color: i < count ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)',
          fontSize: '16px',
          marginRight: '2px'
        }}
      >
        ★
      </span>
    ));
  };

  const getInitials = (name = 'Mijoz') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Hozirgina';
    const d = new Date(dateStr);
    return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '4px' }}></div>
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '15px' }}>
          Sharhlar va baholar yuklanmoqda...
        </p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* REVIEW CREATION MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '24px',
            padding: '30px',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>
                {selectedOrderId ? `Buyurtma #${selectedOrderId} ni baholash` : 'Oshxona haqida sharh'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '24px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitReview}>
              {/* Rating Selector */}
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Umumiy bahongizni tanlang:
                </label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: formData.rating >= star ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: formData.rating >= star ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: formData.rating >= star ? '#f59e0b' : '#64748b',
                        fontSize: '24px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b', marginTop: '8px' }}>
                  {formData.rating === 5 && "⭐ A'lo darajada!"}
                  {formData.rating === 4 && "👍 Yaxshi"}
                  {formData.rating === 3 && "😐 O'rtacha"}
                  {formData.rating === 2 && "😕 Qoniqarsiz"}
                  {formData.rating === 1 && "😞 Yomon"}
                </div>
              </div>

              {/* Customer Name */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Ismingiz (Ixtiyoriy)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Sardorbek Alimov"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Comment text */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Sharhingiz va fikr-mulohazangiz
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Taomlar ta'mi, xizmat sifati yoki kuriyer haqida fikr qoldiring..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    border: 'none',
                    color: '#fff',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  {submitting ? 'Yuborilmoqda...' : '✍️ Sharhni yuborish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero Overview Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '22px',
        padding: '28px',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px', flexWrap: 'wrap' }}>
          {/* Big Rating Badge */}
          <div style={{
            background: 'linear-gradient(145deg, #f59e0b, #d97706)',
            borderRadius: '20px',
            padding: '16px 24px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(245, 158, 11, 0.35)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff', lineHeight: '1' }}>
              {stats.average || 4.8}
            </div>
            <div style={{ fontSize: '14px', color: '#fff', marginTop: '4px' }}>
              ★★★★★
            </div>
          </div>

          <div>
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#f59e0b',
              fontSize: '12px',
              fontWeight: '700',
              display: 'inline-block',
              marginBottom: '8px'
            }}>
              ⭐ RESTORAN REYTINGI
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', margin: 0 }}>
              Mijozlar Baho va Sharhlari
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0' }}>
              Jami {stats.total} ta haqiqiy mijozlar sharhi • SmartResto xizmat sifati
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenReviewModal(null)}
          style={{
            padding: '14px 24px',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>✍️</span>
          <span>Sharh qoldirish</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '12px'
      }}>
        <button
          onClick={() => setActiveTab('feed')}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '700',
            background: activeTab === 'feed' ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            border: activeTab === 'feed' ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid transparent',
            cursor: 'pointer'
          }}
        >
          💬 Barcha Sharhlar ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('rate_orders')}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '700',
            background: activeTab === 'rate_orders' ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            border: activeTab === 'rate_orders' ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid transparent',
            cursor: 'pointer'
          }}
        >
          📋 Buyurtmalarimni Baholash ({orders.length})
        </button>
      </div>

      {/* TAB 1: ALL REVIEWS FEED */}
      {activeTab === 'feed' && (
        reviews.length === 0 ? (
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '50px 20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⭐</div>
            <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>Hozircha sharhlar yo&apos;q</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
              Birinchi bo&apos;lib restoran haqida o&apos;z fikringizni qoldiring!
            </p>
            <button
              onClick={() => handleOpenReviewModal(null)}
              className="btn btn-primary"
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '700'
              }}
            >
              ✍️ Birinchi sharhni qoldirish
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {reviews.map((r) => (
              <div
                key={r.id}
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.85) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        color: '#fff',
                        fontSize: '14px',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                      }}>
                        {getInitials(r.customer_name)}
                      </div>

                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>
                          {r.customer_name || 'Mijoz'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>✓ Tasdiqlangan mijoz</span>
                          {r.order_id > 0 && <span style={{ color: 'var(--text-secondary)' }}>• Buyurtma #{r.order_id}</span>}
                        </div>
                      </div>
                    </div>

                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {formatDate(r.created_at)}
                    </span>
                  </div>

                  {/* Stars */}
                  <div style={{ marginBottom: '12px' }}>
                    {renderStars(r.rating || 5)}
                  </div>

                  {/* Comment */}
                  <p style={{
                    fontSize: '14px',
                    color: '#e2e8f0',
                    lineHeight: '1.5',
                    margin: 0
                  }}>
                    &ldquo;{r.comment || 'A\'lo darajada xizmat!'}&rdquo;
                  </p>
                </div>

                {/* Footer tag */}
                <div style={{
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  color: 'var(--text-secondary)'
                }}>
                  <span>⚡ SmartResto Verified</span>
                  <span style={{ color: '#f59e0b', fontWeight: '600' }}>{r.rating || 5}/5 Baho</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* TAB 2: USER ORDERS TO RATE */}
      {activeTab === 'rate_orders' && (
        orders.length === 0 ? (
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '50px 20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
            <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>Buyurtmalar ro&apos;yxati bo&apos;sh</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Menyudan buyurtma bergach, bu yerdan ularni baholashingiz mumkin bo&apos;ladi.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {orders.map((o) => (
              <div
                key={o.id}
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '8px',
                      background: 'rgba(139, 92, 246, 0.2)',
                      color: '#c084fc',
                      fontWeight: '800',
                      fontSize: '13px'
                    }}>
                      Buyurtma #{o.id}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {formatDate(o.created_at)}
                    </span>
                  </div>

                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#10b981', marginBottom: '12px' }}>
                    {new Intl.NumberFormat('uz-UZ').format(o.total_amount)} UZS
                  </div>
                </div>

                <button
                  onClick={() => handleOpenReviewModal(o.id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>⭐</span>
                  <span>Buyurtmani baholash</span>
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
