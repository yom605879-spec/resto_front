'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function PaymentsClientPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('payme');
  const [phoneNumber, setPhoneNumber] = useState('+998 90 123 45 67');
  const [processing, setProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);

  useEffect(() => {
    loadUnpaidOrders();
  }, []);

  const loadUnpaidOrders = async () => {
    try {
      const res = await api.getOrders();
      const allOrders = res.orders || res || [];
      const unpaid = allOrders.filter(
        o => o.payment_status !== 'paid' && o.status !== 'cancelled'
      );
      setOrders(unpaid);
      if (unpaid.length > 0) {
        setSelectedOrder(unpaid[0]);
      }
    } catch (err) {
      console.error("To'lanmagan buyurtmalarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  const paymentGateways = [
    {
      id: 'payme',
      name: 'Payme',
      tagline: 'Tezkor va xavfsiz online to\'lov',
      color: '#00cccc',
      gradient: 'linear-gradient(135deg, rgba(0, 204, 204, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)',
      border: '#00cccc',
      icon: '🟢',
      badge: '0% komissiya'
    },
    {
      id: 'click',
      name: 'Click Up',
      tagline: 'Click Evolution / Telegram Bot',
      color: '#00a1f1',
      gradient: 'linear-gradient(135deg, rgba(0, 161, 241, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)',
      border: '#00a1f1',
      icon: '🔵',
      badge: 'Tezkor'
    },
    {
      id: 'uzum',
      name: 'Uzum Bank',
      tagline: 'Uzum Pay / Nasiya orqali',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)',
      border: '#8b5cf6',
      icon: '🟣',
      badge: 'Cashback 2%'
    },
    {
      id: 'cash',
      name: 'Kassa / Naqd pul',
      tagline: 'Kuriyerga yoki kassada to\'lash',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)',
      border: '#10b981',
      icon: '💵',
      badge: 'Naqd / Terminal'
    }
  ];

  const handleProcessPayment = async () => {
    if (!selectedOrder) return;
    setProcessing(true);
    try {
      // Smooth animated processing delay
      await new Promise(resolve => setTimeout(resolve, 1600));

      await api.updateOrder(selectedOrder.id, {
        payment_status: 'paid',
        payment_method: paymentMethod
      });

      // Show gorgeous celebration receipt modal
      setSuccessReceipt({
        id: selectedOrder.id,
        amount: selectedOrder.total_amount,
        method: paymentGateways.find(g => g.id === paymentMethod)?.name || paymentMethod,
        date: new Date().toLocaleString('uz-UZ'),
        receiptNumber: `SR-${Date.now().toString().slice(-6)}`
      });

      // Remove paid order from unpaid list
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
    } catch (err) {
      alert("To'lov xatoligi: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleString('uz-UZ', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '4px' }}></div>
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '15px' }}>
          To&apos;lov tizimi yuklanmoqda...
        </p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '50px' }}>
      {/* SUCCESS RECEIPT MODAL */}
      {successReceipt && (
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
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              margin: '0 auto 16px',
              boxShadow: '0 0 24px rgba(16, 185, 129, 0.4)'
            }}>
              🎉
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
              To&apos;lov muvaffaqiyatli qabul qilindi!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
              Buyurtma #{successReceipt.id} uchun elektron chek shakllantirildi.
            </p>

            {/* Receipt Card */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '16px',
              padding: '18px',
              border: '1px dashed rgba(255, 255, 255, 0.2)',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Chek raqami:</span>
                <span style={{ fontWeight: '700', color: '#fff' }}>{successReceipt.receiptNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>To&apos;lov tizimi:</span>
                <span style={{ fontWeight: '700', color: '#38bdf8' }}>{successReceipt.method}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Sana va vaqt:</span>
                <span style={{ color: '#ddd' }}>{successReceipt.date}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', color: '#fff' }}>Jami to&apos;landi:</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#10b981' }}>
                  {new Intl.NumberFormat('uz-UZ').format(successReceipt.amount)} UZS
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => {
                  setSuccessReceipt(null);
                  router.push(`/order/track/${successReceipt.id}`);
                }}
                className="btn btn-primary"
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                🚀 Kuzatish
              </button>
              <button
                onClick={() => setSuccessReceipt(null)}
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
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(15, 23, 42, 0.75) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        backdropFilter: 'blur(10px)'
      }}>
        <div>
          <span style={{
            padding: '5px 12px',
            borderRadius: '20px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#10b981',
            fontSize: '12px',
            fontWeight: '700',
            display: 'inline-block',
            marginBottom: '8px'
          }}>
            🔒 SSL 256-bit Xavfsiz Shifrlash
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: 0 }}>
            Online To&apos;lov va Kassa
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0' }}>
            Payme, Click, Uzum yoki naqd pul orqali tezkor va komissiyasiz to&apos;lov
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '10px 16px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>To&apos;lov kutilayotganlar:</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#f59e0b' }}>
              {orders.length} ta buyurtma
            </div>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={{
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px dashed rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          padding: '60px 20px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
            Barcha buyurtmalaringiz to&apos;langan!
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px' }}>
            Hozirda to&apos;lov kutilayotgan aktiv buyurtmalar yo&apos;q. Yangi taom buyurtma qilish uchun menyuni ko&apos;ring.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/dashboard/menu-view')}
              className="btn btn-primary"
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              🍕 Menyuga o&apos;tish
            </button>
            <button
              onClick={() => router.push('/dashboard/my-orders')}
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                fontWeight: '600',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              📋 Buyurtmalarim
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* LEFT COLUMN: Order Selector Cards */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>1️⃣</span>
              <span>To&apos;lanadigan buyurtmani tanlang:</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {orders.map(o => {
                const isSelected = selectedOrder && selectedOrder.id === o.id;

                return (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    style={{
                      background: isSelected
                        ? 'linear-gradient(145deg, rgba(139, 92, 246, 0.22) 0%, rgba(30, 41, 59, 0.9) 100%)'
                        : 'rgba(30, 41, 59, 0.6)',
                      border: isSelected
                        ? '2px solid #8b5cf6'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '18px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 10px 25px rgba(139, 92, 246, 0.25)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: isSelected ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontWeight: '800',
                          fontSize: '13px'
                        }}>
                          #{o.id}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          📅 {formatDate(o.created_at)}
                        </span>
                      </div>

                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: isSelected ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {isSelected ? '✓' : ''}
                      </div>
                    </div>

                    {/* Order summary info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '13px', color: '#e2e8f0' }}>
                        <div>{o.order_type === 'delivery' ? '🛵 Yetkazib berish' : '🍽️ Olib ketish'}</div>
                      </div>

                      <div style={{
                        fontSize: '18px',
                        fontWeight: '800',
                        color: isSelected ? '#10b981' : '#fff'
                      }}>
                        {new Intl.NumberFormat('uz-UZ').format(o.total_amount)} UZS
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Checkout & Gateway Selector */}
          {selectedOrder && (
            <div style={{
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 15px 40px rgba(0, 0, 0, 0.35)',
              backdropFilter: 'blur(12px)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>2️⃣</span>
                <span>To&apos;lov usulini tanlang:</span>
              </h3>

              {/* Gateway Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '20px'
              }}>
                {paymentGateways.map(gateway => {
                  const isActive = paymentMethod === gateway.id;
                  return (
                    <div
                      key={gateway.id}
                      onClick={() => setPaymentMethod(gateway.id)}
                      style={{
                        background: isActive ? gateway.gradient : 'rgba(15, 23, 42, 0.6)',
                        border: isActive ? `2px solid ${gateway.border}` : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '14px',
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        boxShadow: isActive ? `0 8px 24px rgba(0, 0, 0, 0.3)` : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{ fontSize: '20px' }}>{gateway.icon}</span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                          color: '#fff'
                        }}>
                          {gateway.badge}
                        </span>
                      </div>

                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff', marginBottom: '2px' }}>
                        {gateway.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {gateway.tagline}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Payment Widget Box */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                marginBottom: '20px'
              }}>
                {paymentMethod === 'cash' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ fontSize: '32px' }}>💵</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>
                        Naqd pul yoki Terminal orqali
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Buyurtma yetkazib berilganda kuriyerga yoki kassirga to&apos;lov qilasiz.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      To&apos;lov uchun telefon raqam yoki karta raqamini tasdiqlang:
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          background: 'rgba(30, 41, 59, 0.8)',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: '600',
                          outline: 'none'
                        }}
                      />
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        fontSize: '12px',
                        color: '#38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: '600'
                      }}>
                        SMS / Push
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Invoice Breakdown */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '20px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>Buyurtma summa (#{selectedOrder.id}):</span>
                  <span style={{ color: '#fff' }}>{new Intl.NumberFormat('uz-UZ').format(selectedOrder.total_amount)} UZS</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>Yetkazib berish xizmati:</span>
                  <span style={{ color: '#10b981', fontWeight: '600' }}>Bepul (0 UZS)</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Jami to&apos;lanadi:</span>
                  <span style={{ fontSize: '22px', fontWeight: '800', color: '#10b981' }}>
                    {new Intl.NumberFormat('uz-UZ').format(selectedOrder.total_amount)} UZS
                  </span>
                </div>
              </div>

              {/* Payment Action Button */}
              <button
                onClick={handleProcessPayment}
                disabled={processing}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: '800',
                  background: processing 
                    ? 'rgba(139, 92, 246, 0.5)' 
                    : 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#fff',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                {processing ? (
                  <>
                    <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }}></span>
                    <span>To&apos;lov amalga oshirilmoqda...</span>
                  </>
                ) : (
                  <>
                    <span>🔒</span>
                    <span>
                      {paymentGateways.find(g => g.id === paymentMethod)?.name} orqali to&apos;lash — {new Intl.NumberFormat('uz-UZ').format(selectedOrder.total_amount)} UZS
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
