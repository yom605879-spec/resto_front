'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.getOrders();
      setOrders(res.orders || res || []);
    } catch (err) {
      console.error('Buyurtmalarni yuklashda xatolik:', err);
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const totalCount = orders.length;
    const activeCount = orders.filter(o => ['new', 'cooking', 'ready'].includes(o.status)).length;
    const totalSpent = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    return { totalCount, activeCount, totalSpent };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Search filter
      const matchesSearch = !searchQuery || 
        o.id.toString().includes(searchQuery) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Status tab filter
      if (activeFilter === 'active') {
        return ['new', 'cooking', 'ready'].includes(o.status);
      }
      if (activeFilter === 'completed') {
        return ['served', 'completed'].includes(o.status);
      }
      if (activeFilter === 'cancelled') {
        return o.status === 'cancelled';
      }
      return true;
    });
  }, [orders, activeFilter, searchQuery]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'new':
        return {
          label: 'Qabul qilindi',
          step: 1,
          color: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.15)',
          border: 'rgba(59, 130, 246, 0.4)',
          icon: '🕒'
        };
      case 'cooking':
        return {
          label: 'Tayyorlanmoqda',
          step: 2,
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.4)',
          icon: '👨‍🍳'
        };
      case 'ready':
        return {
          label: 'Yo\'lda / Tayyor',
          step: 3,
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.4)',
          icon: '🚀'
        };
      case 'served':
      case 'completed':
        return {
          label: 'Yetkazildi',
          step: 4,
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.4)',
          icon: '✅'
        };
      case 'cancelled':
        return {
          label: 'Bekor qilingan',
          step: 0,
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.4)',
          icon: '❌'
        };
      default:
        return {
          label: status || 'Kutilmoqda',
          step: 1,
          color: '#a855f7',
          bg: 'rgba(168, 85, 247, 0.15)',
          border: 'rgba(168, 85, 247, 0.4)',
          icon: '📋'
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleString('uz-UZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '4px' }}></div>
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '15px' }}>
          Buyurtmalar yuklanmoqda...
        </p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* 1. Hero Stats Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Stat Card 1 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(30, 41, 59, 0.7) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'rgba(139, 92, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            🛍️
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Jami Buyurtmalar
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#fff' }}>
              {stats.totalCount} ta
            </div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(30, 41, 59, 0.7) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            🔥
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Jarayonda (Faol)
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#f59e0b' }}>
              {stats.activeCount} ta
            </div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(30, 41, 59, 0.7) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            💎
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Jami Sarflangan
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#10b981' }}>
              {new Intl.NumberFormat('uz-UZ').format(stats.totalSpent)} UZS
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        marginBottom: '24px'
      }}>
        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '5px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {[
            { id: 'all', label: `Barchasi (${orders.length})` },
            { id: 'active', label: `Faol (${stats.activeCount})` },
            { id: 'completed', label: 'Yetkazildi' },
            { id: 'cancelled', label: 'Bekor qilingan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: activeFilter === tab.id ? '700' : '500',
                background: activeFilter === tab.id 
                  ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' 
                  : 'transparent',
                color: activeFilter === tab.id ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeFilter === tab.id ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '260px', maxWidth: '100%' }}>
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Buyurtma ID qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 36px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
          />
        </div>
      </div>

      {/* 3. Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div style={{
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px dashed rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          padding: '60px 20px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
            Buyurtmalar topilmadi
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '380px', margin: '0 auto 20px' }}>
            Tanlangan filtr bo&apos;yicha hech qanday buyurtma yo&apos;q yoki hali buyurtma bermagansiz.
          </p>
          <button
            onClick={() => router.push('/dashboard/menu-view')}
            className="btn btn-primary"
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
              border: 'none',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            🍕 Menyuni ko&apos;rish va buyurtma berish
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '20px'
        }}>
          {filteredOrders.map(o => {
            const statusInfo = getStatusInfo(o.status);

            return (
              <div
                key={o.id}
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.9) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  padding: '20px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(139, 92, 246, 0.18)';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.25)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                <div>
                  {/* Card Header: Order ID + Status Badge */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                        color: '#fff',
                        fontWeight: '800',
                        fontSize: '14px',
                        letterSpacing: '0.3px',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                      }}>
                        #{o.id}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        📅 {formatDate(o.created_at)}
                      </span>
                    </div>

                    <span style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      background: statusInfo.bg,
                      color: statusInfo.color,
                      border: `1px solid ${statusInfo.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span>{statusInfo.icon}</span>
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>

                  {/* Order Type & Payment Status Ribbon */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px',
                    padding: '10px 12px',
                    background: 'rgba(15, 23, 42, 0.5)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.04)'
                  }}>
                    <div style={{ fontSize: '12px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{o.order_type === 'delivery' ? '🛵 Yetkazib berish' : '🍽️ Olib ketish'}</span>
                    </div>
                    <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: o.payment_status === 'paid' ? '#10b981' : '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>{o.payment_status === 'paid' ? '✅ To\'langan' : '⏳ To\'lanmagan'}</span>
                    </div>
                  </div>

                  {/* Visual 4-Step Progress Line (Only for non-cancelled orders) */}
                  {o.status !== 'cancelled' && (
                    <div style={{ marginBottom: '18px' }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '6px',
                        alignItems: 'center'
                      }}>
                        {[
                          { step: 1, label: 'Qabul' },
                          { step: 2, label: 'Oshxona' },
                          { step: 3, label: 'Yo\'lda' },
                          { step: 4, label: 'Yetkazildi' }
                        ].map((item) => {
                          const isActive = statusInfo.step >= item.step;
                          const isCurrent = statusInfo.step === item.step;
                          return (
                            <div key={item.step} style={{ textAlign: 'center' }}>
                              <div style={{
                                height: '5px',
                                borderRadius: '3px',
                                background: isActive 
                                  ? 'linear-gradient(90deg, #3b82f6, #10b981)' 
                                  : 'rgba(255, 255, 255, 0.1)',
                                transition: 'all 0.3s ease',
                                boxShadow: isCurrent ? '0 0 8px #10b981' : 'none',
                                marginBottom: '6px'
                              }}></div>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: isActive ? '700' : '400',
                                color: isActive ? '#10b981' : 'var(--text-secondary)'
                              }}>
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Items Chips / Summary */}
                  {o.items && o.items.length > 0 && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      marginBottom: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>
                        Buyurtma tarkibi ({o.items.length} ta taom):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {o.items.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '12px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              background: 'rgba(139, 92, 246, 0.15)',
                              color: '#ddd',
                              border: '1px solid rgba(139, 92, 246, 0.25)'
                            }}
                          >
                            <b>{item.quantity}x</b> {item.item_name}
                          </span>
                        ))}
                        {o.items.length > 3 && (
                          <span style={{
                            fontSize: '11px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: 'var(--text-secondary)'
                          }}>
                            +{o.items.length - 3} ta
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Price + Action Buttons */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '16px',
                  marginTop: '4px'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Jami Summa
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      background: 'linear-gradient(90deg, #10b981, #38bdf8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {new Intl.NumberFormat('uz-UZ').format(o.total_amount)} UZS
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Track Order Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/order/track/${o.id}`);
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '600',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>🚀</span>
                      <span>Kuzatish</span>
                    </button>

                    {/* Pay Button if Unpaid */}
                    {o.payment_status !== 'paid' && o.status !== 'cancelled' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push('/dashboard/payments-client');
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '700',
                          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                          border: 'none',
                          color: '#fff',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>💳</span>
                        <span>To&apos;lash</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
