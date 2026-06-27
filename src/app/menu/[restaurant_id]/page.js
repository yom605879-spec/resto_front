'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function PublicMenuPage({ params }) {
  const resolvedParams = use(params);
  const restaurantId = resolvedParams.restaurant_id;
  
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get('table') || '';
  
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, [restaurantId]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/menu/public/${restaurantId}`);
      setCategories(res.categories || []);
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const getApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    return 'http://localhost:5000/api';
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${getApiUrl().replace('/api', '')}${url}`;
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQ = i.quantity + delta;
        return newQ > 0 ? { ...i, quantity: newQ } : i;
      }
      return i;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerForm.name) {
      alert("Iltimos, ismingizni kiriting");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_name: customerForm.name,
        customer_phone: customerForm.phone,
        table_number: tableNumber ? parseInt(tableNumber) : null,
        order_type: tableNumber ? 'dine_in' : 'takeaway',
        payment_method: 'cash', // Default
        items: cart.map(i => ({ menu_item_id: i.id, quantity: i.quantity }))
      };

      const res = await api.post(`/orders/public/${restaurantId}`, payload);
      
      // Redirect to tracking page
      router.push(`/track/${res.order.id}`);
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Buyurtma berishda xatolik yuz berdi.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🍽️ Bizning Menyu</h1>
            {tableNumber && <p className="text-sm text-gray-500">Stol: {tableNumber}</p>}
          </div>
          <button 
            onClick={() => setInfoModalOpen(true)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            ℹ️
          </button>
        </div>
      </header>

      {/* Menu Categories & Items */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {categories.length === 0 ? (
          <div className="text-center text-gray-500 py-12">Hozircha menyu bo'sh.</div>
        ) : (
          categories.map(category => (
            category.items && category.items.length > 0 && (
              <div key={category.id} className="mb-10">
                <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-orange-500 inline-block">
                  {category.name}
                </h2>
                <div className="space-y-4">
                  {category.items.map(item => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-4 transition-transform hover:scale-[1.01]">
                      {item.image_url ? (
                        <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                          <img 
                            src={getImageUrl(item.image_url)} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400">
                          📷
                        </div>
                      )}
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          {item.description && <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.description}</p>}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-bold text-orange-600">
                            {new Intl.NumberFormat('uz-UZ').format(item.price)} UZS
                          </span>
                          
                          {cart.find(i => i.id === item.id) ? (
                            <div className="flex items-center gap-3 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                              <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-orange-600 font-bold">-</button>
                              <span className="font-semibold text-gray-900">{cart.find(i => i.id === item.id).quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-orange-600 font-bold">+</button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => addToCart(item)}
                              className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              Qo'shish
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))
        )}
      </main>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 z-40 transform transition-transform">
          <div className="max-w-3xl mx-auto flex gap-4">
            <button 
              onClick={() => setCartModalOpen(true)}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3.5 px-4 rounded-xl font-medium shadow-lg flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{cart.reduce((s,i) => s + i.quantity, 0)} ta</span>
                <span>Savatcha</span>
              </div>
              <span className="font-bold">
                {new Intl.NumberFormat('uz-UZ').format(cartTotal)} UZS
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {cartModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col animate-slide-up">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Savatcha</h2>
              <button onClick={() => setCartModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">{new Intl.NumberFormat('uz-UZ').format(item.price)} UZS x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200 h-fit">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">-</button>
                      <span className="font-semibold text-gray-900 w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Jami hisob:</span>
                  <span className="text-xl font-bold text-gray-900">{new Intl.NumberFormat('uz-UZ').format(cartTotal)} UZS</span>
                </div>
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ismingiz *</label>
                  <input 
                    type="text" 
                    required
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    placeholder="Masalan: Sardor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon raqamingiz</label>
                  <input 
                    type="tel" 
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    placeholder="+998 90 123 45 67"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-600/30 transition-all disabled:opacity-70 mt-4"
                >
                  {submitting ? 'Yuborilmoqda...' : 'Buyurtmani Tasdiqlash'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal (Location) */}
      {infoModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-2xl overflow-hidden flex flex-col animate-scale-up">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Ma'lumot va Manzil</h2>
              <button onClick={() => setInfoModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-gray-600">✕</button>
            </div>
            <div className="p-4 flex-1">
              <p className="text-gray-600 mb-4">Bizning restoranimiz eng mazali va sifatli taomlarni taklif etadi. Siz qidirayotgan maza shu yerda!</p>
              
              <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d383504.92149774777!2d64.5267057!3d41.327738599999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1suz!2s!4v1782517429451!5m2!1suz!2s" 
                  width="100%" 
                  height="300" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              
              <div className="mt-4 flex flex-col gap-2">
                <a href="tel:+998900000000" className="bg-gray-100 p-3 rounded-lg text-center font-medium text-gray-800 hover:bg-gray-200 transition-colors">
                  📞 Qo'ng'iroq qilish
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}} />
    </div>
  );
}
