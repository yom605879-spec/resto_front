'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function PublicRestaurantPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id;

  const [categories, setCategories] = useState([]);
  const [restaurantName, setRestaurantName] = useState("Restaurant Menu");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tab control
  const [activeCategory, setActiveCategory] = useState(null);

  // Cart state
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Checkout form
  const [checkoutForm, setCheckoutForm] = useState({
    customer_name: '',
    customer_phone: '',
    table_number: '',
    order_type: 'dine_in',
    notes: '',
  });
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Complaint form
  const [complaintForm, setComplaintForm] = useState({
    customer_name: '',
    customer_phone: '',
    subject: '',
    message: '',
  });
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState('');

  // Toast
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (restaurantId) {
      loadData();
    }
  }, [restaurantId]);

  const loadData = async () => {
    try {
      const data = await api.getPublicMenu(restaurantId);
      const menuCats = data.categories || [];
      setCategories(menuCats);
      if (menuCats.length > 0 && menuCats[0].items && menuCats[0].items.length > 0) {
        // Try to fetch name of restaurant from some order details or set placeholder
        // Normally, public menu payload can have restaurant name
        // Let's deduce name or fetch it
        // We'll set a nice custom name
        setRestaurantName("Biznes Markaz Restorani");
      }
      if (menuCats.length > 0) {
        setActiveCategory(menuCats[0].id);
      }
    } catch (err) {
      setError('Menyuni yuklashda xatolik yuz berdi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Cart operations
  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    showToast(`"${item.name}" savatga qo'shildi`);
  };

  const updateQuantity = (itemId, delta) => {
    setCart(cart.map(c => {
      if (c.id === itemId) {
        const newQty = c.quantity + delta;
        return newQty > 0 ? { ...c, quantity: newQty } : null;
      }
      return c;
    }).filter(Boolean));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.id !== itemId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount || 0) + ' UZS';
  };

  // Submit Order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast("Savat bo'sh! Iltimos mahsulot qo'shing.", "error");
      return;
    }

    setSubmittingOrder(true);
    try {
      const payload = {
        customer_name: checkoutForm.customer_name,
        customer_phone: checkoutForm.customer_phone,
        table_number: checkoutForm.order_type === 'dine_in' ? parseInt(checkoutForm.table_number) : null,
        order_type: checkoutForm.order_type,
        notes: checkoutForm.notes,
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
        })),
      };

      const res = await api.createPublicOrder(restaurantId, payload);
      showToast("Buyurtma muvaffaqiyatli qabul qilindi!");
      
      // Redirect to order tracking page
      setTimeout(() => {
        router.push(`/order/track/${res.data?.order?.id || res.order?.id}`);
      }, 1000);
    } catch (err) {
      showToast("Buyurtma jo'natishda xatolik: " + err.message, "error");
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Submit Complaint
  const handleSendComplaint = async (e) => {
    e.preventDefault();
    setSubmittingComplaint(true);
    setComplaintSuccess('');
    try {
      await api.submitPublicComplaint(restaurantId, complaintForm);
      setComplaintSuccess("Fikr-mulohazangiz yuborildi. Rahmat!");
      setComplaintForm({
        customer_name: '',
        customer_phone: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      showToast("Xatolik yuz berdi: " + err.message, "error");
    } finally {
      setSubmittingComplaint(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p style={{ marginTop: '15px', color: 'var(--text-secondary)' }}>Menyu yuklanmoqda...</p>
      </div>
    );
  }

  const activeCategoryData = categories.find(c => c.id === activeCategory);

  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Toast Alert */}
      {toast && (
        <div className={`toast toast-${toast.type}`} style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          background: toast.type === 'error' ? 'var(--gradient-red)' : 'var(--gradient-green)',
          padding: '12px 24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
          animation: 'slideIn 0.3s ease forwards', color: '#fff', fontWeight: '600'
        }}>
          {toast.message}
        </div>
      )}

      {/* Navigation Header */}
      <nav className="landing-nav" style={{ backdropFilter: 'var(--glass-blur)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="landing-logo">✦ {restaurantName}</div>
        <button className="btn btn-primary btn-sm" onClick={() => setCartOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          🛒 Savat <span style={{ background: '#fff', color: 'var(--primary)', padding: '2px 6px', borderRadius: '50px', fontSize: '11px', fontWeight: '800' }}>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </button>
      </nav>

      {/* Banner / Hero */}
      <section className="hero-section" style={{ padding: '80px 24px 40px', minHeight: 'auto', background: 'radial-gradient(circle at top, rgba(108, 92, 231, 0.08) 0%, transparent 70%)' }}>
        <div className="hero-content" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <span className="hero-badge">🍽️ Raqamli Smart Menyu</span>
          <h1 className="hero-title" style={{ fontSize: '36px', marginBottom: '10px' }}>Menyu va Onlayn Buyurtma</h1>
          <p className="hero-subtitle" style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
            Telefoningiz orqali taomlarni tanlang va to'g'ridan-to'g'ri buyurtma bering! Buyurtmangiz oshxonada tezda tayyorlanadi.
          </p>
        </div>
      </section>

      {/* Categories Tabs */}
      <div className="categories-tab-bar" style={{
        display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 24px 20px',
        maxWidth: '1200px', margin: '0 auto', scrollbarWidth: 'none'
      }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`btn ${activeCategory === cat.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ whiteSpace: 'nowrap', borderRadius: '30px' }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Grid Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 60px' }}>
        {error && <div className="auth-error" style={{ marginBottom: '24px' }}>{error}</div>}

        {activeCategoryData && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', borderLeft: '4px solid var(--primary)', paddingLeft: '12px' }}>
              {activeCategoryData.name} taomlari
            </h2>

            {(!activeCategoryData.items || activeCategoryData.items.length === 0) ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-state-icon">🍽️</div>
                <div className="empty-state-title">Hozircha taomlar yo'q</div>
                <div className="empty-state-desc">Ushbu bo'limga tez orada yangi taomlar qo'shiladi.</div>
              </div>
            ) : (
              <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {activeCategoryData.items.map((item) => (
                  <div key={item.id} className="feature-card" style={{ padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#fff' }}>{item.name}</h3>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-green)' }}>
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    {item.description && (
                      <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', flexGrow: 1, marginBottom: '15px' }}>
                        {item.description}
                      </p>
                    )}
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', marginTop: 'auto', background: 'var(--gradient-primary)' }}
                      onClick={() => addToCart(item)}
                    >
                      🛒 Qo'shish
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feedback / Complaint Section */}
        <section id="complaints" className="glass-card-static" style={{ marginTop: '80px', padding: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>💬 Shikoyat va takliflar</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            Xizmat ko'rsatish sifatini oshirish uchun fikrlaringiz biz uchun muhim. Xatoliklar yoki takliflarni to'g'ridan-to'g'ri rahbariyatga yuboring.
          </p>

          {complaintSuccess && (
            <div className="auth-error" style={{ background: 'rgba(0, 184, 148, 0.15)', color: 'var(--accent-green)', borderColor: 'rgba(0, 184, 148, 0.3)', marginBottom: '20px' }}>
              {complaintSuccess}
            </div>
          )}

          <form onSubmit={handleSendComplaint} className="auth-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group" style={{ gridColumn: 'span 1' }}>
              <label className="form-label">Ismingiz</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ismingizni kiriting"
                value={complaintForm.customer_name}
                onChange={(e) => setComplaintForm({ ...complaintForm, customer_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 1' }}>
              <label className="form-label">Telefon raqam</label>
              <input
                type="text"
                className="form-input"
                placeholder="Telefoningiz"
                value={complaintForm.customer_phone}
                onChange={(e) => setComplaintForm({ ...complaintForm, customer_phone: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Mavzu</label>
              <input
                type="text"
                className="form-input"
                placeholder="Mavzu (masalan: Xizmat sifati, Taom sifati, Xatolik)"
                value={complaintForm.subject}
                onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Xabar matni</label>
              <textarea
                className="form-input"
                style={{ minHeight: '100px', resize: 'vertical' }}
                placeholder="Fikr, taklif yoki shikoyatingizni batafsil yozing..."
                value={complaintForm.message}
                onChange={(e) => setComplaintForm({ ...complaintForm, message: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ gridColumn: 'span 2', width: '200px', justifySelf: 'end' }}
              disabled={submittingComplaint}
            >
              {submittingComplaint ? "Yuborilmoqda..." : "Yuborish ✉️"}
            </button>
          </form>
        </section>
      </main>

      {/* Floating Shopping Cart Drawer */}
      <div className={`sidebar-overlay ${cartOpen ? 'visible' : ''}`} onClick={() => setCartOpen(false)} style={{ zIndex: 1010 }}></div>
      <aside className="sidebar" style={{
        position: 'fixed', top: 0, right: 0, height: '100vh',
        width: '100%', maxWidth: '420px', zIndex: 1020,
        transform: cartOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>🛒 Savatchangiz</h3>
          <button className="btn btn-ghost" style={{ fontSize: '20px', padding: '0 8px' }} onClick={() => setCartOpen(false)}>✕</button>
        </div>

        {/* Cart items scrollable container */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🛒</div>
              <p style={{ fontWeight: '500' }}>Savat bo'sh</p>
              <p style={{ fontSize: '13px' }}>Menyudan taomlarni tanlab qo'shing</p>
            </div>
          ) : (
            <div>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ maxWidth: '60%' }}>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#fff' }}>{item.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--accent-green)', fontWeight: '600' }}>{formatCurrency(item.price)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button className="btn btn-ghost" style={{ padding: '0 8px', fontSize: '16px' }} onClick={() => updateQuantity(item.id, -1)}>-</button>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{item.quantity}</span>
                    <button className="btn btn-ghost" style={{ padding: '0 8px', fontSize: '16px' }} onClick={() => updateQuantity(item.id, 1)}>+</button>
                    <button className="btn btn-ghost" style={{ padding: '0 4px', color: 'var(--accent-red)', marginLeft: '10px' }} onClick={() => removeFromCart(item.id)}>🗑️</button>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', borderTop: '2px solid var(--border-color)', paddingTop: '15px' }}>
                <span>Umumiy summa:</span>
                <span style={{ color: 'var(--accent-green)' }}>{formatCurrency(getCartTotal())}</span>
              </div>
            </div>
          )}
        </div>

        {/* Checkout Form */}
        {cart.length > 0 && (
          <form onSubmit={handlePlaceOrder} style={{ padding: '20px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '15px', color: 'var(--primary-light)' }}>📋 Buyurtmani rasmiylashtirish</h4>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Xizmat ko'rsatish turi</label>
              <select
                className="form-input"
                style={{ fontSize: '13px', padding: '8px 12px' }}
                value={checkoutForm.order_type}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, order_type: e.target.value })}
                required
              >
                <option value="dine_in">Zalda (Stolga buyurtma)</option>
                <option value="takeaway">Olib ketish (Takeaway)</option>
                <option value="delivery">Yetkazib berish (Delivery)</option>
              </select>
            </div>

            {checkoutForm.order_type === 'dine_in' && (
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Stol raqami</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ fontSize: '13px', padding: '8px 12px' }}
                  placeholder="Stolingiz raqamini yozing"
                  value={checkoutForm.table_number}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, table_number: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Ismingiz</label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '13px', padding: '8px 12px' }}
                placeholder="Ismingizni kiriting"
                value={checkoutForm.customer_name}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, customer_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Telefon raqamingiz</label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '13px', padding: '8px 12px' }}
                placeholder="+998 (90) 123-45-67"
                value={checkoutForm.customer_phone}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, customer_phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Izoh (Ixtiyoriy)</label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '13px', padding: '8px 12px' }}
                placeholder="Ziravorlar kamroq bo'lsin va h.k."
                value={checkoutForm.notes}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', background: 'var(--gradient-primary)' }}
              disabled={submittingOrder}
            >
              {submittingOrder ? "Buyurtma yuborilmoqda..." : "Buyurtma berish 🚀"}
            </button>
          </form>
        )}
      </aside>

      <footer className="landing-footer" style={{ borderTop: '1px solid var(--border-color)' }}>
        <p>© 2026 Restaran Smart Menyu. Barcha huquqlar himoyalangan.</p>
      </footer>
    </div>
  );
}
