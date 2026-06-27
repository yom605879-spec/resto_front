'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

export default function OrderTakePage() {
  const searchParams = useSearchParams();
  const preSelectedTable = searchParams.get('table');

  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [selectedTable, setSelectedTable] = useState(preSelectedTable || '');
  const [guestCount, setGuestCount] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    Promise.all([api.getCategories(), api.getTables()])
      .then(([catsRes, tablesRes]) => {
        setCategories(catsRes.categories || catsRes || []);
        setTables(tablesRes.tables || tablesRes || []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      if (ex) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(i => {
      if(i.id === id) return { ...i, quantity: Math.max(1, i.quantity + delta) };
      return i;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const placeOrder = async () => {
    if (!selectedTable) return alert('Iltimos, stol raqamini tanlang!');
    if (cart.length === 0) return alert('Savatcha bo\'sh!');

    try {
      await api.createOrder({
        table_number: selectedTable,
        order_type: 'dine_in',
        notes: `Ofitsiant: Mijozlar soni ${guestCount}. ${notes}`,
        items: cart.map(i => ({ menu_item_id: i.id, quantity: i.quantity }))
      });
      alert('Buyurtma oshxonaga yuborildi!');
      window.location.href = '/dashboard/orders';
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  const totalCart = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', height: 'calc(100vh - 150px)' }}>
      
      {/* Menyu Qismi (Chap) */}
      <div style={{ overflowY: 'auto', paddingRight: '10px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Menyu</h2>
        {categories.map(cat => (
          <div key={cat.id} style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--accent-yellow)', marginBottom: '15px' }}>{cat.name}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
              {cat.items?.filter(i => i.available).map(item => (
                <div key={item.id} className="glass-card" style={{ padding: '15px', cursor: 'pointer', textAlign: 'center' }} onClick={() => addToCart(item)}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>{item.name}</h4>
                  <div style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>{new Intl.NumberFormat('uz-UZ').format(item.price)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Savatcha Qismi (O'ng) */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
          📝 Yangi Buyurtma
        </h3>

        <div className="form-group">
          <label className="form-label">Stol Raqami</label>
          <select className="form-select" value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
            <option value="">Tanlang...</option>
            {tables.map(t => (
              <option key={t.id} value={t.table_number}>Stol #{t.table_number} ({t.capacity} kishilik)</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Mijozlar Soni</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setGuestCount(Math.max(1, guestCount - 1))}>-</button>
            <span style={{ fontSize: '18px', fontWeight: 'bold', width: '30px', textAlign: 'center' }}>{guestCount}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setGuestCount(guestCount + 1)}>+</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', marginTop: '10px', marginBottom: '10px', paddingRight: '5px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>Savatcha bo'sh</div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--accent-green)' }}>{new Intl.NumberFormat('uz-UZ').format(item.price)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={() => updateQuantity(item.id, -1)}>-</button>
                  <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={() => updateQuantity(item.id, 1)}>+</button>
                  <button className="btn btn-sm btn-red" onClick={() => removeFromCart(item.id)}>🗑</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="form-group">
          <input type="text" className="form-input" placeholder="Oshpazga izoh (Masalan: Tuzsiz)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
            <span>Jami:</span>
            <span style={{ color: 'var(--accent-green)' }}>{new Intl.NumberFormat('uz-UZ').format(totalCart)} UZS</span>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '16px' }} onClick={placeOrder}>
            Oshxonaga Jo'natish
          </button>
        </div>

      </div>
    </div>
  );
}
