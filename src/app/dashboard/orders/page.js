'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');
  const [user, setUser] = useState(null);

  // New order modal
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [cart, setCart] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUser(getUser());
    loadData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    try {
      const [ordersData, catData] = await Promise.all([
        api.getOrders(),
        api.getCategories(),
      ]);
      setOrders(ordersData.orders || ordersData || []);
      setCategories(catData.categories || catData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat().format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const map = {
      new: 'badge-new',
      cooking: 'badge-cooking',
      ready: 'badge-ready',
      served: 'badge-served',
      paid: 'badge-paid',
      cancelled: 'badge-cancelled',
    };
    return map[status] || 'badge-new';
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  // --- Cart management ---
  const addToCart = (item) => {
    const existing = cart.find((c) => (c._id || c.id) === (item._id || item.id));
    if (existing) {
      setCart(
        cart.map((c) =>
          (c._id || c.id) === (item._id || item.id) ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((c) => (c._id || c.id) !== itemId));
  };

  const updateQty = (itemId, delta) => {
    setCart(
      cart
        .map((c) =>
          (c._id || c.id) === itemId ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Add at least one item', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.createOrder({
        table_number: parseInt(tableNumber) || 1,
        items: cart.map((c) => ({
          menu_item: c._id || c.id,
          name: c.name,
          price: c.price,
          quantity: c.quantity,
        })),
        note: orderNote,
      });
      showToast('Order created successfully!');
      setShowNewOrder(false);
      setCart([]);
      setTableNumber('');
      setOrderNote('');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (order, newStatus) => {
    try {
      await api.updateOrderStatus(order._id || order.id, newStatus);
      showToast(`Order marked as ${newStatus}`);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const allMenuItems = categories.flatMap((cat) => cat.items || []).filter((item) => item.available !== false);

  return (
    <div>
      {error && (
        <div className="auth-error" style={{ marginBottom: '20px' }}>{error}</div>
      )}

      {/* Toolbar */}
      <div className="orders-toolbar">
        <div className="orders-filters">
          {['all', 'new', 'cooking', 'ready', 'served', 'paid', 'cancelled'].map((s) => (
            <button
              key={s}
              className={`filter-btn ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowNewOrder(true)}>
          + New Order
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No orders found</div>
          <div className="empty-state-desc">
            {filter === 'all' ? 'Create your first order!' : `No ${filter} orders right now`}
          </div>
        </div>
      ) : (
        <div>
          {filteredOrders.map((order) => (
            <div key={order._id || order.id} className="order-card animate-fade-in">
              <div className="order-card-header">
                <div>
                  <span className="order-id">
                    #{(order._id || order.id || '').slice(-6).toUpperCase()}
                  </span>
                  <span className="order-table-number" style={{ marginLeft: '12px' }}>
                    Table {order.table_number || '-'}
                  </span>
                </div>
                <span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span>
              </div>

              <div className="order-items">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="order-item">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {order.note && (
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px', fontStyle: 'italic' }}>
                  📝 {order.note}
                </p>
              )}

              <div className="order-total">
                <span>Total</span>
                <span style={{ color: 'var(--accent-green)' }}>
                  {formatCurrency(order.total_amount || order.total)}
                </span>
              </div>

              <div className="order-actions">
                {order.status === 'new' && (
                  <button
                    className="btn btn-blue btn-sm"
                    onClick={() => handleUpdateStatus(order, 'cooking')}
                  >
                    Start Cooking
                  </button>
                )}
                {order.status === 'cooking' && (
                  <button
                    className="btn btn-green btn-sm"
                    onClick={() => handleUpdateStatus(order, 'ready')}
                  >
                    Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUpdateStatus(order, 'served')}
                  >
                    Mark Served
                  </button>
                )}
                {(order.status === 'served' || order.status === 'ready') && (
                  <button
                    className="btn btn-green btn-sm"
                    onClick={() => handleUpdateStatus(order, 'paid')}
                  >
                    💰 Mark Paid
                  </button>
                )}
                {order.status !== 'cancelled' && order.status !== 'paid' && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleUpdateStatus(order, 'cancelled')}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Order Modal */}
      {showNewOrder && (
        <div className="modal-overlay" onClick={() => setShowNewOrder(false)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}
          >
            <div className="modal-header">
              <h2 className="modal-title">Create New Order</h2>
              <button className="modal-close" onClick={() => setShowNewOrder(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Table Number</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="1"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Note (optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Special requests..."
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                  />
                </div>
              </div>

              {/* Menu Items Selection */}
              <div className="new-order-section">
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  Select Items
                </h3>

                {categories.map((cat) => (
                  <div key={cat._id || cat.id} style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                      {cat.name}
                    </h4>
                    <div className="menu-select-grid">
                      {(cat.items || [])
                        .filter((item) => item.available !== false)
                        .map((item) => {
                          const inCart = cart.find((c) => (c._id || c.id) === (item._id || item.id));
                          return (
                            <div
                              key={item._id || item.id}
                              className={`menu-select-item ${inCart ? 'selected' : ''}`}
                              onClick={() => addToCart(item)}
                            >
                              <div>
                                <div className="menu-select-item-name">{item.name}</div>
                                {inCart && (
                                  <span style={{ fontSize: '12px', color: 'var(--primary-light)' }}>
                                    × {inCart.quantity} in cart
                                  </span>
                                )}
                              </div>
                              <span className="menu-select-item-price">
                                {formatCurrency(item.price)}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}

                {allMenuItems.length === 0 && (
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                    No menu items available. Add items in the Menu page first.
                  </p>
                )}
              </div>

              {/* Cart */}
              {cart.length > 0 && (
                <div className="new-order-section">
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Cart ({cart.length} items)
                  </h3>
                  <div className="cart-items">
                    {cart.map((item) => (
                      <div key={item._id || item.id} className="cart-item">
                        <span style={{ flex: 1 }}>{item.name}</span>
                        <div className="cart-item-qty">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQty(item._id || item.id, -1)}
                          >
                            −
                          </button>
                          <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQty(item._id || item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                        <span style={{ minWidth: '80px', textAlign: 'right', fontWeight: '600' }}>
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => removeFromCart(item._id || item.id)}
                          style={{ marginLeft: '8px', color: 'var(--accent-red)' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="order-total" style={{ marginTop: '16px' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--accent-green)', fontSize: '20px' }}>
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowNewOrder(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving || cart.length === 0}>
                  {saving ? 'Creating...' : `Create Order (${formatCurrency(cartTotal)})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
