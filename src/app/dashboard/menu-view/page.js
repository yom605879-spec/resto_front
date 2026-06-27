'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function MenuViewPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadMenu();
    api.getMe().then(setUser).catch(console.error);
  }, []);

  const loadMenu = async () => {
    try {
      const res = await api.getCategories(); // backend returns { categories } for authenticated users
      setCategories(res.categories || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      if (ex) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    try {
      await api.createOrder({
        customer_name: user?.first_name || user?.username || 'Mijoz',
        customer_phone: user?.phone || '',
        order_type: 'delivery',
        items: cart.map(i => ({
          menu_item_id: i.id,
          quantity: i.quantity
        }))
      });
      alert('Buyurtma qabul qilindi! "Mening buyurtmalarim" bo\'limidan kuzatishingiz mumkin.');
      setCart([]);
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  const totalCart = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px' }}>
      
      {/* Menyu */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Restoran Menyusi</h2>
        
        {categories.length === 0 ? (
          <div className="empty-state">Hozircha menyu bo'sh.</div>
        ) : (
          categories.map(cat => (
            <div key={cat.id} style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--accent-blue)', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>
                {cat.name}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                {cat.items?.filter(i => i.available).map(item => (
                  <div key={item.id} className="dashboard-card" style={{ padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 'bold' }}>{item.name}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '5px' }}>{item.description}</p>
                    </div>
                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>
                        {new Intl.NumberFormat('uz-UZ').format(item.price)} UZS
                      </span>
                      <button className="btn btn-sm btn-primary" onClick={() => addToCart(item)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Savatcha */}
      <div className="dashboard-card animate-fade-in" style={{ position: 'sticky', top: '20px', height: 'fit-content' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>🛒 Savatcha</h3>
        
        {cart.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center' }}>Savatchangiz bo'sh</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--accent-green)' }}>{item.quantity} x {new Intl.NumberFormat('uz-UZ').format(item.price)} UZS</div>
                </div>
                <button className="btn btn-sm btn-danger" style={{ padding: '4px 8px' }} onClick={() => removeFromCart(item.id)}>x</button>
              </div>
            ))}
            
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '10px', paddingTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
                <span>Jami:</span>
                <span style={{ color: 'var(--accent-green)' }}>{new Intl.NumberFormat('uz-UZ').format(totalCart)} UZS</span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '15px', padding: '12px' }} onClick={placeOrder}>
                Buyurtma berish
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
